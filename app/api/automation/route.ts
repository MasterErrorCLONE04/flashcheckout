import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import {
  badRequest,
  getErrorMessage,
  internalServerError,
  notFound,
  parseJsonBody,
  unauthorized,
} from '@/lib/api/route-utils'

type AutomationSeed = {
  name: string
  description: string
  active: boolean
  sentToday: number
  rate: string
  rateLabel: string
  icon: string
  iconColor: string
  channels: string[]
  customTemplate: string
}

type AutomationUpdateBody = {
  automationId?: string
  active?: boolean
  customTemplate?: string | null
}

type AutomationCreateBody = {
  action?: 'recover-carts' | 'test-automation'
  automationId?: string
  targetPhone?: string
  name?: string
  description?: string
  icon?: string
  channels?: string[]
  customTemplate?: string | null
}

const defaultAutomations: AutomationSeed[] = [
  {
    name: 'Pedido pagado',
    description: 'Envía confirmación automática por WhatsApp cuando se aprueba el pago de un pedido (Stripe, MercadoPago o transferencia).',
    active: true,
    sentToday: 0,
    rate: 'Automático',
    rateLabel: 'Disparo por evento',
    icon: '💳',
    iconColor: 'bg-blue-50 text-blue-500 border border-blue-100',
    channels: ['WhatsApp'],
    customTemplate:
      '¡Pago confirmado, {{cliente}}! 🎉\n\nTu pedido *#{{pedido_id}}* por un total de *${{total}}* en *{{tienda}}* ya está en preparación. ¡Gracias por tu compra!',
  },
  {
    name: 'Pedido listo para retiro / envío',
    description: 'Notifica al comprador por WhatsApp cuando su pedido cambia a confirmado o en camino.',
    active: true,
    sentToday: 0,
    rate: 'Automático',
    rateLabel: 'Disparo por estado',
    icon: '📦',
    iconColor: 'bg-amber-50 text-amber-500 border border-amber-100',
    channels: ['WhatsApp'],
    customTemplate:
      '¡Hola {{cliente}}! 🚚 Tu pedido *#{{pedido_id}}* en *{{tienda}}* ya está listo y en camino. Valor total: ${{total}}.',
  },
  {
    name: 'Calificar servicio',
    description: 'Envía un mensaje de agradecimiento y seguimiento cuando el pedido se marca como entregado.',
    active: true,
    sentToday: 0,
    rate: 'Automático',
    rateLabel: 'Post-entrega',
    icon: '⭐',
    iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    channels: ['WhatsApp'],
    customTemplate:
      '¡Hola {{cliente}}! ✨ Tu pedido *#{{pedido_id}}* en *{{tienda}}* fue entregado con éxito. ¡Gracias por confiar en nosotros! Cuéntanos qué tal te pareció.',
  },
  {
    name: 'Recuperar carrito abandonado',
    description: 'Envía un recordatorio por WhatsApp a los clientes que dejaron artículos en su carrito sin completar el pago.',
    active: true,
    sentToday: 0,
    rate: '1-Clic / Auto',
    rateLabel: 'Recuperación',
    icon: '🛒',
    iconColor: 'bg-rose-50 text-rose-500 border border-rose-100',
    channels: ['WhatsApp'],
    customTemplate:
      '¡Hola {{cliente}}! 👋 Notamos que dejaste productos pendientes en tu carrito de *{{tienda}}*. ¿Te ayudamos a finalizar tu pedido hoy?',
  },
]

async function getStoreForUser(userId: string) {
  return getActiveStore(userId)
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getStoreForUser(userId)
    if (!store) return notFound('Store not found')

    let automations = await prisma.automation.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'asc' },
    })

    if (automations.length === 0) {
      await prisma.automation.createMany({
        data: defaultAutomations.map(item => ({
          ...item,
          storeId: store.id,
        })),
      })

      automations = await prisma.automation.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'asc' },
      })
    }

    return NextResponse.json({ automations })
  } catch (error: unknown) {
    console.error('GET Automations Error:', error)
    return internalServerError(getErrorMessage(error))
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getStoreForUser(userId)
    if (!store) return notFound('Store not found')

    const body = await parseJsonBody<AutomationUpdateBody>(req)
    if (!body?.automationId) return badRequest('Missing automationId')

    const automation = await prisma.automation.findFirst({
      where: { id: body.automationId, storeId: store.id },
    })

    if (!automation) return notFound('Automation not found')

    const updateData: {
      active?: boolean
      customTemplate?: string | null
    } = {}

    if (typeof body.active === 'boolean') updateData.active = body.active
    if (body.customTemplate !== undefined) {
      updateData.customTemplate = body.customTemplate
    }

    const updated = await prisma.automation.update({
      where: { id: automation.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, automation: updated })
  } catch (error: unknown) {
    console.error('PATCH Automations Error:', error)
    return internalServerError(getErrorMessage(error))
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getStoreForUser(userId)
    if (!store) return notFound('Store not found')

    const body = await parseJsonBody<AutomationCreateBody>(req)

    // Acción real: Enviar prueba de una plantilla de automatización al WhatsApp del comerciante
    if (body?.action === 'test-automation') {
      if (!body.automationId) return badRequest('Falta automationId')

      const aut = await prisma.automation.findFirst({
        where: { id: body.automationId, storeId: store.id },
      })
      if (!aut) return notFound('Automatización no encontrada')

      const recipient = (body.targetPhone || store.whatsapp || '').replace(/\D/g, '')
      if (!recipient) {
        return badRequest('No hay un número de WhatsApp configurado en la tienda.')
      }

      const template =
        aut.customTemplate ||
        '¡Hola {{cliente}}! Tu pedido *#{{pedido_id}}* por *${{total}}* en *{{tienda}}* ha sido actualizado.'

      const formattedMsg = template
        .replace(/{{cliente}}/g, 'Cliente de Prueba')
        .replace(/{{pedido_id}}/g, 'A1B2C3')
        .replace(/{{total}}/g, '85.000')
        .replace(/{{tienda}}/g, store.name)

      const { waClient } = await import('@/lib/whatsapp/cloud-api')
      if (store.whatsappInstanceName && store.whatsappConnected) {
        const { evolutionClient } = await import('@/lib/whatsapp/evolution')
        await evolutionClient.sendText(store.whatsappInstanceName, recipient, formattedMsg)
      } else {
        await waClient.sendText(recipient, formattedMsg)
      }

      return NextResponse.json({
        success: true,
        previewText: formattedMsg,
        message: `Mensaje de prueba enviado a +${recipient}`,
      })
    }

    // Acción real: Recuperar carritos abandonados en sesiones de WhatsApp
    if (body?.action === 'recover-carts') {
      const sessions = await prisma.whatsAppSession.findMany({
        where: { storeId: store.id },
        orderBy: { lastInteraction: 'desc' },
        take: 30,
      })

      const sessionsWithCart = sessions.filter(s => {
        if (!s.cart || typeof s.cart !== 'object') return false
        const record = s.cart as { items?: Record<string, unknown> }
        return record.items && Object.keys(record.items).length > 0
      })

      if (sessionsWithCart.length === 0) {
        return NextResponse.json({
          success: true,
          sentCount: 0,
          message: 'No hay carritos abandonados pendientes en este momento.',
        })
      }

      const cartAut = await prisma.automation.findFirst({
        where: {
          storeId: store.id,
          name: { contains: 'carrito', mode: 'insensitive' },
        },
      })

      const baseTemplate =
        cartAut?.customTemplate ||
        '¡Hola {{cliente}}! 👋 Notamos que dejaste artículos en tu carrito de *{{tienda}}*. Entra aquí para completar tu pedido: ' +
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://flashcheckout.co'}/tienda/${store.slug}`

      let sentCount = 0
      const { waClient } = await import('@/lib/whatsapp/cloud-api')

      for (const sess of sessionsWithCart) {
        const msg = baseTemplate
          .replace(/{{cliente}}/g, sess.customerName || 'Cliente')
          .replace(/{{tienda}}/g, store.name)

        try {
          if (store.whatsappInstanceName && store.whatsappConnected) {
            const { evolutionClient } = await import('@/lib/whatsapp/evolution')
            await evolutionClient.sendText(store.whatsappInstanceName, sess.phoneNumber, msg)
          } else {
            await waClient.sendText(sess.phoneNumber, msg)
          }
          sentCount++
        } catch (err) {
          console.warn(`[Abandoned Cart Recovery Warn] Falló envío a ${sess.phoneNumber}:`, err)
        }
      }

      if (cartAut && sentCount > 0) {
        await prisma.automation.update({
          where: { id: cartAut.id },
          data: { sentToday: { increment: sentCount } },
        })
      }

      return NextResponse.json({
        success: true,
        sentCount,
        message: `Se enviaron ${sentCount} recordatorios de carrito abandonado por WhatsApp.`,
      })
    }

    const name = body?.name?.trim() || ''
    const description = body?.description?.trim() || ''

    if (!name || !description) {
      return badRequest('Missing name or description')
    }

    const created = await prisma.automation.create({
      data: {
        storeId: store.id,
        name,
        description,
        icon: body?.icon?.trim() || '⚡',
        iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        channels: Array.isArray(body?.channels) && body.channels.length > 0 ? body.channels : ['WhatsApp'],
        active: true,
        sentToday: 0,
        rate: '0%',
        rateLabel: 'Tasa de apertura',
        customTemplate: body?.customTemplate?.trim() ? body.customTemplate.trim() : null,
      },
    })

    return NextResponse.json({ success: true, automation: created })
  } catch (error: unknown) {
    console.error('POST Automation Error:', error)
    return internalServerError(getErrorMessage(error))
  }
}
