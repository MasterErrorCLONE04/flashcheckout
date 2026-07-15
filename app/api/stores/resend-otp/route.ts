import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { getErrorMessage } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

type ResendOtpBody = {
  otpCode?: string
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as ResendOtpBody | null
    const otpCode = body?.otpCode

    if (!otpCode) {
      return NextResponse.json({ error: 'El codigo OTP es requerido' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    await prisma.store.update({
      where: { id: store.id },
      data: {
        otpCode,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    try {
      await waClient.sendText(
        store.whatsapp,
        `¡Hola! Tu nuevo codigo de verificacion para FlashCheckout es: *${otpCode}*. Ingresalo en tu panel para verificar tu cuenta.`
      )
    } catch (err: unknown) {
      console.error('Error sending resend OTP:', err)
      const errMsg = getErrorMessage(err, '')
      if (errMsg.includes('131030') || errMsg.includes('allowed list')) {
        let userFriendlyMsg =
          'El numero de WhatsApp no esta en la lista de destinatarios autorizados de la cuenta Sandbox de Meta.'
        if (process.env.NODE_ENV === 'development') {
          userFriendlyMsg += ` [Desarrollo] Tu codigo OTP es: ${otpCode}`
        } else {
          userFriendlyMsg += ' Por favor, agregalo en tu panel de desarrollador de Facebook.'
        }
        return NextResponse.json(
          {
            error: userFriendlyMsg,
            code: 'WHATSAPP_SANDBOX_RESTRICTION',
          },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'No se pudo enviar el mensaje por WhatsApp' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Codigo OTP reenviado' })
  } catch (error: unknown) {
    console.error('RESEND_OTP_ERROR:', error)
    return NextResponse.json({ error: getErrorMessage(error, 'Error del servidor') }, { status: 500 })
  }
}
