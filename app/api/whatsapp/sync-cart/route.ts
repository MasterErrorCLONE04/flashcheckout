import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { phoneNumber, cartData, storeId, customerName, address } = await req.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Falta phoneNumber' }, { status: 400 })
    }

    // Enriquecer el carrito con la información de productos de la base de datos
    let enrichedCart: any = null
    if (cartData && cartData.items) {
      const productIds = Object.keys(cartData.items)
      if (productIds.length > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } }
        })
        
        const enrichedItems: Record<string, any> = {}
        for (const product of products) {
          const qty = cartData.items[product.id]
          if (qty > 0) {
            enrichedItems[product.id] = {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              qty: qty
            }
          }
        }
        enrichedCart = { items: enrichedItems }
      } else {
        enrichedCart = { items: {} }
      }
    }

    const resolvedStoreId = storeId || 'global';

    // Buscamos o creamos la sesión
    const session = await prisma.whatsAppSession.upsert({
      where: {
        phoneNumber_storeId: {
          phoneNumber,
          storeId: resolvedStoreId
        }
      },
      create: {
        phoneNumber,
        cart: enrichedCart,
        storeId: resolvedStoreId,
        customerName,
        address,
        step: 'IDLE'
      },
      update: {
        cart: enrichedCart,
        customerName: customerName || undefined,
        address: address || undefined,
        lastInteraction: new Date()
      }
    })

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error('SYNC_CART_ERROR:', error)
    return NextResponse.json({ error: 'Error al sincronizar carrito' }, { status: 500 })
  }
}
