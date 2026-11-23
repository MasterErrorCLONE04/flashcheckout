import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { getProofImageUrl } from '@/lib/supabase'
import VerificacionesClient from '@/components/VerificacionesClient'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

type OrderRow = {
  id: string
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  items: { name: string; qty: number; price: number }[]
  total: number
  status: string
  createdAt: Date
  paymentStatus: string
  proofImageUrl: string | null
  adminComment: string | null
}

export default async function VerificacionesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)
  if (!store) return <StoreCreationWizard />

  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      paymentStatus: 'UPLOADED',
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const confirmedOrdersThisMonth = await prisma.order.findMany({
    where: {
      storeId: store.id,
      paymentStatus: { in: ['CONFIRMED', 'PAID'] },
      createdAt: { gte: monthStart },
    },
    select: { total: true },
  })

  const currentVolume = confirmedOrdersThisMonth.reduce(
    (sum, current) => sum + current.total,
    0
  )
  const currentCount = confirmedOrdersThisMonth.length

  const serializedOrders = await Promise.all(
    (orders as unknown as OrderRow[]).map(async order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : [],
      createdAt: order.createdAt.toISOString(),
      proofImageUrl: await getProofImageUrl(order.proofImageUrl),
    }))
  )

  const serializedStore = {
    id: store.id,
    name: store.name,
    whatsapp: store.whatsapp || '',
    active: store.active,
    verificationLevel: store.verificationLevel,
    whatsappVerified: store.whatsappVerified,
    pausedReason: store.pausedReason,
    idProofUrl: store.idProofUrl,
    strikes: store.strikes,
  }

  return (
    <VerificacionesClient
      store={serializedStore}
      initialOrders={serializedOrders}
      currentVolume={currentVolume}
      currentCount={currentCount}
    />
  )
}
