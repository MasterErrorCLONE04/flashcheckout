'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Download,
  Plus,
  ShoppingBag,
  FileText,
  Users,
  MessageSquare,
  LayoutDashboard,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Bot,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  storeName: string
  storeSlug?: string
  storeUrl?: string
  whatsappConnected?: boolean
  aiActive?: boolean
  copied?: boolean
  onCopyLink?: () => void
  onOpenQrModal?: () => void
  showQuickActions: boolean
  setShowQuickActions: (val: boolean) => void
  onDownloadReport: () => void
}

export function DashboardHeader({
  storeName,
  storeSlug,
  storeUrl,
  whatsappConnected = false,
  aiActive = true,
  copied = false,
  onCopyLink,
  onOpenQrModal,
  showQuickActions,
  setShowQuickActions,
  onDownloadReport,
}: DashboardHeaderProps) {
  const searchParams = useSearchParams()
  const currentDays = searchParams.get('days') === '30' ? '30' : '7'

  return (
    <header className="h-14 bg-white border-b border-zinc-200 px-4 lg:px-6 flex items-center justify-between gap-3 shrink-0 z-20 select-none">
      {/* LEFT: Studio Identity, Store Pill & Live Status Badges */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-zinc-950 tracking-tight truncate">
              {storeName}
            </h1>
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0',
                whatsappConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  whatsappConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                )}
              />
              {whatsappConnected ? 'WhatsApp Conectado' : 'WhatsApp Offline'}
            </span>

            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
              <Bot className="w-3 h-3 text-zinc-700" />
              {aiActive ? 'Agente IA Activo' : 'IA en Pausa'}
            </span>
          </div>
          <p className="text-[10.5px] text-zinc-400 font-medium truncate">
            Centro de Mando · Operación en tiempo real
          </p>
        </div>

        {/* Store URL Pill */}
        {storeUrl && (
          <div className="hidden xl:flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1 ml-2">
            <span className="text-[11px] font-semibold text-zinc-600 truncate max-w-[180px]">
              {storeSlug ? `${storeSlug}.flashcheckout.co` : storeUrl.replace(/^https?:\/\//, '')}
            </span>
            {onCopyLink && (
              <button
                type="button"
                onClick={onCopyLink}
                className="p-1 rounded-md hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                title="Copiar enlace de tienda"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
            {onOpenQrModal && (
              <button
                type="button"
                onClick={onOpenQrModal}
                className="p-1 rounded-md hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
                title="Ver código QR de la tienda"
              >
                <QrCode className="w-3 h-3" />
              </button>
            )}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md hover:bg-zinc-200/70 text-zinc-500 hover:text-zinc-950 transition-colors"
              title="Abrir tienda pública"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* RIGHT: Period Filter, Export, Quick Actions & Primary CTA */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 7d / 30d Period Switcher */}
        <div className="hidden sm:flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80">
          <Link
            href="/dashboard?days=7"
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
              currentDays === '7'
                ? 'bg-white text-zinc-950 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            )}
          >
            7 días
          </Link>
          <Link
            href="/dashboard?days=30"
            className={cn(
              'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
              currentDays === '30'
                ? 'bg-white text-zinc-950 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            )}
          >
            30 días
          </Link>
        </div>

        {/* Export CSV */}
        <button
          type="button"
          onClick={onDownloadReport}
          className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Descargar reporte comercial en CSV"
        >
          <Download className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden md:inline">Exportar</span>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">Atajos</span>
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in duration-150">
              <Link
                href="/productos"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Agregar producto</span>
              </Link>
              <Link
                href="/pedidos"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Gestionar pedidos</span>
              </Link>
              <Link
                href="/verificaciones"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Validar pagos Bre-B</span>
              </Link>
              <Link
                href="/conversaciones"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                <span>Abrir CRM WhatsApp</span>
              </Link>
              <Link
                href="/clientes"
                onClick={() => setShowQuickActions(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>Directorio de clientes</span>
              </Link>
            </div>
          )}
        </div>

        {/* Primary Store Builder CTA */}
        <Link
          href="/tienda"
          className="h-9 px-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Editar Tienda</span>
        </Link>
      </div>
    </header>
  )
}
