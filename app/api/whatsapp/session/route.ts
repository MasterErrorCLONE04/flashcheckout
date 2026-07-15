import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { cartStateToLines } from '@/lib/whatsapp/session-state'
import { badRequest, getErrorMessage, internalServerError, notFound, unauthorized, forbidden } from '@/lib/api/route-utils'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) return badRequest('Missing sessionId')

    const store = await prisma.store.findFirst({
      where: { userId }
    })
    console.log('[API WhatsApp Session GET] userId:', userId, 'Store found:', store?.id)

    if (!store) return notFound('Store not found')

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

    const session = await prisma.whatsAppSession.findUnique({
      where: { id: sessionId }
    })
    console.log('[API WhatsApp Session GET] sessionId:', sessionId, 'Session found:', session?.id)

    if (!session) return notFound('Session not found')

    console.log('[API WhatsApp Session GET] comparing storeId:', session.storeId, 'with store.id:', store.id)

    if (session.storeId !== store.id) return forbidden()

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
    const cartItems = cartStateToLines(session.cart)

    return NextResponse.json({
      orders,
      totalSpent,
      ordersCount: orders.length,
      cartItems,
      firstInteractionDate
    })

  } catch (err) {
    console.error('[API WhatsApp Session GET Error]', err)
    return internalServerError(getErrorMessage(err))
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = await req.json()
    const { sessionId, tags, notes, assignedTo, isFavorite, status } = body

    if (!sessionId) return badRequest('Missing sessionId')

    // 1. Buscar la tienda del usuario
    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) return notFound('Store not found')

    // 2. Buscar la sesión de WhatsApp (si es demo, omitir guardado de DB y retornar éxito)
    if (sessionId === 'demo-session') return NextResponse.json({ success: true })

    const session = await prisma.whatsAppSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) return notFound('Session not found')

    // 3. Validar que la sesión pertenece a la tienda
    if (session.storeId !== store.id) return forbidden()

    // 4. Construir objeto de actualización
    const updateData: Prisma.WhatsAppSessionUpdateInput = {}

    if (Array.isArray(tags)) {
      updateData.tags = tags
    }
    if (Array.isArray(notes) || notes === null) {
      updateData.notes = notes
    }
    if (typeof assignedTo === 'string') {
      updateData.assignedTo = assignedTo
    }
    if (typeof isFavorite === 'boolean') {
      updateData.isFavorite = isFavorite
    }
    if (typeof status === 'string') {
      updateData.status = status
    }

    if (Object.keys(updateData).length === 0) return badRequest('No valid fields to update')

    const updated = await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: updateData
    })

    return NextResponse.json({ success: true, session: updated })

  } catch (err) {
    console.error('[API WhatsApp Session Update Error]', err)
    return internalServerError(getErrorMessage(err))
  }
}
