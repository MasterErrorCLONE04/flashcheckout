import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateDeepSeekCompletion } from '@/lib/ai/deepseek'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const body = await req.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // 1. Fetch store info
    const storeProducts = await prisma.product.findMany({
      where: { storeId: store.id },
      take: 20
    })

    const storeOrders = await prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 2. Prepare Context Description
    const productsContext = storeProducts.length > 0
      ? storeProducts.map(p => `- ${p.name}: Price: $${p.price.toLocaleString('es-CO')} (${p.active ? 'Activo' : 'Inactivo'})`).join('\n')
      : 'No hay productos creados.'

    const ordersContext = storeOrders.length > 0
      ? storeOrders.map(o => `- Orden #${o.id.slice(-6)} - Total: $${o.total.toLocaleString('es-CO')} - Estado: ${o.status || o.paymentStatus || 'Pendiente'}`).join('\n')
      : 'No hay pedidos recientes.'

    // 3. Build System Prompt for DeepSeek
    const systemPrompt = `Eres Nova, la Inteligencia Artificial y asistente de ventas del panel de control de FlashCheckout para la tienda "${store.name}".
Tu propósito es ayudar al administrador (comerciante) a optimizar su negocio, gestionar sus productos, analizar ventas y automatizar su WhatsApp.

Información actual de la tienda en tiempo real:
- Nombre: ${store.name}
- Slug: ${store.slug}
- Categoría: ${store.category || 'Ventas'}
- WhatsApp: ${store.whatsappConnected ? 'Conectado' : 'Desconectado'} (${store.whatsapp || 'Sin asignar'})
- Mercado Pago: ${store.mpConnected ? 'Conectado' : 'Desconectado'}

Productos en catálogo:
${productsContext}

Pedidos recientes:
${ordersContext}

DEBES responder con un formato JSON estructurado que contenga los siguientes campos obligatorios:
{
  "text": "Tu respuesta descriptiva en texto para el comerciante en español (usa un tono profesional, entusiasta, experto en e-commerce y servicial). Puedes sugerir acciones.",
  "type": "text | products_list | discount_card",
  "products": [
    { "name": "Nombre del producto", "sales": "Descripción de ventas (Ej: 12 unidades vendidas esta semana o stock)", "price": "$Precio formateado" }
  ],
  "coupon": {
    "code": "CÓDIGO_CUPÓN",
    "desc": "Descripción del descuento",
    "validity": "Válido hasta: fecha",
    "active": true
  }
}

Reglas para definir "type":
- Si el usuario te pregunta por los productos más vendidos, stock o catálogo general, usa "products_list" y llena la propiedad "products".
- Si el usuario te pide crear un descuento, cupón o promoción, simula la creación del cupón, usa "discount_card" y llena la propiedad "coupon".
- Para el resto de consultas conversacionales generales, usa "text" (y deja "products" y "coupon" vacíos o nulos).

IMPORTANTE: Devuelve ÚNICAMENTE el objeto JSON válido. No uses bloques de código markdown como \`\`\`json ni texto explicativo adicional fuera del JSON.`

    // 4. Map client history to ChatMessage[] structure
    const apiMessages = (history || []).map((h: any) => ({
      role: h.sender === 'bot' ? 'assistant' : 'user',
      content: h.text
    }))
    apiMessages.push({ role: 'user', content: message })

    // 5. Invoke DeepSeek
    const aiReplyText = await generateDeepSeekCompletion(apiMessages, systemPrompt)

    // 6. Parse reply safely
    let jsonResponse: any
    try {
      // Intentar limpiar posibles decoraciones de markdown que el modelo haya devuelto a pesar de la instrucción
      const cleanedText = aiReplyText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()
      jsonResponse = JSON.parse(cleanedText)
    } catch (e) {
      console.warn('[Nova Agent Route JSON Parse failed] Text was:', aiReplyText)
      jsonResponse = {
        text: aiReplyText || 'Disculpa, ocurrió un problema al procesar la respuesta de la IA. ¿Me lo puedes repetir?',
        type: 'text'
      }
    }

    return NextResponse.json(jsonResponse)

  } catch (error: any) {
    console.error('Nova Agent API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
