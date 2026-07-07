import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateGroqCompletion } from '@/lib/ai/groq'

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
    const { message, history, sessionId } = body

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
    const systemPrompt = `Eres Nova, el copiloto inteligente y guía de la plataforma FlashCheckout para la tienda "${store.name}".
Tu propósito principal es guiar y asistir al usuario (comerciante) dentro de la plataforma, ayudándole a navegar por el panel de control, configurar su tienda, gestionar productos, configurar pasarelas de pago, crear cupones de descuento, activar automatizaciones y resolver dudas operativas sobre el uso de la plataforma. Recuerda que tú no vendes directamente a los compradores finales (de eso se encarga el chatbot de WhatsApp y el link de checkout), sino que eres la guía y soporte del comerciante dentro del panel.

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
  },
  "action": {
    "type": "CREATE_PRODUCT | CREATE_COUPON | NONE",
    "payload": {
      "name": "Nombre del producto",
      "price": 12000,
      "stock": 10,
      "description": "Breve descripción",
      "code": "CÓDIGO_CUPÓN",
      "desc": "Descripción",
      "valor": "15%",
      "tipo": "Código",
      "tipoDesc": "Porcentaje",
      "validoHasta": "fecha o texto"
    }
  }
}

Reglas para definir "type" y "action":
- Si el usuario te pregunta por los productos más vendidos, stock o catálogo general, usa "products_list" y llena la propiedad "products".
- Si el usuario te pide crear un descuento, cupón o promoción, usa "discount_card", llena la propiedad "coupon" y define la acción CREATE_COUPON en "action" con los datos correspondientes.
- Si el usuario te pide explícitamente crear un producto, usa "products_list", llena la propiedad "products" con el producto que se creará y define la acción CREATE_PRODUCT en "action" con los datos correspondientes.
- Si no hay ninguna base de datos o cambio que realizar (conversación normal), usa "text" para "type" y pon "action": null o {"type": "NONE", "payload": {}}.

IMPORTANTE: Si eres un modelo de razonamiento, mantén tu bloque de razonamiento (<think>) extremadamente corto (máximo 2 o 3 líneas). Luego del razonamiento, debes responder únicamente con el objeto JSON válido. No uses bloques de código markdown como \`\`\`json ni texto explicativo adicional fuera del JSON. Devuelve ÚNICAMENTE el objeto JSON válido.`

    // 4. Fetch session history or use new
    let dbSession = null
    let dbHistory: any[] = []
    if (sessionId) {
      dbSession = await prisma.novaChatSession.findUnique({
        where: { id: sessionId }
      })
      if (dbSession && dbSession.storeId === store.id) {
        dbHistory = Array.isArray(dbSession.messages) ? (dbSession.messages as any[]) : []
      }
    }

    const apiMessages = dbHistory.slice(-10).map((h: any) => ({
      role: h.sender === 'bot' ? 'assistant' : 'user',
      content: h.text
    }))
    apiMessages.push({ role: 'user', content: message })

    // 5. Invoke Groq
    const aiReplyText = await generateGroqCompletion(apiMessages, systemPrompt)

    // 6. Parse reply safely
    let jsonResponse: any
    try {
      let cleanedText = aiReplyText.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim()
      
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedText = jsonMatch[0]
      }
      
      cleanedText = cleanedText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      jsonResponse = JSON.parse(cleanedText)

      // -- EJECUTAR ACCIONES EN LA BASE DE DATOS --
      if (jsonResponse.action && jsonResponse.action.type && jsonResponse.action.type !== 'NONE') {
        const { type, payload } = jsonResponse.action
        
        if (type === 'CREATE_PRODUCT' && payload) {
          const newProd = await prisma.product.create({
            data: {
              name: payload.name || 'Nuevo Producto',
              price: Number(payload.price || 0),
              stock: Number(payload.stock || 0),
              description: payload.description || '',
              storeId: store.id,
              active: true
            }
          })
          
          jsonResponse.products = [
            {
              name: newProd.name,
              sales: `Stock: ${newProd.stock}`,
              price: `$${newProd.price.toLocaleString('es-CO')}`
            }
          ]
          jsonResponse.type = 'products_list'
        }
        
        else if (type === 'CREATE_COUPON' && payload) {
          const newCoupon = await prisma.coupon.create({
            data: {
              code: String(payload.code || 'PROMO').toUpperCase().trim(),
              desc: payload.desc || 'Descuento creado por Nova',
              tipo: payload.tipo || 'Código',
              tipoDesc: payload.tipoDesc || 'Porcentaje',
              valor: String(payload.valor || '10%'),
              validoHasta: payload.validoHasta || 'Sin fecha límite',
              estado: 'Activo',
              storeId: store.id
            }
          })
          
          jsonResponse.coupon = {
            code: newCoupon.code,
            desc: newCoupon.desc,
            validity: newCoupon.validoHasta,
            active: true
          }
          jsonResponse.type = 'discount_card'
        }
      }
    } catch (e) {
      console.warn('[Nova Agent Route JSON Parse failed] Text was:', aiReplyText)
      
      // Intentar limpiar el texto para el fallback quitando el bloque <think> de forma robusta
      const cleanFallbackText = aiReplyText
        .replace(/<think>[\s\S]*?(<\/think>|$)/gi, '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      // Si parece un JSON pero falló el parseo (por ejemplo, si está truncado),
      // intentar extraer solo el contenido del campo "text"
      let textContent = cleanFallbackText
      if (cleanFallbackText.includes('"text"')) {
        const textMatch = cleanFallbackText.match(/"text"\s*:\s*"([\s\S]*?)"/)
        if (textMatch) {
          textContent = textMatch[1]
        } else {
          const partialMatch = cleanFallbackText.match(/"text"\s*:\s*"([\s\S]*)/)
          if (partialMatch) {
            // Limpiar comillas, comas o llaves de cierre rotas al final si quedó truncado
            textContent = partialMatch[1]
              .replace(/",?\s*$/, '')
              .replace(/}\s*$/, '')
              .trim()
          }
        }
      }

      jsonResponse = {
        text: textContent || 'Disculpa, ocurrió un problema al procesar la respuesta de la IA. ¿Me lo puedes repetir?',
        type: 'text'
      }
    }
    
    // 7. Guardar historial de conversación en la base de datos
    const userMessageObj = {
      id: Math.random().toString(),
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    }
    
    const botMessageObj = {
      id: Math.random().toString(),
      sender: 'bot',
      text: jsonResponse.text || 'Entendido.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: jsonResponse.type || 'text',
      products: jsonResponse.products,
      coupon: jsonResponse.coupon
    }

    if (dbSession) {
      const updatedHistory = [...dbHistory, userMessageObj, botMessageObj]
      const newTitle = dbSession.title === 'Nuevo Chat' ? (message.slice(0, 35) || 'Chat') : dbSession.title
      
      await prisma.novaChatSession.update({
        where: { id: dbSession.id },
        data: {
          messages: updatedHistory,
          title: newTitle
        }
      })
      
      return NextResponse.json({ ...jsonResponse, sessionId: dbSession.id })
    } else {
      const newTitle = message.slice(0, 35) || 'Nuevo Chat'
      const newSession = await prisma.novaChatSession.create({
        data: {
          title: newTitle,
          storeId: store.id,
          messages: [userMessageObj, botMessageObj]
        }
      })
      
      return NextResponse.json({ ...jsonResponse, sessionId: newSession.id })
    }

  } catch (error: any) {
    console.error('Nova Agent API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
