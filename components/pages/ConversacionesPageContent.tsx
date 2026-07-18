import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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

  const store = await prisma.store.findFirst({
    where: { userId },
  })

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

    const avatarUrl = s.avatarUrl

    // Try to fetch profile picture in background if connected to Evolution and not stored yet
    if (!avatarUrl && store.whatsappConnected && store.whatsappInstanceName) {
      import('@/lib/whatsapp/evolution').then(async ({ evolutionClient }) => {
        try {
          const fetchedUrl = await evolutionClient.fetchProfilePictureUrl(store.whatsappInstanceName!, s.phoneNumber)
          if (fetchedUrl) {
            await prisma.whatsAppSession.update({
              where: { id: s.id },
              data: { avatarUrl: fetchedUrl }
            })
          }
        } catch (err) {
          console.error('Error fetching profile picture in background:', err)
        }
      }).catch(err => console.error(err))
    }

    return {
      id: s.id,
      phoneNumber: s.phoneNumber,
      customerName: name,
      avatarUrl: avatarUrl || null,
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

  return (
    <ChatHistoryViewer 
      initialSessions={formattedSessions} 
      whatsappConnected={!!store.whatsappConnected}
    />
  )
}
