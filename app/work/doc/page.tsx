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

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any }
}

export default function DocPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Zap className="animate-pulse text-primary" /></div>}>
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
      label: 'IDENTIDAD APPLE LUXE',
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
    <div className="h-screen bg-white text-zinc-900 font-sans selection:bg-primary/20 flex flex-col md:flex-row overflow-hidden max-w-[1600px] mx-auto">
      
      {/* Sidebar - Same View Pattern */}
      <aside className="w-full md:w-[320px] h-auto md:h-full border-r border-black/[0.03] bg-zinc-50/10 backdrop-blur-3xl overflow-y-auto px-6 py-12 z-40">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-14 px-2">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shadow-lg shadow-primary/10">
                <Zap className="w-4.5 h-4.5 text-white fill-primary" />
              </div>
              <span className="font-bold text-lg tracking-tighter">
                Flash<span className="text-primary tracking-tighter">Doc</span>
              </span>
            </Link>
            <div className="bg-zinc-100/80 border border-black/[0.04] rounded-full px-3 py-1 flex items-center h-fit mt-1">
              <span className="text-[9px] font-bold tracking-[0.05em] text-zinc-500 uppercase whitespace-nowrap">Guía de usuario</span>
            </div>
          </div>
          
          <div className="relative mb-14 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Buscar guía..." 
               className="w-full h-12 pl-12 pr-6 bg-white border border-black/[0.03] rounded-2xl text-[12px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm placeholder:text-zinc-300"
             />
          </div>

          <nav className="space-y-12">
            {filteredSections.map((group) => (
              <div key={group.id} className="space-y-4">
                <h4 className="text-[10px] font-bold text-zinc-300 tracking-[0.4em] px-4 uppercase">{group.label}</h4>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`
                        w-full group flex items-center h-12 px-4 text-[13px] font-bold tracking-tight transition-all rounded-2xl relative overflow-hidden text-left
                        ${activeSlug === item.id 
                          ? 'bg-primary/[0.04] text-primary shadow-sm' 
                          : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}
                      `}
                    >
                      {activeSlug === item.id && (
                        <motion.div 
                          layoutId="active-pill"
                          className="absolute left-0 w-1 h-6 bg-primary rounded-full transition-all"
                        />
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content Area - Single Section Render */}
      <main className="flex-grow relative z-10 px-6 md:px-16 py-12 md:py-20 bg-white h-full overflow-y-auto scroll-smooth flex flex-col">
        

        <div className="max-w-5xl w-full flex-grow">
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

        {/* Floating Help Button */}
        <div className="fixed bottom-12 right-12 z-50">
           <button className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
              <HelpCircle className="w-6 h-6" />
           </button>
        </div>
      </main>
    </div>
  )
}

function renderDocContent(slug: string) {
  switch (slug) {
    case 'inicio-rapido':
      return (
        <div className="space-y-16">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black leading-[0.9] mb-8">
              Flash Work — <br/> <span className="text-primary opacity-90 inline-block mt-2">Guía de Inicio Rápido</span>
            </h1>
            <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl opacity-80">
              Despliega tu propia terminal comercial en cuestión de minutos. Nuestro sistema está diseñado para la velocidad y la conversión extrema.
            </p>
          </div>

          <div className="bg-emerald-50/30 backdrop-blur-3xl border border-emerald-100/40 p-12 rounded-[3rem] relative overflow-hidden group shadow-sm transition-all hover:bg-emerald-50/50">
             <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-24 h-24 text-emerald-600" />
             </div>
             <p className="text-xl md:text-2xl font-semibold text-emerald-900/80 leading-snug tracking-tight relative z-10 max-w-2xl">
               ¡Bienvenido a Flash Work! Este es tu espacio de desarrollo de marca. Utiliza el protocolo Apple Luxe para una experiencia comercial de lujo.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 border border-black/[0.03] bg-zinc-50/50 rounded-[2.5rem] flex flex-col gap-4">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/[0.02]">
                    <Settings className="w-5 h-5 text-zinc-400" />
                 </div>
                 <h4 className="font-bold text-lg text-black">Configuración Zero-Wait</h4>
                 <p className="text-sm text-zinc-500 font-medium leading-relaxed">No necesitas servidores. Nosotros nos encargamos de la infraestructura global.</p>
              </div>
              <div className="p-8 border border-black/[0.03] bg-zinc-50/50 rounded-[2.5rem] flex flex-col gap-4">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/[0.02]">
                    <LayoutIcon className="w-5 h-5 text-zinc-400" />
                 </div>
                 <h4 className="font-bold text-lg text-black">Diseño Autogenerado</h4>
                 <p className="text-sm text-zinc-500 font-medium leading-relaxed">Tu tienda se adapta automáticamente a tu marca con estética premium.</p>
              </div>
          </div>

          <div className="pt-8">
              <button className="h-16 bg-black text-white px-10 rounded-full font-bold text-sm tracking-widest flex items-center gap-4 hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-black/20 group">
                 Empezar ahora
                 <ArrowLeft className="w-4 h-4 rotate-180 text-primary transition-transform group-hover:translate-x-1" />
              </button>
          </div>
        </div>
      )
    case 'acceso-y-login':
      return (
        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">Acceso e Inicio de Sesión</h2>
            <p className="text-lg font-medium text-zinc-400 max-w-xl leading-relaxed opacity-80">
              Seguridad de grado bancario para tu terminal comercial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-zinc-50/50 border border-black/[0.02] rounded-[2.8rem] hover:bg-white transition-all shadow-sm group">
               <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm border border-black/[0.01] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
               </div>
               <h4 className="font-bold text-xl mb-3 text-black tracking-tight">Clerk Identity</h4>
               <p className="text-zinc-500 font-medium leading-relaxed text-sm opacity-90">Protocolo de autenticación biométrica y social-sync integrado con Vercel Edge.</p>
            </div>
            <div className="p-10 bg-zinc-50/50 border border-black/[0.02] rounded-[2.8rem] hover:bg-white transition-all shadow-sm group">
               <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm border border-black/[0.01] group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-7 h-7 text-primary" />
               </div>
               <h4 className="font-bold text-xl mb-3 text-black tracking-tight">Estado Global</h4>
               <p className="text-zinc-500 font-medium leading-relaxed text-sm opacity-90">Sincronización de sesión persistente entre dispositivos móviles y de escritorio.</p>
            </div>
          </div>
        </div>
      )
    case 'que-es-terminal':
      return (
        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">¿Qué es un Flash Terminal?</h2>
            <p className="text-xl font-medium text-zinc-400 leading-relaxed opacity-80 max-w-2xl">
              Es una interfaz de alta frecuencia diseñada para convertir tráfico social en transacciones reales sin fricción.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <InfoRow 
              title="Dashboard: Control Central" 
              desc="El núcleo operativo donde gestionas inventario, pasarelas y marcas en tiempo real."
              icon={Cpu}
            />
            <InfoRow 
              title="Storefront: Interfaz Vital" 
              desc="La cara pública de tu marca. Optimizada para el 'scroll' infinito y la compra impulsiva."
              icon={Smartphone}
            />
          </div>
        </div>
      )
    case 'sincronizacion-global':
      return (
        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black leading-none">Sincronización Total</h2>
            <p className="text-lg font-medium text-zinc-400 leading-relaxed opacity-80 max-w-2xl">
               Utilizamos la red global de Vercel para que tus datos estén en todo el mundo en milisegundos.
            </p>
          </div>
          <div className="bg-zinc-900 text-white p-16 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-black/10">
            <div className="absolute top-0 right-0 p-16 opacity-10">
               <Globe className="w-48 h-48" />
            </div>
            <div className="relative z-10 space-y-10">
               <div className="space-y-2">
                 <p className="text-primary font-bold text-xs tracking-[0.3em] uppercase">Tecnología de Borde</p>
                 <p className="text-3xl font-bold tracking-tighter">Vercel KV Edge Sync</p>
               </div>
               <div className="space-y-6 opacity-80">
                  <p className="text-lg font-medium leading-relaxed max-w-xl">
                     Nuestra base de datos distribuida invalida la caché automáticamente en todos los nodos globales cuando realizas un cambio.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                     <div className="flex items-center gap-3 text-sm font-bold">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Latencia &lt; 50ms
                     </div>
                     <div className="flex items-center gap-3 text-sm font-bold">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Sync Multi-Región
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )
    case 'disenno-del-nucleo':
      return (
        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">Diseño del Núcleo Luxe</h2>
            <p className="text-lg font-medium text-zinc-400 leading-relaxed max-w-2xl opacity-80">
              La estética Apple Luxe no es solo visual, es una filosofía de usabilidad y elegancia orgánica.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardMetric icon={Sparkles} label="Curvatura" value="Rounded 3.5xl" />
            <CardMetric icon={LayoutIcon} label="Material" value="Blur 3xl" />
            <CardMetric icon={Smartphone} label="Escala" value="F-Ratio 1.6" />
          </div>
        </div>
      )
    case 'estetica-terminal':
      return (
        <div className="space-y-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">Estética de Marca</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-12 border border-black/[0.02] bg-zinc-50/50 rounded-[3rem] space-y-8 flex flex-col justify-between">
               <div className="w-12 h-12 bg-primary rounded-full shadow-lg shadow-primary/20" />
               <div className="space-y-3">
                  <h4 className="font-bold text-xl text-black tracking-tight">Flash Orange</h4>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">El color de la acción instantánea. Usado para destacar lo vital.</p>
               </div>
            </div>
            <div className="p-12 border border-black/[0.02] bg-zinc-50/50 rounded-[3rem] space-y-8 flex flex-col justify-between">
               <div className="w-12 h-12 bg-black rounded-xl shadow-lg" />
               <div className="space-y-3">
                  <h4 className="font-bold text-xl text-black tracking-tight">Ink Black</h4>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">Proporciona el contraste necesario para la elegancia comercial.</p>
               </div>
            </div>
          </div>
        </div>
      )
    case 'crear-productos':
      return (
        <div className="space-y-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">Crear Productos</h2>
          <div className="grid grid-cols-1 gap-4">
            <StepRow number="1" text="Inventario: Define nombre, precio y stock inicial." />
            <StepRow number="2" numberColor="bg-primary/20" text="Visual: Sube 3 imágenes de alta fidelidad." />
            <StepRow number="3" text="Variantes: Configura tallas, colores o packs." />
            <StepRow number="4" numberColor="bg-black" textColor="text-white" text="Publicar: Despliega inmediatamente a la red." />
          </div>
        </div>
      )
    case 'whatsapp-sync':
      return (
        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">WhatsApp Sync Pro</h2>
            <p className="text-lg font-medium text-zinc-400 opacity-80 leading-relaxed max-w-2xl">
               Recibe pedidos estructurados directamente en tu chat personal.
            </p>
          </div>
          <div className="p-12 bg-primary/[0.02] border border-primary/5 rounded-[3.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <MessageCircle className="w-32 h-32 text-primary" />
            </div>
            <div className="space-y-10 relative z-10">
               <div className="p-8 bg-white/80 backdrop-blur-md border border-primary/10 rounded-3xl shadow-sm max-w-lg">
                  <p className="text-zinc-600 font-semibold leading-relaxed text-sm">
                     "¡Nueva Orden! <br/> 
                     📦 1x Hoodie Luxe Black (M) <br/> 
                     💰 Total: $120.000 <br/> 
                     🔗 Ver: flash.app/order/xyz"
                  </p>
               </div>
               <p className="text-zinc-500 font-medium leading-relaxed max-w-xl italic">
                  Este mensaje se genera automáticamente y contiene toda la información necesaria para el cierre de venta.
               </p>
            </div>
          </div>
        </div>
      )
    case 'pasarelas-de-pago':
      return (
        <div className="space-y-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">Pasarelas de Pago</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-12 bg-white border border-black/[0.04] rounded-[3rem] shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all">
               <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-8">
                  <CreditCard className="w-6 h-6 text-blue-500" />
               </div>
               <h4 className="font-bold text-xl mb-3">Mercado Pago</h4>
               <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">Ideal para el mercado local con Checkout Pro y múltiples medios de pago.</p>
               <div className="h-0.5 w-12 bg-blue-500/20" />
            </div>
            <div className="p-12 bg-white border border-black/[0.04] rounded-[3rem] shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all">
               <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-8">
                  <ShoppingBag className="w-6 h-6 text-indigo-500" />
               </div>
               <h4 className="font-bold text-xl mb-3">Stripe Billing</h4>
               <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">Potencia tu escala global con soporte multidivisa y suscripciones.</p>
               <div className="h-0.5 w-12 bg-indigo-500/20" />
            </div>
          </div>
        </div>
      )
    case 'analitica-luxe':
      return (
        <div className="space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black leading-none">Analítica Luxe</h2>
            <p className="text-lg font-medium text-zinc-400 opacity-80 leading-relaxed max-w-xl">Inteligencia de negocio destilada en métricas accionables.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2 space-y-6">
               <div className="p-8 bg-zinc-50/50 border border-black/[0.02] rounded-[2.5rem]">
                  <p className="text-[10px] font-bold text-zinc-300 tracking-[0.3em] uppercase mb-4">Métrica Vital</p>
                  <p className="text-4xl font-bold tracking-tighter mb-2">38.4%</p>
                  <p className="text-sm font-bold text-emerald-500">Tasa de Conversión WhatsApp</p>
               </div>
               <div className="p-8 bg-zinc-50/50 border border-black/[0.02] rounded-[2.5rem]">
                  <p className="text-4xl font-bold tracking-tighter mb-2">9.2k</p>
                  <p className="text-sm font-bold text-primary">Impresiones de Marca</p>
               </div>
            </div>
            <div className="md:w-1/2 bg-zinc-900 rounded-[3rem] p-12 flex items-center justify-center shadow-2xl">
               <BarChart3 className="w-16 h-16 text-white opacity-20" />
            </div>
          </div>
        </div>
      )
    case 'permisos-y-datos':
      return (
        <div className="space-y-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black">Seguridad y Datos</h2>
          <div className="bg-zinc-50 border border-black/[0.01] rounded-[3.5rem] p-16 flex flex-col md:flex-row gap-16 items-center">
             <div className="space-y-8 flex-grow">
                <div className="space-y-2">
                   <h4 className="text-2xl font-bold tracking-tight">Privacidad End-to-End</h4>
                   <p className="text-lg font-medium text-zinc-400 opacity-80 leading-relaxed">Tus datos nunca salen de la infraestructura protegida de Flash.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white rounded-2xl border border-black/[0.02] flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-zinc-500">AES-256</span>
                   </div>
                   <div className="p-4 bg-white rounded-2xl border border-black/[0.02] flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-zinc-500">GDPR Ready</span>
                   </div>
                </div>
             </div>
             <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center shadow-inner shrink-0 border border-black/[0.03]">
                <ShieldCheck className="w-20 h-20 text-zinc-100" />
             </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-40">
           <Zap className="w-16 h-16 text-zinc-100 mb-8 animate-pulse" />
           <h2 className="text-2xl font-bold tracking-tighter opacity-20">Módulo en Construcción</h2>
        </div>
      )
  }
}

function InfoRow({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="flex gap-8 group p-8 rounded-[2.5rem] hover:bg-zinc-50/50 border border-transparent hover:border-black/[0.01] transition-all">
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center border border-black/[0.01] group-hover:bg-white transition-colors shadow-sm">
        <Icon className="w-7 h-7 text-zinc-300 group-hover:text-primary transition-colors" />
      </div>
      <div className="pt-1">
        <h4 className="text-xl font-bold tracking-tight mb-2 text-black">{title}</h4>
        <p className="text-base text-zinc-400 font-medium leading-relaxed opacity-80 max-w-xl">{desc}</p>
      </div>
    </div>
  )
}

function StepRow({ number, text, numberColor = "bg-zinc-100", textColor = "text-zinc-400" }: { number: string, text: string, numberColor?: string, textColor?: string }) {
  return (
    <div className="flex items-center gap-8 p-8 border border-black/[0.01] bg-zinc-50/30 rounded-[2.2rem] hover:bg-white transition-all group shadow-sm w-full">
       <div className={`w-12 h-12 rounded-full ${numberColor} flex items-center justify-center shrink-0 shadow-sm border border-black/[0.02]`}>
          <span className={`text-base font-bold ${textColor}`}>{number}</span>
       </div>
       <p className="text-lg font-bold text-zinc-500 tracking-tight group-hover:text-black transition-colors">{text}</p>
    </div>
  )
}

function CardMetric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-10 border border-black/[0.02] bg-zinc-50/40 rounded-[2.8rem] flex flex-col items-center gap-6 group hover:bg-white transition-all shadow-sm">
       <Icon className="w-6 h-6 text-zinc-200 group-hover:text-primary transition-colors" />
       <div>
          <p className="text-[10px] font-bold text-zinc-300 tracking-widest uppercase mb-2">{label}</p>
          <p className="text-xl font-bold text-black tracking-tighter">{value}</p>
       </div>
    </div>
  )
}
