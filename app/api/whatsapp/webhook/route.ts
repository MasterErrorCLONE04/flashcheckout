import { NextResponse } from 'next/server'
import { handleWhatsAppImage, handleWhatsAppMessage } from '@/lib/bot/chatbot-logic'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'
import {
  logWebhookError,
  logWebhookEvent,
  logWebhookWarn,
  parseJsonBody,
  verifyMetaWebhookSignature,
} from '@/lib/webhooks'

const VERIFY_TOKEN =
  process.env.NODE_ENV === 'production'
    ? process.env.WHATSAPP_VERIFY_TOKEN?.trim() ?? ''
    : process.env.WHATSAPP_VERIFY_TOKEN?.trim() || 'flashcheckout_secret'

const WHATSAPP_APP_SECRET =
  process.env.WHATSAPP_APP_SECRET?.trim() || process.env.META_APP_SECRET?.trim() || ''

const GLOBAL_STORE_ID = 'global'

type PlainObject = Record<string, unknown>

type MessageLog = {
  sender: 'user' | 'bot'
  text: string
  time: string
  timestamp: number
  eventId?: string
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
      id?: string
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
    typeof value.timestamp === 'number' &&
    (value.eventId === undefined || typeof value.eventId === 'string')
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
  const lastMessage = messages[messages.length - 1]
  const sameEvent =
    Boolean(message.eventId) &&
    Boolean(lastMessage?.eventId) &&
    lastMessage?.eventId === message.eventId

  if (
    sameEvent ||
    (lastMessage &&
      lastMessage.sender === message.sender &&
      lastMessage.text === message.text &&
      Math.abs(lastMessage.timestamp - message.timestamp) < 30000)
  ) {
    return session
  }

  messages.push(message)

  return prisma.whatsAppSession.update({
    where: { id: session.id },
    data: { messages },
  })
}

async function logIncomingMessage(
  from: string,
  text: string,
  eventId: string | undefined = undefined,
  storeId: string = GLOBAL_STORE_ID,
  receivingPhoneId: string = GLOBAL_STORE_ID
): Promise<SessionRecord> {
  const session = await upsertSession(from, storeId, receivingPhoneId)
  return appendMessage(session, {
    sender: 'user',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
    eventId,
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

function extractMetaEventId(message: MetaMessage): string | undefined {
  return typeof message.id === 'string' ? message.id : undefined
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
  const latitude = typeof location.latitude === 'number' ? location.latitude : (typeof location.degreesLatitude === 'number' ? location.degreesLatitude : null)
  const longitude = typeof location.longitude === 'number' ? location.longitude : (typeof location.degreesLongitude === 'number' ? location.degreesLongitude : null)

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
    logWebhookError('whatsapp', 'missing_verify_token', { mode: 'GET' })
    return new Response('Config error', { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    logWebhookEvent('whatsapp', 'challenge_verified', { mode })
    return new Response(challenge ?? '', { status: 200 })
  }

  logWebhookWarn('whatsapp', 'challenge_rejected', {
    mode,
    hasToken: Boolean(token),
  })
  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const body = parseJsonBody(rawBody)
    const requestId =
      req.headers.get('x-request-id') ??
      req.headers.get('x-webhook-delivery') ??
      req.headers.get('x-message-id') ??
      undefined

    if (!body) {
      logWebhookWarn('whatsapp', 'invalid_json', { requestId })
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (isEvolutionWebhookBody(body)) {
      logWebhookEvent('whatsapp', 'received', {
        transport: 'evolution',
        requestId,
        instance: body.instance,
        event: body.event,
      })
      return handleEvolutionWebhook(body)
    }

    if (!WHATSAPP_APP_SECRET && process.env.NODE_ENV === 'production') {
      logWebhookError('whatsapp', 'missing_app_secret', { requestId })
      return NextResponse.json({ error: 'Webhook config error' }, { status: 500 })
    }

    const signatureHeader = req.headers.get('x-hub-signature-256')

    if (WHATSAPP_APP_SECRET && !verifyMetaWebhookSignature(rawBody, signatureHeader, WHATSAPP_APP_SECRET)) {
      logWebhookWarn('whatsapp', 'signature_rejected', {
        requestId,
        hasSignature: Boolean(signatureHeader),
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (!WHATSAPP_APP_SECRET) {
      logWebhookWarn('whatsapp', 'signature_skipped', {
        requestId,
        reason: 'missing_secret',
      })
    }

    const message = extractMetaMessage(body)
    if (!message) {
      logWebhookEvent('whatsapp', 'ignored', {
        requestId,
        reason: 'no_message_payload',
      })
      return NextResponse.json({ status: 'ok' })
    }

    const from = message.from
    const eventId = extractMetaEventId(message)
    const messageType = message.type

    logWebhookEvent('whatsapp', 'received', {
      transport: 'meta',
      requestId,
      from,
      messageType,
      eventId,
    })

    if (messageType === 'image') {
      const image = isPlainObject(message.image) ? message.image : null
      const mediaId = typeof image?.id === 'string' ? image.id : ''
      const mimeType = typeof image?.mime_type === 'string' ? image.mime_type : 'image/jpeg'

      if (mediaId) {
        logWebhookEvent('whatsapp', 'image_received', {
          from,
          requestId,
          mediaId,
          mimeType,
        })
        await logIncomingMessage(from, '[Imagen comprobante de pago]', eventId)
        await handleWhatsAppImage(from, mediaId, mimeType)
      }
    } else if (messageType === 'location') {
      const session = await upsertSession(from, GLOBAL_STORE_ID, GLOBAL_STORE_ID)
      const location = isPlainObject(message.location) ? message.location : null

      if (session.step === 'AWAITING_ADDRESS' && location) {
        const addressText = formatLocationText(location)

        if (addressText) {
          logWebhookEvent('whatsapp', 'location_received', {
            from,
            requestId,
            addressText,
          })
          await appendMessage(session, {
            sender: 'user',
            text: `[Ubicación] ${addressText}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            eventId,
          })
          await handleWhatsAppMessage(from, addressText, GLOBAL_STORE_ID)
        }
      } else {
        logWebhookWarn('whatsapp', 'location_ignored', {
          from,
          requestId,
          step: session.step,
        })
        await waClient.sendText(
          from,
          'Lo siento, no estoy esperando una ubicación en este momento. Si quieres hacer un pedido, escribe "Hola".'
        )
      }
    } else {
      const text = extractMetaText(message)

      if (text) {
        logWebhookEvent('whatsapp', 'text_received', {
          from,
          requestId,
          textLength: text.length,
          eventId,
        })
        await logIncomingMessage(from, text, eventId)
        await handleWhatsAppMessage(from, text, GLOBAL_STORE_ID)
      } else {
        logWebhookEvent('whatsapp', 'ignored', {
          from,
          requestId,
          reason: 'unsupported_meta_message',
          messageType,
        })
      }
    }

    logWebhookEvent('whatsapp', 'processed', { requestId, from })
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    logWebhookError('whatsapp', 'handler_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
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
      logWebhookEvent('whatsapp', 'ignored', {
        transport: 'evolution',
        reason: 'invalid_payload',
      })
      return NextResponse.json({ status: 'ignored' })
    }

    const fromMe = key.fromMe === true
    const remoteJid = key.remoteJid
    const from = remoteJid.split('@')[0]

    const message = data?.message
    if (!isPlainObject(message)) {
      logWebhookEvent('whatsapp', 'ignored', {
        transport: 'evolution',
        reason: 'missing_message',
        instanceName,
      })
      return NextResponse.json({ status: 'ignored' })
    }

    const messageType = typeof data?.messageType === 'string' ? data.messageType : 'conversation'
    const text = extractEvolutionText(messageType, message)

    const store = await prisma.store.findUnique({
      where: { whatsappInstanceName: instanceName },
    })

    if (!store) {
      logWebhookWarn('whatsapp', 'store_not_found', {
        transport: 'evolution',
        instanceName,
      })
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    let session = await upsertSession(from, store.id, instanceName)
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const eventId = typeof key.id === 'string' ? key.id : undefined

    logWebhookEvent('whatsapp', 'received', {
      transport: 'evolution',
      instanceName,
      storeId: store.id,
      from,
      messageType,
      eventId,
    })

    if (fromMe) {
      const messages = toMessageLogs(session.messages)
      const lastMsg = messages[messages.length - 1]
      const isDuplicate =
        (!!eventId && lastMsg?.eventId === eventId) ||
        (!!lastMsg && lastMsg.text === text && lastMsg.sender === 'bot')

      if (!isDuplicate && text) {
        session = await appendMessage(session, {
          sender: 'bot',
          text,
          time: timeString,
          timestamp: Date.now(),
          eventId,
        })
      }
    } else if (messageType === 'imageMessage') {
      session = await appendMessage(session, {
        sender: 'user',
        text: '[Imagen comprobante de pago]',
        time: timeString,
        timestamp: Date.now(),
        eventId,
      })

      const imagePayload = isPlainObject(message.imageMessage) ? message.imageMessage : null
      const mimeType =
        typeof imagePayload?.mimetype === 'string' ? imagePayload.mimetype : 'image/jpeg'

      await handleWhatsAppImage(from, key, mimeType, store.id, instanceName, message)
    } else if (messageType === 'locationMessage') {
      const location = isPlainObject(message.locationMessage) ? message.locationMessage : null

      // Aceptar la ubicación si el paso es AWAITING_ADDRESS O si hay artículos en el carrito (la IA puede
      // haber pedido la ubicación conversacionalmente sin actualizar el step en la BD a AWAITING_ADDRESS)
      const cartObj = session.cart as any
      const hasCartItems = cartObj && cartObj.items && Object.keys(cartObj.items).length > 0
      const shouldAcceptLocation = (session.step === 'AWAITING_ADDRESS' || hasCartItems) && location

      if (shouldAcceptLocation && location) {
        const addressText = formatLocationText(location)

        if (addressText) {
          logWebhookEvent('whatsapp', 'location_received', {
            transport: 'evolution',
            from,
            addressText,
            step: session.step,
          })

          // Si el paso no era AWAITING_ADDRESS, forzar el estado para que el handler lo procese correctamente
          if (session.step !== 'AWAITING_ADDRESS') {
            const { prisma: db } = await import('@/lib/prisma')
            session = await db.whatsAppSession.update({
              where: { id: session.id },
              data: { step: 'AWAITING_ADDRESS' }
            }) as any
          }

          session = await appendMessage(session, {
            sender: 'user',
            text: `[Ubicación] ${addressText}`,
            time: timeString,
            timestamp: Date.now(),
            eventId,
          })
          await handleWhatsAppMessage(from, addressText, session)
        }
      } else {
        logWebhookWarn('whatsapp', 'location_ignored', {
          transport: 'evolution',
          from,
          step: session.step,
          hasCartItems,
        })
        const { evolutionClient } = await import('@/lib/whatsapp/evolution');
        await evolutionClient.sendText(
          instanceName,
          from,
          'Lo siento, no estoy esperando una ubicación en este momento. Si quieres hacer un pedido, escribe "Hola".'
        )
      }
    } else if (text) {
      session = await appendMessage(session, {
        sender: 'user',
        text,
        time: timeString,
        timestamp: Date.now(),
        eventId,
      })

      await handleWhatsAppMessage(from, text, session)
    }

    logWebhookEvent('whatsapp', 'processed', {
      transport: 'evolution',
      instanceName,
      storeId: store.id,
      from,
      messageType,
    })
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    logWebhookError('whatsapp', 'evolution_handler_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
