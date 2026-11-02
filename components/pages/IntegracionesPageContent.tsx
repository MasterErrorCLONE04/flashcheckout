import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getActiveStore } from '@/lib/store-context'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import IntegrationsClient from '@/components/IntegrationsClient'

export const dynamic = 'force-dynamic'

export default async function IntegracionesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // 1. Obtener el negocio activo del usuario
  const store = (await getActiveStore(userId, {
    brebConfig: true
  })) as (Awaited<ReturnType<typeof getActiveStore>> & {
    brebConfig?: { enabled: boolean; keyValue: string | null } | null
  }) | null

  if (!store) return <StoreCreationWizard />

  // 2. Serializar solo los campos requeridos para el componente cliente
  const storeData = {
    whatsappConnected: store.whatsappConnected,
    whatsapp: store.whatsapp,
    mpConnected: store.mpConnected,
    mpPublicKey: store.mpPublicKey,
    brebConnected: store.brebConfig ? store.brebConfig.enabled : false,
    brebKeyValue: store.brebConfig ? store.brebConfig.keyValue : null
  }

  return (
    <IntegrationsClient store={storeData} />
  )
}
