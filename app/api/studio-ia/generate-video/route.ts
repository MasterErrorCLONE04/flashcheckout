import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import {
  persistMediaToSupabase,
  runReplicateModel,
  synthesizeStudioVoiceoverBuffer,
  uploadBufferToStudioStorage,
} from '@/lib/ai/replicate'
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
      type = 'i2v', // 'i2v' (Image to Video) | 'talking-avatar' (Lip-Sync Avatar UGC)
      imageUrl,
      avatarImageUrl,
      scriptText,
      voice = 'nova',
      prompt,
      productId,
    } = body

    // 1. Talking Avatar UGC (Lip-Sync real con voz en español)
    if (type === 'talking-avatar') {
      const portraitUrl = avatarImageUrl || imageUrl
      if (!portraitUrl) {
        return badRequest('Se requiere la imagen del avatar (avatarImageUrl).')
      }
      if (!scriptText || typeof scriptText !== 'string' || !scriptText.trim()) {
        return badRequest('Se requiere el guion (scriptText) para que el avatar hable.')
      }

      // Paso A: Generar audio MP3 en español y subirlo a Supabase Storage
      const audioBuffer = await synthesizeStudioVoiceoverBuffer(scriptText.trim(), voice)
      if (!audioBuffer) {
        return badRequest('No se pudo sintetizar la voz en español para el avatar.')
      }

      const audioUrl = await uploadBufferToStudioStorage(
        audioBuffer,
        'studio-audio',
        'mp3',
        'audio/mpeg'
      )

      if (!audioUrl) {
        return badRequest('No se pudo almacenar el audio para sincronización de labios.')
      }

      // Paso B: Ejecutar Lip-Sync del Avatar (SadTalker en Replicate)
      let result = await runReplicateModel(
        'cjwbw/sadtalker',
        {
          source_image: portraitUrl,
          driven_audio: audioUrl,
          enhancer: 'gfpgan',
          preprocess: 'crop',
          still: false,
        },
        60
      )

      if (!result.success && !result.isBillingError) {
        result = await runReplicateModel(
          'lucataco/sadtalker',
          {
            source_image: portraitUrl,
            driven_audio: audioUrl,
            enhancer: 'gfpgan',
            preprocess: 'full',
            still: false,
          },
          60
        )
      }

      if (!result.success || !result.output) {
        if (result.isBillingError) {
          return NextResponse.json(
            {
              success: false,
              isBillingError: true,
              error: result.error,
              billingUrl: 'https://replicate.com/account/billing',
            },
            { status: 402 }
          )
        }
        return badRequest(result.error || 'No se pudo animar el avatar con Lip-Sync.')
      }

      const rawVideoUrl = Array.isArray(result.output) ? result.output[0] : result.output
      const permanentVideoUrl = await persistMediaToSupabase(
        String(rawVideoUrl),
        'studio-videos',
        'mp4',
        'video/mp4'
      )

      try {
        await prisma.aiMediaContent.create({
          data: {
            storeId: store.id,
            productId: productId || null,
            title: `Avatar UGC Lip-Sync - ${new Date().toLocaleDateString()}`,
            type: 'AVATAR_UGC',
            format: '9:16',
            script: scriptText,
            videoUrl: permanentVideoUrl,
            audioUrl,
            thumbnailUrl: portraitUrl,
            status: 'READY',
          },
        })
      } catch (e) {
        console.warn('DB Log talking-avatar:', e)
      }

      return NextResponse.json({
        success: true,
        type: 'talking-avatar',
        videoUrl: permanentVideoUrl,
        audioUrl,
        message: '¡Avatar UGC con sincronización de labios generado con éxito!',
      })
    }

    if (!imageUrl) {
      return badRequest('imageUrl es requerido')
    }

    // 2. Image-to-Video de Producto (Animación 3D del producto)
    if (type === 'i2v') {
      const videoPrompt =
        prompt ||
        'smooth 360 rotation of the commercial product, elegant studio light flare, cinematic slow motion, 4k commercial reel'

      const result = await runReplicateModel(
        'minimax/video-01',
        {
          first_frame_image: imageUrl,
          prompt: videoPrompt,
        },
        60
      )

      if (!result.success || !result.output) {
        if (result.isBillingError) {
          return NextResponse.json(
            {
              success: false,
              isBillingError: true,
              error: result.error,
              billingUrl: 'https://replicate.com/account/billing',
            },
            { status: 402 }
          )
        }
        return badRequest(result.error || 'No se pudo generar el video a partir de la imagen.')
      }

      const rawVideoUrl = Array.isArray(result.output) ? result.output[0] : result.output
      const permanentVideoUrl = await persistMediaToSupabase(
        String(rawVideoUrl),
        'studio-videos',
        'mp4',
        'video/mp4'
      )

      try {
        await prisma.aiMediaContent.create({
          data: {
            storeId: store.id,
            productId: productId || null,
            title: `Video I2V - ${new Date().toLocaleDateString()}`,
            type: 'GENERATIVE_I2V',
            format: '9:16',
            videoUrl: permanentVideoUrl,
            thumbnailUrl: imageUrl,
            status: 'READY',
          },
        })
      } catch (e) {
        console.warn('DB Log video:', e)
      }

      return NextResponse.json({
        success: true,
        type: 'i2v',
        videoUrl: permanentVideoUrl,
        message: '¡Video cinemático generado y almacenado con éxito!',
      })
    }

    return badRequest('Tipo de video no soportado.')
  } catch (error: unknown) {
    console.error('[Studio IA Generate Video Route Error]:', error)
    const msg = error instanceof Error ? error.message : 'Error al generar video'
    return internalServerError(msg)
  }
}
