import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const activeStoreId = cookieStore.get('active_store_id')?.value

    let store = null
    if (activeStoreId) {
      store = await prisma.store.findFirst({
        where: { id: activeStoreId, userId }
      })
    }

    if (!store) {
      store = await prisma.store.findFirst({
        where: { userId }
      })
    }

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const body = await req.json()
    const { name, phone, email, birthDate, notes, city } = body

    if (!name) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }

    // Upsert customer based on storeId and phone
    const customer = await prisma.customer.upsert({
      where: {
        storeId_phone: {
          storeId: store.id,
          phone: phone || ''
        }
      },
      update: {
        name,
        email,
        birthDate,
        notes,
        city
      },
      create: {
        storeId: store.id,
        phone: phone || '',
        name,
        email,
        birthDate,
        notes,
        city
      }
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error saving customer:', error)
    return NextResponse.json({ error: 'Error al guardar el cliente' }, { status: 500 })
  }
}
