'use client'

import React from 'react'
import {
  AlertCircle,
  Shirt,
  Smartphone,
  Home,
  Utensils,
  Dumbbell,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StoreWizardState } from '../useStoreWizardState'

interface Step2BusinessInfoProps {
  wizard: StoreWizardState
}

export function Step2BusinessInfo({ wizard }: Step2BusinessInfoProps) {
  const {
    storeForm,
    setStoreForm,
    generateSlug,
    error
  } = wizard

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          Información de tu negocio
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Personaliza la identidad y el link público de tu tienda en Flashcheckouts.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Store Name */}
        <div className="space-y-1.5">
          <label htmlFor="storeName" className="text-xs font-bold text-zinc-700 block">
            Nombre de la tienda <span className="text-red-500">*</span>
          </label>
          <input
            id="storeName"
            type="text"
            required
            placeholder="Ej. Boutique Bella Vista"
            className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all"
            value={storeForm.name}
            onChange={e => {
              const name = e.target.value
              setStoreForm(f => ({
                ...f,
                name,
                slug: generateSlug(name)
              }))
            }}
          />
        </div>

        {/* Slug / Web Address */}
        <div className="space-y-1.5">
          <label htmlFor="storeSlug" className="text-xs font-bold text-zinc-700 block">
            Dirección web única (Slug) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center bg-zinc-50/60 border border-zinc-200/90 rounded-xl overflow-hidden focus-within:border-zinc-950 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-950/5 transition-all">
            <span className="pl-3.5 pr-1 text-xs font-semibold text-zinc-400 select-none shrink-0">
              flash.checkout/tienda/
            </span>
            <input
              id="storeSlug"
              type="text"
              required
              placeholder="boutique-bella"
              className="flex-1 px-1 py-2.5 text-xs border-none bg-transparent focus:outline-none font-bold text-zinc-950 min-w-0"
              value={storeForm.slug}
              onChange={e => setStoreForm(f => ({ ...f, slug: generateSlug(e.target.value) }))}
            />
          </div>
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-1.5">
          <label htmlFor="storeWhatsapp" className="text-xs font-bold text-zinc-700 block">
            Número de WhatsApp del Negocio <span className="text-red-500">*</span>
          </label>
          <input
            id="storeWhatsapp"
            type="tel"
            required
            placeholder="573001234567"
            className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all tabular-nums"
            value={storeForm.whatsapp}
            onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '') }))}
          />
          <p className="text-[11px] text-zinc-400 font-medium">
            Ingresa el número con el código de país sin espacios ni signo "+" (Ej: Colombia: 57).
          </p>
        </div>

        {/* Category Pills */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-zinc-700 block">Categoría principal</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'Moda', icon: Shirt, label: 'Moda & Ropa' },
              { id: 'Tecnología', icon: Smartphone, label: 'Tecnología' },
              { id: 'Hogar', icon: Home, label: 'Hogar & Deco' },
              { id: 'Comida', icon: Utensils, label: 'Comida & Bebidas' },
              { id: 'Deportes', icon: Dumbbell, label: 'Fitness & Deporte' },
              { id: 'Otros', icon: MoreHorizontal, label: 'Servicios / Otros' }
            ].map(cat => {
              const isSelected = storeForm.category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStoreForm(f => ({ ...f, category: cat.id }))}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-98",
                    isSelected
                      ? "bg-zinc-950 border-zinc-950 text-white shadow-xs"
                      : "bg-white border-zinc-200/90 text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <cat.icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-white" : "text-zinc-400")} />
                  <span className="text-[11px] font-bold tracking-tight">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
