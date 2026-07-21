import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export interface EmbeddingConfig {
  provider: string
  model: string
  version: number
}

const DEFAULT_CONFIG: EmbeddingConfig = {
  provider: 'openrouter', // Puede ser 'openai', 'openrouter', 'cohere', etc.
  model: 'openai/text-embedding-3-small', // o 'text-embedding-3-small' para openai directo
  version: 3 // v3: Nombre + Descripción + Categoría + Tags/Etiquetas + Ciudad + Horario
}

/**
 * Genera el hash SHA-256 de un texto para usar como clave de caché
 */
export function generateSHA256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * Enriquece el contexto de un producto u otra entidad en una cadena estructurada para embedding
 */
export function buildProductContext(product: {
  name: string
  description?: string | null
  category?: string | null
}, store: {
  name: string
  bio?: string | null
  settings?: any
}): string {
  const metadata = store.settings || {}
  const city = metadata.city || 'General'
  const tags = metadata.tags || ''
  
  return `Nombre: ${product.name}.
Descripción: ${product.description || 'Sin descripción'}.
Categoría: ${product.category || 'General'}.
Tienda: ${store.name}.
Ciudad: ${city}.
Etiquetas: ${tags}.`.trim()
}

/**
 * Genera un embedding vectorial a través de la API seleccionada
 */
async function fetchEmbeddingFromAPI(text: string, config: EmbeddingConfig): Promise<number[]> {
  const isOpenAI = config.provider === 'openai'
  const apiKey = isOpenAI 
    ? (process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY)
    : (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
    
  const apiUrl = isOpenAI 
    ? 'https://api.openai.com/v1/embeddings'
    : (process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1') + '/embeddings'

  if (!apiKey) {
    throw new Error('API Key para generación de embeddings no configurada.')
  }

  // Ajustar nombre de modelo para OpenRouter si es necesario
  const modelName = isOpenAI ? 'text-embedding-3-small' : config.model

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: modelName
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error de API de Embeddings (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  if (!result.data || !result.data[0] || !result.data[0].embedding) {
    throw new Error('Formato de respuesta de embedding inválido.')
  }

  return result.data[0].embedding
}

/**
 * Obtiene el embedding de un contenido. Si ya existe en la caché (base de datos), lo retorna.
 * Si no, hace el llamado al proveedor, lo guarda en la base de datos y lo retorna.
 */
export async function getOrCreateEmbedding(
  entityType: 'PRODUCT' | 'STORE' | 'FAQ' | 'ORDER' | 'CUSTOMER',
  entityId: string,
  text: string,
  metadata: Record<string, any> = {},
  config: EmbeddingConfig = DEFAULT_CONFIG
): Promise<number[]> {
  const contentHash = generateSHA256(text)
  const embeddingId = `${entityType.toLowerCase()}_${entityId}`

  // 1. Intentar buscar en caché de base de datos
  let existing = null
  try {
    if (prisma.embedding) {
      existing = await prisma.embedding.findFirst({
        where: {
          entityType,
          entityId,
          contentHash,
          model: config.model,
          provider: config.provider,
          version: config.version
        }
      })
    }
  } catch (err) {
    console.warn('[Embedding Cache Error] Fallo al consultar caché de embeddings:', err)
  }

  if (existing) {
    // Retornamos el vector mapeando desde el tipo vector de PostgreSQL
    return existing.embedding as number[]
  }

  // 2. Si no existe, solicitar a la API
  const vector = await fetchEmbeddingFromAPI(text, config)

  // 3. Persistir en la base de datos (Upsert)
  // Nota: Como 'embedding' es un campo vector, usamos Prisma para guardarlo.
  // Prisma puede tener problemas con campos vectoriales crudos en inserts tradicionales si no se mapea,
  // por lo que realizamos un upsert nativo o directo para garantizar compatibilidad con PrismaPg.
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Embedding" ("id", "entityType", "entityId", "provider", "model", "embedding", "contentHash", "version", "metadata", "updatedAt")
    VALUES ($1, $2::embedding_entity_type, $3, $4, $5, $6::vector, $7, $8, $9::jsonb, CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO UPDATE SET
      "embedding" = EXCLUDED."embedding",
      "contentHash" = EXCLUDED."contentHash",
      "version" = EXCLUDED."version",
      "metadata" = EXCLUDED."metadata",
      "updatedAt" = CURRENT_TIMESTAMP
  `, 
    embeddingId, 
    entityType, 
    entityId, 
    config.provider, 
    config.model, 
    `[${vector.join(',')}]`, 
    contentHash, 
    config.version, 
    JSON.stringify(metadata)
  )

  return vector
}

/**
 * Encola la generación de embeddings de forma no bloqueante.
 *
 * COMPORTAMIENTO POR ENTORNO:
 * - Next.js 15+ (producción/Vercel): usa `after()` para ejecutar el trabajo DESPUÉS de que
 *   la response HTTP se envía. Esto garantiza la ejecución incluso en funciones serverless.
 * - Modo síncrono (EMBEDDING_SYNC_MODE=true): ejecuta de forma síncrona. Útil en CI o tests.
 * - Fallback: usa Promise microtask con advertencia clara de que no es garantizado.
 *
 * En producción a gran escala, migrar a BullMQ, Inngest o Cloud Tasks.
 */
export function enqueueEmbeddingGeneration(
  entityType: 'PRODUCT' | 'STORE' | 'FAQ' | 'ORDER' | 'CUSTOMER',
  entityId: string,
  text: string,
  metadata: Record<string, any> = {}
): void {
  const worker = async () => {
    try {
      await getOrCreateEmbedding(entityType, entityId, text, metadata)
      console.log(`[Embedding Worker] Embedding guardado para ${entityType} ID: ${entityId}`)
    } catch (error) {
      console.error(`[Embedding Worker] Fallo al generar embedding para ${entityType} ID: ${entityId}:`, error)
    }
  }

  // Modo síncrono forzado (desarrollo/CI)
  if (process.env.EMBEDDING_SYNC_MODE === 'true') {
    worker()
    return
  }

  // Intentar usar `after()` de Next.js 15+ (garantizado post-response en Vercel serverless)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { after } = require('next/server') as { after?: (fn: () => Promise<void>) => void }
    if (typeof after === 'function') {
      after(worker)
      return
    }
  } catch {
    // `next/server` no disponible o `after` no exportado (Next < 15 o entorno no-Next)
  }

  // Fallback: microtask (NO garantizado en serverless)
  console.warn(
    '[Embedding Worker] Usando fallback de microtask. ' +
    'En serverless puede NO ejecutarse si la función termina antes. ' +
    'Añade EMBEDDING_SYNC_MODE=true en .env o actualiza a Next.js 15+ para garantizar ejecución.'
  )
  Promise.resolve().then(worker)
}

