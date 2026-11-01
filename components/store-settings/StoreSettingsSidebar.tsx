'use client'

import React from 'react'
import {
  Loader2,
  ChevronDown,
  Settings,
  Sparkles,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SubscriptionButton from '@/components/SubscriptionButton'
import { StoreFormState } from './types'
import { PREFERENCE_FIELDS, TabId } from './constants'
import { Toggle } from './Toggle'

interface StoreSettingsSidebarProps {
  form: StoreFormState
  setForm: React.Dispatch<React.SetStateAction<StoreFormState>>
  loading: boolean
  onSubmit: () => void
  onNavigateTab: (tab: TabId) => void
  isPro: boolean
}

export function StoreSettingsSidebar({
  form,
  setForm,
  loading,
  onSubmit,
  onNavigateTab,
  isPro,
}: StoreSettingsSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-5">
      {/* Preferencias generales */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">Preferencias generales</h3>
          <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Ajustes principales de tu tienda.</p>
        </div>
        <div className="p-5 space-y-4">
          {PREFERENCE_FIELDS.map(field => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 block">{field.label}</label>
              <div className="relative">
                <select
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full appearance-none bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2.5 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-500 transition-all cursor-pointer"
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          ))}

          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-9 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold shadow-none transition-all active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Estado del bot (Nova) */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">Estado del bot (Nova)</h3>
          <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Controla el comportamiento de tu asistente IA.</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600">Estado actual</span>
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
              form.botEnabled ? "bg-zinc-50 text-zinc-700 border border-zinc-200" : "bg-zinc-100 text-zinc-400 border border-zinc-200"
            )}>
              {form.botEnabled ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-800">Respuesta automática</p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Nova responde automáticamente a tus clientes.</p>
              </div>
              <Toggle checked={form.autoReply} onChange={v => setForm(f => ({ ...f, autoReply: v }))} />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-800">Desvío a humano</p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Permitir que los clientes soliciten atención humana.</p>
              </div>
              <Toggle checked={form.humanHandoff} onChange={v => setForm(f => ({ ...f, humanHandoff: v }))} />
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('pagos')}
            className="w-full flex items-center justify-center gap-1.5 h-8 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            Configurar comportamiento
          </button>
        </div>
      </div>

      {/* Información del plan */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">Información del plan</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-zinc-400">Plan actual</p>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-50 text-zinc-700 border border-zinc-200">Activo</span>
          </div>

          <div className="flex items-center gap-2.5">
            {isPro ? (
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-zinc-400" />
              </div>
            )}
            <span className="text-base font-bold text-zinc-900">{isPro ? 'Pro' : 'Free'}</span>
          </div>

          <div className="space-y-2 border-t border-zinc-100 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-500">Renovación</span>
              <span className="font-bold text-zinc-800">15 de junio de 2025</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-500">Conversaciones incluidas</span>
              <span className="font-bold text-zinc-800">10.000 / mes</span>
            </div>
          </div>

          <div className="pt-1">
            <SubscriptionButton isPro={isPro} />
          </div>
        </div>
      </div>
    </div>
  )
}
