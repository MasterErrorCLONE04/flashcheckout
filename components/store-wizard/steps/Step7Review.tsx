'use client'

import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StoreWizardState } from '../useStoreWizardState'

interface Step7ReviewProps {
  wizard: StoreWizardState
}

export function Step7Review({ wizard }: Step7ReviewProps) {
  const {
    storeForm,
    whatsappStatus,
    addedProducts,
    payments,
    businessProfile
  } = wizard

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          Revisa y confirma
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Verifica los datos de tu nueva tienda antes de ponerla en producción.
        </p>
      </div>

      <div className="border border-zinc-200/90 rounded-2xl bg-zinc-50/50 p-5 space-y-3 text-xs font-semibold text-zinc-700">
        <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
          <span className="text-zinc-500">Nombre de la Tienda</span>
          <span className="font-bold text-zinc-950">{storeForm.name || 'Sin especificar'}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
          <span className="text-zinc-500">Enlace público</span>
          <span className="font-bold text-zinc-950 bg-white border border-zinc-200 px-2 py-0.5 rounded-lg text-[11px]">
            flash.checkout/tienda/{storeForm.slug}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
          <span className="text-zinc-500">Estado de WhatsApp</span>
          <span className={cn(
            "font-bold px-2 py-0.5 rounded-full text-[10px]",
            whatsappStatus === 'CONNECTED' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          )}>
            {whatsappStatus === 'CONNECTED' ? 'Conectado ✓' : 'Pendiente de escaneo'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
          <span className="text-zinc-500">Productos en Catálogo</span>
          <span className="font-bold text-zinc-950">{addedProducts.length} productos registrados</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
          <span className="text-zinc-500">Cobranza</span>
          <span className="font-bold text-zinc-950">
            {[payments.manual ? 'Nequi/Daviplata' : null, payments.mercadopago ? 'Mercado Pago' : null].filter(Boolean).join(' + ') || 'Manual'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-zinc-500">Tono de Nova</span>
          <span className="font-bold text-zinc-950">{businessProfile.brandTone}</span>
        </div>
      </div>

      <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Tu tienda está lista para ser activada y empezar a recibir clientes.</span>
      </div>
    </div>
  )
}
