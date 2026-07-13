import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'

export const dynamic = 'force-dynamic'

const DESK_SLOTS = [
  { top: '55%', left: '26%' }, // Pven Desk
  { top: '55%', left: '74%' }, // Laura Desk
  { top: '80%', left: '16%' }, // David Desk
  { top: '80%', left: '38%' }  // Brian Desk
]

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const store = await getActiveStore(userId)
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const body = await req.json()
    const { name, role, model, description, systemPrompt, tools, avatarEmoji } = body

    if (!name || !role || !model || !systemPrompt) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const settings = (store.settings as any) || {}
    const customAgents = settings.customAgents || []

    if (customAgents.length >= 4) {
      return NextResponse.json({ error: 'Has alcanzado el límite máximo de 4 agentes personalizados (no hay escritorios libres).' }, { status: 400 })
    }

    // Assign next free desk position slot
    const nextSlot = DESK_SLOTS[customAgents.length]

    let spriteUrl = '/images/sprite_nova.png'
    let color = 'emerald'

    if (avatarEmoji === '🧙' || avatarEmoji === '👩‍🎨') {
      spriteUrl = '/images/sprite_growth.png'
      color = 'amber'
    } else if (avatarEmoji === '🧑‍💻' || avatarEmoji === '👽') {
      spriteUrl = '/images/sprite_logistics.png'
      color = 'blue'
    } else if (avatarEmoji === '🦁') {
      spriteUrl = '/images/sprite_sales.png'
      color = 'teal'
    }

    const newAgent = {
      id: `Custom_${Date.now()}`,
      name,
      role,
      model,
      description: description || 'Agente de oficina personalizado',
      systemPrompt,
      tools: tools || [],
      avatarEmoji: avatarEmoji || '🕵️',
      spriteUrl,
      color,
      deskPosition: nextSlot,
      tokensUsed: 0,
      accuracy: '95.0%',
      latency: '1.2s'
    }

    const updatedCustomAgents = [...customAgents, newAgent]
    const updatedSettings = { ...settings, customAgents: updatedCustomAgents }

    await prisma.store.update({
      where: { id: store.id },
      data: { settings: updatedSettings }
    })

    return NextResponse.json({ customAgents: updatedCustomAgents })

  } catch (error: any) {
    console.error('[Custom Agent API Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const store = await getActiveStore(userId)
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('id')

    if (!agentId) return NextResponse.json({ error: 'Missing agent ID' }, { status: 400 })

    const settings = (store.settings as any) || {}
    const customAgents = settings.customAgents || []

    const updatedCustomAgents = customAgents.filter((a: any) => a.id !== agentId)
    // Re-assign desk slots to keep them aligned cleanly if agents are deleted
    const alignedCustomAgents = updatedCustomAgents.map((agent: any, index: number) => ({
      ...agent,
      deskPosition: DESK_SLOTS[index]
    }))

    const updatedSettings = { ...settings, customAgents: alignedCustomAgents }

    await prisma.store.update({
      where: { id: store.id },
      data: { settings: updatedSettings }
    })

    return NextResponse.json({ customAgents: alignedCustomAgents })

  } catch (error: any) {
    console.error('[Custom Agent Delete API Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
