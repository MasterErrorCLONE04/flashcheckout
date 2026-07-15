import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { generateOpenRouterCompletion, ChatMessage } from '@/lib/ai/openrouter'
import { executeNovaTool, NOVA_TOOLS_DEFINITIONS } from '@/lib/ai/nova-tools'
import { getActiveStore } from '@/lib/store-context'
import {
  badRequest,
  getErrorMessage,
  internalServerError,
  notFound,
  parseJsonBody,
  unauthorized,
} from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

const AGENT_SYSTEM_PROMPTS = {
  Nova: `Eres Nova, la Inteligencia Artificial copiloto del administrador en FlashCheckout.
Tu tarea es asistir en la administracion de la tienda. Tienes acceso a herramientas para buscar y editar productos, listar y cambiar estados de pedidos, ver metricas y actualizar el diseno de la tienda.
Responde de manera ejecutiva, clara y profesional.`,
  SalesBot: `Eres SalesBot, el agente vendedor estrella de WhatsApp para FlashCheckout.
Tu personalidad es entusiasta, persuasiva, veloz y muy amable. Tu meta es vender productos y resolver dudas rapidas del cliente sobre el catalogo.
Responde simulando que hablas con un comprador o aconsejando al comerciante sobre como vender un articulo. Usa emojis y frases cortas.`,
  Logistics: `Eres LogisticAgent, el coordinador de operaciones y logistica de FlashCheckout.
Tu trabajo es verificar la disponibilidad de productos en stock, listar y actualizar el estado de los despachos, y optimizar las asignaciones de repartidores.
Eres pragmatico, preciso, logico y directo. Te enfocas en la eficiencia de las entregas.`,
  Growth: `Eres GrowthAgent, el especialista en marketing digital y crecimiento de FlashCheckout.
Tu especialidad es la redaccion publicitaria (copywriting), el diseno de campanas de fidelizacion y la creacion de codigos de descuento atractivos.
Eres sumamente creativo, persuasivo, utilizas tecnicas de copywriting de respuesta directa (AIDA) y te enfocas en mejorar la tasa de conversion.`,
} as const

type CustomAgent = {
  id: string
  systemPrompt: string
  tools?: string[]
}

type OfficeRequest = {
  agentType?: string
  instruction?: string
  history?: unknown[]
}

type OfficeResponse = {
  text: string
  action: {
    type: string
    payload: Record<string, unknown>
  }
}

function mapHistory(history: unknown[] | undefined): ChatMessage[] {
  const items = Array.isArray(history) ? history : []

  return items.map(item => {
    if (!item || typeof item !== 'object') {
      return { role: 'user', content: '' }
    }

    const record = item as { role?: unknown; content?: unknown }
    return {
      role: record.role === 'assistant' ? 'assistant' : 'user',
      content: typeof record.content === 'string' ? record.content : '',
    }
  })
}

function cleanAgentResponse(content: string) {
  const stripped = content
    .replace(/<think>[\s\S]*?(<\/think>|$)/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  if (!stripped.includes('{') || !stripped.includes('}')) {
    return null
  }

  const match = stripped.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Store not found')

    const body = await parseJsonBody<OfficeRequest>(req)
    const agentType = body?.agentType?.trim() || ''
    const instruction = body?.instruction?.trim() || ''

    if (!agentType || !instruction) {
      return badRequest('Missing agentType or instruction')
    }

    let systemPrompt = AGENT_SYSTEM_PROMPTS[agentType as keyof typeof AGENT_SYSTEM_PROMPTS]
    let agentTools = NOVA_TOOLS_DEFINITIONS

    if (!systemPrompt) {
      const settings = (store.settings as { customAgents?: CustomAgent[] } | null) || {}
      const customAgents = Array.isArray(settings.customAgents) ? settings.customAgents : []
      const foundAgent = customAgents.find(agent => agent.id === agentType)

      if (!foundAgent) {
        return badRequest('Invalid agent type')
      }

      systemPrompt = foundAgent.systemPrompt
      const allowedTools = foundAgent.tools || []
      agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => allowedTools.includes(tool.function.name))
    } else if (agentType === 'SalesBot') {
      agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => ['search_products'].includes(tool.function.name))
    } else if (agentType === 'Logistics') {
      agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => ['list_orders', 'update_order_status'].includes(tool.function.name))
    } else if (agentType === 'Growth') {
      agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => ['create_coupon', 'search_products'].includes(tool.function.name))
    }

    const apiMessages: ChatMessage[] = [
      ...mapHistory(body?.history).slice(-12),
      { role: 'user', content: instruction },
    ]

    let loopCount = 0
    const maxLoops = 3
    let executedAction: OfficeResponse['action'] = { type: 'NONE', payload: {} }
    let aiResponse: unknown = null

    while (loopCount < maxLoops) {
      loopCount++
      aiResponse = await generateOpenRouterCompletion(apiMessages, systemPrompt, agentTools)

      if (!aiResponse || typeof aiResponse !== 'object') break
      const responseObject = aiResponse as {
        tool_calls?: Array<{
          id: string
          function: { name: string; arguments?: string | Record<string, unknown> }
        }>
        content?: string | null
      }

      if (!responseObject.tool_calls || responseObject.tool_calls.length === 0) {
        break
      }

      apiMessages.push({
        role: 'assistant',
        content: responseObject.content || null,
        tool_calls: responseObject.tool_calls,
      })

      for (const call of responseObject.tool_calls) {
        const functionName = call.function.name
        let functionArgs: Record<string, unknown> = {}

        try {
          functionArgs =
            typeof call.function.arguments === 'string'
              ? (JSON.parse(call.function.arguments) as Record<string, unknown>)
              : (call.function.arguments || {}) as Record<string, unknown>
        } catch (error) {
          console.warn(`[The Office Route] Failed to parse args for ${functionName}:`, call.function.arguments)
        }

        console.log(`[The Office Agent Tool Call] ${agentType} | Tienda: ${store.name} | Ejecutando: ${functionName}`, functionArgs)
        const toolResult = await executeNovaTool(store.id, functionName, functionArgs)
        executedAction = { type: functionName, payload: toolResult as Record<string, unknown> }

        apiMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: call.id,
          name: functionName,
        })
      }
    }

    const finalContent =
      typeof aiResponse === 'object' && aiResponse !== null
        ? ((aiResponse as { content?: string | null }).content || '')
        : typeof aiResponse === 'string'
          ? aiResponse
          : ''

    let cleanResponse = finalContent.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim()
    try {
      const jsonText = cleanAgentResponse(cleanResponse)
      if (jsonText) {
        const parsed = JSON.parse(jsonText) as Partial<OfficeResponse> & { text?: string }
        if (parsed.text) {
          cleanResponse = parsed.text
        }
      }
    } catch {
      // Keep original response when the model does not emit valid JSON.
    }

    return NextResponse.json({
      text: cleanResponse || 'Orden ejecutada con exito.',
      action: executedAction,
    })
  } catch (error: unknown) {
    console.error('The Office Agent API Error:', error)
    return internalServerError(getErrorMessage(error))
  }
}
