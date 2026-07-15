import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyOrderConfirmed, notifyOrderRejected, waClient } from '@/lib/whatsapp/cloud-api'

type VerifyAction = 'APPROVE' | 'REJECT'

type VerifyPaymentBody = {
  action?: VerifyAction
  comment?: string
}

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
    const body = (await req.json()) as VerifyPaymentBody
    const action = body.action
    const comment = body.comment

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (order.store.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado para esta tienda' }, { status: 403 })
    }

    const store = order.store

    if (action === 'APPROVE') {
      if (store.verificationLevel === 0) {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const confirmedOrdersThisMonth = await prisma.order.findMany({
          where: {
            storeId: store.id,
            paymentStatus: 'CONFIRMED',
            createdAt: { gte: monthStart },
          },
        })

        const currentVolume = confirmedOrdersThisMonth.reduce((sum, current) => sum + current.total, 0)
        const currentCount = confirmedOrdersThisMonth.length
        const maxVolume = 500000
        const maxCount = 10

        if (currentVolume + order.total > maxVolume) {
          return NextResponse.json(
            {
              error: `Limite mensual excedido. Aprobar este pedido superara el limite de ventas mensuales de $${maxVolume.toLocaleString()} COP para tiendas Nivel 0. Por favor, verifica tu identidad en el panel para continuar sin limites.`,
            },
            { status: 400 }
          )
        }

        if (currentCount + 1 > maxCount) {
          return NextResponse.json(
            {
              error: `Limite mensual de transacciones excedido. Aprobar este pedido superara el limite de ${maxCount} transacciones mensuales para tiendas Nivel 0. Por favor, verifica tu identidad en el panel para continuar sin limites.`,
            },
            { status: 400 }
          )
        }

        const alertVolume = 400000
        const alertCount = 8

        if (
          (currentVolume + order.total >= alertVolume || currentCount + 1 >= alertCount) &&
          !store.notifiedLimit80
        ) {
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            await waClient.sendText(
              store.whatsapp,
              `Tu tienda ${store.name} ha alcanzado el 80% de su limite mensual de ventas de Nivel 0 (${(currentVolume + order.total).toLocaleString()} / ${maxVolume.toLocaleString()} COP o ${currentCount + 1} / ${maxCount} transacciones).\n\nPara seguir recibiendo pagos por transferencia manual sin limites y evitar interrupciones en tu servicio, necesitamos verificar tu identidad. Sube tu documento aqui: ${appUrl}/verificaciones`
            )
            await prisma.store.update({
              where: { id: store.id },
              data: { notifiedLimit80: true },
            })
          } catch (waErr) {
            console.error('Error sending 80% limit warning:', waErr)
          }
        }
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'CONFIRMED',
          status: 'confirmed',
        },
      })

      if (order.customerWhatsAppId) {
        await notifyOrderConfirmed(order.id, order.customerWhatsAppId)
      }

      try {
        if (store.whatsapp) {
          await waClient.sendText(
            store.whatsapp,
            `Pago por transferencia verificado.\n\nEl pago para el pedido *#${updatedOrder.id.slice(-6)}* ha sido confirmado manualmente:\n\n*Detalles del pedido:*\n- *Cliente:* ${updatedOrder.customerName}\n- *Telefono:* ${updatedOrder.customerPhone || 'N/A'}\n- *Direccion de Entrega:* ${updatedOrder.address}, ${updatedOrder.city}\n- *Total:* $${updatedOrder.total.toLocaleString('es-CO')}`
          )

          await waClient.sendButtons(
            store.whatsapp,
            `¿Te gustaria solicitar nuestro Servicio de Domicilio para este pedido?\n\nPodemos enviar a un repartidor oficial de la plataforma a recoger el producto por una pequena cuota de $5.000 COP.`,
            [
              { id: `delivery_yes_${updatedOrder.id}`, title: 'SI' },
              { id: `delivery_no_${updatedOrder.id}`, title: 'NO' },
            ]
          )
        }
      } catch (waErr) {
        console.error('Error sending WhatsApp delivery prompt to merchant:', waErr)
      }

      return NextResponse.json({ success: true, order: updatedOrder })
    }

    if (action === 'REJECT') {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REJECTED',
          adminComment: comment || 'Comprobante no valido',
        },
      })

      if (order.customerWhatsAppId) {
        await prisma.whatsAppSession.updateMany({
          where: {
            phoneNumber: order.customerWhatsAppId,
            storeId: order.storeId,
          },
          data: { step: 'AWAITING_CONFIRMATION' },
        })

        await notifyOrderRejected(order.id, order.customerWhatsAppId, comment || 'Comprobante no valido')
      }

      return NextResponse.json({ success: true, order: updatedOrder })
    }

    return NextResponse.json({ error: 'Accion no valida' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    console.error('Error in verify-payment:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
