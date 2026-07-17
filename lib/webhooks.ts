import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

export type WebhookSource = 'stripe' | 'mercadopago' | 'whatsapp'

type WebhookLogLevel = 'info' | 'warn' | 'error'
type WebhookLogContext = Record<string, unknown>

function emitWebhookLog(
  level: WebhookLogLevel,
  source: WebhookSource,
  message: string,
  context: WebhookLogContext = {}
) {
  const payload = {
    timestamp: new Date().toISOString(),
    source,
    message,
    ...context,
  }

  const line = JSON.stringify(payload)

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.log(line)
}

export function logWebhookEvent(
  source: WebhookSource,
  message: string,
  context: WebhookLogContext = {}
) {
  emitWebhookLog('info', source, message, context)
}

export function logWebhookWarn(
  source: WebhookSource,
  message: string,
  context: WebhookLogContext = {}
) {
  emitWebhookLog('warn', source, message, context)
}

export function logWebhookError(
  source: WebhookSource,
  message: string,
  context: WebhookLogContext = {}
) {
  emitWebhookLog('error', source, message, context)
}

function safeHexToBuffer(hexValue: string): Buffer | null {
  if (!hexValue || hexValue.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hexValue)) {
    return null
  }

  try {
    return Buffer.from(hexValue, 'hex')
  } catch {
    return null
  }
}

function parseMercadoPagoSignature(signatureHeader: string) {
  const parts = signatureHeader
    .split(',')
    .map(part => part.trim())
    .reduce<Record<string, string>>((acc, part) => {
      const separatorIndex = part.indexOf('=')
      if (separatorIndex === -1) {
        return acc
      }

      const key = part.slice(0, separatorIndex).trim()
      const value = part.slice(separatorIndex + 1).trim()

      if (key && value) {
        acc[key] = value
      }

      return acc
    }, {})

  return {
    ts: parts.ts ?? null,
    v1: parts.v1 ?? null,
  }
}

export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string
) {
  if (!secret.trim() || !signatureHeader?.trim()) {
    return false
  }

  const normalizedSignature = signatureHeader.trim().replace(/^sha256=/i, '')
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest()
  const received = safeHexToBuffer(normalizedSignature)

  if (!received || received.length !== expected.length) {
    return false
  }

  return timingSafeEqual(expected, received)
}

export function verifyMercadoPagoWebhookSignature(params: {
  dataId?: string | null
  secret: string
  xRequestId?: string | null
  xSignature?: string | null
}) {
  const { dataId, secret, xRequestId, xSignature } = params

  if (!secret.trim() || !xSignature?.trim()) {
    return false
  }

  const { ts, v1 } = parseMercadoPagoSignature(xSignature)

  if (!ts || !v1) {
    return false
  }

  const manifestParts: string[] = []

  if (dataId?.trim()) {
    manifestParts.push(`id:${dataId.trim()}`)
  }

  if (xRequestId?.trim()) {
    manifestParts.push(`request-id:${xRequestId.trim()}`)
  }

  manifestParts.push(`ts:${ts}`)

  const manifest = `${manifestParts.join(';')};`
  const expected = createHmac('sha256', secret).update(manifest, 'utf8').digest()
  const received = safeHexToBuffer(v1)

  if (!received || received.length !== expected.length) {
    return false
  }

  return timingSafeEqual(expected, received)
}

export function parseJsonBody<T = unknown>(rawBody: string): T | null {
  try {
    return JSON.parse(rawBody) as T
  } catch {
    return null
  }
}
