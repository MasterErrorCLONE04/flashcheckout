'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { AgentSettingsState } from '../useAgentSettingsState'

interface TabCatalogoProps {
  agent: AgentSettingsState
}

export function TabCatalogo({ agent }: TabCatalogoProps) {
  const {
    products,
    editingProductId,
    setEditingProductId,
    editingAiDescription,
    setEditingAiDescription,
    savingProductId,
    handleSaveProductAI
  } = agent

  return (
    <div className="space-y-5 animate-in">
      <div className="p-6 bg-white border border-zinc-200 rounded-lg space-y-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Entrenamiento por producto</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Controla qué productos puede sugerir la IA y dale instrucciones específicas de recomendación.
          </p>
        </div>

        <div className="divide-y divide-zinc-200 border-t border-zinc-100">
          {products.length === 0 ? (
            <p className="text-center py-8 text-zinc-400 text-xs font-semibold">No hay productos registrados en el catálogo.</p>
          ) : (
            products.map(p => {
              const isEditing = editingProductId === p.id
              return (
                <div key={p.id} className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-950">{p.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                        ${p.price.toLocaleString('es-CO')} · {p.active ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Recommend toggle */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-zinc-400">Recomendar</span>
                        <input
                          type="checkbox"
                          checked={p.aiRecommendation}
                          onChange={e => handleSaveProductAI(p.id, e.target.checked, p.aiDescription)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/20"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (isEditing) {
                            setEditingProductId(null)
                          } else {
                            setEditingProductId(p.id)
                            setEditingAiDescription(p.aiDescription)
                          }
                        }}
                        className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 transition-colors"
                      >
                        {isEditing ? 'Cancelar' : 'Entrenar'}
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-lg space-y-3 animate-in">
                      <label className="text-[10px] font-bold text-zinc-400 block">Detalles adicionales para la IA (Ej: tallas, cuidados, material):</label>
                      <textarea
                        rows={3}
                        value={editingAiDescription}
                        onChange={e => setEditingAiDescription(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold outline-none focus:border-emerald-500 transition-all resize-none text-zinc-950 placeholder:text-zinc-300"
                        placeholder="Escribe instrucciones especiales que el bot usará para describir este producto..."
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSaveProductAI(p.id, p.aiRecommendation, editingAiDescription)}
                          disabled={savingProductId === p.id}
                          className="flex items-center gap-1.5 h-8 px-4 bg-zinc-950 text-white rounded-lg text-[10px] font-bold tracking-wide cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {savingProductId === p.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Guardar Instrucciones</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
