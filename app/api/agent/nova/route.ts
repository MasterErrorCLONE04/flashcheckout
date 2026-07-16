import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

type NovaHistoryMessage = {
  role?: 'user' | 'assistant' | string
  content?: string
}

type NovaRequestBody = {
  message?: string
  sessionId?: string
  agent?: string
  history?: NovaHistoryMessage[]
}

type NovaChatSessionRecord = {
  id: string
  title: string
  storeId: string
  messages: unknown
}

type CustomAgent = {
  id: string
  systemPrompt: string
  tools?: string[]
}

type ToolResult = Record<string, unknown> | unknown

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

function mapHistory(history: NovaHistoryMessage[] | undefined): ChatMessage[] {
  const items = Array.isArray(history) ? history : []

  return items.map(item => ({
    role: item?.role === 'assistant' ? 'assistant' : 'user',
    content: typeof item?.content === 'string' ? item.content : '',
  }))
}

function cleanJsonResponse(content: string) {
  const cleaned = content
    .replace(/<think>[\s\S]*?(<\/think>|$)/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  const match = cleaned.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

async function getStoreForUser(userId: string) {
  return getActiveStore(userId)
}

function getCustomAgent(storeSettings: unknown, agentType: string): CustomAgent | null {
  if (!storeSettings || typeof storeSettings !== 'object' || Array.isArray(storeSettings)) {
    return null
  }

  const settings = storeSettings as { customAgents?: CustomAgent[] }
  const customAgents = Array.isArray(settings.customAgents) ? settings.customAgents : []
  return customAgents.find(agent => agent.id === agentType) || null
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getStoreForUser(userId)
    if (!store) return notFound('Store not found')

    const body = await parseJsonBody<NovaRequestBody>(req)
    const message = body?.message?.trim() || ''
    let agentType = body?.agent?.trim() || 'Nova'

    if (!message) return badRequest('Missing message')

    // Map lowercase client agent ids to API keys
    const agentMapping: Record<string, string> = {
      'nova': 'Nova',
      'stella': 'Growth',
      'atlas': 'Logistics',
      'orion': 'Nova'
    }

    if (agentMapping[agentType.toLowerCase()]) {
      agentType = agentMapping[agentType.toLowerCase()]
    }

    const dbSession =
      body?.sessionId && typeof body.sessionId === 'string'
        ? (await prisma.novaChatSession.findUnique({
            where: { id: body.sessionId },
          })) as NovaChatSessionRecord | null
        : null

    if (body?.sessionId && body.sessionId !== 'demo-session' && !dbSession) {
      return notFound('Session not found')
    }

    const historyRaw = dbSession?.messages || []
    const parsedHistory = Array.isArray(body?.history) ? body.history : []
    const dbHistory = Array.isArray(historyRaw) ? (historyRaw as NovaHistoryMessage[]) : []

    const apiMessages: ChatMessage[] = [
      ...mapHistory(parsedHistory).slice(-12),
      ...mapHistory(dbHistory).slice(-12),
      { role: 'user', content: message },
    ]

    let systemPrompt: string = AGENT_SYSTEM_PROMPTS.Nova
    let agentTools = NOVA_TOOLS_DEFINITIONS
    let overrideType: string | null = null
    let executedAction: { type: string; payload: ToolResult } = { type: 'NONE', payload: {} }

    if (!AGENT_SYSTEM_PROMPTS[agentType as keyof typeof AGENT_SYSTEM_PROMPTS]) {
      const customAgent = getCustomAgent(store.settings, agentType)
      if (!customAgent) return badRequest('Invalid agent type')

      systemPrompt = customAgent.systemPrompt
      const allowedTools = customAgent.tools || []
      agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => allowedTools.includes(tool.function.name))
    } else {
      if (agentType === 'SalesBot') {
        agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => ['search_products'].includes(tool.function.name))
      } else if (agentType === 'Logistics') {
        agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => ['list_orders', 'update_order_status'].includes(tool.function.name))
      } else if (agentType === 'Growth') {
        agentTools = NOVA_TOOLS_DEFINITIONS.filter(tool => ['create_coupon', 'search_products'].includes(tool.function.name))
      }
    }

    let aiResponse: unknown = null
    let loopCount = 0
    const maxLoops = 4

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

      if (!responseObject.tool_calls || responseObject.tool_calls.length === 0) break

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
              : ((call.function.arguments || {}) as Record<string, unknown>)
        } catch {
          console.warn(`[Nova Route] Failed to parse function args:`, call.function.arguments)
        }

        console.log(`[Nova Agent Tool Call] Tienda: ${store.name} | Ejecutando: ${functionName}`, functionArgs)
        const toolResult = await executeNovaTool(store.id, functionName, functionArgs)
        executedAction = { type: functionName, payload: toolResult as ToolResult }

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

    let jsonResponse: {
      text: string
      type: string
      action: { type: string; payload: Record<string, unknown> }
    }

    try {
      const maybeJson = cleanJsonResponse(finalContent)
      if (!maybeJson) throw new Error('Plain text response')

      const parsed = JSON.parse(maybeJson) as {
        text?: string
        type?: string
        action?: { type?: string; payload?: Record<string, unknown> }
      }

      jsonResponse = {
        text: parsed.text || 'He procesado tu solicitud correctamente.',
        type: parsed.type || overrideType || 'text',
        action: {
          type: parsed.action?.type || executedAction.type,
          payload: parsed.action?.payload || (executedAction.payload as Record<string, unknown>),
        },
      }
    } catch {
      jsonResponse = {
        text:
          finalContent
            .replace(/<think>[\s\S]*?(<\/think>|$)/gi, '')
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim() || 'He procesado tu solicitud correctamente.',
        type: overrideType || 'text',
        action: {
          type: executedAction.type,
          payload: executedAction.payload as Record<string, unknown>
        },
      }
    }

    const userMessageObj = {
      id: Math.random().toString(),
      sender: 'user' as const,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text' as const,
    }

    const botMessageObj = {
      id: Math.random().toString(),
      sender: 'bot' as const,
      text: jsonResponse.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: jsonResponse.type,
      action: jsonResponse.action,
    }

    if (body?.sessionId && dbSession) {
      const updatedHistory = [...dbHistory, userMessageObj, botMessageObj]
      const newTitle = dbSession.title === 'Nuevo Chat' ? (message.slice(0, 35) || 'Chat') : dbSession.title

      await prisma.novaChatSession.update({
        where: { id: dbSession.id },
        data: {
          messages: updatedHistory as Prisma.InputJsonValue,
          title: newTitle,
        },
      })

      return NextResponse.json({ ...jsonResponse, sessionId: dbSession.id })
    }

    const newSession = await prisma.novaChatSession.create({
      data: {
        title: message.slice(0, 35) || 'Nuevo Chat',
        storeId: store.id,
        messages: [userMessageObj, botMessageObj] as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({ ...jsonResponse, sessionId: newSession.id })
  } catch (error: unknown) {
    console.error('Nova Agent API Error:', error)
    return internalServerError(getErrorMessage(error))
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = await parseJsonBody<{ sessionId?: string }>(req)
    if (!body?.sessionId) return badRequest('Missing sessionId')

    const session = await prisma.novaChatSession.findUnique({
      where: { id: body.sessionId },
    })

    if (!session) return notFound('Session not found')

    const userStores = await prisma.store.findMany({
      where: { userId },
      select: { id: true },
    })
    const userStoreIds = userStores.map(store => store.id)

    if (!userStoreIds.includes(session.storeId)) {
      return unauthorized('Unauthorized session delete')
    }

    await prisma.novaChatSession.delete({
      where: { id: body.sessionId },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting chat session:', error)
    return internalServerError(getErrorMessage(error))
  }
}
