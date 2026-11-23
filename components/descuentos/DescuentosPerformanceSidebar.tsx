'use client'

import React from 'react'
import {
  Ticket,
  Sparkles,
  Loader2,
  Share2,
  RotateCcw,
  Percent,
  Truck,
  DollarSign,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Coupon, CouponEstado, CouponTipo, CouponTipoDesc } from './types'

interface DescuentosPerformanceSidebarProps {
  coupons?: Coupon[]
  totalUses?: number
  pctPercent?: number
  pctCount?: number
  freeShipPercent?: number
  freeShipCount?: number
  fixedPercent?: number
  fixedCount?: number
  mostUsedCoupon?: Coupon | null
  mostUsedPercent?: number
  // Studio Builder Props
  editingId?: string | null
  code?: string
  setCode?: (val: string) => void
  desc?: string
  setDesc?: (val: string) => void
  tipo?: CouponTipo
  setTipo?: (val: CouponTipo) => void
  tipoDesc?: CouponTipoDesc
  setTipoDesc?: (val: CouponTipoDesc) => void
  valorNum?: string
  setValorNum?: (val: string) => void
  validoHasta?: string
  setValidoHasta?: (val: string) => void
  estado?: CouponEstado
  setEstado?: (val: CouponEstado) => void
  formLoading?: boolean
  onSubmit?: (e: React.FormEvent) => void
  onResetCreate?: () => void
  onGenerateRandomCode?: () => void
  onCopyPromoText?: (c: { code: string; valor: string; desc?: string }) => void
}

const QUICK_PRESETS: Array<{
  label: string
  code: string
  tipoDesc: CouponTipoDesc
  valorNum: string
  desc: string
}> = [
  {
    label: '10% Bienvenida',
    code: 'BIENVENIDO10',
    tipoDesc: 'Porcentaje',
    valorNum: '10',
    desc: '10% OFF en tu primera compra',
  },
  {
    label: '15% Flash VIP',
    code: 'FLASH15',
    tipoDesc: 'Porcentaje',
    valorNum: '15',
    desc: '15% de descuento especial',
  },
  {
    label: 'Envío Gratis',
    code: 'ENVIOGRATIS',
    tipoDesc: 'Envío gratis',
    valorNum: '0',
    desc: 'Envío sin costo a todo el país',
  },
  {
    label: '$10.000 Bono',
    code: 'BONO10K',
    tipoDesc: 'Monto fijo',
    valorNum: '10000',
    desc: 'Bono de $10.000 COP en checkout',
  },
]

export function DescuentosPerformanceSidebar({
  editingId,
  code = '',
  setCode,
  desc = '',
  setDesc,
  tipo = 'Código',
  setTipo,
  tipoDesc = 'Porcentaje',
  setTipoDesc,
  valorNum = '15',
  setValorNum,
  validoHasta = '',
  setValidoHasta,
  estado = 'Activo',
  setEstado,
  formLoading = false,
  onSubmit,
  onResetCreate,
  onGenerateRandomCode,
  onCopyPromoText,
}: DescuentosPerformanceSidebarProps) {
  const previewValue =
    tipoDesc === 'Envío gratis'
      ? 'ENVÍO GRATIS'
      : tipoDesc === 'Porcentaje'
        ? `${valorNum || '0'}% OFF`
        : `$${Number(valorNum || 0).toLocaleString('es-CO')} OFF`

  const applyPreset = (p: (typeof QUICK_PRESETS)[number]) => {
    setCode?.(p.code)
    setTipoDesc?.(p.tipoDesc)
    setValorNum?.(p.valorNum)
    setDesc?.(p.desc)
  }

  return (
    <aside className="w-full lg:w-[390px] xl:w-[420px] shrink-0 h-full bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col overflow-hidden text-left">
      {/* Cabecera del Constructor de Cupones */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              {editingId ? 'Editando Cupón' : 'Constructor de Cupón'}
            </h3>
            <p className="text-[10.5px] text-zinc-400 font-medium">
              {editingId
                ? 'Actualiza los parámetros de la regla seleccionada'
                : 'Crea un código promocional o regla automática'}
            </p>
          </div>
        </div>

        {editingId && onResetCreate && (
          <button
            type="button"
            onClick={onResetCreate}
            className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            title="Cambiar a modo crear nuevo cupón"
          >
            <Plus className="w-3 h-3" />
            <span>Nuevo</span>
          </button>
        )}
      </div>

      {/* Cuerpo Scrollable: Vista Previa del Ticket + Formulario en Vivo */}
      <form
        onSubmit={onSubmit}
        className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between"
      >
        <div className="space-y-4">
          {/* 1. VISTA PREVIA EN VIVO DEL TICKET PROMOCIONAL */}
          <div className="relative rounded-2xl bg-zinc-950 text-white p-4 border border-zinc-800 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-200 text-[9.5px] font-bold uppercase tracking-wider">
                    {tipo === 'Automático' ? 'Automático' : 'Código Cupón'}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[9.5px] font-bold',
                      estado === 'Activo'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    )}
                  >
                    ● {estado}
                  </span>
                </div>
                <div className="font-mono text-lg font-black tracking-wider text-white truncate pt-0.5">
                  {code.trim().toUpperCase() || 'TUCODIGO'}
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {desc || 'Aplicable en el checkout de tu tienda'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black text-emerald-400 tracking-tight block leading-none">
                  {previewValue}
                </span>
                <span className="text-[9.5px] text-zinc-400 font-medium block mt-1.5">
                  {validoHasta ? `Hasta ${validoHasta}` : 'Sin vencimiento'}
                </span>
              </div>
            </div>

            {code.trim() && onCopyPromoText && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">
                  Listo para compartir por WhatsApp
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onCopyPromoText({
                      code: code.trim().toUpperCase(),
                      valor: previewValue,
                      desc,
                    })
                  }
                  className="text-[10.5px] font-bold text-white hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Copiar texto promo</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. PLANTILLAS RÁPIDAS 1-CLIC (solo al crear nuevo) */}
          {!editingId && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                Plantillas Rápidas 1-Clic
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_PRESETS.map(p => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100 hover:border-zinc-300 text-left transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-zinc-900 block truncate">
                      {p.label}
                    </span>
                    <span className="text-[9.5px] font-mono text-zinc-500 block">
                      {p.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. CAMPOS DEL CONSTRUCTOR */}
          <div className="space-y-3">
            {/* Código del cupón + Generador */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-700">
                  Código promocional *
                </label>
                {onGenerateRandomCode && (
                  <button
                    type="button"
                    onClick={onGenerateRandomCode}
                    className="text-[10.5px] font-bold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generar código</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode?.(e.target.value.toUpperCase())}
                placeholder="Ej. FLASH15"
                className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs font-bold text-zinc-950 uppercase outline-none transition-all"
              />
            </div>

            {/* Tipo de Beneficio (3 tarjetas) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 block">
                Tipo de beneficio
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'Porcentaje' as const, label: 'Porcentaje', icon: Percent },
                  { id: 'Monto fijo' as const, label: 'Monto Fijo', icon: DollarSign },
                  { id: 'Envío gratis' as const, label: 'Envío Gratis', icon: Truck },
                ].map(item => {
                  const Icon = item.icon
                  const isActive = tipoDesc === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTipoDesc?.(item.id)}
                      className={cn(
                        'p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all',
                        isActive
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10.5px] font-bold leading-none">
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Valor del Descuento */}
            {tipoDesc !== 'Envío gratis' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">
                  {tipoDesc === 'Porcentaje'
                    ? 'Porcentaje de descuento (%)'
                    : 'Valor del descuento ($ COP)'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={tipoDesc === 'Porcentaje' ? 100 : undefined}
                  value={valorNum}
                  onChange={e => setValorNum?.(e.target.value)}
                  placeholder={tipoDesc === 'Porcentaje' ? '15' : '10000'}
                  className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-bold text-zinc-950 outline-none transition-all tabular-nums"
                />
              </div>
            )}

            {/* Descripción */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 block">
                Descripción interna o de campaña
              </label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc?.(e.target.value)}
                placeholder="Ej. Campaña clientes VIP de WhatsApp"
                className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-medium text-zinc-900 outline-none transition-all"
              />
            </div>

            {/* Aplicación & Estado */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">
                  Modo de uso
                </label>
                <select
                  value={tipo}
                  onChange={e => setTipo?.(e.target.value as CouponTipo)}
                  className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-2.5 text-xs font-bold text-zinc-800 outline-none cursor-pointer"
                >
                  <option value="Código">Código manual</option>
                  <option value="Automático">Automático</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={e => setEstado?.(e.target.value as CouponEstado)}
                  className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-2.5 text-xs font-bold text-zinc-800 outline-none cursor-pointer"
                >
                  <option value="Activo">Activo</option>
                  <option value="Programado">Programado</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Vigencia */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-700 block">
                Válido hasta (opcional)
              </label>
              <input
                type="text"
                value={validoHasta}
                onChange={e => setValidoHasta?.(e.target.value)}
                placeholder="Ej. 30 dic 2026 (vacío = sin límite)"
                className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-medium text-zinc-900 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción del Constructor */}
        <div className="pt-3 border-t border-zinc-200 flex items-center gap-2 shrink-0">
          {editingId && onResetCreate && (
            <button
              type="button"
              onClick={onResetCreate}
              className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>
          )}
          <button
            type="submit"
            disabled={formLoading}
            className="flex-1 h-9 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
          >
            {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {formLoading
                ? 'Guardando...'
                : editingId
                  ? 'Actualizar Cupón'
                  : 'Guardar y Activar Cupón'}
            </span>
          </button>
        </div>
      </form>
    </aside>
  )
}
