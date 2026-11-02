import { auth, currentUser } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Zap,
  Clock,
  Gift,
  BookOpenText,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'
import CustomUserMenu from '@/components/dashboard/CustomUserMenu'
import SidebarNav from '@/components/dashboard/SidebarNav'
import { MobileSidebarDrawer, MobileBottomDock } from '@/components/dashboard/MobileSidebarDrawer'
import StoreCreationWizard from '@/components/StoreCreationWizard'
import StoreSwitcher from '@/components/dashboard/StoreSwitcher'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { checkSubscription } from '@/lib/subscription'

type SwitcherStore = {
  id: string
  slug: string
  name: string
  category: string | null
  welcomeMessage: string | null
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const user = await currentUser()
  if (!userId) redirect('/sign-in')

  const cookieStore = await cookies()
  const activeStoreId = cookieStore.get('active_store_id')?.value
  const createNewStoreFlag = cookieStore.get('create_new_store')?.value === 'true'

  const stores = await prisma.store.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, name: true, category: true, welcomeMessage: true },
  })

  let store: SwitcherStore | null = null
  if (activeStoreId) {
    store = await prisma.store.findFirst({
      where: { id: activeStoreId, userId },
      select: { id: true, slug: true, name: true, category: true, welcomeMessage: true },
    })
  }

  if (!store && stores.length > 0) {
    store = stores[0]
  }

  const activeStore = store ?? stores[0]

  const isPro = await checkSubscription()
  let productCount = 0
  let conversationsCount = 0
  let ordersCount = 0
  if (store) {
    productCount = await prisma.product.count({
      where: { storeId: store.id },
    })
    conversationsCount = await prisma.whatsAppSession.count({
      where: { storeId: store.id },
    })
    ordersCount = await prisma.order.count({
      where: { storeId: store.id },
    })
  }

  const onboardingCompleted = !createNewStoreFlag && !!store

  if (stores.length === 0 || createNewStoreFlag || !onboardingCompleted) {
    return (
      <div className="w-full h-screen overflow-hidden bg-white z-50 relative font-sans">
        <StoreCreationWizard
          isNewStore={createNewStoreFlag}
          isPro={isPro}
          hasExistingStores={stores.length > 0}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary animate-in font-sans">
      {/* Breadcrumb-Style Header */}
      <header className="flex w-full shrink-0 items-center justify-between border-b border-zinc-200 bg-[#FAFAFA] px-4 md:px-6 py-2.5 sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile & Tablet Sidebar Drawer Toggle */}
          <MobileSidebarDrawer
            storeName={activeStore.name}
            isPro={isPro}
            productCount={productCount}
            conversationsCount={conversationsCount}
            ordersCount={ordersCount}
          />

          {/* Brand Logo */}
          <Link
            href="/dashboard"
            className="hidden items-center transition-opacity hover:opacity-80 md:flex"
          >
            <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center shadow-xs">
              <Zap className="h-4 w-4 text-white fill-current" />
            </div>
          </Link>

          <span className="hidden size-6 place-content-center justify-center text-center font-medium text-zinc-300 md:inline-flex">
            /
          </span>

          {/* Workspace & Store Switcher */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden text-xs font-semibold text-zinc-500 md:inline-flex">
              Espacios de {user?.firstName || 'Comercio'}
            </span>
            <span className="hidden text-zinc-300 font-light md:inline-flex">/</span>
            <StoreSwitcher stores={stores} activeStore={activeStore} isPro={isPro} />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Utility Icons (Desktop Only) */}
          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              href="/changelog"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Novedades"
            >
              <Clock className="h-4 w-4" />
            </Link>
            <Link
              href="/affiliate"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Programa de afiliados"
            >
              <Gift className="h-4 w-4" />
            </Link>
            <Link
              href="/work/doc"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Documentación"
            >
              <BookOpenText className="h-4 w-4" />
            </Link>
            <Link
              href="/help"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Centro de ayuda"
            >
              <HelpCircle className="h-4 w-4" />
            </Link>
          </div>

          <div className="hidden h-4 w-px rounded-full bg-zinc-200 md:inline-flex" />

          {/* User Custom White Label Menu */}
          <CustomUserMenu />
        </div>
      </header>

      <div className="w-full flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-53px)]">
        {/* Desktop Sidebar: Collapsible hover logic */}
        <aside className="hidden lg:flex flex-col justify-between w-[72px] hover:w-64 group shrink-0 border-r border-zinc-200/80 sticky top-[53px] h-[calc(100vh-53px)] pt-2 pb-6 transition-[width] duration-300 ease-in-out bg-[#FAFAFA] z-20 overflow-y-auto scrollbar-none">
          <div className="flex flex-col gap-4 w-full overflow-hidden">
            <SidebarNav
              conversationsCount={conversationsCount}
              ordersCount={ordersCount}
            />
          </div>

          {/* Upgrade / Product capacity card */}
          <div className="px-3 w-full mt-auto">
            {!isPro ? (
              <>
                <div className="flex flex-col items-center justify-center gap-1 py-4 group-hover:hidden transition-all duration-200">
                  <Link href="/pricing" className="contents">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl border flex flex-col items-center justify-center text-[10px] font-bold shadow-2xs transition-all cursor-pointer tabular-nums',
                        productCount >= 10
                          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse hover:bg-red-100'
                          : productCount >= 8
                          ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200'
                      )}
                      title={`Productos: ${productCount}/10`}
                    >
                      <span>{productCount}</span>
                      <span className="text-[8px] opacity-50">/10</span>
                    </div>
                  </Link>
                </div>

                <Link href="/pricing" className="hidden group-hover:block">
                  <div className="flex flex-col gap-2.5 bg-white border border-zinc-200 rounded-xl p-3.5 relative overflow-hidden hover:border-zinc-300 transition-all cursor-pointer text-left select-none">
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-800">
                      <span>Productos</span>
                      <span className="tabular-nums">{productCount} / 10</span>
                    </div>

                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          productCount >= 10
                            ? 'bg-red-500'
                            : productCount >= 8
                            ? 'bg-amber-500'
                            : 'bg-zinc-900'
                        )}
                        style={{ width: `${Math.min((productCount / 10) * 100, 100)}%` }}
                      />
                    </div>

                    <span className="text-[11px] font-medium text-zinc-500 block text-left">
                      {productCount >= 10 ? 'Límite alcanzado · Mejorar plan' : 'Límite del plan Gratuito'}
                    </span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center gap-1 py-4 group-hover:hidden transition-all duration-200">
                  <Link href="/configuracion" className="contents">
                    <div
                      className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors"
                      title={`Plan Premium activo (${productCount} productos)`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  </Link>
                </div>

                <div className="hidden group-hover:flex flex-col gap-2.5 bg-white border border-zinc-200 rounded-xl p-3.5 relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-900 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Premium
                    </span>
                    <span className="text-zinc-500 font-medium tabular-nums">
                      {productCount} productos
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-zinc-500 block text-left">
                    Inventario ilimitado activo
                  </span>

                  <Link href="/configuracion" className="contents">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 h-8 w-full rounded-lg text-xs font-semibold bg-zinc-50 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-all border border-zinc-200 cursor-pointer mt-0.5"
                    >
                      Gestionar membresía
                    </button>
                  </Link>
                </div>
              </>
            )}

            <div className="h-px w-full bg-zinc-200 hidden group-hover:block my-3" />

            <div className="w-full flex items-center justify-center">
              <div className="w-full group-hover:hidden flex justify-center pb-2">
                <CustomUserMenu variant="avatar" storeName={store?.name || undefined} />
              </div>
              <div className="w-full hidden group-hover:block animate-in fade-in duration-200">
                <CustomUserMenu variant="card" storeName={store?.name || undefined} />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 px-4 md:px-8 pb-24 lg:pb-12 pt-4 md:pt-6 lg:pl-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Quick Dock */}
      <MobileBottomDock
        conversationsCount={conversationsCount}
        ordersCount={ordersCount}
      />
    </div>
  )
}
