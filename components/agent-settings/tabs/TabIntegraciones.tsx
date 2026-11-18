'use client'

import React from 'react'
import Link from 'next/link'
import { Bot, CheckCircle2, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabIntegracionesProps {
  storeId: string
  whatsappConnected?: boolean
  mpConnected?: boolean
  stripeConnected?: boolean
}

export function TabIntegraciones({
  storeId,
  whatsappConnected = false,
  mpConnected = false,
  stripeConnected = false,
}: TabIntegracionesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in">
      {/* WhatsApp Integration card */}
      <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center border',
                whatsappConnected
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200'
              )}
            >
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 leading-none">
                WhatsApp Business / Evolution
              </h4>
              <span
                className={cn(
                  'text-[10px] font-bold block mt-1',
                  whatsappConnected ? 'text-emerald-600' : 'text-amber-600'
                )}
              >
                {whatsappConnected ? '● Conectado y Activo' : '○ Pendiente de vincular QR'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
            Canal bidireccional para responder chats con IA, enviar carritos y disparar automatizaciones.
          </p>

          <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-semibold text-zinc-500">
            Instancia: <span className="text-zinc-900 font-mono">store_{storeId.slice(0, 8)}</span>
          </div>
        </div>

        <Link
          href="/integraciones"
          className="w-full text-center py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all"
        >
          {whatsappConnected ? 'Gestionar WhatsApp' : 'Vincular WhatsApp QR'}
        </Link>
      </div>

      {/* Mercado Pago card */}
      <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center border',
                mpConnected
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200'
              )}
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 leading-none">
                Pasarela Mercado Pago
              </h4>
              <span
                className={cn(
                  'text-[10px] font-bold block mt-1',
                  mpConnected ? 'text-blue-600' : 'text-zinc-400'
                )}
              >
                {mpConnected ? '● OAuth Conectado' : '○ Sin conectar'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
            Genera links de pago locales automáticamente y dispara la automatización de Pedido Pagado.
          </p>
        </div>

        <Link
          href="/configuracion?tab=pagos"
          className="w-full text-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-bold transition-all"
        >
          Configurar Mercado Pago
        </Link>
      </div>

      {/* Stripe Connect card */}
      <div className="p-5 bg-white border border-zinc-200 rounded-xl space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center border',
                stripeConnected
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200'
              )}
            >
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950 leading-none">
                Stripe & Bre-B QR
              </h4>
              <span
                className={cn(
                  'text-[10px] font-bold block mt-1',
                  stripeConnected ? 'text-emerald-600' : 'text-zinc-500'
                )}
              >
                {stripeConnected ? '● Cobros con Tarjeta Activos' : '● Bre-B / Transferencias'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
            Cobros internacionales con tarjeta o transferencias inmediatas con QR EMVCo Bre-B.
          </p>
        </div>

        <Link
          href="/configuracion?tab=pagos"
          className="w-full text-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-bold transition-all"
        >
          Configurar Métodos de Pago
        </Link>
      </div>
    </div>
  )
}
