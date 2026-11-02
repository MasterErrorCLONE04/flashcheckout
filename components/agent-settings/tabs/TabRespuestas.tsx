'use client'

import React from 'react'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { AgentSettingsState } from '../useAgentSettingsState'

interface TabRespuestasProps {
  agent: AgentSettingsState
}

export function TabRespuestas({ agent }: TabRespuestasProps) {
  const {
    newQuestion,
    setNewQuestion,
    newAnswer,
    setNewAnswer,
    handleAddFaq,
    isAddingFaq,
    faqs,
    handleDeleteFaq,
    deletingFaqId
  } = agent

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-in">
      {/* Form to add FAQ */}
      <div className="md:col-span-5 p-5 bg-white border border-zinc-200 rounded-lg space-y-4">
        <div>
          <h3 className="text-xs font-bold text-zinc-900">Agregar FAQ</h3>
          <p className="text-[10px] text-zinc-400 mt-1">Suministra respuestas manuales para que el bot responda preguntas comunes.</p>
        </div>

        <form onSubmit={handleAddFaq} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 tracking-wider">Pregunta clave (Palabras clave)</label>
            <input
              type="text"
              required
              placeholder="Ej: Metodos de pago"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500/35 text-zinc-950 placeholder:text-zinc-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 tracking-wider">Respuesta automática</label>
            <textarea
              rows={4}
              required
              placeholder="Aceptamos Nequi, Daviplata, Mercado Pago y Contra entrega en Bogota..."
              value={newAnswer}
              onChange={e => setNewAnswer(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500/35 text-zinc-950 placeholder:text-zinc-300 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isAddingFaq}
            className="w-full flex items-center justify-center gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isAddingFaq ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Añadir al bot</span>
          </button>
        </form>
      </div>

      {/* FAQs List */}
      <div className="md:col-span-7 p-5 bg-white border border-zinc-200 rounded-lg space-y-4">
        <h3 className="text-xs font-bold text-zinc-900">Base de conocimiento del agente ({faqs.length})</h3>

        <div className="divide-y divide-zinc-100 max-h-[350px] overflow-y-auto pr-1">
          {faqs.length === 0 ? (
            <p className="text-center py-16 text-zinc-400 text-xs italic font-bold">No hay preguntas de respuestas rápidas creadas.</p>
          ) : (
            faqs.map(faq => (
              <div key={faq.id} className="py-3 flex items-start justify-between gap-4 group">
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-extrabold text-zinc-950 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold pr-2 pl-3">{faq.answer}</p>
                </div>

                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  disabled={deletingFaqId === faq.id}
                  className="w-8 h-8 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors border-none shrink-0"
                  title="Eliminar FAQ"
                >
                  {deletingFaqId === faq.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
