import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  badRequest,
  getErrorMessage,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

type CustomerBody = {
  id?: string
  name?: string
  phone?: string
  email?: string
  birthDate?: string
  notes?: string
  city?: string
}

async function resolveStore(userId: string) {
  const cookieStore = await cookies()
  const activeStoreId = cookieStore.get('active_store_id')?.value

  if (activeStoreId) {
    const store = await prisma.store.findFirst({
      where: { id: activeStoreId, userId },
    })
    if (store) return store
  }

  return prisma.store.findFirst({
    where: { userId },
  })
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized('No autorizado')

    const store = await resolveStore(userId)
    if (!store) return notFound('Tienda no encontrada')

    const body = (await req.json().catch(() => null)) as CustomerBody | null
    if (!body) return badRequest('Datos del cliente invalidos')

    const name = body.name?.trim()
    if (!name) return badRequest('Nombre es requerido')

    const normalizedPhone = body.phone?.replace(/\D/g, '') || null
    const customerData = {
      name,
      phone: normalizedPhone,
      email: body.email?.trim() || null,
      birthDate: body.birthDate?.trim() || null,
      notes: body.notes?.trim() || null,
      city: body.city?.trim() || null,
    }

    const existingCustomer = body.id
      ? await prisma.customer.findFirst({
          where: { id: body.id, storeId: store.id },
        })
      : null

    if (existingCustomer) {
      if (normalizedPhone && normalizedPhone !== existingCustomer.phone) {
        const phoneOwner = await prisma.customer.findFirst({
          where: { storeId: store.id, phone: normalizedPhone },
        })

        if (phoneOwner && phoneOwner.id !== existingCustomer.id) {
          return badRequest('Ya existe otro cliente con ese telefono')
        }
      }

      const customer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: customerData,
      })

      return NextResponse.json({ customer })
    }

    if (normalizedPhone) {
      const customer = await prisma.customer.upsert({
        where: {
          storeId_phone: {
            storeId: store.id,
            phone: normalizedPhone,
          },
        },
        update: customerData,
        create: {
          storeId: store.id,
          ...customerData,
        },
      })

      return NextResponse.json({ customer })
    }

    const customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        ...customerData,
      },
    })

    return NextResponse.json({ customer })
  } catch (error: unknown) {
    console.error('Error saving customer:', error)
    return internalServerError(getErrorMessage(error, 'Error al guardar el cliente'))
  }
}
