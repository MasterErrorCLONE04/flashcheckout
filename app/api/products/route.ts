import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'

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
    return NextResponse.json({ products: [] })
  }

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ products })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, price, stock, imageUrl } = body

    if (!name || price == null) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const store = await prisma.store.findFirst({
      where: { userId },
      include: { products: true }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store required' }, { status: 400 })
    }

    // 🔴 Seguridad: Verificar límites Freemium 
    const isPro = await checkSubscription()
    if (!isPro && store.products.length >= 10) {
      return NextResponse.json(
        { error: 'Límite de productos gratuitos alcanzado' },
        { status: 403 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Math.round(price),
        stock: stock ?? 0,
        imageUrl: imageUrl ?? null,
        storeId: store.id,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear el producto' },
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
    const { id, name, price, stock, imageUrl, active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID del producto requerido' },
        { status: 400 }
      )
    }

    // Verify the product belongs to this user's store
    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: { select: { userId: true } } },
    })

    if (!product || product.store.userId !== userId) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Math.round(price) }),
        ...(stock !== undefined && { stock }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error al actualizar' },
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
        { error: 'ID del producto requerido' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: { select: { userId: true } } },
    })

    if (!product || product.store.userId !== userId) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error al eliminar' },
      { status: 500 }
    )
  }
}
