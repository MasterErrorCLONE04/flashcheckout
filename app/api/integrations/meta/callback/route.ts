import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin
  const code = url.searchParams.get('code')
  const storeId = url.searchParams.get('state')

  const clientId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID
  const clientSecret = process.env.META_APP_SECRET

  if (!code || !storeId || !clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/integraciones?selected=meta&meta_error=oauth_missing`
    )
  }

  try {
    const redirectUri = `${baseUrl}/api/integrations/meta/callback`
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${encodeURIComponent(
        clientSecret
      )}&code=${encodeURIComponent(code)}`
    )
    const tokenJson = await tokenRes.json()
    if (!tokenRes.ok || !tokenJson?.access_token) {
      throw new Error(tokenJson?.error?.message || 'Fallo al obtener token OAuth')
    }

    const userAccessToken = String(tokenJson.access_token)

    // Discover Facebook Pages & linked Instagram Business Account
    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(
        userAccessToken
      )}`
    )
    const accountsJson = await accountsRes.json()
    const pages = Array.isArray(accountsJson?.data) ? accountsJson.data : []
    const bestPage =
      pages.find((p: any) => p.instagram_business_account?.id) || pages[0]

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.redirect(`${baseUrl}/integraciones`)
    }

    const currentSettings =
      store.settings && typeof store.settings === 'object'
        ? { ...(store.settings as Record<string, any>) }
        : {}

    currentSettings.metaSocial = {
      connected: true,
      accessToken: bestPage?.access_token || userAccessToken,
      facebookPageId: bestPage?.id ? String(bestPage.id) : null,
      facebookPageName: bestPage?.name ? String(bestPage.name) : 'Página Facebook',
      instagramAccountId: bestPage?.instagram_business_account?.id
        ? String(bestPage.instagram_business_account.id)
        : null,
      instagramUsername: bestPage?.instagram_business_account?.username
        ? String(bestPage.instagram_business_account.username)
        : null,
      defaultChannels: ['INSTAGRAM', 'FACEBOOK'],
      connectedAt: new Date().toISOString(),
    }

    await prisma.store.update({
      where: { id: store.id },
      data: { settings: currentSettings },
    })

    return NextResponse.redirect(
      `${baseUrl}/integraciones?selected=meta&meta_connected=1`
    )
  } catch (err) {
    console.error('[Meta OAuth Callback Error]:', err)
    return NextResponse.redirect(
      `${baseUrl}/integraciones?selected=meta&meta_error=callback_failed`
    )
  }
}
