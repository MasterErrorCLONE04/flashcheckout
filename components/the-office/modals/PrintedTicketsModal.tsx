'use client'

import React from 'react'
import { X, Printer } from 'lucide-react'
import { PrintedTicket } from '../types'

interface PrintedTicketsModalProps {
  isOpen: boolean
  onClose: () => void
  printedTickets: PrintedTicket[]
}

export function PrintedTicketsModal({
  isOpen,
  onClose,
  printedTickets
}: PrintedTicketsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-zinc-150 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4 select-none">
          <Printer className="w-5 h-5 text-zinc-800" />
          <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Tickets de Operación Impresos</h2>
        </div>

        <p className="text-xs text-zinc-500 mb-4 font-semibold">
          Registro físico simulado de las operaciones de base de datos exitosas realizadas por el equipo de agentes.
        </p>

        <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-xl max-h-80 overflow-y-auto space-y-3.5 font-mono text-[10px] text-zinc-650">
          {printedTickets.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-semibold">
              No hay tickets impresos en esta sesión. Envía comandos con herramientas para generar recibos.
            </div>
          ) : (
            printedTickets.map((t, idx) => (
              <div key={idx} className="border-b border-dashed border-zinc-200 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between text-zinc-500 font-bold mb-1">
                  <span>[{t.time}] {t.action}</span>
                  <span>AGENTE: {t.agent}</span>
                </div>
                <div className="text-zinc-700 pl-2 border-l border-zinc-300 leading-relaxed">
                  {t.details}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
