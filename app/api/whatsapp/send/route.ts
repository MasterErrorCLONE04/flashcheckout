import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, text } = await req.json()
    if (!sessionId || !text) {
      return NextResponse.json({ error: 'Missing sessionId or text' }, { status: 400 })
    }

    // 1. Buscar la tienda del usuario
    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // 2. Buscar la sesión de WhatsApp
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

    // Formatear mensaje como intervención humana
    const formattedText = `[Asesor Humano]: ${text}`

    // 4. Enviar vía WhatsApp (Evolution API si está conectado, de lo contrario Meta API)
    if (store.whatsappInstanceName && store.whatsappConnected) {
      const { evolutionClient } = await import('@/lib/whatsapp/evolution')
      await evolutionClient.sendText(store.whatsappInstanceName, session.phoneNumber, formattedText)
    } else {
      await waClient.sendText(session.phoneNumber, formattedText)
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Log the outgoing human advisor message in the database immediately
    const messages = Array.isArray(session.messages) ? (session.messages as any[]) : []
    messages.push({
      sender: 'bot',
      text: formattedText,
      time: timeString,
      timestamp: Date.now()
    })

    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { messages }
    })

    return NextResponse.json({
      success: true,
      message: {
        sender: 'bot',
        text: formattedText,
        time: timeString,
        timestamp: Date.now()
      }
    })

  } catch (err: any) {
    console.error('[API WhatsApp Send Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
