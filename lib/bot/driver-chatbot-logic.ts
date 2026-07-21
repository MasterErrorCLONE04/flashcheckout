import { prisma } from '@/lib/prisma'
import { EvolutionClient } from '@/lib/whatsapp/evolution'
import { initiateDispatchOffer } from '@/lib/dispatch/matching-algorithm'

export async function handleDriverWhatsAppMessage(params: {
  phone: string
  text?: string
  location?: { latitude: number; longitude: number }
  instanceName?: string
}) {
  const { phone, text = '', location, instanceName = 'global' } = params
  const cleanPhone = phone.replace(/\D/g, '')
  const messageText = text.trim().toLowerCase()

  const evo = new EvolutionClient()

  // Buscar repartidor por teléfono
  let driver = await prisma.driver.findFirst({
    where: {
      OR: [{ phoneNumber: cleanPhone }, { phoneNumber: `+${cleanPhone}` }],
    },
  })

  // 1. Registro de nuevo repartidor si no existe
  if (!driver) {
    if (!text || messageText.includes('hola') || messageText.includes('registrar')) {
      await evo.sendText(
        instanceName,
        cleanPhone,
        '🛵 *Bienvenido a la Red de Repartidores Oficial de FlashCheckout*\n\nPara registrarte como repartidor oficial, por favor responde a este mensaje con tu *Nombre Completo*:'
      )
      return { status: 'REGISTER_PROMPT_SENT' }
    }

    // Guardar nombre y registrar repartidor
    driver = await prisma.driver.create({
      data: {
        name: text.trim(),
        phoneNumber: cleanPhone,
        active: true,
        available: false,
      },
    })

    await evo.sendText(
      instanceName,
      cleanPhone,
      `✅ ¡Excelente ${driver.name}! Tu registro ha sido completado.\n\nPara iniciar tu turno y comenzar a recibir carreras cerca de ti, *comparte tu ubicación actual por WhatsApp* o escribe *'Iniciar turno'* en cualquier momento.`
    )
    return { status: 'REGISTERED' }
  }

  // 2. Recepción de Ubicación GPS (Inicio o actualización de turno)
  if (location && location.latitude && location.longitude) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        currentLat: location.latitude,
        currentLng: location.longitude,
        available: true,
        lastLocationAt: new Date(),
      },
    })

    await evo.sendText(
      instanceName,
      cleanPhone,
      '🟢 *¡Turno Activado / GPS Actualizado!*\n\nTu ubicación en tiempo real se ha guardado correctamente. Te notificaremos inmediatamente cuando haya un pedido disponible cerca a tu zona.'
    )
    return { status: 'SHIFT_ACTIVATED_GPS' }
  }

  // 3. Comandos de Turno
  if (messageText.includes('iniciar turno') || messageText.includes('disponible') || messageText === 'turno') {
    await evo.sendText(
      instanceName,
      cleanPhone,
      '📍 *Por favor comparte tu Ubicación Actual por WhatsApp*\n\nUsa la opción de adjuntar de WhatsApp -> *Ubicación* -> *Enviar mi ubicación actual* para activar la asignación de pedidos en tiempo real.'
    )
    return { status: 'LOCATION_REQUESTED' }
  }

  if (messageText.includes('cerrar turno') || messageText.includes('pausa') || messageText.includes('inactivo')) {
    await prisma.driver.update({
      where: { id: driver.id },
      data: { available: false },
    })

    await evo.sendText(
      instanceName,
      cleanPhone,
      '🔴 *Turno Cerrado.*\n\nHas pausado tu disponibilidad. Escribe *\'Iniciar turno\'* o envía tu ubicación cuando desees trabajar nuevamente.'
    )
    return { status: 'SHIFT_CLOSED' }
  }

  // 4. Respuesta a Oferta de Carrera (Aceptar / Rechazar)
  const pendingOffer = await prisma.driverOffer.findFirst({
    where: {
      driverId: driver.id,
      status: 'OFFERED',
      expiresAt: { gt: new Date() },
    },
    include: {
      order: {
        include: { store: true },
      },
    },
  })

  if (pendingOffer) {
    if (messageText.includes('aceptar') || messageText.includes('si') || messageText === '1') {
      // Marcar oferta como aceptada y asignar orden
      await prisma.driverOffer.update({
        where: { id: pendingOffer.id },
        data: { status: 'ACCEPTED' },
      })

      await prisma.order.update({
        where: { id: pendingOffer.orderId },
        data: {
          driverId: driver.id,
          status: 'in_transit',
        },
      })

      await prisma.driver.update({
        where: { id: driver.id },
        data: { consecutiveMissedOffers: 0 },
      })

      const order = pendingOffer.order
      await evo.sendText(
        instanceName,
        cleanPhone,
        `✅ *¡CARRERA ASIGNADA!*\n\n` +
          `🏬 *Punto de Recogida:* ${order.store.name}\n` +
          `📍 *Dirección Recogida:* ${order.store.bio || 'Tienda oficial'}\n\n` +
          `👤 *Cliente:* ${order.customerName}\n` +
          `📍 *Dirección Entrega:* ${order.address}, ${order.city}\n` +
          `💰 *Total a cobrar:* $${order.total.toLocaleString('es-CO')}\n\n` +
          `🔒 *PIN de Entrega:* Solicita al cliente su PIN de 4 dígitos cuando le entregues el paquete y envíalo a este chat para cerrar la entrega.`
      )
      return { status: 'OFFER_ACCEPTED' }
    }

    if (messageText.includes('rechazar') || messageText.includes('no') || messageText === '2') {
      await prisma.driverOffer.update({
        where: { id: pendingOffer.id },
        data: { status: 'REJECTED' },
      })

      await evo.sendText(
        instanceName,
        cleanPhone,
        '❌ Carrera rechazada. Buscando otro pedido para ti...'
      )

      // Pasar oferta al siguiente mejor repartidor
      if (pendingOffer.order) {
        const storeLat = driver.currentLat || 0
        const storeLng = driver.currentLng || 0
        await initiateDispatchOffer(pendingOffer.orderId, storeLat, storeLng)
      }

      return { status: 'OFFER_REJECTED' }
    }
  }

  // 5. Validación de PIN de Entrega (String numérico de 4 dígitos)
  if (/^\d{4}$/.test(messageText)) {
    const activeOrder = await prisma.order.findFirst({
      where: {
        driverId: driver.id,
        status: 'in_transit',
        deliveryPin: messageText,
      },
    })

    if (activeOrder) {
      await prisma.order.update({
        where: { id: activeOrder.id },
        data: {
          status: 'delivered',
          escrowReleased: true,
        },
      })

      await prisma.driver.update({
        where: { id: driver.id },
        data: {
          ordersDelivered: { increment: 1 },
          lastOrderCompletedAt: new Date(),
        },
      })

      await evo.sendText(
        instanceName,
        cleanPhone,
        `🎉 *¡ENTREGA EXITOSA VERIFICADA!*\n\n` +
          `El pedido #${activeOrder.id.slice(-6).toUpperCase()} ha sido verificado correctamente con el PIN ${messageText}.\n` +
          `¡Excelente trabajo! 🛵💨`
      )
      return { status: 'DELIVERY_PIN_VERIFIED' }
    } else {
      await evo.sendText(
        instanceName,
        cleanPhone,
        '❌ El PIN ingresado no coincide con ningún pedido activo a tu nombre. Por favor verifica con el cliente e intenta de nuevo.'
      )
      return { status: 'DELIVERY_PIN_INVALID' }
    }
  }

  // Respuesta por defecto
  await evo.sendText(
    instanceName,
    cleanPhone,
    '👋 *Panel de Repartidor FlashCheckout*\n\n' +
      'Comandos disponibles:\n' +
      '• *Envía tu Ubicación* para activar tu turno\n' +
      '• *\'Cerrar turno\'* para pausar\n' +
      '• Ingresa el *PIN de 4 dígitos* enviado por el cliente para cerrar una entrega.'
  )

  return { status: 'HELP_SENT' }
}
