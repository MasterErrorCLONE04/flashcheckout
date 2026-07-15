import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  badRequest,
  getErrorMessage,
  internalServerError,
  unauthorized,
} from '@/lib/api/route-utils'

type DriverBody = {
  name?: string
  phoneNumber?: string
  id?: string
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized('No autorizado')

    const body = (await req.json().catch(() => null)) as DriverBody | null
    if (!body?.name || !body.phoneNumber) {
      return badRequest('Faltan campos requeridos')
    }

    const cleanPhone = body.phoneNumber.replace(/\D/g, '')

    const existing = await prisma.driver.findUnique({
      where: { phoneNumber: cleanPhone },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un repartidor registrado con este telefono' },
        { status: 409 }
      )
    }

    const driver = await prisma.driver.create({
      data: {
        name: body.name,
        phoneNumber: cleanPhone,
        active: true,
        available: true,
        rating: 5.0,
        ordersDelivered: 0,
      },
    })

    return NextResponse.json({ success: true, driver })
  } catch (error: unknown) {
    console.error('[API Driver Post Error]', error)
    return internalServerError(getErrorMessage(error, 'Error del servidor'))
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized('No autorizado')

    const body = (await req.json().catch(() => null)) as DriverBody | null
    if (!body?.id) return badRequest('Falta ID')

    await prisma.driver.delete({
      where: { id: body.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[API Driver Delete Error]', error)
    return internalServerError(getErrorMessage(error, 'Error del servidor'))
  }
}
