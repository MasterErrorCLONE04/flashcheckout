'use client'

import React from 'react'
import { X, Building } from 'lucide-react'
import { AVAILABLE_TOOLS } from '../types'

interface HireAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  creating: boolean
  newName: string
  setNewName: (val: string) => void
  newRole: string
  setNewRole: (val: string) => void
  newModel: string
  setNewModel: (val: string) => void
  newAvatarEmoji: string
  setNewAvatarEmoji: (val: string) => void
  newDescription: string
  setNewDescription: (val: string) => void
  newSystemPrompt: string
  setNewSystemPrompt: (val: string) => void
  newTools: string[]
  setNewTools: React.Dispatch<React.SetStateAction<string[]>>
}

export function HireAgentModal({
  isOpen,
  onClose,
  onSubmit,
  creating,
  newName,
  setNewName,
  newRole,
  setNewRole,
  newModel,
  setNewModel,
  newAvatarEmoji,
  setNewAvatarEmoji,
  newDescription,
  setNewDescription,
  newSystemPrompt,
  setNewSystemPrompt,
  newTools,
  setNewTools
}: HireAgentModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4 select-none">
          <Building className="w-5 h-5 text-zinc-800" />
          <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Contratar Nuevo Agente de Oficina</h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Nombre del Agente</label>
              <input
                type="text"
                required
                placeholder="e.g. SupportBot, Analyst"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
            <div>
              <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Rol / Cargo</label>
              <input
                type="text"
                required
                placeholder="e.g. Asistente de Catálogo"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Modelo de IA</label>
              <select
                value={newModel}
                onChange={e => setNewModel(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none cursor-pointer transition-all"
              >
                <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B (Recomendado)</option>
                <option value="google/gemma-2-9b-it">Gemma 2 9B (Veloz)</option>
                <option value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B (Complejo)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Emoji / Sprite base</label>
              <select
                value={newAvatarEmoji}
                onChange={e => setNewAvatarEmoji(e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none cursor-pointer transition-all"
              >
                <option value="🕵️">🕵️ Detective (Analista)</option>
                <option value="🧙">🧙 Mago (Creativo)</option>
                <option value="🧑‍💻">🧑‍💻 Programador (Soporte)</option>
                <option value="👩‍🎨">👩‍🎨 Artista (Copywriter)</option>
                <option value="🤖">🤖 Robot (Operaciones)</option>
                <option value="🦁">🦁 León (Ventas)</option>
                <option value="👽">👽 Alien (Especialista)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Descripción Breve</label>
            <input
              type="text"
              placeholder="e.g. Asiste en tareas de catalogación de productos y ofertas..."
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
            />
          </div>

          <div>
            <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">System Prompt (Instrucción Base/Personalidad)</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Eres un agente enfocado en la atención y redacción. Responde siempre con tono ejecutivo..."
              value={newSystemPrompt}
              onChange={e => setNewSystemPrompt(e.target.value)}
              className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none resize-none font-mono transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Tool checkboxes */}
          <div>
            <label className="text-[9px] text-zinc-500 uppercase font-black block mb-2">Herramientas Autorizadas (Funcionalidades)</label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50 border border-zinc-200 p-3 rounded-xl max-h-32 overflow-y-auto">
              {AVAILABLE_TOOLS.map(t => {
                const checked = newTools.includes(t.name)
                return (
                  <label key={t.name} className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) setNewTools(newTools.filter(x => x !== t.name))
                        else setNewTools([...newTools, t.name])
                      }}
                      className="rounded border-zinc-300 bg-white text-zinc-950 focus:ring-0 cursor-pointer"
                    />
                    <span>{t.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 select-none">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-bold rounded-xl py-2.5 text-center cursor-pointer transition-all active:scale-[0.98]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !newName || !newRole || !newSystemPrompt}
              className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl py-2.5 text-center cursor-pointer transition-all active:scale-[0.98] disabled:bg-zinc-100 disabled:text-zinc-400 disabled:scale-100 border border-zinc-800 disabled:border-zinc-200 disabled:cursor-not-allowed"
            >
              {creating ? 'Contratando...' : 'Confirmar Contratación'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
