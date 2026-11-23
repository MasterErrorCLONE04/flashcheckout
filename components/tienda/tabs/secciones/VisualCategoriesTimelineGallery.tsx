'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { TiendaFormState } from '../../useTiendaForm'
import { uploadStoreImage } from '../../tiendaPersistence'

interface VisualCategoriesTimelineGalleryProps {
  form: TiendaFormState
}

export function VisualCategoriesEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { visualCategories, setVisualCategories } = form
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const addCategory = () => {
    setVisualCategories(prev => [
      ...prev,
      {
        category: `Categoría ${prev.length + 1}`,
        imageUrl:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      },
    ])
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Categorías Visuales (PDP Grid)
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Cuadrícula circular de fotos para navegar por tus colecciones.
          </p>
        </div>
        <button
          type="button"
          onClick={addCategory}
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir</span>
        </button>
      </div>

      <div className="space-y-3 pt-1 text-left">
        {visualCategories.map((catItem, idx) => (
          <div
            key={idx}
            className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-2 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">
                Categoría #{idx + 1}
              </span>
              {visualCategories.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setVisualCategories(prev => prev.filter((_, i) => i !== idx))
                  }
                  className="text-zinc-400 hover:text-rose-600 p-1 rounded hover:bg-zinc-200/50 transition-colors cursor-pointer border-0 bg-transparent"
                  title="Eliminar categoría visual"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">
                  Nombre de Categoría
                </label>
                <input
                  type="text"
                  value={catItem.category}
                  onChange={e => {
                    const newCats = [...visualCategories]
                    newCats[idx] = { ...catItem, category: e.target.value }
                    setVisualCategories(newCats)
                  }}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">
                  Imagen (URL o Archivo)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={catItem.imageUrl}
                    onChange={e => {
                      const newCats = [...visualCategories]
                      newCats[idx] = { ...catItem, imageUrl: e.target.value }
                      setVisualCategories(newCats)
                    }}
                    className="flex-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none"
                  />
                  <label className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
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
                          const newCats = [...visualCategories]
                          newCats[idx] = { ...catItem, imageUrl: url }
                          setVisualCategories(newCats)
                        } finally {
                          setUploadingIdx(null)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir Categoría Visual</span>
        </button>
      </div>
    </div>
  )
}

export function ProcessTimelineEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { processTimeline, setProcessTimeline } = form
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const addStep = () => {
    setProcessTimeline(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          step: `0${prev.items.length + 1}`,
          title: `Paso ${prev.items.length + 1}`,
          desc: 'Describe este paso de la experiencia o preparación.',
          imageUrl:
            'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=85',
        },
      ],
    }))
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Ritual Editorial / Pasos
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Declaración editorial + tarjetas verticales 4:5 de proceso.
          </p>
        </div>
        <button
          type="button"
          onClick={addStep}
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir paso</span>
        </button>
      </div>

      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Declaración Editorial Principal
          </label>
          <textarea
            value={processTimeline.headline || ''}
            onChange={e =>
              setProcessTimeline(prev => ({ ...prev, headline: e.target.value }))
            }
            rows={2}
            placeholder="Ej: Tres pasos esenciales para transformar tu rutina diaria."
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-3.5 border-t border-zinc-100 pt-3">
          {processTimeline.items.map((stepItem: any, idx: number) => (
            <div
              key={idx}
              className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">
                  Paso #{idx + 1}
                </span>
                {processTimeline.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setProcessTimeline(prev => ({
                        ...prev,
                        items: prev.items.filter((_, i) => i !== idx),
                      }))
                    }
                    className="text-zinc-400 hover:text-rose-600 p-1 rounded hover:bg-zinc-200/50 transition-colors cursor-pointer border-0 bg-transparent"
                    title="Eliminar paso"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">
                    Número
                  </label>
                  <input
                    type="text"
                    value={stepItem.step}
                    onChange={e => {
                      const newItems = [...processTimeline.items]
                      newItems[idx] = { ...stepItem, step: e.target.value }
                      setProcessTimeline(prev => ({ ...prev, items: newItems }))
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="col-span-9 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">
                    Título del Paso
                  </label>
                  <input
                    type="text"
                    value={stepItem.title}
                    onChange={e => {
                      const newItems = [...processTimeline.items]
                      newItems[idx] = { ...stepItem, title: e.target.value }
                      setProcessTimeline(prev => ({ ...prev, items: newItems }))
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">
                  Descripción del Paso
                </label>
                <input
                  type="text"
                  value={stepItem.desc}
                  onChange={e => {
                    const newItems = [...processTimeline.items]
                    newItems[idx] = { ...stepItem, desc: e.target.value }
                    setProcessTimeline(prev => ({ ...prev, items: newItems }))
                  }}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">
                  Foto Retrato 4:5 (URL o Archivo)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={stepItem.imageUrl || ''}
                    onChange={e => {
                      const newItems = [...processTimeline.items]
                      newItems[idx] = { ...stepItem, imageUrl: e.target.value }
                      setProcessTimeline(prev => ({ ...prev, items: newItems }))
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none"
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
                          const newItems = [...processTimeline.items]
                          newItems[idx] = { ...stepItem, imageUrl: url }
                          setProcessTimeline(prev => ({ ...prev, items: newItems }))
                        } finally {
                          setUploadingIdx(null)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addStep}
            className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Paso al Ritual</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function LifestyleGalleryEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { lifestyleGallery, setLifestyleGallery } = form
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const addPhoto = () => {
    setLifestyleGallery(prev => [
      ...prev,
      'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=85',
    ])
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Galería de Estilo de Vida
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Fotos reales de alta resolución intercaladas con tus colecciones.
          </p>
        </div>
        <button
          type="button"
          onClick={addPhoto}
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>Añadir foto</span>
        </button>
      </div>

      <div className="space-y-3 pt-1.5">
        {lifestyleGallery.map((imgUrl, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold text-zinc-400 uppercase block select-none">
                Imagen #{idx + 1}
              </label>
              {lifestyleGallery.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLifestyleGallery(prev => prev.filter((_, i) => i !== idx))
                  }
                  className="text-zinc-400 hover:text-rose-600 p-0.5 cursor-pointer bg-transparent border-0"
                  title="Eliminar foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={imgUrl}
                onChange={e => {
                  const newG = [...lifestyleGallery]
                  newG[idx] = e.target.value
                  setLifestyleGallery(newG)
                }}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none"
              />
              <label className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0">
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
                      const newG = [...lifestyleGallery]
                      newG[idx] = url
                      setLifestyleGallery(newG)
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
          onClick={addPhoto}
          className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir Foto Lifestyle</span>
        </button>
      </div>
    </div>
  )
}

export function NewsletterFooterEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { newsletterWidget, setNewsletterWidget } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">
          Pie de Página & Newsletter
        </h3>
        <p className="text-[11px] font-semibold text-zinc-400">
          Caja de suscripción para captar correos de clientes y compradores.
        </p>
      </div>

      <div className="space-y-3.5 pt-1.5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Título del newsletter
          </label>
          <input
            type="text"
            value={newsletterWidget.title}
            onChange={e =>
              setNewsletterWidget(prev => ({ ...prev, title: e.target.value }))
            }
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Subtítulo descriptivo
          </label>
          <textarea
            value={newsletterWidget.subtitle}
            onChange={e =>
              setNewsletterWidget(prev => ({ ...prev, subtitle: e.target.value }))
            }
            rows={2}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Texto del botón
          </label>
          <input
            type="text"
            value={newsletterWidget.btnText}
            onChange={e =>
              setNewsletterWidget(prev => ({ ...prev, btnText: e.target.value }))
            }
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="space-y-1.5 flex flex-col items-center select-none">
            <input
              type="color"
              value={newsletterWidget.bgColor}
              onChange={e =>
                setNewsletterWidget(prev => ({ ...prev, bgColor: e.target.value }))
              }
              className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
            />
            <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
              Fondo
            </span>
          </div>

          <div className="space-y-1.5 flex flex-col items-center select-none">
            <input
              type="color"
              value={newsletterWidget.textColor}
              onChange={e =>
                setNewsletterWidget(prev => ({
                  ...prev,
                  textColor: e.target.value,
                }))
              }
              className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
            />
            <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
              Texto
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VisualCategoriesTimelineGallery({
  form,
}: VisualCategoriesTimelineGalleryProps) {
  return (
    <div className="space-y-6">
      <VisualCategoriesEditor form={form} />
      <ProcessTimelineEditor form={form} />
      <LifestyleGalleryEditor form={form} />
      <NewsletterFooterEditor form={form} />
    </div>
  )
}
