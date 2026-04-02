import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, ExternalLink, Zap, Settings, CreditCard } from 'lucide-react'
import { prisma } from '@/lib/prisma'

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
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:inline">
                FlashCheckout
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {store && (
              <Link
                href={`/tienda/${store.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver tienda</span>
              </Link>
            )}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            <SidebarLink href="/dashboard" icon={LayoutDashboard} label="Panel" />
            <SidebarLink href="/productos" icon={Package} label="Productos" />
            <SidebarLink href="/pedidos" icon={ShoppingCart} label="Pedidos" />
            <SidebarLink href="/configuracion" icon={Settings} label="Ajustes" />
            <SidebarLink href="/suscripcion" icon={CreditCard} label="Membresía" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-border/50">
        <div className="flex items-center justify-around h-14">
          <MobileNavLink href="/dashboard" icon={LayoutDashboard} label="Panel" />
          <MobileNavLink href="/productos" icon={Package} label="Productos" />
          <MobileNavLink href="/pedidos" icon={ShoppingCart} label="Pedidos" />
          <MobileNavLink href="/configuracion" icon={Settings} label="Ajustes" />
          <MobileNavLink href="/suscripcion" icon={CreditCard} label="Membresía" />
        </div>
      </nav>
    </div>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
    >
      <Icon className="w-4.5 h-4.5" />
      {label}
    </Link>
  )
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
