'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import {
  Check,
  HelpCircle,
  Sparkles,
  Zap,
  Building,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Clock,
  TrendingUp
} from 'lucide-react'

// FAQ Items Data
const FAQS = [
  {
    q: 'Ã‚Â¿CÃƒÂ³mo funciona el lÃƒÂ­mite de 10 productos en el plan Gratuito?',
    a: 'Puedes crear tu tienda y agregar hasta 10 productos activos sin ningÃƒÂºn costo ni necesidad de tarjeta de crÃƒÂ©dito. Si deseas ofrecer un catÃƒÂ¡logo mÃƒÂ¡s grande, puedes actualizar al plan Pro en cualquier momento desde tu panel de configuraciÃƒÂ³n.'
  },
  {
    q: 'Ã‚Â¿QuÃƒÂ© es el Agente de WhatsApp Inteligente (WhatsApp Agent)?',
    a: 'Es un asistente de inteligencia artificial entrenado especÃƒÂ­ficamente con la informaciÃƒÂ³n y productos de tu tienda. Atiende a tus clientes por WhatsApp las 24 horas del dÃƒÂ­a, responde sus dudas, comprueba inventario en tiempo real y les envÃƒÂ­a enlaces directos de pago para cerrar las ventas automÃƒÂ¡ticamente.'
  },
  {
    q: 'Ã‚Â¿CÃƒÂ³mo se maneja la recuperaciÃƒÂ³n de carritos abandonados?',
    a: 'Cuando un cliente inicia un flujo de pago pero no completa la transacciÃƒÂ³n, nuestro sistema de automatizaciÃƒÂ³n de WhatsApp le envÃƒÂ­a un recordatorio amistoso y personalizado con un botÃƒÂ³n para finalizar la compra, aumentando tu conversiÃƒÂ³n de ventas hasta en un 35%.'
  },
  {
    q: 'Ã‚Â¿QuÃƒÂ© mÃƒÂ©todos de pago puedo ofrecer a mis clientes?',
    a: 'Flashcheckouts se integra directamente con Stripe y MercadoPago. Puedes aceptar tarjetas de crÃƒÂ©dito locales e internacionales, PSE (en Colombia), transferencias bancarias y monederos digitales de forma segura y directa a tu propia cuenta.'
  },
  {
    q: 'Ã‚Â¿Puedo cancelar o cambiar mi plan en cualquier momento?',
    a: 'SÃƒÂ­, absolutamente. No hay contratos a largo plazo ni compromisos de permanencia. Puedes subir, bajar o cancelar tu plan Pro en cualquier momento directamente desde tu panel de control.'
  }
]

export default function PricingPage() {
  const { user } = useUser()
  const [isAnnual, setIsAnnual] = useState(false)
  const [productCount, setProductCount] = useState(10)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Plan recommendation based on product count
  const getRecommendedPlan = () => {
    if (productCount <= 10) return 'free'
    if (productCount <= 200) return 'pro'
    return 'enterprise'
  }

  const recommendedPlan = getRecommendedPlan()

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans antialiased">
      {/* Shared Header Navbar */}
      <Navbar userId={user?.id ?? undefined} />

      {/* Pricing Hero Section */}
      <section className="w-full pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-zinc-200/40 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-zinc-200/30 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>Planes simples y transparentes</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-950 max-w-3xl leading-[1.1] mb-6">
            Comienza gratis. Escala a medida que vendes.
          </h1>

          <p className="text-lg text-zinc-500 max-w-2xl font-normal leading-relaxed mb-12">
            Crea tu tienda virtual y agrega tus primeros productos gratis. Desbloquea automatizaciones profesionales por WhatsApp cuando estÃƒÂ©s listo para crecer.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="flex items-center gap-4 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 mb-16 relative z-10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                !isAnnual
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Anual
              <span className="bg-zinc-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-normal">
                -20%
              </span>
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl items-stretch">
            
            {/* Gratuito Plan */}
            <div className={`premium-card p-8 rounded-3xl bg-white border border-zinc-200 transition-all duration-300 flex flex-col justify-between relative hover:border-zinc-300 hover:shadow-xl ${
              recommendedPlan === 'free' ? 'ring-2 ring-zinc-950 ring-offset-2' : ''
            }`}>
              {recommendedPlan === 'free' && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-zinc-950 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  Recomendado
                </span>
              )}
              <div className="text-left">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200/50 flex items-center justify-center text-zinc-800">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-950">Gratuito</h3>
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Para iniciar</p>
                  </div>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-950">$0</span>
                  <span className="text-sm font-semibold text-zinc-400">/ mes</span>
                </div>
                <p className="text-xs text-zinc-500 mb-8 leading-relaxed">
                  Perfecto para probar la plataforma y lanzar tu primer catÃƒÂ¡logo digital bÃƒÂ¡sico.
                </p>
                <div className="h-px bg-zinc-100 w-full mb-8" />
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-zinc-900 mt-0.5 shrink-0" />
                    <span>Hasta 10 productos activos</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-zinc-900 mt-0.5 shrink-0" />
                    <span>PÃƒÂ¡gina de checkout rÃƒÂ¡pido</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-zinc-900 mt-0.5 shrink-0" />
                    <span>IntegraciÃƒÂ³n Stripe & MercadoPago</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium text-zinc-300">
                    <Check className="w-4 h-4 text-zinc-300 mt-0.5 shrink-0" />
                    <span className="line-through">Agente de WhatsApp Inteligente</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium text-zinc-300">
                    <Check className="w-4 h-4 text-zinc-300 mt-0.5 shrink-0" />
                    <span className="line-through">RecuperaciÃƒÂ³n de carritos por chat</span>
                  </li>
                </ul>
              </div>
              <Button asChild className="w-full mt-8 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold py-3 rounded-xl transition-all">
                <Link href="/sign-up">Crear Tienda Gratis</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className={`premium-card p-8 rounded-3xl bg-white border border-zinc-200 transition-all duration-300 flex flex-col justify-between relative hover:border-zinc-300 hover:shadow-xl ${
              recommendedPlan === 'pro' ? 'ring-2 ring-zinc-950 ring-offset-2' : ''
            }`}>
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-zinc-950 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
                MÃƒÂ¡s Popular
              </div>
              {recommendedPlan === 'pro' && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-zinc-950 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  Recomendado
                </span>
              )}
              <div className="text-left">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-950">Plan Pro</h3>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Ventas AutomÃƒÂ¡ticas</p>
                  </div>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-950">
                    ${isAnnual ? '8' : '10'}
                  </span>
                  <span className="text-sm font-semibold text-zinc-400">/ mes</span>
                </div>
                <p className="text-xs text-zinc-500 mb-8 leading-relaxed">
                  Para comercios en crecimiento que desean automatizar su canal de WhatsApp y vender en piloto automÃƒÂ¡tico.
                </p>
                <div className="h-px bg-zinc-100 w-full mb-8" />
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-zinc-800 font-bold">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Productos Activos Ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Agente de WhatsApp Personalizado</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>RecuperaciÃƒÂ³n de carritos abandonados</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>SincronizaciÃƒÂ³n de stock en tiempo real</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Soporte prioritario 24/7</span>
                  </li>
                </ul>
              </div>
              <Button asChild className="w-full mt-8 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold py-3 rounded-xl shadow-md transition-all active:scale-[0.98]">
                <Link href="/sign-up">Comenzar Plan Pro</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className={`premium-card p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 transition-all duration-300 flex flex-col justify-between relative hover:border-zinc-700 hover:shadow-xl ${
              recommendedPlan === 'enterprise' ? 'ring-2 ring-white ring-offset-2' : ''
            }`}>
              {recommendedPlan === 'enterprise' && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-white text-zinc-950 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  Recomendado
                </span>
              )}
              <div className="text-left">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Enterprise</h3>
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Gran Volumen</p>
                  </div>
                </div>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">Personalizado</span>
                </div>
                <p className="text-xs text-zinc-400 mb-8 leading-relaxed">
                  Para marcas medianas y grandes que requieren integraciones a medida, infraestructura dedicada y soporte prioritario.
                </p>
                <div className="h-px bg-zinc-800 w-full mb-8" />
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                    <Check className="w-4 h-4 text-white mt-0.5 shrink-0" />
                    <span>Productos Activos Ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                    <Check className="w-4 h-4 text-white mt-0.5 shrink-0" />
                    <span>IntegraciÃƒÂ³n directa con ERPs/CRMs</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                    <Check className="w-4 h-4 text-white mt-0.5 shrink-0" />
                    <span>MÃƒÂºltiples canales (Insta, Messenger, WA)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                    <Check className="w-4 h-4 text-white mt-0.5 shrink-0" />
                    <span>Gerente de cuenta y SLA dedicado</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-zinc-300 font-medium">
                    <Check className="w-4 h-4 text-white mt-0.5 shrink-0" />
                    <span>Desarrollo de mÃƒÂ³dulos a medida</span>
                  </li>
                </ul>
              </div>
              <Button asChild className="w-full mt-8 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold py-3 rounded-xl transition-all">
                <Link href="/enterprise">Contactar Ventas</Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Products Advisor Calculator */}
      <section className="w-full py-16 bg-white border-y border-zinc-200/60">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10 flex flex-col items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
              Ã‚Â¿CuÃƒÂ¡l es el plan adecuado para tus productos?
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl font-normal leading-relaxed">
              Desliza el control para indicar cuÃƒÂ¡ntos productos activos necesitas vender y descubre nuestra recomendaciÃƒÂ³n.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/60 p-8 rounded-3xl shadow-sm flex flex-col gap-8 items-stretch">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Capacidad del CatÃƒÂ¡logo</span>
                <span className="text-3xl font-bold tracking-tight text-zinc-950">
                  {productCount === 250 ? '250+ (Ilimitado)' : `${productCount} productos`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Plan Recomendado</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  recommendedPlan === 'free' 
                    ? 'bg-zinc-100 text-zinc-800' 
                    : recommendedPlan === 'pro' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-zinc-950 text-white'
                }`}>
                  {recommendedPlan === 'free' && 'Plan Gratuito'}
                  {recommendedPlan === 'pro' && 'Plan Pro'}
                  {recommendedPlan === 'enterprise' && 'Plan Enterprise'}
                </span>
              </div>
            </div>

            {/* Slider control input */}
            <div className="relative w-full flex items-center">
              <input
                type="range"
                min="1"
                max="250"
                value={productCount}
                onChange={(e) => setProductCount(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950 focus:outline-none"
              />
            </div>

            {/* Live logic feedback card */}
            <div className="bg-white border border-zinc-200/50 p-5 rounded-2xl flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                recommendedPlan === 'free' 
                  ? 'bg-zinc-50 text-zinc-800' 
                  : recommendedPlan === 'pro' 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-zinc-950 text-white'
              }`}>
                {recommendedPlan === 'free' && <ShoppingBag className="w-5 h-5" />}
                {recommendedPlan === 'pro' && <Zap className="w-5 h-5" />}
                {recommendedPlan === 'enterprise' && <Building className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-950 mb-0.5">
                  {recommendedPlan === 'free' && 'Plan Gratuito: Gratis para siempre'}
                  {recommendedPlan === 'pro' && `Plan Pro: AutomÃƒÂ¡tico por $${isAnnual ? '8' : '10'}/mes`}
                  {recommendedPlan === 'enterprise' && 'Plan Enterprise: SoluciÃƒÂ³n a Medida'}
                </h4>
                <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                  {recommendedPlan === 'free' && 'Ideal para pequeÃƒÂ±os emprendimientos. Permite agregar hasta 10 productos sin costo.'}
                  {recommendedPlan === 'pro' && 'Permite productos ilimitados e incluye el Agente de WhatsApp inteligente para vender de forma automÃƒÂ¡tica 24/7.'}
                  {recommendedPlan === 'enterprise' && 'Para tiendas que superan los 250 productos o requieren integraciones API personalizadas con ERPs.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing FAQs Section */}
      <section id="pricing-faq" className="w-full py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col items-center gap-4">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
              Preguntas Frecuentes
            </h2>
            <p className="text-base text-zinc-500 max-w-2xl font-normal">
              Ã‚Â¿Tienes dudas sobre los planes de Flashcheckouts? Resolvemos las preguntas mÃƒÂ¡s comunes sobre nuestras tarifas y capacidades.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = activeFaq === i
              return (
                <div
                  key={i}
                  className="border border-zinc-200 rounded-2xl bg-zinc-50/30 overflow-hidden transition-all hover:bg-zinc-50/50"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="flex justify-between items-center w-full px-6 py-5 text-left font-semibold text-zinc-950 text-base outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-zinc-950' : ''
                    }`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-5 text-sm text-zinc-500 font-normal leading-relaxed border-t border-zinc-100 pt-3 bg-white">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Shared Footer */}
      <Footer />
    </div>
  )
}
