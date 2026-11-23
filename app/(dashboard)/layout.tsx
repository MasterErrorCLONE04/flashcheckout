import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
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

  const store: SwitcherStore | null =
    (activeStoreId ? stores.find(s => s.id === activeStoreId) : null) ??
    stores[0] ??
    null

  const activeStore = store ?? stores[0]

  const [isPro, productCount, conversationsCount, ordersCount] = await Promise.all([
    checkSubscription(),
    store ? prisma.product.count({ where: { storeId: store.id } }) : Promise.resolve(0),
    store ? prisma.whatsAppSession.count({ where: { storeId: store.id } }) : Promise.resolve(0),
    store ? prisma.order.count({ where: { storeId: store.id } }) : Promise.resolve(0),
  ])

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
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/affiliate"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Programa de afiliados"
            >
              <Gift className="h-4 w-4" />
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
        {/* Desktop Sidebar: Collapsible hover logic (stays open while profile menu is open) */}
        <aside className="hidden lg:flex flex-col justify-between w-[72px] hover:w-64 has-[[data-state=open]]:w-64 group shrink-0 border-r border-zinc-200/80 sticky top-[53px] h-[calc(100vh-53px)] pt-2 pb-6 transition-[width] duration-300 ease-in-out bg-[#FAFAFA] z-20 overflow-y-auto scrollbar-none">
          <div className="flex flex-col gap-4 w-full overflow-hidden">
            <SidebarNav
              conversationsCount={conversationsCount}
              ordersCount={ordersCount}
            />
          </div>

          {/* User profile menu at bottom of sidebar */}
          <div className="px-3 w-full mt-auto">
            <div className="h-px w-full bg-zinc-200 hidden group-hover:block group-has-[[data-state=open]]:block my-3" />

            <div className="w-full flex items-center justify-center">
              <CustomUserMenu variant="sidebar" storeName={store?.name || undefined} />
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
