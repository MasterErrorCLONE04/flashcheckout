'use client'

import { Plus, Trash2, Layers } from 'lucide-react'
import { ProductOption } from './types'

interface ProductOptionsFieldProps {
  options: ProductOption[]
  setOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>
}

const OPTION_PRESETS = [
  { label: '+ Tallas Ropa', name: 'Talla', values: 'S, M, L, XL' },
  { label: '+ Calzado', name: 'Talla', values: '36, 37, 38, 39, 40, 41, 42' },
  { label: '+ Colores', name: 'Color', values: 'Negro, Blanco, Beige' },
  { label: '+ Presentación', name: 'Presentación', values: '250g, 500g, 1kg' },
]

export function ProductOptionsField({ options, setOptions }: ProductOptionsFieldProps) {
  const addPreset = (preset: { name: string; values: string }) => {
    setOptions(prev => {
      const existsIdx = prev.findIndex(o => o.name.toLowerCase() === preset.name.toLowerCase())
      if (existsIdx >= 0) {
        return prev.map((o, idx) => (idx === existsIdx ? { ...o, values: preset.values } : o))
      }
      return [...prev, { name: preset.name, values: preset.values }]
    })
  }

  return (
    <div className="space-y-3 pt-4 border-t border-zinc-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-zinc-500" />
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
            Variantes & Opciones ({options.length})
          </label>
        </div>
        <button
          type="button"
          onClick={() => setOptions(prev => [...prev, { name: '', values: '' }])}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Opción personalizada</span>
        </button>
      </div>

      {/* Quick 1-click presets */}
      <div className="flex flex-wrap gap-1.5">
        {OPTION_PRESETS.map(preset => (
          <button
            key={preset.label}
            type="button"
            onClick={() => addPreset(preset)}
            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 border border-zinc-200 transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {options.length === 0 ? (
        <div className="text-[11px] text-zinc-500 bg-zinc-50/70 border border-dashed border-zinc-200 rounded-lg px-3 py-2.5 text-center">
          Producto simple sin variaciones de talla o color. Usa los botones de arriba para añadir variantes en 1 clic.
        </div>
      ) : (
        <div className="space-y-2.5">
          {options.map((opt, idx) => {
            const pills = opt.values
              .split(',')
              .map(v => v.trim())
              .filter(Boolean)

            return (
              <div
                key={idx}
                className="p-3 bg-zinc-50/80 border border-zinc-200 rounded-lg space-y-2"
              >
                <div className="flex items-end gap-2">
                  <div className="w-1/3 space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500">
                      Atributo
                    </label>
                    <input
                      type="text"
                      className="w-full h-8 bg-white border border-zinc-200 rounded-md px-2.5 text-xs font-semibold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                      placeholder="Ej: Talla"
                      value={opt.name}
                      onChange={e => {
                        const val = e.target.value
                        setOptions(prev => prev.map((o, i) => (i === idx ? { ...o, name: val } : o)))
                      }}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500">
                      Valores (separados por coma)
                    </label>
                    <input
                      type="text"
                      className="w-full h-8 bg-white border border-zinc-200 rounded-md px-2.5 text-xs font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                      placeholder="S, M, L, XL"
                      value={opt.values}
                      onChange={e => {
                        const val = e.target.value
                        setOptions(prev => prev.map((o, i) => (i === idx ? { ...o, values: val } : o)))
                      }}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOptions(prev => prev.filter((_, i) => i !== idx))}
                    className="h-8 w-8 rounded-md bg-white hover:bg-rose-50 text-zinc-400 hover:text-rose-600 border border-zinc-200 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Eliminar variante"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {pills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[10px] font-medium text-zinc-400 mr-1">
                      Selector cliente:
                    </span>
                    {pills.map((pill, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-[10px] font-semibold text-zinc-800"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
