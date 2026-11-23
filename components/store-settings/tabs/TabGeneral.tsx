'use client'

import React from 'react'
import { Store, ImagePlus, MapPin, Clock, Trash2 } from 'lucide-react'
import { StoreFormState, ScheduleDay } from '../types'
import { Toggle } from '../Toggle'

interface TabGeneralProps {
  form: StoreFormState
  setForm: React.Dispatch<React.SetStateAction<StoreFormState>>
  editingProfile?: boolean
  setEditingProfile?: (val: boolean) => void
  editingAddress?: boolean
  setEditingAddress?: (val: boolean) => void
  logoPreview: string | null
  onLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo?: () => void
  schedule?: ScheduleDay[]
  setSchedule?: React.Dispatch<React.SetStateAction<ScheduleDay[]>>
}

const CATEGORIES = [
  'Moda & Ropa',
  'Restaurante & Comida',
  'Belleza & Skincare',
  'Tecnología & Gadgets',
  'Joyería & Accesorios',
  'Hogar & Decoración',
  'Mascotas',
  'Deportes & Salud',
  'General',
]

export function TabGeneral({
  form,
  setForm,
  logoPreview,
  onLogoSelect,
  onRemoveLogo,
  schedule = [],
  setSchedule,
}: TabGeneralProps) {
  return (
    <div className="space-y-4">
      {/* 1. IDENTIDAD & PERFIL DEL NEGOCIO */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Identidad Comercial
              </h3>
              <p className="text-[10.5px] text-zinc-400 font-medium">
                Nombre público, logotipo, categoría y contacto directo
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col sm:flex-row items-start gap-6">
          {/* Logo Box */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shadow-2xs">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7 text-zinc-300" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[10.5px] font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1 cursor-pointer transition-colors">
                <ImagePlus className="w-3 h-3" />
                <span>Subir logo</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={onLogoSelect}
                />
              </label>
              {logoPreview && onRemoveLogo && (
                <button
                  type="button"
                  onClick={onRemoveLogo}
                  className="p-1 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Quitar logo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-600 block">
                Nombre de la tienda *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-bold text-zinc-900 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-600 block">
                Categoría del comercio
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-bold text-zinc-800 outline-none cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-600 block">
                WhatsApp principal de pedidos
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                placeholder="573001234567"
                className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs font-bold text-zinc-900 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-600 block">
                Correo electrónico de soporte
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                placeholder="hola@tutienda.com"
                className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-600">
                  Biografía / Descripción corta de la marca
                </label>
                <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                  {form.bio.length}/160
                </span>
              </div>
              <textarea
                rows={2}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 160) }))}
                placeholder="Describe brevemente lo que vendes y tu propuesta de valor..."
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl p-3 text-xs font-medium text-zinc-900 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. DIRECCIÓN FÍSICA & FACTURACIÓN */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              Ubicación & Origen de Despacho
            </h3>
            <p className="text-[10.5px] text-zinc-400 font-medium">
              Visible en los recibos de compra y utilizada para calcular tiempos de entrega
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-zinc-600 block">
              Dirección comercial
            </label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-600 block">
              Ciudad
            </label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-600 block">
              Departamento / Estado
            </label>
            <input
              type="text"
              value={form.department}
              onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-600 block">
              País
            </label>
            <input
              type="text"
              value={form.country}
              onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-600 block">
              Código Postal
            </label>
            <input
              type="text"
              value={form.postalCode}
              onChange={e => setForm(prev => ({ ...prev, postalCode: e.target.value }))}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. HORARIOS DE ATENCIÓN COMERCIAL */}
      {schedule.length > 0 && setSchedule && (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Horarios de Despacho & Atención Humana
              </h3>
              <p className="text-[10.5px] text-zinc-400 font-medium">
                El Agente IA atiende 24/7, pero informa estos horarios para despachos y asesores
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {schedule.map((day, idx) => (
              <div
                key={day.key}
                className="px-5 py-2.5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-[130px]">
                  <Toggle
                    checked={day.enabled}
                    onChange={val =>
                      setSchedule(prev =>
                        prev.map((d, i) => (i === idx ? { ...d, enabled: val } : d))
                      )
                    }
                  />
                  <span className="font-bold text-zinc-900">{day.label}</span>
                </div>

                {day.enabled ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={day.from}
                      onChange={e =>
                        setSchedule(prev =>
                          prev.map((d, i) => (i === idx ? { ...d, from: e.target.value } : d))
                        )
                      }
                      className="w-24 h-7 bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-center font-mono text-[11px] font-bold text-zinc-800 outline-none focus:border-zinc-950"
                    />
                    <span className="text-zinc-400 font-medium">a</span>
                    <input
                      type="text"
                      value={day.to}
                      onChange={e =>
                        setSchedule(prev =>
                          prev.map((d, i) => (i === idx ? { ...d, to: e.target.value } : d))
                        )
                      }
                      className="w-24 h-7 bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-center font-mono text-[11px] font-bold text-zinc-800 outline-none focus:border-zinc-950"
                    />
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-zinc-400 bg-zinc-100 px-2.5 py-0.5 rounded-md">
                    Cerrado (Solo Bot IA)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
