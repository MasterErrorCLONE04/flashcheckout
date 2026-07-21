'use client'

import { useState } from 'react'
import { 
  Download, 
  Plus, 
  CheckCircle2, 
  Bot, 
  MessageCircle,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  QrCode
} from 'lucide-react'
import { 
  SiWhatsapp, 
  SiMercadopago, 
  SiGooglegemini, 
  SiDeepseek, 
  SiCloudflare, 
  SiMailgun, 
  SiStripe, 
  SiShopify, 
  SiWoocommerce, 
  SiTelegram, 
  SiMeta, 
  SiPaypal 
} from 'react-icons/si'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface IntegrationsClientProps {
  store: {
    whatsappConnected: boolean
    whatsapp: string | null
    mpConnected: boolean
    mpPublicKey: string | null
    brebConnected: boolean
    brebKeyValue: string | null
  }
}

export default function IntegrationsClient({ store }: IntegrationsClientProps) {
  const [activeTab, setActiveTab] = useState<'Todas' | 'Conectadas' | 'Disponibles'>('Todas')

  // Real connected list mapping database settings
  const connectedApps = [
    {
      id: 'whatsapp',
      name: 'WhatsApp (Evolution API)',
      icon: SiWhatsapp,
      iconBg: store.whatsappConnected ? 'bg-emerald-50 border-emerald-100/60' : 'bg-zinc-50 border-zinc-150',
      iconColor: store.whatsappConnected ? 'text-[#25D366]' : 'text-zinc-400',
      desc: 'Recibe y gestiona mensajes de WhatsApp Business mediante código QR.',
      connected: store.whatsappConnected,
      detailKey: 'Instancia / Número',
      detailVal: store.whatsappConnected ? (store.whatsapp || 'Conectado') : 'Desconectado',
      type: 'Canales' as const
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      icon: SiMercadopago,
      iconBg: store.mpConnected ? 'bg-sky-50 border-sky-100/60' : 'bg-zinc-50 border-zinc-150',
      iconColor: store.mpConnected ? 'text-[#00AEEF]' : 'text-zinc-400',
      desc: 'Procesa cobros dinámicos de tarjetas, efectivo y transferencias.',
      connected: store.mpConnected,
      detailKey: 'Clave Pública',
      detailVal: store.mpConnected ? (store.mpPublicKey ? `${store.mpPublicKey.slice(0, 15)}...` : 'Conectado') : 'Desconectado',
      type: 'Pasarelas' as const
    },
    {
      id: 'breb',
      name: 'Bre-B (SPI ACH)',
      icon: QrCode,
      iconBg: store.brebConnected ? 'bg-zinc-100 border border-zinc-200' : 'bg-zinc-50 border-zinc-150',
      iconColor: store.brebConnected ? 'text-zinc-800' : 'text-zinc-400',
      desc: 'Recibe pagos inmediatos interbancarios en Colombia mediante códigos QR estándar Bre-B.',
      connected: store.brebConnected,
      detailKey: 'Llave Bre-B',
      detailVal: store.brebConnected ? (store.brebKeyValue || 'Conectado') : 'Desconectado',
      type: 'Pasarelas' as const
    },
    {
      id: 'deepseek',
      name: 'DeepSeek Chat',
      icon: SiDeepseek,
      iconBg: 'bg-blue-50 border-blue-100/60',
      iconColor: 'text-[#0D6EFD]',
      desc: 'Modelo de IA en la nube utilizado por el bot de WhatsApp y Nova.',
      connected: true,
      detailKey: 'Estado de API',
      detailVal: 'Activo (Soporte Conversacional)',
      type: 'Modelos IA' as const
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Storage',
      icon: SiCloudflare,
      iconBg: 'bg-amber-50 border-amber-100/60',
      iconColor: 'text-[#F38020]',
      desc: 'Servicio de CDN y almacenamiento para imágenes de tus productos.',
      connected: true,
      detailKey: 'Proveedor',
      detailVal: 'Gestionado por la Plataforma',
      type: 'Infraestructura' as const
    }
  ]

  // Available integrations (Coming soon)
  const availableApps = [
    { id: 'stripe', name: 'Stripe Checkout', icon: SiStripe, iconColor: 'text-[#635BFF]', desc: 'Procesamiento de pagos globales con tarjeta.' },
    { id: 'shopify', name: 'Shopify Sync', icon: SiShopify, iconColor: 'text-[#96BF48]', desc: 'Sincroniza stock y productos desde tu catálogo.' },
    { id: 'woocommerce', name: 'WooCommerce Sync', icon: SiWoocommerce, iconColor: 'text-[#96588A]', desc: 'Vincula pedidos con tu tienda WordPress.' },
    { id: 'telegram', name: 'Telegram Bot', icon: SiTelegram, iconColor: 'text-[#24A1DE]', desc: 'Responde pedidos y chats desde canales.' },
    { id: 'facebook', name: 'Meta Messenger', icon: SiMeta, iconColor: 'text-[#1877F2]', desc: 'Sincroniza chats de Instagram y Facebook.' },
    { id: 'paypal', name: 'PayPal Portal', icon: SiPaypal, iconColor: 'text-[#003087]', desc: 'Procesamiento de cobros internacionales.' }
  ]

  const activeConnected = connectedApps.filter(app => {
    if (activeTab === 'Todas') return true
    if (activeTab === 'Conectadas') return app.connected
    return false
  })

  return (
    <div className="space-y-6 pb-6 animate-in duration-300 font-sans text-left select-none">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Integraciones</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            Conecta y gestiona las herramientas de tu negocio.
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6">
        {[
          { id: 'Todas', label: 'Todas', count: connectedApps.length + availableApps.length },
          { id: 'Conectadas', label: 'Conectadas', count: connectedApps.filter(a => a.connected).length },
          { id: 'Disponibles', label: 'Próximamente', count: availableApps.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id 
                ? 'border-zinc-900 text-zinc-900' 
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {tab.label}
            <span className={cn(
              "px-1.5 py-0.2 rounded text-[10px] font-extrabold",
              activeTab === tab.id ? "bg-zinc-100 border border-zinc-250 text-zinc-800" : "bg-zinc-100 text-zinc-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* LEFT COLUMN: Integrations grids (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section: Conectadas */}
          {activeTab !== 'Disponibles' && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-zinc-800  tracking-wider">Servicios Activos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeConnected.map((app) => {
                  const Icon = app.icon
                  return (
                    <div key={app.id} className="bg-white border border-zinc-200 rounded-lg p-5 hover:border-zinc-300 transition-all text-left flex flex-col justify-between min-h-[190px] relative">
                      
                      {app.connected && (
                        <div className={cn(
                          "absolute top-5 right-5",
                          app.id === 'whatsapp' ? "text-emerald-500" : "text-zinc-700"
                        )}>
                          <CheckCircle2 className="w-4.5 h-4.5 fill-current text-white stroke-2" />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 bg-white", app.iconBg)}>
                            <Icon className={cn("w-6 h-6", app.iconColor)} />
                          </div>
                          <div>
                            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-955 leading-tight">{app.name}</h3>
                            <span className={cn(
                              "inline-block px-1.5 py-0.2 text-[8.5px] font-black rounded-md mt-1 leading-none border",
                              app.connected 
                                ? (app.id === 'whatsapp' 
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                    : "bg-zinc-100 border-zinc-200 text-zinc-800")
                                : "bg-zinc-50 border-zinc-200 text-zinc-550"
                            )}>
                              {app.connected ? 'Conectado' : 'Desconectado'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] xl:text-xs font-semibold text-zinc-400 leading-relaxed">
                          {app.desc}
                        </p>
                      </div>

                      <div className="space-y-3.5 border-t border-zinc-100 pt-3.5 mt-2">
                        <div className="text-[10px] xl:text-xs">
                          <span className="font-semibold text-zinc-400 block tracking-wider ">{app.detailKey}</span>
                          <span className="font-extrabold text-zinc-900 mt-0.5 block truncate">{app.detailVal}</span>
                        </div>

                        {(app.id === 'whatsapp' || app.id === 'mercadopago' || app.id === 'breb') && (
                          <Link href="/configuracion" className="block w-full">
                            <button className="w-full py-1.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100/50 hover:border-zinc-300 text-zinc-800 rounded-lg text-xs font-extrabold transition-all cursor-pointer">
                              Configurar en Ajustes
                            </button>
                          </Link>
                        )}
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section: Próximamente */}
          {activeTab !== 'Conectadas' && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-zinc-800  tracking-wider">Integraciones Próximas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableApps.map((app) => {
                  const Icon = app.icon
                  return (
                    <div key={app.id} className="bg-white border border-zinc-200 rounded-lg p-5 opacity-70 flex flex-col justify-between min-h-[160px]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                            <Icon className={cn("w-5 h-5", app.iconColor)} />
                          </div>
                          <div>
                            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-900 leading-tight">{app.name}</h3>
                            <span className="inline-block px-1.5 py-0.2 bg-zinc-100 border border-zinc-200 text-zinc-500 text-[8.5px] font-black rounded-md mt-1 leading-none">
                              Próximamente
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] xl:text-xs font-semibold text-zinc-405 leading-relaxed">
                          {app.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Info SideCard (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800  tracking-wider">¿Cómo funcionan?</h3>
            <p className="text-xs font-semibold text-zinc-405 leading-relaxed text-left">
              Las integraciones conectan tu tienda Flashcheckouts con canales de mensajería (WhatsApp) y pasarelas de pago (Mercado Pago).
            </p>
            <div className="h-px w-full bg-zinc-100" />
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-zinc-800 font-semibold">
                <div className="w-5 h-5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                <p className="text-left leading-normal">Escanea tu QR de WhatsApp en la pestaña de Ajustes.</p>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-zinc-800 font-semibold">
                <div className="w-5 h-5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                <p className="text-left leading-normal">Vincula tus credenciales de Mercado Pago para pagos seguros en Smart Pay.</p>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-zinc-800 font-semibold">
                <div className="w-5 h-5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 font-bold text-[10px]">3</div>
                <p className="text-left leading-normal">Nova y el Chatbot comenzarán a atender a tus clientes de manera autónoma.</p>
              </div>
            </div>
            <div className="h-px w-full bg-zinc-100 pt-1" />
            <Link 
              href="/configuracion"
              className="text-xs font-bold text-[#6F42C1] hover:text-purple-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ir a Configuración</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
