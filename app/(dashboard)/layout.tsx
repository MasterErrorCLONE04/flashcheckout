import { auth } from '@clerk/nextjs/server'
import CustomUserMenu from '@/components/dashboard/CustomUserMenu'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, ExternalLink, Zap, Settings, CreditCard, ChevronsUpDown, Clock, Gift, BookOpenText, HelpCircle, Menu, Play, History, BarChart3, Database, Users, Rocket, Globe, ArrowUp, CheckCircle2 } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import SidebarNav from '@/components/dashboard/SidebarNav'
import { checkSubscription } from '@/lib/subscription'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  const user = await currentUser()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
    select: { id: true, slug: true, name: true, welcomeMessage: true },
  })

  const isPro = await checkSubscription()
  let productCount = 0
  let conversationsCount = 0
  let ordersCount = 0
  if (store) {
    productCount = await prisma.product.count({
      where: { storeId: store.id },
    })
    conversationsCount = await (prisma as any).whatsAppSession.count({
      where: { storeId: store.id },
    })
    ordersCount = await prisma.order.count({
      where: { storeId: store.id },
    })
  }

  const onboardingCompleted = store && store.welcomeMessage && productCount > 0

  if (!store || !onboardingCompleted) {
    return (
      <div className="w-full h-screen overflow-hidden bg-white z-50 relative font-sans">
        <StoreCreationWizard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary animate-in font-sans">
      {/* Breadcrumb-Style Modern Header */}
      <header className="flex w-full shrink-0 items-center justify-between border-b bg-[#FAFAFA] px-6 py-2.5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* Brand Logo (Chatbase Style Adaptation) */}
          <Link href="/dashboard" className="hidden items-center transition-opacity hover:opacity-80 md:flex">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="h-5 w-5 text-white fill-current" />
            </div>
          </Link>
          
          <span className="hidden size-6 place-content-center justify-center text-center font-medium text-muted-foreground/30 md:inline-flex">/</span>
          
          {/* Workspace Breadcrumb */}
          <div className="flex items-center gap-1">
            <Link 
              href="/dashboard" 
              className="flex max-w-[150px] items-center justify-start gap-1 rounded-md px-0 font-medium text-foreground text-sm transition-colors hover:bg-transparent md:max-w-[200px]"
            >
              <span className="truncate">{user?.firstName || 'Dashboard'}'s workspace</span>
            </Link>
            <button className="flex items-center justify-center h-5 p-0.5 rounded-md transition-all duration-200 hover:bg-muted/50 text-foreground">
              <ChevronsUpDown className="size-3.5 shrink-0 stroke-3 text-muted-foreground opacity-50" />
            </button>
          </div>

          <span className="inline-flex size-6 place-content-center justify-center text-center font-medium text-muted-foreground/30">/</span>

          {/* Agent/Store Breadcrumb */}
          <div className="flex items-center gap-1">
            <Link 
              href={`/tienda/${store?.slug}`} 
              target="_blank"
              className="flex max-w-[120px] items-center justify-start gap-1 rounded-md px-0 font-medium text-foreground text-sm transition-colors hover:bg-transparent md:max-w-[200px]"
            >
              <span className="truncate group items-center flex gap-1.5">
                {store?.name || 'Mi Tienda'}
                <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-primary transition-colors" />
              </span>
              <span className="w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-lg border bg-orange-50 font-medium text-[10px] px-1.5 py-px hidden select-none text-orange-600 border-orange-200 md:inline-flex">
                Agent
              </span>
            </Link>
            <button className="flex items-center justify-center h-5 p-0.5 rounded-md transition-all duration-200 hover:bg-muted/50 text-foreground">
              <ChevronsUpDown className="size-3.5 shrink-0 stroke-3 text-muted-foreground opacity-50" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Toggle */}
          <button className="flex items-center justify-center h-9 w-9 md:hidden hover:bg-zinc-100 rounded-md transition-colors" title="Open sidebar">
            <Menu className="h-5 w-5 text-zinc-600" />
          </button>

          {/* Utility Icons (Desktop Only) */}
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/changelog" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Changelog">
              <Clock className="h-5 w-5" />
            </Link>
            <Link href="/affiliate" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Affiliate">
              <Gift className="h-5 w-5" />
            </Link>
            <Link href="/work/doc" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Documentation">
              <BookOpenText className="h-5 w-5" />
            </Link>
            <Link href="/help" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Help">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </div>

          <div className="hidden h-4 w-px rounded-full bg-zinc-200 md:inline-flex"></div>

          {/* User Custom White Label Menu */}
          <CustomUserMenu />
        </div>
      </header>

      <div className="w-full flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-61px)]">
        {/* Sidebar: Collapsible hover logic */}
        <aside className="hidden lg:flex flex-col justify-between w-[72px] hover:w-64 group flex-shrink-0 border-r border-zinc-200/60 sticky top-[53px] h-[calc(100vh-53px)] pt-2 pb-6 transition-[width] duration-300 ease-in-out bg-[#FAFAFA] z-20">
          <div className="flex flex-col gap-8 w-full overflow-hidden">
            <SidebarNav 
              conversationsCount={conversationsCount} 
              ordersCount={ordersCount} 
            />
          </div>

          {/* Upgrade / Product capacity card */}
          <div className="px-3 w-full mt-auto">
            {!isPro ? (
              <>
                {/* Collapsed state (simplified small badge) */}
                <div className="flex flex-col items-center justify-center gap-1 py-4 group-hover:hidden transition-all duration-200">
                  <Link href="/pricing" className="contents">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex flex-col items-center justify-center text-[10px] font-extrabold shadow-sm transition-all cursor-pointer",
                      productCount >= 10 
                        ? "bg-red-50 border-red-200 text-red-600 animate-pulse hover:bg-red-100" 
                        : productCount >= 8 
                        ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100" 
                        : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                    )} title={`Productos: ${productCount}/10`}>
                      <span>{productCount}</span>
                      <span className="text-[8px] opacity-40">/10</span>
                    </div>
                  </Link>
                </div>

                {/* Expanded state (full detailed card) */}
                <div className="hidden group-hover:flex flex-col gap-3 bg-white border border-zinc-200/80 rounded-2xl p-4 relative overflow-hidden animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-800">
                    <span>Productos</span>
                    <span className="tabular-nums">{productCount} / 10</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        productCount >= 10 ? "bg-red-500" : productCount >= 8 ? "bg-amber-500" : "bg-emerald-500"
                      )} 
                      style={{ width: `${Math.min((productCount / 10) * 100, 100)}%` }}
                    />
                  </div>

                  <span className="text-[9px] font-bold text-zinc-400 tracking-wider block text-left">
                    {productCount >= 10 ? 'Límite alcanzado' : 'Límite del plan Gratuito'}
                  </span>

                  {/* Upgrade Button */}
                  <Link href="/pricing" className="contents">
                    <button className="flex items-center justify-center gap-2 h-9 w-full rounded-lg text-xs font-bold bg-zinc-950 text-white hover:bg-zinc-900 transition-all border border-zinc-800 active:scale-[0.98] shadow-sm mt-1">
                      <ArrowUp className="w-3.5 h-3.5 text-white" />
                      Actualizar Plan
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Collapsed state (simplified small badge) */}
                <div className="flex flex-col items-center justify-center gap-1 py-4 group-hover:hidden transition-all duration-200">
                  <Link href="/dashboard/suscripcion" className="contents">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm cursor-pointer hover:bg-emerald-100 transition-colors" title={`Premium: Activo (${productCount} productos)`}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                  </Link>
                </div>

                {/* Expanded state (full detailed card) */}
                <div className="hidden group-hover:flex flex-col gap-3 bg-white border border-emerald-100 rounded-2xl p-4 relative overflow-hidden animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-855">
                    <span className="flex items-center gap-1 text-emerald-700 font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650" />
                      Premium
                    </span>
                    <span className="text-zinc-500 font-bold tabular-nums">{productCount} productos</span>
                  </div>
                  
                  <span className="text-[9px] font-bold text-zinc-400 tracking-wider block text-left">
                    Soberanía e inventario ilimitado
                  </span>

                  {/* Manage Link Button */}
                  <Link href="/dashboard/suscripcion" className="contents">
                    <button className="flex items-center justify-center gap-2 h-9 w-full rounded-lg text-xs font-bold bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 transition-all border border-zinc-200 active:scale-[0.98] mt-1">
                      Gestionar Membresía
                    </button>
                  </Link>
                </div>
              </>
            )}

            {/* Separator line, visible on expanded */}
            <div className="h-px w-full bg-zinc-250/20 hidden group-hover:block my-3" />

            {/* Bottom User Menu Profile Card */}
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
        <main className="flex-1 min-w-0 px-4 md:px-8 pb-8 md:pb-12 pt-4 md:pt-6 lg:pl-12">
          {children}
        </main>
      </div>

      {/* Mobile Nav: Restored Original Floating Rounded Style */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-white/80 backdrop-blur-md rounded-full border border-black/[0.05] shadow-xl overflow-hidden p-1.5">
        <div className="flex items-center justify-around">
          <MobileNavLink href="/productos" icon={Package} />
          <MobileNavLink href="/pedidos" icon={ShoppingCart} />
          <MobileNavLink href="/configuracion" icon={Settings} />
        </div>
      </nav>
    </div>
  )
}

function MobileNavLink({
  href,
  icon: Icon,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all"
    >
      <Icon className="w-5 h-5" />
    </Link>
  )
}
