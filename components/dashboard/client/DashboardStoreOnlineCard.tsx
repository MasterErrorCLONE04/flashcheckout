'use client'

import React from 'react'
import {
  Globe,
  Check,
  Copy,
  Send,
  ExternalLink,
  Maximize2,
  QrCode,
} from 'lucide-react'
import QrGenerator from '@/components/QrGenerator'

interface DashboardStoreOnlineCardProps {
  storeUrl: string
  storeName: string
  copied: boolean
  onCopyLink: () => void
  onOpenQrModal: () => void
}

export function DashboardStoreOnlineCard({
  storeUrl,
  storeName,
  copied,
  onCopyLink,
  onOpenQrModal,
}: DashboardStoreOnlineCardProps) {
  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col sm:flex-row items-stretch gap-6 justify-between">
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-800 font-semibold text-sm">
            <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-650 flex items-center justify-center shrink-0 border border-zinc-200">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span>Tu tienda online</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">Este es el enlace directo a tu catálogo inteligente para recibir pedidos autónomos.</p>
          <div className="text-zinc-600 font-medium text-xs pt-2 truncate select-all">{storeUrl}</div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={onCopyLink}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: storeName,
                  text: `Visita mi tienda en Flashcheckouts`,
                  url: storeUrl
                }).catch(console.error)
              } else {
                onCopyLink()
              }
            }}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>

          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver tienda</span>
          </a>
        </div>
      </div>

      <div className="w-full sm:w-32 flex-shrink-0 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100 p-3 rounded-lg gap-2">
        <div 
          className="group/qr w-24 h-24 bg-white border border-zinc-200 rounded-lg flex items-center justify-center p-1 cursor-pointer relative overflow-hidden active:scale-[0.97] transition-all duration-300"
          onClick={onOpenQrModal}
          title="Ampliar y descargar código QR"
        >
          <QrGenerator url={storeUrl} storeName={storeName} inline={true} size={80} />

          {/* Modern Hover Overlay */}
          <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 rounded-lg">
            <Maximize2 className="w-4 h-4 text-white animate-bounce" />
            <span className="text-[8px] font-extrabold text-white uppercase tracking-wider">Ampliar</span>
          </div>
        </div>
        <button 
          onClick={onOpenQrModal}
          className="text-[9px] font-bold text-zinc-500 hover:text-zinc-800 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5 text-zinc-400" />
          <span>Ver Código QR</span>
        </button>
      </div>
    </div>
  )
}
