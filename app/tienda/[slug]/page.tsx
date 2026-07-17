import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'
import type { Metadata } from 'next'
import {
  buildInitialCheckoutCart,
  buildInitialCheckoutSessionData,
  buildPublicCheckoutStore,
} from '@/lib/checkout/public-store'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ wa?: string; uid?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const store = await prisma.store.findUnique({
    where: { slug },
    select: { name: true },
  })

  if (!store) return { title: 'Tienda no encontrada' }

  return {
    title: `${store.name} - FlashCheckout`,
    description: `Compra en ${store.name} y recibe tu pedido rapido. Checkout por WhatsApp en 30 segundos.`,
  }
}

export default async function StorePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { wa, uid } = await searchParams
  const identity = uid || wa

  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!store) notFound()

  if (!store.active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 text-center font-sans select-none">
        <div className="max-w-sm space-y-4 rounded-2xl border border-zinc-200 bg-white p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-500">
            !
          </div>
          <h1 className="text-lg font-black text-zinc-900">Tienda pausada</h1>
          <p className="text-xs font-semibold leading-normal text-zinc-400">
            Esta tienda online esta temporalmente inactiva. Vuelve a visitarnos mas tarde.
          </p>
        </div>
      </div>
    )
  }

  const storeData = buildPublicCheckoutStore(store, true)

  let initialCart: Record<string, number> = {}
  let sessionData = buildInitialCheckoutSessionData('', '')

  if (identity) {
    const session = await prisma.whatsAppSession.findUnique({
      where: {
        phoneNumber_storeId: {
          phoneNumber: identity,
          storeId: store.id,
        },
      },
    })

    if (session) {
      initialCart = buildInitialCheckoutCart(session.cart)
      sessionData = buildInitialCheckoutSessionData(session.customerName, session.address)
    }
  }

  return (
    <WhatsAppCatalog
      initialPhone={identity}
      store={storeData}
      initialCart={initialCart}
      initialName={sessionData.customerName}
      initialAddress={sessionData.address}
    />
  )
}
