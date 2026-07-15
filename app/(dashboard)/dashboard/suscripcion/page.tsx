import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import SubscriptionButton from '@/components/SubscriptionButton'
import { Sparkles, CheckCircle2, LayoutTemplate, Zap, ShieldCheck, BarChart3, Headphones, Package, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'

export default async function SuscripcionPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId }
  })

  if (!store) redirect('/')

  // Real status check from Stripe
  const isPro = await checkSubscription()

  return (
    <div className="w-full pb-32 animate-in relative overflow-x-clip">
      {/* Background Ambience - Clipped properly now */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Tu nivel de operación
        </h1>
        <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gestión de escala e infraestructura comercial</span>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Status & Plan */}
          <div className={cn(
            "lg:col-span-7 premium-card p-10 md:p-14 overflow-hidden relative group transition-all duration-700 bg-white",
            isPro && "border-primary/20 ring-1 ring-primary/5"
          )}>
            {isPro && (
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-bl-3xl">
                CLIENTE PREMIUM
              </div>
            )}

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-6 mb-12">
                <div className={cn(
                  "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700",
                  isPro 
                    ? "bg-primary text-white" 
                    : "bg-zinc-50 text-zinc-400 border border-black/[0.05]"
                )}>
                  {isPro ? <Sparkles className="w-10 h-10" /> : <LayoutTemplate className="w-10 h-10" />}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold text-black tracking-tight">
                    {isPro ? 'Flash Premium' : 'Free Terminal'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Protocolo:</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-100 text-zinc-500",
                      isPro && "bg-primary/10 text-primary"
                    )}>
                      {isPro ? 'Activado' : 'Base'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-12 flex-1">
                <div className="p-8 bg-zinc-50/50 rounded-[2.5rem] border border-black/[0.03] group-hover:border-primary/20 transition-all duration-500 relative overflow-hidden ring-1 ring-black/[0.02]">
                  <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-3">Soberanía de Inventario</span>
                      <span className="text-3xl font-bold text-black tracking-tighter tabular-nums">
                        {isPro ? 'ILIMITADO' : 'HASTA 10 SKUS'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status Térmico</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-black/[0.05] inline-block",
                        isPro ? "bg-primary/10 text-primary" : "bg-white text-zinc-500"
                      )}>
                        {isPro ? 'FRÍO (ÓPTIMO)' : 'AL LÍMITE'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-200/50 rounded-full overflow-hidden relative z-10">
                    <div className={cn(
                      "h-full transition-all duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1) relative",
                      isPro 
                        ? "w-full bg-primary" 
                        : "w-[30%] bg-zinc-800"
                    )}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="px-2">
                  <p className="text-base font-medium text-zinc-500 leading-relaxed max-w-md">
                    {isPro 
                      ? 'Nivel de acceso Pro detectado. Todas las restricciones de escala han sido levantadas. Tu infraestructura está optimizada para venta masiva y soporte bajo demanda.' 
                      : 'Tu tienda opera bajo el protocolo de entrada. Amplía tu visibilidad y soberanía desbloqueando el motor de comercio total de FlashCheckout.'}
                  </p>
                </div>
              </div>
              
              <div className="mt-12">
                <SubscriptionButton isPro={isPro} />
              </div>
            </div>
            
            {!isPro && <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-1000" />}
          </div>

          {/* Module Intelligence Summary */}
          <div className="lg:col-span-5 premium-card p-10 flex flex-col justify-between border-black/[0.02] bg-zinc-50/50 group/modules">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-2xl font-semibold text-black uppercase tracking-tight">Ecosistema</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Módulos Inteligentes</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-black/[0.05] flex items-center justify-center text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { icon: Package, text: 'Inventario Ilimitado', status: 'Premium' },
                  { icon: Zap, text: 'Checkout Acelerado', status: 'Estándar' },
                  { icon: BarChart3, text: 'Reportes de Precisión', status: 'Premium' },
                  { icon: Headphones, text: 'Canal Prioritario', status: 'Premium' },
                  { icon: CreditCard, text: 'Pasarela Stripe/MP', status: 'Estándar' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-2xl border border-black/[0.02] hover:border-primary/10 transition-all duration-300 group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover/item:text-primary transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-zinc-800 uppercase tracking-tight">{item.text}</span>
                    </div>
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                      item.status === 'Premium' ? "bg-primary/5 text-primary" : "bg-zinc-100 text-zinc-400"
                    )}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 p-6 bg-white rounded-3xl border border-black/[0.05] relative overflow-hidden group/alert">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.02] blur-2xl transition-transform" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed relative z-10">
                La suscripción garantiza la <span className="text-primary italic">continuidad operativa</span> y el acceso a las últimas optimizaciones de motor de pagos.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid - The "Third" Section to fill the screen */}
        <div className="grid md:grid-cols-3 gap-8">
          <BenefitCard 
            title="Velocidad" 
            desc="Tiempos de latencia mínimos en la creación de pedidos por WhatsApp." 
            icon={Zap}
          />
          <BenefitCard 
            title="Soberanía" 
            desc="Tus datos y transacciones siempre bajo protocolos de seguridad." 
            icon={ShieldCheck}
          />
          <BenefitCard 
            title="Escala" 
            desc="Crecimiento orgánico sin preocuparte por límites de stock." 
            icon={Package}
          />
        </div>

        {/* FAQ Area (Small & Clean) */}
        <div className="mt-10 border-t border-black/[0.05] pt-16">
          <div className="text-center mb-16">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-[0.4em] mb-4">Información de Seguridad</h4>
            <p className="text-2xl font-semibold text-black">Preguntas sobre tu cuenta</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-12 max-w-5xl mx-auto px-6">
            <FaqItem 
              q="¿Puedo cancelar en cualquier momento?" 
              a="Sí. Puedes gestionar tu suscripción y cancelarla instantáneamente desde el panel de Stripe sin cargos ocultos." 
            />
            <FaqItem 
              q="¿Qué pasa si llego al límite de 10 productos?" 
              a="Tu tienda seguirá operando, pero no podrás añadir nuevos ítems hasta que subas de nivel o elimines existentes." 
            />
            <FaqItem 
              q="¿Tienen soporte técnico personalizado?" 
              a="Los clientes Premium tienen acceso a un canal directo de atención prioritaria para resolver dudas de integración." 
            />
            <FaqItem 
              q="¿Los pagos son seguros?" 
              a="Absolutamente. FlashCheckout no almacena datos de tarjeta; toda la gestión se realiza directamente con Stripe." 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BenefitCard({ title, desc, icon: Icon }: { title: string, desc: string, icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="premium-card p-8 bg-white border-black/[0.03] group hover:border-primary/10 transition-all">
      <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h5 className="text-sm font-bold text-black uppercase tracking-widest mb-3">{title}</h5>
      <p className="text-xs font-medium text-zinc-400 leading-relaxed uppercase">{desc}</p>
    </div>
  )
}

function FaqItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="space-y-3">
      <h6 className="text-sm font-bold text-black uppercase tracking-tight">{q}</h6>
      <p className="text-xs font-medium text-zinc-500 leading-relaxed italic">{a}</p>
    </div>
  )
}
