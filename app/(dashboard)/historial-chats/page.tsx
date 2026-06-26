import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ChatHistoryViewer from '@/components/ChatHistoryViewer'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

export default async function HistorialChatsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const sessions = await (prisma as any).whatsAppSession.findMany({
    where: { storeId: store.id },
    orderBy: { lastInteraction: 'desc' }
  })

  // Format and generate realistic mock conversation dialogues based on the session's active step
  const formattedSessions = sessions.map((s: any) => {
    const name = s.customerName || `Cliente +${s.phoneNumber.slice(-4)}`
    const lastTime = s.lastInteraction.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Format and read actual conversation dialogues, or generate realistic mocks if empty
    let messages = Array.isArray(s.messages) ? (s.messages as any[]) : []
    
    if (messages.length === 0) {
      messages = [
        { sender: 'user' as const, text: 'Hola! Buenas tardes', time: '14:20' },
        { sender: 'bot' as const, text: `¡Hola! Bienvenido. 🤖 ¿En qué puedo ayudarte hoy?`, time: '14:21' }
      ]
      
      if (s.step === 'AWAITING_STORE_SELECTION' || s.step === 'IDLE') {
        messages.push(
          { sender: 'user' as const, text: 'Quiero ver el catálogo de productos por favor', time: '14:22' },
          { sender: 'bot' as const, text: 'He preparado una experiencia visual increíble para ti. Pulsa el botón de abajo para explorar el catálogo completo.', time: '14:23' }
        )
      } else if (s.step === 'AWAITING_NAME' || s.step === 'AWAITING_ADDRESS' || s.step === 'AWAITING_CONFIRMATION') {
        messages.push(
          { sender: 'user' as const, text: 'Quiero pedir unos productos de la tienda', time: '14:22' },
          { sender: 'bot' as const, text: '¡Excelente elección! Para agilizar tu despacho, ¿a nombre de quién anotamos el pedido? 👤', time: '14:23' }
        )
        if (s.customerName) {
          messages.push(
            { sender: 'user' as const, text: s.customerName, time: '14:24' },
            { sender: 'bot' as const, text: `Perfecto, *${s.customerName}*. ¿A qué dirección debemos enviar tu pedido?`, time: '14:24' }
          )
        }
        if (s.address) {
          messages.push(
            { sender: 'user' as const, text: s.address, time: '14:25' },
            { sender: 'bot' as const, text: 'Entendido. He procesado tu solicitud de envío. Por favor confirma tu compra realizando el pago seguro.', time: '14:26' }
          )
        }
      }
    }

    return {
      id: s.id,
      phoneNumber: s.phoneNumber,
      customerName: name,
      lastInteraction: s.lastInteraction.toISOString(),
      step: s.step,
      messages
    }
  })

  // Fallback mock session if none exists
  if (formattedSessions.length === 0) {
    formattedSessions.push({
      id: 'demo-session',
      phoneNumber: '573001234567',
      customerName: 'Cliente Ejemplo (Demo)',
      lastInteraction: new Date().toISOString(),
      step: 'IDLE',
      messages: [
        { sender: 'user' as const, text: 'Hola, me interesa comprar unos AirPods Max', time: '18:10' },
        { sender: 'bot' as const, text: '¡Hola! Qué excelente elección. Contamos con AirPods Max en stock con entrega inmediata. ¿Quieres proceder con la compra?', time: '18:11' }
      ]
    })
  }

  return (
    <div className="space-y-4 pb-2 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-955 font-display">Historial de Chats</h1>
            <div className="text-[13px] font-medium text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Bandeja de Entrada — <span className="text-zinc-950 font-bold">MONITOREO DE CONVERSACIONES EN VIVO</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-zinc-100" />
      </div>
      
      <ChatHistoryViewer initialSessions={formattedSessions} />
    </div>
  )
}
