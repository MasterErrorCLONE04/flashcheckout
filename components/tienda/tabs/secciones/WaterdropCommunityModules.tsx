'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { TiendaFormState } from '../../useTiendaForm'
import { uploadStoreImage } from '../../tiendaPersistence'

interface WaterdropCommunityModulesProps {
  form: TiendaFormState
}

export function PressLogosEditor({ form }: WaterdropCommunityModulesProps) {
  const { pressLogos, setPressLogos } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Barra de Prensa & Sellos Oficiales
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Franja monocromática minimalista de medios, premios o respaldos de calidad.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setPressLogos(prev => [
              ...prev,
              { name: 'NUEVO SELLO', subtitle: 'Verificado' },
            ])
          }
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir</span>
        </button>
      </div>

      <div className="space-y-2.5 pt-1">
        {pressLogos.map((logo, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <input
              type="text"
              value={logo.name}
              onChange={e => {
                const next = [...pressLogos]
                next[idx] = { ...logo, name: e.target.value }
                setPressLogos(next)
              }}
              placeholder="Marca / Medio"
              className="col-span-5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-zinc-900 focus:outline-none"
            />
            <input
              type="text"
              value={logo.subtitle || ''}
              onChange={e => {
                const next = [...pressLogos]
                next[idx] = { ...logo, subtitle: e.target.value }
                setPressLogos(next)
              }}
              placeholder="Subtítulo opcional"
              className="col-span-6 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setPressLogos(prev => prev.filter((_, i) => i !== idx))}
              className="col-span-1 text-zinc-400 hover:text-red-500 p-1 bg-transparent border-0 cursor-pointer flex justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setPressLogos(prev => [
              ...prev,
              { name: 'NUEVO SELLO', subtitle: 'Verificado' },
            ])
          }
          className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-lg text-xs font-bold text-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Añadir Sello
        </button>
      </div>
    </div>
  )
}

export function AmbassadorsEditor({ form }: WaterdropCommunityModulesProps) {
  const { ambassadors, setAmbassadors } = form
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const addAmbassador = () => {
    setAmbassadors(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: `Embajador #${prev.items.length + 1}`,
          role: 'Cliente Verificado',
          imageUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
        },
      ],
    }))
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Embajadores & Comunidad
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Carrusel de retratos editoriales de embajadores o clientes destacados.
          </p>
        </div>
        <button
          type="button"
          onClick={addAmbassador}
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir</span>
        </button>
      </div>

      <div className="space-y-3 pt-1">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase block">
            Título de la sección
          </label>
          <input
            type="text"
            value={ambassadors.title}
            onChange={e =>
              setAmbassadors(prev => ({ ...prev, title: e.target.value }))
            }
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
          />
        </div>

        {ambassadors.items.map((person, idx) => (
          <div
            key={idx}
            className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-2 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400">
                Embajador #{idx + 1}
              </span>
              {ambassadors.items.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setAmbassadors(prev => ({
                      ...prev,
                      items: prev.items.filter((_, i) => i !== idx),
                    }))
                  }
                  className="text-zinc-400 hover:text-rose-600 p-0.5 cursor-pointer bg-transparent border-0"
                  title="Eliminar embajador"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={person.name}
                onChange={e => {
                  const next = [...ambassadors.items]
                  next[idx] = { ...person, name: e.target.value }
                  setAmbassadors(prev => ({ ...prev, items: next }))
                }}
                placeholder="Nombre"
                className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
              />
              <input
                type="text"
                value={person.role}
                onChange={e => {
                  const next = [...ambassadors.items]
                  next[idx] = { ...person, role: e.target.value }
                  setAmbassadors(prev => ({ ...prev, items: next }))
                }}
                placeholder="Rol / Especialidad"
                className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={person.imageUrl}
                onChange={e => {
                  const next = [...ambassadors.items]
                  next[idx] = { ...person, imageUrl: e.target.value }
                  setAmbassadors(prev => ({ ...prev, items: next }))
                }}
                placeholder="URL de foto retrato (3:4)"
                className="flex-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none"
              />
              <label className="h-7 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
                <Upload className="w-3 h-3" />
                <span>{uploadingIdx === idx ? '...' : 'Subir'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploadingIdx(idx)
                    try {
                      const url = await uploadStoreImage(file, 'banner')
                      const next = [...ambassadors.items]
                      next[idx] = { ...person, imageUrl: url }
                      setAmbassadors(prev => ({ ...prev, items: next }))
                    } finally {
                      setUploadingIdx(null)
                    }
                  }}
                />
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addAmbassador}
          className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-lg text-xs font-bold text-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Añadir Embajador
        </button>
      </div>
    </div>
  )
}

export function UgcGalleryEditor({ form }: WaterdropCommunityModulesProps) {
  const { ugcGallery, setUgcGallery } = form
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const addUgcPhoto = () => {
    setUgcGallery(prev => [
      ...prev,
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    ])
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Mural Social UGC & Clientes Reales
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Collage de fotos reales compartidas por tus clientes.
          </p>
        </div>
        <button
          type="button"
          onClick={addUgcPhoto}
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir foto</span>
        </button>
      </div>

      <div className="space-y-2 pt-1">
        {ugcGallery.map((url, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <input
              type="text"
              value={url}
              onChange={e => {
                const next = [...ugcGallery]
                next[idx] = e.target.value
                setUgcGallery(next)
              }}
              placeholder={`Foto UGC #${idx + 1} (URL)`}
              className="flex-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none"
            />
            <label className="h-7 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
              <Upload className="w-3 h-3" />
              <span>{uploadingIdx === idx ? '...' : 'Subir'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadingIdx(idx)
                  try {
                    const uploadedUrl = await uploadStoreImage(file, 'banner')
                    const next = [...ugcGallery]
                    next[idx] = uploadedUrl
                    setUgcGallery(next)
                  } finally {
                    setUploadingIdx(null)
                  }
                }}
              />
            </label>
            {ugcGallery.length > 1 && (
              <button
                type="button"
                onClick={() => setUgcGallery(prev => prev.filter((_, i) => i !== idx))}
                className="p-1 text-zinc-400 hover:text-red-500 bg-transparent border-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addUgcPhoto}
          className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-lg text-xs font-bold text-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Añadir Foto al Mural
        </button>
      </div>
    </div>
  )
}

export function RetailersEditor({ form }: WaterdropCommunityModulesProps) {
  const { retailers, setRetailers } = form

  const addRetailer = () => {
    setRetailers(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { name: `Ciudad / Sede #${prev.items.length + 1}`, badge: 'Entrega 24h' },
      ],
    }))
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Puntos de Venta & Cobertura
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Muestra tus sedes físicas, distribuidores o ciudades con entrega rápida.
          </p>
        </div>
        <button
          type="button"
          onClick={addRetailer}
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir</span>
        </button>
      </div>

      <div className="space-y-3 pt-1">
        <input
          type="text"
          value={retailers.title}
          onChange={e => setRetailers(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Título (Ej: Cobertura & Puntos Oficiales)"
          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
        />
        <input
          type="text"
          value={retailers.subtitle}
          onChange={e =>
            setRetailers(prev => ({ ...prev, subtitle: e.target.value }))
          }
          placeholder="Subtítulo descriptivo"
          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none"
        />
        <div className="space-y-2">
          {retailers.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={item.name}
                onChange={e => {
                  const next = [...retailers.items]
                  next[idx] = { ...item, name: e.target.value }
                  setRetailers(prev => ({ ...prev, items: next }))
                }}
                placeholder="Ciudad o sede"
                className="col-span-6 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
              />
              <input
                type="text"
                value={item.badge || ''}
                onChange={e => {
                  const next = [...retailers.items]
                  next[idx] = { ...item, badge: e.target.value }
                  setRetailers(prev => ({ ...prev, items: next }))
                }}
                placeholder="Etiqueta (Ej: 24h)"
                className="col-span-5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setRetailers(prev => ({
                    ...prev,
                    items: prev.items.filter((_, i) => i !== idx),
                  }))
                }
                className="col-span-1 text-zinc-400 hover:text-red-500 p-1 bg-transparent border-0 cursor-pointer flex justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addRetailer}
            className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-lg text-xs font-bold text-zinc-700 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir Ciudad o Punto de Entrega
          </button>
        </div>
      </div>
    </div>
  )
}

export function WaterdropCommunityModules({ form }: WaterdropCommunityModulesProps) {
  return (
    <div className="space-y-6">
      <PressLogosEditor form={form} />
      <AmbassadorsEditor form={form} />
      <UgcGalleryEditor form={form} />
      <RetailersEditor form={form} />
    </div>
  )
}
