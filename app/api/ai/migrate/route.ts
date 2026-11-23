import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateEmbedding } from '@/lib/ai/services/embedding-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log(`[AI Migration] Iniciando generación de embeddings para usuario ${userId}...`)

    // 1. Obtener los productos de las tiendas del usuario autenticado
    const products = await prisma.product.findMany({
      where: { store: { userId } },
      include: { store: true }
    })
    console.log(`[AI Migration] Encontrados ${products.length} productos de las tiendas del usuario.`)

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

    // 2. Obtener las FAQs de las tiendas del usuario autenticado
    const faqs = await prisma.faq.findMany({
      where: { store: { userId } },
    })
    console.log(`[AI Migration] Encontradas ${faqs.length} FAQs de las tiendas del usuario.`)

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
