import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badRequest, getErrorMessage, internalServerError, notFound } from '@/lib/api/route-utils'
import { PUBLIC_STORAGE_BUCKET, supabaseAdmin, uploadProofImage } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MAX_PROOF_SIZE = 6 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

type StoredBrebConfig = {
  enabled?: boolean
  keyValue?: string
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const orderId = String(formData.get('orderId') || '')
    const proof = formData.get('proof') as File | null

    if (!orderId) return badRequest('orderId requerido')
    if (!proof) return badRequest('Comprobante requerido')
    if (!SUPPORTED_IMAGE_TYPES.has(proof.type)) return badRequest('Formato de imagen no soportado')
    if (proof.size > MAX_PROOF_SIZE) return badRequest('La imagen supera el tamaño máximo permitido')

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          select: {
            id: true,
            settings: true,
            brebConfig: true,
          },
        },
      },
    })

    if (!order) return notFound('Orden no encontrada')
    if (order.paymentStatus === 'PAID' || order.status === 'paid') {
      return badRequest('La orden ya esta pagada')
    }

    const brebConfig = getBrebConfig(order.store.brebConfig, order.store.settings)
    if (!brebConfig?.enabled || !brebConfig.keyValue) {
      return badRequest('La tienda no tiene Bre-B activo')
    }

    let storedProofUrl: string | null = null
    try {
      const arrayBuffer = await proof.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = (proof.name.split('.').pop() || 'png').replace(/[^a-zA-Z0-9]/g, '')
      const safeFilename = `breb-${order.id}.${ext}`

      try {
        storedProofUrl = await uploadProofImage(buffer, safeFilename)
      } catch {
        const fallbackPath = `proofs/breb-${order.id}-${Date.now()}.${ext}`
        const { error: uploadErr } = await supabaseAdmin.storage
          .from(PUBLIC_STORAGE_BUCKET)
          .upload(fallbackPath, buffer, {
            contentType: proof.type || 'image/jpeg',
            upsert: true,
          })
        if (!uploadErr) {
          const {
            data: { publicUrl },
          } = supabaseAdmin.storage.from(PUBLIC_STORAGE_BUCKET).getPublicUrl(fallbackPath)
          storedProofUrl = publicUrl
        }
      }
    } catch (storageError) {
      console.warn('[Bre-B Proof Storage Warning] No se pudo subir a storage:', storageError)
    }

    const reviewPayload = {
      type: 'BREB_PROOF_REVIEW',
      mode: 'MANUAL_REVIEW_SAFE_MODE',
      filename: proof.name,
      mimeType: proof.type,
      size: proof.size,
      expectedAmount: order.total,
      expectedDestinationKey: brebConfig.keyValue,
      receivedAt: new Date().toISOString(),
      note: storedProofUrl
        ? 'Comprobante almacenado y pendiente de revisión del comercio.'
        : 'La captura fue validada en formato/tamaño y queda pendiente de revisión.',
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'UPLOADED',
        status: 'pending_payment',
        ...(storedProofUrl && { proofImageUrl: storedProofUrl }),
        adminComment: JSON.stringify(reviewPayload),
      },
    })

    return NextResponse.json({
      ok: true,
      paymentStatus: 'UPLOADED',
      decision: {
        decision: 'MANUAL_REVIEW',
        confidence: 0.5,
        reasons: ['Comprobante recibido. Falta revision del vendedor u OCR autorizado.'],
      },
      message: 'Comprobante recibido. La tienda lo revisara para confirmar el pago.',
    })
  } catch (error) {
    console.error('[Bre-B Proof Error]', error)
    return internalServerError(getErrorMessage(error, 'Error procesando comprobante Bre-B'))
  }
}

function getBrebConfig(tableConfig: StoredBrebConfig | null, settings: unknown): StoredBrebConfig | null {
  if (tableConfig) return tableConfig
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  const config = (settings as Record<string, unknown>).brebConfig
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null
  return config as StoredBrebConfig
}
