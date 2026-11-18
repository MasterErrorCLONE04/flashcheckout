'use client'

import React from 'react'
import { cn } from "@/lib/utils"
import { TiendaFormState } from '../../useTiendaForm'

interface IngredientsTrustFaqsProps {
  form: TiendaFormState
}

export function IngredientsEditor({ form }: IngredientsTrustFaqsProps) {
  const { ingredientsSection, setIngredientsSection } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Ingredientes & Ficha de Pureza</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Layout simétrico de 3 columnas con foto en el centro y características explicativas.</p>
      </div>

      <div className="space-y-3.5 pt-1 text-left">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título de Sección</label>
          <input 
            type="text"
            value={ingredientsSection.title}
            onChange={e => setIngredientsSection(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1.5">
          <div className="space-y-1.5 p-3 bg-zinc-50 rounded-lg">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Columna Izquierda</span>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
              <input 
                type="text"
                value={ingredientsSection.leftTitle}
                onChange={e => setIngredientsSection(prev => ({ ...prev, leftTitle: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción</label>
              <textarea 
                value={ingredientsSection.leftDesc}
                onChange={e => setIngredientsSection(prev => ({ ...prev, leftDesc: e.target.value }))}
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5 p-3 bg-zinc-50 rounded-lg">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Columna Derecha</span>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
              <input 
                type="text"
                value={ingredientsSection.rightTitle}
                onChange={e => setIngredientsSection(prev => ({ ...prev, rightTitle: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción</label>
              <textarea 
                value={ingredientsSection.rightDesc}
                onChange={e => setIngredientsSection(prev => ({ ...prev, rightDesc: e.target.value }))}
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL Imagen Central</label>
          <input 
            type="text"
            value={ingredientsSection.centerImageUrl}
            onChange={e => setIngredientsSection(prev => ({ ...prev, centerImageUrl: e.target.value }))}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}

export function FaqsEditor({ form }: IngredientsTrustFaqsProps) {
  const { faqs, setFaqs } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Preguntas Frecuentes (FAQ)</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Resuelve dudas sobre envíos, medios de pago y garantías para cerrar ventas.</p>
      </div>

      <div className="space-y-3.5 pt-1 text-left">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título de la sección</label>
          <input
            type="text"
            value={faqs.title}
            onChange={e => setFaqs(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          {faqs.items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
              <input
                type="text"
                value={item.q}
                onChange={e => {
                  const newItems = [...faqs.items]
                  newItems[idx] = { ...item, q: e.target.value }
                  setFaqs(prev => ({ ...prev, items: newItems }))
                }}
                placeholder="¿Pregunta frecuente?"
                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
              />
              <textarea
                rows={2}
                value={item.a}
                onChange={e => {
                  const newItems = [...faqs.items]
                  newItems[idx] = { ...item, a: e.target.value }
                  setFaqs(prev => ({ ...prev, items: newItems }))
                }}
                placeholder="Respuesta detallada..."
                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none font-sans"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TestimonialsEditor({ form }: IngredientsTrustFaqsProps) {
  const { testimonials, setTestimonials } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
      <div className="space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Testimonios de Clientes</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Aumenta las conversiones mostrando opiniones de compradores verificados.</p>
      </div>

      <div className="space-y-3.5 pt-1 text-left">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título</label>
            <input
              type="text"
              value={testimonials.title}
              onChange={e => setTestimonials(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Subtítulo</label>
            <input
              type="text"
              value={testimonials.subtitle}
              onChange={e => setTestimonials(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          {testimonials.items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => {
                    const newItems = [...testimonials.items]
                    newItems[idx] = { ...item, name: e.target.value }
                    setTestimonials(prev => ({ ...prev, items: newItems }))
                  }}
                  placeholder="Nombre cliente"
                  className="w-1/2 bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                />
                <input
                  type="text"
                  value={item.city}
                  onChange={e => {
                    const newItems = [...testimonials.items]
                    newItems[idx] = { ...item, city: e.target.value }
                    setTestimonials(prev => ({ ...prev, items: newItems }))
                  }}
                  placeholder="Ciudad"
                  className="w-1/2 bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                />
              </div>
              <textarea
                rows={2}
                value={item.comment}
                onChange={e => {
                  const newItems = [...testimonials.items]
                  newItems[idx] = { ...item, comment: e.target.value }
                  setTestimonials(prev => ({ ...prev, items: newItems }))
                }}
                placeholder="Comentario u opinión..."
                className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none font-sans"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function IngredientsTrustFaqs({ form }: IngredientsTrustFaqsProps) {
  return (
    <div className="space-y-6">
      <IngredientsEditor form={form} />
      <FaqsEditor form={form} />
      <TestimonialsEditor form={form} />
    </div>
  )
}
