import { prisma } from '@/lib/prisma'
import { SessionRecord } from './bot-types'

export async function shouldIgnorePersonalMessage(
  from: string,
  text: string,
  session: SessionRecord
): Promise<boolean> {
  const isSystemAction = 
    text.startsWith('store_') || 
    text.startsWith('view_list_') || 
    text.startsWith('view_catalog') ||
    text.startsWith('select_') || 
    text.startsWith('confirm_') || 
    text === 'cancel' || 
    text === 'view_stores' || 
    text === 'search_now' ||
    text === 'clear_cart' ||
    text === 'view_cart_summary' ||
    text === 'final_summary' ||
    text === 'reset_welcome' ||
    text.startsWith('flow_response_') ||
    text.startsWith('accept_delivery_') ||
    text.startsWith('delivery_') ||
    text === 'btn_pay_breb' ||
    text === 'btn_pay_cod' ||
    text === 'btn_pay_link'

  const isInProgress = session.step !== 'START' && session.step !== 'IDLE'

  if (isSystemAction || isInProgress || !session.storeId || session.storeId === 'global') {
    return false
  }

  const hasPastOrder = await prisma.order.findFirst({
    where: {
      storeId: session.storeId,
      OR: [
        { customerPhone: from },
        { customerWhatsAppId: from }
      ]
    }
  })

  if (hasPastOrder) {
    return false
  }

  const businessKeywords = [
    'precio', 'valor', 'costo', 'cuesta', 'comprar', 'pedido', 'compra', 
    'catalogo', 'catálogo', 'menú', 'menu', 'productos', 'tienda', 'venden', 
    'disponible', 'quiero', 'pagar', 'carrito', 'orden', 'factura', 'domicilio', 
    'envio', 'envío', 'delivery', 'comprobante', 'pago', 'cuenta', 'nequi', 'daviplata',
    'info', 'informacion', 'información', 'servicio', 'contacto'
  ]
  
  const lowerText = text.toLowerCase().trim()
  const matchesKeyword = businessKeywords.some(kw => lowerText.includes(kw))

  if (matchesKeyword) {
    return false
  }

  const storeProducts = await prisma.product.findMany({
    where: { storeId: session.storeId, active: true },
    select: { name: true }
  })

  const matchesProduct = storeProducts.some(p => 
    lowerText.includes(p.name.toLowerCase().trim())
  )

  if (matchesProduct) {
    return false
  }

  console.log(`[Bot Filter] Ignorando mensaje de contacto personal (${from}): "${text}"`)
  return true
}
