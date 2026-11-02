'use client'

import Link from 'next/link'
import {
  Download,
  Plus,
  ShoppingBag,
  FileText,
  Users,
  MessageSquare,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'

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
    <PageHeader
      title="Panel de Control"
      statusDot="emerald"
      subtitle={
        <>
          Monitoreo operativo — Gestionando{' '}
          <span className="text-zinc-900 font-semibold">{storeName}</span>
        </>
      }
      actions={
        <>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>Acciones rápidas</span>
            </Button>
            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-lg shadow-lg py-2 z-50 animate-in fade-in duration-200">
                <Link
                  href="/productos"
                  className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-zinc-400" />
                  <span>Agregar producto</span>
                </Link>
                <Link
                  href="/pedidos"
                  className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  <span>Ver pedidos</span>
                </Link>
                <Link
                  href="/verificaciones"
                  className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Validar pagos</span>
                </Link>
                <Link
                  href="/clientes"
                  className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span>Clientes</span>
                </Link>
                <Link
                  href="/historial-chats"
                  className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <span>Abrir chats</span>
                </Link>
              </div>
            )}
          </div>

          <Button variant="outline" onClick={onDownloadReport}>
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Descargar Reporte</span>
          </Button>
        </>
      }
    />
  )
}
