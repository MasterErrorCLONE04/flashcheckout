import { cn } from "@/lib/utils"
import { Sparkles, CheckCircle2, Palette, Type, Check } from 'lucide-react'
import { PRESETS } from '../types'
import { TiendaFormState } from '../useTiendaForm'

interface EstiloTabProps {
  form: TiendaFormState
}

export function EstiloTab({ form }: EstiloTabProps) {
  const {
    themePreset,
    handleApplyPreset,
    colors,
    handleColorChange,
    borderRadius,
    setBorderRadius,
    shadowStyle,
    setShadowStyle,
    typography,
    setTypography
  } = form

  return (
    <div className="space-y-6">
      {/* Presets 1-Clic Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <div className="flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-zinc-900 leading-none">Presets de Diseñador 1-Clic</h3>
            </div>
            <p className="text-[11px] font-semibold text-zinc-400">Transforma instantáneamente toda la estética de tu catálogo.</p>
          </div>
          {themePreset !== 'custom' && (
            <span className="text-[9px] font-extrabold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full">
              Preset Activo
            </span>
          )}
        </div>

        <div className="space-y-2.5 pt-1">
          {PRESETS.map((preset) => {
            const isSelected = themePreset === preset.id
            return (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group",
                  isSelected 
                    ? "border-zinc-950 bg-zinc-50/80 shadow-xs ring-1 ring-zinc-950" 
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-zinc-900">{preset.name}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-zinc-500 leading-tight">{preset.desc}</p>
                </div>

                {/* Color Pills Preview */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center -space-x-1">
                    {preset.colorPills.map((c, i) => (
                      <div 
                        key={i}
                        className="w-4 h-4 rounded-full border border-white shadow-xs" 
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-zinc-950 ml-1 shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Colores del tema */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <div className="flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-black text-zinc-900 leading-none">Colores del tema</h3>
            </div>
            <p className="text-[11px] font-semibold text-zinc-400">Personaliza libremente los colores de tu marca.</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-tight select-none pt-1">
          {[
            { key: 'primario' as const, label: 'Primario', val: colors.primario },
            { key: 'secundario' as const, label: 'Secundario', val: colors.secundario },
            { key: 'acento' as const, label: 'Acento', val: colors.acento },
            { key: 'fondo' as const, label: 'Fondo', val: colors.fondo },
            { key: 'texto' as const, label: 'Texto', val: colors.texto },
          ].map((col) => (
            <div key={col.key} className="space-y-1.5 flex flex-col items-center">
              <input 
                type="color" 
                value={col.val}
                onChange={e => handleColorChange(col.key, e.target.value)}
                className="w-10 h-10 rounded-xl border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0 shadow-xs"
              />
              <span>{col.label}</span>
              <span className="font-mono text-[9px] text-zinc-400 normal-case">{col.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Curvatura de Bordes (Border Radius) */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Curvatura de Bordes</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Define qué tan redondeadas se verán las tarjetas y botones.</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'sharp' as const, label: 'Sharp', desc: '0px • Editorial' },
            { id: 'smooth' as const, label: 'Smooth', desc: '14px • Moderno' },
            { id: 'pill' as const, label: 'Pill', desc: '24px • Amigable' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setBorderRadius(r.id)}
              className={cn(
                "p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5",
                borderRadius === r.id
                  ? "border-zinc-950 bg-zinc-900 text-white shadow-xs"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
              )}
              style={{ borderRadius: r.id === 'sharp' ? '0px' : r.id === 'pill' ? '24px' : '12px' }}
            >
              <span className="font-black text-xs leading-none">{r.label}</span>
              <span className={cn("text-[9px] font-semibold leading-tight", borderRadius === r.id ? "text-zinc-300" : "text-zinc-400")}>
                {r.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sombras y Elevación */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Sombras y Elevación</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Nivel de profundidad visual en tarjetas y contenedores.</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'flat' as const, label: 'Plana (Flat)', desc: 'Sin sombras' },
            { id: 'soft' as const, label: 'Suave (Soft)', desc: 'Sombra sutil' },
            { id: 'floating' as const, label: 'Flotante', desc: 'Alto relieve' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setShadowStyle(s.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                shadowStyle === s.id
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
              )}
            >
              <span className="font-black text-xs leading-none">{s.label}</span>
              <span className={cn("text-[9px] font-semibold", shadowStyle === s.id ? "text-zinc-300" : "text-zinc-400")}>
                {s.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tipografía de Autor */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Type className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-zinc-900 leading-none">Tipografía de Autor</h3>
          </div>
          <p className="text-[11px] font-semibold text-zinc-400">Tipografías Google Fonts calibradas para alta legibilidad.</p>
        </div>

        <div className="space-y-2 pt-1">
          {[
            { id: 'Outfit', name: 'Outfit', desc: 'Geométrica, moderna y limpia (Recomendada)' },
            { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', desc: 'Tech, moderna y altamente legible' },
            { id: 'Playfair Display', name: 'Playfair Display', desc: 'Serif de lujo, gourmet y editorial' },
            { id: 'Space Grotesk', name: 'Space Grotesk', desc: 'Vanguardista, streetwear y urbana' },
            { id: 'Inter', name: 'Inter', desc: 'Precisión suiza y balance neutral clásico' },
          ].map((font) => {
            const isSelected = typography === font.id
            return (
              <div
                key={font.id}
                onClick={() => setTypography(font.id)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                  isSelected
                    ? "border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950"
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                )}
              >
                <div className="space-y-0.5">
                  <span className="font-black text-xs text-zinc-900 block">{font.name}</span>
                  <span className="text-[10px] font-medium text-zinc-500">{font.desc}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-zinc-950 shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
