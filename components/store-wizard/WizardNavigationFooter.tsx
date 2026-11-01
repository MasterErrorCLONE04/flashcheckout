'use client'

import React from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { StoreWizardState } from './useStoreWizardState'

interface WizardNavigationFooterProps {
  wizard: StoreWizardState
}

export function WizardNavigationFooter({ wizard }: WizardNavigationFooterProps) {
  const {
    currentStep,
    handleBack,
    handleNext,
    loading,
    storeForm,
    addedProducts
  } = wizard

  if (currentStep === 8) return null

  return (
    <footer className="h-18 px-6 md:px-12 border-t border-zinc-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-30">
      <div>
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 border border-zinc-200/90 hover:bg-zinc-50 rounded-xl px-4 py-2.5 transition-all cursor-pointer select-none active:scale-98"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleNext}
          disabled={
            loading || 
            (currentStep === 2 && (!storeForm.name || !storeForm.slug || !storeForm.whatsapp)) ||
            (currentStep === 4 && addedProducts.length === 0)
          }
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl px-5 py-2.5 active:scale-98 transition-all flex items-center gap-2 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              {currentStep === 1 
                ? 'Comenzar ahora' 
                : currentStep === 7 
                ? 'Confirmar y Lanzar' 
                : 'Continuar'}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </footer>
  )
}
