'use client'

import React from 'react'
import { SiWhatsapp } from 'react-icons/si'
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
  if (!showSection || !enabled) return null

  const cleanPhone = (whatsapp || '').replace(/\D/g, '')
  const message = encodeURIComponent(
    `¡Hola ${storeName || ''}! 👋 Vengo de su tienda web y me gustaría recibir asesoría con mi pedido.`
  )

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
        href={cleanPhone ? `https://wa.me/${cleanPhone}?text=${message}` : '#whatsapp'}
        target={cleanPhone ? '_blank' : undefined}
        rel={cleanPhone ? 'noopener noreferrer' : undefined}
        aria-label="Chatear con un asesor por WhatsApp"
        className={cn(
          'pointer-events-auto group relative flex items-center gap-2.5 rounded-full bg-[#111111] hover:bg-[#1f1f22] text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all active:scale-95 no-underline border border-white/10',
          isCompactDevice ? 'h-9.5 pl-2.5 pr-3.5' : 'h-11 pl-3 pr-4'
        )}
      >
        <div className="relative w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-xs">
          <SiWhatsapp className="w-3.5 h-3.5 text-white fill-current" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#25D366] ring-2 ring-[#111111]" />
        </div>
        <span
          className={cn(
            'font-bold tracking-[0.05em] uppercase text-white leading-none',
            isCompactDevice ? 'text-[10px]' : 'text-[11px]'
          )}
        >
          {isCompactDevice ? 'WhatsApp' : '¿Dudas? Chatea aquí'}
        </span>
      </a>
    </div>
  )
}
