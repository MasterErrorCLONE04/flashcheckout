'use client'

import React from 'react'
import { StoreWizardState } from '../useStoreWizardState'

interface Step6PreferencesProps {
  wizard: StoreWizardState
}

export function Step6Preferences({ wizard }: Step6PreferencesProps) {
  const {
    businessProfile,
    setBusinessProfile,
    preferences,
    setPreferences
  } = wizard

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          Preferencias & Memoria de Nova
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Dale a tu agente de IA el contexto de tu marca para que hable exactamente como tú.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Context Cards */}
        <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4.5 space-y-3.5">
          <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">
            🧠 Memoria de Negocio para Nova
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 block">Nicho o productos</label>
              <input
                type="text"
                placeholder="Ej: Joyería artesanal y plata 925"
                value={businessProfile.niche}
                onChange={e => setBusinessProfile(prev => ({ ...prev, niche: e.target.value }))}
                className="w-full bg-white border border-zinc-200/90 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 block">Tono de voz de la marca</label>
              <select
                value={businessProfile.brandTone}
                onChange={e => setBusinessProfile(prev => ({ ...prev, brandTone: e.target.value }))}
                className="w-full bg-white border border-zinc-200/90 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
              >
                <option value="Sofisticado y elegante">Sofisticado y elegante</option>
                <option value="Amigable y cercano">Amigable y cercano</option>
                <option value="Profesional y directo">Profesional y directo</option>
                <option value="Divertido e informal">Divertido e informal</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-700 block">Público objetivo</label>
            <input
              type="text"
              placeholder="Ej: Hombres y mujeres de 20 a 45 años que buscan regalos únicos"
              value={businessProfile.targetAudience}
              onChange={e => setBusinessProfile(prev => ({ ...prev, targetAudience: e.target.value }))}
              className="w-full bg-white border border-zinc-200/90 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
            />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-1.5">
          <label htmlFor="welcomeMessage" className="text-xs font-bold text-zinc-700 block">
            Mensaje de saludo inicial en WhatsApp
          </label>
          <textarea
            id="welcomeMessage"
            rows={2}
            className="w-full bg-white border border-zinc-200/90 rounded-xl p-3 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all resize-none leading-relaxed"
            value={preferences.welcomeMessage}
            onChange={e => setPreferences(p => ({ ...p, welcomeMessage: e.target.value }))}
          />
        </div>

        {/* Business Hours */}
        <div className="space-y-1.5">
          <label htmlFor="businessHours" className="text-xs font-bold text-zinc-700 block">
            Horarios de atención
          </label>
          <input
            id="businessHours"
            type="text"
            className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all"
            value={preferences.businessHours}
            onChange={e => setPreferences(p => ({ ...p, businessHours: e.target.value }))}
          />
        </div>
      </div>
    </div>
  )
}
