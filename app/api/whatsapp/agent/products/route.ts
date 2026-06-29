import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, aiRecommendation, aiDescription } = await req.json()
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verify ownership of the product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product || product.storeId !== store.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: any = {}
    if (aiRecommendation !== undefined) updateData.aiRecommendation = aiRecommendation
    if (aiDescription !== undefined) updateData.aiDescription = aiDescription

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData
    })

    return NextResponse.json({ success: true, product: updated })
  } catch (err: any) {
    console.error('[API Product AI PATCH Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
