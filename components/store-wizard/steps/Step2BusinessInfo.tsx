'use client'

import React from 'react'
import {
  AlertCircle,
  Shirt,
  Smartphone,
  Home,
  Utensils,
  Dumbbell,
  Sparkles,
  Gem,
  PawPrint,
  Briefcase,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StoreWizardState } from '../useStoreWizardState'

interface Step2BusinessInfoProps {
  wizard: StoreWizardState
}

const BUSINESS_CATEGORIES = [
  { id: 'Moda', icon: Shirt, label: 'Moda & Ropa' },
  { id: 'Comida', icon: Utensils, label: 'Comida & Bebidas' },
  { id: 'Belleza', icon: Sparkles, label: 'Belleza & Skincare' },
  { id: 'Tecnología', icon: Smartphone, label: 'Tecnología' },
  { id: 'Hogar', icon: Home, label: 'Hogar & Deco' },
  { id: 'Joyería', icon: Gem, label: 'Joyería & Regalos' },
  { id: 'Deportes', icon: Dumbbell, label: 'Fitness & Deporte' },
  { id: 'Mascotas', icon: PawPrint, label: 'Mascotas' },
  { id: 'Otros', icon: Briefcase, label: 'Servicios / Otros' },
]

export function Step2BusinessInfo({ wizard }: Step2BusinessInfoProps) {
  const {
    storeForm,
    setStoreForm,
    generateSlug,
    error,
  } = wizard

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[10px] font-bold">
          <Wand2 className="w-3 h-3" />
          <span>Página autogenerada según tu negocio</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          Información de tu negocio
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Indica el giro y de qué trata tu negocio: crearemos automáticamente el diseño, secciones, textos y asistente de tu página.
        </p>
      </div>

      <div className="space-y-4 pt-0.5">
        {/* Store Name & Slug Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label htmlFor="storeName" className="text-xs font-bold text-zinc-700 block">
              Nombre del negocio <span className="text-red-500">*</span>
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
                  slug: generateSlug(name),
                }))
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="storeWhatsapp" className="text-xs font-bold text-zinc-700 block">
              WhatsApp del negocio <span className="text-red-500">*</span>
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
          </div>
        </div>

        {/* Slug / Web Address */}
        <div className="space-y-1.5">
          <label htmlFor="storeSlug" className="text-xs font-bold text-zinc-700 block">
            Dirección web única de esta página <span className="text-red-500">*</span>
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

        {/* Category Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-700 block">Tipo / giro del negocio</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BUSINESS_CATEGORIES.map(cat => {
              const isSelected = storeForm.category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStoreForm(f => ({ ...f, category: cat.id }))}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-98',
                    isSelected
                      ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                      : 'bg-white border-zinc-200/90 text-zinc-700 hover:bg-zinc-50'
                  )}
                >
                  <cat.icon className={cn('w-4 h-4 shrink-0', isSelected ? 'text-white' : 'text-zinc-400')} />
                  <span className="text-[11px] font-bold tracking-tight truncate">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Business Description for Auto-Generated Storefront */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="businessDescription" className="text-xs font-bold text-zinc-700 block">
              Describe tu negocio para personalizar la página
            </label>
            <span className="text-[10px] font-semibold text-emerald-600">Recomendado con IA</span>
          </div>
          <textarea
            id="businessDescription"
            rows={3}
            placeholder="Ej: Pastelería saludable artesanal sin azúcar en Medellín, especializada en tortas personalizadas, postres keto y regalos corporativos..."
            className="w-full bg-white border border-zinc-200/90 rounded-xl p-3 text-xs font-medium text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all resize-none leading-relaxed"
            value={storeForm.businessDescription}
            onChange={e => setStoreForm(f => ({ ...f, businessDescription: e.target.value }))}
          />
          <p className="text-[11px] text-zinc-400 font-medium leading-snug">
            Usaremos esta descripción para generar la paleta visual, portada, diferenciales, historia y preguntas frecuentes de la página de este negocio.
          </p>
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
