import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) {
    return NextResponse.json({ coupons: [] })
  }

  const coupons = await prisma.coupon.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { code, desc, tipo, tipoDesc, valor, validoHasta, estado } = body

    if (!code || !valor) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (código y valor)' },
        { status: 400 }
      )
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        desc: desc ?? '',
        tipo: tipo ?? 'Código',
        tipoDesc: tipoDesc ?? 'Porcentaje',
        valor: valor.trim(),
        validoHasta: validoHasta ?? 'Sin fecha límite',
        estado: estado ?? 'Activo',
        storeId: store.id
      }
    })

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Error al crear el descuento' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, code, desc, tipo, tipoDesc, valor, validoHasta, estado, usos } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID del descuento requerido' },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { store: { select: { userId: true } } }
    })

    if (!coupon || coupon.store.userId !== userId) {
      return NextResponse.json(
        { error: 'Descuento no encontrado' },
        { status: 404 }
      )
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        desc: desc !== undefined ? desc : undefined,
        tipo: tipo !== undefined ? tipo : undefined,
        tipoDesc: tipoDesc !== undefined ? tipoDesc : undefined,
        valor: valor !== undefined ? valor : undefined,
        validoHasta: validoHasta !== undefined ? validoHasta : undefined,
        estado: estado !== undefined ? estado : undefined,
        usos: usos !== undefined ? Number(usos) : undefined
      }
    })

    return NextResponse.json({ coupon: updated })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el descuento' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID del descuento requerido' },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { store: { select: { userId: true } } }
    })

    if (!coupon || coupon.store.userId !== userId) {
      return NextResponse.json(
        { error: 'Descuento no encontrado' },
        { status: 404 }
      )
    }

    await prisma.coupon.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el descuento' },
      { status: 500 }
    )
  }
}
