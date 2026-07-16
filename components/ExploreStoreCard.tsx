import Link from 'next/link'
import { ArrowRight, CheckCircle2, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { CATEGORY_THEMES, formatCurrency, normalizeCategory } from '@/components/ExploreData'
import type { ExploreStore } from '@/components/ExploreTypes'
import { cn } from '@/lib/utils'

export default function ExploreStoreCard({ store }: { store: ExploreStore }) {
  const category = normalizeCategory(store.category)
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.General
  const initials = store.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const featuredProduct = store.products[0]
  const minProductPrice = store.products.length > 0 ? Math.min(...store.products.map((product) => product.price)) : null
  const isVerified = store.verificationLevel > 0 || store.whatsappVerified
  const hasSecurePayments = store.stripeConnectChargesEnabled || store.mpConnected

  return (
    <Link href={`/tienda/${store.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.04]">
        <div className={cn('relative h-36 overflow-hidden bg-gradient-to-br', theme.cover)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,.38),transparent_26%),radial-gradient(circle_at_78%_30%,rgba(255,255,255,.25),transparent_22%)]" />
          {featuredProduct?.imageUrl && (
            <img src={featuredProduct.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-multiply transition duration-500 group-hover:scale-105" />
          )}
          {isVerified && <span className="absolute left-5 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-sm">Verificada</span>}
          <div className="absolute -bottom-9 left-5 flex size-20 items-center justify-center rounded-full border-4 border-white bg-white text-2xl font-black text-zinc-700 shadow-xl dark:border-zinc-950 dark:bg-zinc-900 dark:text-white">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>

        <div className="px-5 pb-5 pt-12">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-[-0.045em] text-zinc-950 dark:text-white">
              {store.name}
              {isVerified && <CheckCircle2 className="ml-2 inline size-4 fill-blue-500 text-white" />}
            </h3>
            <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{store.category || 'General'}</p>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-200">
            <PackageCheck className="size-4 text-amber-400" />
            <span className="font-black">{minProductPrice === null ? 'Catálogo activo' : `Desde ${formatCurrency(minProductPrice)}`}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
              <Truck className="size-3.5" />
              {store._count.products} productos
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-bold text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
              <ShieldCheck className="size-3.5" />
              {hasSecurePayments ? 'Pago seguro' : 'Compra directa'}
            </span>
          </div>

          <div className="mt-5 flex h-11 items-center justify-center gap-3 rounded-full border border-zinc-200 text-sm font-black text-zinc-950 transition group-hover:border-zinc-950 group-hover:bg-zinc-950 group-hover:text-white dark:border-white/10 dark:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-950">
            Visitar tienda
            <ArrowRight className="size-4" />
          </div>
        </div>
      </article>
    </Link>
  )
}
