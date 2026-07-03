"use client"

import { useState } from 'react'
import { 
  Download, 
  Plus, 
  CheckCircle2, 
  MoreHorizontal, 
  ChevronDown, 
  Bot, 
  Check, 
  MessageCircle,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight
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

interface ConnectedApp {
  id: string
  name: string
  icon: any
  iconBg: string
  iconColor: string
  desc: string
  detailKey: string
  detailVal: string
  type: 'Pasarelas' | 'Canales' | 'Modelos IA' | 'Infraestructura'
}

interface AvailableApp {
  id: string
  name: string
  icon: any
  iconColor: string
  desc: string
}

export default function IntegracionesPage() {
  const [activeTab, setActiveTab] = useState<'Todas' | 'Conectadas' | 'Disponibles'>('Todas')
  const [connectedList, setConnectedList] = useState<ConnectedApp[]>([
    { id: 'whatsapp', name: 'WhatsApp (Evolution API)', icon: SiWhatsapp, iconBg: 'bg-emerald-50 border-emerald-100/60', iconColor: 'text-[#25D366]', desc: 'Recibe y gestiona mensajes de WhatsApp Business.', detailKey: 'Número conectado', detailVal: '+57 300 123 4567', type: 'Canales' },
    { id: 'mercadopago', name: 'Mercado Pago', icon: SiMercadopago, iconBg: 'bg-sky-50 border-sky-100/60', iconColor: 'text-[#00AEEF]', desc: 'Procesa pagos y recibe notificaciones de tus cobros.', detailKey: 'Cuenta', detailVal: 'juan@cafedelvalle.com', type: 'Pasarelas' },
    { id: 'gemini', name: 'Google Gemini', icon: SiGooglegemini, iconBg: 'bg-indigo-50 border-indigo-100/60', iconColor: 'text-[#8E75C2]', desc: 'Modelo de IA utilizado por Nova para conversaciones.', detailKey: 'Modelo', detailVal: 'gemini-1.5-pro', type: 'Modelos IA' },
    { id: 'deepseek', name: 'DeepSeek', icon: SiDeepseek, iconBg: 'bg-blue-50 border-blue-100/60', iconColor: 'text-[#0D6EFD]', desc: 'Modelo de IA alternativo para respuesta avanzada.', detailKey: 'Modelo', detailVal: 'deepseek-chat', type: 'Modelos IA' },
    { id: 'cloudflare', name: 'Cloudflare R2', icon: SiCloudflare, iconBg: 'bg-amber-50 border-amber-100/60', iconColor: 'text-[#F38020]', desc: 'Almacenamiento de archivos e imágenes de tu tienda.', detailKey: 'Bucket', detailVal: 'cafedelvalle-assets', type: 'Infraestructura' },
    { id: 'sendgrid', name: 'Mailgun', icon: SiMailgun, iconBg: 'bg-red-50 border-red-100/60', iconColor: 'text-[#E63946]', desc: 'Envía correos de confirmaciones y notificaciones.', detailKey: 'Cuenta', detailVal: 'juan@cafedelvalle.com', type: 'Infraestructura' },
  ])

  const [availableList, setAvailableList] = useState<AvailableApp[]>([
    { id: 'stripe', name: 'Stripe', icon: SiStripe, iconColor: 'text-[#635BFF]', desc: 'Procesa pagos con tarjetas de crédito y débito.' },
    { id: 'shopify', name: 'Shopify', icon: SiShopify, iconColor: 'text-[#96BF48]', desc: 'Sincroniza stock, y pedidos desde tu tienda.' },
    { id: 'woocommerce', name: 'WooCommerce', icon: SiWoocommerce, iconColor: 'text-[#96588A]', desc: 'Sincroniza productos, y pedidos desde tu tienda.' },
    { id: 'twilio', name: 'Telegram', icon: SiTelegram, iconColor: 'text-[#24A1DE]', desc: 'Envía notificaciones y mensajes a tus clientes.' },
    { id: 'facebook', name: 'Facebook e Instagram', icon: SiMeta, iconColor: 'text-[#1877F2]', desc: 'Responde mensajes y comentarios desde tus redes sociales.' },
    { id: 'wompi', name: 'PayPal', icon: SiPaypal, iconColor: 'text-[#003087]', desc: 'Recibe pagos con PayPal de manera segura.' },
  ])

  // Count metrics
  const totalCount = connectedList.length + availableList.length
  const connectedCount = connectedList.length
  const availableCount = availableList.length

  // Move an app from available to connected (Simulation)
  const handleConnect = (app: AvailableApp) => {
    const newConnected: ConnectedApp = {
      id: app.id,
      name: app.name,
      icon: app.icon,
      iconBg: 'bg-zinc-50 border-zinc-200/80',
      iconColor: app.iconColor,
      desc: app.desc,
      detailKey: 'Estado',
      detailVal: 'Sincronizado',
      type: 'Pasarelas'
    }
    setConnectedList(prev => [...prev, newConnected])
    setAvailableList(prev => prev.filter(a => a.id !== app.id))
  }

  // Handle configure click
  const handleConfigure = (name: string) => {
    alert(`Abriendo panel de configuración de ${name} 🚀`)
  }

  return (
    <div className="space-y-6 pb-6 animate-in duration-300 font-sans text-left">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-955">Integraciones</h1>
          <p className="text-xs xl:text-sm font-semibold text-zinc-400">Conecta y gestiona las herramientas de tu negocio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs xl:text-sm font-bold rounded-lg transition-all cursor-pointer select-none">
            <Download className="w-4 h-4 text-zinc-450" />
            Exportar
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-sm active:scale-98 cursor-pointer select-none">
            <Plus className="w-4 h-4" />
            Añadir integración
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6">
        {[
          { id: 'Todas', label: 'Todas', count: totalCount },
          { id: 'Conectadas', label: 'Conectadas', count: connectedCount },
          { id: 'Disponibles', label: 'Disponibles', count: availableCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-800' 
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {tab.label}
            <span className={cn(
              "px-1.5 py-0.2 rounded text-[10px] font-extrabold",
              activeTab === tab.id ? "bg-emerald-50 border border-emerald-100 text-emerald-850" : "bg-zinc-100 text-zinc-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Integrations cards (8/12) and Sidebar metrics (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        
        {/* LEFT COLUMN: Connected & Available grids (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section: Conectadas */}
          {(activeTab === 'Todas' || activeTab === 'Conectadas') && (
            <div className="space-y-4">
              <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Conectadas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {connectedList.map((app) => {
                  const Icon = app.icon
                  return (
                    <div key={app.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 hover:shadow-sm transition-all text-left flex flex-col justify-between min-h-[190px] relative group">
                      
                      {/* Check dot in top right */}
                      <div className="absolute top-5 right-5 text-emerald-500 select-none">
                        <CheckCircle2 className="w-4.5 h-4.5 fill-current text-white stroke-2" />
                      </div>

                      <div className="space-y-3">
                        {/* App header logo and badge */}
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 bg-white", app.iconBg)}>
                            <Icon className={cn("w-6 h-6", app.iconColor)} />
                          </div>
                          <div>
                            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-955 leading-tight">{app.name}</h3>
                            <span className="inline-block px-1.5 py-0.2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8.5px] font-black rounded-md mt-1 leading-none">
                              Conectado
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] xl:text-xs font-semibold text-zinc-400 leading-relaxed">
                          {app.desc}
                        </p>
                      </div>

                      {/* Details & Action controls */}
                      <div className="space-y-3.5 border-t border-zinc-100 pt-3.5 mt-2">
                        <div className="text-[10px] xl:text-xs">
                          <span className="font-semibold text-zinc-400 block tracking-wider uppercase">{app.detailKey}</span>
                          <span className="font-extrabold text-zinc-900 mt-0.5 block truncate">{app.detailVal}</span>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleConfigure(app.name)}
                            className="flex-1 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] xl:text-xs font-bold rounded-lg transition-all cursor-pointer select-none"
                          >
                            Configurar
                          </button>
                          <button className="p-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section: Disponibles */}
          {(activeTab === 'Todas' || activeTab === 'Disponibles') && (
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">Disponibles</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {availableList.map((app) => {
                  const Icon = app.icon
                  return (
                    <div key={app.id} className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 hover:shadow-sm transition-all text-center flex flex-col justify-between min-h-[160px]">
                      
                      <div className="space-y-2.5">
                        {/* Centered logo */}
                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center mx-auto shrink-0 shadow-sm">
                          <Icon className={cn("w-6 h-6", app.iconColor)} />
                        </div>
                        
                        <div>
                          <h4 className="text-[11px] xl:text-xs font-black text-zinc-955 leading-tight">{app.name}</h4>
                          <p className="text-[9px] xl:text-[10px] font-semibold text-zinc-400 mt-1 leading-normal max-w-[100px] mx-auto">
                            {app.desc}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleConnect(app)}
                        className="w-full mt-3 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-[10px] xl:text-xs font-bold rounded-lg transition-all cursor-pointer select-none active:scale-[0.98]"
                      >
                        Conectar
                      </button>

                    </div>
                  )
                })}
              </div>

              {availableList.length > 0 && (
                <div className="pt-2 text-center select-none">
                  <button className="inline-flex items-center gap-1 text-[11px] xl:text-xs font-bold text-zinc-450 hover:text-zinc-700 cursor-pointer">
                    Ver más integraciones disponibles
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sidebar metrics (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Estado de integraciones */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-5 shadow-sm">
            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Estado de integraciones</h3>

            <div className="flex items-center gap-6">
              {/* Doughnut Chart */}
              <div className="relative w-28 h-28 shrink-0 select-none">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F4F4F5" strokeWidth="11" />
                  
                  {/* Segment 1: Conectadas (7/13) -> 53.8% -> offset: (1-0.538)*251.3 = 116.1 */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#22C55E" 
                    strokeWidth="11" 
                    strokeDasharray="251.327" 
                    strokeDashoffset="116.1"
                  />
                  
                  {/* Segment 2: Disponibles (6/13) -> 46.2% -> offset: 251.3 - 116.1 = 135.2 */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#6F42C1" 
                    strokeWidth="11" 
                    strokeDasharray="251.327" 
                    strokeDashoffset="135.2"
                    className="origin-center rotate-[193.7deg]" // 53.8% * 360 = 193.7deg
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                  <span className="text-sm font-black text-zinc-955 leading-none">{totalCount}</span>
                  <span className="text-[9px] font-semibold text-zinc-400 mt-1 uppercase tracking-tight">Total</span>
                </div>
              </div>

              {/* Legend details */}
              <div className="flex-1 space-y-2 text-xs font-semibold text-zinc-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
                    <span className="truncate text-zinc-650">Conectadas</span>
                  </div>
                  <span className="text-zinc-950 font-black ml-2">{connectedCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6F42C1] shrink-0" />
                    <span className="truncate text-zinc-650">Disponibles</span>
                  </div>
                  <span className="text-zinc-955 font-black ml-2">{availableCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="truncate text-zinc-650">Desconectadas</span>
                  </div>
                  <span className="text-zinc-950 font-black ml-2">0</span>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Actividad reciente */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Actividad reciente</h3>
              <button className="text-[10px] font-bold text-emerald-650 hover:underline cursor-pointer select-none">Ver todo</button>
            </div>

            <div className="space-y-4">
              {[
                { title: 'WhatsApp reconectado', time: 'Hoy, 10:45 a. m.', icon: SiWhatsapp, color: 'border-emerald-100/60 text-[#25D366]' },
                { title: 'Pago recibido', time: 'Hoy, 10:32 a. m.', icon: SiMercadopago, color: 'border-sky-100/60 text-[#00AEEF]' },
                { title: 'Correo enviado', time: 'Hoy, 9:15 a. m.', icon: SiMailgun, color: 'border-red-100/60 text-[#E63946]' },
                { title: 'Imagen subida a R2', time: 'Ayer, 6:20 p. m.', icon: SiCloudflare, color: 'border-amber-100/60 text-[#F38020]' }
              ].map((item, idx) => {
                const ActIcon = item.icon
                return (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border bg-white")}>
                        <ActIcon className={cn("w-4.5 h-4.5", item.color.split(' ')[1])} />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-zinc-900 leading-tight truncate text-[11px] xl:text-xs">{item.title}</h5>
                        <span className="text-[10px] font-semibold text-zinc-400 mt-0.5 block leading-none">{item.time}</span>
                      </div>
                    </div>
                    <span className="text-emerald-600 shrink-0 ml-2 select-none">
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 3: Nova help box */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <h4 className="text-xs xl:text-sm font-black text-zinc-955 tracking-tight leading-tight">¿Necesitas ayuda?</h4>
                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 leading-relaxed">Nova puede ayudarte a conectar cualquier herramienta.</p>
              </div>
              <div className="shrink-0 select-none">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Bot className="w-7 h-7" />
                </div>
              </div>
            </div>

            <Link href="/hablar-con-nova" className="w-full select-none">
              <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all">
                <MessageCircle className="w-4.5 h-4.5 fill-current" />
                Hablar con Nova
              </button>
            </Link>
          </div>

        </div>

      </div>

    </div>
  )
}
