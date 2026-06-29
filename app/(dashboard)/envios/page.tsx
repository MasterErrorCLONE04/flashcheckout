import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LogisticsManager from '@/components/LogisticsManager'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

export default async function EnviosPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const drivers = await (prisma as any).driver.findMany({
    orderBy: { name: 'asc' },
  })

  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      deliveryRequested: true,
    },
    include: { driver: true },
    orderBy: { createdAt: 'desc' },
  })

  // Format dispatches list
  const formattedDispatches = orders.map((o: any) => ({
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone || '',
    address: o.address,
    city: o.city,
    total: o.total,
    status: o.status,
    driver: o.driver ? {
      name: o.driver.name,
      phoneNumber: o.driver.phoneNumber,
      rating: o.driver.rating
    } : null,
  }))

  return (
    <div className="space-y-4 pb-2 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Envíos y Logística</h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gestión de entregas — <span className="text-zinc-900 font-bold">Despachos y mensajeros</span>
            </div>
          </div>
        </div>
      </div>
      
      <LogisticsManager initialDrivers={drivers} initialDispatches={formattedDispatches} />
    </div>
  )
}
