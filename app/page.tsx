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
} from 'lucide-react'

export default async function HomePage() {
  const { userId } = await auth()
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/80 via-transparent to-transparent pointer-events-none" />

      {/* Nav */}
      <header className="relative z-10 border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Flash<span className="text-emerald-600">Checkout</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!userId ? (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Empezar gratis
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Ir al Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
            <span className="text-xs font-semibold text-emerald-700">
              Beta — Primeros 10 clientes a $30 USD
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Cierra ventas por{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
              WhatsApp
            </span>{' '}
            en 30 segundos
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Convierte tus DMs de Instagram y TikTok en ventas reales.
            Un link de checkout que automatiza todo el pedido.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!userId ? (
              <Link
                href="/sign-up"
                className="w-full sm:w-auto btn-whatsapp rounded-xl px-8 py-4 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Crear mi tienda gratis
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto btn-whatsapp rounded-xl px-8 py-4 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Ir a mi tienda
              </Link>
            )}
            <a
              href="#como-funciona"
              className="w-full sm:w-auto bg-white border border-border hover:border-emerald-200 text-foreground rounded-xl px-8 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              Ver cómo funciona
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Device mockup hint */}
        <div className="mt-16 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
          <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl shadow-emerald-100/50 border border-border/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Joyería Luna</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <MockProduct name="Collar de plata" price="85.000" />
              <MockProduct name="Aretes dorados" price="45.000" />
              <MockProduct name="Pulsera cristales" price="35.000" />
            </div>
            <div className="px-5 pb-4">
              <div className="btn-whatsapp rounded-xl py-3 text-center text-sm font-semibold flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Pedir por WhatsApp — $165.000
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="relative z-10 bg-white border-y border-border/30 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Así de fácil funciona
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              En 3 pasos tu cliente pasa de ver tu producto a hacer el pedido
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StepCard
              number="1"
              icon={Globe}
              title="Crea tu tienda"
              description="Registra tus productos con nombre, precio y foto. Te damos un link único."
            />
            <StepCard
              number="2"
              icon={Smartphone}
              title="Comparte el link"
              description="Ponlo en tu bio de Instagram, stories o envíalo directo a tus clientes."
            />
            <StepCard
              number="3"
              icon={MessageCircle}
              title="Cierre por WhatsApp"
              description="Tu cliente arma el pedido y te llega un mensaje listo para confirmar."
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              ¿Por qué FlashCheckout?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <BenefitCard
              icon={Clock}
              title="30 segundos"
              description="Tu cliente completa el pedido en menos de 30 segundos desde el celular."
            />
            <BenefitCard
              icon={MessageCircle}
              title="WhatsApp nativo"
              description="El mensaje le llega directo a tu WhatsApp con todos los detalles del pedido."
            />
            <BenefitCard
              icon={ShoppingBag}
              title="Sin fricción"
              description="Sin registros, sin apps, sin carritos abandonados. Solo un link y listo."
            />
            <BenefitCard
              icon={BarChart3}
              title="Panel de control"
              description="Ve todos tus pedidos, ingresos y productos desde un dashboard simple."
            />
            <BenefitCard
              icon={Smartphone}
              title="Mobile-first"
              description="Diseñado para que tus clientes compren desde el celular sin complicaciones."
            />
            <BenefitCard
              icon={CheckCircle2}
              title="Listo en 5 min"
              description="Crea tu tienda, sube tus productos y empieza a vender en minutos."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-10 sm:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Empieza a vender hoy
              </h2>
              <p className="mt-4 text-emerald-100 max-w-md mx-auto">
                Crea tu tienda en 5 minutos. Beta a solo $30 USD — precio de lanzamiento para los primeros 10 clientes.
              </p>
              {!userId ? (
                <Link
                  href="/sign-up"
                  className="mt-8 inline-flex items-center gap-2 bg-white text-emerald-700 hover:text-emerald-800 rounded-xl px-8 py-4 font-bold text-sm transition-colors shadow-lg shadow-emerald-900/20"
                >
                  <Zap className="w-5 h-5" />
                  Crear mi tienda
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="mt-8 inline-flex items-center gap-2 bg-white text-emerald-700 hover:text-emerald-800 rounded-xl px-8 py-4 font-bold text-sm transition-colors shadow-lg shadow-emerald-900/20"
                >
                  <Zap className="w-5 h-5" />
                  Ir al Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">FlashCheckout</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FlashCheckout. Hecho en Colombia 🇨🇴
          </p>
        </div>
      </footer>
    </div>
  )
}

function MockProduct({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-emerald-600 font-bold">${price}</p>
        </div>
      </div>
      <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
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
      <div className="relative w-16 h-16 mx-auto mb-5">
        <div className="absolute inset-0 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-7 h-7 text-emerald-600" />
        </div>
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
          {number}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
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
    <div className="bg-white border border-border/50 rounded-2xl p-6 hover:shadow-lg hover:border-emerald-200 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <h3 className="font-bold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
