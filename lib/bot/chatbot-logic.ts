import { prisma } from '@/lib/prisma'
import {
  buildCartState,
  cartStateToLines,
  emptyCartState,
  type CartState
} from '@/lib/whatsapp/session-state'
import { parseIntent } from './intent-engine'
import { searchGlobalProducts } from './search-service'
import {
  SessionRecord,
  StoreRecord,
  ensureWhatsAppSession,
  getCartItemsForSession,
  updateWhatsAppSession
} from './bot-types'
import { createLoggedBotClient } from './bot-client'
import { shouldIgnorePersonalMessage } from './bot-guards'
import { dispatchStoreCatalog } from './catalog-dispatcher'
import { handleFlowResponse, handleDeliveryActions } from './flow-handler'
import {
  handleConfirmCheckout,
  handleAwaitingPaymentSelection,
  handleAwaitingBrebKey,
  handleAwaitingConfirmation
} from './checkout-steps'

export { dispatchStoreCatalog } from './catalog-dispatcher'
export { handleWhatsAppImage } from './media-handler'

export async function handleWhatsAppMessage(
  from: string,
  text: string,
  sessionOrStoreId: SessionRecord | string = 'global'
) {
  // 1. Obtener o crear sesión usando el índice compuesto
  let session: SessionRecord
  if (typeof sessionOrStoreId === 'object' && sessionOrStoreId !== null) {
    session = sessionOrStoreId
  } else {
    const storeId = sessionOrStoreId || 'global'
    session = await ensureWhatsAppSession(from, storeId, storeId === 'global' ? 'global' : `store_${storeId}`)
  }

  // 1.5 Resolver tienda y cliente de envío dinámico con logging
  let store: StoreRecord | null = null
  if (session.storeId && session.storeId !== 'global') {
    store = await prisma.store.findUnique({
      where: { id: session.storeId }
    })
  }
  const waClient = await createLoggedBotClient(session, store)

  // 2. Filtro de seguridad para cuentas personales y heurística de negocio
  if (await shouldIgnorePersonalMessage(from, text, session)) {
    return
  }

  const intent = await parseIntent(text)

  // 3. Verificar si la tienda de la sesión está activa
  if (session.storeId && session.storeId !== 'global' && store && !store.active) {
    const resetStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId
    session = await updateWhatsAppSession(session.id, {
      storeId: resetStoreId,
      cart: emptyCartState(),
    })
    await waClient.sendText(from, 'Lo siento, esta tienda se encuentra temporalmente inactiva o fuera de servicio. 😕')
    return
  }

  // 4. Comandos Globales de navegación
  const isViewStores = text === 'view_stores' || 
                       text.toLowerCase().includes('ver tiendas') || 
                       text.toLowerCase().includes('tiendas')
  const isViewCart = text.toLowerCase().includes('ver carrito') || text === 'view_cart'

  if (isViewStores) {
    const stores = await prisma.store.findMany({ where: { active: true }, take: 10 })
    if (stores.length > 0) {
      await waClient.sendList(
        from,
        'Tiendas Cercanas',
        'Selecciona una tienda para ver sus productos:',
        'Ver tiendas',
        [
          {
            title: 'Negocios Disponibles',
            rows: stores.map(s => ({
              id: `store_${s.id}`,
              title: s.name,
              description: s.category || 'Tienda asociada'
            })),
          },
        ]
      )
      await updateWhatsAppSession(session.id, { step: 'AWAITING_STORE_SELECTION' })
      return
    }
  }

  if (text.toLowerCase().includes('inicio') || text.toLowerCase().includes('hola') || text === 'search_now') {
    const resetStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId
    await updateWhatsAppSession(session.id, { step: 'IDLE', storeId: resetStoreId })
    if (text === 'search_now') {
      await waClient.sendText(from, '¡Claro! Dime qué buscas (ej: "Pizza", "Zapatos").')
    } else {
      await handleWhatsAppMessage(from, 'reset_welcome', session)
    }
    return
  }
  
  if (text === 'reset_welcome') {
    session.step = 'START'
  }

  if (intent.intent === 'EXIT') {
    await waClient.sendText(from, '¡De nada! Ha sido un placer ayudarte. 😊\n\nSi necesitas algo más en el futuro, solo escribe "Hola". ¡Que tengas un gran día! 👋')
    const exitStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId
    await updateWhatsAppSession(session.id, {
      step: 'START',
      storeId: exitStoreId,
      cart: emptyCartState(),
      customerName: null,
      address: null
    })
    return
  }

  // 5. Manejo de WhatsApp Flows
  const handledFlow = await handleFlowResponse(
    from,
    text,
    session,
    waClient,
    async (targetSession) => { await handleConfirmCheckout(from, targetSession, waClient) },
    async (targetSession) => { await handleWhatsAppMessage(from, 'view_cart_summary', targetSession) }
  )
  if (handledFlow) return

  // 6. Manejo de domicilios de repartidores
  const handledDelivery = await handleDeliveryActions(from, text, waClient)
  if (handledDelivery) return

  // 7. Acciones directas de Catálogo y Pedidos
  if (text.startsWith('view_list_') || text.startsWith('view_catalog_') || text === 'view_catalog') {
    let storeId = text.startsWith('view_list_') 
      ? text.replace('view_list_', '')
      : text.startsWith('view_catalog_')
      ? text.replace('view_catalog_', '')
      : session.storeId

    if (!storeId || storeId === 'global') {
      const firstStore = await prisma.store.findFirst({ where: { active: true } })
      storeId = firstStore?.id || ''
    }

    const targetStore = await prisma.store.findUnique({
      where: { id: storeId, active: true }
    })

    if (targetStore) {
      await dispatchStoreCatalog(from, targetStore, waClient, session)
    } else {
      await waClient.sendText(from, 'No se encontró la tienda seleccionada. Por favor escribe "Hola" para ver las tiendas disponibles.')
    }
    return
  }

  if (text.startsWith('cta_link_')) {
    await waClient.sendText(from, '¡Excelente elección! 📱\n\nHaz clic en el enlace de arriba ☝️ para abrir el catálogo visual y gestionar tu carrito de forma más rápida.')
    return
  }

  if (text.startsWith('confirm_pay_')) {
    const orderId = text.replace('confirm_pay_', '')
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (order) {
      await waClient.sendText(from, `¡Excelente! He recibido tu confirmación para el pedido *#${orderId.slice(-5)}*. 💳\n\nEn breve te contactará un asesor para finalizar el despacho.`)
    }
    return
  }

  if (text.startsWith('cancel_order_')) {
    const orderId = text.replace('cancel_order_', '')
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED' }
    })
    await waClient.sendText(from, 'Entendido. He cancelado el pedido. 🗑️\n\nSi necesitas algo más, solo dime.')
    return
  }

  // 8. Manejo de selección y cantidades de productos
  if (text.startsWith('select_')) {
    const productId = text.replace('select_', '')
    const p = await prisma.product.findUnique({ 
      where: { id: productId, active: true }, 
    })

    if (p) {
      await waClient.sendList(
        from,
        'Selecciona Cantidad',
        `¿Cuántas unidades de *${p.name}* deseas añadir al carrito?`,
        'Elegir cantidad',
        [
          {
            title: 'Cantidades',
            rows: [1, 2, 3, 4, 5].map(n => ({
              id: `qty_${p.id}_${n}`,
              title: `${n} unidad${n > 1 ? 'es' : ''}`,
            })),
          },
        ]
      )
      await updateWhatsAppSession(session.id, { step: 'AWAITING_QUANTITY' })
    } else {
      await waClient.sendText(from, 'Lo siento, este producto ya no está disponible. 😕')
    }
    return
  }

  if (text.startsWith('qty_')) {
    const parts = text.split('_')
    const productId = parts[1]
    const qty = parseInt(parts[2])
    const p = await prisma.product.findUnique({ where: { id: productId } })

    if (p) {
      const currentCart: CartState = buildCartState(cartStateToLines(session.cart))
      currentCart.items[p.id] = {
        id: p.id,
        name: p.name,
        price: p.price,
        qty: (currentCart.items[p.id]?.qty || 0) + qty
      }

      session = await updateWhatsAppSession(session.id, { cart: currentCart, step: 'IDLE' })
      return await handleWhatsAppMessage(from, 'view_cart_summary', session)
    }
    return
  }

  if (text === 'view_cart_summary' || isViewCart) {
    const items = await getCartItemsForSession(session)

    if (items.length === 0) {
      await waClient.sendText(from, 'Tu carrito está vacío. 🛒\n\nPuedes buscar productos o "Ver tiendas" para empezar.')
      return
    }

    let summary = '*TU CARRITO ACTUAL:* 🛒\n\n'
    let total = 0
    items.forEach(item => {
      const subtotal = item.price * item.qty
      summary += `• ${item.name} x${item.qty}: *$${subtotal.toLocaleString()}*\n`
      total += subtotal
    })
    summary += `\n*TOTAL A PAGAR: $${total.toLocaleString('es-CO')}*`

    await waClient.sendButtons(from, summary, [
      { id: 'confirm_checkout', title: '💳 Finalizar Pedido' },
      { id: 'view_stores', title: '🏬 Añadir más' },
      { id: 'clear_cart', title: '🗑️ Vaciar Carrito' }
    ])
    return
  }

  if (text === 'confirm_checkout') {
    await handleConfirmCheckout(from, session, waClient)
    return
  }

  const isCancelIntent = /^(cancelar|cancel|cancelar pedido|cancelar compra|abortar|reiniciar|olvidalo|olvídalo|ya no quiero|no quiero nada|vaciar carrito|detener)$/i.test(text.trim()) || text === 'clear_cart' || text === 'cancel'
  if (isCancelIntent) {
    await updateWhatsAppSession(session.id, {
      customerName: null,
      address: null,
      step: 'IDLE',
      cart: emptyCartState()
    })
    await waClient.sendText(from, 'Entendido, tu proceso de compra ha sido cancelado y tu carrito vaciado. ❌ ¿En qué más puedo ayudarte?')
    return
  }

  // 9. Máquina de estados conversacional
  switch (session.step) {
    case 'START':
      if (session.storeId && session.storeId !== 'global' && store) {
        await dispatchStoreCatalog(from, store, waClient, session)
      } else {
        await waClient.sendButtons(from, '¡Hola! Bienvenido a *StoreFCheckout*. 🚀\n\n¿Cómo prefieres empezar hoy?', [
          { id: 'view_stores', title: '🏬 Ver tiendas' },
          { id: 'search_now', title: '🔍 Buscar algo' },
        ])
        await updateWhatsAppSession(session.id, { step: 'IDLE' })
      }
      break

    case 'IDLE': {
      const normalizedQuery = text.toLowerCase().trim()
      const isCatalogKeyword = ['catalogo', 'catálogo', 'ver catalogo', 'ver catálogo', 'ver productos', 'menu', 'menú', 'productos'].includes(normalizedQuery)
      if (isCatalogKeyword && session.storeId && session.storeId !== 'global' && store) {
        await dispatchStoreCatalog(from, store, waClient, session)
        break
      }

      if (intent.intent === 'QUERY' && intent.query) {
        const products = await searchGlobalProducts(intent.query, session.storeId)

        if (products.length === 0) {
          try {
            const { AgentRouter } = await import('@/lib/ai/pipeline/agent-router')
            const result = await AgentRouter.processMessage(from, text, 'WHATSAPP', session.storeId || 'global')
            await waClient.sendText(from, result.response)
          } catch (agentErr) {
            console.error('Error in agent router fallback:', agentErr)
            const storeMsg = session.storeId ? ' en esta tienda' : ''
            await waClient.sendText(from, `Lo siento, no encontré "${intent.query}"${storeMsg}. 😕 ¿Quieres intentar con otra cosa?`)
          }
        } else if (products.length === 1) {
          const p = products[0]
          await waClient.sendButtons(from, `¡Encontré esto! 🧐\n\n*${p.name}*\nTienda: ${p.storeName}\nPrecio: $${p.price.toLocaleString()}\n\n¿Deseas confirmar este pedido?`, [
            { id: `confirm_${p.id}`, title: '✅ Sí, confirmar' },
            { id: 'cancel', title: '❌ No, buscar otro' },
          ])
          await updateWhatsAppSession(session.id, {
            step: 'AWAITING_CONFIRMATION',
            cart: {
              items: {
                [p.id]: {
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  qty: 1,
                  storeId: p.storeId,
                },
              },
            },
          })
        } else {
          await waClient.sendList(
            from,
            'Opciones encontradas',
            'Encontré estos resultados:',
            'Ver opciones',
            [
              {
                title: 'Resultados',
                rows: products.map(p => ({
                  id: `select_${p.id}`,
                  title: p.name,
                  description: `${p.storeName} - $${p.price.toLocaleString()}`,
                })),
              },
            ]
          )
          await updateWhatsAppSession(session.id, { step: 'AWAITING_SELECTION' })
        }
      } else {
        if (session.storeId === 'global') {
          try {
            const { AgentRouter } = await import('@/lib/ai/pipeline/agent-router')
            const result = await AgentRouter.processMessage(from, text, 'WHATSAPP', 'global')
            await waClient.sendText(from, result.response)
          } catch (agentErr) {
            console.error('Error invoking global agent router:', agentErr)
          }
        } else if (session.storeId && session.storeId !== 'global' && store && store.aiActive) {
          try {
            const { AgentRouter } = await import('@/lib/ai/pipeline/agent-router')
            const result = await AgentRouter.processMessage(from, text, 'WHATSAPP', store.id)
            await waClient.sendText(from, result.response)
          } catch (agentErr) {
            console.error('Error invoking store agent router:', agentErr)
          }
        }
      }
      break
    }

    case 'AWAITING_STORE_SELECTION':
      if (text.startsWith('store_')) {
        const storeId = text.replace('store_', '')
        const selectedStore = await prisma.store.findUnique({ where: { id: storeId, active: true } })
        if (selectedStore) {
          await updateWhatsAppSession(session.id, { storeId: selectedStore.id, step: 'START' })
          await dispatchStoreCatalog(from, selectedStore, waClient, session)
        } else {
          await waClient.sendText(from, 'Tienda no encontrada. 😕')
        }
      }
      break

    case 'AWAITING_SELECTION':
      break

    case 'AWAITING_NAME': {
      const trimmed = text.trim()
      if (!trimmed || trimmed.length < 2) {
        await waClient.sendText(from, 'Por favor, escribe un nombre válido para el despacho de tu pedido:')
        break
      }
      const updatedSession = await updateWhatsAppSession(session.id, { customerName: trimmed, step: 'IDLE' })
      await handleConfirmCheckout(from, updatedSession, waClient)
      break
    }

    case 'AWAITING_ADDRESS': {
      const trimmed = text.trim()
      if (!trimmed || trimmed.length < 4) {
        await waClient.sendText(from, 'Por favor, indícanos una dirección de entrega válida (Calle, Carrera, Barrio y Ciudad):')
        break
      }
      const updatedSession = await updateWhatsAppSession(session.id, { address: trimmed, step: 'IDLE' })
      await handleConfirmCheckout(from, updatedSession, waClient)
      break
    }

    case 'AWAITING_PAYMENT_SELECTION':
      await handleAwaitingPaymentSelection(from, text, session, waClient)
      break

    case 'AWAITING_BREB_KEY':
      await handleAwaitingBrebKey(from, text, session, waClient)
      break

    case 'AWAITING_CONFIRMATION':
      if (text === 'final_summary' || text === 'confirm_checkout' || intent.intent === 'CONFIRM') {
        await handleAwaitingConfirmation(from, session, waClient)
      } else if (intent.intent === 'CANCEL' || text === 'cancel') {
        await waClient.sendText(from, 'Pedido cancelado. Carrito mantenido.')
        await updateWhatsAppSession(session.id, {
          step: 'IDLE',
          customerName: null,
          address: null
        })
      }
      break
  }
}
