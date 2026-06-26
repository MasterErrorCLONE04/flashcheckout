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
    const { otpCode } = body

    if (!otpCode) {
      return NextResponse.json({ error: 'El código OTP es requerido' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    if (!store.otpCode || store.otpCode !== otpCode) {
      return NextResponse.json({ error: 'El código OTP es incorrecto' }, { status: 400 })
    }

    if (store.otpExpiresAt && store.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: 'El código OTP ha expirado' }, { status: 400 })
    }

    await prisma.store.update({
      where: { id: store.id },
      data: {
        whatsappVerified: true,
        otpCode: null,
        otpExpiresAt: null
      }
    })

    return NextResponse.json({ success: true, message: 'WhatsApp verificado correctamente' })
  } catch (error: any) {
    console.error('VERIFY_OTP_ERROR:', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
