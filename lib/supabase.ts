import 'server-only'
import { createClient } from '@supabase/supabase-js'

export const PUBLIC_STORAGE_BUCKET = 'products-images'
export const PRIVATE_PROOF_BUCKET = 'payment-proofs'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type StorageLocation = {
  bucket: string
  path: string
}

export function resolveProofStorageLocation(
  value: string | null | undefined
): StorageLocation | null {
  if (!value) return null

  if (!value.includes('/storage/v1/object/')) {
    if (/^https?:\/\//i.test(value)) {
      return null
    }

    return {
      bucket: PRIVATE_PROOF_BUCKET,
      path: value,
    }
  }

  const publicPrefix = `/storage/v1/object/public/${PRIVATE_PROOF_BUCKET}/`
  const signedPrefix = `/storage/v1/object/sign/${PRIVATE_PROOF_BUCKET}/`
  const legacyPublicPrefix = `/storage/v1/object/public/${PUBLIC_STORAGE_BUCKET}/`
  const legacySignedPrefix = `/storage/v1/object/sign/${PUBLIC_STORAGE_BUCKET}/`

  const locations = [
    { prefix: publicPrefix, bucket: PRIVATE_PROOF_BUCKET },
    { prefix: signedPrefix, bucket: PRIVATE_PROOF_BUCKET },
    { prefix: legacyPublicPrefix, bucket: PUBLIC_STORAGE_BUCKET },
    { prefix: legacySignedPrefix, bucket: PUBLIC_STORAGE_BUCKET },
  ]

  for (const location of locations) {
    const idx = value.indexOf(location.prefix)
    if (idx !== -1) {
      return {
        bucket: location.bucket,
        path: value.slice(idx + location.prefix.length).split('?')[0],
      }
    }
  }

  return null
}

export function extractProofStoragePath(value: string | null | undefined): string | null {
  return resolveProofStorageLocation(value)?.path ?? null
}

export async function getProofImageUrl(value: string | null | undefined): Promise<string | null> {
  const location = resolveProofStorageLocation(value)
  if (!location) return null

  if (location.bucket === PUBLIC_STORAGE_BUCKET) {
    if (value?.startsWith('http')) {
      return value
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PUBLIC_STORAGE_BUCKET).getPublicUrl(location.path)
    return publicUrl
  }

  const { data, error } = await supabaseAdmin.storage
    .from(location.bucket)
    .createSignedUrl(location.path, 60 * 60)

  if (error || !data?.signedUrl) {
    const legacyPublicUrl = value?.startsWith('http') ? value : null
    return legacyPublicUrl
  }

  return data.signedUrl
}

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `products/${productId}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(PUBLIC_STORAGE_BUCKET)
    .upload(path, file, { upsert: true })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(PUBLIC_STORAGE_BUCKET).getPublicUrl(path)

  return publicUrl
}

export async function uploadProofImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.split('.').pop() || 'png'
  const path = `proofs/${filename.replace(`.${ext}`, '')}-${Date.now()}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from(PRIVATE_PROOF_BUCKET)
    .upload(path, buffer, {
      upsert: true,
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    })

  if (error) throw error

  return path
}

