import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 mins

    await prisma.store.update({
      where: { id: store.id },
      data: {
        otpCode,
        otpExpiresAt
      }
    })

    try {
      await waClient.sendText(
        store.whatsapp,
        `¡Hola! Tu nuevo código de verificación para FlashCheckout es: *${otpCode}*. Ingrésalo en tu panel para verificar tu cuenta.`
      )
    } catch (err: any) {
      console.error('Error sending resend OTP:', err)
      const errMsg = err?.message || ''
      if (errMsg.includes('131030') || errMsg.includes('allowed list')) {
        let userFriendlyMsg = 'El número de WhatsApp no está en la lista de destinatarios autorizados de la cuenta Sandbox de Meta.'
        if (process.env.NODE_ENV === 'development') {
          userFriendlyMsg += ` [Desarrollo] Tu código OTP es: ${otpCode}`
        } else {
          userFriendlyMsg += ' Por favor, agrégalo en tu panel de desarrollador de Facebook.'
        }
        return NextResponse.json({
          error: userFriendlyMsg,
          code: 'WHATSAPP_SANDBOX_RESTRICTION'
        }, { status: 400 })
      }
      return NextResponse.json({ error: 'No se pudo enviar el mensaje por WhatsApp' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Código OTP reenviado' })
  } catch (error: any) {
    console.error('RESEND_OTP_ERROR:', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
