import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, ExternalLink, Zap, Settings, CreditCard } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
    select: { slug: true, name: true },
  })

  return (
    <div className="min-h-screen bg-secondary selection:bg-primary/20 selection:text-primary animate-in">
      {/* Top Nav: Pure Apple Alabaster */}
      <nav className="sticky top-0 z-50 glass border-b border-black/[0.05]">
        <div className="w-full px-8 md:px-12 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-lg relative group">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-black">
                Flash<span className="text-primary">Checkout</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {store && (
              <Link
                href={`/tienda/${store.slug}`}
                target="_blank"
                className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-primary-hover group transition-colors"
              >
                <div className="bg-primary/5 p-2 rounded-xl group-hover:bg-primary/10 transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                Panel externo
              </Link>
            )}
            <div className="h-4 w-[1px] bg-black/5 mx-2" />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 border border-black/5 ring-4 ring-black/[0.02] hover:ring-primary/20 transition-all',
                },
              }}
            />
          </div>
        </div>
      </nav>

      <div className="w-full px-8 md:px-12 py-8 md:py-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar: Apple Column */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-10">
            <div>
              <p className="px-4 mb-4 text-xs font-bold text-zinc-400 tracking-widest">Gestión</p>
              <nav className="space-y-1">
                <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarLink href="/productos" icon={Package} label="Mis productos" />
                <SidebarLink href="/pedidos" icon={ShoppingCart} label="Ventas & pedidos" />
              </nav>
            </div>
            
            <div>
              <p className="px-4 mb-4 text-xs font-bold text-zinc-400 tracking-widest">Sistema</p>
              <nav className="space-y-1">
                <SidebarLink href="/configuracion" icon={Settings} label="Configuración" />
                <SidebarLink href="/suscripcion" icon={CreditCard} label="Suscripción pro" isPro={true} />
              </nav>
            </div>

            <div className="p-5 premium-card border-black/[0.02] bg-white mt-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12" />
              <p className="text-xs font-bold text-primary tracking-widest mb-2">Status</p>
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

      {/* Mobile Nav: Pure Floating Alabaster */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm glass rounded-full border border-black/[0.05] shadow-xl overflow-hidden p-1.5">
        <div className="flex items-center justify-around">
          <MobileNavLink href="/dashboard" icon={LayoutDashboard} />
          <MobileNavLink href="/productos" icon={Package} />
          <MobileNavLink href="/pedidos" icon={ShoppingCart} />
          <MobileNavLink href="/suscripcion" icon={CreditCard} />
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
