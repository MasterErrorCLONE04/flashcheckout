import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { waClient as officialWaClient } from '@/lib/whatsapp/cloud-api'
import {
  cartStateToLines,
  normalizeChatMessages,
  type CartLine,
  type WhatsAppChatMessage,
} from '@/lib/whatsapp/session-state'

export type SessionRecord = NonNullable<Awaited<ReturnType<typeof prisma.whatsAppSession.findUnique>>>
export type StoreRecord = NonNullable<Awaited<ReturnType<typeof prisma.store.findUnique>>>

export type BotClient = {
  sendText: (to: string, msg: string) => Promise<unknown>
  sendButtons: (to: string, msg: string, btns: { id: string; title: string }[]) => Promise<unknown>
  sendList: (
    to: string,
    hdr: string,
    bdy: string,
    btnText: string,
    secs: { title: string; rows: { id: string; title: string; description?: string }[] }[]
  ) => Promise<unknown>
  sendImage: (to: string, img: string, cap: string) => Promise<unknown>
  sendDocument: (to: string, doc: string, fn: string) => Promise<unknown>
  sendUrlButton: (to: string, bdy: string, btnText: string, url: string) => Promise<unknown>
  sendFlow?: (
    to: string,
    flowId: string,
    buttonText: string,
    flowToken: string,
    screen: string,
    data: Record<string, unknown>,
    header?: string,
    body?: string
  ) => Promise<unknown>
  sendLocationRequest?: (to: string, msg: string) => Promise<unknown>
}

export type ChatMessage = WhatsAppChatMessage
export type CartItem = CartLine

export function toChatMessages(value: unknown): ChatMessage[] {
  return normalizeChatMessages(value)
}

export type DownloadableWhatsAppClient = {
  sendText: (to: string, msg: string) => Promise<unknown>
  downloadMedia: (id: string | Record<string, unknown>) => Promise<{ buffer: Buffer }>
}

export function extractMediaId(mediaIdOrKey: string | Record<string, unknown>): string {
  if (typeof mediaIdOrKey === 'string') {
    return mediaIdOrKey
  }
  const candidate = (mediaIdOrKey as Record<string, unknown>).id
  return typeof candidate === 'string' ? candidate : ''
}

export function createDownloadableClient(
  instanceName?: string,
  messagePayload?: Record<string, unknown>
): DownloadableWhatsAppClient {
  if (instanceName && instanceName !== 'global') {
    return {
      sendText: async (to: string, msg: string) => {
        const { evolutionClient } = await import('@/lib/whatsapp/evolution')
        return evolutionClient.sendText(instanceName, to, msg)
      },
      downloadMedia: async (id: string | Record<string, unknown>) => {
        const { evolutionClient } = await import('@/lib/whatsapp/evolution')
        const buffer = await evolutionClient.downloadMedia(
          instanceName,
          typeof id === 'string' ? { id } : id,
          messagePayload || {}
        )
        return { buffer }
      },
    }
  }

  return {
    sendText: (to: string, msg: string) => officialWaClient.sendText(to, msg),
    downloadMedia: async (id: string | Record<string, unknown>) => {
      const mediaId = extractMediaId(id)
      if (!mediaId) {
        throw new Error('Media id missing for WhatsApp download')
      }
      return officialWaClient.downloadMedia(mediaId)
    },
  }
}

export async function getCartItemsForSession(session: SessionRecord): Promise<CartItem[]> {
  const items = cartStateToLines(session.cart)

  if (items.length > 0) {
    return items
  }

  if (session.cart && typeof session.cart === 'object' && !Array.isArray(session.cart)) {
    const legacyCart = session.cart as { productId?: string; storeId?: string }
    if (typeof legacyCart.productId === 'string') {
      const product = await prisma.product.findUnique({
        where: { id: legacyCart.productId },
      })

      if (product) {
        return [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            storeId: legacyCart.storeId || product.storeId,
          },
        ]
      }
    }
  }

  return []
}

export async function findWhatsAppSession(phoneNumber: string, storeId: string): Promise<SessionRecord | null> {
  return prisma.whatsAppSession.findUnique({
    where: {
      phoneNumber_storeId: {
        phoneNumber,
        storeId,
      },
    },
  })
}

export async function createWhatsAppSession(phoneNumber: string, storeId: string, receivingPhoneId: string): Promise<SessionRecord> {
  return prisma.whatsAppSession.create({
    data: {
      phoneNumber,
      storeId,
      receivingPhoneId,
      step: 'START',
    },
  })
}

export async function ensureWhatsAppSession(phoneNumber: string, storeId: string, receivingPhoneId: string): Promise<SessionRecord> {
  return (await findWhatsAppSession(phoneNumber, storeId)) ?? createWhatsAppSession(phoneNumber, storeId, receivingPhoneId)
}

export async function updateWhatsAppSession(id: string, data: Prisma.WhatsAppSessionUpdateInput): Promise<SessionRecord> {
  return prisma.whatsAppSession.update({
    where: { id },
    data,
  })
}

export function getBrebPaymentConfig(
  tableConfig: { enabled?: boolean; keyValue?: string; participantId?: string | null } | null | undefined,
  settings: unknown
) {
  if (tableConfig) return tableConfig
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  const config = (settings as Record<string, unknown>).brebConfig
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null
  return config as { enabled?: boolean; keyValue?: string; participantId?: string | null }
}
