// Force route rebuild
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import NovaChatClient from '@/components/NovaChatClient'

export const dynamic = 'force-dynamic'

import { getActiveStore } from '@/lib/store-context'

export default async function HablarConNovaPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // 1. Obtener la tienda del usuario activa
  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  // 2. Obtener el nombre del usuario desde Clerk
  const user = await currentUser()
  const merchantName = user 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
    : 'Comerciante'

  // 3. Obtener métricas comerciales reales de la base de datos
  const [activeProductsCount, ordersCount, activeChatsCount] = await Promise.all([
    prisma.product.count({
      where: { storeId: store.id, active: true }
    }),
    prisma.order.count({
      where: { storeId: store.id }
    }),
    prisma.whatsAppSession.count({
      where: { storeId: store.id }
    })
  ])

  // 3.5 Obtener sesiones de chat guardadas
  const chatSessions = await prisma.novaChatSession.findMany({
    where: { storeId: store.id },
    orderBy: { updatedAt: 'desc' }
  })

  const initialSessions = chatSessions.map(s => ({
    id: s.id,
    title: s.title,
    messages: Array.isArray(s.messages) ? (s.messages as any[]) : [],
    updatedAt: s.updatedAt.toISOString()
  }))

  // 4. Mapear objeto serializable para el componente cliente
  const storeData = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    category: store.category,
    whatsapp: store.whatsapp,
    whatsappConnected: store.whatsappConnected,
    mpConnected: store.mpConnected,
    verificationLevel: store.verificationLevel
  }

  return (
    <NovaChatClient
      merchantName={merchantName}
      store={storeData}
      activeProductsCount={activeProductsCount}
      ordersCount={ordersCount}
      activeChatsCount={activeChatsCount}
      initialSessions={initialSessions}
    />
  )
}
