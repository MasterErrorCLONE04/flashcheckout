import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import {
  badRequest,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

export type MetaSocialConfig = {
  connected: boolean
  accessToken?: string
  facebookPageId: string | null
  facebookPageName: string | null
  instagramAccountId: string | null
  instagramUsername: string | null
  defaultChannels: Array<'INSTAGRAM' | 'FACEBOOK'>
  connectedAt: string | null
}

function parseStoreSettings(raw: unknown): Record<string, any> {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object') return { ...(raw as Record<string, any>) }
  return {}
}

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Tienda no encontrada')

    const settings = parseStoreSettings(store.settings)
    const meta: MetaSocialConfig | undefined = settings.metaSocial

    return NextResponse.json({
      metaSocial: {
        connected: Boolean(meta?.connected && meta?.accessToken),
        facebookPageId: meta?.facebookPageId || null,
        facebookPageName: meta?.facebookPageName || null,
        instagramAccountId: meta?.instagramAccountId || null,
        instagramUsername: meta?.instagramUsername || null,
        defaultChannels: meta?.defaultChannels || ['INSTAGRAM', 'FACEBOOK'],
        hasToken: Boolean(meta?.accessToken),
        connectedAt: meta?.connectedAt || null,
      },
    })
  } catch (error: any) {
    return internalServerError(error?.message || 'Error al obtener configuración Meta')
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Tienda no encontrada')

    const body = await req.json().catch(() => null)
    if (!body) return badRequest('Datos inválidos')

    const settings = parseStoreSettings(store.settings)
    const existingMeta: Partial<MetaSocialConfig> = settings.metaSocial || {}

    const rawToken =
      typeof body.accessToken === 'string' && body.accessToken.trim()
        ? body.accessToken.trim()
        : existingMeta.accessToken || ''

    if (!rawToken) {
      return badRequest(
        'Ingresa tu Access Token de Meta Graph API (Facebook Page / Instagram Business).'
      )
    }

    let resolvedPageId: string | null =
      typeof body.facebookPageId === 'string' && body.facebookPageId.trim()
        ? body.facebookPageId.trim()
        : existingMeta.facebookPageId || null
    let resolvedPageName: string | null =
      typeof body.facebookPageName === 'string' && body.facebookPageName.trim()
        ? body.facebookPageName.trim()
        : existingMeta.facebookPageName || null
    let resolvedIgId: string | null =
      typeof body.instagramAccountId === 'string' && body.instagramAccountId.trim()
        ? body.instagramAccountId.trim()
        : existingMeta.instagramAccountId || null
    let resolvedIgUsername: string | null =
      typeof body.instagramUsername === 'string' && body.instagramUsername.trim()
        ? body.instagramUsername.trim().replace(/^@/, '')
        : existingMeta.instagramUsername || null
    let resolvedPageToken = rawToken

    // Try auto-discovering Facebook Page & Instagram Business Account from Meta Graph API
    try {
      const accountsRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(
          rawToken
        )}`
      )
      const accountsJson = await accountsRes.json().catch(() => null)

      if (accountsRes.ok && Array.isArray(accountsJson?.data) && accountsJson.data.length > 0) {
        // Pick matching page if facebookPageId was specified, otherwise the first page with IG or first page
        const matchedPage =
          (resolvedPageId &&
            accountsJson.data.find((p: any) => String(p.id) === resolvedPageId)) ||
          accountsJson.data.find((p: any) => p.instagram_business_account?.id) ||
          accountsJson.data[0]

        if (matchedPage) {
          resolvedPageId = String(matchedPage.id)
          resolvedPageName = String(matchedPage.name || resolvedPageName || 'Página Oficial')
          if (matchedPage.access_token) {
            resolvedPageToken = String(matchedPage.access_token)
          }
          if (matchedPage.instagram_business_account?.id) {
            resolvedIgId = String(matchedPage.instagram_business_account.id)
            resolvedIgUsername = String(
              matchedPage.instagram_business_account.username ||
                matchedPage.instagram_business_account.name ||
                resolvedIgUsername ||
                'instagram'
            ).replace(/^@/, '')
          }
        }
      } else {
        // Check if token is already a direct Page Access Token
        const meRes = await fetch(
          `https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(
            rawToken
          )}`
        )
        const meJson = await meRes.json().catch(() => null)
        if (meRes.ok && meJson?.id) {
          if (!resolvedPageId) resolvedPageId = String(meJson.id)
          if (!resolvedPageName && meJson.name) resolvedPageName = String(meJson.name)
          if (meJson.instagram_business_account?.id) {
            resolvedIgId = String(meJson.instagram_business_account.id)
            resolvedIgUsername = String(
              meJson.instagram_business_account.username ||
                meJson.instagram_business_account.name ||
                resolvedIgUsername ||
                'instagram'
            ).replace(/^@/, '')
          }
        }
      }
    } catch (graphErr) {
      console.warn('[Meta Graph Auto-Discovery Warning]:', graphErr)
    }

    if (!resolvedPageId && !resolvedIgId) {
      return badRequest(
        'No se detectó una Página de Facebook o Cuenta de Instagram automáticamente con ese token. Ingresa el ID de tu Página de Facebook o ID de Instagram Business.'
      )
    }

    const defaultChannels: Array<'INSTAGRAM' | 'FACEBOOK'> = Array.isArray(
      body.defaultChannels
    )
      ? body.defaultChannels.filter(
          (c: string) => c === 'INSTAGRAM' || c === 'FACEBOOK'
        )
      : ['INSTAGRAM', 'FACEBOOK']

    const newMetaConfig: MetaSocialConfig = {
      connected: true,
      accessToken: resolvedPageToken,
      facebookPageId: resolvedPageId,
      facebookPageName: resolvedPageName || (resolvedPageId ? `Página #${resolvedPageId.slice(-4)}` : null),
      instagramAccountId: resolvedIgId,
      instagramUsername: resolvedIgUsername || (resolvedIgId ? `ig_${resolvedIgId.slice(-4)}` : null),
      defaultChannels:
        defaultChannels.length > 0 ? defaultChannels : ['INSTAGRAM', 'FACEBOOK'],
      connectedAt: existingMeta.connectedAt || new Date().toISOString(),
    }

    const updatedSettings = {
      ...settings,
      metaSocial: newMetaConfig,
    }

    await prisma.store.update({
      where: { id: store.id },
      data: {
        settings: updatedSettings,
      },
    })

    return NextResponse.json({
      success: true,
      metaSocial: {
        connected: true,
        facebookPageId: newMetaConfig.facebookPageId,
        facebookPageName: newMetaConfig.facebookPageName,
        instagramAccountId: newMetaConfig.instagramAccountId,
        instagramUsername: newMetaConfig.instagramUsername,
        defaultChannels: newMetaConfig.defaultChannels,
        hasToken: true,
        connectedAt: newMetaConfig.connectedAt,
      },
    })
  } catch (error: any) {
    console.error('[Meta Integration Save Error]:', error)
    return internalServerError(
      error?.message || 'Error al guardar la integración con Meta'
    )
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Tienda no encontrada')

    const settings = parseStoreSettings(store.settings)
    delete settings.metaSocial

    await prisma.store.update({
      where: { id: store.id },
      data: {
        settings,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return internalServerError(error?.message || 'Error al desconectar Meta')
  }
}
