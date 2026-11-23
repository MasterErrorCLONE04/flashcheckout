import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { cartStateToLines } from '@/lib/whatsapp/session-state'
import CustomerCRM from '@/components/CustomerCRM'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import type { CustomerRecord, SerializedOrder, CustomerSegment } from '@/components/customer-crm/types'

export const dynamic = 'force-dynamic'

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

const PAID_STATUS_SET = new Set([
  'paid',
  'confirmed',
  'CONFIRMED',
  'shipped_external',
  'in_transit',
  'delivered',
])

function isOrderPaid(order: { status: string; paymentStatus: string }): boolean {
  return (
    order.paymentStatus === 'PAID' ||
    order.paymentStatus === 'CONFIRMED' ||
    PAID_STATUS_SET.has(order.status)
  )
}

function summarizeOrderItems(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return 'Pedido en tienda'
  const labels = items
    .map((it: any) => {
      const name = typeof it?.name === 'string' ? it.name : typeof it?.title === 'string' ? it.title : ''
      const qty = Number(it?.qty ?? it?.quantity ?? 1) || 1
      return name ? `${qty}x ${name}` : ''
    })
    .filter(Boolean)
  return labels.length > 0 ? labels.join(', ') : 'Pedido en tienda'
}

export default async function ClientesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)

  if (!store) return <StoreCreationWizard />

  const [orders, savedCustomers, whatsappSessions] = await Promise.all([
    prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.findMany({
      where: { storeId: store.id },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.whatsAppSession.findMany({
      where: { storeId: store.id },
      orderBy: { lastInteraction: 'desc' },
    }),
  ])

  const savedCustomerByPhone = new Map<string, (typeof savedCustomers)[number]>()
  const savedCustomerByName = new Map<string, (typeof savedCustomers)[number]>()

  savedCustomers.forEach(customer => {
    const cleanPhone = normalizePhone(customer.phone)
    if (cleanPhone) savedCustomerByPhone.set(cleanPhone, customer)

    const nameKey = normalizeNameKey(customer.name)
    if (!cleanPhone && nameKey) savedCustomerByName.set(nameKey, customer)
  })

  const customerMap = new Map<string, CustomerRecord>()

  // 1. Consolidate all orders (distinguishing Paid vs Purchase Intent)
  orders.forEach(order => {
    if (order.status === 'cancelled') return

    const cleanPhone = normalizePhone(order.customerPhone || order.customerWhatsAppId)
    const cleanName = order.customerName?.trim() || 'Cliente sin nombre'
    const customerKey = getCustomerKey(cleanPhone, cleanName)
    if (!customerKey) return

    const savedCustomer = cleanPhone
      ? savedCustomerByPhone.get(cleanPhone)
      : savedCustomerByName.get(normalizeNameKey(cleanName))

    if (!customerMap.has(customerKey)) {
      customerMap.set(customerKey, {
        id: savedCustomer?.id || null,
        customerKey,
        phone: cleanPhone,
        name: savedCustomer?.name || cleanName,
        email: savedCustomer?.email || '',
        paidOrders: 0,
        intentOrders: 0,
        totalOrders: 0,
        totalSpent: 0,
        intentAmount: 0,
        intentDetail: '',
        lastOrderDate: order.createdAt.toISOString(),
        status: 'Intención',
        segment: 'Intención',
        city: savedCustomer?.city || order.city || '',
        birthDate: savedCustomer?.birthDate || '',
        notes: savedCustomer?.notes || '',
      })
    }

    const customer = customerMap.get(customerKey)!
    const paid = isOrderPaid(order)
    const itemsText = summarizeOrderItems(order.items)

    customer.totalOrders += 1
    if (paid) {
      customer.paidOrders += 1
      customer.totalSpent += order.total
    } else {
      customer.intentOrders += 1
      customer.intentAmount += order.total
      if (!customer.intentDetail) {
        customer.intentDetail =
          order.paymentStatus === 'UPLOADED'
            ? `Comprobante subido · ${itemsText}`
            : `Checkout sin pagar · ${itemsText}`
      }
    }

    if (!customer.city && order.city) {
      customer.city = order.city
    }

    if (order.createdAt.getTime() > new Date(customer.lastOrderDate).getTime()) {
      customer.lastOrderDate = order.createdAt.toISOString()
    }
  })

  // 2. Include WhatsApp sessions that showed purchase intent (active cart or conversation)
  whatsappSessions.forEach(session => {
    const cleanPhone = normalizePhone(session.phoneNumber)
    const cleanName = session.customerName?.trim() || `Cliente +${cleanPhone.slice(-4)}`
    const customerKey = getCustomerKey(cleanPhone, cleanName)
    if (!customerKey) return

    const cartLines = cartStateToLines(session.cart)
    const cartTotal = cartLines.reduce((acc, item) => acc + item.price * item.qty, 0)
    const cartSummary =
      cartLines.length > 0
        ? `Carrito en WhatsApp · ${cartLines.map(i => `${i.qty}x ${i.name}`).join(', ')}`
        : 'Consulta de catálogo en WhatsApp'

    if (!customerMap.has(customerKey)) {
      const savedCustomer = cleanPhone ? savedCustomerByPhone.get(cleanPhone) : undefined
      customerMap.set(customerKey, {
        id: savedCustomer?.id || null,
        customerKey,
        phone: cleanPhone,
        name: savedCustomer?.name || cleanName,
        email: savedCustomer?.email || '',
        paidOrders: 0,
        intentOrders: cartLines.length > 0 ? 1 : 0,
        totalOrders: cartLines.length > 0 ? 1 : 0,
        totalSpent: 0,
        intentAmount: cartTotal,
        intentDetail: cartSummary,
        lastOrderDate: session.lastInteraction.toISOString(),
        status: 'Intención',
        segment: 'Intención',
        city: savedCustomer?.city || session.address || '',
        birthDate: savedCustomer?.birthDate || '',
        notes: savedCustomer?.notes || '',
      })
    } else {
      const existing = customerMap.get(customerKey)!
      if (cartTotal > 0 && existing.paidOrders === 0 && existing.intentAmount === 0) {
        existing.intentAmount = cartTotal
        existing.intentDetail = cartSummary
      }
      if (session.lastInteraction.getTime() > new Date(existing.lastOrderDate).getTime()) {
        existing.lastOrderDate = session.lastInteraction.toISOString()
      }
    }
  })

  const customersList: CustomerRecord[] = Array.from(customerMap.values())
    .map(customer => {
      let segment: CustomerSegment = 'Intención'
      if (customer.paidOrders >= 2) {
        segment = 'Frecuente'
      } else if (customer.paidOrders === 1) {
        segment = 'Comprador'
      }

      return {
        ...customer,
        status: (customer.paidOrders > 0 ? 'Pagado' : 'Intención') as 'Pagado' | 'Intención',
        segment,
      }
    })
    .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime())

  const serializedOrders: SerializedOrder[] = orders.map(o => ({
    id: o.id,
    customerKey: getCustomerKey(o.customerPhone || o.customerWhatsAppId, o.customerName),
    customerName: o.customerName,
    customerPhone: normalizePhone(o.customerPhone || o.customerWhatsAppId),
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    isPaid: isOrderPaid(o),
    itemsSummary: summarizeOrderItems(o.items),
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <CustomerCRM
      initialCustomers={customersList}
      initialOrders={serializedOrders}
      storeName={store.name}
    />
  )
}
