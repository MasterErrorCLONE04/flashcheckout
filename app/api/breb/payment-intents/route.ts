import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badRequest, getErrorMessage, internalServerError, notFound } from '@/lib/api/route-utils'
import { buildBrebEmvcoPayload, DEFAULT_BREB_EMVCO_GUI, type BrebKeyType } from '@/lib/payments/breb/emvco'
import { buildBrebPaymentReference } from '@/lib/payments/breb/references'

export const dynamic = 'force-dynamic'

type CreatePaymentIntentBody = {
  orderId?: string
}

type StoredBrebConfig = {
  enabled?: boolean
  keyType?: string
  keyValue?: string
  merchantDisplayName?: string
  participantId?: string | null
  keyTypeCode?: string | null
}

const VALID_KEY_TYPES: BrebKeyType[] = ['PHONE', 'EMAIL', 'DOCUMENT', 'ALPHANUMERIC', 'MERCHANT_CODE']

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as CreatePaymentIntentBody | null
    if (!body?.orderId) return badRequest('orderId requerido')

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
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

    const config = getBrebConfig(order.store.brebConfig, order.store.settings)
    if (!config?.enabled) return badRequest('La tienda no tiene Bre-B activo')
    const keyType = normalizeBrebKeyType(config.keyType)
    if (!config.keyValue || !keyType) return badRequest('La configuracion Bre-B esta incompleta')
    if (!config.participantId) return badRequest('Falta el codigo de entidad participante Bre-B')

    const gui = process.env.BREB_EMVCO_GUI?.trim() || DEFAULT_BREB_EMVCO_GUI
    const reference = buildBrebPaymentReference(order.id)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    const emvPayload = buildBrebEmvcoPayload({
      merchantName: config.merchantDisplayName || order.store.name,
      amount: order.total,
      reference,
      merchantAccount: {
        gui,
        participantId: config.participantId,
        keyType,
        keyValue: config.keyValue,
        keyTypeCode: config.keyTypeCode || undefined,
      },
    })

    const paymentIntent = {
      id: `breb_${order.id}`,
      orderId: order.id,
      storeId: order.storeId,
      amount: order.total,
      currency: 'COP',
      reference,
      emvPayload,
      status: 'PENDING',
      expiresAt: expiresAt.toISOString(),
    }

    return NextResponse.json({ paymentIntent }, { status: 201 })
  } catch (error) {
    console.error('[Bre-B Payment Intent Error]', error)
    return internalServerError(getErrorMessage(error, 'Error generando cobro Bre-B'))
  }
}

function getBrebConfig(tableConfig: StoredBrebConfig | null, settings: unknown): StoredBrebConfig | null {
  if (tableConfig) return tableConfig
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null
  const config = (settings as Record<string, unknown>).brebConfig
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null
  return config as StoredBrebConfig
}

function normalizeBrebKeyType(value: string | undefined): BrebKeyType | null {
  if (!value) return null
  return VALID_KEY_TYPES.includes(value as BrebKeyType) ? (value as BrebKeyType) : null
}
