import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateOpenRouterCompletion, ChatMessage } from '@/lib/ai/openrouter'
import { executeNovaTool, NOVA_TOOLS_DEFINITIONS } from '@/lib/ai/nova-tools'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const activeStoreId = cookieStore.get('active_store_id')?.value

    let store = null
    if (activeStoreId) {
      store = await prisma.store.findFirst({
        where: { id: activeStoreId, userId }
      })
    }

    if (!store) {
      store = await prisma.store.findFirst({
        where: { userId }
      })
    }

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const body = await req.json()
    const { message, sessionId, agent } = body

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // 1. Obtener historial de la sesión
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

    // 2. Mapear historial al formato de ChatMessage
    const apiMessages: ChatMessage[] = []
    
    // Solo tomamos los últimos 12 mensajes del historial para no saturar contexto
    const recentDbHistory = dbHistory.slice(-12)
    for (const h of recentDbHistory) {
      if (h.sender === 'bot') {
        apiMessages.push({
          role: 'assistant',
          content: h.text || 'Entendido.'
        })
      } else {
        apiMessages.push({
          role: 'user',
          content: h.text
        })
      }
    }

    // Añadimos el nuevo mensaje del usuario
    apiMessages.push({ role: 'user', content: message })

    // 3. System Prompt para el Agente en modo Tool Calling
    let agentName = "Nova"
    let agentRole = "el copiloto inteligente de administración de la plataforma FlashCheckout"
    let agentDetails = ""

    if (agent === 'stella') {
      agentName = "Stella"
      agentRole = "la especialista inteligente en Marketing y Conversiones de FlashCheckout"
      agentDetails = "\nTu foco principal es ayudar al comerciante a diseñar estrategias de ventas, crear cupones de descuento, sugerir campañas promocionales y optimizar la retención de clientes. Responde con un tono alegre, entusiasta, persuasivo y comercial."
    } else if (agent === 'atlas') {
      agentName = "Atlas"
      agentRole = "el analista inteligente de Operaciones, Inventario y Logística de FlashCheckout"
      agentDetails = "\nTu foco principal es ayudar al comerciante a monitorear sus pedidos, analizar stock crítico, coordinar repartidores (drivers) y dar un reporte exacto de sus operaciones diarias. Responde con un tono formal, estructurado, analítico y eficiente."
    } else if (agent === 'orion') {
      agentName = "Orion"
      agentRole = "el ingeniero inteligente de Integraciones y Soporte Técnico de FlashCheckout"
      agentDetails = "\nTu foco principal es guiar al comerciante en la conexión de su WhatsApp, pasarelas de pago (Mercado Pago, Stripe), solución de dudas técnicas y flujos avanzados. Responde con un tono técnico, claro, preciso y de soporte."
    } else {
      agentDetails = "\nTu foco principal es ayudar al comerciante a gestionar su negocio y a personalizar/diseñar su tienda online desde el panel de control. Responde con un tono amigable, profesional y servicial."
    }

    const systemPrompt = `Eres ${agentName}, ${agentRole} para la tienda "${store.name}".${agentDetails}
Tienes acceso a herramientas (functions) para interactuar con la base de datos de la tienda y su constructor de páginas. Utilízalas de forma proactiva cuando el comerciante te pida buscar o actualizar productos, ver pedidos, cupones, métricas, cambiar configuraciones del bot, o consultar y cambiar el diseño de la tienda.

Si el comerciante te pide ayuda con el diseño o textos de la tienda, utiliza obligatoriamente la herramienta "get_business_profile" para entender su memoria de negocio, "get_current_builder_layout" para conocer la estructura actual de su tienda, y "update_builder_layout" si te pide realizar cambios directos en el banner, colores, secciones o envío gratis.

Información general de la tienda en tiempo real:
- Nombre: ${store.name}
- Slug: ${store.slug}
- Categoría comercial: ${store.category || 'Ventas'}
- WhatsApp conectado: ${store.whatsappConnected ? 'SÍ' : 'NO'} (${store.whatsapp || 'Sin asignar'})
- Mercado Pago conectado: ${store.mpConnected ? 'SÍ' : 'NO'}

REGLAS DE RESPUESTA:
- Cuando el comerciante te pida hacer algo que requiera una de tus herramientas, DEBES llamar a la herramienta. No inventes datos ni simules la acción; invoca la herramienta real.
- Una vez ejecutadas las herramientas necesarias (o si la consulta es una conversación de texto normal), DEBES responder obligatoriamente con un formato JSON estructurado que contenga los siguientes campos:
{
  "text": "Tu respuesta descriptiva y atenta al comerciante en español. Resume lo que hiciste o responde la duda.",
  "type": "text | products_list | product_updated | discount_card | order_status_updated | sales_metrics | customer_chat",
  "action": {
    "type": "NONE | search_products | update_product | list_orders | update_order_status | create_coupon | get_sales_metrics | get_customer_chat | toggle_whatsapp_bot | get_business_profile | get_current_builder_layout | update_builder_layout",
    "payload": { ...objeto con los datos resultantes devueltos por la herramienta o acción... }
  }
}

Tipos ("type") y su correspondencia:
- Si buscaste productos, usa "products_list" e introduce el resultado en "action.payload".
- Si actualizaste un producto, usa "product_updated" e introduce el resultado en "action.payload".
- Si listaste órdenes, usa "order_status_updated" y pon el listado en "action.payload".
- Si cambiaste el estado de un pedido, usa "order_status_updated" e introduce el resultado en "action.payload".
- Si creaste un cupón, usa "discount_card" e introduce el resultado del cupón en "action.payload".
- Si consultaste métricas de ventas, usa "sales_metrics" e introduce el resultado en "action.payload".
- Si consultaste el chat de un cliente, usa "customer_chat" e introduce la información y chatHistory en "action.payload".
- Si consultaste el perfil de negocio o el layout, usa "text" con la acción respectiva.
- Si actualizaste el diseño del constructor de páginas, usa "text" con la acción "update_builder_layout" e introduce el resultado en "action.payload".
- Si fue una conversación casual sin herramientas, usa "text" para el tipo y "action": {"type": "NONE", "payload": {}}.

IMPORTANTE: Si eres un modelo de razonamiento, mantén tu bloque de razonamiento (<think>) extremadamente corto. Luego responde únicamente con el objeto JSON válido. No uses bloques de código markdown ni texto adicional fuera del JSON.`

    // 4. Bucle del Agente (Tool Calling Loop)
    let aiResponse = null
    let loopCount = 0
    const maxLoops = 4
    let executedAction: any = { type: 'NONE', payload: {} }
    let overrideType: string | null = null

    while (loopCount < maxLoops) {
      loopCount++
      aiResponse = await generateOpenRouterCompletion(apiMessages, systemPrompt, NOVA_TOOLS_DEFINITIONS)

      if (!aiResponse || typeof aiResponse !== 'object' || !aiResponse.tool_calls || aiResponse.tool_calls.length === 0) {
        break
      }

      const toolCalls = aiResponse.tool_calls
      
      apiMessages.push({
        role: 'assistant',
        content: aiResponse.content || null,
        tool_calls: toolCalls
      })

      for (const call of toolCalls) {
        const functionName = call.function.name
        let functionArgs = {}
        try {
          functionArgs = typeof call.function.arguments === 'string' 
            ? JSON.parse(call.function.arguments) 
            : call.function.arguments
        } catch (e) {
          console.warn('[Nova Route] Failed to parse function args:', call.function.arguments)
        }

        console.log(`[Nova Agent Tool Call] Tienda: ${store.name} | Ejecutando: ${functionName}`, functionArgs)

        const toolResult = await executeNovaTool(store.id, functionName, functionArgs)

        executedAction = {
          type: functionName,
          payload: toolResult
        }
        
        if (functionName === 'create_product') overrideType = 'product_created_card'
        if (functionName === 'search_products') overrideType = 'products_list'
        if (functionName === 'update_product') overrideType = 'product_updated'
        if (functionName === 'update_order_status') overrideType = 'order_status_updated'
        if (functionName === 'create_coupon') overrideType = 'discount_card'
        if (functionName === 'get_sales_metrics') overrideType = 'sales_metrics'
        if (functionName === 'get_customer_chat') overrideType = 'customer_chat'
        if (functionName === 'get_business_profile') overrideType = 'text'
        if (functionName === 'get_current_builder_layout') overrideType = 'text'
        if (functionName === 'update_builder_layout') overrideType = 'text'

        apiMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: call.id,
          name: functionName
        })
      }
    }

    const finalContent = typeof aiResponse === 'object' ? (aiResponse.content || '') : (aiResponse || '')
    let jsonResponse: any = {}

    try {
      let cleanedText = finalContent.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim()
      
      const isJsonLike = cleanedText.includes('{') && cleanedText.includes('}')
      if (isJsonLike) {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanedText = jsonMatch[0]
        }
        
        cleanedText = cleanedText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim()

        jsonResponse = JSON.parse(cleanedText)
        
        if ((!jsonResponse.action || jsonResponse.action.type === 'NONE') && executedAction.type !== 'NONE') {
          jsonResponse.action = executedAction
        }
        if (overrideType && (!jsonResponse.type || jsonResponse.type === 'text')) {
          jsonResponse.type = overrideType
        }
      } else {
        throw new Error("Plain text response")
      }
    } catch (e: any) {
      if (e.message !== "Plain text response") {
        console.warn('[Nova Agent Route JSON Parse failed] Text was:', finalContent)
      }
      
      const cleanFallbackText = finalContent
        .replace(/<think>[\s\S]*?(<\/think>|$)/gi, '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      jsonResponse = {
        text: cleanFallbackText || 'He procesado tu solicitud correctamente.',
        type: overrideType || 'text',
        action: executedAction
      }
    }

    if (!jsonResponse.action) {
      jsonResponse.action = { type: 'NONE', payload: {} }
    }

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
      action: jsonResponse.action
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

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { sessionId } = body
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const session = await prisma.novaChatSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const userStores = await prisma.store.findMany({
      where: { userId },
      select: { id: true }
    })
    const userStoreIds = userStores.map(s => s.id)

    if (!userStoreIds.includes(session.storeId)) {
      return NextResponse.json({ error: 'Unauthorized session delete' }, { status: 401 })
    }

    await prisma.novaChatSession.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting chat session:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
