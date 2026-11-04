'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FloatingWhatsAppButtonProps {
  enabled?: boolean
  whatsapp?: string | null
  storeName?: string
  showSection?: boolean
  device?: string
}

export function FloatingWhatsAppButton({
  enabled = true,
  whatsapp,
  storeName,
  showSection = true,
  device,
}: FloatingWhatsAppButtonProps) {
  if (!showSection || !enabled || !whatsapp) return null

  const cleanPhone = whatsapp.replace(/\D/g, '')
  const message = encodeURIComponent(`¡Hola ${storeName || ''}! 👋 Vengo de su tienda web y me gustaría recibir asesoría con mi pedido.`)

  return (
    <div
      className={cn(
        'z-30 select-none animate-in fade-in slide-in-from-bottom-4 duration-500',
        device ? 'absolute bottom-4 right-4' : 'fixed bottom-6 right-6'
      )}
    >
      <a
        href={`https://wa.me/${cleanPhone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear con un asesor por WhatsApp"
        className="group relative flex items-center gap-2.5 h-11 pl-3.5 pr-4 rounded-full bg-[#111111] hover:bg-[#27272A] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all active:scale-95 no-underline border border-black/10"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366]" />
        </div>
        <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-white leading-none">
          ¿Dudas? Chatea aquí
        </span>
      </a>
    </div>
  )
}
