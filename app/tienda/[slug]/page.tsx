import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
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

export default async function StorePage({ params }: Props) {
  const { slug } = await params

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

  const cardPaymentsEnabled = true // Todos usan el Mercado Pago de la plataforma

  return (
    <CheckoutForm
      store={{
        id: store.id,
        name: store.name,
        whatsapp: store.whatsapp,
        products: store.products,
        cardPaymentsEnabled,
      }}
    />
  )
}
