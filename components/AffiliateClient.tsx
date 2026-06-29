'use client'

import { useState } from 'react'
import { Gift, Copy, Check, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AffiliateClient({ storeSlug, storeName }: { storeSlug: string, storeName: string }) {
  const [copied, setCopied] = useState(false)
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://flashcheckout.co'
  const affiliateUrl = `${appUrl}/sign-up?ref=${storeSlug}`

  function copyToClipboard() {
    navigator.clipboard.writeText(affiliateUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simulated metrics
  const stats = {
    clicks: 124,
    referred: 3,
    pendingCommission: 36000, // in COP
    paidCommission: 12000, // in COP
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Programa de Afiliados</h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Recomienda FlashCheckout a otros comerciantes y gana el 10% de comisión en cada Pase Beta vendido.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Link card */}
      <div className="premium-card p-8 md:p-10 bg-white border border-zinc-200 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-50/50 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-white">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase leading-none mb-1">Enlace de afiliado único</p>
              <h3 className="text-base font-bold text-zinc-900">Comparte este link para empezar a ganar</h3>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 flex items-center gap-4 group-hover:border-zinc-300 transition-all font-mono text-sm font-bold text-zinc-800 truncate select-all">
              {affiliateUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className={cn(
                "h-14 px-8 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm border",
                copied 
                  ? "bg-zinc-950 text-white border-zinc-950" 
                  : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3px]" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Enlace
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Clicks */}
        <div className="premium-card p-6 bg-white border border-zinc-200 flex flex-col justify-between group">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-2">Visitas (Clics)</p>
            <p className="text-3xl font-semibold text-zinc-950 tabular-nums">{stats.clicks}</p>
          </div>
          <p className="text-[10px] font-semibold text-zinc-400 mt-4 leading-none">Personas que abrieron tu link</p>
        </div>

        {/* Referred */}
        <div className="premium-card p-6 bg-white border border-zinc-200 flex flex-col justify-between group">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-2">Tiendas Referidas</p>
            <p className="text-3xl font-semibold text-zinc-950 tabular-nums">{stats.referred}</p>
          </div>
          <p className="text-[10px] font-semibold text-zinc-400 mt-4 leading-none">Comercios registrados y activos</p>
        </div>

        {/* Pending Commission */}
        <div className="premium-card p-6 bg-white border border-zinc-200 flex flex-col justify-between group">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-2">Comisiones Pendientes</p>
            <p className="text-3xl font-semibold text-zinc-950 tabular-nums">${stats.pendingCommission.toLocaleString('es-CO')}</p>
          </div>
          <p className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit mt-4 font-bold uppercase tracking-tight">Por transferir</p>
        </div>

        {/* Paid Commission */}
        <div className="premium-card p-6 bg-white border border-zinc-200 flex flex-col justify-between group">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-2">Comisiones Pagadas</p>
            <p className="text-3xl font-semibold text-zinc-950 tabular-nums">${stats.paidCommission.toLocaleString('es-CO')}</p>
          </div>
          <p className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit mt-4 font-bold uppercase tracking-tight">Transferido</p>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* How it works */}
        <div className="p-8 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-6">
          <h4 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">¿Cómo funciona el programa?</h4>
          <div className="space-y-4 font-medium text-zinc-600 text-xs">
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center shrink-0">1</span>
              <p className="leading-relaxed pt-0.5">Comparte tu enlace de afiliado con marcas independientes en Medellín, Bogotá o cualquier ciudad.</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center shrink-0">2</span>
              <p className="leading-relaxed pt-0.5">El comerciante se registra y compra nuestro Pase de Beta Tester por un valor único de $30 USD (aprox. $120.000 COP).</p>
            </div>
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center shrink-0">3</span>
              <p className="leading-relaxed pt-0.5">Tú ganas el 10% de comisión ($12.000 COP) por cada referido exitoso, transferido semanalmente a tu cuenta Nequi o Bancolombia.</p>
            </div>
          </div>
        </div>

        {/* Affiliate guidelines */}
        <div className="premium-card p-8 bg-white border border-zinc-200 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Coordinación de Pagos</h4>
            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
              Los balances se cortan los días viernes. Si tienes comisiones acumuladas por transferir, nuestro equipo te escribirá directamente a tu WhatsApp configurado para realizarte el depósito sin cargos administrativos.
            </p>
          </div>
          
          <div className="pt-6 border-t border-zinc-100 flex items-center gap-3">
             <span className="text-[10px] font-bold text-zinc-400 uppercase">¿Tienes dudas?</span>
             <a 
               href="https://wa.me/573001234567?text=Tengo%20una%20duda%20sobre%20el%20programa%20de%20afiliados%20de%20FlashCheckout" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="text-xs font-bold text-zinc-900 hover:text-zinc-500 flex items-center gap-1 cursor-pointer"
             >
               Escríbenos <ArrowUpRight className="w-3.5 h-3.5" />
             </a>
          </div>
        </div>
      </div>
    </div>
  )
}
