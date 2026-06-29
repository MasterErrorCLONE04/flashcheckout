import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ wa?: string; layout?: string; uid?: string }>
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
  const { wa, layout, uid } = await searchParams
  const identity = uid || wa

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
      category: p.category || undefined,
      description: p.description || undefined,
      options: p.options ? (p.options as any) : undefined
    })),
    logoUrl: store.logoUrl,
    bio: store.bio,
    cardPaymentsEnabled,
  }

  // Intentar recuperar la sesión de WhatsApp para restaurar carrito y datos si existen
  let initialCart = {}
  let sessionData = { customerName: '', address: '' }

  if (identity) {
    const session = await (prisma as any).whatsAppSession.findUnique({
      where: {
        phoneNumber_storeId: {
          phoneNumber: identity,
          storeId: store.id
        }
      }
    })
    if (session) {
      const items = (session.cart as any)?.items || {}
      initialCart = Object.fromEntries(
        Object.entries(items)
          .map(([id, item]: [string, any]): [string, number] => {
            const qty = item && typeof item === 'object' && 'qty' in item ? Number(item.qty) : Number(item)
            return [id, qty]
          })
          .filter(([_, qty]) => !isNaN(qty) && qty > 0)
      )
      sessionData = {
        customerName: session.customerName || '',
        address: session.address || ''
      }
    }
  }

  // Usar exclusivamente el diseño nativo Pro (Catalog) para todas las vistas
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
