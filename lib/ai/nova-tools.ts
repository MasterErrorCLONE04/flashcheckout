import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
  }
}

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 1. DefiniciÃ³n de herramientas para el LLM
export const NOVA_TOOLS_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Busca productos en el catÃ¡logo por nombre, descripciÃ³n o categorÃ­a.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'El tÃ©rmino de bÃºsqueda (ej. "camisa", "tecnologÃ­a").' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_product',
      description: 'Actualiza el nombre, descripciÃ³n, categorÃ­a, precio, stock o estado activo/inactivo de un producto especÃ­fico.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID Ãºnico del producto.' },
          name: { type: 'string', description: 'Nuevo nombre del producto (opcional).' },
          description: { type: 'string', description: 'Nueva descripciÃ³n detallada del producto (opcional).' },
          category: { type: 'string', description: 'Nueva categorÃ­a del producto (opcional).' },
          price: { type: 'number', description: 'Nuevo precio del producto (opcional).' },
          stock: { type: 'number', description: 'Nueva cantidad disponible en stock (opcional).' },
          active: { type: 'boolean', description: 'Estado activo o inactivo del producto (opcional).' }
        },
        required: ['productId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_product',
      description: 'Crea un nuevo producto en el catÃ¡logo de la tienda.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nombre del producto.' },
          price: { type: 'number', description: 'Precio del producto.' },
          stock: { type: 'number', description: 'Cantidad inicial de stock (opcional, por defecto 10).' },
          category: { type: 'string', description: 'CategorÃ­a del producto (opcional, por defecto "General").' },
          description: { type: 'string', description: 'DescripciÃ³n detallada del producto (opcional).' },
          imageUrl: { type: 'string', description: 'URL de la imagen del producto (opcional).' }
        },
        required: ['name', 'price']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_orders',
      description: 'Obtiene una lista de los pedidos recientes, con opciÃ³n de filtrar por estado (pending, preparing, ready, delivered, cancelled).',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Estado del pedido para filtrar (opcional).' },
          take: { type: 'number', description: 'Cantidad de pedidos a traer (por defecto 10).' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_order_status',
      description: 'Cambia el estado de un pedido (por ejemplo, a "preparing", "ready", "delivered" o "cancelled") y permite aÃ±adir comentarios internos.',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'ID del pedido.' },
          status: { type: 'string', description: 'Nuevo estado del pedido (pending, preparing, ready, delivered, cancelled).' },
          adminComment: { type: 'string', description: 'Comentario interno o nota sobre el cambio de estado (opcional).' }
        },
        required: ['orderId', 'status']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_coupon',
      description: 'Crea un nuevo cupÃ³n de descuento activo para la tienda.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'CÃ³digo del cupÃ³n (ej. "SUMMER10"). Se guardarÃ¡ en mayÃºsculas.' },
          desc: { type: 'string', description: 'DescripciÃ³n de la promociÃ³n.' },
          valor: { type: 'string', description: 'Valor del descuento (ej: "10%", "5000", "EnvÃ­o gratis").' },
          tipo: { type: 'string', description: 'Tipo de cupÃ³n ("CÃ³digo" o "AutomÃ¡tico", por defecto "CÃ³digo").' },
          tipoDesc: { type: 'string', description: 'Tipo de descuento ("Porcentaje", "Monto fijo", "EnvÃ­o gratis", por defecto "Porcentaje").' },
          validoHasta: { type: 'string', description: 'Fecha o descripciÃ³n de validez (ej: "31 Dic 2026", "maÃ±ana", "Sin fecha lÃ­mite").' }
        },
        required: ['code', 'desc', 'valor']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_sales_metrics',
      description: 'Obtiene las mÃ©tricas de rendimiento y estadÃ­sticas de ventas de la tienda (ventas totales, promedio de ticket, pedidos y productos mÃ¡s vendidos).',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_customer_chat',
      description: 'Obtiene la transcripciÃ³n del chat de WhatsApp reciente con un cliente especÃ­fico usando su telÃ©fono.',
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'NÃºmero de telÃ©fono del cliente (con o sin cÃ³digo de paÃ­s).' }
        },
        required: ['phone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'toggle_whatsapp_bot',
      description: 'Activa o desactiva (pausa) el bot inteligente autÃ³mata de ventas que atiende a los clientes finales en WhatsApp.',
      parameters: {
        type: 'object',
        properties: {
          active: { type: 'boolean', description: 'true para activar el bot de ventas, false para pausarlo.' }
        },
        required: ['active']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_business_profile',
      description: 'Obtiene la memoria del negocio (nicho, pÃºblico objetivo, propuesta de valor, tono de marca) para contextualizar las respuestas.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_current_builder_layout',
      description: 'Obtiene el estado y los textos actuales del constructor de pÃ¡ginas (secciones activas, textos del banner, historia de marca, bento highlights, etc.).',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_builder_layout',
      description: 'Actualiza el layout, colores o textos en el constructor de pÃ¡ginas. Permite configurar o habilitar/deshabilitar secciones (ej. bannerTitle, brandStory, colors, etc.).',
      parameters: {
        type: 'object',
        properties: {
          bannerTitle: { type: 'string', description: 'TÃ­tulo principal del banner (opcional).' },
          bannerSubtitle: { type: 'string', description: 'SubtÃ­tulo del banner (opcional).' },
          heroType: { type: 'string', description: 'Tipo de banner ("image" o "video", opcional).' },
          heroVideoUrl: { type: 'string', description: 'URL del video loop del banner (opcional).' },
          brandStoryTitle: { type: 'string', description: 'TÃ­tulo de la historia de marca (opcional).' },
          brandStoryDesc: { type: 'string', description: 'Texto narrativo de la historia de marca (opcional).' },
          brandStoryBgUrl: { type: 'string', description: 'Imagen de fondo de la historia de marca (opcional).' },
          primaryColor: { type: 'string', description: 'Color primario de la marca en formato HEX (opcional).' },
          secondaryColor: { type: 'string', description: 'Color secundario en formato HEX (opcional).' },
          freeShippingThreshold: { type: 'number', description: 'Monto mÃ­nimo para activar envÃ­o gratuito (opcional).' },
          toggleSections: { 
            type: 'object', 
            description: 'Objeto para activar/desactivar secciones, ej. {"banner": true, "ingredientsSection": false} (opcional).' 
          }
        }
      }
    }
  }
]

// 2. EjecuciÃ³n de herramientas (Resolvers en Backend)
export async function executeNovaTool(
  storeId: string,
  name: string,
  args: unknown
): Promise<JsonRecord> {
  const payload = isRecord(args) ? args : {}
  try {
    switch (name) {
      case 'search_products': {
        const query = typeof payload.query === 'string' ? payload.query : ''
        const { RetrievalService } = await import('./services/retrieval-service')
        const { RankingService } = await import('./services/ranking-service')
        
        const candidates = await RetrievalService.retrieve(
          query,
          'PRODUCT',
          { storeId }
        )
        const ranked = RankingService.rank(candidates, {}, 10)
        const products = ranked.map(item => item.details)

        if (products.length === 0) {
          return { message: `No se encontraron productos que coincidan con "${query}".` }
        }

        return {
          message: `Se encontraron ${products.length} productos.`,
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            active: p.active,
            category: p.category || 'General',
            description: p.description || ''
          }))
        }
      }

      case 'create_product': {
        const name = typeof payload.name === 'string' ? payload.name : ''
        const price = Number(payload.price ?? 0)
        const stock = Number(payload.stock ?? 10)
        const category = typeof payload.category === 'string' ? payload.category : 'General'
        const description = typeof payload.description === 'string' ? payload.description : ''
        const imageUrl = typeof payload.imageUrl === 'string' ? payload.imageUrl : ''

        const newProduct = await prisma.product.create({
          data: {
            name,
            price: Math.round(price),
            stock: Number.isFinite(stock) ? stock : 10,
            category,
            description,
            imageUrl: imageUrl || null,
            storeId
          }
        })

        return {
          message: 'Producto creado exitosamente.',
          product: {
            id: newProduct.id,
            name: newProduct.name,
            price: newProduct.price,
            stock: newProduct.stock,
            category: newProduct.category,
            description: newProduct.description,
            imageUrl: newProduct.imageUrl
          }
        }
      }

      case 'update_product': {
        const productId = typeof payload.productId === 'string' ? payload.productId : ''
        const name = typeof payload.name === 'string' ? payload.name : undefined
        const description = typeof payload.description === 'string' ? payload.description : undefined
        const category = typeof payload.category === 'string' ? payload.category : undefined
        const price = payload.price
        const stock = payload.stock
        const active = payload.active
        
        // Verificar pertenencia del producto a la tienda
        const existing = await prisma.product.findFirst({
          where: { id: productId, storeId }
        })

        if (!existing) {
          return { error: 'Producto no encontrado o no pertenece a esta tienda.' }
        }

        const updateData: Prisma.ProductUpdateInput = {}
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (category !== undefined) updateData.category = category
        if (price !== undefined) updateData.price = Number(price)
        if (stock !== undefined) updateData.stock = Number(stock)
        if (active !== undefined) updateData.active = Boolean(active)

        const updated = await prisma.product.update({
          where: { id: productId },
          data: updateData
        })

        return {
          message: 'Producto actualizado exitosamente.',
          product: {
            id: updated.id,
            name: updated.name,
            oldPrice: existing.price,
            newPrice: updated.price,
            oldStock: existing.stock,
            newStock: updated.stock,
            oldActive: existing.active,
            newActive: updated.active,
            category: updated.category || 'General',
            description: updated.description || ''
          }
        }
      }

      case 'list_orders': {
        const status = typeof payload.status === 'string' ? payload.status : undefined
        const take = Number(payload.take ?? 10)
        const whereClause: Prisma.OrderWhereInput = { storeId }
        if (status) {
          whereClause.status = status.toLowerCase()
        }

        const orders = await prisma.order.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: Math.min(Number.isFinite(take) ? take : 10, 30)
        })

        if (orders.length === 0) {
          return { message: 'No se encontraron pedidos con los criterios especificados.' }
        }

        return {
          message: `Se recuperaron ${orders.length} pedidos.`,
          orders: orders.map(o => ({
            id: o.id,
            customerName: o.customerName,
            customerPhone: o.customerPhone || 'Sin telÃ©fono',
            city: o.city,
            total: o.total,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt.toISOString()
          }))
        }
      }

      case 'update_order_status': {
        const orderId = typeof payload.orderId === 'string' ? payload.orderId : ''
        const status = typeof payload.status === 'string' ? payload.status : ''
        const adminComment = typeof payload.adminComment === 'string' ? payload.adminComment : undefined

        const existing = await prisma.order.findFirst({
          where: { id: orderId, storeId }
        })

        if (!existing) {
          return { error: 'El pedido no existe o no pertenece a esta tienda.' }
        }

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: status.toLowerCase(),
            ...(adminComment && { adminComment })
          }
        })

        return {
          message: `Estado del pedido #${orderId.slice(-6)} actualizado a "${status}" correctamente.`,
          order: {
            id: updated.id,
            customerName: updated.customerName,
            oldStatus: existing.status,
            newStatus: updated.status,
            total: updated.total,
            adminComment: updated.adminComment || ''
          }
        }
      }

      case 'create_coupon': {
        const code = typeof payload.code === 'string' ? payload.code : ''
        const desc = typeof payload.desc === 'string' ? payload.desc : ''
        const valor = typeof payload.valor === 'string' ? payload.valor : ''
        const tipo = typeof payload.tipo === 'string' ? payload.tipo : 'CÃ³digo'
        const tipoDesc = typeof payload.tipoDesc === 'string' ? payload.tipoDesc : 'Porcentaje'
        const validoHasta = typeof payload.validoHasta === 'string' ? payload.validoHasta : 'Sin fecha lÃ­mite'

        const newCoupon = await prisma.coupon.create({
          data: {
            code: String(code).toUpperCase().trim(),
            desc,
            valor: String(valor),
            tipo,
            tipoDesc,
            validoHasta,
            estado: 'Activo',
            storeId
          }
        })

        return {
          message: 'CupÃ³n creado exitosamente.',
          coupon: {
            id: newCoupon.id,
            code: newCoupon.code,
            desc: newCoupon.desc,
            valor: newCoupon.valor,
            tipoDesc: newCoupon.tipoDesc,
            validoHasta: newCoupon.validoHasta
          }
        }
      }

      case 'get_sales_metrics': {
        // Pedidos aprobados o completados de la tienda
        const orders = await prisma.order.findMany({
          where: { storeId }
        })

        const totalSales = orders
          .filter(o => o.paymentStatus === 'APPROVED' || o.status === 'delivered')
          .reduce((sum, o) => sum + o.total, 0)

        const totalOrders = orders.length
        const avgTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0

        // Extraer top productos vendidos a partir del JSON de los pedidos
        const productSalesMap: Record<string, { qty: number; sales: number }> = {}
        for (const order of orders) {
          try {
            const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items as string || '[]')
            if (Array.isArray(items)) {
              for (const item of items) {
                if (item && item.name) {
                  const qty = Number(item.qty || 1)
                  const price = Number(item.price || 0)
                  if (!productSalesMap[item.name]) {
                    productSalesMap[item.name] = { qty: 0, sales: 0 }
                  }
                  productSalesMap[item.name].qty += qty
                  productSalesMap[item.name].sales += qty * price
                }
              }
            }
          } catch (e) {
            // Ignorar errores de parseo de items JSON heredados
          }
        }

        const topProducts = Object.entries(productSalesMap)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 3)

        return {
          metrics: {
            totalSales,
            totalOrders,
            avgTicket,
            topProducts
          }
        }
      }

      case 'get_customer_chat': {
        const phone = typeof payload.phone === 'string' ? payload.phone : ''
        const cleanedPhone = phone.replace(/\D/g, '')

        const session = await prisma.whatsAppSession.findFirst({
          where: {
            storeId,
            phoneNumber: { contains: cleanedPhone }
          }
        })

        if (!session) {
          return { message: `No se encontrÃ³ ninguna sesiÃ³n de chat de WhatsApp para el telÃ©fono "${phone}".` }
        }

        // Obtener historial de mensajes guardados
        const rawMessages = session.messages
        const messages = Array.isArray(rawMessages) ? rawMessages : []

        return {
          customerName: session.customerName || 'Cliente de WhatsApp',
          phoneNumber: session.phoneNumber,
          step: session.step,
          assignedTo: session.assignedTo,
          lastInteraction: session.lastInteraction.toISOString(),
          chatHistory: messages.slice(-15) // Traer los Ãºltimos 15 mensajes para resumir
        }
      }

      case 'toggle_whatsapp_bot': {
        const active = typeof payload.active === 'boolean' ? payload.active : Boolean(payload.active)

        const updated = await prisma.store.update({
          where: { id: storeId },
          data: { aiActive: Boolean(active) }
        })

        return {
          message: `El bot inteligente de WhatsApp ha sido ${updated.aiActive ? 'ACTIVADO' : 'DESACTIVADO (PAUSADO)'} correctamente.`,
          aiActive: updated.aiActive
        }
      }

      case 'get_business_profile': {
        const store = await prisma.store.findUnique({
          where: { id: storeId }
        })
        if (!store) return { error: 'Tienda no encontrada.' }
        const settings = isRecord(store.settings) ? store.settings : {}
        return {
          businessProfile: settings.businessProfile || {
            niche: 'Sin especificar',
            targetAudience: 'Sin especificar',
            brandTone: 'Sofisticado y elegante',
            coreProposition: 'Sin especificar'
          }
        }
      }

      case 'get_current_builder_layout': {
        const store = await prisma.store.findUnique({
          where: { id: storeId }
        })
        if (!store) return { error: 'Tienda no encontrada.' }
        const aiSettings = isRecord(store.aiSettings) ? store.aiSettings : {}
        return {
          heroType: aiSettings.heroType || 'image',
          heroVideoUrl: aiSettings.heroVideoUrl || '',
          bannerTitle: aiSettings.bannerTitle || '',
          bannerSubtitle: aiSettings.bannerSubtitle || '',
          sections: aiSettings.sections || {},
          colors: aiSettings.colors || {},
          brandStory: aiSettings.brandStory || {},
          ingredientsSection: aiSettings.ingredientsSection || {},
          freeShipping: aiSettings.freeShipping || {}
        }
      }

      case 'update_builder_layout': {
        const store = await prisma.store.findUnique({
          where: { id: storeId }
        })
        if (!store) return { error: 'Tienda no encontrada.' }

        const aiSettings: JsonRecord = isRecord(store.aiSettings) ? { ...store.aiSettings } : {}
        const brandStory: JsonRecord = isRecord(aiSettings.brandStory) ? { ...aiSettings.brandStory } : {}
        const colors: JsonRecord = isRecord(aiSettings.colors) ? { ...aiSettings.colors } : {}
        const freeShipping: JsonRecord = isRecord(aiSettings.freeShipping)
          ? { ...aiSettings.freeShipping }
          : { enabled: false, threshold: 100000 }
        const sections: JsonRecord = isRecord(aiSettings.sections) ? { ...aiSettings.sections } : {}

        // Actualizaciones individuales
        if (payload.bannerTitle !== undefined) aiSettings.bannerTitle = payload.bannerTitle
        if (payload.bannerSubtitle !== undefined) aiSettings.bannerSubtitle = payload.bannerSubtitle
        if (payload.heroType !== undefined) aiSettings.heroType = payload.heroType
        if (payload.heroVideoUrl !== undefined) aiSettings.heroVideoUrl = payload.heroVideoUrl

        if (payload.brandStoryTitle !== undefined) brandStory.title = payload.brandStoryTitle
        if (payload.brandStoryDesc !== undefined) brandStory.desc = payload.brandStoryDesc
        if (payload.brandStoryBgUrl !== undefined) brandStory.bgUrl = payload.brandStoryBgUrl

        if (payload.primaryColor !== undefined) colors.primario = payload.primaryColor
        if (payload.secondaryColor !== undefined) colors.secundario = payload.secondaryColor

        if (payload.freeShippingThreshold !== undefined) {
          freeShipping.threshold = Number(payload.freeShippingThreshold)
          freeShipping.enabled = true
        }

        if (payload.toggleSections !== undefined && isRecord(payload.toggleSections)) {
          Object.assign(sections, payload.toggleSections)
        }

        aiSettings.brandStory = brandStory
        aiSettings.colors = colors
        aiSettings.freeShipping = freeShipping
        aiSettings.sections = sections

        const updated = await prisma.store.update({
          where: { id: storeId },
          data: { aiSettings: aiSettings as any }
        })

        return {
          message: 'DiseÃ±o del constructor de pÃ¡ginas actualizado exitosamente.',
          updatedFields: Object.keys(payload)
        }
      }

      default:
        return { error: `La herramienta "${name}" no estÃ¡ implementada.` }
    }
  } catch (err: unknown) {
    console.error(`Error al ejecutar la herramienta "${name}":`, err)
    return {
      error: `Excepcion interna ejecutando la herramienta: ${err instanceof Error ? err.message : 'Error desconocido'}`
    }
  }
}
