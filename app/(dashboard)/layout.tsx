import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, ExternalLink, Zap, Settings, CreditCard, ChevronsUpDown, Clock, Gift, BookOpenText, HelpCircle, Menu, Play, History, BarChart3, Database, Users, Rocket, Globe } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage } from '@/components/ui/avatar'

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
    select: { slug: true, name: true },
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-primary/20 selection:text-primary animate-in">
      {/* Breadcrumb-Style Modern Header */}
      <header className="flex w-full shrink-0 items-center justify-between border-b bg-white px-5 py-4 sticky top-0 z-50">
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
              <span className="w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-lg border bg-[#F3F4F6] font-medium text-[10px] px-1.5 py-px hidden select-none text-zinc-500 md:inline-flex tracking-tight">
                Free
              </span>
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
            <Link href="#" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Changelog">
              <Clock className="h-5 w-5" />
            </Link>
            <Link href="#" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Affiliate">
              <Gift className="h-5 w-5" />
            </Link>
            <Link href="#" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Documentation">
              <BookOpenText className="h-5 w-5" />
            </Link>
            <Link href="/help" className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors" title="Help">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </div>

          <div className="hidden h-4 w-px rounded-full bg-zinc-200 md:inline-flex"></div>

          {/* User Button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-7 h-7 border border-zinc-200 ring-2 ring-zinc-50 hover:ring-zinc-200 transition-all',
              },
            }}
          />
        </div>
      </header>

      <div className="w-full px-8 md:px-12 py-8 md:py-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar: Restored Original Apple Column */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-10">
            <div>
              <p className="px-4 mb-4 text-xs font-bold text-zinc-400 tracking-widest uppercase">Gestión</p>
              <nav className="space-y-1">
                <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarLink href="/productos" icon={Package} label="Mis productos" />
                <SidebarLink href="/pedidos" icon={ShoppingCart} label="Ventas & pedidos" />
              </nav>
            </div>
            
            <div>
              <p className="px-4 mb-4 text-xs font-bold text-zinc-400 tracking-widest uppercase">Sistema</p>
              <nav className="space-y-1">
                <SidebarLink href="/configuracion" icon={Settings} label="Configuración" />
                <SidebarLink href="/suscripcion" icon={CreditCard} label="Suscripción pro" isPro={true} />
              </nav>
            </div>

            <div className="p-5 border border-black/[0.02] bg-white mt-12 overflow-hidden relative group rounded-2xl shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12" />
              <p className="text-xs font-bold text-primary tracking-widest mb-2 uppercase">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[13px] font-semibold text-zinc-800">Sistema operativo</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Nav: Restored Original Floating Rounded Style */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-white/80 backdrop-blur-md rounded-full border border-black/[0.05] shadow-xl overflow-hidden p-1.5">
        <div className="flex items-center justify-around">
          <MobileNavLink href="/dashboard" icon={LayoutDashboard} />
          <MobileNavLink href="/productos" icon={Package} />
          <MobileNavLink href="/pedidos" icon={ShoppingCart} />
          <MobileNavLink href="/configuracion" icon={Settings} />
        </div>
      </nav>
    </div>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  isPro = false,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isPro?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
        isPro 
          ? "text-primary hover:bg-primary/[0.03]" 
          : "text-zinc-600 hover:text-black hover:bg-black/[0.03]"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-all duration-300",
        isPro 
          ? "bg-primary/5 text-primary group-hover:scale-110" 
          : "bg-zinc-100 group-hover:bg-zinc-200 group-hover:scale-110 group-hover:text-black"
      )}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      {label}
      {isPro && (
        <span className="ml-auto text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">Pro</span>
      )}
    </Link>
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
