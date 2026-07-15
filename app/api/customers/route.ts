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
    if (!body?.name) return badRequest('Nombre es requerido')

    const customer = await prisma.customer.upsert({
      where: {
        storeId_phone: {
          storeId: store.id,
          phone: body.phone || '',
        },
      },
      update: {
        name: body.name,
        email: body.email,
        birthDate: body.birthDate,
        notes: body.notes,
        city: body.city,
      },
      create: {
        storeId: store.id,
        phone: body.phone || '',
        name: body.name,
        email: body.email,
        birthDate: body.birthDate,
        notes: body.notes,
        city: body.city,
      },
    })

    return NextResponse.json({ customer })
  } catch (error: unknown) {
    console.error('Error saving customer:', error)
    return internalServerError(getErrorMessage(error, 'Error al guardar el cliente'))
  }
}
