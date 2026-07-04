import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })
    console.log('[API WhatsApp Session GET] userId:', userId, 'Store found:', store?.id)

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Handle mock demo session details
    if (sessionId === 'demo-session') {
      return NextResponse.json({
        orders: [],
        totalSpent: 0,
        ordersCount: 0,
        cartItems: [],
        firstInteractionDate: '15 mar 2025'
      })
    }

    const session = await (prisma as any).whatsAppSession.findUnique({
      where: { id: sessionId }
    })
    console.log('[API WhatsApp Session GET] sessionId:', sessionId, 'Session found:', session?.id)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    console.log('[API WhatsApp Session GET] comparing storeId:', session.storeId, 'with store.id:', store.id)

    if (session.storeId !== store.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch customer's orders history
    const orders = await prisma.order.findMany({
      where: { 
        storeId: store.id,
        customerPhone: session.phoneNumber 
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalSpent = orders
      .filter(o => o.status === 'paid' || o.paymentStatus === 'PAID')
      .reduce((acc, curr) => acc + curr.total, 0)

    const firstOrder = orders[orders.length - 1]
    const firstInteractionDate = firstOrder 
      ? new Date(firstOrder.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date(session.lastInteraction).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

    // Parse cart items
    let cartItems: any[] = []
    if (session.cart) {
      try {
        const cartObj = typeof session.cart === 'string' ? JSON.parse(session.cart) : session.cart
        if (cartObj && cartObj.items) {
          cartItems = Object.values(cartObj.items)
        }
      } catch (e) {
        console.error('Error parsing cart:', e)
      }
    }

    return NextResponse.json({
      orders,
      totalSpent,
      ordersCount: orders.length,
      cartItems,
      firstInteractionDate
    })

  } catch (err: any) {
    console.error('[API WhatsApp Session GET Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, tags, notes, assignedTo, isFavorite, status } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // 1. Buscar la tienda del usuario
    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // 2. Buscar la sesión de WhatsApp (si es demo, omitir guardado de DB y retornar éxito)
    if (sessionId === 'demo-session') {
      return NextResponse.json({ success: true })
    }

    const session = await (prisma as any).whatsAppSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // 3. Validar que la sesión pertenece a la tienda
    if (session.storeId !== store.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. Construir objeto de actualización
    const updateData: any = {}
    if (tags !== undefined) updateData.tags = tags
    if (notes !== undefined) updateData.notes = notes
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite
    if (status !== undefined) updateData.status = status

    const updated = await (prisma as any).whatsAppSession.update({
      where: { id: sessionId },
      data: updateData
    })

    return NextResponse.json({ success: true, session: updated })

  } catch (err: any) {
    console.error('[API WhatsApp Session Update Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
