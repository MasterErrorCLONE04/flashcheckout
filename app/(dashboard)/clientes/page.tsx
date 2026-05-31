import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CustomerCRM from '@/components/CustomerCRM'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' }
  })

  // Group in memory by customerPhone
  const customerMap: Record<string, { phone: string; name: string; totalOrders: number; totalSpent: number; lastOrderDate: string }> = {}

  orders.forEach((o: any) => {
    // If phone is missing, fall back to "Desconocido"
    const phone = o.customerPhone || 'Desconocido'
    if (phone === 'Desconocido' && !o.customerName) return // Skip completely empty orders
    
    const key = phone === 'Desconocido' ? `${o.customerName}-${o.createdAt.getTime()}` : phone

    if (!customerMap[key]) {
      customerMap[key] = {
        phone: phone === 'Desconocido' ? '' : phone,
        name: o.customerName || 'Cliente sin nombre',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: o.createdAt.toISOString()
      }
    }
    customerMap[key].totalOrders += 1
    customerMap[key].totalSpent += o.total
  })

  const customersList = Object.values(customerMap)

  return (
    <div className="space-y-4 pb-2 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-955 font-display">Directorio de Clientes</h1>
            <div className="text-[13px] font-medium text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Gestión de Relación (CRM) — <span className="text-zinc-950 font-bold">CLIENTES Y VENTAS HISTÓRICAS</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-zinc-100" />
      </div>
      
      <CustomerCRM initialCustomers={customersList} />
    </div>
  )
}
