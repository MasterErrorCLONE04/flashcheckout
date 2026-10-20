import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { runReplicateModel } from '@/lib/ai/replicate'
import { unauthorized, notFound, badRequest, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

const SCENE_PROMPTS: Record<string, string> = {
  marble: 'luxury white italian marble countertop with subtle gold veins, soft morning window light, high-end commercial cosmetic product display, hyperrealistic, 8k resolution, raytracing reflections',
  'neon-podium': 'futuristic dark matte podium with glowing violet and cyan neon edge lighting, dark sleek studio, ultra sharp commercial product photography, dramatic rim light, 8k',
  'luxury-wood': 'warm rustic walnut wood tabletop, soft cozy indoor ambient lighting, luxury lifestyle product staging, elegant depth of field, 8k commercial photography',
  'sunlight-nature': 'natural organic stone platform surrounded by fresh monstera leaves, soft golden hour sunlight beams, morning dew drops, botanical aesthetic, 8k',
  'urban-minimal': 'clean architectural concrete podium, minimalist pastel background, crisp geometric shadows, contemporary scandinavian design aesthetic, 8k'
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
      return badRequest('Action es requerido (remove-bg, generate-scene, upscale, set-primary)')
    }

    // 1. Asignar foto mejorada como foto principal del producto
    if (action === 'set-primary') {
      if (!productId || !imageUrl) {
        return badRequest('productId e imageUrl son requeridos para set-primary')
      }

      const updated = await prisma.product.update({
        where: { id: productId, storeId: store.id },
        data: { imageUrl }
      })

      return NextResponse.json({
        success: true,
        message: '¡Foto actualizada como imagen principal del producto!',
        product: updated
      })
    }

    if (!imageUrl) {
      return badRequest('imageUrl es requerido')
    }

    // 2. Remoción de fondo (Background Removal)
    if (action === 'remove-bg') {
      const result = await runReplicateModel('briaai/rmbg-1.4', {
        image: imageUrl
      })

      if (!result.success || !result.output) {
        return badRequest(result.error || 'No se pudo remover el fondo de la imagen.')
      }

      const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output

      return NextResponse.json({
        success: true,
        action: 'remove-bg',
        resultUrl: outputUrl,
        message: '¡Fondo eliminado con éxito!'
      })
    }

    // 3. Generación de Escenario Hiperrealista (FLUX Schnell)
    if (action === 'generate-scene') {
      const product = productId ? await prisma.product.findFirst({
        where: { id: productId, storeId: store.id }
      }) : null

      const productName = product?.name || 'commercial product'
      const baseScenePrompt = SCENE_PROMPTS[sceneType] || SCENE_PROMPTS.marble
      const finalPrompt = customPrompt 
        ? `${customPrompt}, featuring ${productName}, commercial product photography, 8k, photorealistic`
        : `commercial product shot of ${productName}, resting on ${baseScenePrompt}`

      const result = await runReplicateModel('black-forest-labs/flux-schnell', {
        prompt: finalPrompt,
        aspect_ratio: '1:1',
        output_format: 'webp',
        output_quality: 90
      })

      if (!result.success || !result.output) {
        return badRequest(result.error || 'No se pudo generar el escenario para el producto.')
      }

      const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output

      return NextResponse.json({
        success: true,
        action: 'generate-scene',
        resultUrl: outputUrl,
        sceneType,
        message: '¡Nuevo escenario fotográfico creado con IA!'
      })
    }

    // 4. Upscaling y Aumento de Calidad (Real-ESRGAN)
    if (action === 'upscale') {
      const result = await runReplicateModel('nightmareai/real-esrgan', {
        image: imageUrl,
        scale: 2,
        face_enhance: false
      })

      if (!result.success || !result.output) {
        return badRequest(result.error || 'No se pudo mejorar la resolución de la imagen.')
      }

      const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output

      return NextResponse.json({
        success: true,
        action: 'upscale',
        resultUrl: outputUrl,
        message: '¡Calidad y resolución mejoradas con éxito!'
      })
    }

    return badRequest('Acción no reconocida.')
  } catch (error: any) {
    console.error('[Studio IA Enhance Photo Route Error]:', error)
    return internalServerError(error.message || 'Error en el estudio fotográfico')
  }
}
