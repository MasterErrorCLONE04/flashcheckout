'use client'

import React from 'react'
import { X, Terminal } from 'lucide-react'
import { Agent } from '../types'

interface ConsolidatedLogsModalProps {
  isOpen: boolean
  onClose: () => void
  consolidatedLogs: string[]
  consolidatedEndRef: React.RefObject<HTMLDivElement | null>
  agents: Agent[]
}

export function ConsolidatedLogsModal({
  isOpen,
  onClose,
  consolidatedLogs,
  consolidatedEndRef,
  agents
}: ConsolidatedLogsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-zinc-150 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-between items-center mb-4 select-none pr-8">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-zinc-800" />
            <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Visor de Actividades Generales (The Office Logs)</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-600 tracking-wider uppercase">Stream Consolidado</span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-4 font-semibold">
          Registro de acciones en tiempo real ejecutadas por los agentes en el espacio modular.
        </p>

        <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-xl max-h-96 overflow-y-auto space-y-2 font-mono text-[10.5px] text-zinc-650">
          {consolidatedLogs.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 font-semibold">
              No hay actividades registradas aún.
            </div>
          ) : (
            consolidatedLogs.map((log, idx) => {
              let colorClass = 'text-zinc-600'
              agents.forEach(a => {
                if (log.includes(`[${a.name}]`)) {
                  if (a.color === 'emerald') colorClass = 'text-emerald-650 font-semibold'
                  else if (a.color === 'teal') colorClass = 'text-teal-650 font-semibold'
                  else if (a.color === 'blue') colorClass = 'text-blue-650 font-semibold'
                  else if (a.color === 'amber') colorClass = 'text-amber-650 font-semibold'
                }
              })
              if (log.includes('ORDEN RECIBIDA')) colorClass = 'text-purple-650 font-bold border-b border-dashed border-zinc-200/85 pb-0.5 mb-0.5'
              
              return (
                <div key={idx} className={colorClass}>
                  {log}
                </div>
              )
            })
          )}
          <div ref={consolidatedEndRef} />
        </div>

        <div className="flex justify-end pt-4 select-none">
          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl px-5 py-2.5 text-center cursor-pointer transition-all active:scale-[0.98] border border-zinc-800"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  )
}
