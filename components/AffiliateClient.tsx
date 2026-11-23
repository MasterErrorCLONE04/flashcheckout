'use client'

import React, { useEffect, useState } from 'react'
import {
  Gift,
  Copy,
  Check,
  Share2,
  Store,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
} from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AffiliateStats {
  referred: number
  upgradedCount: number
  pendingCommission: number
  paidCommission: number
  referralsList: Array<{
    id?: string
    name: string
    slug?: string
    status: string
    isPro?: boolean
    date: string
  }>
}

export default function AffiliateClient({
  storeSlug,
  storeName,
  initialStats,
}: {
  storeSlug: string
  storeName: string
  initialStats?: AffiliateStats
}) {
  const [copied, setCopied] = useState(false)
  const appUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://flashcheckout.co'
  const affiliateUrl = `${appUrl}/sign-up?ref=${storeSlug}`

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = orig
    }
  }, [])

  const stats: AffiliateStats = initialStats || {
    referred: 0,
    upgradedCount: 0,
    pendingCommission: 0,
    paidCommission: 0,
    referralsList: [],
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(affiliateUrl)
    setCopied(true)
    toast.success('Enlace de referido copiado al portapapeles')
    setTimeout(() => setCopied(false), 2000)
  }

  function shareOnWhatsApp() {
    const text = encodeURIComponent(
      `¡Hola! Te recomiendo FlashCheckout para crear tu tienda online con cobros Bre-B y Agente Vendedor IA en WhatsApp. Regístrate con mi enlace: ${affiliateUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* 1. Top Studio Header Bar (h-13 / 53px) */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Gift className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Afiliados
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SiWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="hidden sm:inline">Compartir por WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            className="h-8 px-3.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enlace Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. 4-Column Real Referral KPIs (No Fake Click Formulas) */}
      <section className="shrink-0 bg-white border-b border-zinc-200 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Tiendas Referidas
            </span>
            <Store className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {stats.referred}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Comercios registrados con tu código
          </p>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Suscripciones Pro Activas
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {stats.upgradedCount}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Comercios referidos con plan pago
          </p>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Comisión en Curso
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-mono font-bold text-amber-600 tabular-nums mt-0.5">
            ${stats.pendingCommission.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            De comercios en periodo inicial
          </p>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Comisión Confirmada
            </span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-mono font-bold text-emerald-600 tabular-nums mt-0.5">
            ${stats.paidCommission.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            $12.000 COP por cada referido Pro
          </p>
        </div>
      </section>

      {/* 3. Main Split-Pane Studio Workspace */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Referral Link & Rules (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Enlace Único de {storeName}
                  </span>
                  <h2 className="text-sm font-bold text-zinc-950">
                    Invita otros comercios y recibe comisiones
                  </h2>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 font-mono text-xs font-bold text-zinc-900 break-all select-all">
                {affiliateUrl}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="h-9 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar link'}</span>
                </button>
                <button
                  type="button"
                  onClick={shareOnWhatsApp}
                  className="h-9 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SiWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                ¿Cómo funciona el programa?
              </h3>
              <div className="space-y-3 text-xs text-zinc-600">
                {[
                  'Comparte tu enlace único con otros emprendedores o marcas que vendan por WhatsApp e Instagram.',
                  'Cuando el comercio crea su tienda desde tu link, queda vinculado automáticamente a tu código en la base de datos.',
                  'Por cada tienda referida que active su suscripción Pro, recibes $12.000 COP de comisión directa vía Bre-B / transferencia.',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-zinc-950 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Real Referred Stores Ledger (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                  Registro Real de Comercios Referidos
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono font-bold text-zinc-700">
                {stats.referralsList.length} registrados
              </span>
            </div>

            {stats.referralsList.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-xs font-bold text-zinc-900">
                  Aún no hay comercios registrados con tu enlace
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                  En cuanto una tienda se registre usando tu link de referido, aparecerá automáticamente en esta tabla con su fecha y estado real.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <th className="py-2.5 px-4">Tienda</th>
                      <th className="py-2.5 px-3">Fecha Registro</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-4 text-right">Comisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {stats.referralsList.map((refStore, idx) => (
                      <tr key={refStore.id || idx} className="hover:bg-zinc-50/70">
                        <td className="py-3 px-4 font-bold text-zinc-950">
                          {refStore.name}
                        </td>
                        <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                          {refStore.date}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                              refStore.isPro
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            )}
                          >
                            {refStore.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-zinc-950">
                          $12.000 COP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
