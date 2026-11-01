import React from 'react'
import Link from 'next/link'
import {
  Film,
  Video,
  Zap,
  ShoppingBag,
  Smartphone,
  Camera,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StudioMainTab, Product } from './types'

interface StudioIaHeaderProps {
  store: {
    name: string
    isPro: boolean
    creditsAvailable: number
    whatsappConnected: boolean
  }
  products: Product[]
  selectedProduct: Product | null
  savedCreationsCount: number
  mainTab: StudioMainTab
  onTabChange: (tab: StudioMainTab) => void
}

export function StudioIaHeader({
  store,
  products,
  selectedProduct,
  savedCreationsCount,
  mainTab,
  onTabChange
}: StudioIaHeaderProps) {
  const tabs = [
    { id: 'video' as const, label: 'Video & Avatar Studio', icon: Video, badge: 'Reels 9:16' },
    { id: 'foto' as const, label: 'Foto Studio IA', icon: Camera, badge: 'FLUX & RMBG' },
    { id: 'contenido' as const, label: 'Redactor Publicitario', icon: FileText, badge: 'Copy AIDA' },
    { id: 'creaciones' as const, label: 'Biblioteca de Activos', count: savedCreationsCount, icon: ShoppingBag }
  ]

  return (
    <>
      {/* ── HEADER ACTIONS MATCHING /dashboard ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Studio IA</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-purple-50 text-purple-700 border-purple-200">
              Generativo
            </span>
          </div>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Motor de Contenido Multimedia — Gestionando <span className="text-zinc-900 font-bold">{store.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onTabChange('video')}
            className={cn(
              "flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer",
              mainTab === 'video'
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
            )}
          >
            <Video className="w-3.5 h-3.5 text-zinc-400" />
            <span>Crear Video Reel</span>
          </button>
          
          <button
            onClick={() => onTabChange('creaciones')}
            className={cn(
              "flex items-center justify-center gap-2 h-9 px-3.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95",
              mainTab === 'creaciones'
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
            )}
          >
            <Film className="w-3.5 h-3.5 text-zinc-400" />
            <span>Biblioteca ({savedCreationsCount})</span>
          </button>
        </div>
      </div>

      {/* ── BENTO GRID ROW 1: KPI CARDS MATCHING /dashboard ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Balance IA */}
        <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 shadow-none">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Balance de Créditos</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                {store.creditsAvailable} <span className="text-sm font-semibold text-zinc-400">créditos</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500">
              {store.isPro ? 'Plan PRO activo' : 'Plan Free'}
            </span>
            {!store.isPro && (
              <Link href="/pricing" className="text-[10px] font-bold text-purple-600 hover:underline">
                Recargar →
              </Link>
            )}
          </div>
        </div>

        {/* Card 2: Catálogo Disponible */}
        <div 
          onClick={() => onTabChange('foto')} 
          className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 shadow-none cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Productos para Video</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                {products.length} <span className="text-sm font-semibold text-zinc-400">en catálogo</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 truncate">
              <span>{selectedProduct ? `Seleccionado: ${selectedProduct.name}` : 'Catálogo listo para generar'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Creaciones Guardadas */}
        <div 
          onClick={() => onTabChange('creaciones')}
          className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 shadow-none cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Contenido Generado</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                {savedCreationsCount} <span className="text-sm font-semibold text-zinc-400">piezas</span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
              <span>Listo para WhatsApp & Reels</span>
            </div>
          </div>
        </div>

        {/* Card 4: Canal de Difusión */}
        <div className="p-5 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between group transition-all duration-300 hover:border-zinc-300 hover:-translate-y-0.5 shadow-none">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block leading-none">Canal de Difusión</span>
              <span className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight block mt-1.5">
                {store.whatsappConnected ? 'Conectado' : 'Sin vincular'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-200">
              <Smartphone className={cn("w-4 h-4", store.whatsappConnected ? "text-emerald-600" : "text-amber-500")} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full inline-block",
                store.whatsappConnected ? "bg-emerald-500" : "bg-amber-500"
              )} />
              <span>{store.whatsappConnected ? 'Estados de WhatsApp 1-Clic' : 'Vincular en Dashboard'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS MENU EXACT MATCHING /dashboard & /agente ─────────────────── */}
      <div className="flex items-center gap-6 pb-px border-b border-zinc-200 overflow-x-auto select-none no-scrollbar">
        {tabs.map(t => {
          const Icon = t.icon
          const isActive = mainTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "border-zinc-900 text-zinc-900 font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                  isActive 
                    ? "bg-zinc-900 text-white" 
                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                )}>
                  {t.badge}
                </span>
              )}
              {t.count !== undefined && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-bold",
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
