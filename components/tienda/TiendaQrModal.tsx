'use client'

import React, { useState } from 'react'
import {
  X,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  QrCode,
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'

interface TiendaQrModalProps {
  isOpen: boolean
  onClose: () => void
  storeSlug?: string
  subdomain?: string
  storeName: string
  whatsappNumber?: string
}

export function TiendaQrModal({
  isOpen,
  onClose,
  storeSlug,
  subdomain,
  storeName,
  whatsappNumber,
}: TiendaQrModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const resolvedSlug = storeSlug || subdomain || ''
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://flashcheckout.co'
  const storeUrl = `${origin}/tienda/${resolvedSlug}`
  const cleanPhone = (whatsappNumber || '').replace(/\D/g, '')
  const whatsappTestUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`¡Hola! Vengo de ${storeName} (${storeUrl})`)}`
    : null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      toast.success('Enlace de la tienda copiado al portapapeles.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col text-center p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-zinc-800" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1 text-left">
          <h3 className="text-base font-black text-zinc-950 leading-tight">
            Prueba tu Tienda en tu Celular
          </h3>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Apunta con la cámara de tu smartphone para navegar y probar la experiencia de compra en vivo.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex flex-col items-center justify-center shadow-inner">
          <div className="p-3 bg-white rounded-xl shadow-xs border border-zinc-200/60">
            <QRCodeCanvas
              value={storeUrl}
              size={180}
              level="M"
              marginSize={1}
            />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
            <QrCode className="w-3.5 h-3.5 text-zinc-700" />
            <span>Escanea para abrir en Safari o Chrome</span>
          </div>
        </div>

        {/* Store URL bar */}
        <div className="flex items-center gap-2 bg-zinc-100/80 border border-zinc-200 rounded-xl p-1.5 pl-3">
          <span className="text-xs font-semibold text-zinc-700 truncate flex-1 text-left">
            {storeUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Extra Actions */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            <span>Abrir enlace</span>
          </a>
          {whatsappTestUrl && (
            <a
              href={whatsappTestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
