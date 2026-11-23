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

function extractStoreSeo(rawSettings: unknown) {
  if (!rawSettings || typeof rawSettings !== 'object') return null
  const s = rawSettings as Record<string, any>
  return s.seo && typeof s.seo === 'object' ? s.seo : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      bio: true,
      logoUrl: true,
      category: true,
      active: true,
      settings: true,
    },
  })

  if (!store || !store.active) {
    return {
      title: 'Tienda no disponible',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const customSeo = extractStoreSeo(store.settings)
  const storeUrl = `https://www.flashcheckouts.com/tienda/${store.slug}`
  const title =
    (typeof customSeo?.title === 'string' && customSeo.title.trim()) ||
    `${store.name} — Tienda Oficial Online`
  const description =
    (typeof customSeo?.description === 'string' && customSeo.description.trim()) ||
    store.bio ||
    `Compra online en ${store.name}. Catálogo oficial con pagos seguros Bre-B y atención inmediata por WhatsApp.`
  const ogImage =
    (typeof customSeo?.ogImage === 'string' && customSeo.ogImage.trim()) ||
    store.logoUrl ||
    'https://www.flashcheckouts.com/og-image.png'

  return {
    title,
    description,
    keywords:
      typeof customSeo?.keywords === 'string' && customSeo.keywords.trim()
        ? customSeo.keywords.split(',').map((k: string) => k.trim())
        : [store.name, store.category || 'Tienda Online', 'Comprar online', 'Colombia'],
    alternates: {
      canonical: storeUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'es_CO',
      url: storeUrl,
      title,
      description,
      siteName: store.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: store.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
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
            Esta tienda online está temporalmente inactiva. Vuelve a visitarnos más tarde.
          </p>
        </div>
      </div>
    )
  }

  const storeData = buildPublicCheckoutStore(store, true)
  const storeUrl = `https://www.flashcheckouts.com/tienda/${store.slug}`

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
      sessionData = buildInitialCheckoutSessionData(
        session.customerName,
        session.address
      )
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'OnlineStore',
            name: store.name,
            description:
              store.bio ||
              `Compra en ${store.name} y recibe tu pedido rápido. Checkout directo y atención por WhatsApp.`,
            url: storeUrl,
            image:
              store.logoUrl ||
              'https://www.flashcheckouts.com/Flashcheckout%20logo.png',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `Catálogo de ${store.name}`,
              itemListElement: store.products.map((p, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                item: {
                  '@type': 'Product',
                  name: p.name,
                  description:
                    p.description ||
                    p.aiDescription ||
                    `Compra ${p.name} en ${store.name}`,
                  image: p.imageUrl ? p.imageUrl.split(',')[0] : undefined,
                  offers: {
                    '@type': 'Offer',
                    url: storeUrl,
                    price: p.price,
                    priceCurrency: 'COP',
                    availability:
                      p.stock > 0
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                  },
                },
              })),
            },
          }),
        }}
      />
      <WhatsAppCatalog
        initialPhone={identity}
        store={storeData}
        initialCart={initialCart}
        initialName={sessionData.customerName}
        initialAddress={sessionData.address}
      />
    </>
  )
}
