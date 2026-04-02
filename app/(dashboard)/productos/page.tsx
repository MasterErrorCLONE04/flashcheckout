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
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter glow-text uppercase leading-none">Suministros y Activos</h1>
          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
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
      <ProductManager initialProducts={products} storeId={store.id} isPro={isPro} />
    </div>
  )
}
