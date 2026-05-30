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
  MessageCircle,
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
} from 'lucide-react'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as any }
}

export default function DocPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Zap className="animate-pulse text-zinc-950" /></div>}>
      <DocContent />
    </Suspense>
  )
}

function DocContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeSlug = searchParams.get('s') || 'inicio-rapido'
  const [searchTerm, setSearchTerm] = useState('')

  const sectionsData = [
    {
      id: 'primeros-pasos',
      label: 'PRIMEROS PASOS',
      items: [
        { id: 'inicio-rapido', label: 'Inicio rápido' },
        { id: 'acceso-y-login', label: 'Acceso y login' },
      ]
    },
    {
      id: 'conceptos',
      label: 'CONCEPTOS DEL TERMINAL',
      items: [
        { id: 'que-es-terminal', label: 'Qué es un Flash Terminal' },
        { id: 'sincronizacion-global', label: 'Sincronización global' },
      ]
    },
    {
      id: 'identidad',
      label: 'IDENTIDAD DE MARCA',
      items: [
        { id: 'disenno-del-nucleo', label: 'Diseño del núcleo' },
        { id: 'estetica-terminal', label: 'Estética de la marca' },
      ]
    },
    {
      id: 'gestion',
      label: 'GESTIÓN & PRODUCTOS',
      items: [
        { id: 'crear-productos', label: 'Crear productos' },
        { id: 'categorias-ecosistema', label: 'Categorías y ecosistemas' },
      ]
    },
    {
      id: 'capacidades',
      label: 'CAPACIDADES FLASH',
      items: [
        { id: 'whatsapp-sync', label: 'WhatsApp Sync Pro' },
        { id: 'pasarelas-de-pago', label: 'Pasarelas de pago' },
      ]
    },
    {
      id: 'analitica-menu',
      label: 'INTELIGENCIA DE DATOS',
      items: [
        { id: 'analitica-luxe', label: 'Analítica Luxe' },
        { id: 'notificaciones-inteligentes', label: 'Notificaciones' },
      ]
    },
    {
      id: 'seguridad-menu',
      label: 'SEGURIDAD',
      items: [
        { id: 'permisos-y-datos', label: 'Permisos y seguridad' },
      ]
    }
  ]

  const filteredSections = useMemo(() => {
    if (!searchTerm) return sectionsData
    return sectionsData.map(group => ({
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
    <div className="h-screen w-full bg-white text-zinc-900 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar - Clean Minimalist Styling */}
      <aside className="w-full md:w-[280px] h-auto md:h-full border-r border-zinc-200 bg-[#FAFAFA] overflow-y-auto px-5 py-8 z-40">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center shadow-sm">
                <Zap className="w-4.5 h-4.5 text-white fill-current" />
              </div>
              <span className="font-semibold text-base tracking-tight text-zinc-950">
                Flash<span className="text-zinc-500 font-medium">Doc</span>
              </span>
            </Link>
            <div className="bg-white border border-zinc-200 rounded-md px-2 py-0.5 flex items-center h-fit">
              <span className="text-[9px] font-bold tracking-tight text-zinc-400 uppercase whitespace-nowrap">Guía</span>
            </div>
          </div>
          
          <div className="relative mb-6 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-950 transition-colors" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Buscar guía..." 
               className="w-full h-10 pl-11 pr-4 bg-white border border-zinc-200 rounded-lg text-xs font-medium tracking-tight focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all placeholder:text-zinc-300"
             />
          </div>

          <nav className="space-y-8">
            {filteredSections.map((group) => (
              <div key={group.id} className="space-y-2">
                <h4 className="text-[9px] font-bold text-zinc-400 tracking-wider px-2 uppercase">{group.label}</h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeSlug === item.id
                    return (
                      <button 
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={cn(
                          "w-full flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 border text-left cursor-pointer",
                          isActive
                            ? "bg-white border-zinc-200/80 shadow-sm text-zinc-950 font-semibold"
                            : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium hover:bg-zinc-100/50"
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content Area - Minimalist Clean Document Content */}
      <main className="flex-grow relative z-10 px-8 md:px-14 py-12 md:py-16 bg-white h-full overflow-y-auto scroll-smooth flex flex-col">
        <div className="max-w-4xl w-full flex-grow">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeSlug}
              {...pageTransition}
              className="w-full"
            >
              {renderDocContent(activeSlug)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Back to App Button */}
        <div className="fixed bottom-8 right-8 z-50">
           <Link 
             href="/dashboard"
             className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
             title="Volver al Dashboard"
           >
              <ArrowLeft className="w-5 h-5" />
           </Link>
        </div>
      </main>
    </div>
  )
}

function renderDocContent(slug: string) {
  switch (slug) {
    case 'inicio-rapido':
      return (
        <div className="space-y-12 animate-in">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 font-display">
              Flash Work — Guía de Inicio Rápido
            </h1>
            <p className="text-sm font-medium leading-relaxed text-zinc-500 max-w-2xl">
              Despliega tu propia terminal comercial en cuestión de minutos. Nuestro sistema está diseñado para la velocidad, el orden y la conversión extrema.
            </p>
          </div>

          <div className="border border-emerald-200/60 bg-emerald-50/20 p-6 rounded-lg shadow-none">
             <p className="text-xs font-semibold text-emerald-950 leading-relaxed max-w-2xl flex items-center gap-2">
               <Zap className="w-4.5 h-4.5 text-emerald-600 fill-current shrink-0" />
               ¡Bienvenido a Flash Work! Este es tu espacio de desarrollo de marca. Sigue los estándares minimalistas para una experiencia de usuario limpia y directa.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 border border-zinc-200/60 bg-zinc-50/40 rounded-lg flex flex-col gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-zinc-200">
                    <Settings className="w-4 h-4 text-zinc-400" />
                 </div>
                 <h4 className="font-semibold text-sm text-zinc-900">Configuración Zero-Wait</h4>
                 <p className="text-xs text-zinc-500 font-medium leading-relaxed">No necesitas servidores. Nosotros nos encargamos de la infraestructura global.</p>
              </div>
              <div className="p-6 border border-zinc-200/60 bg-zinc-50/40 rounded-lg flex flex-col gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-zinc-200">
                    <LayoutIcon className="w-4 h-4 text-zinc-400" />
                 </div>
                 <h4 className="font-semibold text-sm text-zinc-900">Diseño Autogenerado</h4>
                 <p className="text-xs text-zinc-500 font-medium leading-relaxed">Tu tienda se adapta automáticamente a tu marca con estética limpia y moderna.</p>
              </div>
          </div>

          <div className="pt-4">
              <Link 
                href="/dashboard"
                className="btn-premium h-11 inline-flex items-center justify-center gap-2 px-6"
              >
                 Comenzar Gestión
                 <ArrowLeft className="w-4 h-4 rotate-180 text-white shrink-0" />
              </Link>
          </div>
        </div>
      )
    case 'acceso-y-login':
      return (
        <div className="space-y-12 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Acceso e Inicio de Sesión</h2>
            <p className="text-sm font-medium text-zinc-500 max-w-xl leading-relaxed">
              Seguridad robusta integrada directamente en tu terminal comercial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-zinc-50/40 border border-zinc-200/60 rounded-lg hover:bg-white transition-all shadow-sm group">
               <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-6 border border-zinc-200 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
               </div>
               <h4 className="font-semibold text-sm mb-2 text-zinc-950 tracking-tight">Clerk Identity</h4>
               <p className="text-zinc-500 font-medium leading-relaxed text-xs">Protocolo de autenticación biométrica y social-sync integrado con Vercel Edge.</p>
            </div>
            <div className="p-6 bg-zinc-50/40 border border-zinc-200/60 rounded-lg hover:bg-white transition-all shadow-sm group">
               <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-6 border border-zinc-200 group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-5 h-5 text-zinc-400" />
               </div>
               <h4 className="font-semibold text-sm mb-2 text-zinc-950 tracking-tight">Estado Global</h4>
               <p className="text-zinc-500 font-medium leading-relaxed text-xs">Sincronización de sesión persistente entre dispositivos móviles y de escritorio.</p>
            </div>
          </div>
        </div>
      )
    case 'que-es-terminal':
      return (
        <div className="space-y-12 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">¿Qué es un Flash Terminal?</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-2xl">
              Es una interfaz de alta frecuencia diseñada para convertir tráfico social en transacciones reales sin fricción.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <InfoRow 
              title="Dashboard: Control Central" 
              desc="El núcleo operativo donde gestionas inventario, pasarelas y marcas en tiempo real."
              icon={Cpu}
            />
            <InfoRow 
              title="Storefront: Interfaz Vital" 
              desc="La cara pública de tu marca. Optimizada para el 'scroll' responsivo y la compra veloz."
              icon={Smartphone}
            />
          </div>
        </div>
      )
    case 'sincronizacion-global':
      return (
        <div className="space-y-12 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Sincronización Total</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-2xl">
               Utilizamos la red global de Vercel para que tus datos estén en todo el mundo en milisegundos.
            </p>
          </div>
          <div className="p-8 bg-zinc-50/50 border border-zinc-200/80 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Globe className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-6">
               <div className="space-y-1">
                 <p className="text-zinc-400 font-bold text-[9px] tracking-widest uppercase">Tecnología de Borde</p>
                 <h3 className="text-lg font-bold text-zinc-950">Vercel KV Edge Sync</h3>
               </div>
               <div className="space-y-4 text-xs font-medium text-zinc-500 leading-relaxed max-w-xl">
                  <p>
                     Nuestra base de datos distribuida invalida la caché automáticamente en todos los nodos globales cuando realizas un cambio.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-200">
                     <div className="flex items-center gap-2 font-bold text-zinc-600">
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" /> Latencia &lt; 50ms
                     </div>
                     <div className="flex items-center gap-2 font-bold text-zinc-600">
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" /> Sync Multi-Región
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )
    case 'disenno-del-nucleo':
      return (
        <div className="space-y-12 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Diseño del Núcleo</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-2xl">
              Nuestra estética minimalista no es solo visual, es una filosofía de usabilidad y elegancia orgánica.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardMetric icon={Sparkles} label="Curvatura" value="Bordes Redondos" />
            <CardMetric icon={LayoutIcon} label="Material" value="Bordes sutiles" />
            <CardMetric icon={Smartphone} label="Escala" value="F-Ratio 1.6" />
          </div>
        </div>
      )
    case 'estetica-terminal':
      return (
        <div className="space-y-12 animate-in">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Estética de Marca</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-zinc-200 bg-zinc-50/40 rounded-lg flex flex-col gap-4">
               <div className="w-8 h-8 bg-zinc-950 rounded-lg shadow-sm" />
               <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-zinc-950">Acabados Obsidian</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">Tonos oscuros y negros satinados que dan elegancia comercial al panel.</p>
               </div>
            </div>
            <div className="p-6 border border-zinc-200 bg-zinc-50/40 rounded-lg flex flex-col gap-4">
               <div className="w-8 h-8 bg-white border border-zinc-200 rounded-lg shadow-sm" />
               <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-zinc-950">White Luxe</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">Fondeados limpios con baja carga visual y pocos sombreados para resaltar información útil.</p>
               </div>
            </div>
          </div>
        </div>
      )
    case 'crear-productos':
      return (
        <div className="space-y-12 animate-in">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Crear Productos</h2>
          <div className="grid grid-cols-1 gap-3">
            <StepRow number="1" text="Inventario: Define nombre, precio y stock disponible." />
            <StepRow number="2" text="Visual: Sube fotos de alta definición al almacenamiento." />
            <StepRow number="3" text="Categoría: Organiza tus artículos para la tienda." />
            <StepRow number="4" text="Publicar: El catálogo se actualiza globalmente al instante." />
          </div>
        </div>
      )
    case 'whatsapp-sync':
      return (
        <div className="space-y-12 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">WhatsApp Sync Pro</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-2xl">
               Recibe pedidos estructurados y notificaciones directas en tu chat.
            </p>
          </div>
          <div className="p-6 bg-zinc-50/50 border border-zinc-200/60 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5">
               <MessageCircle className="w-24 h-24 text-zinc-400" />
            </div>
            <div className="space-y-6 relative z-10">
               <div className="p-4 bg-white border border-zinc-200/60 rounded-lg shadow-sm max-w-lg font-mono text-[11px] leading-relaxed text-zinc-700">
                  <p className="font-bold text-zinc-950 mb-1">📦 NUEVA ORDEN RECIBIDA</p>
                  <p>• 1x Camiseta Casual (M)</p>
                  <p>• Total: $80.000 COP</p>
                  <p>• Cliente: Juan Pérez</p>
               </div>
               <p className="text-zinc-400 text-[11px] leading-relaxed max-w-xl">
                  Las órdenes pagadas o estructuradas se envían a tu WhatsApp central con un clic para facilitar tu despacho logístico.
               </p>
            </div>
          </div>
        </div>
      )
    case 'pasarelas-de-pago':
      return (
        <div className="space-y-12 animate-in">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Ecosistema de Cobros</h2>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-2xl">
              FlashCheckout utiliza tecnologías de procesamiento líderes para garantizar compras seguras y transferencias inmediatas para compradores y comercios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Mercado Pago */}
            <div className="p-6 border border-zinc-200/60 bg-white rounded-lg flex flex-col justify-between hover:border-zinc-300 transition-all group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tight">PSE & Tarjetas COP</span>
                  <h4 className="font-bold text-sm text-zinc-950 mt-1">Mercado Pago</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Nuestra pasarela principal para ventas en Colombia. Habilita pagos con PSE, tarjetas de crédito nacionales y corresponsales bancarios tanto en el checkout web como directamente dentro del chatbot de WhatsApp.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[10px] font-bold text-zinc-400 mt-6">
                Integración nativa COP
              </div>
            </div>

            {/* Card 2: Stripe Connect */}
            <div className="p-6 border border-zinc-200/60 bg-white rounded-lg flex flex-col justify-between hover:border-zinc-300 transition-all group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tight">Tarjetas Directas</span>
                  <h4 className="font-bold text-sm text-zinc-950 mt-1">Stripe Connect</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Permite a los compradores finales pagar directamente con tarjeta de crédito en la tienda web. Los vendedores vinculan sus cuentas bancarias con un clic en los Ajustes del Dashboard para recibir los fondos de forma directa.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[10px] font-bold text-zinc-400 mt-6">
                Onboarding en Ajustes de Tienda
              </div>
            </div>

            {/* Card 3: Stripe Billing SaaS */}
            <div className="p-6 border border-zinc-200/60 bg-white rounded-lg flex flex-col justify-between hover:border-zinc-300 transition-all group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 fill-current text-white" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 uppercase tracking-tight">Membresía Premium</span>
                  <h4 className="font-bold text-sm text-zinc-950 mt-1">Stripe SaaS Billing</h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Maneja la facturación y suscripción del Pase Premium del vendedor. Los comercios acceden directamente al portal de facturación oficial de Stripe para pausar, reactivar o cambiar los métodos de pago de su suscripción.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-[10px] font-bold text-zinc-400 mt-6">
                Panel de Membresías
              </div>
            </div>
          </div>
        </div>
      )
    case 'permisos-y-datos':
      return (
        <div className="space-y-12 animate-in">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Seguridad y Datos</h2>
          <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-lg p-8 flex flex-col md:flex-row gap-8 items-center">
             <div className="space-y-4 flex-grow">
                <div className="space-y-1">
                   <h4 className="text-base font-bold text-zinc-900 tracking-tight">Privacidad End-to-End</h4>
                   <p className="text-xs text-zinc-500 font-medium leading-relaxed">Tus datos nunca salen de la infraestructura protegida de Flash.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                   <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-zinc-500">AES-256</span>
                   </div>
                   <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-zinc-500">GDPR Ready</span>
                   </div>
                </div>
             </div>
             <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-inner shrink-0 border border-zinc-200">
                <ShieldCheck className="w-10 h-10 text-zinc-300" />
             </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20">
           <Zap className="w-10 h-10 text-zinc-200 mb-6 animate-pulse" />
           <h2 className="text-base font-bold tracking-tight text-zinc-400">Módulo en Construcción</h2>
        </div>
      )
  }
}

function InfoRow({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="flex gap-4 p-4 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-200/60 transition-all group">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-200/60 group-hover:bg-white transition-colors">
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
      </div>
      <div>
        <h4 className="text-sm font-bold tracking-tight mb-1 text-zinc-950">{title}</h4>
        <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xl">{desc}</p>
      </div>
    </div>
  )
}

function StepRow({ number, text }: { number: string, text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-zinc-200/60 bg-zinc-50/30 rounded-lg hover:bg-white transition-all group w-full">
       <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
          <span className="text-xs font-bold text-zinc-500">{number}</span>
       </div>
       <p className="text-xs font-bold text-zinc-500 tracking-tight group-hover:text-zinc-950 transition-colors">{text}</p>
    </div>
  )
}

function CardMetric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-6 border border-zinc-200 bg-zinc-50/40 rounded-lg flex flex-col items-center gap-4 group hover:bg-white transition-all shadow-sm w-full">
       <Icon className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
       <div className="text-center">
          <p className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase mb-1">{label}</p>
          <p className="text-sm font-bold text-zinc-950 tracking-tight">{value}</p>
       </div>
    </div>
  )
}
