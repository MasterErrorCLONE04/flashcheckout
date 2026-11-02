'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2 } from 'lucide-react'
import { CouponEstado, CouponTipo, CouponTipoDesc } from './types'

interface DescuentosModalProps {
  isOpen: boolean
  mounted: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  formLoading: boolean
  editingId: string | null
  code: string
  setCode: (val: string) => void
  desc: string
  setDesc: (val: string) => void
  tipo: CouponTipo
  setTipo: (val: CouponTipo) => void
  tipoDesc: CouponTipoDesc
  setTipoDesc: (val: CouponTipoDesc) => void
  valorNum: string
  setValorNum: (val: string) => void
  validoHasta: string
  setValidoHasta: (val: string) => void
  estado: CouponEstado
  setEstado: (val: CouponEstado) => void
}

export function DescuentosModal({
  isOpen,
  mounted,
  onClose,
  onSubmit,
  formLoading,
  editingId,
  code,
  setCode,
  desc,
  setDesc,
  tipo,
  setTipo,
  tipoDesc,
  setTipoDesc,
  valorNum,
  setValorNum,
  validoHasta,
  setValidoHasta,
  estado,
  setEstado,
}: DescuentosModalProps) {
  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white border border-zinc-200 rounded-lg p-6 w-full max-w-md space-y-5 shadow-none relative animate-in fade-in zoom-in-95 slide-from-bottom-4 duration-350 ease-out">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-black text-zinc-950 leading-tight">
              {editingId ? 'Editar Descuento' : 'Crear Nuevo Descuento'}
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400">Completa los campos para generar un código o regla.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 border-none bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Código del cupón</label>
            <input 
              type="text" 
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ej: VERANO25"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Descripción del beneficio</label>
            <input 
              type="text" 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Ej: Descuento aplicable en toda la tienda"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Tipo de aplicación</label>
              <select 
                value={tipo}
                onChange={e => setTipo(e.target.value as CouponTipo)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer"
              >
                <option value="Código">Código promocional</option>
                <option value="Automático">Automático al checkout</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Tipo de descuento</label>
              <select 
                value={tipoDesc}
                onChange={e => setTipoDesc(e.target.value as CouponTipoDesc)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer"
              >
                <option value="Porcentaje">Porcentaje %</option>
                <option value="Envío gratis">Envío gratis</option>
                <option value="Monto fijo">Monto fijo $</option>
              </select>
            </div>
          </div>

          {tipoDesc !== 'Envío gratis' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">
                {tipoDesc === 'Porcentaje' ? 'Porcentaje de descuento' : 'Monto de descuento ($ COP)'}
              </label>
              <input 
                type="number" 
                value={valorNum}
                onChange={e => setValorNum(e.target.value)}
                placeholder={tipoDesc === 'Porcentaje' ? 'Ej: 15' : 'Ej: 5000'}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Válido hasta</label>
              <input 
                type="text" 
                value={validoHasta}
                onChange={e => setValidoHasta(e.target.value)}
                placeholder="Ej: 31 may. 2025"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider block">Estado</label>
              <select 
                value={estado}
                onChange={e => setEstado(e.target.value as CouponEstado)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="Programado">Programado</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex gap-2 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {formLoading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Descuento'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
