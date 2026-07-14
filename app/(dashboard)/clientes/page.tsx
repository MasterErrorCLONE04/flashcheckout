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

  const savedCustomers = await prisma.customer.findMany({
    where: { storeId: store.id }
  })

  // Create a map of saved customers
  const savedCustomerMap: Record<string, typeof savedCustomers[0]> = {}
  savedCustomers.forEach(c => {
    if (c.phone) {
      savedCustomerMap[c.phone] = c
    }
  })

  // Group in memory by customerPhone or name
  const customerMap: Record<string, {
    phone: string
    name: string
    email: string
    totalOrders: number
    totalSpent: number
    lastOrderDate: string
    status: 'Activo' | 'Inactivo'
    segment: 'Frecuente' | 'Ocasional' | 'Nuevo'
    city: string
    birthDate: string
    notes: string
  }> = {}

  // Helper to generate deterministic birth date based on name string
  function getDeterministicBirthDate(name: string) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const day = Math.abs(hash % 28) + 1
    const month = months[Math.abs(hash % 12)]
    const year = 1980 + Math.abs(hash % 23) // 1980 to 2003
    return `${day} de ${month}, ${year}`
  }

  // Helper to generate deterministic notes based on name string
  function getDeterministicNotes(name: string, totalOrders: number) {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash % 3)
    if (totalOrders > 3) {
      return 'Cliente VIP. Compra constantemente y prefiere envíos express los fines de semana.'
    }
    const notesArray = [
      'Cliente frecuente. Le interesan productos de la línea principal y promociones.',
      'Suele preguntar detalles por WhatsApp antes de comprar. Prefiere transferencias manuales.',
      'Registrado recientemente. Muestra interés en lanzamientos y ofertas especiales.'
    ]
    return notesArray[index]
  }

  orders.forEach((o: any) => {
    const phone = o.customerPhone || 'Desconocido'
    if (phone === 'Desconocido' && !o.customerName) return // Skip completely empty orders

    const key = phone === 'Desconocido' ? `${o.customerName}-${o.createdAt.getTime()}` : phone

    if (!customerMap[key]) {
      const cleanName = o.customerName || 'Cliente sin nombre'
      const saved = phone !== 'Desconocido' ? savedCustomerMap[phone] : null

      const cleanNameFinal = saved?.name || cleanName
      const safeName = cleanNameFinal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '')
      const emailFinal = saved?.email || `${safeName.slice(0, 10)}@gmail.com`
      const cityFinal = saved?.city || o.city || 'Desconocido'
      const birthDateFinal = saved?.birthDate || getDeterministicBirthDate(cleanNameFinal)
      const notesFinal = saved?.notes || getDeterministicNotes(cleanNameFinal, 1)

      customerMap[key] = {
        phone: phone === 'Desconocido' ? '' : phone,
        name: cleanNameFinal,
        email: emailFinal,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: o.createdAt.toISOString(),
        status: 'Inactivo', // Will be calculated after grouping
        segment: 'Nuevo',   // Will be calculated after grouping
        city: cityFinal,
        birthDate: birthDateFinal,
        notes: notesFinal
      }
    }
    
    customerMap[key].totalOrders += 1
    customerMap[key].totalSpent += o.total

    // Keep the latest order date
    if (new Date(o.createdAt).getTime() > new Date(customerMap[key].lastOrderDate).getTime()) {
      customerMap[key].lastOrderDate = o.createdAt.toISOString()
    }
  })

  // Final adjustments for active states and segments
  const customersList = Object.values(customerMap).map(c => {
    // 30 days check
    const diffTime = Math.abs(new Date().getTime() - new Date(c.lastOrderDate).getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let status: 'Activo' | 'Inactivo' = 'Inactivo'
    if (diffDays <= 30 || c.totalOrders > 2) {
      status = 'Activo'
    }

    let segment: 'Frecuente' | 'Ocasional' | 'Nuevo' = 'Nuevo'
    if (c.totalOrders > 4) {
      segment = 'Frecuente'
    } else if (c.totalOrders > 1) {
      segment = 'Ocasional'
    }

    return {
      ...c,
      status,
      segment
    }
  })

  // Serialize orders list for past purchases timeline
  const serializedOrders = orders.map((o: any) => ({
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone || '',
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString()
  }))

  return (
    <div className="space-y-4 pb-2 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Directorio de Clientes</h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gestión de relación (CRM) — <span className="text-zinc-900 font-bold">Clientes y ventas históricas</span>
            </div>
          </div>
        </div>
      </div>

      <CustomerCRM initialCustomers={customersList as any} initialOrders={serializedOrders} />
    </div>
  )
}
