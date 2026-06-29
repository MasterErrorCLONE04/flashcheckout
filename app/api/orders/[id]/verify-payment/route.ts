import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notifyOrderConfirmed, notifyOrderRejected, waClient } from '@/lib/whatsapp/cloud-api'

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

    const store = order.store

    if (action === 'APPROVE') {
      // Si la tienda es Nivel 0 (sin verificar), controlar límites
      if (store.verificationLevel === 0) {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        // Obtener pedidos confirmados este mes
        const confirmedOrdersThisMonth = await prisma.order.findMany({
          where: {
            storeId: store.id,
            paymentStatus: 'CONFIRMED',
            createdAt: { gte: monthStart }
          }
        })

        const currentVolume = confirmedOrdersThisMonth.reduce((sum, o) => sum + o.total, 0)
        const currentCount = confirmedOrdersThisMonth.length

        const maxVolume = 500000 // $500,000 COP
        const maxCount = 10

        // Verificar límite del 100%
        if (currentVolume + order.total > maxVolume) {
          return NextResponse.json({
            error: `Límite mensual excedido. Aprobar este pedido ($${order.total.toLocaleString()}) superará el límite de ventas mensuales de $${maxVolume.toLocaleString()} COP para tiendas Nivel 0. Por favor, verifica tu identidad en el panel para continuar sin límites.`
          }, { status: 400 })
        }

        if (currentCount + 1 > maxCount) {
          return NextResponse.json({
            error: `Límite mensual de transacciones excedido. Aprobar este pedido superará el límite de ${maxCount} transacciones mensuales para tiendas Nivel 0. Por favor, verifica tu identidad en el panel para continuar sin límites.`
          }, { status: 400 })
        }

        // Verificar alerta preventiva del 80%
        const alertVolume = 400000 // $400,000 COP (80%)
        const alertCount = 8 // 8 transacciones (80%)

        if (
          (currentVolume + order.total >= alertVolume || currentCount + 1 >= alertCount) &&
          !store.notifiedLimit80
        ) {
          // Enviar alerta proactiva por WhatsApp
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            await waClient.sendText(
              store.whatsapp,
              `📈 *¡Tus ventas están volando!* 🚀\n\nTu tienda *${store.name}* ha alcanzado el 80% de su límite mensual de ventas de Nivel 0 ($${(currentVolume + order.total).toLocaleString()} / $${maxVolume.toLocaleString()} COP o ${currentCount + 1} / ${maxCount} transacciones).\n\nPara seguir recibiendo pagos por transferencia manual sin límites y evitar interrupciones en tu servicio, necesitamos verificar tu identidad. Sube tu documento aquí: ${appUrl}/verificaciones`
            )
            // Marcar como notificado
            await prisma.store.update({
              where: { id: store.id },
              data: { notifiedLimit80: true }
            })
          } catch (waErr) {
            console.error('Error sending 80% limit warning:', waErr)
          }
        }
      }

      // Proceder con la aprobación
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

      // Notificar al dueño de la tienda por WhatsApp sobre la confirmación y sugerir domicilio
      try {
        if (store.whatsapp) {
          await waClient.sendText(
            store.whatsapp,
            `📦 *¡Pago por transferencia verificado!* ✅\n\nEl pago para el pedido *#${updatedOrder.id.slice(-6)}* ha sido confirmado manualmente:\n\n*Detalles del pedido:*\n• *Cliente:* ${updatedOrder.customerName}\n• *Teléfono:* ${updatedOrder.customerPhone || 'N/A'}\n• *Dirección de Entrega:* ${updatedOrder.address}, ${updatedOrder.city}\n• *Total:* $${updatedOrder.total.toLocaleString('es-CO')}`
          )

          await waClient.sendButtons(
            store.whatsapp,
            `🚚 *¿Te gustaría solicitar nuestro Servicio de Domicilio para este pedido?*\n\nPodemos enviar a un repartidor oficial de la plataforma a recoger el producto por una pequeña cuota de *$5.000 COP*.`,
            [
              { id: `delivery_yes_${updatedOrder.id}`, title: 'SÍ' },
              { id: `delivery_no_${updatedOrder.id}`, title: 'NO' }
            ]
          )
        }
      } catch (waErr) {
        console.error('Error sending WhatsApp delivery prompt to merchant:', waErr)
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
          where: { 
            phoneNumber: order.customerWhatsAppId,
            storeId: order.storeId
          },
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
