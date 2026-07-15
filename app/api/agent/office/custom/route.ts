import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import {
  badRequest,
  getErrorMessage,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

const DESK_SLOTS = [
  { top: '55%', left: '26%' },
  { top: '55%', left: '74%' },
  { top: '80%', left: '16%' },
  { top: '80%', left: '38%' },
]

type CustomAgent = {
  id: string
  name: string
  role: string
  model: string
  description: string
  systemPrompt: string
  tools: string[]
  avatarEmoji: string
  spriteUrl: string
  color: string
  deskPosition: { top: string; left: string }
  tokensUsed: number
  accuracy: string
  latency: string
}

type StoreSettings = {
  customAgents?: CustomAgent[]
}

type CustomAgentBody = {
  name?: string
  role?: string
  model?: string
  description?: string
  systemPrompt?: string
  tools?: string[]
  avatarEmoji?: string
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Store not found')

    const body = (await req.json().catch(() => null)) as CustomAgentBody | null
    if (!body?.name || !body.role || !body.model || !body.systemPrompt) {
      return badRequest('Faltan campos obligatorios')
    }

    const settings = (store.settings as StoreSettings | null) || {}
    const customAgents = settings.customAgents || []

    if (customAgents.length >= 4) {
      return badRequest('Has alcanzado el limite maximo de 4 agentes personalizados (no hay escritorios libres).')
    }

    const nextSlot = DESK_SLOTS[customAgents.length]

    let spriteUrl = '/images/sprite_nova.png'
    let color = 'emerald'

    if (body.avatarEmoji === '🧙' || body.avatarEmoji === '👩‍🎨') {
      spriteUrl = '/images/sprite_growth.png'
      color = 'amber'
    } else if (body.avatarEmoji === '🧑‍💻' || body.avatarEmoji === '👽') {
      spriteUrl = '/images/sprite_logistics.png'
      color = 'blue'
    } else if (body.avatarEmoji === '🦁') {
      spriteUrl = '/images/sprite_sales.png'
      color = 'teal'
    }

    const newAgent: CustomAgent = {
      id: `Custom_${Date.now()}`,
      name: body.name,
      role: body.role,
      model: body.model,
      description: body.description || 'Agente de oficina personalizado',
      systemPrompt: body.systemPrompt,
      tools: body.tools || [],
      avatarEmoji: body.avatarEmoji || '🕵️',
      spriteUrl,
      color,
      deskPosition: nextSlot,
      tokensUsed: 0,
      accuracy: '95.0%',
      latency: '1.2s',
    }

    const updatedCustomAgents = [...customAgents, newAgent]
    const updatedSettings = { ...settings, customAgents: updatedCustomAgents }

    await prisma.store.update({
      where: { id: store.id },
      data: { settings: updatedSettings },
    })

    return NextResponse.json({ customAgents: updatedCustomAgents })
  } catch (error: unknown) {
    console.error('[Custom Agent API Error]:', error)
    return internalServerError(getErrorMessage(error))
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Store not found')

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('id')
    if (!agentId) return badRequest('Missing agent ID')

    const settings = (store.settings as StoreSettings | null) || {}
    const customAgents = settings.customAgents || []

    const updatedCustomAgents = customAgents.filter(agent => agent.id !== agentId)
    const alignedCustomAgents = updatedCustomAgents.map((agent, index) => ({
      ...agent,
      deskPosition: DESK_SLOTS[index] ?? agent.deskPosition,
    }))

    const updatedSettings = { ...settings, customAgents: alignedCustomAgents }

    await prisma.store.update({
      where: { id: store.id },
      data: { settings: updatedSettings },
    })

    return NextResponse.json({ customAgents: alignedCustomAgents })
  } catch (error: unknown) {
    console.error('[Custom Agent Delete API Error]:', error)
    return internalServerError(getErrorMessage(error))
  }
}
