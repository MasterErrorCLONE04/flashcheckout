import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Retrieve or seed automations
    let automations = await prisma.automation.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'asc' }
    })

    if (automations.length === 0) {
      const defaultData = [
        {
          name: 'Mensaje de bienvenida',
          description: 'Envía un mensaje automático de bienvenida cuando un cliente escribe por primera vez.',
          active: true,
          sentToday: 28,
          rate: '92%',
          rateLabel: 'Tasa de apertura',
          icon: '👋',
          iconColor: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
          channels: ['WhatsApp']
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
          channels: ['WhatsApp']
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
          channels: ['WhatsApp', 'Email']
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
          channels: ['WhatsApp']
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
          channels: ['WhatsApp']
        }
      ]

      await prisma.automation.createMany({
        data: defaultData.map(d => ({
          ...d,
          storeId: store.id
        }))
      })

      automations = await prisma.automation.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'asc' }
      })
    }

    return NextResponse.json({ automations })

  } catch (error: any) {
    console.error('GET Automations Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const { automationId, active, customTemplate } = await req.json()
    if (!automationId) {
      return NextResponse.json({ error: 'Missing automationId' }, { status: 400 })
    }

    const updateData: any = {}
    if (active !== undefined) updateData.active = active
    if (customTemplate !== undefined) updateData.customTemplate = customTemplate

    const updated = await prisma.automation.update({
      where: { id: automationId, storeId: store.id },
      data: updateData
    })

    return NextResponse.json({ success: true, automation: updated })
  } catch (error: any) {
    console.error('PATCH Automations Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const { name, description, icon, channels, customTemplate } = await req.json()
    if (!name || !description) {
      return NextResponse.json({ error: 'Missing name or description' }, { status: 400 })
    }

    const created = await prisma.automation.create({
      data: {
        storeId: store.id,
        name,
        description,
        icon: icon || '⚡',
        iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        channels: channels || ['WhatsApp'],
        active: true,
        sentToday: 0,
        rate: '0%',
        rateLabel: 'Tasa de apertura',
        customTemplate: customTemplate || null
      } as any
    })

    return NextResponse.json({ success: true, automation: created })
  } catch (error: any) {
    console.error('POST Automation Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
