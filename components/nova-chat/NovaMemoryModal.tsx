'use client'

import React from 'react'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NovaChatStore } from './types'

interface NovaMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  store: NovaChatStore
  activeProductsCount: number
  ordersCount: number
  activeChatsCount: number
}

export function NovaMemoryModal({
  isOpen,
  onClose,
  store,
  activeProductsCount,
  ordersCount,
  activeChatsCount
}: NovaMemoryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white border border-zinc-200 rounded-lg max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 leading-none">Memoria de Nova</h3>
            <p className="text-[10px] font-medium text-zinc-400 mt-1.5 leading-none">Contexto operativo y base de conocimientos activa</p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-left select-text">
          <div className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-lg text-[11px] font-semibold text-indigo-700 leading-normal">
            🤖 Nova utiliza la información en tiempo real de tu base de datos y canales integrados para entender el contexto de tu negocio de forma automática.
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider select-none">Contexto de la Tienda</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex flex-col justify-center">
                <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">Tienda</span>
                <span className="text-xs font-bold text-zinc-800 mt-1 block truncate leading-none">{store.name}</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex flex-col justify-center">
                <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">Plan Actual</span>
                <span className="text-xs font-bold text-zinc-800 mt-1 block truncate leading-none">
                  {store.verificationLevel === 0 ? 'Básico' : 'Pro'}
                </span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex flex-col justify-center">
                <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">WhatsApp</span>
                <span className={cn(
                  "text-xs font-bold mt-1 block leading-none",
                  store.whatsappConnected ? "text-emerald-700 font-extrabold" : "text-zinc-500"
                )}>
                  {store.whatsappConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex flex-col justify-center">
                <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">Pagos MP</span>
                <span className={cn(
                  "text-xs font-bold mt-1 block leading-none",
                  store.mpConnected ? "text-blue-700 font-extrabold" : "text-zinc-500"
                )}>
                  {store.mpConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider select-none">Actividad de tu Negocio</h4>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full shrink-0" />
                  <span className="truncate text-zinc-800">{activeProductsCount} productos activos</span>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 select-none">Inventario</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                  <span className="truncate text-zinc-800">{ordersCount} pedidos registrados</span>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 select-none">Ventas</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
                  <span className="truncate text-zinc-800">{activeChatsCount} chats de clientes</span>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 select-none">Mensajería</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider select-none">Herramientas Asociadas</h4>
            <div className="divide-y divide-zinc-100 bg-white border border-zinc-200 rounded-lg overflow-hidden">
              {[
                { label: 'Gestionar productos', href: '/productos' },
                { label: 'Ver pedidos y ventas', href: '/pedidos' },
                { label: 'Crear descuentos', href: '/descuentos' },
                { label: 'Configurar tienda', href: '/tienda' },
                { label: 'Respuestas automáticas', href: '/automatizaciones' }
              ].map((tool, idx) => (
                <Link 
                  key={idx}
                  href={tool.href}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 transition-colors group text-xs font-bold"
                >
                  <span>{tool.label}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 flex justify-end bg-zinc-50/50 select-none">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
