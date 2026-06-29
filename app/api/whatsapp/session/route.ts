import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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
