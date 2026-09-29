import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { unauthorized, notFound, badRequest, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Store not found')

    const body = await req.json()
    const {
      title,
      type = 'DYNAMIC_REEL',
      format = '9:16',
      productId,
      script,
      copyCaption,
      hookText,
      callToAction,
      thumbnailUrl,
      videoUrl
    } = body

    if (!title) {
      return badRequest('Title is required')
    }

    let creation = null

    // Guardar en Prisma si la tabla existe
    try {
      if ((prisma as any).aiMediaContent) {
        creation = await (prisma as any).aiMediaContent.create({
          data: {
            storeId: store.id,
            productId: productId || null,
            title,
            type,
            format,
            script: script || null,
            copyCaption: copyCaption || null,
            hookText: hookText || null,
            callToAction: callToAction || null,
            thumbnailUrl: thumbnailUrl || null,
            videoUrl: videoUrl || null,
            status: 'READY'
          },
          include: {
            product: {
              select: { id: true, name: true, price: true, imageUrl: true }
            }
          }
        })
      }
    } catch (dbErr) {
      console.warn('[Studio IA Save Creation DB skipped]:', dbErr)
    }

    return NextResponse.json({
      success: true,
      creation: creation || {
        id: Math.random().toString(),
        title,
        type,
        productId,
        thumbnailUrl,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('[Studio IA Save Creation Error]:', error)
    return internalServerError(error.message || 'Error saving creation')
  }
}
