import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'
import {
  cartStateToLines,
  buildCartState,
  normalizeChatMessages,
} from '@/lib/whatsapp/session-state'
import {
  badRequest,
  getErrorMessage,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'

type SendPaymentLinkBody = {
  sessionId?: string
}

type SessionWithStore = {
  id: string
  phoneNumber: string
  customerName: string | null
  address: string | null
  storeId: string
  cart: unknown
  messages: unknown
  step: string
}

type CartLine = {
  id: string
  name: string
  price: number
  qty: number
}

type MercadoPagoPreferenceBody = {
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    currency_id: string
  }>
  external_reference: string
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  metadata: {
    orderId: string
    storeId: string
  }
  notification_url?: string
  auto_return?: 'approved'
}

function parseSessionBody(body: unknown): SendPaymentLinkBody | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const record = body as Record<string, unknown>
  return {
    sessionId: typeof record.sessionId === 'string' ? record.sessionId : undefined,
  }
}

function extractPaymentLines(cart: unknown): CartLine[] {
  return cartStateToLines(cart).map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
  }))
}

async function getStoreForUser(userId: string) {
  return prisma.store.findFirst({
    where: { userId },
    select: {
      id: true,
      slug: true,
      mpAccessToken: true,
      whatsappConnected: true,
      whatsappInstanceName: true,
    },
  })
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = parseSessionBody(await req.json().catch(() => null))
    if (!body?.sessionId) return badRequest('Missing sessionId')

    const store = await getStoreForUser(userId)
    if (!store) return notFound('Store not found')

    if (body.sessionId === 'demo-session') {
      return NextResponse.json({ success: true, paymentLink: '#' })
    }

    const session = (await prisma.whatsAppSession.findFirst({
      where: { id: body.sessionId, storeId: store.id },
      select: {
        id: true,
        phoneNumber: true,
        customerName: true,
        address: true,
        storeId: true,
        cart: true,
        messages: true,
        step: true,
      },
    })) as SessionWithStore | null

    if (!session) return notFound('Session not found')

    const items = extractPaymentLines(session.cart)
    if (items.length === 0) {
      return badRequest('El carrito está vacío')
    }

    const total = items.reduce((acc, item) => acc + item.price * item.qty, 0)
    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        customerName: session.customerName || 'Cliente WhatsApp',
        customerPhone: session.phoneNumber,
        customerWhatsAppId: session.phoneNumber,
        address: session.address || 'Pedido por Chat',
        city: 'Colombia',
        items,
        total,
        paymentStatus: 'PENDING',
        source: 'WHATSAPP',
      },
    })

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
    let paymentLink = `${base}/tienda/${store.slug}/exito?orderId=${order.id}`

    const tokenToUse = store.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (tokenToUse) {
      try {
        const preferenceData: { body: MercadoPagoPreferenceBody } = {
          body: {
            items: items.map(line => ({
              id: line.id,
              title: `${line.name} (x${line.qty})`,
              quantity: line.qty,
              unit_price: line.price,
              currency_id: 'COP',
            })),
            external_reference: order.id,
            back_urls: {
              success: `${base}/tienda/${store.slug}/exito`,
              failure: `${base}/tienda/${store.slug}`,
              pending: `${base}/tienda/${store.slug}`,
            },
            metadata: {
              orderId: order.id,
              storeId: store.id,
            },
          },
        }

        if (base.startsWith('https')) {
          preferenceData.body.notification_url = `${base}/api/webhook/mp`
          preferenceData.body.auto_return = 'approved'
        }

        const dynamicMpClient = new MercadoPagoConfig({
          accessToken: tokenToUse,
          options: { timeout: 10000 },
        })
        const dynamicMpPreference = new Preference(dynamicMpClient)
        const preference = await dynamicMpPreference.create(preferenceData)

        if (preference.init_point) {
          paymentLink = preference.init_point
        }
      } catch (mpErr) {
        console.error('Mercado Pago preference generation error:', mpErr)
      }
    }

    try {
      const messageText = `🛒 *Tu pedido está listo* 📝\n\nHemos preparado tu link de pago por un total de *$${total.toLocaleString('es-CO')} COP*.\n\nPuedes pagar de forma segura haciendo clic aquí:\n🔗 ${paymentLink}`

      let sent = false
      if (store.whatsappConnected && store.whatsappInstanceName) {
        try {
          const { evolutionClient } = await import('@/lib/whatsapp/evolution')
          await evolutionClient.sendText(
            store.whatsappInstanceName,
            session.phoneNumber,
            messageText
          )
          sent = true
        } catch (e) {
          console.error('Failed to send link via Evolution API:', e)
        }
      }

      if (!sent) {
        await waClient.sendText(session.phoneNumber, messageText)
      }

      const messages = normalizeChatMessages(session.messages)
      messages.push({
        sender: 'bot',
        text: `[Link de Pago Enviado]: $${total.toLocaleString('es-CO')} COP\n${paymentLink}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      })

      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          messages,
          step: 'AWAITING_CONFIRMATION',
          cart: buildCartState([]),
        },
      })
    } catch (waErr) {
      console.error('WhatsApp send link error:', waErr)
    }

    return NextResponse.json({ success: true, paymentLink })
  } catch (error: unknown) {
    console.error('Error sending payment link:', error)
    return internalServerError(getErrorMessage(error, 'Error interno'))
  }
}
