import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import SubscriptionButton from '@/components/SubscriptionButton'
import { Sparkles, CheckCircle2, LayoutTemplate, Zap, ShieldCheck, BarChart3, Headphones, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="w-full pb-20 animate-in relative">
      {/* Background Ambience */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-black">Gestión de <span className="text-primary">Suscripción</span></h1>
        <div className="flex items-center gap-3 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">Escalamiento de Infraestructura / Nivel de Acceso</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        
        {/* Plan Spotlight - 3/5 width */}
        <div className={cn(
          "lg:col-span-3 premium-card p-10 md:p-14 overflow-hidden relative group transition-all duration-700 bg-white",
          isPro && "border-primary/10 bg-white shadow-elevated"
        )}>
          {isPro && (
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-bl-3xl shadow-lg">
              PLAN PREMIUM ACTIVO
            </div>
          )}

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 shadow-xl",
                  isPro 
                    ? "bg-primary text-white shadow-primary/20" 
                    : "bg-zinc-50 text-zinc-400 border border-black/[0.05]"
                )}>
                  {isPro ? <Sparkles className="w-10 h-10" /> : <LayoutTemplate className="w-10 h-10" />}
                </div>
                <div>
                  <h3 className="text-3xl font-semibold text-black">
                    {isPro ? 'Flash Premium' : 'Free Terminal'}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Nivel de Operación</p>
                </div>
              </div>
            </div>

            <div className="space-y-10 mb-14">
              <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-black/[0.05] group-hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-end mb-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-2">Inventario de Productos</span>
                    <span className="text-2xl font-bold text-black tracking-tighter tabular-nums">
                      {isPro ? 'ILIMITADO' : 'HASTA 10 SKUS'}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-black/[0.05]",
                    isPro ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {isPro ? 'STATUS: ÓPTIMO' : 'STATUS: LÍMITE'}
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden relative z-10 shadow-inner">
                  <div className={cn(
                    "h-full transition-all duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1)",
                    isPro 
                      ? "w-full bg-primary" 
                      : "w-[30%] bg-zinc-400"
                  )} />
                </div>
              </div>

              <div className="px-2">
                <p className="text-base font-medium text-zinc-500 leading-relaxed">
                  {isPro 
                    ? 'Suscripción activa. Tu terminal opera en alta fidelidad. Tienes soberanía total sobre tu tienda con inventario ilimitado, soporte prioritario y acceso a todas las herramientas de optimización.' 
                    : 'Tu terminal opera bajo el protocolo base. Para expandir tu operación a escala profesional y desbloquear el potencial total de ventas de FlashCheckout, considera el Plan Premium.'}
                </p>
              </div>
            </div>
            
            <SubscriptionButton isPro={isPro} />
          </div>
          
          {/* Decorative gradients */}
          {!isPro && <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-zinc-50 rounded-full blur-[100px] opacity-10" />}
        </div>

        {/* Feature Intelligence - 2/5 width */}
        <div className="lg:col-span-2 premium-card p-10 flex flex-col justify-between border-black/[0.02] bg-zinc-50/50">
          <div className="space-y-10">
            <div>
              <h4 className="text-2xl font-semibold text-black uppercase">Módulos Premium</h4>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 border-b border-black/[0.05] pb-6">Expansión de Herramientas</p>
            </div>
            
            <ul className="space-y-8">
              {[
                { icon: Package, text: 'Inventario Masivo Ilimitado' },
                { icon: Zap, text: 'Checkout Pro en 30 Segundos' },
                { icon: BarChart3, text: 'Analytics de Alta Fidelidad' },
                { icon: ShieldCheck, text: 'Seguridad Empresarial' },
                { icon: Headphones, text: 'Soporte Prioritario 24/7' }
              ].map((item, i) => (
                <li key={i} className="flex gap-5 group items-start">
                  <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.05] shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:scale-110 transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-tight group-hover:text-primary transition-colors">{item.text}</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Status: En Línea</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 p-6 bg-white border border-black/[0.05] rounded-[2rem] relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/[0.03] blur-2xl group-hover:scale-150 transition-transform" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-relaxed relative z-10">
              El escalamiento garantiza la soberanía digital de tu tienda en el ecosistema FlashCheckout.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
