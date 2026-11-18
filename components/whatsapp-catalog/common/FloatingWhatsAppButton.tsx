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

  const isCompactDevice = device === 'movil' || device === 'tablet'

  return (
    <div
      data-maker-section="whatsapp"
      className={cn(
        'z-30 select-none animate-in fade-in slide-in-from-bottom-4 duration-500',
        isCompactDevice
          ? 'sticky bottom-20 flex justify-end px-3.5 pb-1 pointer-events-none'
          : device
            ? 'sticky bottom-5 flex justify-end px-6 pb-2 pointer-events-none'
            : 'fixed bottom-20 lg:bottom-6 right-4 lg:right-6'
      )}
    >
      <a
        href={`https://wa.me/${cleanPhone}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear con un asesor por WhatsApp"
        className={cn(
          'pointer-events-auto group relative flex items-center gap-2 rounded-full bg-[#111111] hover:bg-[#27272A] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all active:scale-95 no-underline border border-white/10',
          isCompactDevice ? 'h-9.5 pl-3 pr-3.5' : 'h-11 pl-3.5 pr-4'
        )}
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366] animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366]" />
        </div>
        <span className={cn('font-bold tracking-[0.05em] uppercase text-white leading-none', isCompactDevice ? 'text-[10px]' : 'text-[11px]')}>
          {isCompactDevice ? 'WhatsApp' : '¿Dudas? Chatea aquí'}
        </span>
      </a>
    </div>
  )
}
