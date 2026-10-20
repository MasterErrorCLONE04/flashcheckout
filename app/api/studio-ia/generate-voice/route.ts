import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
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

    const openaiApiKey = process.env.OPENAI_API_KEY
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY

    // 1. Si ElevenLabs está configurado
    if (elevenLabsApiKey) {
      const voiceId = '21m00Tcm4TlvDq8ikWAM' // Rachel / Default
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      })

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer()
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString()
          }
        })
      }
    }

    // 2. Si OpenAI está configurado
    if (openaiApiKey) {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice || 'nova' // 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
        })
      })

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer()
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString()
          }
        })
      }
    }

    // 3. Fallback inteligente: Usar motor TTS en español de alta fidelidad para devolver MP3 real siempre
    try {
      const cleanText = text
        .replace(/[*#_~`]/g, '')
        .replace(/\n+/g, ' ')
        .trim()
      const truncated = cleanText.length > 200 ? cleanText.slice(0, 197) + '...' : cleanText
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=es&client=tw-ob`
      const ttsRes = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      if (ttsRes.ok) {
        const audioBuffer = await ttsRes.arrayBuffer()
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=86400'
          }
        })
      }
    } catch (ttsErr) {
      console.warn('[Studio IA Fallback TTS error]:', ttsErr)
    }

    return NextResponse.json({
      fallback: true,
      message: 'No se pudo generar el audio TTS'
    })
  } catch (error: any) {
    console.error('[Studio IA Generate Voice Error]:', error)
    return internalServerError(error.message || 'Error generating voice')
  }
}
