import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { storeId, customerName, address, city, items } = body

    if (!storeId || !customerName || !address || !city || !items?.length) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const total = items.reduce(
      (s: number, i: { price: number; qty: number }) => s + i.price * i.qty,
      0
    )

    const order = await prisma.order.create({
      data: { storeId, customerName, address, city, items, total },
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

    const whatsappUrl = buildWhatsAppLink({
      storeName: store.name,
      whatsapp: store.whatsapp,
      customerName,
      items,
      total,
      address,
      city,
    })

    return NextResponse.json({ orderId: order.id, whatsappUrl })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear el pedido' },
      { status: 500 }
    )
  }
}
