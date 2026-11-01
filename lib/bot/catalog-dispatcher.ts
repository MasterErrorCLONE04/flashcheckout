import { prisma } from '@/lib/prisma'
import { BotClient, SessionRecord, StoreRecord, updateWhatsAppSession } from './bot-types'

/**
 * Estrategia Híbrida Inteligente para Despacho de Catálogo:
 * 1. Si la tienda opera con Meta Cloud API y tiene Flow ID configurado -> Despliega Meta WhatsApp Flow nativo interactivo.
 * 2. Si opera con Evolution API (Baileys/QR) o el Flow no está disponible -> Despliega botón de Catálogo Web + Lista Interactiva de WhatsApp en el chat.
 */
export async function dispatchStoreCatalog(
  from: string,
  store: StoreRecord,
  waClient: BotClient,
  session: SessionRecord
) {
  const aiSettings = (store.aiSettings as Record<string, unknown> | null) || {}
  const checkoutMode = (aiSettings.checkoutMode as string) || 'WEB_CHECKOUT' // 'WEB_CHECKOUT' | 'WHATSAPP_FLOW'
  const flowId = (aiSettings.whatsappCatalogFlowId as string) || process.env.WHATSAPP_CATALOG_FLOW_ID
  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flashcheckouts.com'}/tienda/${store.slug}?wa=${from}&layout=native`

  // 1. Verificación de Meta WhatsApp Flows Nativo (Opción A)
  const isFlowMode = checkoutMode === 'WHATSAPP_FLOW'
  const canUseFlow = Boolean(
    isFlowMode &&
    typeof waClient.sendFlow === 'function' &&
    flowId &&
    flowId !== '789456123' &&
    flowId.trim() !== ''
  )

  if (canUseFlow) {
    try {
      const products = await prisma.product.findMany({
        where: { storeId: store.id, active: true },
        take: 30,
        select: { id: true, name: true, price: true, description: true }
      })

      if (products.length > 0) {
        const flowData = {
          store_name: store.name.slice(0, 30),
          products: products.map(p => ({
            id: p.id,
            title: p.name.slice(0, 30),
            description: `$${p.price.toLocaleString('es-CO')} COP${p.description ? ` • ${p.description.slice(0, 30)}` : ''}`
          }))
        }

        await waClient.sendFlow!(
          from,
          flowId!,
          'Ver Catálogo 🛍️',
          `store_${store.id}_${session.id}`,
          'CATALOG',
          flowData,
          store.name,
          store.welcomeMessage || `¡Hola! Bienvenido a *${store.name}*. Abre nuestro catálogo interactivo para elegir tus productos:`
        )

        await updateWhatsAppSession(session.id, { step: 'IDLE', storeId: store.id })
        return
      }
    } catch (flowErr) {
      console.warn('[Hybrid Catalog] Meta Flow delivery failed, falling back to Web + List:', flowErr)
    }
  }

  // 2. Experiencia Conversacional + Web Checkout (Opción B / Fallback)
  const defaultWelcome = `¡Hola! Bienvenido a *${store.name}*. 🏬✨\n\nHe preparado nuestro catálogo interactivo para que explores todos los productos, tallas y fotos en pantalla completa:`
  const welcomeText = store.welcomeMessage || defaultWelcome

  await waClient.sendUrlButton(
    from,
    welcomeText,
    '🛍️ Abrir Catálogo Web',
    storeUrl
  )

  // B) Lista nativa de WhatsApp para seleccionar productos en el chat
  const products = await prisma.product.findMany({
    where: { storeId: store.id, active: true },
    take: 10,
    select: { id: true, name: true, price: true, description: true }
  })

  if (products.length > 0) {
    await waClient.sendList(
      from,
      store.name,
      '¿Prefieres pedir directamente en este chat? Selecciona aquí:',
      'Ver Productos',
      [
        {
          title: 'Productos Disponibles',
          rows: products.map(p => ({
            id: `select_${p.id}`,
            title: p.name.slice(0, 24),
            description: `$${p.price.toLocaleString('es-CO')} COP`
          }))
        }
      ]
    )
  }

  await updateWhatsAppSession(session.id, { step: 'IDLE', storeId: store.id })
}
