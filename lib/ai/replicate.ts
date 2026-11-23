/**
 * Cliente unificado de IA Visual & Video para Studio IA (Replicate + Fal.ai + Supabase Storage)
 * Soporta:
 * - Remoción de fondo (RMBG)
 * - Escenarios de producto preservando el producto original (IC-Light / Relighting)
 * - Edición de fotos con instrucciones (Flux Kontext / Instruct)
 * - Upscaling 4K (Real-ESRGAN)
 * - Image-to-Video 3D (Minimax Video-01 / Wan 2.1)
 * - Talking Avatar Lip-Sync real con audio en español (SadTalker / LatentSync / Hedra)
 */

import { PUBLIC_STORAGE_BUCKET, supabaseAdmin } from '@/lib/supabase'

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output: unknown
  error?: string | null
}

const REPLICATE_API_BASE = 'https://api.replicate.com/v1'

const MODEL_VERSIONS: Record<string, string> = {
  'rembg': 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  'cjwbw/rembg': 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  'briaai/rmbg-1.4': 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  'zsxkib/ic-light': 'd41bcb10d8c159868f4cfbd7c6a2ca01484f7d39e4613419d5952c61562f1ba7',
  'black-forest-labs/flux-schnell': 'c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e',
  'nightmareai/real-esrgan': 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
  'minimax/video-01': '5aa835260ff7f40f4069c41185f72036accf99e29957bb4a3b3a911f3b6c1912',
  'cjwbw/sadtalker': 'a519cc0cfebaaeade068b23899165a11ec76aaa1d2b313d40d214f204ec957a3',
  'lucataco/sadtalker': '85c698db7c0a66d5011435d0191db323034e1da04b912a6d365833141b6a285b',
}

/**
 * Descarga un archivo generado por IA (imagen, video o audio) y lo guarda
 * permanentemente en Supabase Storage para evitar URLs expiradas o bloqueos CORS.
 */
export async function persistMediaToSupabase(
  remoteUrl: string,
  folder: 'studio-photos' | 'studio-videos' | 'studio-audio',
  ext: string = 'png',
  contentType: string = 'image/png'
): Promise<string> {
  try {
    if (!remoteUrl || remoteUrl.includes('.supabase.co/')) {
      return remoteUrl
    }
    const res = await fetch(remoteUrl)
    if (!res.ok) return remoteUrl

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error } = await supabaseAdmin.storage
      .from(PUBLIC_STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      })

    if (error) {
      console.warn('[Studio IA Persist Warning] Falló subida a Supabase, usando URL original:', error.message)
      return remoteUrl
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(PUBLIC_STORAGE_BUCKET).getPublicUrl(path)

    return publicUrl
  } catch (err) {
    console.warn('[Studio IA Persist Error]:', err)
    return remoteUrl
  }
}

/**
 * Sube un Buffer directamente a Supabase Storage y devuelve la URL pública
 */
export async function uploadBufferToStudioStorage(
  buffer: Buffer,
  folder: 'studio-photos' | 'studio-videos' | 'studio-audio',
  ext: string,
  contentType: string
): Promise<string | null> {
  try {
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabaseAdmin.storage
      .from(PUBLIC_STORAGE_BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      })

    if (error) {
      console.warn('[Studio IA Buffer Upload Error]:', error.message)
      return null
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(PUBLIC_STORAGE_BUCKET).getPublicUrl(path)

    return publicUrl
  } catch (err) {
    console.warn('[Studio IA Buffer Upload Exception]:', err)
    return null
  }
}

/**
 * Ejecuta una predicción en Replicate esperando el resultado
 */
export async function runReplicateModel(
  modelPath: string, // ej: "cjwbw/rembg" o "black-forest-labs/flux-schnell"
  input: Record<string, any>,
  maxWaitSeconds: number = 55
): Promise<{ success: boolean; output: any; error?: string; isBillingError?: boolean }> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return {
      success: false,
      output: null,
      error: 'REPLICATE_API_TOKEN no está configurado en las variables de entorno.'
    }
  }

  try {
    const version = MODEL_VERSIONS[modelPath]
    const url = version 
      ? `${REPLICATE_API_BASE}/predictions` 
      : `${REPLICATE_API_BASE}/models/${modelPath}/predictions`

    const payload = version 
      ? { version, input } 
      : { input }

    // 1. Iniciar predicción con header 'Prefer: wait' para resolución instantánea
    const startRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: `wait=${Math.min(maxWaitSeconds, 60)}`
      },
      body: JSON.stringify(payload)
    })

    const initialData: ReplicatePrediction = await startRes.json()

    if (!startRes.ok) {
      if (startRes.status === 402 || (initialData as any)?.title === 'Insufficient credit') {
        return {
          success: false,
          output: null,
          isBillingError: true,
          error: 'Tu cuenta de Replicate no tiene saldo disponible ($0 USD). Replicate requiere recargar al menos $5 USD en replicate.com/account/billing para ejecutar modelos de IA.'
        }
      }
      const errMsg = (initialData as any)?.detail || (initialData as any)?.title || 'Error al invocar modelo de Replicate'
      return { success: false, output: null, error: errMsg }
    }

    // Si ya terminó de inmediato gracias a 'Prefer: wait'
    if (initialData.status === 'succeeded') {
      return { success: true, output: initialData.output }
    }

    if (initialData.status === 'failed' || initialData.status === 'canceled') {
      return { success: false, output: null, error: initialData.error || 'La generación fue cancelada o falló.' }
    }

    // 2. Si aún está procesando, hacer polling breve
    const predictionId = initialData.id
    const pollInterval = 2000
    const maxPolls = Math.ceil((maxWaitSeconds * 1000) / pollInterval)

    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, pollInterval))

      const pollRes = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (pollRes.ok) {
        const pollData: ReplicatePrediction = await pollRes.json()
        if (pollData.status === 'succeeded') {
          return { success: true, output: pollData.output }
        }
        if (pollData.status === 'failed' || pollData.status === 'canceled') {
          return { success: false, output: null, error: pollData.error || 'Generación fallida.' }
        }
      }
    }

    return {
      success: false,
      output: null,
      error: 'Tiempo de espera agotado al generar el recurso. Intenta de nuevo.'
    }
  } catch (err: unknown) {
    console.error('[Replicate Client Error]:', err)
    const msg = err instanceof Error ? err.message : 'Error de conexión con el motor de IA.'
    return {
      success: false,
      output: null,
      error: msg
    }
  }
}

/**
 * Genera el buffer MP3 de locución en español usando ElevenLabs, OpenAI TTS o TTS HD fallback
 */
export async function synthesizeStudioVoiceoverBuffer(
  text: string,
  voice: string = 'nova'
): Promise<Buffer | null> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY

  // 1. ElevenLabs Multilingual v2
  if (elevenLabsApiKey) {
    try {
      const voiceId =
        voice === 'onyx'
          ? 'pNInz6obpgDQGcFmaJgB' // Adam (voz masculina profunda)
          : '21m00Tcm4TlvDq8ikWAM' // Rachel (voz femenina expresiva)
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.78 },
        }),
      })
      if (res.ok) {
        const ab = await res.arrayBuffer()
        if (ab.byteLength > 500) return Buffer.from(ab)
      }
    } catch (e) {
      console.warn('[Studio TTS ElevenLabs Warn]:', e)
    }
  }

  // 2. OpenAI TTS-1
  if (openaiApiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice || 'nova',
        }),
      })
      if (res.ok) {
        const ab = await res.arrayBuffer()
        if (ab.byteLength > 500) return Buffer.from(ab)
      }
    } catch (e) {
      console.warn('[Studio TTS OpenAI Warn]:', e)
    }
  }

  // 3. Fallback TTS en español (fragmentado por oraciones para soportar textos completos sin cortar a 200 caracteres)
  try {
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Dividir en bloques de máximo 180 caracteres respetando palabras
    const chunks: string[] = []
    let remaining = cleanText
    while (remaining.length > 0) {
      if (remaining.length <= 180) {
        chunks.push(remaining)
        break
      }
      let splitAt = remaining.lastIndexOf(' ', 180)
      if (splitAt <= 0) splitAt = 180
      chunks.push(remaining.slice(0, splitAt).trim())
      remaining = remaining.slice(splitAt).trim()
    }

    const buffers: Buffer[] = []
    for (const chunk of chunks.slice(0, 4)) {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=es&client=tw-ob`
      const ttsRes = await fetch(ttsUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
      if (ttsRes.ok) {
        const ab = await ttsRes.arrayBuffer()
        buffers.push(Buffer.from(ab))
      }
    }

    if (buffers.length > 0) {
      return Buffer.concat(buffers)
    }
  } catch (e) {
    console.warn('[Studio TTS Fallback Error]:', e)
  }

  return null
}
