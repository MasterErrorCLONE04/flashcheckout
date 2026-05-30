import { Clock, ShieldCheck, Zap, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const RELEASES = [
  {
    version: 'v1.1.0',
    date: '30 de Mayo, 2026',
    title: 'Despacho de Repartidores & Exportación Financiera',
    type: 'FEATURE', // FEATURE, IMPROVEMENT, BUGFIX
    details: [
      'Asignación Automática de Repartidores: Al seleccionar "SÍ" al domicilio, notificamos a todos los repartidores activos de la zona simultáneamente. El primer conductor en aceptar el pedido por WhatsApp se queda con él.',
      'Exportación Financiera: Añadido botón "Exportar a Excel" en tu panel de ventas. Genera archivos CSV con soporte nativo de caracteres especiales en español (UTF-8 BOM).',
      'Corrección de Enrutamiento: Corregidos los errores de rutas 404 del dashboard principal (/dashboard) y del portal de membresías (/dashboard/suscripcion) al retirar los prefijos privados.'
    ]
  },
  {
    version: 'v1.0.0',
    date: '15 de Mayo, 2026',
    title: 'Lanzamiento Oficial del Motor de Pagos Híbrido',
    type: 'FEATURE',
    details: [
      'Integración con Mercado Pago: Permite a tus clientes pagar en Colombia mediante tarjetas de crédito, débito y PSE de forma local segura.',
      'Stripe Connect Onboarding: Los vendedores pueden vincular sus cuentas de Stripe con un clic en la sección de configuración.',
      'Mapa de Despacho (Map Picker): Integrado selector visual en mapa de Leaflet para marcar el pin exacto de dirección de entrega.'
    ]
  },
  {
    version: 'v0.9.0',
    date: '30 de Abril, 2026',
    title: 'Chatbot Conversacional Jelou-Style',
    type: 'IMPROVEMENT',
    details: [
      'Navegación Conversacional en WhatsApp: Los clientes pueden chatear con tu número comercial, buscar productos y agregarlos a un carrito interactivo dentro de WhatsApp.',
      'Facturas en PDF automáticas: Generación y descarga de facturas en PDF al instante tras cada transacción exitosa.'
    ]
  }
]

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Registro de Cambios
        </h1>
        <p className="text-sm font-medium text-zinc-500 mt-2">
          Entérate de las últimas mejoras, correcciones y nuevas funcionalidades añadidas a la plataforma.
        </p>
      </div>

      <div className="relative border-l border-zinc-200 ml-4 md:ml-32 space-y-12">
        {RELEASES.map((release, index) => (
          <div key={index} className="relative pl-8 md:pl-10">
            {/* Version Dot */}
            <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-white border-2 border-zinc-950 flex items-center justify-center shadow-sm">
              <Zap className="w-3 h-3 text-zinc-950 fill-current" />
            </div>

            {/* Floating Date on Left (Desktop only) */}
            <div className="hidden md:block absolute -left-36 top-1 text-right w-28">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight block">
                {release.date}
              </span>
              <span className="text-xs font-bold text-zinc-900 mt-1 block">
                {release.version}
              </span>
            </div>

            {/* Content Card */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 md:p-8 hover:border-zinc-300 transition-colors shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  {/* Date/Version on mobile only */}
                  <div className="flex items-center gap-2 md:hidden">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                      {release.date}
                    </span>
                    <span className="text-xs font-bold text-zinc-900">
                      · {release.version}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-zinc-900 leading-tight">
                    {release.title}
                  </h3>
                </div>

                <Badge type={release.type} />
              </div>

              <ul className="space-y-3 font-medium text-zinc-600 text-xs md:text-sm list-disc pl-4 leading-relaxed">
                {release.details.map((detail, dIndex) => (
                  <li key={dIndex}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Badge({ type }: { type: string }) {
  const styles: Record<string, { bg: string, text: string, label: string }> = {
    FEATURE: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Novedad' },
    IMPROVEMENT: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Mejora' },
    BUGFIX: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Corrección' }
  }

  const style = styles[type] ?? styles.FEATURE

  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2.5 py-1 rounded-md border tracking-tight uppercase w-fit block shrink-0",
        style.bg,
        style.text,
      )}
    >
      {style.label}
    </span>
  )
}
