'use client'

import React from 'react'
import { cn } from "@/lib/utils"
import { Trash2 } from 'lucide-react'
import { TiendaFormState } from '../../useTiendaForm'

interface VisualCategoriesTimelineGalleryProps {
  form: TiendaFormState
}

export function VisualCategoriesEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { visualCategories, setVisualCategories } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Categorías Visuales (PDP Grid)</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Cuadrícula circular de fotos para navegar rápidamente por tus colecciones.</p>
      </div>

      <div className="space-y-3.5 pt-1.5 text-left">
        {visualCategories.map((catItem, idx) => (
          <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-2 relative">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Categoría #{idx + 1}</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Nombre</label>
                <input 
                  type="text"
                  value={catItem.category}
                  onChange={e => {
                    const newCats = [...visualCategories]
                    newCats[idx] = { ...catItem, category: e.target.value }
                    setVisualCategories(newCats)
                  }}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">URL Imagen</label>
                <input 
                  type="text"
                  value={catItem.imageUrl}
                  onChange={e => {
                    const newCats = [...visualCategories]
                    newCats[idx] = { ...catItem, imageUrl: e.target.value }
                    setVisualCategories(newCats)
                  }}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProcessTimelineEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { processTimeline, setProcessTimeline } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Ritual Editorial en 3 Pasos</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Declaración editorial + 3 tarjetas verticales 4:5 (estilo Water · Drop · Enjoy).</p>
      </div>

      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Declaración Editorial Principal</label>
          <textarea 
            value={processTimeline.headline || ''}
            onChange={e => setProcessTimeline(prev => ({ ...prev, headline: e.target.value }))}
            rows={2}
            placeholder="Ej: Tres pasos esenciales para transformar tu rutina diaria."
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-3.5 border-t border-zinc-100 pt-3">
          {processTimeline.items.map((stepItem: any, idx: number) => (
            <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Paso #{idx + 1}</span>
              
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Número</label>
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
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título del Paso</label>
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
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción del Paso</label>
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
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Foto Retrato 4:5 (URL)</label>
                <input 
                  type="text"
                  value={stepItem.imageUrl || ''}
                  onChange={e => {
                    const newItems = [...processTimeline.items]
                    newItems[idx] = { ...stepItem, imageUrl: e.target.value }
                    setProcessTimeline(prev => ({ ...prev, items: newItems }))
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LifestyleGalleryEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { lifestyleGallery, setLifestyleGallery } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Galería de Estilo de Vida</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Muestra hasta 4 fotos reales de alta resolución intercaladas con tus colecciones.</p>
      </div>

      <div className="space-y-3.5 pt-1.5">
        {lifestyleGallery.map((imgUrl, idx) => (
          <div key={idx} className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-400 uppercase block select-none">Imagen #{idx + 1} (URL)</label>
            <input 
              type="text"
              value={imgUrl}
              onChange={e => {
                const newG = [...lifestyleGallery]
                newG[idx] = e.target.value
                setLifestyleGallery(newG)
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function NewsletterFooterEditor({ form }: VisualCategoriesTimelineGalleryProps) {
  const { newsletterWidget, setNewsletterWidget } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Pie de Página & Newsletter</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Caja de suscripción para captar correos de clientes y compradores.</p>
      </div>

      <div className="space-y-3.5 pt-1.5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título del newsletter</label>
          <input 
            type="text"
            value={newsletterWidget.title}
            onChange={e => setNewsletterWidget(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Subtítulo descriptivo</label>
          <textarea 
            value={newsletterWidget.subtitle}
            onChange={e => setNewsletterWidget(prev => ({ ...prev, subtitle: e.target.value }))}
            rows={2}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="space-y-1.5 flex flex-col items-center select-none">
            <input 
              type="color" 
              value={newsletterWidget.bgColor}
              onChange={e => setNewsletterWidget(prev => ({ ...prev, bgColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
            />
            <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Fondo</span>
          </div>

          <div className="space-y-1.5 flex flex-col items-center select-none">
            <input 
              type="color" 
              value={newsletterWidget.textColor}
              onChange={e => setNewsletterWidget(prev => ({ ...prev, textColor: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
            />
            <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Texto</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VisualCategoriesTimelineGallery({ form }: VisualCategoriesTimelineGalleryProps) {
  return (
    <div className="space-y-6">
      <VisualCategoriesEditor form={form} />
      <ProcessTimelineEditor form={form} />
      <LifestyleGalleryEditor form={form} />
      <NewsletterFooterEditor form={form} />
    </div>
  )
}
