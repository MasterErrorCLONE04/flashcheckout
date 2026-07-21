import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { initiateDispatchOffer } from '@/lib/dispatch/matching-algorithm'

type StatusUpdateBody = {
  status?: string
  deliveryRequested?: boolean
  deliveryType?: 'INTERNAL' | 'EXTERNAL'
  externalCarrier?: string
  trackingNumber?: string
}

type WhatsAppNotifier = {
  sendText: (to: string, message: string) => Promise<unknown>
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const body = (await req.json()) as StatusUpdateBody

    const updateData: Record<string, string | boolean> = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.deliveryRequested !== undefined) updateData.deliveryRequested = body.deliveryRequested
    if (body.deliveryType !== undefined) updateData.deliveryType = body.deliveryType
    if (body.externalCarrier !== undefined) updateData.externalCarrier = body.externalCarrier
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber

    // Si cambia a shipped_external, asegurar deliveryType = EXTERNAL
    if (body.status === 'shipped_external') {
      updateData.deliveryType = 'EXTERNAL'
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { driver: true, store: true },
    })

    // 1. Manejo de Despacho Interno por Algoritmo de Match
    if (body.deliveryRequested === true || body.deliveryType === 'INTERNAL') {
      try {
        // En un entorno real se usan las coords de la tienda; por defecto Bogotá/Medellín si no están definidas
        const storeLat = 4.6097
        const storeLng = -74.0817
        await initiateDispatchOffer(updatedOrder.id, storeLat, storeLng)
      } catch (dispatchErr: unknown) {
        console.error('[Dispatch Algorithm Trigger Error]', dispatchErr)
      }
    }

    // 2. Manejo de Notificación por WhatsApp para Envío Externo
    if (body.status === 'shipped_external') {
      const recipient = updatedOrder.customerPhone || updatedOrder.customerWhatsAppId
      if (recipient) {
        const carrierName = body.externalCarrier || 'repartidor externo'
        const trackingMsg = body.trackingNumber ? ` (Guía: ${body.trackingNumber})` : ''
        const confirmationMsg =
          `🚚 *¡Tu pedido ha sido enviado!*\n\n` +
          `Hola *${updatedOrder.customerName}*, tu pedido #${updatedOrder.id.slice(-6).toUpperCase()} en *${updatedOrder.store.name}* va en camino mediante *${carrierName}*${trackingMsg}.\n\n` +
          `Cuando recibas tu paquete, por favor confirma respondiendo *'RECIBIDO'* a este mensaje para finalizar tu pedido.`

        try {
          const store = updatedOrder.store
          if (store.whatsappInstanceName && store.whatsappConnected) {
            const { evolutionClient } = await import('@/lib/whatsapp/evolution')
            await evolutionClient.sendText(store.whatsappInstanceName, recipient, confirmationMsg)
          } else {
            await waClient.sendText(recipient, confirmationMsg)
          }
        } catch (msgErr: unknown) {
          console.error('[External Carrier WhatsApp Notify Error]', msgErr)
        }
      }
    }

    // 3. Notificaciones automáticas para otros estados
    if (body.status !== undefined && body.status !== 'shipped_external') {
      try {
        let automationName = ''
        let defaultMsg = ''

        if (body.status === 'confirmed' || body.status === 'in_transit') {
          automationName = 'Pedido listo para retiro / envio'
          defaultMsg = '¡Hola {{cliente}}! Tu pedido #{{pedido_id}} en {{tienda}} está en camino o listo para entrega. Valor total: ${{total}}.'
        } else if (body.status === 'delivered') {
          automationName = 'Calificar servicio'
          defaultMsg = '¡Hola {{cliente}}! Tu pedido #{{pedido_id}} en {{tienda}} ha sido completado con éxito. ¡Gracias por tu compra!'
        }

        if (automationName) {
          const aut = await prisma.automation.findFirst({
            where: {
              storeId: updatedOrder.storeId,
              name: { equals: automationName, mode: 'insensitive' },
              active: true,
            },
            select: { id: true, customTemplate: true },
          })

          const recipient = updatedOrder.customerPhone || updatedOrder.customerWhatsAppId
          if (aut && recipient) {
            const template = aut.customTemplate || defaultMsg
            const formattedMsg = template
              .replace(/{{cliente}}/g, updatedOrder.customerName || 'Cliente')
              .replace(/{{pedido_id}}/g, updatedOrder.id.slice(-6).toUpperCase())
              .replace(/{{total}}/g, updatedOrder.total.toLocaleString('es-CO'))
              .replace(/{{tienda}}/g, updatedOrder.store.name)

            let clientToUse: WhatsAppNotifier = waClient
            const store = updatedOrder.store
            if (store.whatsappInstanceName && store.whatsappConnected) {
              const { evolutionClient } = await import('@/lib/whatsapp/evolution')
              clientToUse = {
                sendText: (to: string, message: string) =>
                  evolutionClient.sendText(store.whatsappInstanceName!, to, message),
              }
            }

            try {
              await clientToUse.sendText(recipient, formattedMsg)
              await prisma.automation.update({
                where: { id: aut.id },
                data: { sentToday: { increment: 1 } },
              })
            } catch (err: unknown) {
              console.error('[Automation WhatsApp trigger failed]', err)
            }
          }
        }
      } catch (autErr: unknown) {
        console.error('[Automation status webhook error]', autErr)
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: unknown) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
}
