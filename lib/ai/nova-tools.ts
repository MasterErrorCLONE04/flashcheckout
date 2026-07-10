import { prisma } from '@/lib/prisma'

export interface ToolDefinition {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

// 1. Definición de herramientas para el LLM
export const NOVA_TOOLS_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Busca productos en el catálogo por nombre, descripción o categoría.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'El término de búsqueda (ej. "camisa", "tecnología").' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_product',
      description: 'Actualiza el precio, stock o estado activo/inactivo de un producto específico.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'ID único del producto.' },
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
      name: 'list_orders',
      description: 'Obtiene una lista de los pedidos recientes, con opción de filtrar por estado (pending, preparing, ready, delivered, cancelled).',
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
      description: 'Cambia el estado de un pedido (por ejemplo, a "preparing", "ready", "delivered" o "cancelled") y permite añadir comentarios internos.',
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
      description: 'Crea un nuevo cupón de descuento activo para la tienda.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Código del cupón (ej. "SUMMER10"). Se guardará en mayúsculas.' },
          desc: { type: 'string', description: 'Descripción de la promoción.' },
          valor: { type: 'string', description: 'Valor del descuento (ej: "10%", "5000", "Envío gratis").' },
          tipo: { type: 'string', description: 'Tipo de cupón ("Código" o "Automático", por defecto "Código").' },
          tipoDesc: { type: 'string', description: 'Tipo de descuento ("Porcentaje", "Monto fijo", "Envío gratis", por defecto "Porcentaje").' },
          validoHasta: { type: 'string', description: 'Fecha o descripción de validez (ej: "31 Dic 2026", "mañana", "Sin fecha límite").' }
        },
        required: ['code', 'desc', 'valor']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_sales_metrics',
      description: 'Obtiene las métricas de rendimiento y estadísticas de ventas de la tienda (ventas totales, promedio de ticket, pedidos y productos más vendidos).',
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
      description: 'Obtiene la transcripción del chat de WhatsApp reciente con un cliente específico usando su teléfono.',
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'Número de teléfono del cliente (con o sin código de país).' }
        },
        required: ['phone']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'toggle_whatsapp_bot',
      description: 'Activa o desactiva (pausa) el bot inteligente autómata de ventas que atiende a los clientes finales en WhatsApp.',
      parameters: {
        type: 'object',
        properties: {
          active: { type: 'boolean', description: 'true para activar el bot de ventas, false para pausarlo.' }
        },
        required: ['active']
      }
    }
  }
]

// 2. Ejecución de herramientas (Resolvers en Backend)
export async function executeNovaTool(
  storeId: string,
  name: string,
  args: any
): Promise<any> {
  try {
    switch (name) {
      case 'search_products': {
        const { query } = args
        const products = await prisma.product.findMany({
          where: {
            storeId,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: 10
        })

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

      case 'update_product': {
        const { productId, price, stock, active } = args
        
        // Verificar pertenencia del producto a la tienda
        const existing = await prisma.product.findFirst({
          where: { id: productId, storeId }
        })

        if (!existing) {
          return { error: 'Producto no encontrado o no pertenece a esta tienda.' }
        }

        const updateData: any = {}
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
        const { status, take = 10 } = args
        const whereClause: any = { storeId }
        if (status) {
          whereClause.status = status.toLowerCase()
        }

        const orders = await prisma.order.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: Math.min(take, 30)
        })

        if (orders.length === 0) {
          return { message: 'No se encontraron pedidos con los criterios especificados.' }
        }

        return {
          message: `Se recuperaron ${orders.length} pedidos.`,
          orders: orders.map(o => ({
            id: o.id,
            customerName: o.customerName,
            customerPhone: o.customerPhone || 'Sin teléfono',
            city: o.city,
            total: o.total,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt.toISOString()
          }))
        }
      }

      case 'update_order_status': {
        const { orderId, status, adminComment } = args

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
        const { code, desc, valor, tipo = 'Código', tipoDesc = 'Porcentaje', validoHasta = 'Sin fecha límite' } = args

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
          message: 'Cupón creado exitosamente.',
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
        const { phone } = args
        const cleanedPhone = phone.replace(/\D/g, '')

        const session = await prisma.whatsAppSession.findFirst({
          where: {
            storeId,
            phoneNumber: { contains: cleanedPhone }
          }
        })

        if (!session) {
          return { message: `No se encontró ninguna sesión de chat de WhatsApp para el teléfono "${phone}".` }
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
          chatHistory: messages.slice(-15) // Traer los últimos 15 mensajes para resumir
        }
      }

      case 'toggle_whatsapp_bot': {
        const { active } = args

        const updated = await prisma.store.update({
          where: { id: storeId },
          data: { aiActive: Boolean(active) }
        })

        return {
          message: `El bot inteligente de WhatsApp ha sido ${updated.aiActive ? 'ACTIVADO' : 'DESACTIVADO (PAUSADO)'} correctamente.`,
          aiActive: updated.aiActive
        }
      }

      default:
        return { error: `La herramienta "${name}" no está implementada.` }
    }
  } catch (err: any) {
    console.error(`Error al ejecutar la herramienta "${name}":`, err)
    return { error: `Excepción interna ejecutando la herramienta: ${err.message}` }
  }
}
