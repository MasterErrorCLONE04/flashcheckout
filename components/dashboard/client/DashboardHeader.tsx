'use client'

import React from 'react'
import Link from 'next/link'
import {
  Download,
  Plus,
  ShoppingBag,
  FileText,
  Users,
  MessageSquare,
} from 'lucide-react'

interface DashboardHeaderProps {
  storeName: string
  showQuickActions: boolean
  setShowQuickActions: (val: boolean) => void
  onDownloadReport: () => void
}

export function DashboardHeader({
  storeName,
  showQuickActions,
  setShowQuickActions,
  onDownloadReport,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Panel de Control</h1>
        <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
          Monitoreo Operativo — Gestionando <span className="text-zinc-900 font-bold">{storeName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center justify-center gap-2 h-9 px-3.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>Acciones rápidas</span>
          </button>
          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-lg shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <Link href="/productos" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                <Plus className="w-4 h-4 text-zinc-400" />
                <span>Agregar producto</span>
              </Link>
              <Link href="/pedidos" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                <span>Ver pedidos</span>
              </Link>
              <Link href="/verificaciones" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Validar pagos</span>
              </Link>
              <Link href="/clientes" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Clientes</span>
              </Link>
              <Link href="/historial-chats" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <span>Abrir chats</span>
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={onDownloadReport}
          className="flex items-center justify-center gap-2 h-9 px-3.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Descargar Reporte</span>
        </button>
      </div>
    </div>
  )
}
