import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notifyOrderConfirmed, notifyOrderRejected } from '@/lib/whatsapp/cloud-api'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: orderId } = await params
    const body = await req.json()
    const { action, comment } = body // action = 'APPROVE' or 'REJECT'

    // 1. Obtener la orden y validar tienda
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    // 2. Validación de Sesión: Asegurar que solo el propietario de la tienda pueda validar
    if (order.store.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado para esta tienda' }, { status: 403 })
    }

    if (action === 'APPROVE') {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'CONFIRMED',
          status: 'confirmed'
        }
      })

      if (order.customerWhatsAppId) {
        await notifyOrderConfirmed(order.id, order.customerWhatsAppId)
      }

      return NextResponse.json({ success: true, order: updatedOrder })
    } else if (action === 'REJECT') {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REJECTED',
          adminComment: comment || 'Comprobante no válido'
        }
      })

      // Regresar la sesión de WhatsApp del cliente al estado de espera
      if (order.customerWhatsAppId) {
        await (prisma as any).whatsAppSession.updateMany({
          where: { phoneNumber: order.customerWhatsAppId },
          data: { step: 'AWAITING_CONFIRMATION' }
        })

        await notifyOrderRejected(order.id, order.customerWhatsAppId, comment || 'Comprobante no válido')
      }

      return NextResponse.json({ success: true, order: updatedOrder })
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error in verify-payment:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
