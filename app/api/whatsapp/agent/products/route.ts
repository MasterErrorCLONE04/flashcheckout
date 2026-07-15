import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badRequest, forbidden, getErrorMessage, internalServerError, notFound, unauthorized } from '@/lib/api/route-utils'

type ToggleAgentProductBody = {
  productId?: string
  aiRecommendation?: boolean
  aiDescription?: string
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = (await req.json().catch(() => null)) as ToggleAgentProductBody | null
    if (!body?.productId) return badRequest('Missing productId')

    const store = await prisma.store.findFirst({
      where: { userId },
    })
    if (!store) return notFound('Store not found')

    const product = await prisma.product.findUnique({
      where: { id: body.productId },
    })
    if (!product || product.storeId !== store.id) return forbidden()

    const updateData: {
      aiRecommendation?: boolean
      aiDescription?: string | null
    } = {}

    if (typeof body.aiRecommendation === 'boolean') {
      updateData.aiRecommendation = body.aiRecommendation
    }

    if (typeof body.aiDescription === 'string') {
      updateData.aiDescription = body.aiDescription
    }

    const updated = await prisma.product.update({
      where: { id: body.productId },
      data: updateData,
    })

    return NextResponse.json({ success: true, product: updated })
  } catch (err: unknown) {
    console.error('[API Product AI PATCH Error]', err)
    return internalServerError(getErrorMessage(err))
  }
}
