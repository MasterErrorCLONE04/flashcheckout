'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { AgentSettingsState } from '../useAgentSettingsState'

interface TabComportamientoProps {
  agent: AgentSettingsState
}

export function TabComportamiento({ agent }: TabComportamientoProps) {
  const {
    behavior,
    setBehavior,
    handleSaveBehavior,
    saving
  } = agent

  return (
    <div className="space-y-5 animate-in">
      <div className="p-6 bg-white border border-zinc-200 rounded-lg space-y-5">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Parámetros de conversación</h3>
          <p className="text-xs text-zinc-500 mt-1">Ajusta el tono de voz de la IA, reglas de stock y tiempos de respuesta.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 tracking-wider">Tono de voz de la IA</label>
            <select
              value={behavior.tone}
              onChange={e => setBehavior(b => ({ ...b, tone: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold outline-none text-zinc-700 focus:bg-white focus:border-zinc-300"
            >
              <option value="Formal">Formal y Corporativo</option>
              <option value="Informal">Informal y Cercano (Tú)</option>
              <option value="Divertido">Divertido (Uso de emojis)</option>
              <option value="Persuasivo">Persuasivo y Enfocado en Ventas</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 tracking-wider">Idioma predeterminado</label>
            <select
              value={behavior.language}
              onChange={e => setBehavior(b => ({ ...b, language: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold outline-none text-zinc-700 focus:bg-white focus:border-zinc-300"
            >
              <option value="Español">Español (LATAM)</option>
              <option value="Inglés">Inglés (English)</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Toggle Out of stock */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div>
              <h4 className="text-xs font-bold text-zinc-800 leading-none">Permitir venta sin stock</h4>
              <p className="text-[9px] text-zinc-400 font-semibold mt-1">La IA ofrecerá productos aunque tengan stock en 0.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={behavior.comprarSinStock}
                onChange={e => setBehavior(b => ({ ...b, comprarSinStock: e.target.checked }))}
              />
              <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Toggle Ask for email */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div>
              <h4 className="text-xs font-bold text-zinc-800 leading-none">Exigir correo electrónico</h4>
              <p className="text-[9px] text-zinc-400 font-semibold mt-1">El agente de IA pedirá email obligatoriamente antes del checkout.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={behavior.pedirEmail}
                onChange={e => setBehavior(b => ({ ...b, pedirEmail: e.target.checked }))}
              />
              <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Timeout */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
            <div>
              <h4 className="text-xs font-bold text-zinc-800 leading-none">Espera para intervención humana</h4>
              <p className="text-[9px] text-zinc-400 font-semibold mt-1">Tiempo que el bot se silenciará tras mensaje del asesor.</p>
            </div>
            <select
              value={behavior.timeout}
              onChange={e => setBehavior(b => ({ ...b, timeout: e.target.value }))}
              className="bg-white border border-zinc-200 rounded-lg text-xs font-bold px-2 py-1 focus:outline-none text-zinc-700 cursor-pointer h-8 w-24 transition-colors"
            >
              <option value="5 min">5 min</option>
              <option value="10 min">10 min</option>
              <option value="15 min">15 min</option>
              <option value="Nunca">Nunca</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveBehavior}
            disabled={saving}
            className="flex items-center gap-1.5 h-10 px-6 bg-zinc-950 text-white rounded-lg text-xs font-bold cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Guardar Comportamiento</span>
          </button>
        </div>
      </div>
    </div>
  )
}
