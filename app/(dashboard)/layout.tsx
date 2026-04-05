import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, ExternalLink, Zap, Settings, CreditCard, ChevronsUpDown, Clock, Gift, BookOpenText, HelpCircle, Menu, Play, History, BarChart3, Database, Users, Rocket, Globe } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
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

      <div className="w-full px-5 md:px-8 py-6 flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-80px)]">
        {/* Sidebar: New Modern Chatbase Style */}
        <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col gap-3 sticky top-24 self-start h-[calc(100vh-120px)] border-r border-zinc-100 pr-4">
          <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
            <Accordion type="single" collapsible className="w-full flex flex-col gap-1">
              {/* Dashboard / Playground */}
              <SidebarLink 
                href="/dashboard" 
                icon={Play} 
                label="Dashboard" 
                title="Playground"
              />

              {/* Activity Section */}
              <AccordionItem value="activity" className="border-none">
                <AccordionTrigger className="flex-1 justify-between gap-4 py-2 hover:bg-zinc-100 rounded-md px-2.5 text-muted-foreground hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <span className="text-sm font-medium">Actividad</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2 pl-9 flex flex-col gap-1">
                  <Link href="/pedidos" className="text-[13px] text-zinc-500 hover:text-zinc-950 py-1 transition-colors tracking-tight">Ventas recientes</Link>
                  <Link href="/dashboard" className="text-[13px] text-zinc-500 hover:text-zinc-950 py-1 transition-colors tracking-tight">Eventos de tienda</Link>
                </AccordionContent>
              </AccordionItem>

              {/* Analytics Section */}
              <AccordionItem value="analytics" className="border-none">
                <AccordionTrigger className="flex-1 justify-between gap-4 py-2 hover:bg-zinc-100 rounded-md px-2.5 text-muted-foreground hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm font-medium tracking-tight">Estadísticas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2 pl-9 flex flex-col gap-1">
                  <Link href="/pedidos" className="text-xs text-muted-foreground hover:text-black py-1 transition-colors">Ingresos</Link>
                  <Link href="/productos" className="text-xs text-muted-foreground hover:text-black py-1 transition-colors">Visitas</Link>
                </AccordionContent>
              </AccordionItem>

              {/* Data Sources Section */}
              <AccordionItem value="data" className="border-none">
                <AccordionTrigger className="flex-1 justify-between gap-4 py-2 hover:bg-zinc-100 rounded-md px-2.5 text-muted-foreground hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    <span className="text-sm font-medium">Productos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2 pl-9 flex flex-col gap-1">
                  <Link href="/productos" className="text-xs text-muted-foreground hover:text-black py-1 transition-colors">Gestionar inventario</Link>
                  <Link href="/productos" className="text-xs text-muted-foreground hover:text-black py-1 transition-colors">Categorías</Link>
                </AccordionContent>
              </AccordionItem>

              {/* Links Sections */}
              <SidebarLink href="/configuracion" icon={Zap} label="Acciones rápidas" />
              <SidebarLink href="#" icon={Users} label="Clientes" />

              {/* Deploy Highlighted Link */}
              <Link 
                href={`/tienda/${store?.slug}`} 
                target="_blank"
                className="relative flex w-full items-center rounded-md px-2.5 py-1.5 font-medium text-sm transition-all duration-75 group gap-2 text-foreground mb-2 mt-1"
              >
                <div className="absolute inset-0 rounded-lg border border-zinc-200 bg-white shadow-sm group-hover:border-zinc-300 transition-colors" />
                <Rocket className="relative z-10 h-5 w-5 text-primary" />
                <span className="relative z-10 font-medium">Publicar tienda</span>
              </Link>

              {/* Settings Section */}
              <AccordionItem value="settings" className="border-none">
                <AccordionTrigger className="flex-1 justify-between gap-4 py-2 hover:bg-zinc-100 rounded-md px-2.5 text-muted-foreground hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span className="text-sm font-medium">Configuración</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2 pl-9 flex flex-col gap-1">
                  <Link href="/configuracion" className="text-xs text-muted-foreground hover:text-black py-1 transition-colors">General</Link>
                  <Link href="/suscripcion" className="text-xs text-muted-foreground hover:text-black py-1 transition-colors flex items-center justify-between">
                    Suscripcion Pro
                    <span className="bg-primary text-white px-1.5 py-0.5 rounded text-[8px] font-bold">Pro</span>
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Getting Started Progress Card */}
          <Link href="#" className="mt-auto pt-4 group">
            <div className="flex flex-col gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-sm transition-colors hover:border-zinc-600">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[13px] text-white tracking-tight">Primeros pasos</span>
                  <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                    <ChevronsUpDown className="w-2.5 h-2.5 text-zinc-400 rotate-90" />
                  </div>
                </div>
                <span className="font-medium text-xs text-zinc-400">0 / 6 completados</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full bg-zinc-700" />
                ))}
              </div>
            </div>
          </Link>
        </aside>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Footbar: Modern Multi-Icon Grid */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg glass-dark rounded-lg border border-black/[0.1] shadow-2xl overflow-hidden p-2">
        <div className="grid h-12 grid-cols-6 gap-1 items-center">
          <Avatar className="size-8 mx-auto border border-white/20">
            <AvatarImage src={user?.imageUrl} />
          </Avatar>
          <MobileActionLink href="#" icon={Clock} />
          <MobileActionLink href="#" icon={Gift} />
          <MobileActionLink href="#" icon={BookOpenText} />
          <MobileActionLink href="/help" icon={HelpCircle} />
          <MobileActionLink href="/" icon={Globe} />
        </div>
      </nav>
    </div>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  title,
}: {
  href: string
  icon: any
  label: string
  title?: string
}) {
  return (
    <Link
      href={href}
      title={title || label}
      className="group relative flex w-full items-center rounded-md px-2.5 py-1.5 font-medium text-sm transition-all duration-75 gap-2 text-muted-foreground hover:bg-zinc-100 hover:text-black"
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

function MobileActionLink({
  href,
  icon: Icon,
}: {
  href: string
  icon: any
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center size-10 rounded-lg text-zinc-100 hover:bg-white/10 transition-all active:scale-95"
    >
      <Icon className="w-5 h-5" />
    </Link>
  )
}
