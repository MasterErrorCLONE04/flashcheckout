import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { runReplicateModel } from '@/lib/ai/replicate'
import { unauthorized, notFound, badRequest, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Tienda no encontrada')

    const body = await req.json()
    const { 
      type = 'i2v', // 'i2v' (Image to Video) | 'talking-avatar'
      imageUrl,
      prompt,
      productId
    } = body

    if (!imageUrl) {
      return badRequest('imageUrl es requerido')
    }

    // 1. Image-to-Video de Producto (Animación 3D del producto)
    if (type === 'i2v') {
      const videoPrompt = prompt || 'smooth 360 rotation of the commercial product, elegant studio light flare, cinematic slow motion, 4k commercial reel'
      
      const result = await runReplicateModel('minimax/video-01', {
        first_frame_image: imageUrl,
        prompt: videoPrompt
      }, 55)

      if (!result.success || !result.output) {
        if (result.isBillingError) {
          return NextResponse.json({
            success: false,
            isBillingError: true,
            error: result.error,
            billingUrl: 'https://replicate.com/account/billing'
          }, { status: 402 })
        }
        return badRequest(result.error || 'No se pudo generar el video a partir de la imagen.')
      }

      const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output

      // Guardar en la base de datos si es posible
      try {
        if ((prisma as any).aiMediaContent) {
          await (prisma as any).aiMediaContent.create({
            data: {
              storeId: store.id,
              productId: productId || null,
              title: `Video I2V - ${new Date().toLocaleDateString()}`,
              type: 'GENERATIVE_I2V',
              format: '9:16',
              videoUrl: typeof videoUrl === 'string' ? videoUrl : null,
              thumbnailUrl: imageUrl,
              status: 'READY'
            }
          })
        }
      } catch (e) {
        console.warn('DB Log video:', e)
      }

      return NextResponse.json({
        success: true,
        type: 'i2v',
        videoUrl,
        message: '¡Video cinemático generado con éxito!'
      })
    }

    return badRequest('Tipo de video no soportado.')
  } catch (error: any) {
    console.error('[Studio IA Generate Video Route Error]:', error)
    return internalServerError(error.message || 'Error al generar video')
  }
}
