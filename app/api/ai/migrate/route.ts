import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateEmbedding } from '@/lib/ai/services/embedding-service'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    console.log('[AI Migration] Iniciando generación masiva de embeddings...')

    // 1. Obtener todos los productos activos
    const products = await prisma.product.findMany({
      include: { store: true }
    })
    console.log(`[AI Migration] Encontrados ${products.length} productos en la base de datos.`)

    let productsMigrated = 0
    let productsErrors = 0

    for (const product of products) {
      try {
        const text = `Producto: ${product.name}. Categoría: ${product.category}. Descripción: ${product.description || ''}. Precio: ${product.price}. Stock: ${product.stock}.`
        await getOrCreateEmbedding(
          'PRODUCT',
          product.id,
          text,
          { storeId: product.storeId, name: product.name }
        )
        productsMigrated++
      } catch (err) {
        console.error(`[AI Migration Error] Error en producto ID: ${product.id}`, err)
        productsErrors++
      }
    }

    // 2. Obtener todas las FAQs
    const faqs = await prisma.faq.findMany()
    console.log(`[AI Migration] Encontradas ${faqs.length} FAQs en la base de datos.`)

    let faqsMigrated = 0
    let faqsErrors = 0

    for (const faq of faqs) {
      try {
        const text = `Pregunta: ${faq.question}. Respuesta: ${faq.answer}.`
        await getOrCreateEmbedding(
          'FAQ',
          faq.id,
          text,
          { storeId: faq.storeId }
        )
        faqsMigrated++
      } catch (err) {
        console.error(`[AI Migration Error] Error en FAQ ID: ${faq.id}`, err)
        faqsErrors++
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        products: { total: products.length, migrated: productsMigrated, errors: productsErrors },
        faqs: { total: faqs.length, migrated: faqsMigrated, errors: faqsErrors }
      }
    })
  } catch (error: any) {
    console.error('[AI Migration Error] Error crítico de migración:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
