'use client'

import React from 'react'
import { Check, Loader2, ArrowRight } from 'lucide-react'
import { StoreWizardState } from '../useStoreWizardState'

interface Step8LaunchProps {
  wizard: StoreWizardState
}

export function Step8Launch({ wizard }: Step8LaunchProps) {
  const {
    storeDisplayName,
    handleFinishOnboarding,
    loading
  } = wizard

  return (
    <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
        <Check className="w-8 h-8 stroke-[3px]" />
      </div>
      
      <div className="space-y-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950">
          ¡Tu tienda está lista! 🎉
        </h2>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
          Lanzada en producción con éxito
        </p>
      </div>

      <p className="text-xs md:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed font-medium">
        Hemos configurado tu tienda <strong className="text-zinc-950">{storeDisplayName}</strong>. Nova ya está lista para responder mensajes, enviar tu catálogo y procesar pedidos en tiempo real.
      </p>

      <div className="pt-2">
        <button
          onClick={handleFinishOnboarding}
          disabled={loading}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl px-6 py-3 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Iniciando tu panel...
            </>
          ) : (
            <>
              Ir al Panel de Control
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
