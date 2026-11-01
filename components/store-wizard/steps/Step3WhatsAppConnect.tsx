'use client'

import React from 'react'
import {
  Smartphone,
  Loader2,
  CheckCircle2,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StoreWizardState } from '../useStoreWizardState'

interface Step3WhatsAppConnectProps {
  wizard: StoreWizardState
}

export function Step3WhatsAppConnect({ wizard }: Step3WhatsAppConnectProps) {
  const {
    whatsappStatus,
    qrCodeBase64,
    qrExpiresIn,
    formatTime,
    triggerWhatsappConnect
  } = wizard

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
          Conecta tu WhatsApp
          <Smartphone className="w-5 h-5 text-emerald-600" />
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Escanea el código QR con WhatsApp Business para activar las respuestas automáticas de Nova.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-1">
        
        {/* Left QR Container */}
        <div className="border border-zinc-200/90 rounded-2xl p-5 bg-white flex flex-col justify-between items-center text-center gap-4">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-zinc-50 border border-zinc-200/70 select-none">
            <div className={cn(
              "w-2 h-2 rounded-full",
              whatsappStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
            )} />
            <span>{whatsappStatus === 'CONNECTED' ? 'Conectado con éxito' : 'Esperando vinculación'}</span>
          </div>

          {/* QR Display */}
          <div className="w-48 h-48 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
            {whatsappStatus === 'LOADING' ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-zinc-950" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Generando QR...</span>
              </div>
            ) : whatsappStatus === 'QRCODE' && qrCodeBase64 ? (
              <img 
                src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                alt="QR de conexión" 
                className="w-full h-full object-contain"
              />
            ) : whatsappStatus === 'CONNECTED' ? (
              <div className="flex flex-col items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 stroke-[2.5px]" />
                <span className="text-xs font-bold">¡WhatsApp Vinculado!</span>
              </div>
            ) : (
              <button 
                onClick={triggerWhatsappConnect}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl px-4 py-2.5 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                Generar código QR
              </button>
            )}
          </div>

          {/* Timer or Refresh */}
          {whatsappStatus === 'QRCODE' && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-600">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Expira en {formatTime(qrExpiresIn)}</span>
              <button 
                onClick={triggerWhatsappConnect}
                className="text-zinc-400 hover:text-zinc-900 ml-1 cursor-pointer" 
                title="Regenerar QR"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Instruction Steps */}
        <div className="border border-zinc-200/90 rounded-2xl p-5 bg-zinc-50/50 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Pasos para escanear:
            </h4>

            <div className="space-y-2.5">
              {[
                "Abre WhatsApp o WhatsApp Business en tu celular.",
                "Entra a Configuración > Dispositivos vinculados.",
                "Toca en 'Vincular un dispositivo' y apunta la cámara a la pantalla."
              ].map((txt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-semibold leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-white border border-zinc-200 text-zinc-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white border border-zinc-200/80 rounded-xl text-[11px] text-zinc-500 font-medium">
            💡 ¿No tienes tu celular a mano? Puedes continuar y conectar tu número más tarde desde la sección de Configuración.
          </div>
        </div>
      </div>
    </div>
  )
}
