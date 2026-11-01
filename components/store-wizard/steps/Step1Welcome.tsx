'use client'

import React from 'react'
import {
  MessageSquare,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Sparkles,
  Clock
} from 'lucide-react'

export function Step1Welcome() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
          Bienvenido a Flashcheckouts
        </h1>
        <p className="text-sm md:text-base font-semibold text-zinc-700">
          La plataforma AI-First para vender automáticamente por WhatsApp.
        </p>
        <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">
          Configura tu tienda en menos de 5 minutos. Nova atenderá a tus compradores, enviará tu catálogo y cerrará ventas 24/7.
        </p>
      </div>

      {/* 2x2 Bento Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-zinc-950">Venta 24/7 por WhatsApp</h3>
          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
            Nova atiende clientes, responde preguntas y concreta carritos de compra sin pausas.
          </p>
        </div>

        <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-zinc-950">Catálogo Inteligente</h3>
          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
            Sube fotos, sincroniza precios y comparte tu menú visual instantáneamente.
          </p>
        </div>

        <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-zinc-950">Pagos Automatizados</h3>
          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
            Recibe pagos por Nequi, Daviplata, Mercado Pago o PSE con validación segura.
          </p>
        </div>

        <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-zinc-950">Control Centralizado</h3>
          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
            Métricas en tiempo real, trazabilidad de pedidos y gestión de clientes desde tu panel.
          </p>
        </div>
      </div>

      {/* Guarantee Banner */}
      <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-zinc-950 shrink-0" />
          <span className="text-xs font-semibold text-zinc-800">
            Configuración guiada y sin complicaciones en pocos clics.
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 bg-white border border-zinc-200 px-2 py-0.5 rounded-full shrink-0">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>~3 min</span>
        </div>
      </div>
    </div>
  )
}
