import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import StudioIaClient from '@/components/StudioIaClient'
import { getActiveStore } from '@/lib/store-context'

export default async function StudioIaPageContent() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await getActiveStore(userId)
  if (!store) return <StoreCreationWizard />

  // 1. Obtener productos activos del catálogo real
  const products = await prisma.product.findMany({
    where: { storeId: store.id, active: true },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Obtener cupones activos de la tienda para vincular promociones en videos
  const coupons = await prisma.coupon.findMany({
    where: { storeId: store.id, estado: 'Activo' },
    orderBy: { createdAt: 'desc' }
  })

  // 3. Obtener creaciones previas de Studio IA si existen
  let mediaCreations: any[] = []
  try {
    if ((prisma as any).aiMediaContent) {
      mediaCreations = await (prisma as any).aiMediaContent.findMany({
        where: { storeId: store.id },
        include: {
          product: {
            select: { id: true, name: true, price: true, imageUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    }
  } catch (error) {
    console.warn('[Studio IA] No se pudieron cargar creaciones previas de la DB aún:', error)
  }

  // 4. Verificar suscripción PRO de la tienda
  const isPro = await checkSubscription()

  // 5. Preparar datos de la tienda serializables
  const rawSettings =
    store.settings && typeof store.settings === 'object'
      ? (store.settings as Record<string, any>)
      : {}
  const rawMeta = rawSettings.metaSocial

  const storeInfo = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    whatsapp: store.whatsapp,
    whatsappConnected: store.whatsappConnected,
    isPro: Boolean(isPro),
    creditsAvailable: isPro ? 35 : 3,
    metaSocial: rawMeta
      ? {
          connected: Boolean(rawMeta.connected && rawMeta.accessToken),
          facebookPageId: rawMeta.facebookPageId || null,
          facebookPageName: rawMeta.facebookPageName || null,
          instagramAccountId: rawMeta.instagramAccountId || null,
          instagramUsername: rawMeta.instagramUsername || null,
          defaultChannels: Array.isArray(rawMeta.defaultChannels)
            ? rawMeta.defaultChannels
            : ['INSTAGRAM', 'FACEBOOK'],
        }
      : null,
  }

  const serializableProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl || null,
    category: p.category || 'General',
    description: p.description || ''
  }))

  const serializableCoupons = coupons.map(c => ({
    id: c.id,
    code: c.code,
    desc: c.desc,
    valor: c.valor,
    tipoDesc: c.tipoDesc
  }))

  return (
    <div className="w-full">
      <StudioIaClient 
        store={storeInfo}
        products={serializableProducts}
        coupons={serializableCoupons}
        initialCreations={mediaCreations}
      />
    </div>
  )
}
