'use client'

import React from 'react'
import Link from 'next/link'
import { Bot, CheckCircle2 } from 'lucide-react'

interface TabIntegracionesProps {
  storeId: string
}

export function TabIntegraciones({ storeId }: TabIntegracionesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in">
      {/* WhatsApp Integration card */}
      <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 leading-none">WhatsApp API Gateway</h4>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">Activo (Evolution API)</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
            Conexión nativa de mensajería bidireccional de alto rendimiento.
          </p>
          
          <div className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-lg text-[9px] font-bold text-zinc-500 space-y-1">
            <div>Instancia: <span className="text-zinc-800 font-bold">store_{storeId.slice(0, 8)}</span></div>
            <div>Token de conexión: <span className="text-zinc-800 font-bold font-mono">45d55ad587...</span></div>
          </div>
        </div>

        <Link
          href="/configuracion?tab=integraciones"
          className="w-full text-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[10px] font-bold transition-all"
        >
          Gestionar Conexión
        </Link>
      </div>

      {/* Mercado Pago card */}
      <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 leading-none">Pasarela Mercado Pago</h4>
              <span className="text-[9px] text-blue-600 font-bold block mt-1">Conectado (OAuth 2.0)</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
            Los links de pago se generan automáticamente por la IA tras confirmar el pedido.
          </p>
        </div>

        <Link
          href="/configuracion?tab=pagos"
          className="w-full text-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[10px] font-bold transition-all"
        >
          Configurar Pagos
        </Link>
      </div>
    </div>
  )
}
