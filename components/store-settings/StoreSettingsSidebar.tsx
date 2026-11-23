'use client'

import React from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  Bot,
  Sparkles,
  CreditCard,
  Globe,
  ExternalLink,
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
  isPro,
}: StoreSettingsSidebarProps) {
  return (
    <aside className="w-full lg:w-[370px] xl:w-[400px] shrink-0 h-full bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col overflow-y-auto p-4 space-y-5 text-left">
      {/* 1. ESTADO OPERATIVO DE LA TIENDA & BOT IA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-zinc-900" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              Control Operativo
            </h3>
          </div>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[9.5px] font-bold border',
              form.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            )}
          >
            {form.isActive ? '● Tienda Pública' : '○ En Pausa'}
          </span>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 divide-y divide-zinc-200/70">
          <div className="p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-900">Catálogo web activo</p>
              <p className="text-[10.5px] text-zinc-500">
                Permite recibir pedidos en tu link público
              </p>
            </div>
            <Toggle
              checked={form.isActive}
              onChange={v => setForm(f => ({ ...f, isActive: v }))}
            />
          </div>

          <div className="p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-900">Respuesta automática IA</p>
              <p className="text-[10.5px] text-zinc-500">
                El agente responde mensajes en WhatsApp
              </p>
            </div>
            <Toggle
              checked={form.autoReply}
              onChange={v => setForm(f => ({ ...f, autoReply: v }))}
            />
          </div>

          <div className="p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-zinc-900">Transferencia a humano</p>
              <p className="text-[10.5px] text-zinc-500">
                Permite que el cliente pida hablar contigo
              </p>
            </div>
            <Toggle
              checked={form.humanHandoff}
              onChange={v => setForm(f => ({ ...f, humanHandoff: v }))}
            />
          </div>
        </div>

        <Link
          href="/agente"
          className="w-full h-8 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Abrir Estudio del Agente IA</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </Link>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* 2. PREFERENCIAS REGIONALES */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-zinc-900" />
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
            Formato & Región
          </h3>
        </div>

        <div className="space-y-2.5">
          {PREFERENCE_FIELDS.map(field => (
            <div key={field.key} className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-600 block">
                {field.label}
              </label>
              <div className="relative">
                <select
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full h-9 appearance-none bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl pl-3 pr-8 text-xs font-bold text-zinc-800 outline-none cursor-pointer transition-all"
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* 3. PLAN & SUSCRIPCIÓN */}
      <div className="p-4 rounded-2xl bg-zinc-950 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPro ? (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            ) : (
              <CreditCard className="w-4 h-4 text-zinc-400" />
            )}
            <span className="text-xs font-black uppercase tracking-wider">
              {isPro ? 'Plan Pro Activo' : 'Plan Starter'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-emerald-300">
            Activo
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          {isPro
            ? 'Tienes acceso completo a múltiples tiendas, Studio IA y automatizaciones de WhatsApp.'
            : 'Actualiza a Pro para desbloquear múltiples comercios y capacidad extendida.'}
        </p>

        <div className="pt-1">
          <SubscriptionButton isPro={isPro} />
        </div>
      </div>
    </aside>
  )
}
