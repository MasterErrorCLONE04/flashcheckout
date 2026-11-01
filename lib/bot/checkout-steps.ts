import { prisma } from '@/lib/prisma'
import {
  emptyCartState
} from '@/lib/whatsapp/session-state'
import {
  BotClient,
  SessionRecord,
  getCartItemsForSession,
  updateWhatsAppSession,
  getBrebPaymentConfig
} from './bot-types'
import { buildBrebEmvcoPayload, DEFAULT_BREB_EMVCO_GUI, type BrebKeyType } from '@/lib/payments/breb/emvco'
import { buildBrebPaymentReference } from '@/lib/payments/breb/references'

export async function handleConfirmCheckout(
  from: string,
  session: SessionRecord,
  waClient: BotClient
) {
  const cartItems = await getCartItemsForSession(session)
  if (cartItems.length === 0) {
    await waClient.sendText(from, 'Tu carrito está vacío. 🛒 Agrega productos a tu carrito antes de solicitar el pago.')
    await updateWhatsAppSession(session.id, { step: 'IDLE' })
    return
  }

  // 1. Validar si falta el Nombre Completo
  if (!session.customerName || !session.customerName.trim() || session.customerName === 'Cliente WhatsApp') {
    await updateWhatsAppSession(session.id, { step: 'AWAITING_NAME' })
    await waClient.sendText(from, '📦 *Datos para el Despacho*\n\nPara preparar tu pedido, por favor escribe tu *Nombre Completo*: 📝')
    return
  }

  // 2. Validar si falta la Dirección de Entrega
  if (!session.address || !session.address.trim() || session.address === 'WhatsApp') {
    await updateWhatsAppSession(session.id, { step: 'AWAITING_ADDRESS' })
    await waClient.sendText(from, `¡Mucho gusto, *${session.customerName}*! 📍\n\nPor favor escribe tu *Dirección de Entrega y Ciudad* (o comparte tu ubicación por este chat):`)
    return
  }

  // 3. Liquidación con costo de envío transparente
  const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0)
  const store = session.storeId && session.storeId !== 'global'
    ? await prisma.store.findUnique({ where: { id: session.storeId } })
    : null
  const deliveryCost = Number((store?.settings as Record<string, unknown> | null)?.deliveryCost ?? 5000)
  const total = subtotal + deliveryCost

  let summary = '*RESUMEN DE TU PEDIDO:* 🛒\n\n'
  cartItems.forEach(item => {
    summary += `• ${item.name} x${item.qty}: *$${(item.price * item.qty).toLocaleString('es-CO')}*\n`
  })
  summary += `\n📦 *Subtotal:* $${subtotal.toLocaleString('es-CO')} COP`
  summary += `\n🚚 *Envío:* $${deliveryCost.toLocaleString('es-CO')} COP`
  summary += `\n💰 *TOTAL A PAGAR: $${total.toLocaleString('es-CO')} COP*`
  summary += `\n\n👤 *Destinatario:* ${session.customerName}`
  summary += `\n📍 *Entrega en:* ${session.address}`

  // 4. Determinar métodos de pago disponibles
  const storeSettings = store?.settings as Record<string, unknown> | null
  const brebConfig = getBrebPaymentConfig(null, storeSettings)
  const storeBrebKey = brebConfig?.keyValue
  const storeBrebEnabled = brebConfig?.enabled
  const canUseBreb = Boolean(storeBrebKey && storeBrebEnabled)

  const paymentButtons = []
  if (canUseBreb) {
    paymentButtons.push({ id: 'btn_pay_breb', title: '💳 Pagar con Bre-B' })
  }
  paymentButtons.push({ id: 'btn_pay_cod', title: '💵 Contra Entrega' })
  paymentButtons.push({ id: 'btn_pay_link', title: '🔗 Pagar en Línea' })

  await updateWhatsAppSession(session.id, { step: 'AWAITING_PAYMENT_SELECTION' })
  await waClient.sendButtons(from, `${summary}\n\n¿Cómo prefieres pagar tu pedido? Elige una opción abajo:`, paymentButtons)
}

export async function handleAwaitingPaymentSelection(
  from: string,
  text: string,
  session: SessionRecord,
  waClient: BotClient
) {
  if (text === 'btn_pay_breb') {
    await updateWhatsAppSession(session.id, { step: 'AWAITING_BREB_KEY' })
    await waClient.sendText(from, "📱 *Pago con Bre-B*\n\nPor favor, escribe tu **número de celular o llave Bre-B** para enviarle la solicitud de cobro directo a tu banco:")
  } else if (text === 'btn_pay_cod') {
    const items = await getCartItemsForSession(session)
    if (items.length === 0) {
      await waClient.sendText(from, 'Tu carrito está vacío. 🛒')
      await updateWhatsAppSession(session.id, { step: 'IDLE' })
      return
    }

    const storeId = session.storeId || items[0]?.storeId || 'global'
    const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0)
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    const deliveryCost = Number((store?.settings as Record<string, unknown> | null)?.deliveryCost ?? 5000)
    const total = subtotal + deliveryCost

    const order = await prisma.order.create({
      data: {
        customerName: session.customerName || 'Cliente WhatsApp',
        customerPhone: from,
        customerWhatsAppId: from,
        address: session.address || 'Dirección por confirmar',
        city: 'Colombia',
        items: items as unknown as object,
        total: total,
        storeId: storeId,
        source: 'WHATSAPP',
        status: 'pending_delivery',
        paymentStatus: 'CASH_ON_DELIVERY',
        deliveryRequested: true
      }
    })

    await updateWhatsAppSession(session.id, {
      step: 'IDLE',
      cart: emptyCartState()
    })

    await waClient.sendText(
      from,
      `🎉 *¡Pedido Confirmado con Éxito!*\n\n` +
      `• *Número de Pedido:* #${order.id.slice(-6).toUpperCase()}\n` +
      `• *Total a pagar al recibir:* $${total.toLocaleString('es-CO')} COP en efectivo\n` +
      `• *Dirección:* ${order.address}\n` +
      `• *Destinatario:* ${order.customerName}\n\n` +
      `El vendedor ya fue notificado y preparará tu envío. Te avisaremos cuando vaya en camino. 🛵`
    )

    if (store?.whatsapp) {
      await waClient.sendButtons(
        store.whatsapp,
        `📦 *¡Nuevo Pedido Contra Entrega!* 🛵\n\n` +
        `• *Pedido:* #${order.id.slice(-6).toUpperCase()}\n` +
        `• *Cliente:* ${order.customerName} (${from})\n` +
        `• *Dirección:* ${order.address}\n` +
        `• *Total a cobrar:* $${total.toLocaleString('es-CO')} COP\n\n` +
        `¿Deseas solicitar un repartidor de la red para despachar este pedido?`,
        [
          { id: `delivery_yes_${order.id}`, title: '🏍️ Solicitar Domicilio' },
          { id: `delivery_no_${order.id}`, title: '📦 Enviar por mi cuenta' }
        ]
      )
    }
  } else if (text === 'btn_pay_link') {
    const items = await getCartItemsForSession(session)
    if (items.length === 0) {
      await waClient.sendText(from, 'Tu carrito está vacío. 🛒')
      await updateWhatsAppSession(session.id, { step: 'IDLE' })
      return
    }

    const storeId = session.storeId || items[0]?.storeId || 'global'
    const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0)
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    const deliveryCost = Number((store?.settings as Record<string, unknown> | null)?.deliveryCost ?? 5000)
    const total = subtotal + deliveryCost

    const order = await prisma.order.create({
      data: {
        customerName: session.customerName || 'Cliente WhatsApp',
        customerPhone: from,
        customerWhatsAppId: from,
        address: session.address || 'Dirección por confirmar',
        city: 'Colombia',
        items: items as unknown as object,
        total: total,
        storeId: storeId,
        source: 'WHATSAPP',
        status: 'pending_payment',
        paymentStatus: 'PENDING'
      }
    })

    await updateWhatsAppSession(session.id, {
      step: 'IDLE',
      cart: emptyCartState()
    })

    const payUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${order.id}`

    await waClient.sendText(
      from,
      `💳 *Enlace de Pago Seguro Generado*\n\n` +
      `• *Pedido:* #${order.id.slice(-6).toUpperCase()}\n` +
      `• *Total:* $${total.toLocaleString('es-CO')} COP\n` +
      `• *Entrega en:* ${order.address}\n\n` +
      `Haz clic en el enlace para pagar con Tarjeta de Crédito, Débito, PSE o tu método favorito:\n` +
      `🔗 ${payUrl}\n\n` +
      `_En cuanto completes el pago, tu orden será procesada automáticamente._`
    )
  } else if (text === 'cancel') {
    await updateWhatsAppSession(session.id, { step: 'IDLE' })
    await waClient.sendText(from, 'Pedido cancelado. Tu carrito se mantiene intacto. ❌')
  } else {
    await waClient.sendText(from, 'Por favor, selecciona una opción válida usando los botones de abajo.')
  }
}

export async function handleAwaitingBrebKey(
  from: string,
  text: string,
  session: SessionRecord,
  waClient: BotClient
) {
  const payerKey = text.trim().replace(/\D/g, '')
  const isValidKey = payerKey.length >= 10

  if (isValidKey) {
    const items = await getCartItemsForSession(session)
    if (items.length === 0) {
      await waClient.sendText(from, 'Tu carrito está vacío. 🛒')
      await updateWhatsAppSession(session.id, { step: 'IDLE' })
      return
    }

    const storeId = session.storeId || items[0]?.storeId || 'global'
    const subtotal = items.reduce((s, i) => s + (i.price * i.qty), 0)

    const store = await prisma.store.findUnique({
      where: { id: storeId }
    })

    const deliveryCost = Number((store?.settings as Record<string, unknown> | null)?.deliveryCost ?? 5000)
    const total = subtotal + deliveryCost

    const storeSettings = store?.settings as Record<string, unknown> | null
    const brebConfig = getBrebPaymentConfig(null, storeSettings)
    const storeBrebKey = brebConfig?.keyValue
    const storeBrebEnabled = brebConfig?.enabled

    if (!store || !storeBrebKey || !storeBrebEnabled) {
      await waClient.sendText(from, 'Lo sentimos, este comercio no tiene configurada o activa la llave Bre-B para recibir pagos en este momento. 😕')
      await updateWhatsAppSession(session.id, { step: 'IDLE' })
      return
    }

    try {
      await waClient.sendText(from, 'Iniciando cobro digital por Bre-B... ⏳')

      const order = await prisma.order.create({
        data: {
          customerName: session.customerName || 'Cliente WhatsApp',
          customerPhone: from,
          customerWhatsAppId: from,
          address: session.address || 'WhatsApp',
          city: 'Colombia',
          items: items as unknown as object,
          total: total,
          storeId: storeId,
          source: 'WHATSAPP',
          paymentStatus: 'PENDING'
        }
      })

      const { createDruoPayment } = await import('@/lib/druo')
      await createDruoPayment({
        amount: total,
        orderId: order.id,
        payerKey: payerKey,
        sellerKey: storeBrebKey
      })

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAYMENT_REQUESTED'
        }
      })

      await updateWhatsAppSession(session.id, {
        step: 'IDLE',
        cart: emptyCartState()
      })

      await waClient.sendText(from, 
        `🚀 *¡Solicitud enviada a tu banco!*\n\n` +
        `Por favor, abre la app de tu banco (**Nequi, Daviplata, Bancolombia, Davivienda, etc.**), busca las notificaciones de pago pendientes de Bre-B y **autoriza el cobro por $${total.toLocaleString('es-CO')} COP**.\n\n` +
        `_Te confirmaremos por este chat en cuanto se complete la transferencia._`
      )

    } catch (payErr) {
      console.error('[DRUO Payment Error]', payErr)
      
      try {
        const pendingOrder = await prisma.order.findFirst({
          where: { customerPhone: from, paymentStatus: 'PENDING' },
          orderBy: { createdAt: 'desc' }
        })
        if (pendingOrder) {
          await prisma.order.update({
            where: { id: pendingOrder.id },
            data: { paymentStatus: 'FAILED' }
          })
        }
      } catch (dbErr) {
        console.error('[DB Order Update Error in Catch]', dbErr)
      }

      await waClient.sendText(
        from,
        '⚠️ Hubo un error al iniciar la solicitud de cobro con DRUO (es posible que el número ingresado no esté registrado en Bre-B o el sistema bancario presente intermitencias).\n\n' +
        'Por favor, *escribe tu número de celular nuevamente* para volver a intentarlo, o escribe *cancelar* si deseas abortar la compra.'
      )
    }
  } else {
    await waClient.sendText(from, '⚠️ El número ingresado no es válido. Por favor, ingresa una llave Bre-B (número de celular) de al menos 10 dígitos:')
  }
}

export async function handleAwaitingConfirmation(
  from: string,
  session: SessionRecord,
  waClient: BotClient
) {
  const items = await getCartItemsForSession(session)
  
  if (items.length > 0) {
    const storeId = session.storeId || items[0]?.storeId || 'global'
    const total = items.reduce((s, i) => s + (i.price * i.qty), 0)
    
    let orderSummary = `*REVISIÓN DE TU PEDIDO* 📋\n\n`
    orderSummary += `👤 *Cliente:* ${session.customerName}\n`
    orderSummary += `📍 *Dirección:* ${session.address}\n\n`
    orderSummary += `*Artículos:*\n`
    items.forEach(i => {
      orderSummary += `- ${i.name} x${i.qty} ($${(i.price * i.qty).toLocaleString()})\n`
    })
    orderSummary += `\n*TOTAL A PAGAR: $${total.toLocaleString('es-CO')}*`

    const order = await prisma.order.create({
      data: {
        customerName: session.customerName || 'Cliente WhatsApp',
        customerPhone: from,
        customerWhatsAppId: from,
        address: session.address || 'WhatsApp',
        city: 'Colombia',
        items: items as unknown as object,
        total: total,
        storeId: storeId,
        source: 'WHATSAPP',
      },
    })

    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId }
      })
      const bankDetails = store?.whatsapp ? `Nequi o Daviplata al celular ${store.whatsapp}` : '[Datos Cuenta]'
      const storeSettings = store?.settings as Record<string, unknown> | null
      const brebConfig = getBrebPaymentConfig(null, storeSettings)
      const shouldUseBreb = Boolean(brebConfig?.enabled && brebConfig.keyValue && brebConfig.participantId)
      
      let mpPreferenceId: string | null = null

      if (store && store.mpConnected && !shouldUseBreb) {
        const tokenToUse = store.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN
        if (tokenToUse) {
          try {
            const { MercadoPagoConfig, Preference } = await import('mercadopago')
            const dynamicMpClient = new MercadoPagoConfig({
              accessToken: tokenToUse,
              options: { timeout: 10000 },
            })
            const dynamicMpPreference = new Preference(dynamicMpClient)
            const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'

            const preferenceData = {
              body: {
                items: items.map(line => ({
                  id: line.id,
                  title: `${line.name} (x${line.qty})`,
                  quantity: line.qty,
                  unit_price: line.price,
                  currency_id: 'COP',
                })),
                external_reference: order.id,
                back_urls: {
                  success: `${base}/tienda/${store.slug}/exito`,
                  failure: `${base}/tienda/${store.slug}`,
                  pending: `${base}/tienda/${store.slug}`,
                },
                metadata: {
                  orderId: order.id,
                  storeId: store.id,
                },
                notification_url: base.startsWith('https') ? `${base}/api/webhook/mp` : undefined,
                auto_return: base.startsWith('https') ? ('approved' as const) : undefined
              },
            }

            const preference = await dynamicMpPreference.create(preferenceData)
            if (preference.id) {
              mpPreferenceId = preference.id
              await prisma.order.update({
                where: { id: order.id },
                data: { mpPreferenceId: preference.id }
              })
            }
          } catch (mpErr) {
            console.error('[chatbot-logic] Failed to create Mercado Pago preference:', mpErr)
          }
        }
      }

      const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
      const smartPayUrl = `${baseAppUrl}/pay/${order.id}`

      if (shouldUseBreb) {
        const keyType = ((brebConfig as Record<string, unknown>)?.keyType || 'PHONE') as BrebKeyType
        const reference = buildBrebPaymentReference(order.id)
        const gui = process.env.BREB_EMVCO_GUI?.trim() || DEFAULT_BREB_EMVCO_GUI
        const emvPayload = buildBrebEmvcoPayload({
          merchantName: (brebConfig as Record<string, unknown>)?.merchantDisplayName as string || store?.name || 'Tienda',
          amount: total,
          reference,
          merchantCity: order.city || 'BOGOTA',
          merchantAccount: {
            gui,
            participantId: brebConfig!.participantId!,
            keyType,
            keyValue: brebConfig!.keyValue!,
            keyTypeCode: (brebConfig as Record<string, unknown>)?.keyTypeCode as string || undefined,
          },
        })

        const qrImageToSend = `${baseAppUrl}/api/qr?text=${encodeURIComponent(emvPayload)}`

        const brebCaption = `${orderSummary}\n\n` +
          `🏦 *PAGO MEDIANTE BRE-B / INTEROPERABLE*\n` +
          `1️⃣ Escanea este código QR desde tu app bancaria (Nequi, Daviplata, Bancolombia, etc.) o usa los datos:\n` +
          `   • *Llave:* ${brebConfig?.keyValue}\n` +
          `   • *Referencia:* ${reference}\n` +
          `   • *Valor exacto:* $${total.toLocaleString('es-CO')} COP\n\n` +
          `2️⃣ Transfiere y *envía la captura del comprobante por este chat* 📸.\n\n` +
          `🔗 Portal web alternativo:\n${smartPayUrl}`

        try {
          await waClient.sendImage(from, qrImageToSend, brebCaption)
        } catch (imgErr) {
          console.error('[chatbot-logic] Error enviando imagen QR Bre-B, fallback a botón:', imgErr)
          await waClient.sendUrlButton(
            from,
            brebCaption,
            'Pagar por Bre-B',
            smartPayUrl
          )
        }
      } else if (store && store.mpConnected && mpPreferenceId) {
        await waClient.sendUrlButton(
          from,
          `${orderSummary}\n\nHe generado tu orden de cobro de forma segura. Presiona el botón de abajo para pagar en línea desde tu celular o escanear el código QR:`,
          '💳 Pagar Seguro',
          smartPayUrl
        )
      } else {
        await waClient.sendText(
          from,
          `${orderSummary}\n\nPor favor, realiza la transferencia a los datos de la tienda:\n• *${bankDetails}*\n\nUna vez realizada la transferencia, envía la foto o captura del comprobante por este chat.`
        )
        
        await waClient.sendUrlButton(
          from,
          `También puedes ver el desglose de tu pedido y subir tu captura en nuestro portal de cobros:`,
          '📋 Ver Pedido',
          smartPayUrl
        )
      }

      await updateWhatsAppSession(session.id, {
        step: 'AWAITING_CONFIRMATION',
        cart: emptyCartState(),
        customerName: null,
        address: null
      })
    } catch (err) {
      console.error('[Chatbot checkout finalize error]', err)
      await waClient.sendText(from, 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.')
    }
  } else {
    await waClient.sendText(from, 'Tu carrito está vacío. 🛒 Agrega productos a tu carrito antes de solicitar el pago.')
    await updateWhatsAppSession(session.id, {
      step: 'IDLE',
      customerName: null,
      address: null
    })
  }
}
