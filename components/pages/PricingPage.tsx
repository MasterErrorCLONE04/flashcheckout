'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import {
  Check,
  Sparkles,
  Zap,
  Building,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react'

type RecommendedPlan = 'free' | 'pro' | 'enterprise'

type Plan = {
  id: RecommendedPlan
  name: string
  eyebrow: string
  description: string
  price: (isAnnual: boolean) => string
  priceSuffix?: string
  href: string
  cta: string
  icon: typeof ShoppingBag
  iconClassName: string
  cardClassName?: string
  popular?: boolean
  features: Array<{ label: string; disabled?: boolean }>
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    eyebrow: 'Para iniciar',
    description: 'Perfecto para probar la plataforma y lanzar tu primer catálogo digital básico.',
    price: () => '$0',
    priceSuffix: '/ mes',
    href: '/sign-up',
    cta: 'Crear Tienda Gratis',
    icon: ShoppingBag,
    iconClassName: 'bg-zinc-100 border-zinc-200/50 text-zinc-800',
    features: [
      { label: 'Hasta 10 productos activos' },
      { label: 'Página de checkout rápido' },
      { label: 'Integración Stripe & MercadoPago' },
      { label: 'Agente de WhatsApp Inteligente', disabled: true },
      { label: 'Recuperación de carritos por chat', disabled: true },
    ],
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    eyebrow: 'Ventas Automáticas',
    description: 'Para comercios en crecimiento que desean automatizar su canal de WhatsApp y vender en piloto automático.',
    price: (isAnnual) => `$${isAnnual ? '8' : '10'}`,
    priceSuffix: '/ mes',
    href: '/sign-up',
    cta: 'Activar Pro',
    icon: Zap,
    iconClassName: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    popular: true,
    features: [
      { label: 'Productos Activos Ilimitados' },
      { label: 'Agente de WhatsApp Personalizado' },
      { label: 'Recuperación de carritos abandonados' },
      { label: 'Automatizaciones por eventos' },
      { label: 'Soporte prioritario por chat' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    eyebrow: 'Gran Volumen',
    description: 'Para marcas medianas y grandes que requieren integraciones a medida, infraestructura dedicada y soporte prioritario.',
    price: () => 'Personalizado',
    href: '/enterprise',
    cta: 'Contactar Ventas',
    icon: Building,
    iconClassName: 'bg-zinc-900 border-zinc-800 text-white',
    cardClassName: 'bg-zinc-950 border-zinc-900 text-white',
    features: [
      { label: 'Productos Activos Ilimitados' },
      { label: 'Integración directa con ERPs/CRMs' },
      { label: 'Múltiples canales (Insta, Messenger, WA)' },
      { label: 'Gerente de cuenta y SLA dedicado' },
      { label: 'Desarrollo de módulos a medida' },
    ],
  },
]

const FAQS = [
  {
    q: '¿Cómo funciona el límite de 10 productos en el plan Gratuito?',
    a: 'Puedes crear tu tienda y agregar hasta 10 productos activos sin ningún costo ni necesidad de tarjeta de crédito. Si deseas ofrecer un catálogo más grande, puedes actualizar al plan Pro en cualquier momento desde tu panel de configuración.',
  },
  {
    q: '¿Qué es el Agente de WhatsApp Inteligente?',
    a: 'Es un asistente de inteligencia artificial entrenado con la información y productos de tu tienda. Atiende a tus clientes por WhatsApp, responde dudas, comprueba inventario y envía enlaces de pago.',
  },
  {
    q: '¿Cómo se maneja la recuperación de carritos abandonados?',
    a: 'Cuando un cliente inicia un flujo de pago pero no completa la transacción, el sistema le envía un recordatorio personalizado con un botón para finalizar la compra.',
  },
  {
    q: '¿Qué métodos de pago puedo ofrecer?',
    a: 'Flashcheckouts se integra con Stripe y MercadoPago para aceptar tarjetas, PSE, transferencias bancarias y monederos digitales de forma segura.',
  },
  {
    q: '¿Puedo cancelar o cambiar mi plan en cualquier momento?',
    a: 'Sí. No hay contratos a largo plazo ni compromisos de permanencia. Puedes subir, bajar o cancelar tu plan desde el panel.',
  },
]

export default function PricingPage() {
  const { user } = useUser()
  const [isAnnual, setIsAnnual] = useState(false)
  const [productCount, setProductCount] = useState(10)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const recommendedPlan = getRecommendedPlan(productCount)

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans antialiased">
      <Navbar userId={user?.id ?? undefined} />
      <PricingHero
        isAnnual={isAnnual}
        recommendedPlan={recommendedPlan}
        onBillingChange={setIsAnnual}
      />
      <ProductsAdvisor
        isAnnual={isAnnual}
        productCount={productCount}
        recommendedPlan={recommendedPlan}
        onProductCountChange={setProductCount}
      />
      <PricingFaq activeFaq={activeFaq} onFaqChange={setActiveFaq} />
      <Footer />
    </div>
  )
}

function getRecommendedPlan(productCount: number): RecommendedPlan {
  if (productCount <= 10) return 'free'
  if (productCount <= 200) return 'pro'
  return 'enterprise'
}

function PricingHero({
  isAnnual,
  recommendedPlan,
  onBillingChange,
}: {
  isAnnual: boolean
  recommendedPlan: RecommendedPlan
  onBillingChange: (value: boolean) => void
}) {
  return (
    <section className="w-full pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
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
          Crea tu tienda virtual y agrega tus primeros productos gratis. Desbloquea automatizaciones profesionales por WhatsApp cuando estés listo para crecer.
        </p>

        <BillingSwitch isAnnual={isAnnual} onBillingChange={onBillingChange} />

        <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl items-stretch">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              isAnnual={isAnnual}
              isRecommended={recommendedPlan === plan.id}
              plan={plan}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function BillingSwitch({
  isAnnual,
  onBillingChange,
}: {
  isAnnual: boolean
  onBillingChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 mb-16 relative z-10">
      <button
        onClick={() => onBillingChange(false)}
        className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
          !isAnnual ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
        }`}
      >
        Mensual
      </button>
      <button
        onClick={() => onBillingChange(true)}
        className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
          isAnnual ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
        }`}
      >
        Anual
        <span className="bg-zinc-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-normal">
          -20%
        </span>
      </button>
    </div>
  )
}

function PlanCard({
  plan,
  isAnnual,
  isRecommended,
}: {
  plan: Plan
  isAnnual: boolean
  isRecommended: boolean
}) {
  const Icon = plan.icon
  const isDark = plan.id === 'enterprise'

  return (
    <div
      className={`premium-card p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative hover:border-zinc-300 hover:shadow-xl ${
        plan.cardClassName ?? 'bg-white border-zinc-200'
      } ${isRecommended ? 'ring-2 ring-zinc-950 ring-offset-2' : ''}`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-zinc-950 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
          Más Popular
        </div>
      )}
      {isRecommended && (
        <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-zinc-950 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
          Recomendado
        </span>
      )}

      <div className="text-left">
        <div className="flex items-center gap-2.5 mb-4">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${plan.iconClassName}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-950'}`}>{plan.name}</h3>
            <p className={`text-xs font-bold uppercase tracking-wider ${plan.id === 'pro' ? 'text-emerald-600' : isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>
              {plan.eyebrow}
            </p>
          </div>
        </div>
        <div className="mb-6 flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            {plan.price(isAnnual)}
          </span>
          {plan.priceSuffix && <span className="text-sm font-semibold text-zinc-400">{plan.priceSuffix}</span>}
        </div>
        <p className={`text-xs mb-8 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {plan.description}
        </p>
        <div className={`h-px w-full mb-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
        <ul className="space-y-4">
          {plan.features.map((feature) => (
            <li
              key={feature.label}
              className={`flex items-start gap-3 text-sm font-medium ${
                feature.disabled ? 'text-zinc-300' : isDark ? 'text-zinc-300' : plan.id === 'pro' && feature.label.includes('Ilimitados') ? 'text-zinc-800 font-bold' : 'text-zinc-600'
              }`}
            >
              <Check className={`w-4 h-4 mt-0.5 shrink-0 ${feature.disabled ? 'text-zinc-300' : plan.id === 'pro' ? 'text-emerald-500' : isDark ? 'text-white' : 'text-zinc-900'}`} />
              <span className={feature.disabled ? 'line-through' : undefined}>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        asChild
        className={`w-full mt-8 font-semibold py-3 rounded-xl transition-all ${
          isDark
            ? 'bg-white hover:bg-zinc-100 text-zinc-950'
            : plan.id === 'pro'
              ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
        }`}
      >
        <Link href={plan.href}>{plan.cta}</Link>
      </Button>
    </div>
  )
}

function ProductsAdvisor({
  isAnnual,
  productCount,
  recommendedPlan,
  onProductCountChange,
}: {
  isAnnual: boolean
  productCount: number
  recommendedPlan: RecommendedPlan
  onProductCountChange: (value: number) => void
}) {
  const Icon = recommendedPlan === 'free' ? ShoppingBag : recommendedPlan === 'pro' ? Zap : Building

  return (
    <section className="w-full py-16 bg-white border-y border-zinc-200/60">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10 flex flex-col items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            ¿Cuál es el plan adecuado para tus productos?
          </h2>
          <p className="text-sm text-zinc-500 max-w-xl font-normal leading-relaxed">
            Desliza el control para indicar cuántos productos activos necesitas vender y descubre nuestra recomendación.
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/60 p-8 rounded-3xl shadow-sm flex flex-col gap-8 items-stretch">
          <div className="flex justify-between items-center">
            <AdvisorMetric label="Capacidad del Catálogo" value={productCount === 250 ? '250+ (Ilimitado)' : `${productCount} productos`} />
            <div className="text-right">
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Plan Recomendado</span>
              <RecommendedBadge recommendedPlan={recommendedPlan} />
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="250"
            value={productCount}
            onChange={(event) => onProductCountChange(parseInt(event.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950 focus:outline-none"
          />

          <div className="bg-white border border-zinc-200/50 p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getRecommendedIconClass(recommendedPlan)}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-950 mb-0.5">
                {getAdvisorTitle(recommendedPlan, isAnnual)}
              </h4>
              <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                {getAdvisorCopy(recommendedPlan)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdvisorMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider block mb-1">{label}</span>
      <span className="text-3xl font-bold tracking-tight text-zinc-950">{value}</span>
    </div>
  )
}

function RecommendedBadge({ recommendedPlan }: { recommendedPlan: RecommendedPlan }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRecommendedBadgeClass(recommendedPlan)}`}>
      {recommendedPlan === 'free' && 'Plan Gratuito'}
      {recommendedPlan === 'pro' && 'Plan Pro'}
      {recommendedPlan === 'enterprise' && 'Plan Enterprise'}
    </span>
  )
}

function PricingFaq({
  activeFaq,
  onFaqChange,
}: {
  activeFaq: number | null
  onFaqChange: (value: number | null) => void
}) {
  return (
    <section id="pricing-faq" className="w-full py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">Preguntas Frecuentes</h2>
          <p className="text-base text-zinc-500 max-w-2xl font-normal">
            ¿Tienes dudas sobre los planes de Flashcheckouts? Resolvemos las preguntas más comunes sobre nuestras tarifas y capacidades.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.q}
              answer={faq.a}
              isOpen={activeFaq === index}
              question={faq.q}
              onToggle={() => onFaqChange(activeFaq === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({
  answer,
  isOpen,
  question,
  onToggle,
}: {
  answer: string
  isOpen: boolean
  question: string
  onToggle: () => void
}) {
  return (
    <div className="border border-zinc-200 rounded-2xl bg-zinc-50/30 overflow-hidden transition-all hover:bg-zinc-50/50">
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full px-6 py-5 text-left font-semibold text-zinc-950 text-base outline-none"
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-zinc-950' : ''}`} />
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
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getRecommendedBadgeClass(recommendedPlan: RecommendedPlan) {
  if (recommendedPlan === 'free') return 'bg-zinc-100 text-zinc-800'
  if (recommendedPlan === 'pro') return 'bg-emerald-50 text-emerald-700'
  return 'bg-zinc-950 text-white'
}

function getRecommendedIconClass(recommendedPlan: RecommendedPlan) {
  if (recommendedPlan === 'free') return 'bg-zinc-50 text-zinc-800'
  if (recommendedPlan === 'pro') return 'bg-emerald-50 text-emerald-600'
  return 'bg-zinc-950 text-white'
}

function getAdvisorTitle(recommendedPlan: RecommendedPlan, isAnnual: boolean) {
  if (recommendedPlan === 'free') return 'Plan Gratuito: Gratis para siempre'
  if (recommendedPlan === 'pro') return `Plan Pro: Automático por $${isAnnual ? '8' : '10'}/mes`
  return 'Plan Enterprise: Solución a Medida'
}

function getAdvisorCopy(recommendedPlan: RecommendedPlan) {
  if (recommendedPlan === 'free') return 'Ideal para pequeños emprendimientos. Permite agregar hasta 10 productos sin costo.'
  if (recommendedPlan === 'pro') return 'Permite productos ilimitados e incluye el Agente de WhatsApp inteligente para vender de forma automática 24/7.'
  return 'Para tiendas que superan los 250 productos o requieren integraciones API personalizadas con ERPs.'
}
