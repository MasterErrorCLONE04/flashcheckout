import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Create an elevated Supabase client for Server-Side uploads bypassing RLS
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8 MB
const MAX_VIDEO_BYTES = 25 * 1024 * 1024 // 25 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    // Auth Check
    if (!userId) {
      return NextResponse.json({ error: 'Usted no está autorizado.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 })
    }

    const baseMime = (file.type || '').split(';')[0].trim().toLowerCase()
    const safeExt = ALLOWED_MIME_TYPES[baseMime]
    if (!safeExt) {
      return NextResponse.json(
        { error: 'Formato de archivo no permitido. Usa JPG, PNG, WEBP, GIF, AVIF, MP4 o WEBM.' },
        { status: 400 }
      )
    }

    const isVideo = baseMime.startsWith('video/')
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `El archivo supera el tamaño máximo permitido (${isVideo ? '25 MB' : '8 MB'}).` },
        { status: 400 }
      )
    }

    // Prepare buffer and details
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const folder = isVideo ? 'studio-videos' : 'products'
    const path = `${folder}/${userId}-${Date.now()}.${safeExt}`

    // Upload using Service Role
    const { error } = await supabaseServer.storage
      .from('products-images')
      .upload(path, buffer, { 
        contentType: baseMime,
        upsert: false // Don't mistakenly overwrite using the same name
      })

    if (error) {
      console.error("Supabase storage error:", error)
      return NextResponse.json({ error: 'Fallo la subida a Supabase.' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseServer.storage
      .from('products-images')
      .getPublicUrl(path)

    return NextResponse.json({ success: true, url: publicUrl })

  } catch (error) {
    console.error('API /upload Error:', error)
    return NextResponse.json({ error: 'Error del servidor al procesar tu subida' }, { status: 500 })
  }
}
