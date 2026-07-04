import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
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
    const body = await req.json()
    const { storeId, customerName, customerPhone, address, city, items } = body

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
      data: { 
        storeId, 
        customerName, 
        customerPhone,
        customerWhatsAppId: customerPhone,
        address, 
        city, 
        items, 
        total,
        source: 'WHATSAPP_WEBVIEW'
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

    // ARQUITECTURA DE SINCRONIZACIÓN: Notificación proactiva desde el servidor
    if (customerPhone) {
      try {
        const itemCount = items.reduce((s: number, i: any) => s + i.qty, 0)
        const summaryMsg = `¡Listo ${customerName}! 📝\n\nRecibimos tu pedido de *${itemCount} artículos* por un total de *$${total.toLocaleString('es-CO')}*.\n\nTu pedido ha sido procesado exitosamente. Haz clic abajo para ver el resumen o gestionar tu pago:`
        
        // Usamos CTA URL para mantener al usuario en el WebView al revisar su pedido o pagar
        await waClient.sendUrlButton(
          customerPhone, 
          summaryMsg,
          '📂 Ver Resumen y Pago',
          `${process.env.NEXT_PUBLIC_APP_URL}/tienda/${store.slug}/exito?orderId=${order.id}&wa=${customerPhone}`
        )
        console.log(`[Sync] Notificación enviada a ${customerPhone} para el pedido ${order.id}`)
      } catch (err: any) {
        console.error('[Sync Error] No se pudo enviar notificación de WhatsApp:', err.message)
      }
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

    return NextResponse.json({ orderId: order.id, whatsappUrl, success: true })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear el pedido' },
      { status: 500 }
    )
  }
}
