import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import {
  Zap,
  MessageCircle,
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Globe,
  BarChart3,
  ShieldCheck,
  ZapOff,
  Layout,
  MousePointer2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const { userId } = await auth()
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-hidden selection:bg-primary/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#0066CC_0.02,transparent_0.5)] pointer-events-none opacity-20" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Premium Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-6xl px-6 h-24">
          <div className="h-full bg-white/60 backdrop-blur-2xl border-x border-b border-black/[0.02] rounded-b-[2.5rem] px-10 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-2xl shadow-black/10">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Flash<span className="text-primary tracking-tighter">Checkout</span>
              </span>
            </div>
            <div className="flex items-center gap-8">
              {!userId ? (
                <>
                  <Link
                    href="/sign-in"
                    className="text-[13px] font-semibold tracking-tight text-zinc-500 hover:text-black transition-colors"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/sign-up"
                    className="h-12 btn-premium !px-8 text-[13px] flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-primary/10"
                  >
                    Comenzar gratis
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="h-12 btn-premium !px-8 text-[13px] flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-primary/10"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-48 pb-20 text-center">
        <div className="animate-in fade-in duration-1000 space-y-10">
          <div className="inline-flex items-center gap-3 bg-zinc-50 border border-black/[0.02] rounded-full px-6 py-2.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-tight text-zinc-400">
              Versión 2.0 • Sincronización global activa
            </span>
          </div>

          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter leading-[0.9] text-black max-w-4xl mx-auto">
            Vende en ráfagas <br/>
            <span className="text-primary">instantáneas.</span>
          </h1>

          <p className="mt-10 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-semibold tracking-wide">
            Optimiza tus redes sociales. Un checkout premium que gestiona tus pedidos en segundos, sin fricción.
          </p>

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
            {!userId ? (
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto h-22 btn-premium px-16 flex items-center justify-center gap-5 transition-all text-sm font-bold tracking-widest shadow-2xl shadow-primary/20"
                >
                  Crear mi tienda
                  <ArrowRight className="w-6 h-6" />
                </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-22 btn-premium px-16 flex items-center justify-center gap-5 transition-all text-sm active:scale-95 shadow-2xl shadow-primary/20"
              >
                Acceder al Panel
                <ArrowRight className="w-6 h-6" />
              </Link>
            )}
            <a
              href="#vision"
              className="w-full sm:w-auto h-20 bg-white border border-black/[0.05] hover:bg-zinc-50 text-zinc-500 hover:text-black rounded-full px-14 font-bold text-sm tracking-tight flex items-center justify-center gap-4 transition-all shadow-sm"
            >
              Ver propuesta
            </a>
          </div>
        </div>

        {/* Storefront Mockup */}
        <div className="mt-32 relative px-4 animate-in slide-in-from-bottom-20 duration-1000">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-black/[0.03]" />
          <div className="max-w-md mx-auto bg-white rounded-[3.5rem] border border-black/[0.03] overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.02] relative z-10 hover:scale-[1.02] transition-transform duration-700">
            <div className="bg-white/80 backdrop-blur-xl px-10 py-8 flex items-center justify-between border-b border-black/[0.02]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center shadow-inner">
                  <Layout className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-zinc-400 tracking-tight mb-1">Tienda oficial</p>
                  <p className="text-base font-bold text-black tracking-tight">Premium Brand</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-100" />)}
              </div>
            </div>
            <div className="px-10 py-12 space-y-8">
              <MockProduct name="Reloj Cronos Series" price="450.000" />
              <MockProduct name="Billetera de Cuero" price="120.000" />
              <MockProduct name="Lentes Carbono" price="280.000" />
            </div>
            <div className="px-10 pb-12">
              <div className="h-20 btn-premium flex items-center justify-center gap-4 transition-all text-sm font-semibold">
                <MessageCircle className="w-6 h-6 fill-white" />
                Pedir ahora
              </div>
              <p className="text-[10px] text-zinc-300 font-bold tracking-widest text-center mt-6">Protocolo de seguridad activo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="vision" className="relative z-10 py-40 overflow-hidden bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-32">
            <h2 className="text-4xl sm:text-5xl font-bold text-black tracking-tighter mb-6 font-display">
              Venta sin fricción
            </h2>
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">
              Sincronización total en segundos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-20 relative">
            <StepCard
              number="01"
              icon={Layout}
              title="Configurar"
              description="Sube tus productos y define tu marca. Creamos una terminal digital exclusiva para tu negocio."
            />
            <StepCard
              number="02"
              icon={Smartphone}
              title="Compartir"
              description="Despliega el enlace en tus biografía de redes sociales. Tu tienda operando 24/7."
            />
            <StepCard
              number="03"
              icon={Zap}
              title="Facturar"
              description="Recibe pedidos completos directamente en tu WhatsApp. Gestiona ventas con un solo toque."
            />
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative z-10 py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black tracking-tight mb-20">
            Estándares de elite
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard
              icon={Clock}
              title="Velocidad Pura"
              description="Checkout optimizado para cargar en menos de un segundo. Tus clientes no esperan."
            />
            <BenefitCard
              icon={MessageCircle}
              title="WhatsApp Nativo"
              description="Cada pedido llega estructurado. Datos de envío, productos y total listos para facturar."
            />
            <BenefitCard
              icon={ShieldCheck}
              title="Seguridad Total"
              description="Protección de datos bajo protocolos bancarios internacionales. Tu negocio, blindado."
            />
            <BenefitCard
              icon={BarChart3}
              title="Analítica Avanzada"
              description="Dashboard profesional para visualizar tu crecimiento y flujo de caja en tiempo real."
            />
            <BenefitCard
              icon={Smartphone}
              title="Mobile First"
              description="Experiencia de usuario calibrada para dispositivos de alta gama. UI/UX impecable."
            />
            <BenefitCard
              icon={MousePointer2}
              title="Gestión Simple"
              description="Panel administrativo intuitivo. Añade productos y cambia precios en un instante."
            />
          </div>
        </div>
      </section>

      {/* Final Deployment CTA */}
      <section className="relative z-10 py-40 px-6 pb-60">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <h2 className="text-6xl sm:text-8xl font-bold tracking-tighter text-black leading-[0.9] font-display">
            Inicia tu <br/> <span className="text-primary">legado.</span>
          </h2>
          <p className="text-xs text-zinc-400 font-bold tracking-widest max-w-sm mx-auto leading-relaxed">
            ACCESO PREMIUM DISPONIBLE • ÚNETE A LA RED COMERCIAL MÁS RÁPIDA
          </p>
          
          <div className="pt-8">
            {!userId ? (
              <Link
                href="/sign-up"
                className="h-24 inline-flex items-center gap-6 btn-premium px-24 text-sm font-bold tracking-tight transition-all shadow-2xl shadow-primary/30 active:scale-95"
              >
                Comenzar ahora
                <Zap className="w-7 h-7 fill-white" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="h-24 inline-flex items-center gap-6 btn-premium px-24 text-sm font-bold tracking-tight transition-all shadow-2xl shadow-primary/30 active:scale-95"
              >
                Volver al Panel
                <Zap className="w-7 h-7 fill-white" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative z-10 py-20 px-8 border-t border-black/[0.02]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-bold tracking-tight">FlashCheckout Premium</span>
          </div>
          <p className="text-[11px] text-zinc-300 font-bold tracking-[0.4em] text-center">
            © {new Date().getFullYear()} FLASHCHECKOUT • HECHO EN COLOMBIA 🇨🇴
          </p>
        </div>
      </footer>
    </div>
  )
}

function MockProduct({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex items-center justify-between p-5 bg-zinc-50/50 rounded-3xl border border-black/[0.01] transition-all hover:bg-zinc-50 group">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <ShoppingBag className="w-6 h-6 text-primary/40" />
        </div>
        <div className="text-left font-bold tracking-tight leading-none">
          <p className="text-[11px] text-zinc-400 mb-2 font-medium">{name}</p>
          <p className="text-base text-primary font-bold">${price}</p>
        </div>
      </div>
      <span className="text-xs font-bold bg-white text-zinc-400 px-4 py-2 rounded-xl border border-black/[0.02] shadow-sm">
        1
      </span>
    </div>
  )
}

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="text-center group">
      <div className="relative w-28 h-28 mx-auto mb-10">
        <div className="absolute inset-x-0 bottom-0 h-10 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 rounded-[2.5rem] bg-white border border-black/[0.03] shadow-sm group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-700" />
        </div>
        <span className="absolute -top-3 -right-3 w-10 h-10 bg-black text-white text-xs font-bold rounded-2xl flex items-center justify-center shadow-2xl group-hover:-translate-y-2 transition-transform">
          {number}
        </span>
      </div>
      <h3 className="font-bold text-base tracking-tight mb-6 text-black font-display">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 font-medium tracking-tight leading-relaxed px-4">
        {description}
      </p>
    </div>
  )
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="bg-white border border-black/[0.03] rounded-[3rem] p-10 hover:shadow-2xl hover:shadow-black/5 transition-all group relative overflow-hidden text-left h-full">
      <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-10 group-hover:bg-primary/5 transition-colors">
        <Icon className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors" />
      </div>
      <h3 className="font-bold text-sm tracking-tight mb-4 text-black font-display">{title}</h3>
      <p className="text-sm text-zinc-500 font-medium tracking-tight leading-relaxed">
        {description}
      </p>
    </div>
  )
}
