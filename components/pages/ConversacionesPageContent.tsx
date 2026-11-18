import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import ChatHistoryViewer from '@/components/ChatHistoryViewer'
import StoreCreationWizard from '@/components/StoreCreationWizard'

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

export default async function ConversacionesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const sessions = await prisma.whatsAppSession.findMany({
    where: { 
      storeId: store.id
    },
    orderBy: { lastInteraction: 'desc' }
  })

  // Format and generate realistic mock conversation dialogues based on the session's active step
  const formattedSessions = sessions.map((s: WhatsAppSessionRecord) => {
    const name = s.customerName || `Cliente +${s.phoneNumber.slice(-4)}`
    
    // Format and read actual conversation dialogues, or generate realistic mocks if empty
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

  if (formattedSessions.length === 0) {
    formattedSessions.push({
      id: 'demo-session',
      phoneNumber: '573001234567',
      customerName: 'Carolina Gómez (Demo)',
      avatarUrl: null,
      lastInteraction: new Date().toISOString(),
      step: 'AWAITING_PAYMENT',
      messages: [
        { sender: 'user', text: '¡Hola! Vi los productos en el catálogo, ¿tienen envío a Medellín?', time: '10:30' },
        { sender: 'bot', text: '¡Hola Carolina! 👋 Sí, hacemos envíos a Medellín con entrega de 1 a 2 días hábiles. ¿Qué producto te gustaría pedir hoy?', time: '10:30' },
        { sender: 'user', text: 'Me interesa pedir 1 unidad para pagar por Bre-B o link de pago', time: '10:32' },
        { sender: 'bot', text: '¡Excelente elección! Ya armé tu carrito y dejé listo tu enlace de pago seguro. ¿Deseas confirmar la dirección de entrega?', time: '10:32' }
      ],
      tags: ['Cliente VIP', 'Medellín'],
      notes: [
        {
          id: 'demo-note-1',
          text: 'Cliente interesada en pago inmediato. Conversación de demostración para probar etiquetas, notas y respuestas rápidas.',
          createdAt: 'Hoy, 10:33',
          author: 'Sistema'
        }
      ],
      assignedTo: 'Agente IA',
      isFavorite: true,
      status: 'active'
    })
  }

  return (
    <ChatHistoryViewer 
      initialSessions={formattedSessions} 
      whatsappConnected={!!store.whatsappConnected}
    />
  )
}
