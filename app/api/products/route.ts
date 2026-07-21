import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import { getActiveStore } from '@/lib/store-context'
import { enqueueEmbeddingGeneration } from '@/lib/ai/services/embedding-service'
import {
  badRequest,
  forbidden,
  getErrorMessage,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

type ProductBody = {
  id?: string
  name?: string
  price?: number
  stock?: number
  imageUrl?: string | null
  category?: string | null
  active?: boolean
  description?: string | null
  options?: unknown
}

type StoreWithProductCount = {
  id: string
  products: Array<{ id: string }>
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null) return Prisma.DbNull
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  if (Array.isArray(value)) {
    return value as Prisma.InputJsonValue
  }
  if (value && typeof value === 'object') {
    return value as Prisma.InputJsonValue
  }
  return Prisma.DbNull
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized('No autorizado')

    const store = await getActiveStore(userId)
    if (!store) return NextResponse.json({ products: [] })

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error: unknown) {
    console.error('Error fetching products:', error)
    return internalServerError(getErrorMessage(error, 'Error al obtener productos'))
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorized('No autorizado')

  try {
    const body = (await req.json().catch(() => null)) as ProductBody | null
    if (!body?.name || body.price == null) {
      return badRequest('Faltan datos requeridos')
    }

    const store = (await getActiveStore(userId, { products: true })) as StoreWithProductCount | null
    if (!store) return badRequest('Store required')

    const isPro = await checkSubscription()
    if (!isPro && store.products.length >= 10) {
      return forbidden('Limite de productos gratuitos alcanzado')
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: Math.round(Number(body.price)),
        stock: Number.isFinite(Number(body.stock)) ? Number(body.stock) : 0,
        imageUrl: body.imageUrl ?? null,
        category: body.category ?? 'General',
        description: body.description ?? null,
        options: toJsonValue(body.options),
        storeId: store.id,
      },
    })

    // Enqueue embedding generation
    const embeddingText = `Producto: ${product.name}. Categoría: ${product.category}. Descripción: ${product.description || ''}. Precio: ${product.price}. Stock: ${product.stock}.`
    enqueueEmbeddingGeneration('PRODUCT', product.id, embeddingText, { storeId: product.storeId, name: product.name })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating product:', error)
    return internalServerError(getErrorMessage(error, 'Error al crear el producto'))
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorized('No autorizado')

  try {
    const body = (await req.json().catch(() => null)) as ProductBody | null
    if (!body?.id) return badRequest('ID del producto requerido')

    const product = await prisma.product.findUnique({
      where: { id: body.id },
      include: { store: { select: { userId: true } } },
    })

    if (!product || product.store.userId !== userId) {
      return notFound('Producto no encontrado')
    }

    const updated = await prisma.product.update({
      where: { id: body.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.price !== undefined && { price: Math.round(Number(body.price)) }),
        ...(body.stock !== undefined && { stock: Math.max(0, Math.floor(Number(body.stock))) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.active !== undefined && { active: body.active }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.options !== undefined && { options: toJsonValue(body.options) }),
      },
    })

    // Enqueue embedding generation for updated product
    const embeddingText = `Producto: ${updated.name}. Categoría: ${updated.category}. Descripción: ${updated.description || ''}. Precio: ${updated.price}. Stock: ${updated.stock}.`
    enqueueEmbeddingGeneration('PRODUCT', updated.id, embeddingText, { storeId: updated.storeId, name: updated.name })

    return NextResponse.json({ product: updated })
  } catch (error: unknown) {
    console.error('Error updating product:', error)
    return internalServerError(getErrorMessage(error, 'Error al actualizar'))
  }
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return unauthorized('No autorizado')

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return badRequest('ID del producto requerido')

    const product = await prisma.product.findUnique({
      where: { id },
      include: { store: { select: { userId: true } } },
    })

    if (!product || product.store.userId !== userId) {
      return notFound('Producto no encontrado')
    }

    await prisma.product.delete({ where: { id } })
    
    // Clean up embedding
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "Embedding" WHERE "entityType" = 'PRODUCT' AND "entityId" = $1`, id)
    } catch (e) {
      console.error('[Embedding Cleanup Error] Fallo al limpiar embedding del producto:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting product:', error)
    return internalServerError(getErrorMessage(error, 'Error al eliminar'))
  }
}
