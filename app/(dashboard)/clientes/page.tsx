import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import CustomerCRM from '@/components/CustomerCRM'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

type CustomerRecord = {
  id: string | null
  customerKey: string
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
}

type SerializedOrder = {
  id: string
  customerKey: string
  customerName: string
  customerPhone: string
  total: number
  status: string
  createdAt: string
}

const normalizePhone = (phone?: string | null) => phone?.replace(/[^\d]/g, '') || ''

const normalizeNameKey = (name?: string | null) => {
  const cleanName = name?.trim()
  if (!cleanName) return ''

  return cleanName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

const getCustomerKey = (phone?: string | null, name?: string | null) => {
  const cleanPhone = normalizePhone(phone)
  if (cleanPhone) return `phone:${cleanPhone}`

  const nameKey = normalizeNameKey(name)
  return nameKey ? `name:${nameKey}` : ''
}

export default async function ClientesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const [orders, savedCustomers] = await Promise.all([
    prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findMany({
      where: { storeId: store.id },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const savedCustomerByPhone = new Map<string, typeof savedCustomers[number]>()
  const savedCustomerByName = new Map<string, typeof savedCustomers[number]>()

  savedCustomers.forEach((customer) => {
    const cleanPhone = normalizePhone(customer.phone)
    if (cleanPhone) savedCustomerByPhone.set(cleanPhone, customer)

    const nameKey = normalizeNameKey(customer.name)
    if (!cleanPhone && nameKey) savedCustomerByName.set(nameKey, customer)
  })

  const customerMap = new Map<string, CustomerRecord>()

  savedCustomers.forEach((customer) => {
    const customerKey = getCustomerKey(customer.phone, customer.name)
    if (!customerKey) return

    customerMap.set(customerKey, {
      id: customer.id,
      customerKey,
      phone: normalizePhone(customer.phone),
      name: customer.name,
      email: customer.email || '',
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: customer.updatedAt.toISOString(),
      status: 'Inactivo',
      segment: 'Nuevo',
      city: customer.city || '',
      birthDate: customer.birthDate || '',
      notes: customer.notes || '',
    })
  })
  orders.forEach((order) => {
    const cleanPhone = normalizePhone(order.customerPhone)
    const cleanName = order.customerName?.trim() || 'Cliente sin nombre'
    const customerKey = getCustomerKey(cleanPhone, cleanName)
    if (!customerKey) return

    if (!customerMap.has(customerKey)) {
      const savedCustomer = cleanPhone
        ? savedCustomerByPhone.get(cleanPhone)
        : savedCustomerByName.get(normalizeNameKey(cleanName))

      customerMap.set(customerKey, {
        id: savedCustomer?.id || null,
        customerKey,
        phone: cleanPhone,
        name: savedCustomer?.name || cleanName,
        email: savedCustomer?.email || '',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt.toISOString(),
        status: 'Inactivo',
        segment: 'Nuevo',
        city: savedCustomer?.city || order.city || '',
        birthDate: savedCustomer?.birthDate || '',
        notes: savedCustomer?.notes || '',
      })
    }

    const customer = customerMap.get(customerKey)
    if (!customer) return

    customer.totalOrders += 1
    customer.totalSpent += order.total

    if (order.createdAt.getTime() > new Date(customer.lastOrderDate).getTime()) {
      customer.lastOrderDate = order.createdAt.toISOString()
    }
  })

  const now = Date.now()
  const customersList: CustomerRecord[] = Array.from(customerMap.values())
    .map((customer) => {
      const diffTime = now - new Date(customer.lastOrderDate).getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let segment: CustomerRecord['segment'] = 'Nuevo'
      if (customer.totalOrders > 4) {
        segment = 'Frecuente'
      } else if (customer.totalOrders > 1) {
        segment = 'Ocasional'
      }

      return {
        ...customer,
        status: diffDays <= 30 ? 'Activo' : 'Inactivo',
        segment,
      }
    })
    .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime())

  // Serialize orders list for past purchases timeline
  const serializedOrders: SerializedOrder[] = orders.map((o) => ({
    id: o.id,
    customerKey: getCustomerKey(o.customerPhone, o.customerName),
    customerName: o.customerName,
    customerPhone: normalizePhone(o.customerPhone),
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

      <CustomerCRM initialCustomers={customersList} initialOrders={serializedOrders} />
    </div>
  )
}
