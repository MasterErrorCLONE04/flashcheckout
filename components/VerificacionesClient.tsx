'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileCheck2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Smartphone,
  Wallet,
  ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ManualVerificationPanel from '@/components/dashboard/ManualVerificationPanel'
import StoreVerificationManager from '@/components/dashboard/StoreVerificationManager'

type SerializedVerificationOrder = {
  id: string
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  items: { name: string; qty: number; price: number }[]
  total: number
  status: string
  createdAt: string
  paymentStatus: string
  proofImageUrl: string | null
  adminComment: string | null
}

type SerializedVerificationStore = {
  id: string
  name: string
  whatsapp: string
  active: boolean
  verificationLevel: number
  whatsappVerified: boolean
  pausedReason: string | null
  idProofUrl: string | null
  strikes: number
}

interface VerificacionesClientProps {
  store: SerializedVerificationStore
  initialOrders: SerializedVerificationOrder[]
  currentVolume: number
  currentCount: number
}

export default function VerificacionesClient({
  store,
  initialOrders,
  currentVolume,
  currentCount,
}: VerificacionesClientProps) {
  const [activeTab, setActiveTab] = useState<'comprobantes' | 'kyc'>('comprobantes')

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = orig
    }
  }, [])

  const pendingVolume = initialOrders.reduce((acc, o) => acc + o.total, 0)

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* 1. Top Studio Header Bar (h-13 / 53px) */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Verificaciones
          </h1>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
          <button
            type="button"
            onClick={() => setActiveTab('comprobantes')}
            className={cn(
              'h-7 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
              activeTab === 'comprobantes'
                ? 'bg-white text-zinc-950 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            )}
          >
            <span>Comprobantes Bre-B</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded text-[10px] font-mono font-bold',
                activeTab === 'comprobantes'
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-200/80 text-zinc-600'
              )}
            >
              {initialOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kyc')}
            className={cn(
              'h-7 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
              activeTab === 'kyc'
                ? 'bg-white text-zinc-950 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-900'
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Seguridad & Nivel KYC</span>
          </button>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/pagos"
            className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold hidden sm:inline-flex items-center gap-1.5 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-zinc-500" />
            <span>Tesorería</span>
          </Link>
          <Link
            href="/pedidos"
            className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Ver Pedidos</span>
          </Link>
        </div>
      </header>

      {/* 2. 4-Column Real KPI Strip */}
      <section className="shrink-0 bg-white border-b border-zinc-200 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab('comprobantes')}
          className="px-5 py-3 text-left hover:bg-zinc-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Por Validar Ahora
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {initialOrders.length}{' '}
            <span className="text-xs font-sans font-medium text-zinc-400">
              (${pendingVolume.toLocaleString('es-CO')})
            </span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Soportes subidos esperando aprobación
          </p>
        </button>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Aprobados este Mes
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {currentCount}{' '}
            <span className="text-xs font-sans font-medium text-zinc-400">
              (${currentVolume.toLocaleString('es-CO')})
            </span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Transferencias confirmadas en el mes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('kyc')}
          className="px-5 py-3 text-left hover:bg-zinc-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Nivel de Seguridad
            </span>
            <ShieldCheck
              className={cn(
                'w-3.5 h-3.5',
                store.verificationLevel === 1 ? 'text-emerald-600' : 'text-zinc-400'
              )}
            />
          </div>
          <p className="text-lg font-bold text-zinc-950 mt-0.5">
            {store.verificationLevel === 1 ? 'Nivel 1 (Verificado)' : 'Nivel 0 (Básico)'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {store.verificationLevel === 1
              ? 'Sin límites de recaudo manual'
              : 'Sube tu documento para quitar límites'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kyc')}
          className="px-5 py-3 text-left hover:bg-zinc-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              WhatsApp Propietario
            </span>
            <Smartphone
              className={cn(
                'w-3.5 h-3.5',
                store.whatsappVerified ? 'text-emerald-600' : 'text-amber-500'
              )}
            />
          </div>
          <p className="text-lg font-bold text-zinc-950 mt-0.5">
            {store.whatsappVerified ? 'Verificado' : 'Pendiente OTP'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            +{store.whatsapp || 'Sin número configurado'}
          </p>
        </button>
      </section>

      {/* 3. Main Scrollable Studio Body */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-[1500px] mx-auto">
          {activeTab === 'comprobantes' ? (
            <ManualVerificationPanel initialOrders={initialOrders} />
          ) : (
            <StoreVerificationManager
              store={store}
              currentVolume={currentVolume}
              currentCount={currentCount}
            />
          )}
        </div>
      </div>
    </div>
  )
}
