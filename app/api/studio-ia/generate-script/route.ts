import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { generateOpenRouterCompletion, ChatMessage } from '@/lib/ai/openrouter'
import { 
  buildStudioSystemPrompt, 
  buildStudioUserPrompt, 
  CreativeMode, 
  CreativeTone 
} from '@/lib/ai/studio-prompts'
import { badRequest, notFound, unauthorized, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

function cleanJson(raw: string): any {
  try {
    const cleaned = raw
      .replace(/<think>[\s\S]*?(<\/think>|$)/gi, '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
  } catch (e) {
    console.warn('[Studio IA Script API] Error al parsear JSON devuelto por IA:', e)
  }
  return null
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Store not found')

    const body = await req.json()
    const { productId, mode = 'DYNAMIC_REEL', tone = 'urgency', couponId } = body

    if (!productId) {
      return badRequest('productId is required')
    }

    // 1. Obtener producto de la base de datos
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId: store.id }
    })

    if (!product) {
      return notFound('Product not found in this store')
    }

    // 2. Obtener cupón si fue seleccionado
    let coupon = null
    if (couponId) {
      coupon = await prisma.coupon.findFirst({
        where: { id: couponId, storeId: store.id, estado: 'Activo' }
      })
    }

    // 3. Construir prompts especializados
    const systemPrompt = buildStudioSystemPrompt(mode as CreativeMode, tone as CreativeTone)
    const userPrompt = buildStudioUserPrompt(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description || '',
        category: product.category || 'General',
        imageUrl: product.imageUrl
      },
      store.name,
      store.slug,
      coupon
    )

    const messages: ChatMessage[] = [
      { role: 'user', content: userPrompt }
    ]

    // 4. Invocar OpenRouter Gateway con guardrails y modelos de respaldo
    const aiResponse = await generateOpenRouterCompletion(
      messages,
      systemPrompt,
      undefined,
      process.env.OPENROUTER_STUDIO_MODEL || 'meta-llama/llama-3.3-70b-instruct'
    )

    const rawContent = typeof aiResponse === 'object' && 'content' in aiResponse 
      ? (aiResponse.content || '') 
      : (typeof aiResponse === 'string' ? aiResponse : '')

    const parsedJson = cleanJson(rawContent)

    const formattedPrice = `$${product.price.toLocaleString('es-CO')}`
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flashcheckout.co'
    const checkoutLink = `${appBaseUrl}/tienda/${store.slug}`

    // Si falló el parseo o la IA simuló texto plano, aplicamos un fallback premium
    const result = {
      hook: parsedJson?.hook || `¿Buscabas ${product.name}? ¡Mira esto antes de que se agote! 🔥`,
      script: parsedJson?.script || `Si estabas buscando ${product.name}, llegaste al lugar correcto. Calidad garantizada, envíos rápidos y el mejor precio del mercado: solo ${formattedPrice}. ¡Toca el botón aquí abajo y pide el tuyo con Flashcheckout antes de que se agoten las unidades!`,
      copyInstagram: parsedJson?.copyInstagram || `🔥 ¡Novedad en nuestra tienda! ${product.name} disponible ahora mismo a ${formattedPrice}.\n\n✨ Calidad insuperable\n🚚 Envíos seguros a todo el país\n🔒 Pago fácil y garantizado\n\n👉 Toca el enlace de nuestro perfil o comenta 'QUIERO' para enviarte el link directo.\n\n${checkoutLink}`,
      copyWhatsApp: parsedJson?.copyWhatsApp || `*¡Hola!* Mira lo que acaba de llegar a ${store.name}: ✨\n\n*${product.name}*\n💰 Precio especial: *${formattedPrice}*\n${coupon ? `🎟️ Cupón de descuento: *${coupon.code}* (${coupon.valor})\n` : ''}📦 Envío rápido y seguro.\n\n👉 *Pídelo aquí con un toque:* ${checkoutLink}`,
      copyAida: parsedJson?.copyAida || {
        attention: `¿Cansado de productos que prometen mucho y no cumplen? Conoce ${product.name}.`,
        interest: `Diseñado con los más altos estándares y materiales de primera calidad para durar.`,
        desire: `Disfruta de la mejor experiencia y la comodidad que mereces a un precio inigualable de ${formattedPrice}.`,
        action: `¡Compra hoy en 1 clic antes de que se agote el stock disponible!`
      },
      copyPas: parsedJson?.copyPas || {
        problem: `Encontrar ${product.name} con garantía real y precio justo suele ser un dolor de cabeza.`,
        agitation: `Comprar réplicas o pagar sobreprecio termina saliendo más caro y generando frustración.`,
        solution: `${store.name} te lo entrega directamente en tu puerta con total respaldo y garantía.`
      },
      couponRecommendation: parsedJson?.couponRecommendation || (product.price > 100000 ? 'Recomendación: Cupón de $15.000 COP o 10% OFF para compras superiores a $100.000' : 'Recomendación: Envío gratis en segunda unidad o 5% de descuento flash'),
      hashtags: parsedJson?.hashtags || ['#Flashcheckout', '#TiendaOnline', `#${product.category || 'Tendencia'}`, '#OfertasColombia', '#CompraSegura'],
      callToAction: parsedJson?.callToAction || 'Comprar ahora en 1 clic'
    }

    return NextResponse.json({
      success: true,
      data: result,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
      }
    })
  } catch (error: any) {
    console.error('[Studio IA Generate Script Error]:', error)
    return internalServerError(error.message || 'Error generating script')
  }
}
