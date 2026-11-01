'use client'

import React from 'react'
import { CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StoreWizardState } from '../useStoreWizardState'

interface Step5PaymentsProps {
  wizard: StoreWizardState
}

export function Step5Payments({ wizard }: Step5PaymentsProps) {
  const { payments, setPayments } = wizard

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          Métodos de pago
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Configura cómo tus clientes transferirán el dinero de sus compras en WhatsApp.
        </p>
      </div>

      <div className="space-y-3.5 pt-1">
        {/* Manual Payment Option */}
        <label className={cn(
          "flex items-start gap-3.5 p-4 border rounded-2xl transition-all cursor-pointer",
          payments.manual 
            ? "bg-white border-zinc-950 ring-1 ring-zinc-950/10 shadow-xs" 
            : "bg-white border-zinc-200/80 hover:bg-zinc-50"
        )}>
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 text-zinc-950 border-zinc-300 rounded focus:ring-0 cursor-pointer"
            checked={payments.manual}
            onChange={e => setPayments(p => ({ ...p, manual: e.target.checked }))}
          />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                Transferencia Directa (Nequi / Daviplata / Bancolombia)
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Recomendado
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              Tus compradores envían la captura del comprobante por WhatsApp y podrás auditarlo y confirmarlo fácilmente con un clic desde el panel.
            </p>
          </div>
        </label>

        {/* Mercado Pago Option */}
        <label className={cn(
          "flex items-start gap-3.5 p-4 border rounded-2xl transition-all cursor-pointer",
          payments.mercadopago 
            ? "bg-white border-zinc-950 ring-1 ring-zinc-950/10 shadow-xs" 
            : "bg-white border-zinc-200/80 hover:bg-zinc-50"
        )}>
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 text-zinc-950 border-zinc-300 rounded focus:ring-0 cursor-pointer"
            checked={payments.mercadopago}
            onChange={e => setPayments(p => ({ ...p, mercadopago: e.target.checked }))}
          />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                Mercado Pago Connect
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
              </span>
              <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Tarjetas & PSE
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              Cobra con tarjetas de crédito, débito, PSE y puntos de pago en efectivo. Podrás vincular tu cuenta oficial de Mercado Pago en cualquier momento.
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
