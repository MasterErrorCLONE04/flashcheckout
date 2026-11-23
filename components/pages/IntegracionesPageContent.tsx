import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getActiveStore } from '@/lib/store-context'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import IntegrationsClient from '@/components/IntegrationsClient'

export const dynamic = 'force-dynamic'

function parseMetaSocial(rawSettings: unknown) {
  if (!rawSettings || typeof rawSettings !== 'object') return null
  const meta = (rawSettings as Record<string, any>).metaSocial
  if (!meta) return null
  return {
    connected: Boolean(meta.connected && meta.accessToken),
    facebookPageId: meta.facebookPageId || null,
    facebookPageName: meta.facebookPageName || null,
    instagramAccountId: meta.instagramAccountId || null,
    instagramUsername: meta.instagramUsername || null,
    defaultChannels: Array.isArray(meta.defaultChannels)
      ? meta.defaultChannels
      : ['INSTAGRAM', 'FACEBOOK'],
    hasToken: Boolean(meta.accessToken),
  }
}

export default async function IntegracionesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = (await getActiveStore(userId, {
    brebConfig: true,
  })) as (Awaited<ReturnType<typeof getActiveStore>> & {
    brebConfig?: {
      enabled: boolean
      keyType: string
      keyValue: string | null
      bankProvider: string | null
      merchantDisplayName: string | null
      participantId: string | null
    } | null
  }) | null

  if (!store) return <StoreCreationWizard />

  const storeData = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    whatsappConnected: store.whatsappConnected,
    whatsappInstanceName: store.whatsappInstanceName,
    whatsapp: store.whatsapp,
    mpConnected: store.mpConnected,
    mpPublicKey: store.mpPublicKey,
    hasMpToken: Boolean(store.mpAccessToken),
    stripeConnected: (store as any).stripeConnected,
    stripePublicKey: (store as any).stripePublicKey,
    hasStripeSecret: Boolean((store as any).stripeSecretKey),
    brebConnected: store.brebConfig ? store.brebConfig.enabled : false,
    brebKeyValue: store.brebConfig ? store.brebConfig.keyValue : null,
    brebBankProvider: store.brebConfig ? store.brebConfig.bankProvider : null,
    metaSocial: parseMetaSocial(store.settings),
  }

  return <IntegrationsClient store={storeData} />
}
