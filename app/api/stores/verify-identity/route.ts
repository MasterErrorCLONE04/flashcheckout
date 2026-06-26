import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { idProofUrl } = body

    if (!idProofUrl) {
      return NextResponse.json({ error: 'La URL del comprobante de identidad es requerida' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    await prisma.store.update({
      where: { id: store.id },
      data: {
        verificationLevel: 1,
        idProofUrl,
        active: true,
        pausedReason: null
      }
    })

    return NextResponse.json({ success: true, message: 'Identidad verificada e ingreso a Nivel 1 completado exitosamente.' })
  } catch (error: any) {
    console.error('VERIFY_IDENTITY_ERROR:', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
