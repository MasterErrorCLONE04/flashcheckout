import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ wa?: string; layout?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const store = await prisma.store.findUnique({
    where: { slug, active: true },
    select: { name: true },
  })

  if (!store) return { title: 'Tienda no encontrada' }

  return {
    title: `${store.name} — FlashCheckout`,
    description: `Compra en ${store.name} y recibe tu pedido rápido. Checkout por WhatsApp en 30 segundos.`,
  }
}

export default async function StorePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { wa, layout } = await searchParams

  const store = await prisma.store.findUnique({
    where: { slug, active: true },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!store) notFound()

  const cardPaymentsEnabled = true 

  const storeData = {
    id: store.id,
    name: store.name,
    whatsapp: store.whatsapp,
    products: store.products.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      stock: p.stock,
      imageUrl: p.imageUrl,
      category: p.category || undefined
    })),
    logoUrl: store.logoUrl,
    cardPaymentsEnabled,
  }

  // Si viene con layout=native (desde WhatsApp), mostramos el nuevo diseño de lista
  if (layout === 'native') {
    return <WhatsAppCatalog initialPhone={wa} store={storeData} />
  }

  // De lo contrario, mantenemos el diseño Premium Desktop original
  return <CheckoutForm initialPhone={wa} store={storeData} />
}
