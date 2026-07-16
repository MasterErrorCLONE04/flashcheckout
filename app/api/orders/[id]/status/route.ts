import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

type StatusUpdateBody = {
  status?: string
  deliveryRequested?: boolean
}

type WhatsAppNotifier = {
  sendText: (to: string, message: string) => Promise<unknown>
  sendButtons: (
    to: string,
    message: string,
    buttons: Array<{ id: string; title: string }>
    ) => Promise<unknown>
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
    if (body.deliveryRequested !== undefined) {
      updateData.deliveryRequested = body.deliveryRequested
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { driver: true, store: true },
    })

    if (body.deliveryRequested === true) {
      try {
        const drivers = await prisma.driver.findMany({
          where: { active: true, available: true },
        })

        if (drivers.length > 0) {
          for (const driver of drivers) {
            try {
              await waClient.sendButtons(
                driver.phoneNumber,
                `NUEVO DOMICILIO DISPONIBLE.\n\n- Tienda: ${updatedOrder.store.name}\n- Direccion entrega: ${updatedOrder.address}, ${updatedOrder.city}\n- Valor envio: $5.000 COP\n- Valor pedido: $${updatedOrder.total.toLocaleString('es-CO')}\n- Contacto Tienda: wa.me/${updatedOrder.store.whatsapp}\n\n¿Deseas tomar este domicilio?`,
                [
                  { id: `accept_delivery_${updatedOrder.id}`, title: 'Aceptar Domicilio' },
                ]
              )
            } catch (driverErr: unknown) {
              const message = driverErr instanceof Error ? driverErr.message : 'Error desconocido'
              console.error(`Error al notificar al repartidor ${driver.phoneNumber}:`, message)
            }
          }
        }
      } catch (deliveryErr: unknown) {
        console.error('[Delivery Broadcast Web Error]', deliveryErr)
      }
    }

    if (body.status !== undefined) {
      try {
        let automationName = ''
        let defaultMsg = ''

        if (body.status === 'confirmed' || body.status === 'shipped') {
          automationName = 'Pedido listo para retiro / envio'
          defaultMsg = '¡Hola {{cliente}}! Tu pedido #{{pedido_id}} en {{tienda}} esta listo para ser enviado o retirado. Valor total: ${{total}}. ¡Gracias por tu compra!'
        } else if (body.status === 'delivered') {
          automationName = 'Calificar servicio'
          defaultMsg = '¡Hola {{cliente}}! Tu pedido #{{pedido_id}} ha sido entregado con exito por {{tienda}}. ¿Como calificarias nuestro servicio hoy?'
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
              const message = err instanceof Error ? err.message : 'Error desconocido'
              console.error('[Automation WhatsApp trigger failed]', message)
            }
          }
        }
      } catch (autErr: unknown) {
        const message = autErr instanceof Error ? autErr.message : 'Error desconocido'
        console.error('[Automation status webhook error]', message)
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
