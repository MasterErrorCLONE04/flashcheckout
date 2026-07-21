import { ToolRegistry, type MCPTool } from './tool-registry'
import { RetrievalService } from '../services/retrieval-service'
import { RankingService } from '../services/ranking-service'
import { prisma } from '@/lib/prisma'

// =========================================================================
// 1. HERRAMIENTA: Búsqueda Semántica de Productos (SemanticSearchTool)
// =========================================================================
const semanticSearchTool: MCPTool = {
  name: 'search_products',
  description: 'Busca productos de manera semántica y recomendación en la base de datos.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Término o frase de búsqueda natural' }
    },
    required: ['query']
  },
  execute: async (args: { query: string }, context) => {
    console.log(`[Tool: search_products] Query: ${args.query}`);
    
    // Obtener candidatos de Retrieval
    const candidates = await RetrievalService.retrieve(
      args.query,
      'PRODUCT',
      { 
        storeId: context.storeId !== 'global' ? context.storeId : undefined,
        availableOnly: true 
      }
    )

    // Re-ordenar con RankingService
    const ranked = RankingService.rank(
      candidates,
      context.storeId === 'global' ? { semantic: 0.8, popularity: 0.2 } : undefined, // Ajustar pesos
      5 // Top 5
    )

    // Guardar los IDs y nombres en la memoria para matching sin LLM en add_to_cart
    context.session.memory.lastRetrievedIds = ranked.map(item => item.id)
    context.session.memory.lastRetrievedProducts = ranked.map(item => ({
      id: item.id,
      name: item.details.name as string
    }))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Formatear resultados legibles para el LLM
    return ranked.map(item => {
      const p = item.details
      const storeSlug = p.store?.slug || 'tienda'
      return {
        id: p.id,
        nombre: p.name,
        precio: p.price,
        categoria: p.category,
        tienda: p.store?.name || 'Tienda aliada',
        ...(context.storeId === 'global' && { link_compra: `${appUrl}/tienda/${storeSlug}?product=${p.id}` }),
        score: item.compositeScore
      }
    })
  }
}

// =========================================================================
// 2. HERRAMIENTA: Soporte & FAQs (FAQTool)
// =========================================================================
const faqTool: MCPTool = {
  name: 'faq',
  description: 'Responde preguntas de soporte, horarios, políticas o cobertura de la tienda.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Pregunta del cliente' }
    },
    required: ['query']
  },
  execute: async (args: { query: string }, context) => {
    console.log(`[Tool: faq] Query: ${args.query}`);

    const candidates = await RetrievalService.retrieve(
      args.query,
      'FAQ',
      { storeId: context.storeId !== 'global' ? context.storeId : undefined }
    )

    const ranked = RankingService.rank(candidates, { semantic: 1.0 }, 3)

    return ranked.map(item => {
      const f = item.details
      return {
        pregunta: f.question,
        respuesta: f.answer
      }
    })
  }
}

// =========================================================================
// 3. HERRAMIENTA: Generador de Checkout / Pago (CheckoutTool)
// =========================================================================
const checkoutTool: MCPTool = {
  name: 'checkout',
  description: 'Genera el resumen de compra, enlace o QR de pago para los productos en el carrito.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  },
  execute: async (args: any, context) => {
    console.log(`[Tool: checkout] Iniciando checkout de carrito para ${context.sessionKey}`);

    if (context.channel !== 'WHATSAPP') {
      return {
        success: false,
        message: 'El resumen de compra interactivo solo está disponible en WhatsApp.'
      }
    }

    // Buscar sesión exacta del número del usuario
    const session = await prisma.whatsAppSession.findUnique({
      where: {
        phoneNumber_storeId: {
          phoneNumber: context.sessionKey,
          storeId: context.storeId
        }
      }
    })

    if (!session || !session.cart) {
      return {
        success: false,
        message: 'El carrito de compras está vacío actualmente.'
      }
    }

    const cartObj = session.cart as any
    const items = (cartObj && cartObj.items) ? Object.values(cartObj.items) as any[] : []

    if (items.length === 0) {
      return {
        success: false,
        message: 'El carrito de compras está vacío actualmente.'
      }
    }

    // Validar si tenemos el nombre completo del cliente en la sesión
    if (!session.customerName) {
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'AWAITING_NAME' }
      });
      return {
        success: false,
        requires_input: 'NAME',
        message: 'Para procesar tu pedido, necesitamos tu nombre completo. ¿A nombre de quién registramos la compra? 👤'
      }
    }

    // Validar si tenemos la dirección de entrega
    if (!session.address) {
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'AWAITING_ADDRESS' }
      });
      return {
        success: false,
        requires_input: 'ADDRESS',
        message: `Perfecto, *${session.customerName}*. ¿A qué dirección o ubicación enviamos tu pedido? 📍`
      }
    }

    // Calcular totales
    let total = 0
    const itemsList = items.map(item => {
      const subtotal = item.price * item.qty
      total += subtotal
      return {
        producto: item.name,
        cantidad: item.qty,
        precio_unitario: item.price,
        subtotal
      }
    })

    // Fix #6: Validar que todos los ítems del carrito son de la misma tienda
    const uniqueStoreIds = [...new Set(items.map((i: any) => i.storeId).filter(Boolean))]
    if (uniqueStoreIds.length > 1) {
      return {
        success: false,
        message: 'Tu carrito tiene productos de tiendas distintas. Por favor, procesa cada tienda por separado.'
      }
    }
    const storeId = context.storeId !== 'global' ? context.storeId : (uniqueStoreIds[0] as string || 'global')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // 1. Crear la orden en la base de datos
    const order = await prisma.order.create({
      data: {
        customerName: session.customerName || 'Cliente WhatsApp',
        customerPhone: context.sessionKey,
        customerWhatsAppId: context.sessionKey,
        address: session.address || 'WhatsApp',
        city: 'Colombia',
        items: items,
        total: total,
        storeId: storeId,
        source: 'WHATSAPP'
      }
    })

    // 2. Obtener la tienda para verificar la configuración Bre-B / Mercado Pago
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { brebConfig: true }
    })

    const getBrebPaymentConfig = (tableConfig: any, settings: any) => {
      if (tableConfig) return tableConfig
      if (settings && typeof settings === 'object') {
        const s = settings as any
        return s.brebConfig
      }
      return null
    }

    const brebConfig = getBrebPaymentConfig(store?.brebConfig, store?.settings)
    const shouldUseBreb = Boolean(brebConfig?.enabled && brebConfig.keyValue && brebConfig.participantId)

    // 3. Crear preferencia de Mercado Pago si aplica y no se usa Bre-B
    if (store && store.mpConnected && !shouldUseBreb) {
      const tokenToUse = store.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN
      if (tokenToUse) {
        try {
          const { MercadoPagoConfig, Preference } = await import('mercadopago')
          const dynamicMpClient = new MercadoPagoConfig({
            accessToken: tokenToUse,
            options: { timeout: 10000 }
          })
          const dynamicMpPreference = new Preference(dynamicMpClient)
          const base = appUrl.replace(/\/$/, '')

          const preferenceData: any = {
            body: {
              items: items.map(line => ({
                id: line.id,
                title: `${line.name} (x${line.qty})`,
                quantity: line.qty,
                unit_price: line.price,
                currency_id: 'COP'
              })),
              external_reference: order.id,
              back_urls: {
                success: `${base}/tienda/${store.slug}/exito`,
                failure: `${base}/tienda/${store.slug}`,
                pending: `${base}/tienda/${store.slug}`
              },
              metadata: {
                orderId: order.id,
                storeId: store.id
              }
            }
          }

          if (base.startsWith('https')) {
            preferenceData.body.notification_url = `${base}/api/webhook/mp`
            preferenceData.body.auto_return = 'approved'
          }

          const preference = await dynamicMpPreference.create(preferenceData)
          if (preference.id) {
            await prisma.order.update({
              where: { id: order.id },
              data: { mpPreferenceId: preference.id }
            })
          }
        } catch (mpErr) {
          console.error('[checkout-tool] Failed to create Mercado Pago preference:', mpErr)
        }
      }
    }

    // 4. Vaciar el carrito de la sesión y reiniciar datos del cliente para futuras compras
    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: {
        cart: { items: {} },
        customerName: null,
        address: null
      }
    })

    const smartPayUrl = `${appUrl}/pay/${order.id}`

    return {
      success: true,
      items: itemsList,
      total,
      enlace_de_pago: smartPayUrl,
      metodo_pago: shouldUseBreb ? 'Bre-B (QR y comprobante)' : 'Mercado Pago / Transferencia',
      instrucciones: `Muestra al cliente el resumen de su compra con total $${total.toLocaleString('es-CO')}. Entrégale el enlace de pago de Smart Pay: ${smartPayUrl}. Si la tienda cuenta con Bre-B (método de pago = Bre-B), explícale que al pulsar en el enlace de Smart Pay podrá escanear el código QR de Bre-B, transferir la cantidad exacta e inmediatamente subir el comprobante en el portal para aprobar el pedido.`
    }
  }
}

// =========================================================================
// 4. HERRAMIENTA: Añadir al Carrito (AddToCartTool)
// =========================================================================
const addToCartTool: MCPTool = {
  name: 'add_to_cart',
  description: 'Añade un producto y su cantidad al carrito de compras del usuario.',
  inputSchema: {
    type: 'object',
    properties: {
      productId: { type: 'string', description: 'ID único del producto a añadir (opcional)' },
      productName: { type: 'string', description: 'Nombre o descripción del producto a añadir (opcional)' },
      quantity: { type: 'number', description: 'Cantidad del producto (opcional, por defecto 1)' }
    }
  },
  execute: async (args: { productId?: string; productName?: string; quantity?: number }, context) => {
    const qty = args.quantity || 1
    console.log(`[Tool: add_to_cart] ProductId: ${args.productId}, ProductName: ${args.productName}, Qty: ${qty}`)

    if (context.channel !== 'WHATSAPP') {
      return { success: false, message: 'El carrito de compras interactivo solo está disponible en WhatsApp.' }
    }

    // 1. Obtener la sesión del usuario en WhatsApp
    const session = await prisma.whatsAppSession.findUnique({
      where: {
        phoneNumber_storeId: {
          phoneNumber: context.sessionKey,
          storeId: context.storeId
        }
      }
    })

    if (!session) {
      return { success: false, message: 'No se encontró una sesión activa para este número.' }
    }

    // 2. Obtener el producto (por ID o por búsqueda de nombre en la tienda actual)
    let product: any = null

    if (args.productId && args.productId !== 'NONE') {
      product = await prisma.product.findUnique({
        where: { id: args.productId }
      })
    }

    if (!product && args.productName) {
      try {
        console.log(`[Tool: add_to_cart] Searching database semantically for product name: ${args.productName}`)
        const candidates = await RetrievalService.retrieve(
          args.productName,
          'PRODUCT',
          { storeId: context.storeId, minimumSimilarity: 0.60 },
          3
        )
        
        if (candidates.length > 0) {
          product = await prisma.product.findUnique({
            where: { id: candidates[0].id }
          })
        }
      } catch (err) {
        console.error('[Tool: add_to_cart] Semantic retrieval failed, using fallback keyword:', err)
      }

      if (!product) {
        const allProducts = await prisma.product.findMany({
          where: {
            storeId: context.storeId,
            active: true
          }
        })
        const term = args.productName.toLowerCase().trim()
        product = allProducts.find(p => {
          const name = p.name.toLowerCase().trim()
          return term.includes(name) || name.includes(term)
        })
      }
    }

    if (!product) {
      return { success: false, message: `El producto "${args.productName || args.productId}" no está disponible o no existe en la tienda.` }
    }

    // 3. Cargar y actualizar el carrito
    let cartObj = session.cart ? JSON.parse(JSON.stringify(session.cart)) : { items: {} }
    if (!cartObj.items) cartObj.items = {}

    cartObj.items[product.id] = {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: (cartObj.items[product.id]?.qty || 0) + qty,
      storeId: product.storeId
    }

    // 4. Guardar en base de datos
    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { cart: cartObj }
    })

    return {
      success: true,
      message: `¡Perfecto! ${product.name} agregado al carrito (${product.price}).`,
      producto: product.name,
      cantidad: cartObj.items[product.id].qty,
      total_item: cartObj.items[product.id].qty * product.price
    }
  }
}

// Auto-registrar herramientas
ToolRegistry.register(semanticSearchTool)
ToolRegistry.register(faqTool)
ToolRegistry.register(checkoutTool)
ToolRegistry.register(addToCartTool)
