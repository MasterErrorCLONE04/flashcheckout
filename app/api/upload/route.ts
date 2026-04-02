import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Create an elevated Supabase client for Server-Side uploads bypassing RLS
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      return NextResponse.json({ error: 'No se envió ninguna foto.' }, { status: 400 })
    }

    // Prepare buffer and details
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = file.name.split('.').pop()
    const path = `products/${userId}-${Date.now()}.${ext}`

    // Upload using Service Role
    const { error } = await supabaseServer.storage
      .from('products-images')
      .upload(path, buffer, { 
        contentType: file.type || 'image/jpeg',
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
