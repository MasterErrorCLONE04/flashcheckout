import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getProofImageUrl } from '@/lib/supabase'
import ManualVerificationPanel from '@/components/dashboard/ManualVerificationPanel'
import StoreVerificationManager from '@/components/dashboard/StoreVerificationManager'
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

  const store = await prisma.store.findFirst({
    where: { userId },
  })

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
      paymentStatus: 'CONFIRMED',
      createdAt: { gte: monthStart },
    },
    select: { total: true },
  })

  const currentVolume = confirmedOrdersThisMonth.reduce((sum, current) => sum + current.total, 0)
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
    whatsapp: store.whatsapp,
    active: store.active,
    verificationLevel: store.verificationLevel,
    whatsappVerified: store.whatsappVerified,
    pausedReason: store.pausedReason,
    idProofUrl: store.idProofUrl,
    strikes: store.strikes,
  }

  return (
    <div className="space-y-6 pb-2 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Verificar Pagos</h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Validacion manual - <span className="text-zinc-900 font-bold">{store.name}</span>
            </div>
          </div>
        </div>
      </div>

      <StoreVerificationManager
        store={serializedStore}
        currentVolume={currentVolume}
        currentCount={currentCount}
      />

      <div className="h-px w-full bg-zinc-100 my-6" />

      <ManualVerificationPanel initialOrders={serializedOrders} />
    </div>
  )
}
