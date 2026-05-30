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

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el pedido' },
      { status: 500 }
    )
  }
}
