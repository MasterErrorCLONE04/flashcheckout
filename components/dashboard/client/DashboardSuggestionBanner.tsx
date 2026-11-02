'use client'

import React from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Settings,
  Phone,
  X,
} from 'lucide-react'

interface DashboardSuggestionBannerProps {
  show: boolean
  onClose: () => void
  whatsappConnected: boolean
  onConnectWhatsApp: () => void
}

export function DashboardSuggestionBanner({
  show,
  onClose,
  whatsappConnected,
  onConnectWhatsApp,
}: DashboardSuggestionBannerProps) {
  if (!show) return null

  if (whatsappConnected) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative animate-in fade-in duration-200">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
            <Sparkles className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-zinc-800 block">Sugerencia para ti</span>
            <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Comparte el enlace de tu tienda en Instagram y redes sociales para aumentar tus pedidos autónomos.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <Link 
            href="/configuracion"
            className="h-8 px-3.5 bg-zinc-900 hover:bg-zinc-950 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configuración</span>
          </Link>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative animate-in fade-in duration-200">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
          <Sparkles className="w-4 h-4 text-zinc-500" />
        </div>
        <div className="text-left">
          <span className="text-xs font-bold text-zinc-800 block">Sugerencia para ti</span>
          <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Conecta tu WhatsApp Business para no perder mensajes de clientes potenciales.</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
        <button 
          onClick={onConnectWhatsApp}
          className="h-8 px-3.5 bg-zinc-900 hover:bg-zinc-950 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Conectar WhatsApp</span>
        </button>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
