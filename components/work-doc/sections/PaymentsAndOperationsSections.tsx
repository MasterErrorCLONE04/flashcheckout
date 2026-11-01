'use client'

import {
  Zap,
  Layout as LayoutIcon,
  MessageSquare,
  CreditCard,
  Bell,
  ShieldCheck,
  RefreshCw,
  Globe,
  Percent,
} from 'lucide-react'
import {
  InicioRapidoSection,
  AccesoYLoginSection,
  AgentesIaSection,
} from './GettingStartedAndAiSections'

function StripeConnectSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Stripe Connect</h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          Procesa pagos directos con tarjetas de crédito de forma global y recibe transferencias directamente a tu cuenta bancaria.
        </p>
      </div>

      <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-500">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Onboarding Instantáneo</h4>
            <p className="text-xs text-zinc-500 font-semibold">
              Vincula tu cuenta bancaria en segundos.
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
          En los Ajustes del Dashboard, haz clic en &quot;Vincular Stripe&quot; para rellenar la información legal y bancaria. Stripe validará tu cuenta y depositará tus ventas de manera automática en el intervalo establecido.
        </p>
      </div>
    </div>
  )
}

function MercadoPagoSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Mercado Pago (PSE &amp; Tarjetas)
        </h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          La pasarela preferida para el mercado latinoamericano. Habilita pagos inmediatos en pesos colombianos.
        </p>
      </div>

      <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Conexión vía Token</h4>
            <p className="text-xs text-zinc-500 font-semibold">
              Integración mediante tus credenciales de Mercado Pago.
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
          Introduce tu Access Token y Public Key desde la pestaña de Integraciones. Tus clientes podrán pagar a través de links de checkout y el propio bot procesará la preferencia para registrar el pago tan pronto como se complete.
        </p>
      </div>
    </div>
  )
}

function VerificacionPagosSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Validar Transferencias &amp; Comprobantes
        </h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          Permite transferencias de bancos locales (Nequi, Bancolombia, etc.) y verifica el comprobante manualmente.
        </p>
      </div>

      <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              Bandeja de Verificación Manual (`/verificaciones`)
            </h4>
            <p className="text-xs text-zinc-500 font-semibold">
              Audita capturas de pantalla enviadas por tus clientes.
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
          Cuando un cliente selecciona &quot;Transferencia&quot; y sube una foto de su recibo, el pedido queda retenido. En la sección **Verificar Pagos**, podrás inspeccionar el comprobante, validarlo y cambiar el estado del pedido a pagado con un solo clic.
        </p>
      </div>
    </div>
  )
}

function AutomatizacionesWhatsappSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Automatizaciones de WhatsApp
        </h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          Dispara flujos conversacionales dinámicos basados en eventos operativos clave de la tienda.
        </p>
      </div>

      <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4 font-sans">
        <div className="flex justify-between items-center select-none pb-2 border-b border-zinc-900">
          <span className="text-xs font-bold text-zinc-400">FLUJO AUTOMÁTICO</span>
          <span className="text-[10px] font-black text-emerald-500">CONECTADO</span>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-start gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-white">Pedido Recibido / Pendiente</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Notifica al cliente con la confirmación del pedido y los datos para transferir.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-white">Pedido Despachado</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Envía el número de guía e información del repartidor asignado automáticamente.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] shrink-0 mt-1" />
            <div>
              <p className="font-bold text-white">Encuesta de Servicio</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Al ser entregado, el bot recopila opiniones y puntuación de servicio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CrmConversacionesSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Conversacional CRM &amp; Live Chat
        </h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          Supervisa las interacciones del chatbot con tus clientes y toma el control manual en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#10B981]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white">Live Chat</h4>
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
            Visualiza los chats de WhatsApp activos, filtra favoritos, añade notas rápidas al cliente y responde directamente sin salir del dashboard.
          </p>
        </div>

        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <RefreshCw className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white">Logs Persistentes</h4>
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
            El historial completo de transacciones, estados de entrega y logs de chat permanecen guardados y accesibles de por vida para auditorías.
          </p>
        </div>
      </div>
    </div>
  )
}

function CuponesDescuentoSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Cupones de Descuento</h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          Impulsa tus ventas creando incentivos personalizados y analizando su rendimiento general en tiempo real.
        </p>
      </div>

      <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-500">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Configuración Flexible</h4>
            <p className="text-xs text-zinc-500 font-semibold">
              Cupones por porcentaje, envío gratis y montos fijos.
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
          En la sección de **Descuentos**, configura nuevos cupones estableciendo su código, descripción, tipo de descuento y fecha de validez. Podrás ver cuántas veces han sido redimidos y el impacto porcentual sobre tus ventas.
        </p>
      </div>
    </div>
  )
}

function BandejaInteligenteSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Bandeja Inteligente (Smart Inbox)
        </h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          Monitoreo operativo autónomo para alertarte sobre incidentes críticos que necesitan tu resolución.
        </p>
      </div>

      <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Notificaciones de Acción Rápida</h4>
            <p className="text-xs text-zinc-500 font-semibold">Resoluciones a un solo clic.</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
          Ubicado a la derecha en tu Panel de Control, te alertará de inmediato si el número de WhatsApp se desconectó, si hay transferencias por validar, si un producto está bajo en stock, o si tienes pedidos listos para ser despachados.
        </p>
      </div>
    </div>
  )
}

function ConstructorTiendaSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Constructor Visual de Tienda
        </h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-xl">
          Personaliza el diseño, la identidad de tu marca, logo y colores de tu storefront público.
        </p>
      </div>

      <div className="p-6 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#10B981]">
            <LayoutIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Personalización del Storefront</h4>
            <p className="text-xs text-zinc-500 font-semibold">
              Toma el control visual de la experiencia del cliente.
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
          En la sección de **Configuración de Tienda**, ajusta el banner de bienvenida, la biografía de tu negocio, sube un logo en alta definición y define los colores primarios. Tu catálogo online se adaptará en tiempo real reflejando tu identidad.
        </p>
      </div>
    </div>
  )
}

export function renderDocContent(slug: string) {
  switch (slug) {
    case 'inicio-rapido':
      return <InicioRapidoSection />
    case 'acceso-y-login':
      return <AccesoYLoginSection />
    case 'agentes-ia':
      return <AgentesIaSection />
    case 'stripe-connect':
      return <StripeConnectSection />
    case 'mercado-pago':
      return <MercadoPagoSection />
    case 'verificacion-pagos':
      return <VerificacionPagosSection />
    case 'automatizaciones-whatsapp':
      return <AutomatizacionesWhatsappSection />
    case 'crm-conversaciones':
      return <CrmConversacionesSection />
    case 'cupones-descuento':
      return <CuponesDescuentoSection />
    case 'bandeja-inteligente':
      return <BandejaInteligenteSection />
    case 'constructor-tienda':
      return <ConstructorTiendaSection />
    default:
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-20">
          <Zap className="w-10 h-10 text-zinc-700 mb-6 animate-pulse" />
          <h2 className="text-base font-bold tracking-tight text-zinc-500">
            Módulo en Construcción
          </h2>
        </div>
      )
  }
}

