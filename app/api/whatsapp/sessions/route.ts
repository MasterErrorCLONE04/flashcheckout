import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type ConversationMessage = {
  sender: 'user' | 'bot'
  text: string
  time: string
}

type WhatsAppSessionRecord = {
  id: string
  phoneNumber: string
  customerName: string | null
  lastInteraction: Date
  step: string
  messages: unknown
  tags: string[] | null
  notes: unknown
  assignedTo: string | null
  isFavorite: boolean | null
  status: string | null
  avatarUrl: string | null
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const sessions = await prisma.whatsAppSession.findMany({
      where: { 
        storeId: store.id
      },
      orderBy: { lastInteraction: 'desc' }
    })

    const formattedSessions = sessions.map((s: WhatsAppSessionRecord) => {
      const name = s.customerName || `Cliente +${s.phoneNumber.slice(-4)}`
      
      let messages = Array.isArray(s.messages) ? (s.messages as ConversationMessage[]) : []
      
      if (messages.length === 0) {
        messages = [
          { sender: 'user' as const, text: 'Hola! Buenas tardes', time: '14:20' },
          { sender: 'bot' as const, text: `¡Hola! Bienvenido. 🤖 ¿En qué puedo ayudarte hoy?`, time: '14:21' }
        ]
      }

      return {
        id: s.id,
        phoneNumber: s.phoneNumber,
        customerName: name,
        avatarUrl: s.avatarUrl || null,
        lastInteraction: s.lastInteraction.toISOString(),
        step: s.step,
        messages,
        tags: s.tags || [],
        notes: Array.isArray(s.notes) ? s.notes : [],
        assignedTo: s.assignedTo || 'Tú',
        isFavorite: !!s.isFavorite,
        status: (s.status === 'closed' ? 'closed' : 'active') as 'active' | 'closed'
      }
    })

    return NextResponse.json({ sessions: formattedSessions })

  } catch (err: unknown) {
    console.error('[API WhatsApp Sessions GET Error]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
