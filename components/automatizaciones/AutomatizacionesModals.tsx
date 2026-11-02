'use client'

import { Loader2, X } from 'lucide-react'
import { TEMPLATE_PLACEHOLDERS, type Automation } from './types'

interface CreateAutomationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  newName: string
  setNewName: (value: string) => void
  newDesc: string
  setNewDesc: (value: string) => void
  newIcon: string
  setNewIcon: (value: string) => void
  newChannels: string[]
  setNewChannels: React.Dispatch<React.SetStateAction<string[]>>
  saving: boolean
}

export function CreateAutomationModal({
  isOpen,
  onClose,
  onSubmit,
  newName,
  setNewName,
  newDesc,
  setNewDesc,
  newIcon,
  setNewIcon,
  newChannels,
  setNewChannels,
  saving,
}: CreateAutomationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-md p-6 space-y-4 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center select-none">
          <h3 className="font-bold text-sm text-zinc-950 uppercase tracking-wider">
            Nueva automatización
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">
              Nombre de la regla
            </label>
            <input
              type="text"
              placeholder="Ej: Mensaje de bienvenida"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">
              Descripción
            </label>
            <textarea
              placeholder="Explica qué hace esta automatización..."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all resize-none h-20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">
                Emoji / Icono
              </label>
              <select
                value={newIcon}
                onChange={e => setNewIcon(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all cursor-pointer"
              >
                <option value="👋">👋 Saludo</option>
                <option value="🛒">🛒 Carrito</option>
                <option value="💳">💳 Pago</option>
                <option value="📦">📦 Entrega</option>
                <option value="🌙">🌙 Inactividad</option>
                <option value="⭐">⭐ Calificar</option>
                <option value="⚡">⚡ Rápido</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">
                Canales
              </label>
              <div className="flex gap-2 items-center pt-2">
                <label className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newChannels.includes('WhatsApp')}
                    onChange={e => {
                      if (e.target.checked) setNewChannels(prev => [...prev, 'WhatsApp'])
                      else setNewChannels(prev => prev.filter(c => c !== 'WhatsApp'))
                    }}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 shrink-0 cursor-pointer"
                  />
                  <span>WhatsApp</span>
                </label>

                <label className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newChannels.includes('Email')}
                    onChange={e => {
                      if (e.target.checked) setNewChannels(prev => [...prev, 'Email'])
                      else setNewChannels(prev => prev.filter(c => c !== 'Email'))
                    }}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 shrink-0 cursor-pointer"
                  />
                  <span>Email</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Guardar regla</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ConfigureTemplateModalProps {
  isOpen: boolean
  selectedAutomation: Automation | null
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  customTemplateText: string
  setCustomTemplateText: React.Dispatch<React.SetStateAction<string>>
  updatingTemplate: boolean
}

export function ConfigureTemplateModal({
  isOpen,
  selectedAutomation,
  onClose,
  onSubmit,
  customTemplateText,
  setCustomTemplateText,
  updatingTemplate,
}: ConfigureTemplateModalProps) {
  if (!isOpen || !selectedAutomation) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg p-6 md:p-8 space-y-5 animate-in zoom-in duration-200 shadow-xl text-left select-none">
        <div className="flex justify-between items-center select-none">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{selectedAutomation.icon}</span>
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">
                Configurar Plantilla
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold tracking-wide mt-0.5">
                {selectedAutomation.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 cursor-pointer p-1 rounded-full hover:bg-zinc-50 transition-colors border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">
              Mensaje de WhatsApp Personalizado
            </label>
            <textarea
              placeholder="Escribe el mensaje que se enviará automáticamente..."
              value={customTemplateText}
              onChange={e => setCustomTemplateText(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold text-zinc-800 outline-none transition-all h-32 resize-y"
              required
            />
          </div>

          {/* Dynamic placeholders helper legend */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2">
            <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block">
              Etiquetas dinámicas permitidas
            </span>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
              Puedes incluir estas etiquetas en tu mensaje. El sistema las reemplazará automáticamente con la información real de la venta antes de enviar el mensaje:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {TEMPLATE_PLACEHOLDERS.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCustomTemplateText(prev => prev + ' ' + place.tag)
                  }}
                  className="p-1.5 px-2 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 cursor-pointer flex items-center justify-between text-[10px] font-bold text-zinc-800 active:scale-95 transition-all"
                >
                  <code className="text-zinc-700 font-mono font-extrabold">{place.tag}</code>
                  <span className="text-[8px] text-zinc-400 font-bold">{place.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 select-none">
            <button
              type="submit"
              disabled={updatingTemplate}
              className="flex-grow py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 border-0"
            >
              {updatingTemplate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Guardar Plantilla</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

