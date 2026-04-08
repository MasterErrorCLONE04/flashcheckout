import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, ExternalLink, Zap, Settings, CreditCard, ChevronsUpDown, Clock, Gift, BookOpenText, HelpCircle, Menu, Play, History, BarChart3, Database, Users, Rocket, Globe } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import SidebarNav from '@/components/dashboard/SidebarNav'

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
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary animate-in">
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

      <div className="w-full px-4 md:px-8 pb-8 md:pb-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch min-h-[calc(100vh-61px)]">
        {/* Sidebar: Restored Original Image Match */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-zinc-200/60 pr-6 relative pt-4 md:pt-3">
          <div className="sticky top-10 flex flex-col gap-8">
            <SidebarNav />
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 pt-8 md:pt-12">
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
