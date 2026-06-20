import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `products/${productId}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('products-images')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from('products-images').getPublicUrl(path)

  return publicUrl
}

export async function uploadProofImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.split('.').pop() || 'png'
  const path = `proofs/${filename.replace(`.${ext}`, '')}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('products-images')
    .upload(path, buffer, {
      upsert: true,
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from('products-images').getPublicUrl(path)

  return publicUrl
}

