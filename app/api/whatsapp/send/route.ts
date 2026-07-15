import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { normalizeChatMessages } from '@/lib/whatsapp/session-state'
import {
  badRequest,
  forbidden,
  getErrorMessage,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'

type SendBody = {
  sessionId?: string
  text?: string
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = (await req.json().catch(() => null)) as SendBody | null
    if (!body?.sessionId || !body.text) {
      return badRequest('Missing sessionId or text')
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    })
    if (!store) return notFound('Store not found')

    const session = await prisma.whatsAppSession.findUnique({
      where: { id: body.sessionId },
    })
    if (!session) return notFound('Session not found')

    if (session.storeId !== store.id) return forbidden()

    const formattedText = `[Asesor Humano]: ${body.text}`

    if (store.whatsappInstanceName && store.whatsappConnected) {
      const { evolutionClient } = await import('@/lib/whatsapp/evolution')
      await evolutionClient.sendText(
        store.whatsappInstanceName,
        session.phoneNumber,
        formattedText
      )
    } else {
      await waClient.sendText(session.phoneNumber, formattedText)
    }

    const timeString = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    const messages = normalizeChatMessages(session.messages)
    messages.push({
      sender: 'bot',
      text: formattedText,
      time: timeString,
      timestamp: Date.now(),
    })

    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { messages: messages as any },
    })

    return NextResponse.json({
      success: true,
      message: {
        sender: 'bot',
        text: formattedText,
        time: timeString,
        timestamp: Date.now(),
      },
    })
  } catch (err: unknown) {
    console.error('[API WhatsApp Send Error]', err)
    return internalServerError(getErrorMessage(err))
  }
}
