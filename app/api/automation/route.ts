import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
}

type AutomationUpdateBody = {
  automationId?: string
  active?: boolean
  customTemplate?: string | null
}

type AutomationCreateBody = {
  name?: string
  description?: string
  icon?: string
  channels?: string[]
  customTemplate?: string | null
}

const defaultAutomations: AutomationSeed[] = [
  {
    name: 'Mensaje de bienvenida',
    description: 'Envia un mensaje automatico de bienvenida cuando un cliente escribe por primera vez.',
    active: true,
    sentToday: 28,
    rate: '92%',
    rateLabel: 'Tasa de apertura',
    icon: '👋',
    iconColor: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
    channels: ['WhatsApp'],
  },
  {
    name: 'Recuperar carrito abandonado',
    description: 'Envía un recordatorio al cliente si abandona su carrito por más de 1 hora.',
    active: true,
    sentToday: 16,
    rate: '21%',
    rateLabel: 'Tasa de conversión',
    icon: '🛒',
    iconColor: 'bg-rose-50 text-rose-500 border border-rose-100',
    channels: ['WhatsApp'],
  },
  {
    name: 'Pedido pagado',
    description: 'Notifica automáticamente cuando un pedido ha sido pagado correctamente.',
    active: true,
    sentToday: 24,
    rate: '97%',
    rateLabel: 'Tasa de apertura',
    icon: '💳',
    iconColor: 'bg-blue-50 text-blue-500 border border-blue-100',
    channels: ['WhatsApp', 'Email'],
  },
  {
    name: 'Pedido listo para retiro / envío',
    description: 'Informa al cliente cuando su pedido está listo para ser retirado o enviado.',
    active: true,
    sentToday: 11,
    rate: '95%',
    rateLabel: 'Tasa de apertura',
    icon: '📦',
    iconColor: 'bg-amber-50 text-amber-500 border border-amber-100',
    channels: ['WhatsApp'],
  },
  {
    name: 'Recordatorio de inactividad',
    description: 'Envía un mensaje al cliente si no responde por más de 24 horas.',
    active: false,
    sentToday: 0,
    rate: '0%',
    rateLabel: 'Tasa de respuesta',
    icon: '🌙',
    iconColor: 'bg-purple-50 text-purple-500 border border-purple-100',
    channels: ['WhatsApp'],
  },
]

async function getStoreForUser(userId: string) {
  return prisma.store.findFirst({ where: { userId } })
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
