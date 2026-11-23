import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getActiveStore } from '@/lib/store-context'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { userId } = await auth()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/sign-in`)
  }

  const store = await getActiveStore(userId)
  if (!store) {
    return NextResponse.redirect(`${baseUrl}/integraciones`)
  }

  const clientId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID
  if (!clientId) {
    return NextResponse.redirect(
      `${baseUrl}/integraciones?selected=meta&meta_setup=token`
    )
  }

  const redirectUri = `${baseUrl}/api/integrations/meta/callback`
  const scope = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
  ].join(',')

  const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${encodeURIComponent(store.id)}&scope=${encodeURIComponent(
    scope
  )}&response_type=code`

  return NextResponse.redirect(oauthUrl)
}
