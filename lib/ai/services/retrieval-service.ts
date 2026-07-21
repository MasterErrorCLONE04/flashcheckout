import { prisma } from '@/lib/prisma'
import { getOrCreateEmbedding } from './embedding-service'
import type { CandidateItem } from './ranking-service'

export interface RetrievalOptions {
  storeId?: string
  city?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  availableOnly?: boolean
  minimumSimilarity?: number
}

export class RetrievalService {
  /**
   * Recupera candidatos híbridos (Vectorial + Filtros SQL) con fallback a búsqueda por palabra clave
   */
  public static async retrieve(
    query: string,
    entityType: 'PRODUCT' | 'STORE' | 'FAQ',
    options: RetrievalOptions = {},
    matchCount: number = 30
  ): Promise<CandidateItem[]> {
    const minSim = options.minimumSimilarity ?? 0.70

    try {
      // 1. Intentar Búsqueda Vectorial (pgvector)
      const queryVector = await getOrCreateEmbedding(entityType, `query_${Date.now()}`, query)
      
      // Construir metadatos de filtrado para match_embeddings
      const filterMetadata: Record<string, any> = {}
      if (options.storeId) filterMetadata.storeId = options.storeId
      if (options.city) filterMetadata.city = options.city
      if (options.category) filterMetadata.category = options.category
      if (options.availableOnly) filterMetadata.available = true

      // Llamar a la función Postgres match_embeddings
      const similarityResults: Array<{ entityId: string; similarity: number }> = await prisma.$queryRawUnsafe(
        `SELECT * FROM match_embeddings($1::vector, $2, $3::embedding_entity_type, $4::jsonb, $5)`,
        `[${queryVector.join(',')}]`,
        matchCount,
        entityType,
        JSON.stringify(filterMetadata),
        minSim
      )

      if (similarityResults.length > 0) {
        return await this.hydrateCandidates(similarityResults, entityType)
      }
      
      console.log(`[Retrieval] Búsqueda vectorial retornó 0 candidatos. Degradando a búsqueda por palabras clave.`);
      return await this.fallbackKeywordSearch(query, entityType, options, matchCount)

    } catch (error) {
      console.error(`[Retrieval Error] Error en búsqueda vectorial. Degradando a palabras clave:`, error)
      return await this.fallbackKeywordSearch(query, entityType, options, matchCount)
    }
  }

  /**
   * Hidrata las entidades desde la base de datos con sus respectivos scores de negocio
   */
  private static async hydrateCandidates(
    results: Array<{ entityId: string; similarity: number }>,
    entityType: 'PRODUCT' | 'STORE' | 'FAQ'
  ): Promise<CandidateItem[]> {
    const ids = results.map(r => r.entityId)

    if (entityType === 'PRODUCT') {
      const products = await prisma.product.findMany({
        where: { id: { in: ids }, active: true },
        include: { store: true }
      })

      // Fix #9: Calcular popularityScore real desde conteo de ventas (una sola query por batch)
      // Cuenta cuántas órdenes contienen cada producto usando búsqueda JSON en el campo items.
      // Se normaliza al máximo del conjunto para obtener un score 0-1 relativo.
      const orderCounts: Record<string, number> = {}
      try {
        const countResults = await prisma.$queryRawUnsafe<Array<{ name: string; cnt: bigint }>>(
          `SELECT elem->>'name' AS name, COUNT(*) AS cnt
           FROM "Order", jsonb_array_elements(items::jsonb) AS elem
           WHERE elem->>'name' IS NOT NULL
           GROUP BY elem->>'name'`
        )
        for (const row of countResults) {
          orderCounts[row.name.toLowerCase()] = Number(row.cnt)
        }
      } catch {
        // Si falla la consulta de popularidad, continúa con el default 0.5
      }

      const maxOrders = Math.max(1, ...Object.values(orderCounts))

      return results
        .map(res => {
          const product = products.find(p => p.id === res.entityId)
          if (!product) return null

          const stockScore = product.stock > 0 ? 1.0 : 0.0
          const rawOrderCount = orderCounts[product.name.toLowerCase()] ?? 0
          const popularityScore = parseFloat((rawOrderCount / maxOrders).toFixed(4))
          const promotionScore = 0.0

          return {
            id: product.id,
            entityId: product.id,
            similarity: res.similarity,
            stockScore,
            popularityScore,
            promotionScore,
            details: product
          }
        })
        .filter((item): item is CandidateItem => item !== null)
    }

    if (entityType === 'FAQ') {
      const faqs = await prisma.faq.findMany({
        where: { id: { in: ids } }
      })

      return results
        .map(res => {
          const faq = faqs.find(f => f.id === res.entityId)
          if (!faq) return null

          return {
            id: faq.id,
            entityId: faq.id,
            similarity: res.similarity,
            stockScore: 1.0,
            popularityScore: 1.0,
            promotionScore: 0.0,
            details: faq
          }
        })
        .filter((item): item is CandidateItem => item !== null)
    }

    // Default vacío si no coincide tipo de entidad
    return []
  }

  /**
   * Búsqueda de Degradación (Keyword Search) usando SQL ILIKE
   */
  private static async fallbackKeywordSearch(
    query: string,
    entityType: 'PRODUCT' | 'STORE' | 'FAQ',
    options: RetrievalOptions,
    matchCount: number
  ): Promise<CandidateItem[]> {
    if (entityType === 'PRODUCT') {
      let products = await prisma.product.findMany({
        where: {
          active: true,
          storeId: options.storeId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: { store: true },
        take: matchCount
      })

      // Failsafe fallback: si no hay coincidencias de palabras clave,
      // retornamos los productos principales de la tienda.
      if (products.length === 0 && options.storeId) {
        console.log(`[Retrieval Fallback] No keyword matches for "${query}". Returning store products.`);
        products = await prisma.product.findMany({
          where: {
            active: true,
            storeId: options.storeId
          },
          include: { store: true },
          take: 6,
          orderBy: [
            { stock: 'desc' },
            { name: 'asc' }
          ]
        })
      }

      return products.map(product => {
        return {
          id: product.id,
          entityId: product.id,
          similarity: 0.75, // Similitud fija para fallback
          stockScore: product.stock > 0 ? 1.0 : 0.0,
          popularityScore: 0.5,
          promotionScore: 0.0,
          details: product
        }
      })
    }

    if (entityType === 'FAQ') {
      const faqs = await prisma.faq.findMany({
        where: {
          storeId: options.storeId,
          OR: [
            { question: { contains: query, mode: 'insensitive' } },
            { answer: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: matchCount
      })

      return faqs.map(faq => {
        return {
          id: faq.id,
          entityId: faq.id,
          similarity: 0.75,
          stockScore: 1.0,
          popularityScore: 1.0,
          promotionScore: 0.0,
          details: faq
        }
      })
    }

    return []
  }
}
