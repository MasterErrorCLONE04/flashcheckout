'use client'

import React from 'react'
import Link from 'next/link'
import {
  Globe,
  Check,
  Copy,
  Send,
  ExternalLink,
  Maximize2,
  QrCode,
  Store,
  Sparkles,
  Bot,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react'
import QrGenerator from '@/components/QrGenerator'

interface DashboardStoreOnlineCardProps {
  storeUrl: string
  storeName: string
  copied: boolean
  onCopyLink: () => void
  onOpenQrModal: () => void
}

const STUDIO_SHORTCUTS = [
  {
    href: '/tienda',
    title: 'Constructor de Tienda',
    desc: 'Bloques, colores, tipografía y diseño en vivo',
    icon: Store,
  },
  {
    href: '/studio-ia',
    title: 'Studio Creativo IA',
    desc: 'Fotos de producto, escenas y comerciales de video',
    icon: Sparkles,
  },
  {
    href: '/agente',
    title: 'Agente IA & Flujos',
    desc: 'Personalidad del bot, simulador y automatizaciones',
    icon: Bot,
  },
  {
    href: '/conversaciones',
    title: 'CRM Conversaciones',
    desc: 'Bandeja en vivo de WhatsApp, notas y links de pago',
    icon: MessageSquare,
  },
]

export function DashboardStoreOnlineCard({
  storeUrl,
  storeName,
  copied,
  onCopyLink,
  onOpenQrModal,
}: DashboardStoreOnlineCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT (6 COLS): Enlace & Código QR de la Tienda Pública */}
      <div className="lg:col-span-6 p-5 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-stretch gap-5 justify-between shadow-2xs">
        <div className="flex-1 flex flex-col justify-between min-w-0 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                  Tu Tienda Online Pública
                </h4>
                <p className="text-[10.5px] text-zinc-400 font-medium">
                  Catálogo web sincronizado con tu inventario y pagos
                </p>
              </div>
            </div>

            <div className="mt-3 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 font-mono font-semibold text-xs truncate select-all">
              {storeUrl}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={onCopyLink}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar link'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: storeName,
                      text: `Visita nuestra tienda oficial ${storeName}`,
                      url: storeUrl,
                    })
                    .catch(console.error)
                } else {
                  onCopyLink()
                }
              }}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compartir</span>
            </button>

            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir</span>
            </a>
          </div>
        </div>

        {/* QR Code Box */}
        <div className="w-full sm:w-32 shrink-0 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200/80 p-3 rounded-xl gap-2">
          <div
            className="group/qr w-24 h-24 bg-white border border-zinc-200 rounded-xl flex items-center justify-center p-1 cursor-pointer relative overflow-hidden active:scale-95 transition-all"
            onClick={onOpenQrModal}
            title="Ampliar y descargar código QR"
          >
            <QrGenerator url={storeUrl} storeName={storeName} inline={true} size={80} />
            <div className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 rounded-xl">
              <Maximize2 className="w-4 h-4 text-white" />
              <span className="text-[8px] font-extrabold text-white uppercase tracking-wider">
                Ampliar
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenQrModal}
            className="text-[9.5px] font-bold text-zinc-600 hover:text-zinc-950 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <QrCode className="w-3 h-3 text-zinc-500" />
            <span>Descargar QR</span>
          </button>
        </div>
      </div>

      {/* RIGHT (6 COLS): Accesos Directos a los Estudios */}
      <div className="lg:col-span-6 p-5 bg-white border border-zinc-200 rounded-2xl flex flex-col justify-between shadow-2xs text-left">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              Estudios de Trabajo
            </h4>
            <p className="text-[10.5px] text-zinc-400 font-medium">
              Herramientas creativas y operativas de tu comercio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {STUDIO_SHORTCUTS.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group p-3 rounded-xl border border-zinc-200 hover:border-zinc-950 bg-zinc-50/50 hover:bg-white transition-all flex items-start justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-zinc-950 group-hover:text-white text-zinc-800 border border-zinc-200 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-950 block truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium leading-tight block line-clamp-1 mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950 shrink-0 mt-0.5 transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
