import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import ProductManager from '@/components/ProductManager'

export default async function ProductosPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) redirect('/dashboard')

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  })

  const isPro = await checkSubscription()

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el catálogo de tu tienda
          </p>
        </div>
        {!isPro && (
          <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold">
            {products.length} / 10 Gratis
          </div>
        )}
      </div>
      <ProductManager initialProducts={products} storeId={store.id} isPro={isPro} />
    </div>
  )
}
