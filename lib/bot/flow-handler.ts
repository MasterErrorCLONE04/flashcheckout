import { prisma } from '@/lib/prisma'
import {
  buildCartState,
  cartStateToLines,
  type CartLine,
  type CartState
} from '@/lib/whatsapp/session-state'
import { BotClient, SessionRecord, updateWhatsAppSession } from './bot-types'

export async function handleFlowResponse(
  from: string,
  text: string,
  session: SessionRecord,
  waClient: BotClient,
  onConfirmCheckout: (session: SessionRecord) => Promise<void>,
  onViewCartSummary: (session: SessionRecord) => Promise<void>
): Promise<boolean> {
  if (!text.startsWith('flow_response_')) {
    return false
  }

  const jsonStr = text.replace('flow_response_', '')
  try {
    const response = JSON.parse(jsonStr)
    const selections: (string | { id?: string; qty?: number })[] = Array.isArray(response.selections)
      ? response.selections
      : Array.isArray(response.items)
      ? response.items
      : Array.isArray(response.products)
      ? response.products
      : []

    if (selections.length > 0) {
      const currentCart: CartState = buildCartState(cartStateToLines(session.cart))
      const addedItems: string[] = []

      for (const itemOrId of selections) {
        const prodId = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id
        const qty = typeof itemOrId === 'object' && itemOrId?.qty ? Number(itemOrId.qty) : 1

        if (!prodId) continue
        const product = await prisma.product.findUnique({ where: { id: prodId } })
        if (product) {
          currentCart.items[product.id] = {
            id: product.id,
            name: product.name,
            price: product.price,
            qty: (currentCart.items[product.id]?.qty || 0) + (qty > 0 ? qty : 1),
            storeId: product.storeId
          }
          addedItems.push(`${product.name} (x${qty > 0 ? qty : 1})`)
        }
      }

      const firstItem = Object.values(currentCart.items)[0] as CartLine | undefined
      const primaryStoreId = addedItems.length > 0 ? firstItem?.storeId : undefined
      const newStoreId = session.storeId && session.storeId !== 'global' ? session.storeId : (primaryStoreId || session.storeId)

      const fullName = (typeof response.full_name === 'string' && response.full_name.trim())
        ? response.full_name.trim()
        : (typeof response.customer_name === 'string' ? response.customer_name.trim() : null)
      const address = (typeof response.address === 'string' && response.address.trim())
        ? `${response.address.trim()}${response.city ? `, ${response.city.trim()}` : ''}`
        : null

      const updateData: Record<string, unknown> = {
        cart: currentCart,
        step: 'IDLE'
      }
      if (fullName) updateData.customerName = fullName
      if (address) updateData.address = address

      let targetSession = session
      if (newStoreId && newStoreId !== session.storeId) {
        updateData.storeId = newStoreId
        const existingSession = await prisma.whatsAppSession.findUnique({
          where: {
            phoneNumber_storeId: {
              phoneNumber: from,
              storeId: newStoreId
            }
          }
        })

        if (existingSession) {
          targetSession = await updateWhatsAppSession(existingSession.id, updateData)
        } else {
          targetSession = await updateWhatsAppSession(session.id, updateData)
        }
      } else {
        targetSession = await updateWhatsAppSession(session.id, updateData)
      }

      await waClient.sendText(
        from,
        `✅ ¡Listo! Se agregaron *${addedItems.length} producto(s)* a tu carrito desde el Catálogo:\n${addedItems.map(i => `• ${i}`).join('\n')}`
      )

      if (fullName && address) {
        await onConfirmCheckout(targetSession)
      } else {
        await onViewCartSummary(targetSession)
      }
      return true
    } else {
      await waClient.sendText(from, 'No seleccionaste ningún producto del catálogo. ¿Deseas volver a revisarlo?')
      return true
    }
  } catch (e) {
    console.error('[Flow Response Error]', e)
    await waClient.sendText(from, 'Hubo un inconveniente al procesar tu selección del catálogo. Por favor intenta nuevamente.')
    return true
  }
}

export async function handleDeliveryActions(
  from: string,
  text: string,
  waClient: BotClient
): Promise<boolean> {
  // Manejo de SOLICITUD DE DOMICILIO POR PARTE DEL VENDEDOR
  if (text.startsWith('delivery_yes_')) {
    const orderId = text.replace('delivery_yes_', '')
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true }
      })

      if (!order) {
        await waClient.sendText(from, 'Lo siento, no encontramos este pedido. 😕')
        return true
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryRequested: true }
      })

      const drivers = await prisma.driver.findMany({
        where: { active: true, available: true }
      })

      if (drivers.length > 0) {
        for (const driver of drivers) {
          try {
            await waClient.sendButtons(
              driver.phoneNumber,
              `🚚 *NUEVO DOMICILIO DISPONIBLE* 📦\n\n• *Tienda:* ${order.store.name}\n• *Dirección entrega:* ${order.address}, ${order.city}\n• *Valor envío:* $5.000 COP\n• *Valor pedido:* $${order.total.toLocaleString('es-CO')}\n• *Contacto Tienda:* wa.me/${order.store.whatsapp}\n\n¿Deseas tomar este domicilio?`,
              [
                { id: `accept_delivery_${order.id}`, title: '🏍️ Aceptar Domicilio' }
              ]
            )
          } catch (driverErr) {
            console.error(`Error al notificar al repartidor ${driver.phoneNumber}:`, driverErr)
          }
        }
        await waClient.sendText(from, `¡Excelente! Has solicitado nuestro servicio de domicilio para el pedido *#${orderId.slice(-6).toUpperCase()}*. 🚚\n\nHemos notificado a los repartidores disponibles. Te avisaremos inmediatamente cuando uno de ellos lo acepte.`)
      } else {
        await waClient.sendText(from, `¡Excelente! Has solicitado nuestro servicio de domicilio para el pedido *#${orderId.slice(-6).toUpperCase()}*. 🚚\n\nEn este momento no tenemos repartidores disponibles en la zona. Intentaremos buscar uno en los próximos minutos o te sugerimos gestionar el despacho por tu cuenta.`)
      }
    } catch (err) {
      console.error('[Delivery Yes Error]', err)
    }
    return true
  }

  if (text.startsWith('delivery_no_')) {
    const orderId = text.replace('delivery_no_', '')
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryRequested: false }
      })
      await waClient.sendText(from, `Entendido. Te encargarás del envío por tu cuenta para el pedido *#${orderId.slice(-6).toUpperCase()}*. No se te descontará nada de la orden.`)
    } catch (err) {
      console.error('[Delivery No Error]', err)
    }
    return true
  }

  // Manejo de ACEPTAR DOMICILIO POR PARTE DEL REPARTIDOR
  if (text.startsWith('accept_delivery_')) {
    const orderId = text.replace('accept_delivery_', '')
    try {
      const driver = await prisma.driver.findUnique({
        where: { phoneNumber: from, active: true }
      })

      if (!driver) {
        await waClient.sendText(from, 'Lo siento, no estás registrado como un repartidor oficial activo. 🚫')
        return true
      }

      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { store: true }
        })

        if (!order) {
          throw new Error('ORDER_NOT_FOUND')
        }

        if (order.driverId) {
          return { success: false, reason: 'TAKEN', driverId: order.driverId }
        }

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            driverId: driver.id,
            status: 'shipped'
          },
          include: { store: true }
        })

        return { success: true, order: updatedOrder }
      })

      if (result.success) {
        const order = result.order!
        await waClient.sendText(
          from,
          `¡Confirmado! 🏍️ Se te ha asignado el domicilio del pedido *#${orderId.slice(-6).toUpperCase()}*.\n\n• *Tienda:* ${order.store.name} (wa.me/${order.store.whatsapp})\n• *Cliente:* ${order.customerName}\n• *Dirección:* ${order.address}, ${order.city}\n• *Total pedido:* $${order.total.toLocaleString('es-CO')}\n\nPor favor, dirígete a la tienda a recoger el producto.`
        )

        if (order.store.whatsapp) {
          await waClient.sendText(
            order.store.whatsapp,
            `🏍️ *Domicilio Asignado:* El repartidor *${driver.name}* (${driver.phoneNumber}) ha aceptado tu solicitud de entrega para el pedido *#${orderId.slice(-6).toUpperCase()}* y va en camino a tu local.`
          )
        }
      } else {
        if (result.reason === 'TAKEN') {
          await waClient.sendText(from, 'Lo siento, este domicilio ya fue tomado por otro repartidor. 🏁')
        }
      }
    } catch (err) {
      console.error('[Accept Delivery Error]', err)
      await waClient.sendText(from, 'Hubo un error al procesar la aceptación. Inténtalo de nuevo.')
    }
    return true
  }

  return false
}
