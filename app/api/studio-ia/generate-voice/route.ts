import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { synthesizeStudioVoiceoverBuffer } from '@/lib/ai/replicate'
import { unauthorized, badRequest, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = await req.json()
    const { text, voice = 'nova' } = body

    if (!text || typeof text !== 'string') {
      return badRequest('Text is required')
    }

    const audioBuffer = await synthesizeStudioVoiceoverBuffer(text, voice)

    if (audioBuffer && audioBuffer.byteLength > 200) {
      return new NextResponse(new Uint8Array(audioBuffer), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    return NextResponse.json({
      fallback: true,
      message: 'No se pudo generar el audio TTS',
    })
  } catch (error: unknown) {
    console.error('[Studio IA Generate Voice Error]:', error)
    const msg = error instanceof Error ? error.message : 'Error generating voice'
    return internalServerError(msg)
  }
}
