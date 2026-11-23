'use client'

import React from 'react'
import { QrCode, RefreshCw, Loader2, ShieldCheck } from 'lucide-react'

interface WhatsAppConnectCardProps {
  loadingQr: boolean
  qrCodeBase64: string | null
  onRegenerateQr: () => Promise<void>
}

export function WhatsAppConnectCard({
  loadingQr,
  qrCodeBase64,
  onRegenerateQr,
}: WhatsAppConnectCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 text-center select-none shadow-xs">
      <div className="space-y-1.5">
        <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center mx-auto">
          <QrCode className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-black text-zinc-950 tracking-tight">
          Vincular WhatsApp Business
        </h3>
        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
          Escanea el código QR desde tu teléfono en <strong>WhatsApp → Dispositivos vinculados</strong> para recibir y responder conversaciones reales en tiempo real.
        </p>
      </div>

      {/* Contenedor del Código QR */}
      <div className="w-56 h-56 mx-auto rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center p-4">
        {loadingQr ? (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <Loader2 className="w-7 h-7 animate-spin text-zinc-950" />
            <span className="text-[11px] font-bold text-zinc-700">
              Generando código QR...
            </span>
          </div>
        ) : qrCodeBase64 ? (
          <img
            src={qrCodeBase64}
            alt="Código QR de WhatsApp"
            className="w-full h-full object-contain rounded-lg bg-white p-1"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <QrCode className="w-8 h-8 text-zinc-300" />
            <span className="text-[11px] font-semibold text-zinc-500">
              Haz clic abajo para generar el QR
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={loadingQr}
        onClick={onRegenerateQr}
        className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loadingQr ? 'animate-spin' : ''}`} />
        <span>{qrCodeBase64 ? 'Actualizar código QR' : 'Generar código QR'}</span>
      </button>

      <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-zinc-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Conexión cifrada de extremo a extremo</span>
      </div>
    </div>
  )
}
