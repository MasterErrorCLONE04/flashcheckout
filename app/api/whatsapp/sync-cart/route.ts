import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { buildCartState, CartLine } from '@/lib/whatsapp/session-state'
import { badRequest, getErrorMessage, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

type SyncCartBody = {
  phoneNumber?: string
  cartData?: {
    items?: Record<string, number>
  }
  storeId?: string
  customerName?: string
  address?: string
}

function parseBody(body: unknown): SyncCartBody | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const record = body as Record<string, unknown>
  return {
    phoneNumber: typeof record.phoneNumber === 'string' ? record.phoneNumber : undefined,
    storeId: typeof record.storeId === 'string' ? record.storeId : undefined,
    customerName: typeof record.customerName === 'string' ? record.customerName : undefined,
    address: typeof record.address === 'string' ? record.address : undefined,
    cartData:
      record.cartData && typeof record.cartData === 'object' && !Array.isArray(record.cartData)
        ? (record.cartData as { items?: Record<string, number> })
        : undefined,
  }
}

export async function POST(req: Request) {
  try {
    const body = parseBody(await req.json().catch(() => null))
    if (!body?.phoneNumber) return badRequest('Falta phoneNumber')

    let enrichedCart: { items: Record<string, CartLine> } | null = null
    if (body.cartData?.items && typeof body.cartData.items === 'object') {
      const productIds = Object.keys(body.cartData.items)
      if (productIds.length > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            price: true,
            storeId: true,
          },
        })

        const lines = products.flatMap(product => {
          const qty = Number(body.cartData?.items?.[product.id] ?? 0)
          if (!Number.isFinite(qty) || qty <= 0) return []
          return [
            {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              qty: Math.floor(qty),
              storeId: product.storeId,
            },
          ] satisfies CartLine[]
        })

        enrichedCart = buildCartState(lines)
      } else {
        enrichedCart = buildCartState([])
      }
    }

    const resolvedStoreId = body.storeId || 'global'
    const session = await prisma.whatsAppSession.upsert({
      where: {
        phoneNumber_storeId: {
          phoneNumber: body.phoneNumber,
          storeId: resolvedStoreId,
        },
      },
      create: {
        phoneNumber: body.phoneNumber,
        cart: enrichedCart as Prisma.InputJsonValue,
        storeId: resolvedStoreId,
        customerName: body.customerName,
        address: body.address,
        step: 'IDLE',
      },
      update: {
        cart: enrichedCart as Prisma.InputJsonValue,
        customerName: body.customerName || undefined,
        address: body.address || undefined,
        lastInteraction: new Date(),
      },
    })

    return NextResponse.json({ success: true, session })
  } catch (error: unknown) {
    console.error('SYNC_CART_ERROR:', error)
    return internalServerError(getErrorMessage(error, 'Error al sincronizar carrito'))
  }
}
