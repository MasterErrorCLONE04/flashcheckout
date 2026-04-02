import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { checkSubscription } from '@/lib/subscription'
import SubscriptionButton from '@/components/SubscriptionButton'
import { Sparkles, CheckCircle2, LayoutTemplate } from 'lucide-react'

export default async function SuscripcionPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId }
  })

  // Evita que caiga la app si ni siquiera ha hecho el onboarding
  if (!store) redirect('/')

  // Validar el estado real sacado de Stripe y comparado con la fecha de expiración
  const isPro = await checkSubscription()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mi Membresía</h1>
        <p className="text-muted-foreground">
          Controla los límites de tu tienda y tus cobros mensuales.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Current Plan Card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPro ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'}`}>
                {isPro ? <Sparkles className="w-6 h-6" /> : <LayoutTemplate className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {isPro ? 'Plan Pro Activo' : 'Plan Free (Gratuito)'}
                </h3>
                <p className="text-sm text-emerald-600 font-medium mt-0.5">
                  {isPro ? 'Tu tienda no tiene límites' : '10 / 10 Productos Restantes'}
                </p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {isPro 
                ? '¡Gracias por apoyar FlashCheckout! Tu portal procesa pedidos velozmente en WhatsApp, tus productos son ilimitados y puedes descargar el código QR de ventas.' 
                : 'Empieza a vender gratis por WhatsApp con tu catálogo inteligente. Si necesitas subir tu inventario completo, ¡pásate a la versión Pro!'}
            </p>
          </div>

          <SubscriptionButton isPro={isPro} />
        </div>

        {/* Features Comparison */}
        <div className="bg-[#F9FAFB] border border-border rounded-2xl p-8 space-y-6">
          <h4 className="font-bold text-lg border-b border-border pb-4">Lo que incluye "Pro"</h4>
          
          <ul className="space-y-4">
            {[
              'Productos Ilimitados (Sube más de 10 ítems)',
              'Descarga del Código QR Vectorial (Próximamente)',
              'Métricas Avanzadas de Reingresos',
              'Soporte Técnico VIP'
            ].map((feature, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium text-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
