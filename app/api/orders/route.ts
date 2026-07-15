import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { getProofImageUrl } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type OrderItemInput = {
  name: string
  price: number
  qty: number
}

type OrderRecord = {
  id: string
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  items: unknown
  total: number
  status: string
  paymentStatus: string
  proofImageUrl: string | null
  stripeCheckoutSessionId: string | null
  mpPaymentId: string | null
  mpPreferenceId: string | null
  createdAt: Date
}

function parseOrderItems(rawItems: unknown): OrderItemInput[] {
  if (!Array.isArray(rawItems)) return []

  return rawItems.flatMap(item => {
    if (!item || typeof item !== 'object') return []

    const record = item as Record<string, unknown>
    const qty = Math.max(0, Math.floor(Number(record.qty)))
    const price = Number(record.price)
    const name =
      typeof record.name === 'string' && record.name.trim().length > 0
        ? record.name.trim()
        : 'Producto'

    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) {
      return []
    }

    return [{ name, price, qty }]
  })
}

async function enrichProofUrls(orders: OrderRecord[]) {
  return Promise.all(
    orders.map(async order => ({
      ...order,
      proofImageUrl: await getProofImageUrl(order.proofImageUrl),
    }))
  )
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    })

    const withProofUrls = await enrichProofUrls(orders as OrderRecord[])
    return NextResponse.json(withProofUrls)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo invalido' }, { status: 400 })
    }

    const input = body as Record<string, unknown>
    const storeId = typeof input.storeId === 'string' ? input.storeId : ''
    const customerName =
      typeof input.customerName === 'string' ? input.customerName.trim() : ''
    const customerPhone =
      typeof input.customerPhone === 'string' ? input.customerPhone.trim() : null
    const address = typeof input.address === 'string' ? input.address.trim() : ''
    const city = typeof input.city === 'string' ? input.city.trim() : ''
    const items = parseOrderItems(input.items)

    if (!storeId || !customerName || !address || !city || items.length === 0) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

    const order = await prisma.order.create({
      data: {
        storeId,
        customerName,
        customerPhone,
        customerWhatsAppId: customerPhone,
        address,
        city,
        items,
        total,
        source: 'WHATSAPP_WEBVIEW',
      },
    })

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    if (customerPhone) {
      try {
        const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
        const summaryMsg = `¡Listo ${customerName}! 📝\n\nRecibimos tu pedido de *${itemCount} articulos* por un total de *$${total.toLocaleString('es-CO')}*.\n\nTu pedido ha sido procesado exitosamente. Haz clic abajo para ver el resumen o gestionar tu pago:`

        await waClient.sendUrlButton(
          customerPhone,
          summaryMsg,
          '📂 Ver Resumen y Pago',
          `${process.env.NEXT_PUBLIC_APP_URL}/tienda/${store.slug}/exito?orderId=${order.id}&wa=${customerPhone}`
        )
        console.log(`[Sync] Notificacion enviada a ${customerPhone} para el pedido ${order.id}`)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'error desconocido'
        console.error('[Sync Error] No se pudo enviar notificacion de WhatsApp:', message)
      }
    }

    const aiSettings =
      store.aiSettings && typeof store.aiSettings === 'object' ? store.aiSettings : {}
    const whatsappTemplate =
      typeof (aiSettings as { whatsappTemplate?: unknown }).whatsappTemplate === 'string'
        ? ((aiSettings as { whatsappTemplate?: string }).whatsappTemplate || '')
        : ''

    const whatsappUrl = buildWhatsAppLink(
      {
        storeName: store.name,
        whatsapp: store.whatsapp,
        customerName,
        items,
        total,
        address,
        city,
      },
      whatsappTemplate
    )

    return NextResponse.json({ orderId: order.id, whatsappUrl, success: true })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear el pedido' },
      { status: 500 }
    )
  }
}
