import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const body = await req.json()
    const { status, deliveryRequested } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (deliveryRequested !== undefined) updateData.deliveryRequested = deliveryRequested

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { driver: true, store: true },
    })

    // Si el vendedor solicitó despacho mediante repartidores propios de la plataforma
    if (deliveryRequested === true) {
      try {
        // Buscar repartidores activos y disponibles
        const drivers = await prisma.driver.findMany({
          where: { active: true, available: true }
        })

        if (drivers.length > 0) {
          // Notificar a cada repartidor vía WhatsApp
          for (const driver of drivers) {
            try {
              await waClient.sendButtons(
                driver.phoneNumber,
                `🚚 *NUEVO DOMICILIO DISPONIBLE* 📦\n\n• *Tienda:* ${updatedOrder.store.name}\n• *Dirección entrega:* ${updatedOrder.address}, ${updatedOrder.city}\n• *Valor envío:* $5.000 COP\n• *Valor pedido:* $${updatedOrder.total.toLocaleString('es-CO')}\n• *Contacto Tienda:* wa.me/${updatedOrder.store.whatsapp}\n\n¿Deseas tomar este domicilio?`,
                [
                  { id: `accept_delivery_${updatedOrder.id}`, title: '🏍️ Aceptar Domicilio' }
                ]
              )
            } catch (driverErr: any) {
              console.error(`Error al notificar al repartidor ${driver.phoneNumber}:`, driverErr.message)
            }
          }
        }
      } catch (deliveryErr: any) {
        console.error('[Delivery Broadcast Web Error]', deliveryErr)
      }
    }
    // Triggers de Automatizaciones de Pedidos al cambiar estado
    if (status !== undefined) {
      try {
        let automationName = ""
        let defaultMsg = ""
        
        if (status === 'confirmed' || status === 'shipped') {
          automationName = "Pedido listo para retiro / envío"
          defaultMsg = `¡Hola {{cliente}}! 👋 Tu pedido #{{pedido_id}} en {{tienda}} está listo para ser enviado o retirado. Valor total: \${{total}}. ¡Gracias por tu compra!`
        } else if (status === 'delivered') {
          automationName = "Calificar servicio"
          defaultMsg = `¡Hola {{cliente}}! 👋 Tu pedido #{{pedido_id}} ha sido entregado con éxito por {{tienda}}. ¿Cómo calificarías nuestro servicio hoy? ⭐⭐⭐⭐⭐`
        }

        if (automationName) {
          const aut = await prisma.automation.findFirst({
            where: {
              storeId: updatedOrder.storeId,
              name: { equals: automationName, mode: 'insensitive' },
              active: true
            }
          }) as any

          const recipient = updatedOrder.customerPhone || updatedOrder.customerWhatsAppId
          if (aut && recipient) {
            const template = (aut as any).customTemplate || defaultMsg
            const formattedMsg = template
              .replace(/{{cliente}}/g, updatedOrder.customerName || 'Cliente')
              .replace(/{{pedido_id}}/g, updatedOrder.id.slice(-6).toUpperCase())
              .replace(/{{total}}/g, updatedOrder.total.toLocaleString('es-CO'))
              .replace(/{{tienda}}/g, updatedOrder.store.name)

            let clientToUse: any = waClient
            const store = updatedOrder.store
            if (store && store.whatsappInstanceName && store.whatsappConnected) {
              const { evolutionClient } = await import('@/lib/whatsapp/evolution')
              clientToUse = {
                sendText: (to: string, msg: string) => evolutionClient.sendText(store.whatsappInstanceName!, to, msg)
              }
            }

            try {
              await clientToUse.sendText(recipient, formattedMsg)
              await prisma.automation.update({
                where: { id: aut.id },
                data: { sentToday: { increment: 1 } }
              })
            } catch (err: any) {
              console.error(`[Automation WhatsApp trigger failed]`, err.message)
            }
          }
        }
      } catch (autErr: any) {
        console.error('[Automation status webhook error]', autErr.message)
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
}
