import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { name, phoneNumber } = await req.json()
    if (!name || !phoneNumber) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '')

    // Check if phone number already exists
    const existing = await (prisma as any).driver.findUnique({
      where: { phoneNumber: cleanPhone }
    })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un repartidor registrado con este teléfono' }, { status: 409 })
    }

    const driver = await (prisma as any).driver.create({
      data: {
        name,
        phoneNumber: cleanPhone,
        active: true,
        available: true,
        rating: 5.0,
        ordersDelivered: 0
      }
    })

    return NextResponse.json({ success: true, driver })
  } catch (err: any) {
    console.error('[API Driver Post Error]', err)
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Falta ID' }, { status: 400 })
    }

    await (prisma as any).driver.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API Driver Delete Error]', err)
    return NextResponse.json({ error: err.message || 'Error del servidor' }, { status: 500 })
  }
}
