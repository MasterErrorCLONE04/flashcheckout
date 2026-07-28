import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getActiveStore } from '@/lib/store-context'
import { prisma } from '@/lib/prisma'
import { badRequest, getErrorMessage, internalServerError, unauthorized } from '@/lib/api/route-utils'
import type { BrebKeyType } from '@/lib/payments/breb/emvco'

export const dynamic = 'force-dynamic'

type BrebConfigBody = {
  enabled?: boolean
  keyType?: BrebKeyType
  keyValue?: string
  bankProvider?: string
  merchantDisplayName?: string
  participantId?: string
  keyTypeCode?: string
}

const VALID_KEY_TYPES: BrebKeyType[] = ['PHONE', 'EMAIL', 'DOCUMENT', 'ALPHANUMERIC', 'MERCHANT_CODE']
const BREB_SETTINGS_KEY = 'brebConfig'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized('No autorizado')

    const store = await getActiveStore(userId)
    if (!store) return NextResponse.json({ config: null })

    const tableConfig = await prisma.brebPaymentConfig.findUnique({
      where: { storeId: store.id },
    })
    const settings = getStoreSettings(store.settings)
    const config = tableConfig || settings[BREB_SETTINGS_KEY] || null

    return NextResponse.json({ config })
  } catch (error) {
    console.error('[Bre-B Config GET Error]', error)
    return internalServerError(getErrorMessage(error, 'Error al obtener la configuración de Bre-B'))
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized('No autorizado')

    const store = await getActiveStore(userId)
    if (!store) return badRequest('Tienda no encontrada')

    const body = (await req.json().catch(() => null)) as BrebConfigBody | null
    if (!body) return badRequest('Datos invalidos')

    const keyType = body.keyType
    if (!keyType || !VALID_KEY_TYPES.includes(keyType)) {
      return badRequest('Tipo de llave Bre-B invalido')
    }

    const keyValue = normalizeKeyValue(body.keyValue || '', keyType)
    if (!keyValue) return badRequest('Llave Bre-B requerida')

    const bankProvider = body.bankProvider?.trim()
    if (!bankProvider) return badRequest('Banco o proveedor requerido')

    const merchantDisplayName = sanitizeDisplayName(body.merchantDisplayName || store.name)
    if (!merchantDisplayName) return badRequest('Nombre del comercio requerido')
    const participantId = body.participantId?.replace(/\D/g, '') || ''
    if (body.enabled && !participantId) {
      return badRequest('Codigo de entidad participante requerido para activar Bre-B')
    }

    if (participantId) {
      const bankLower = bankProvider.toLowerCase()
      if (bankLower.includes('nequi') && participantId !== '1507') {
        return badRequest('Para Nequi, el código de entidad participante debe ser 1507')
      }
      if (bankLower.includes('davivienda') && participantId !== '0051') {
        return badRequest('Para Davivienda, el código de entidad participante debe ser 0051')
      }
      if ((bankLower.includes('nu') || bankLower.includes('nubank')) && participantId !== '3201') {
        return badRequest('Para Nu Colombia, el código de entidad participante debe ser 3201')
      }
      if (bankLower.includes('bancolombia') && participantId !== '0007') {
        return badRequest('Para Bancolombia, el código de entidad participante debe ser 0007')
      }
    }

    const settings = getStoreSettings(store.settings)
    const config = {
      enabled: Boolean(body.enabled),
      keyType,
      keyValue,
      bankProvider,
      merchantDisplayName,
      participantId: participantId || null,
      keyTypeCode: body.keyTypeCode?.replace(/\D/g, '') || null,
      verificationStatus: 'PENDING',
      updatedAt: new Date().toISOString(),
    }

    await prisma.$transaction([
      prisma.brebPaymentConfig.upsert({
        where: { storeId: store.id },
        create: {
          storeId: store.id,
          enabled: config.enabled,
          keyType: config.keyType,
          keyValue: config.keyValue,
          bankProvider: config.bankProvider,
          merchantDisplayName: config.merchantDisplayName,
          participantId: config.participantId,
          keyTypeCode: config.keyTypeCode,
          verificationStatus: config.verificationStatus,
        },
        update: {
          enabled: config.enabled,
          keyType: config.keyType,
          keyValue: config.keyValue,
          bankProvider: config.bankProvider,
          merchantDisplayName: config.merchantDisplayName,
          participantId: config.participantId,
          keyTypeCode: config.keyTypeCode,
          verificationStatus: config.verificationStatus,
        },
      }),
      prisma.store.update({
        where: { id: store.id },
        data: {
          settings: {
            ...settings,
            [BREB_SETTINGS_KEY]: config,
          },
        },
      }),
    ])

    return NextResponse.json({ config })
  } catch (error) {
    console.error('[Bre-B Config Error]', error)
    return internalServerError(getErrorMessage(error, 'Error guardando configuracion Bre-B'))
  }
}

function normalizeKeyValue(value: string, keyType: BrebKeyType) {
  const trimmed = value.trim()
  if (keyType === 'PHONE') {
    const digits = trimmed.replace(/\D/g, '')
    return digits ? `@${digits}` : ''
  }
  if (keyType === 'DOCUMENT') return trimmed.replace(/\D/g, '')
  if (keyType === 'ALPHANUMERIC' && trimmed && !trimmed.startsWith('@')) return `@${trimmed}`
  return trimmed
}

function sanitizeDisplayName(value: string) {
  return value.trim().slice(0, 60)
}

function getStoreSettings(settings: unknown) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return {}
  return settings as Record<string, unknown>
}
