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

  const sessions = store.whatsappConnected
    ? await prisma.whatsAppSession.findMany({
        where: {
          storeId: store.id,
        },
        orderBy: { lastInteraction: 'desc' },
      })
    : []

  const formattedSessions = sessions.map((s: WhatsAppSessionRecord) => {
    const name = s.customerName || `Cliente +${s.phoneNumber.slice(-4)}`
    const messages = Array.isArray(s.messages) ? (s.messages as ConversationMessage[]) : []

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
      status: (s.status === 'closed' ? 'closed' : 'active') as 'active' | 'closed',
    }
  })

  return (
    <ChatHistoryViewer
      initialSessions={formattedSessions}
      whatsappConnected={!!store.whatsappConnected}
    />
  )
}
