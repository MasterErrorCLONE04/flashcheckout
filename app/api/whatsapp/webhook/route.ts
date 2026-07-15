import { NextResponse } from 'next/server'
import { handleWhatsAppImage, handleWhatsAppMessage } from '@/lib/bot/chatbot-logic'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

const VERIFY_TOKEN =
  process.env.NODE_ENV === 'production'
    ? process.env.WHATSAPP_VERIFY_TOKEN?.trim() ?? ''
    : process.env.WHATSAPP_VERIFY_TOKEN?.trim() || 'flashcheckout_secret'

const GLOBAL_STORE_ID = 'global'

type PlainObject = Record<string, unknown>

type MessageLog = {
  sender: 'user' | 'bot'
  text: string
  time: string
  timestamp: number
}

type SessionRecord = NonNullable<Awaited<ReturnType<typeof prisma.whatsAppSession.findUnique>>>

type MetaMessage = PlainObject & {
  from: string
  type: string
}

type EvolutionWebhookBody = {
  event?: string
  instance?: string
  data?: {
    key?: {
      fromMe?: boolean
      remoteJid?: string
    }
    message?: PlainObject
    messageType?: string
  }
}

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMessageLog(value: unknown): value is MessageLog {
  return (
    isPlainObject(value) &&
    (value.sender === 'user' || value.sender === 'bot') &&
    typeof value.text === 'string' &&
    typeof value.time === 'string' &&
    typeof value.timestamp === 'number'
  )
}

function toMessageLogs(value: unknown): MessageLog[] {
  return Array.isArray(value) ? value.filter(isMessageLog) : []
}

async function upsertSession(
  phoneNumber: string,
  storeId: string,
  receivingPhoneId: string
): Promise<SessionRecord> {
  return prisma.whatsAppSession.upsert({
    where: {
      phoneNumber_storeId: {
        phoneNumber,
        storeId,
      },
    },
    update: { receivingPhoneId },
    create: {
      phoneNumber,
      storeId,
      receivingPhoneId,
      step: 'START',
    },
  })
}

async function appendMessage(session: SessionRecord, message: MessageLog): Promise<SessionRecord> {
  const messages = toMessageLogs(session.messages)
  messages.push(message)

  return prisma.whatsAppSession.update({
    where: { id: session.id },
    data: { messages },
  })
}

async function logIncomingMessage(
  from: string,
  text: string,
  storeId: string = GLOBAL_STORE_ID,
  receivingPhoneId: string = GLOBAL_STORE_ID
): Promise<SessionRecord> {
  const session = await upsertSession(from, storeId, receivingPhoneId)
  return appendMessage(session, {
    sender: 'user',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
  })
}

function extractMetaMessage(body: unknown): MetaMessage | null {
  if (!isPlainObject(body)) return null

  const entry = Array.isArray(body.entry) ? body.entry[0] : null
  const change = isPlainObject(entry) && Array.isArray(entry.changes) ? entry.changes[0] : null
  const value = isPlainObject(change) ? change.value : null
  const message = isPlainObject(value) && Array.isArray(value.messages) ? value.messages[0] : null

  if (!isPlainObject(message) || typeof message.from !== 'string' || typeof message.type !== 'string') {
    return null
  }

  return message as MetaMessage
}

function extractMetaText(message: MetaMessage): string {
  if (message.type === 'text') {
    const text = isPlainObject(message.text) ? message.text : null
    return typeof text?.body === 'string' ? text.body : ''
  }

  if (message.type === 'interactive') {
    const interactive = isPlainObject(message.interactive) ? message.interactive : null
    if (!interactive) return ''

    if (interactive.type === 'button_reply') {
      const buttonReply = isPlainObject(interactive.button_reply) ? interactive.button_reply : null
      return typeof buttonReply?.id === 'string' ? buttonReply.id : ''
    }

    if (interactive.type === 'list_reply') {
      const listReply = isPlainObject(interactive.list_reply) ? interactive.list_reply : null
      return typeof listReply?.id === 'string' ? listReply.id : ''
    }

    if (interactive.type === 'nfm_reply') {
      const nfmReply = isPlainObject(interactive.nfm_reply) ? interactive.nfm_reply : null
      const responseJson = typeof nfmReply?.response_json === 'string' ? nfmReply.response_json : ''
      return `flow_response_${responseJson}`
    }
  }

  return ''
}

function isEvolutionWebhookBody(body: unknown): body is EvolutionWebhookBody {
  if (!isPlainObject(body)) return false
  if (typeof body.event !== 'string' || typeof body.instance !== 'string') return false
  if (!isPlainObject(body.data)) return false
  return isPlainObject(body.data.key)
}

function extractEvolutionText(messageType: string, message: PlainObject): string {
  if (messageType === 'conversation') {
    return typeof message.conversation === 'string' ? message.conversation : ''
  }

  if (messageType === 'extendedTextMessage') {
    const payload = isPlainObject(message.extendedTextMessage) ? message.extendedTextMessage : null
    return typeof payload?.text === 'string' ? payload.text : ''
  }

  if (messageType === 'imageMessage') {
    return '[Imagen comprobante de pago]'
  }

  if (messageType === 'documentMessage') {
    const payload = isPlainObject(message.documentMessage) ? message.documentMessage : null
    const fileName = typeof payload?.fileName === 'string' ? payload.fileName : ''
    return `[Documento] ${fileName}`
  }

  return ''
}

function formatLocationText(location: PlainObject): string {
  const latitude = typeof location.latitude === 'number' ? location.latitude : null
  const longitude = typeof location.longitude === 'number' ? location.longitude : null

  if (latitude === null || longitude === null) {
    return ''
  }

  if (typeof location.address === 'string' && location.address) {
    return `${location.address} (${latitude}, ${longitude})`
  }

  if (typeof location.name === 'string' && location.name) {
    return `${location.name} (${latitude}, ${longitude})`
  }

  return `${latitude},${longitude}`
}

export async function GET(req: Request) {
  if (!VERIFY_TOKEN) {
    return new Response('Config error', { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified successfully.')
    return new Response(challenge ?? '', { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: Request) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (isEvolutionWebhookBody(body)) {
      return handleEvolutionWebhook(body)
    }

    const message = extractMetaMessage(body)
    if (!message) {
      return NextResponse.json({ status: 'ok' })
    }

    const from = message.from

    if (message.type === 'image') {
      const image = isPlainObject(message.image) ? message.image : null
      const mediaId = typeof image?.id === 'string' ? image.id : ''
      const mimeType = typeof image?.mime_type === 'string' ? image.mime_type : 'image/jpeg'

      if (mediaId) {
        console.log(
          `[WhatsApp Webhook] Incoming image from ${from}: mediaId=${mediaId}, mimeType=${mimeType}`
        )
        await logIncomingMessage(from, '[Imagen comprobante de pago]')
        await handleWhatsAppImage(from, mediaId, mimeType)
      }
    } else if (message.type === 'location') {
      const session = await upsertSession(from, GLOBAL_STORE_ID, GLOBAL_STORE_ID)
      const location = isPlainObject(message.location) ? message.location : null

      if (session.step === 'AWAITING_ADDRESS' && location) {
        const addressText = formatLocationText(location)

        if (addressText) {
          console.log(`[WhatsApp Webhook] Incoming location from ${from}: ${addressText}`)
          await appendMessage(session, {
            sender: 'user',
            text: `[Ubicación] ${addressText}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
          })
          await handleWhatsAppMessage(from, addressText, GLOBAL_STORE_ID)
        }
      } else {
        await waClient.sendText(
          from,
          'Lo siento, no estoy esperando una ubicación en este momento. Si quieres hacer un pedido, escribe "Hola".'
        )
      }
    } else {
      const text = extractMetaText(message)

      if (text) {
        console.log(`[WhatsApp Webhook] Incoming from ${from}: ${text}`)
        await logIncomingMessage(from, text)
        await handleWhatsAppMessage(from, text, GLOBAL_STORE_ID)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function handleEvolutionWebhook(body: EvolutionWebhookBody) {
  try {
    const instanceName = body.instance?.trim()
    const data = body.data
    const key = data?.key

    if (
      body.event !== 'messages.upsert' ||
      !instanceName ||
      !key ||
      typeof key.remoteJid !== 'string'
    ) {
      return NextResponse.json({ status: 'ignored' })
    }

    const fromMe = key.fromMe === true
    const remoteJid = key.remoteJid
    const from = remoteJid.split('@')[0]

    const message = data?.message
    if (!isPlainObject(message)) {
      return NextResponse.json({ status: 'ignored' })
    }

    const messageType = typeof data?.messageType === 'string' ? data.messageType : 'conversation'
    const text = extractEvolutionText(messageType, message)

    const store = await prisma.store.findUnique({
      where: { whatsappInstanceName: instanceName },
    })

    if (!store) {
      console.warn(`[Evolution Webhook] Store not found for instance: ${instanceName}`)
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    let session = await upsertSession(from, store.id, instanceName)
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    if (fromMe) {
      const messages = toMessageLogs(session.messages)
      const lastMsg = messages[messages.length - 1]
      const isDuplicate = !!lastMsg && lastMsg.text === text && lastMsg.sender === 'bot'

      if (!isDuplicate && text) {
        session = await appendMessage(session, {
          sender: 'bot',
          text,
          time: timeString,
          timestamp: Date.now(),
        })
      }
    } else if (messageType === 'imageMessage') {
      session = await appendMessage(session, {
        sender: 'user',
        text: '[Imagen comprobante de pago]',
        time: timeString,
        timestamp: Date.now(),
      })

      const imagePayload = isPlainObject(message.imageMessage) ? message.imageMessage : null
      const mimeType =
        typeof imagePayload?.mimetype === 'string' ? imagePayload.mimetype : 'image/jpeg'

      await handleWhatsAppImage(from, key, mimeType, store.id, instanceName, message)
    } else if (text) {
      session = await appendMessage(session, {
        sender: 'user',
        text,
        time: timeString,
        timestamp: Date.now(),
      })

      await handleWhatsAppMessage(from, text, session)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[handleEvolutionWebhook Error]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
