import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateOpenRouterCompletion, ChatMessage } from '@/lib/ai/openrouter'
import { executeNovaTool, NOVA_TOOLS_DEFINITIONS } from '@/lib/ai/nova-tools'
import { getActiveStore } from '@/lib/store-context'

export const dynamic = 'force-dynamic'

// System prompts for each agent based on their roles
const AGENT_SYSTEM_PROMPTS = {
  Nova: `Eres Nova, la Inteligencia Artificial copiloto del administrador en FlashCheckout.
Tu tarea es asistir en la administración de la tienda. Tienes acceso a herramientas para buscar y editar productos, listar y cambiar estados de pedidos, ver métricas y actualizar el diseño de la tienda.
Responde de manera ejecutiva, clara y profesional.`,

  SalesBot: `Eres SalesBot, el agente vendedor estrella de WhatsApp para FlashCheckout.
Tu personalidad es entusiasta, persuasiva, veloz y muy amable. Tu meta es vender productos y resolver dudas rápidas del cliente sobre el catálogo.
Responde simulando que hablas con un comprador o aconsejando al comerciante sobre cómo vender un artículo. Usa emojis y frases cortas.`,

  Logistics: `Eres LogisticAgent, el coordinador de operaciones y logística de FlashCheckout.
Tu trabajo es verificar la disponibilidad de productos en stock, listar y actualizar el estado de los despachos, y optimizar las asignaciones de repartidores.
Eres pragmático, preciso, lógico y directo. Te enfocas en la eficiencia de las entregas.`,

  Growth: `Eres GrowthAgent, el especialista en marketing digital y crecimiento de FlashCheckout.
Tu especialidad es la redacción publicitaria (copywriting), el diseño de campañas de fidelización y la creación de códigos de descuento atractivos.
Eres sumamente creativo, persuasivo, utilizas técnicas de copywriting de respuesta directa (AIDA) y te enfocas en mejorar la tasa de conversión.`
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await getActiveStore(userId)
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const body = await req.json()
    const { agentType, instruction } = body

    if (!agentType || !instruction) {
      return NextResponse.json({ error: 'Missing agentType or instruction' }, { status: 400 })
    }

    let systemPrompt = AGENT_SYSTEM_PROMPTS[agentType as keyof typeof AGENT_SYSTEM_PROMPTS]
    let agentTools = NOVA_TOOLS_DEFINITIONS

    if (!systemPrompt) {
      // Check if it's a custom agent stored in settings
      const settings = (store.settings as any) || {}
      const customAgents = settings.customAgents || []
      const foundAgent = customAgents.find((a: any) => a.id === agentType)

      if (!foundAgent) {
        return NextResponse.json({ error: 'Invalid agent type' }, { status: 400 })
      }

      systemPrompt = foundAgent.systemPrompt
      const allowedTools = foundAgent.tools || []
      agentTools = NOVA_TOOLS_DEFINITIONS.filter(t => allowedTools.includes(t.function.name))
    } else {
      // Filter tools for each agent to keep context clean and specialized
      if (agentType === 'SalesBot') {
        agentTools = NOVA_TOOLS_DEFINITIONS.filter(t => ['search_products'].includes(t.function.name))
      } else if (agentType === 'Logistics') {
        agentTools = NOVA_TOOLS_DEFINITIONS.filter(t => ['list_orders', 'update_order_status'].includes(t.function.name))
      } else if (agentType === 'Growth') {
        agentTools = NOVA_TOOLS_DEFINITIONS.filter(t => ['create_coupon', 'search_products'].includes(t.function.name))
      }
    }

    // Call LLM through OpenRouter
    const apiMessages: ChatMessage[] = [
      { role: 'user', content: instruction }
    ]

    let loopCount = 0
    const maxLoops = 3
    let executedAction: any = { type: 'NONE', payload: {} }
    let aiResponse: any = null

    while (loopCount < maxLoops) {
      loopCount++
      aiResponse = await generateOpenRouterCompletion(apiMessages, systemPrompt, agentTools)

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
          console.warn(`[The Office Route] Failed to parse args for ${functionName}:`, call.function.arguments)
        }

        console.log(`[The Office Agent Tool Call] ${agentType} | Tienda: ${store.name} | Ejecutando: ${functionName}`, functionArgs)

        const toolResult = await executeNovaTool(store.id, functionName, functionArgs)

        executedAction = {
          type: functionName,
          payload: toolResult
        }

        apiMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: call.id,
          name: functionName
        })
      }
    }

    const finalContent = typeof aiResponse === 'object' ? (aiResponse.content || '') : (aiResponse || '')
    let cleanResponse = finalContent.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim()

    // Try parsing as JSON first, just in case the model returns json
    try {
      if (cleanResponse.includes('{') && cleanResponse.includes('}')) {
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.text) {
            cleanResponse = parsed.text
          }
        }
      }
    } catch {
      // Keep original clean response
    }

    return NextResponse.json({
      text: cleanResponse || 'Orden ejecutada con éxito.',
      action: executedAction
    })

  } catch (error: any) {
    console.error('The Office Agent API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
