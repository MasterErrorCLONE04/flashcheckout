'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'

export interface FloatingWhatsAppButtonProps {
  enabled?: boolean
  whatsapp?: string | null
  storeName?: string
  showSection?: boolean
}

export function FloatingWhatsAppButton({
  enabled = true,
  whatsapp,
  storeName,
  showSection = true
}: FloatingWhatsAppButtonProps) {
  if (!showSection || !enabled || !whatsapp) return null

  const cleanPhone = whatsapp.replace(/\D/g, '')
  const message = encodeURIComponent(`¡Hola ${storeName || ''}! 👋 Vengo de su tienda web y me gustaría recibir asesoría con mi pedido.`)

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
      <a
        href={`https://wa.me/${cleanPhone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white pl-3.5 pr-4.5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.38)] hover:shadow-[0_12px_36px_rgb(16,185,129,0.5)] transition-all active:scale-95 no-underline border border-emerald-400/40"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-600 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-200 border-2 border-emerald-600" />
        </div>
        <div className="text-left leading-tight hidden sm:block">
          <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider block">¿Dudas con tu compra?</span>
          <span className="text-xs font-black text-white">Chatea con un asesor</span>
        </div>
      </a>
    </div>
  )
}
