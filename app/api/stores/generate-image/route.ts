import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getActiveStore } from '@/lib/store-context'
import { generateStoreImage } from '@/lib/ai/generate-store-image'
import { getErrorMessage } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as {
      prompt?: string
      target?: 'banner' | 'logo' | 'heroPanel' | 'general'
      aspectRatio?: '16:9' | '1:1' | '4:5'
      storeId?: string
    }

    const prompt = body.prompt?.trim()
    if (!prompt) {
      return NextResponse.json({ error: 'El prompt es requerido para generar la imagen' }, { status: 400 })
    }

    const store = await getActiveStore(userId, undefined, body.storeId)
    const storeName = store?.name || 'Mi Tienda'

    const result = await generateStoreImage({
      prompt,
      target: body.target || 'general',
      aspectRatio: body.aspectRatio || '16:9',
      storeName,
    })

    if (!result.success || !result.imageUrl) {
      return NextResponse.json(
        { error: result.error || 'No se pudo generar la imagen con IA.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      prompt,
      target: body.target || 'general',
    })
  } catch (err: unknown) {
    console.error('Error in /api/stores/generate-image:', err)
    return NextResponse.json(
      { error: getErrorMessage(err, 'Error interno del servidor') },
      { status: 500 }
    )
  }
}

