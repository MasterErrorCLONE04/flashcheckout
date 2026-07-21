'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Zap,
  Layout as LayoutIcon,
  Smartphone,
  CheckCircle2,
  Settings,
  PlusCircle,
  MessageSquare,
  CreditCard,
  ShoppingBag,
  Bell,
  Sidebar as SidebarIcon,
  User,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Search,
  Globe,
  BarChart3,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Truck,
  Award,
  Circle,
  Percent,
  Sliders
} from 'lucide-react'
import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as any }
}
type DocSection = {
  id: string
  label: string
  items: Array<{ id: string; label: string }>
}


const DOC_SECTIONS: DocSection[] = [
    {
      id: 'primeros-pasos',
      label: 'Primeros Pasos',
      items: [
        { id: 'inicio-rapido', label: 'Inicio rápido' },
        { id: 'acceso-y-login', label: 'Acceso y seguridad' },
      ]
    },
    {
      id: 'agentes-ia-menu',
      label: 'Agentes de IA (Nuevo)',
      items: [
        { id: 'agentes-ia', label: 'Copilotos Multitarea' },
      ]
    },
    {
      id: 'cobros-menu',
      label: 'Pasarelas de Pago',
      items: [
        { id: 'stripe-connect', label: 'Stripe Connect' },
        { id: 'mercado-pago', label: 'Mercado Pago' },
        { id: 'verificacion-pagos', label: 'Validar Transferencias' },
      ]
    },
    {
      id: 'automatizaciones-menu',
      label: 'Automatizaciones',
      items: [
        { id: 'automatizaciones-whatsapp', label: 'WhatsApp Automations' },
      ]
    },
    {
      id: 'crm-menu',
      label: 'CRM y Conversaciones',
      items: [
        { id: 'crm-conversaciones', label: 'Historial & Live Chat' },
      ]
    },
    {
      id: 'marketing-menu',
      label: 'Marketing & Config',
      items: [
        { id: 'cupones-descuento', label: 'Cupones de Descuento' },
        { id: 'bandeja-inteligente', label: 'Bandeja Inteligente' },
        { id: 'constructor-tienda', label: 'Constructor de Tienda' },
      ]
    }
  ]

export default function DocPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-zinc-950 text-white"><Zap className="animate-pulse w-8 h-8 text-[#10B981]" /></div>}>
      <DocContent />
    </Suspense>
  )
}

function DocContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeSlug = searchParams.get('s') || 'inicio-rapido'
  const [searchTerm, setSearchTerm] = useState('')



  const filteredSections = useMemo(() => {
    if (!searchTerm) return DOC_SECTIONS
    return DOC_SECTIONS.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.items.length > 0)
  }, [searchTerm])

  const setView = (id: string) => {
    router.push(`?s=${id}`, { scroll: false })
  }

  return (
    <DocLayout
      activeSlug={activeSlug}
      filteredSections={filteredSections}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      onViewChange={setView}
    />
  )
}

function DocLayout({
  activeSlug,
  filteredSections,
  searchTerm,
  onSearchTermChange,
  onViewChange,
}: {
  activeSlug: string
  filteredSections: DocSection[]
  searchTerm: string
  onSearchTermChange: (value: string) => void
  onViewChange: (id: string) => void
}) {
  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row overflow-hidden antialiased">
      <DocSidebar
        activeSlug={activeSlug}
        filteredSections={filteredSections}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        onViewChange={onViewChange}
      />
      <DocMainContent activeSlug={activeSlug} />
    </div>
  )
}

function DocSidebar({
  activeSlug,
  filteredSections,
  searchTerm,
  onSearchTermChange,
  onViewChange,
}: {
  activeSlug: string
  filteredSections: DocSection[]
  searchTerm: string
  onSearchTermChange: (value: string) => void
  onViewChange: (id: string) => void
}) {
  return (
    <aside className="w-full md:w-[300px] h-auto md:h-full border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md overflow-y-auto px-6 py-8 z-40 shrink-0">
      <div className="mb-8">
        <DocBrand />
        <DocSearch value={searchTerm} onChange={onSearchTermChange} />
        <nav className="space-y-7">
          {filteredSections.map((group) => (
            <DocNavGroup key={group.id} activeSlug={activeSlug} group={group} onViewChange={onViewChange} />
          ))}
        </nav>
      </div>
    </aside>
  )
}

function DocBrand() {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
        <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center shadow-md shadow-emerald-950/40">
          <Zap className="w-4.5 h-4.5 text-white fill-current" />
        </div>
        <span className="font-bold text-base tracking-tight text-white">
          Flash<span className="text-[#10B981]">Doc</span>
        </span>
      </Link>
      <div className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-0.5 flex items-center h-fit">
        <span className="text-[9px] font-black tracking-wider text-[#10B981] uppercase whitespace-nowrap">v2.0 Pro</span>
      </div>
    </div>
  )
}

function DocSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative mb-6 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#10B981] transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar documentación..."
        className="w-full h-10 pl-11 pr-4 bg-zinc-900/60 border border-zinc-850 rounded-lg text-xs font-semibold tracking-tight focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all placeholder:text-zinc-500 text-white"
      />
    </div>
  )
}

function DocNavGroup({
  activeSlug,
  group,
  onViewChange,
}: {
  activeSlug: string
  group: DocSection
  onViewChange: (id: string) => void
}) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-[10px] font-black text-zinc-500 tracking-widest px-2.5 uppercase">{group.label}</h4>
      <div className="space-y-1">
        {group.items.map((item) => {
          const isActive = activeSlug === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center px-3.5 py-2.5 rounded-lg text-xs transition-all duration-200 border text-left cursor-pointer font-bold",
                isActive
                  ? "bg-[#10B981]/10 border-[#10B981]/30 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DocMainContent({ activeSlug }: { activeSlug: string }) {
  return (
    <main className="flex-grow relative z-10 px-8 md:px-16 py-12 md:py-16 bg-[#09090B] h-full overflow-y-auto scroll-smooth flex flex-col">
      <div className="max-w-4xl w-full flex-grow">
        <AnimatePresence mode="wait">
          <motion.div key={activeSlug} {...pageTransition} className="w-full">
            {renderDocContent(activeSlug)}
          </motion.div>
        </AnimatePresence>
      </div>
      <BackToDashboardButton />
    </main>
  )
}

function BackToDashboardButton() {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Link
        href="/dashboard"
        className="w-12 h-12 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-200"
        title="Volver al Panel"
      >
        <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5px]" />
      </Link>
    </div>
  )
}
unction renderDocContent(slug: string) {
  switch (slug) {
    case 'inicio-rapido':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              GuÃ­a de Inicio RÃ¡pido
            </h1>
            <p className="text-sm font-semibold leading-relaxed text-zinc-400 max-w-2xl">
              Despliega tu propia terminal comercial en cuestiÃ³n de minutos. Nuestro ecosistema estÃ¡ diseÃ±ado para acelerar la conversiÃ³n, estructurar las ventas de WhatsApp y automatizar cobros.
            </p>
          </div>

          <div className="border border-emerald-950/40 bg-emerald-950/10 p-5 rounded-xl">
             <p className="text-xs font-semibold text-emerald-300 leading-relaxed max-w-2xl flex items-center gap-2.5">
               <Zap className="w-5 h-5 text-[#10B981] fill-current shrink-0 animate-pulse" />
               EstÃ¡s navegando la documentaciÃ³n actualizada v2.0. Conoce a los agentes autÃ³nomos de IA, las automatizaciones por eventos y los nuevos sistemas de pago.
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl flex flex-col gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Settings className="w-4 h-4" />
                 </div>
                 <h4 className="font-bold text-sm text-white">Panel Integrado</h4>
                 <p className="text-xs text-zinc-400 font-semibold leading-relaxed">Configura en un solo lugar pasarelas de pago, campaÃ±as de cupones y tus copilotos de inteligencia artificial.</p>
              </div>
              <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl flex flex-col gap-3">
                 <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <LayoutIcon className="w-4 h-4" />
                 </div>
                 <h4 className="font-bold text-sm text-white">Storefront AutÃ³nomo</h4>
                 <p className="text-xs text-zinc-400 font-semibold leading-relaxed">Tu tienda se genera visualmente al instante y se adapta a mÃ³viles con optimizaciones de carga extrema.</p>
              </div>
          </div>

          <div className="pt-4">
              <Link 
                href="/dashboard"
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                 Comenzar en el Panel
                 <ArrowLeft className="w-4 h-4 rotate-180 shrink-0" />
              </Link>
          </div>
        </div>
      )
    case 'acceso-y-login':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Acceso y Seguridad Integral</h2>
            <p className="text-sm font-semibold text-zinc-400 max-w-xl leading-relaxed">
              AutenticaciÃ³n robusta y cifrado de datos lÃ­der para resguardar la identidad de tu comercio.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl">
               <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-[#10B981]">
                  <ShieldCheck className="w-5 h-5" />
               </div>
               <h4 className="font-bold text-sm mb-1.5 text-white">AutenticaciÃ³n Clerk</h4>
               <p className="text-zinc-400 font-semibold leading-relaxed text-xs">Cierre de sesiÃ³n seguro, autenticaciÃ³n social y verificaciÃ³n de correos integrada a nivel de servidor.</p>
            </div>
            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl">
               <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
                  <RefreshCw className="w-5 h-5" />
               </div>
               <h4 className="font-bold text-sm mb-1.5 text-white">Middleware Edge</h4>
               <p className="text-zinc-400 font-semibold leading-relaxed text-xs">ProtecciÃ³n de rutas comerciales mediante Next.js Middleware para prevenir accesos no autorizados en tiempo rÃ©cord.</p>
            </div>
          </div>
        </div>
      )
    case 'agentes-ia':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full px-3 py-0.5 text-[#10B981] text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Exclusivo v2.0
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Copilotos de IA Multitarea</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-2xl">
              Nuestros 4 agentes autÃ³nomos interactÃºan con las herramientas del sistema (Database Tool Calling) para resolver tus peticiones directamente desde la consola de chat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-950/30 border border-emerald-900/60 flex items-center justify-center text-[#10B981]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Nova</h4>
                  <span className="text-[10px] text-zinc-500 font-semibold">Copiloto Operativo</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Busca y gestiona tus productos, revisa mÃ©tricas bÃ¡sicas de ventas y te ayuda a programar la estructura general de tu tienda.
              </p>
            </div>

            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-950/30 border border-pink-900/60 flex items-center justify-center text-pink-500">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Stella</h4>
                  <span className="text-[10px] text-zinc-500 font-semibold">Especialista de Marketing</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                DiseÃ±a ofertas promocionales personalizadas, crea cupones de descuento (porcentaje, envÃ­o gratis o fijos) y te sugiere planes comerciales.
              </p>
            </div>

            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-950/30 border border-blue-900/60 flex items-center justify-center text-blue-500">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Atlas</h4>
                  <span className="text-[10px] text-zinc-500 font-semibold">Analista de LogÃ­stica</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Monitorea el inventario crÃ­tico de productos con poco stock, revisa pedidos activos y gestiona el flujo de repartidores asignados.
              </p>
            </div>

            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-950/30 border border-purple-900/60 flex items-center justify-center text-purple-500">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Orion</h4>
                  <span className="text-[10px] text-zinc-500 font-semibold">Ingeniero TÃ©cnico</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Configura conexiones de WhatsApp API, vincula pasarelas de cobro, soluciona errores de webhook y proporciona soporte tÃ©cnico experto.
              </p>
            </div>
          </div>
        </div>
      )
    case 'stripe-connect':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Stripe Connect</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              Procesa pagos directos con tarjetas de crÃ©dito de forma global y recibe transferencias directamente a tu cuenta bancaria.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Onboarding InstantÃ¡neo</h4>
                <p className="text-xs text-zinc-500 font-semibold">Vincula tu cuenta bancaria en segundos.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              En los Ajustes del Dashboard, haz clic en "Vincular Stripe" para rellenar la informaciÃ³n legal y bancaria. Stripe validarÃ¡ tu cuenta y depositarÃ¡ tus ventas de manera automÃ¡tica en el intervalo establecido.
            </p>
          </div>
        </div>
      )
    case 'mercado-pago':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Mercado Pago (PSE & Tarjetas)</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              La pasarela preferida para el mercado latinoamericano. Habilita pagos inmediatos en pesos colombianos.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">ConexiÃ³n vÃ­a Token</h4>
                <p className="text-xs text-zinc-500 font-semibold">IntegraciÃ³n mediante tus credenciales de Mercado Pago.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              Introduce tu Access Token y Public Key desde la pestaÃ±a de Integraciones. Tus clientes podrÃ¡n pagar a travÃ©s de links de checkout y el propio bot procesarÃ¡ la preferencia para registrar el pago tan pronto como se complete.
            </p>
          </div>
        </div>
      )
    case 'verificacion-pagos':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Validar Transferencias & Comprobantes</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              Permite transferencias de bancos locales (Nequi, Bancolombia, etc.) y verifica el comprobante manualmente.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Bandeja de VerificaciÃ³n Manual (`/verificaciones`)</h4>
                <p className="text-xs text-zinc-500 font-semibold">Audita capturas de pantalla enviadas por tus clientes.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              Cuando un cliente selecciona "Transferencia" y sube una foto de su recibo, el pedido queda retenido. En la secciÃ³n **Verificar Pagos**, podrÃ¡s inspeccionar el comprobante, validarlo y cambiar el estado del pedido a pagado con un solo clic.
            </p>
          </div>
        </div>
      )
    case 'automatizaciones-whatsapp':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Automatizaciones de WhatsApp</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              Dispara flujos conversacionales dinÃ¡micos basados en eventos operativos clave de la tienda.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4 font-sans">
            <div className="flex justify-between items-center select-none pb-2 border-b border-zinc-900">
              <span className="text-xs font-bold text-zinc-400">FLUJO AUTOMÃTICO</span>
              <span className="text-[10px] font-black text-emerald-500">CONECTADO</span>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-white">Pedido Recibido / Pendiente</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Notifica al cliente con la confirmaciÃ³n del pedido y los datos para transferir.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-white">Pedido Despachado</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">EnvÃ­a el nÃºmero de guÃ­a e informaciÃ³n del repartidor asignado automÃ¡ticamente.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-white">Encuesta de Servicio</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Al ser entregado, el bot recopila opiniones y puntuaciÃ³n de servicio.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    case 'crm-conversaciones':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Conversacional CRM & Live Chat</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              Supervisa las interacciones del chatbot con tus clientes y toma el control manual en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#10B981]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Live Chat</h4>
              <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                Visualiza los chats de WhatsApp activos, filtra favoritos, aÃ±ade notas rÃ¡pidas al cliente y responde directamente sin salir del dashboard.
              </p>
            </div>

            <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white">Logs Persistentes</h4>
              <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                El historial completo de transacciones, estados de entrega y logs de chat permanecen guardados y accesibles de por vida para auditorÃ­as.
              </p>
            </div>
          </div>
        </div>
      )
    case 'cupones-descuento':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Cupones de Descuento</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              Impulsa tus ventas creando incentivos personalizados y analizando su rendimiento general en tiempo real.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-500">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">ConfiguraciÃ³n Flexible</h4>
                <p className="text-xs text-zinc-500 font-semibold">Cupones por porcentaje, envÃ­o gratis y montos fijos.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              En la secciÃ³n de **Descuentos**, configura nuevos cupones estableciendo su cÃ³digo, descripciÃ³n, tipo de descuento y fecha de validez. PodrÃ¡s ver cuÃ¡ntas veces han sido redimidos y el impacto porcentual sobre tus ventas.
            </p>
          </div>
        </div>
      )
    case 'bandeja-inteligente':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Bandeja Inteligente (Smart Inbox)</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              Monitoreo operativo autÃ³nomo para alertarte sobre incidentes crÃ­ticos que necesitan tu resoluciÃ³n.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Notificaciones de AcciÃ³n RÃ¡pida</h4>
                <p className="text-xs text-zinc-500 font-semibold">Resoluciones a un solo clic.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              Ubicado a la derecha en tu Panel de Control, te alertarÃ¡ de inmediato si el nÃºmero de WhatsApp se desconectÃ³, si hay transferencias por validar, si un producto estÃ¡ bajo en stock, o si tienes pedidos listos para ser despachados.
            </p>
          </div>
        </div>
      )
    case 'constructor-tienda':
      return (
        <div className="space-y-10 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Constructor Visual de Tienda</h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
              Personaliza el diseÃ±o, la identidad de tu marca, logo y colores de tu storefront pÃºblico.
            </p>
          </div>

          <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#10B981]">
                <LayoutIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">PersonalizaciÃ³n del Storefront</h4>
                <p className="text-xs text-zinc-500 font-semibold">Toma el control visual de la experiencia del cliente.</p>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              En la secciÃ³n de **ConfiguraciÃ³n de Tienda**, ajusta el banner de bienvenida, la biografÃ­a de tu negocio, sube un logo en alta definiciÃ³n y define los colores primarios. Tu catÃ¡logo online se adaptarÃ¡ en tiempo real reflejando tu identidad.
            </p>
          </div>
        </div>
      )
    default:
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20">
           <Zap className="w-10 h-10 text-zinc-700 mb-6 animate-pulse" />
           <h2 className="text-base font-bold tracking-tight text-zinc-500">MÃ³dulo en ConstrucciÃ³n</h2>
        </div>
      )
  }
}
