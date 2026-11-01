'use client'

import { Plus, Trash2 } from 'lucide-react'
import { ProductOption } from './types'

interface ProductOptionsFieldProps {
  options: ProductOption[]
  setOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>
}

export function ProductOptionsField({ options, setOptions }: ProductOptionsFieldProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-zinc-200">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[13px] font-bold tracking-tight text-zinc-800">Variantes / Opciones</label>
          <p className="text-[11px] text-zinc-400">Define variaciones como talla, color, sabor, etc.</p>
        </div>
        <button
          type="button"
          onClick={() => setOptions(prev => [...prev, { name: '', values: '' }])}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir Opción</span>
        </button>
      </div>

      {options.length === 0 ? (
        <p className="text-[11px] text-zinc-400 italic bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
          Este producto se venderá sin variaciones (sin selectores de talla/color).
        </p>
      ) : (
        <div className="space-y-3.5">
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-3 items-end p-3.5 bg-zinc-50 border border-zinc-100 rounded-xl relative group">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400">Nombre de la opción (Ej: Color)</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all"
                    placeholder="Ej: Talla"
                    value={opt.name}
                    onChange={e => {
                      const val = e.target.value
                      setOptions(prev => prev.map((o, i) => i === idx ? { ...o, name: val } : o))
                    }}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400">Valores (separados por comas)</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-950 placeholder:text-zinc-350 focus:outline-none focus:border-emerald-500/30 transition-all"
                    placeholder="Ej: S, M, L, XL"
                    value={opt.values}
                    onChange={e => {
                      const val = e.target.value
                      setOptions(prev => prev.map((o, i) => i === idx ? { ...o, values: val } : o))
                    }}
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOptions(prev => prev.filter((_, i) => i !== idx))}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all cursor-pointer border-none shrink-0 mb-0.5"
                title="Eliminar opción"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
