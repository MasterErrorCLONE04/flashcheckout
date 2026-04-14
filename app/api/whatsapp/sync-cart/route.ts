import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { phoneNumber, cartData, storeId, customerName, address } = await req.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Falta phoneNumber' }, { status: 400 })
    }

    // Buscamos o creamos la sesión
    const session = await prisma.whatsAppSession.upsert({
      where: { phoneNumber },
      create: {
        phoneNumber,
        cart: cartData,
        storeId,
        customerName,
        address,
        step: 'IDLE'
      },
      update: {
        cart: cartData,
        storeId: storeId || undefined,
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
