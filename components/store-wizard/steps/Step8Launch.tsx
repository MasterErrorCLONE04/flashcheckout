'use client'

import React from 'react'
import { Check, Loader2, ArrowRight, Palette, ExternalLink } from 'lucide-react'
import { StoreWizardState } from '../useStoreWizardState'

interface Step8LaunchProps {
  wizard: StoreWizardState
}

export function Step8Launch({ wizard }: Step8LaunchProps) {
  const {
    storeDisplayName,
    storeDisplaySlug,
    handleFinishOnboarding,
    loading,
  } = wizard

  return (
    <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
        <Check className="w-8 h-8 stroke-[3px]" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950">
          ¡Tu página está lista! 🎉
        </h2>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
          Autogenerada y publicada con éxito
        </p>
      </div>

      <p className="text-xs md:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed font-medium">
        Creamos la página personalizada para <strong className="text-zinc-950">{storeDisplayName}</strong> adaptada a tu negocio. Ya puedes vender en vivo, personalizar cada detalle o recibir pedidos por WhatsApp.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleFinishOnboarding('/dashboard')}
          disabled={loading}
          className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl px-6 py-3 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Abriendo panel...
            </>
          ) : (
            <>
              Ir al Panel de Control
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleFinishOnboarding('/tienda')}
          disabled={loading}
          className="w-full sm:w-auto bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 font-bold text-xs rounded-xl px-5 py-3 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Palette className="w-4 h-4 text-zinc-600" />
          <span>Editar mi página</span>
        </button>
      </div>

      <div>
        <a
          href={`/tienda/${storeDisplaySlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <span>Ver página pública (/tienda/{storeDisplaySlug})</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
