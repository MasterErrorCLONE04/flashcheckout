'use client'

import React from 'react'
import { Lock } from 'lucide-react'

export function WizardProGate() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-zinc-50 font-sans p-4 select-none">
      <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 text-center shadow-lg space-y-6 animate-in fade-in duration-300">
        <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-500 mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">Actualiza a Pro</h2>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Has alcanzado el límite de 1 tienda en el plan Gratuito. Para crear y administrar múltiples tiendas en tu workspace, actualiza tu suscripción.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button 
            onClick={() => { window.location.href = '/pricing' }}
            className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            Ver planes de suscripción
          </button>
          
          <button 
            onClick={() => {
              document.cookie = "create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
              window.location.reload()
            }}
            className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            Volver a mi tienda
          </button>
        </div>
      </div>
    </div>
  )
}
