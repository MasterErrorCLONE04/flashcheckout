import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import ProductManager from '@/components/ProductManager'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export default async function ProductosPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  })

  const isPro = await checkSubscription()

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950">Suministros y Activos</h1>
          <div className="text-[15px] font-medium text-zinc-500 mt-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Inventario Operativo — {products.length} MÓDULOS ACTIVOS
          </div>
        </div>
        {!isPro && (
          <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {products.length} / 10 Espacios Usados
          </div>
        )}
      </div>
      <ProductManager initialProducts={products} storeId={store.id} storeSlug={store.slug} isPro={isPro} />
    </div>
  )
}
