import { createClient } from '@supabase/supabase-js'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export interface GenerateStoreImageOptions {
  prompt: string
  target?: 'banner' | 'logo' | 'heroPanel' | 'general'
  aspectRatio?: '16:9' | '1:1' | '4:5'
  storeName?: string
}

export async function generateStoreImage({
  prompt,
  target = 'general',
  aspectRatio = '16:9',
  storeName = '',
}: GenerateStoreImageOptions): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  if (!OPENROUTER_API_KEY) {
    return { success: false, error: 'OPENROUTER_API_KEY no está configurada.' }
  }

  // Refinar el prompt según el objetivo
  let refinedPrompt = prompt
  if (target === 'banner') {
    refinedPrompt = `Commercial ultra-high quality hero banner photograph (wide 16:9 aspect ratio) for an e-commerce brand named "${storeName}": ${prompt}. Professional studio or lifestyle lighting, 8k resolution, elegant, photorealistic, clean composition.`
  } else if (target === 'logo') {
    refinedPrompt = `Minimalist modern vector-style brand logo icon on a clean white background for brand "${storeName}": ${prompt}. Clean geometry, premium luxury graphic design, centered, no clutter.`
  } else if (target === 'heroPanel') {
    refinedPrompt = `Editorial vertical commercial photography (4:5 or 1:1) for brand "${storeName}": ${prompt}. High-end product photography, crisp focus, soft natural light, magazine quality.`
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://flashcheckout.co',
        'X-Title': 'FlashCheckout AI Store Builder',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: refinedPrompt,
          },
        ],
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('[generateStoreImage] OpenRouter API error:', res.status, errData)
      return { success: false, error: `Error del proveedor de IA: ${res.status}` }
    }

    const data = await res.json()
    const firstChoice = data?.choices?.[0]?.message
    const images = firstChoice?.images

    let base64Data: string | null = null

    if (Array.isArray(images) && images.length > 0) {
      const imgObj = images[0]
      const urlStr = imgObj?.image_url?.url || imgObj?.url || ''
      if (urlStr.startsWith('data:image')) {
        base64Data = urlStr
      }
    }

    if (!base64Data) {
      return { success: false, error: 'No se generó ninguna imagen en la respuesta.' }
    }

    // Si Supabase está disponible, subir el buffer a Supabase Storage
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        const match = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/)
        const ext = match ? match[1] : 'png'
        const rawBase64 = match ? match[2] : base64Data.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '')
        const buffer = Buffer.from(rawBase64, 'base64')
        const filename = `ai-generated/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('products-images')
          .upload(filename, buffer, {
            contentType: `image/${ext}`,
            upsert: false,
          })

        if (!uploadErr) {
          const { data: publicData } = supabase.storage
            .from('products-images')
            .getPublicUrl(filename)

          if (publicData?.publicUrl) {
            return { success: true, imageUrl: publicData.publicUrl }
          }
        } else {
          console.warn('[generateStoreImage] Supabase upload failed, using data URI:', uploadErr)
        }
      } catch (uploadException) {
        console.warn('[generateStoreImage] Upload exception, fallback to data URI:', uploadException)
      }
    }

    // Fallback si no hay supabase o falló la subida: devolver el data URL directamente
    return { success: true, imageUrl: base64Data }
  } catch (error: any) {
    console.error('[generateStoreImage] Exception:', error)
    return { success: false, error: error?.message || 'Error inesperado generando imagen.' }
  }
}

