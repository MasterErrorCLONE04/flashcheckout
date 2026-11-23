import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { persistMediaToSupabase, runReplicateModel } from '@/lib/ai/replicate'
import { unauthorized, notFound, badRequest, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

const SCENE_PROMPTS: Record<string, { prompt: string; lightSource: string }> = {
  marble: {
    prompt: 'luxury white italian marble countertop with subtle gold veins, soft morning window light, high-end commercial studio product photography, hyperrealistic, 8k resolution, natural surface reflections',
    lightSource: 'Left Light',
  },
  'neon-podium': {
    prompt: 'futuristic dark matte podium with glowing violet and cyan neon edge lighting, dark sleek studio, ultra sharp commercial product photography, dramatic rim light, 8k',
    lightSource: 'Right Light',
  },
  'luxury-wood': {
    prompt: 'warm rustic walnut wood tabletop, soft cozy indoor ambient lighting, luxury lifestyle product staging, elegant depth of field, 8k commercial photography',
    lightSource: 'Top Light',
  },
  'sunlight-nature': {
    prompt: 'natural organic stone platform surrounded by fresh monstera leaves, soft golden hour sunlight beams, morning dew drops, botanical aesthetic, 8k',
    lightSource: 'Top Light',
  },
  'urban-minimal': {
    prompt: 'clean architectural concrete podium, minimalist pastel background, crisp geometric shadows, contemporary scandinavian design aesthetic, 8k',
    lightSource: 'Left Light',
  },
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Tienda no encontrada')

    const body = await req.json()
    const { action, imageUrl, productId, sceneType = 'marble', customPrompt } = body

    if (!action) {
      return badRequest('Action es requerido (remove-bg, generate-scene, edit-photo, upscale, set-primary)')
    }

    // 1. Asignar foto mejorada como foto principal del producto (persistida en Supabase)
    if (action === 'set-primary') {
      if (!productId || !imageUrl) {
        return badRequest('productId e imageUrl son requeridos para set-primary')
      }

      const permanentUrl = await persistMediaToSupabase(imageUrl, 'studio-photos', 'webp', 'image/webp')

      const updated = await prisma.product.update({
        where: { id: productId, storeId: store.id },
        data: { imageUrl: permanentUrl },
      })

      return NextResponse.json({
        success: true,
        resultUrl: permanentUrl,
        message: '¡Foto actualizada permanentemente como imagen principal del producto!',
        product: updated,
      })
    }

    if (!imageUrl) {
      return badRequest('imageUrl es requerido')
    }

    // 2. Remoción de fondo (Background Removal)
    if (action === 'remove-bg') {
      const result = await runReplicateModel('cjwbw/rembg', {
        image: imageUrl,
      })

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
        return badRequest(result.error || 'No se pudo remover el fondo de la imagen.')
      }

      const rawUrl = Array.isArray(result.output) ? result.output[0] : result.output
      const permanentUrl = await persistMediaToSupabase(String(rawUrl), 'studio-photos', 'png', 'image/png')

      return NextResponse.json({
        success: true,
        action: 'remove-bg',
        resultUrl: permanentUrl,
        message: '¡Fondo eliminado con éxito conservando tu producto real!',
      })
    }

    // 3. Generación de Escenario Hiperrealista PRESERVANDO el producto original (IC-Light Relighting)
    if (action === 'generate-scene' || action === 'edit-photo') {
      const product = productId
        ? await prisma.product.findFirst({
            where: { id: productId, storeId: store.id },
          })
        : null

      const productName = product?.name || 'commercial product'
      const sceneConfig = SCENE_PROMPTS[sceneType] || SCENE_PROMPTS.marble
      const finalPrompt = customPrompt?.trim()
        ? `${productName}, ${customPrompt.trim()}, commercial product photography, photorealistic, 8k`
        : `${productName} placed on ${sceneConfig.prompt}`

      // Primero intentamos IC-Light que toma subject_image (la foto real del producto) y genera el fondo + iluminación alrededor sin alterar el producto
      let result = await runReplicateModel(
        'zsxkib/ic-light',
        {
          subject_image: imageUrl,
          prompt: finalPrompt,
          appended_prompt: 'best quality, commercial photography, studio lighting, natural shadows',
          negative_prompt: 'lowres, bad anatomy, deformed product, blurry, watermark, text',
          light_source: sceneConfig.lightSource,
          steps: 25,
          cfg: 2,
          highres_scale: 1.5,
          number_of_images: 1,
        },
        60
      )

      // Si IC-Light falla por formato de imagen, intentamos Flux Kontext Pro (edición guiada por imagen)
      if (!result.success && !result.isBillingError) {
        result = await runReplicateModel(
          'black-forest-labs/flux-kontext-pro',
          {
            input_image: imageUrl,
            prompt: `Keep the exact product in the center intact and place it in: ${finalPrompt}`,
            aspect_ratio: 'match_input_image',
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
        return badRequest(result.error || 'No se pudo generar el escenario para el producto.')
      }

      const rawUrl = Array.isArray(result.output) ? result.output[0] : result.output
      const permanentUrl = await persistMediaToSupabase(String(rawUrl), 'studio-photos', 'webp', 'image/webp')

      return NextResponse.json({
        success: true,
        action,
        resultUrl: permanentUrl,
        sceneType,
        message: '¡Escenario fotográfico creado preservando tu producto real!',
      })
    }

    // 4. Upscaling y Aumento de Calidad (Real-ESRGAN)
    if (action === 'upscale') {
      const result = await runReplicateModel('nightmareai/real-esrgan', {
        image: imageUrl,
        scale: 2,
        face_enhance: false,
      })

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
        return badRequest(result.error || 'No se pudo mejorar la resolución de la imagen.')
      }

      const rawUrl = Array.isArray(result.output) ? result.output[0] : result.output
      const permanentUrl = await persistMediaToSupabase(String(rawUrl), 'studio-photos', 'png', 'image/png')

      return NextResponse.json({
        success: true,
        action: 'upscale',
        resultUrl: permanentUrl,
        message: '¡Calidad y resolución 4K mejoradas con éxito!',
      })
    }

    return badRequest('Acción no reconocida.')
  } catch (error: unknown) {
    console.error('[Studio IA Enhance Photo Route Error]:', error)
    const msg = error instanceof Error ? error.message : 'Error en el estudio fotográfico'
    return internalServerError(msg)
  }
}
