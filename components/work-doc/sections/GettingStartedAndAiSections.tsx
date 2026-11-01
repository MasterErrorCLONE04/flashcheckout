'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Zap,
  Layout as LayoutIcon,
  Settings,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Sparkles,
  Truck,
  Percent,
} from 'lucide-react'

export function InicioRapidoSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Guía de Inicio Rápido
        </h1>
        <p className="text-sm font-semibold leading-relaxed text-zinc-400 max-w-2xl">
          Despliega tu propia terminal comercial en cuestión de minutos. Nuestro ecosistema está diseñado para acelerar la conversión, estructurar las ventas de WhatsApp y automatizar cobros.
        </p>
      </div>

      <div className="border border-emerald-950/40 bg-emerald-950/10 p-5 rounded-xl">
        <p className="text-xs font-semibold text-emerald-300 leading-relaxed max-w-2xl flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-[#10B981] fill-current shrink-0 animate-pulse" />
          Estás navegando la documentación actualizada v2.0. Conoce a los agentes autónomos de IA, las automatizaciones por eventos y los nuevos sistemas de pago.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl flex flex-col gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Settings className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white">Panel Integrado</h4>
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
            Configura en un solo lugar pasarelas de pago, campañas de cupones y tus copilotos de inteligencia artificial.
          </p>
        </div>
        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl flex flex-col gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <LayoutIcon className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white">Storefront Autónomo</h4>
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
            Tu tienda se genera visualmente al instante y se adapta a móviles con optimizaciones de carga extrema.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/dashboard"
          className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-6 py-3 rounded-lg text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          Comenzar en el Panel
          <ArrowLeft className="w-4 h-4 rotate-180 shrink-0" />
        </Link>
      </div>
    </div>
  )
}

export function AccesoYLoginSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Acceso y Seguridad Integral
        </h2>
        <p className="text-sm font-semibold text-zinc-400 max-w-xl leading-relaxed">
          Autenticación robusta y cifrado de datos líder para resguardar la identidad de tu comercio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-[#10B981]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm mb-1.5 text-white">Autenticación Clerk</h4>
          <p className="text-zinc-400 font-semibold leading-relaxed text-xs">
            Cierre de sesión seguro, autenticación social y verificación de correos integrada a nivel de servidor.
          </p>
        </div>
        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm mb-1.5 text-white">Middleware Edge</h4>
          <p className="text-zinc-400 font-semibold leading-relaxed text-xs">
            Protección de rutas comerciales mediante Next.js Middleware para prevenir accesos no autorizados en tiempo récord.
          </p>
        </div>
      </div>
    </div>
  )
}

export function AgentesIaSection() {
  return (
    <div className="space-y-10 animate-in">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-full px-3 py-0.5 text-[#10B981] text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 animate-pulse" />
          Exclusivo v2.0
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Copilotos de IA Multitarea
        </h2>
        <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-2xl">
          Nuestros 4 agentes autónomos interactúan con las herramientas del sistema (Database Tool Calling) para resolver tus peticiones directamente desde la consola de chat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-950/30 border border-emerald-900/60 flex items-center justify-center text-[#10B981]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Nova</h4>
              <span className="text-[10px] text-zinc-500 font-semibold">Copiloto Operativo</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
            Busca y gestiona tus productos, revisa métricas básicas de ventas y te ayuda a programar la estructura general de tu tienda.
          </p>
        </div>

        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pink-950/30 border border-pink-900/60 flex items-center justify-center text-pink-500">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Stella</h4>
              <span className="text-[10px] text-zinc-500 font-semibold">
                Especialista de Marketing
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
            Diseña ofertas promocionales personalizadas, crea cupones de descuento (porcentaje, envío gratis o fijos) y te sugiere planes comerciales.
          </p>
        </div>

        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-950/30 border border-blue-900/60 flex items-center justify-center text-blue-500">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Atlas</h4>
              <span className="text-[10px] text-zinc-500 font-semibold">
                Analista de Logística
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
            Monitorea el inventario crítico de productos con poco stock, revisa pedidos activos y gestiona el flujo de repartidores asignados.
          </p>
        </div>

        <div className="p-5 border border-zinc-900 bg-zinc-950/30 rounded-xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-950/30 border border-purple-900/60 flex items-center justify-center text-purple-500">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Orion</h4>
              <span className="text-[10px] text-zinc-500 font-semibold">Ingeniero Técnico</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
            Configura conexiones de WhatsApp API, vincula pasarelas de cobro, soluciona errores de webhook y proporciona soporte técnico experto.
          </p>
        </div>
      </div>
    </div>
  )
}

