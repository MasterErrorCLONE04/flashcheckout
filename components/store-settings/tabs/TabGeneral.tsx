'use client'

import React from 'react'
import { Pencil, Store, ImagePlus } from 'lucide-react'
import { StoreFormState } from '../types'

interface TabGeneralProps {
  form: StoreFormState
  setForm: React.Dispatch<React.SetStateAction<StoreFormState>>
  editingProfile: boolean
  setEditingProfile: (val: boolean) => void
  editingAddress: boolean
  setEditingAddress: (val: boolean) => void
  logoPreview: string | null
  onLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function TabGeneral({
  form,
  setForm,
  editingProfile,
  setEditingProfile,
  editingAddress,
  setEditingAddress,
  logoPreview,
  onLogoSelect,
}: TabGeneralProps) {
  return (
    <>
      {/* Perfil del negocio */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Perfil del negocio</h3>
            <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Información básica de tu tienda.</p>
          </div>
          <button
            type="button"
            onClick={() => setEditingProfile(!editingProfile)}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer select-none"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar información
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-20 h-20 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-zinc-300" />
                )}
              </div>
              <label className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors">
                <ImagePlus className="w-3 h-3" />
                Editar logo
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={onLogoSelect} />
              </label>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 block">Nombre de la tienda</label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-500 transition-all"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-800">{form.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 block">Correo electrónico</label>
                {editingProfile ? (
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-500 transition-all"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-800">{form.contactEmail}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 block">Teléfono</label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-500 transition-all"
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-800">{form.whatsapp}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-zinc-500 block">Descripción</label>
                {editingProfile ? (
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 160) }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-500 transition-all resize-none"
                    />
                    <div className="absolute bottom-2 right-3 text-[9px] font-bold text-zinc-400">{form.bio.length}/160</div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-zinc-800">{form.bio || <span className="text-zinc-400">Sin descripción</span>}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dirección del negocio */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Dirección del negocio</h3>
            <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Esta información se mostrará en tu tienda y documentos.</p>
          </div>
          <button
            type="button"
            onClick={() => setEditingAddress(!editingAddress)}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer select-none"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>
        <div className="p-6">
          {editingAddress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'address' as const, label: 'Dirección' },
                { key: 'country' as const, label: 'País' },
                { key: 'city' as const, label: 'Ciudad' },
                { key: 'department' as const, label: 'Departamento' },
                { key: 'postalCode' as const, label: 'Código postal' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">{f.label}</label>
                  <input
                    type="text"
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-500 transition-all"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
              {[
                { label: 'Dirección', value: form.address },
                { label: 'País', value: form.country },
                { label: 'Ciudad', value: form.city },
                { label: 'Departamento', value: form.department },
                { label: 'Código postal', value: form.postalCode },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[11px] font-bold text-zinc-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-zinc-800">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
