'use client'

import React, { useState, useEffect } from 'react'
import {
  MapPin,
  User,
  Package,
  MessageCircle,
  Truck,
  ArrowUpRight,
  FileText,
  Copy,
  CheckCircle2,
  Send,
  ExternalLink,
  Image as ImageIcon,
  Ban,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { STATUS_OPTIONS, getOrderStage, formatCurrency, type Order } from './types'
import { StatusBadge } from './OrderStatusBadge'

interface OrderDetailPaneProps {
  activeOrder: Order | null
  storeName: string
  updatingId?: string | null
  onUpdateStatus: (
    orderId: string,
    newStatus: string,
    extra?: { externalCarrier?: string; trackingNumber?: string }
  ) => void
  onRequestDelivery: (orderId: string) => void
}

const CARRIERS = [
  'Servientrega',
  'Coordinadora',
  'Inter Rapidísimo',
  'Envía',
  'TCC',
  'Domiciliario Propio',
]

export function OrderDetailPane({
  activeOrder,
  storeName,
  updatingId,
  onUpdateStatus,
  onRequestDelivery,
}: OrderDetailPaneProps) {
  const [carrier, setCarrier] = useState('Servientrega')
  const [tracking, setTracking] = useState('')

  useEffect(() => {
    if (activeOrder) {
      setCarrier(activeOrder.externalCarrier || 'Servientrega')
      setTracking(activeOrder.trackingNumber || '')
    }
  }, [activeOrder?.id])

  if (!activeOrder) {
    return (
      <main className="flex-1 min-w-0 h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center mb-3 text-zinc-400 shadow-2xs">
          <Package className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-extrabold text-zinc-950">
          Estación de Despacho & Logística
        </h4>
        <p className="text-[11px] text-zinc-400 max-w-xs mt-1 leading-relaxed">
          Selecciona un pedido de la columna izquierda para gestionar su alistamiento, guía de transporte, domiciliario o factura.
        </p>
      </main>
    )
  }

  const stage = getOrderStage(activeOrder)
  const isUpdating = updatingId === activeOrder.id
  const cleanPhone = (activeOrder.customerPhone || '').replace(/\D/g, '')

  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt)
    toast.success(`${label} copiado al portapapeles`)
  }

  const handleDispatchExternal = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateStatus(activeOrder.id, 'shipped_external', {
      externalCarrier: carrier,
      trackingNumber: tracking.trim(),
    })
  }

  const PIPELINE_STEPS = [
    { id: 'pending', label: '1. Recibido', targetStatus: 'pending' },
    { id: 'confirmed', label: '2. Confirmado', targetStatus: 'confirmed' },
    { id: 'shipped', label: '3. En Reparto / Guía', targetStatus: 'shipped_external' },
    { id: 'delivered', label: '4. Entregado', targetStatus: 'delivered' },
  ] as const

  const stepIndex =
    stage === 'pending'
      ? 0
      : stage === 'confirmed'
        ? 1
        : stage === 'shipped'
          ? 2
          : stage === 'delivered'
            ? 3
            : -1

  return (
    <main className="flex-1 min-w-0 h-full bg-[#FAFAFA] flex flex-col overflow-hidden select-none">
      {/* 1. CABECERA FIJA DE LA ORDEN ACTIVA */}
      <div className="bg-white border-b border-zinc-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-mono text-xs font-black flex items-center justify-center shrink-0">
            #{activeOrder.id.slice(-3).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black text-zinc-950 font-mono">
                Pedido #{activeOrder.id.slice(-6).toUpperCase()}
              </h2>
              <StatusBadge
                status={activeOrder.status}
                paymentStatus={activeOrder.paymentStatus}
              />
              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                {activeOrder.source === 'WHATSAPP' ||
                activeOrder.source === 'WHATSAPP_WEBVIEW'
                  ? 'WhatsApp IA'
                  : 'Tienda Web'}
              </span>
            </div>
            <p suppressHydrationWarning className="text-[11px] font-medium text-zinc-400 mt-0.5">
              Creado el {new Date(activeOrder.createdAt).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {/* Acciones rápidas de Cabecera */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              window.open(`/api/orders/invoice/${activeOrder.id}`, '_blank', 'noopener,noreferrer')
            }
            className="h-8 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Abrir factura / orden de pedido para imprimir"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <span>Factura / Imprimir</span>
          </button>

          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hola ${activeOrder.customerName}! Te escribimos de ${storeName} respecto a tu pedido #${activeOrder.id.slice(-6).toUpperCase()}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          )}

          <select
            value={activeOrder.status}
            disabled={isUpdating}
            onChange={e => onUpdateStatus(activeOrder.id, e.target.value)}
            className="h-8 bg-zinc-950 text-white rounded-xl text-[11px] font-bold px-3 outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value} className="bg-white text-zinc-900">
                Estado: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. BARRA DE PROGRESO DE ALISTAMIENTO Y ENTREGA (4 PASOS INTERACTIVOS) */}
      <div className="bg-white border-b border-zinc-200 px-5 py-2.5 flex items-center justify-between gap-2 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 flex-1">
          {PIPELINE_STEPS.map((st, idx) => {
            const isCompleted = stepIndex >= idx
            const isCurrent = stepIndex === idx
            return (
              <button
                key={st.id}
                type="button"
                disabled={isUpdating}
                onClick={() => onUpdateStatus(activeOrder.id, st.targetStatus)}
                className={cn(
                  'flex-1 h-8 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border',
                  isCurrent
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                    : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'
                )}
              >
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{st.label}</span>
              </button>
            )
          })}
        </div>

        {stage !== 'cancelled' && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(activeOrder.id, 'cancelled')}
            className="h-8 px-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-zinc-500 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            title="Cancelar pedido"
          >
            <Ban className="w-3 h-3" />
            <span className="hidden sm:inline">Cancelar</span>
          </button>
        )}
      </div>

      {/* 3. CUERPO SCROLLABLE DE LA ESTACIÓN DE TRABAJO (2 COLUMNAS) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* COLUMNA IZQUIERDA (7 COLS): Artículos + Despacho con Guía / Domiciliario */}
          <div className="xl:col-span-7 space-y-4">
            {/* Tarjeta 1: Artículos del Pedido & Resumen Financiero */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-zinc-800" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Artículos del Pedido ({activeOrder.items.reduce((s, i) => s + i.qty, 0)} uds)
                  </h3>
                </div>
                <span className="text-xs font-black text-zinc-950 tabular-nums">
                  Total: {formatCurrency(activeOrder.total)}
                </span>
              </div>

              <div className="divide-y divide-zinc-100">
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-5 py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 font-mono font-black text-zinc-900 flex items-center justify-center shrink-0 tabular-nums">
                        {item.qty}x
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-950 truncate">{item.name}</p>
                        <p className="text-[10.5px] text-zinc-400 tabular-nums">
                          {formatCurrency(item.price)} c/u
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-zinc-950 tabular-nums shrink-0">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3.5 bg-zinc-50/70 border-t border-zinc-200/80 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Total de la Orden
                </span>
                <span className="text-lg font-black text-zinc-950 tabular-nums">
                  {formatCurrency(activeOrder.total)} COP
                </span>
              </div>
            </div>

            {/* Si el cliente subió comprobante Bre-B / Transferencia */}
            {activeOrder.proofImageUrl && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Comprobante de Pago Adjunto
                  </span>
                  <a
                    href={activeOrder.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1"
                  >
                    <span>Ver imagen completa</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={activeOrder.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-24 h-24 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={activeOrder.proofImageUrl}
                      alt="Comprobante"
                      className="w-full h-full object-cover"
                    />
                  </a>
                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-zinc-600 font-medium leading-snug">
                      El comprador subió este comprobante de transferencia. Confirma el pedido para pasar a alistamiento.
                    </p>
                    {stage === 'pending' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onUpdateStatus(activeOrder.id, 'paid')}
                        className="h-8 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Aprobar Pago y Confirmar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tarjeta 2: Logística de Despacho & Notificación de Guía por WhatsApp */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-zinc-800" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Despacho & Guía de Envío
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Envía los datos de la transportadora al WhatsApp del comprador automáticamente
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <form onSubmit={handleDispatchExternal} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-600 block">
                        Transportadora / Medio
                      </label>
                      <select
                        value={carrier}
                        onChange={e => setCarrier(e.target.value)}
                        className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-bold text-zinc-800 outline-none cursor-pointer"
                      >
                        {CARRIERS.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-600 block">
                        Número de Guía (opcional)
                      </label>
                      <input
                        type="text"
                        value={tracking}
                        onChange={e => setTracking(e.target.value)}
                        placeholder="Ej. 2049581920"
                        className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs font-bold text-zinc-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full sm:flex-1 h-9 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Despachar y Notificar Guía por WhatsApp</span>
                    </button>

                    {!activeOrder.driver && !activeOrder.deliveryRequested && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onRequestDelivery(activeOrder.id)}
                        className="w-full sm:w-auto h-9 px-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Domiciliario Local</span>
                      </button>
                    )}
                  </div>
                </form>

                {activeOrder.driver && (
                  <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center text-xs font-bold">
                        {activeOrder.driver.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-950">
                          {activeOrder.driver.name}
                        </p>
                        <p className="text-[10.5px] text-zinc-500">
                          Domiciliario asignado · {activeOrder.driver.ordersDelivered} entregas
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${activeOrder.driver.phoneNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-800 inline-flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Contactar</span>
                    </a>
                  </div>
                )}

                {activeOrder.deliveryRequested && !activeOrder.driver && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <span>Buscando domiciliario local cercano por WhatsApp...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (5 COLS): Datos del Cliente + Mapa de Destino */}
          <div className="xl:col-span-5 space-y-4">
            {/* Ficha del Comprador */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                  Destinatario & Contacto
                </h3>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Cliente</span>
                  <span className="font-bold text-zinc-950">{activeOrder.customerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">WhatsApp</span>
                  {activeOrder.customerPhone ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-zinc-900">
                        +{cleanPhone}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(`+${cleanPhone}`, 'Teléfono')}
                        className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                        title="Copiar teléfono"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-zinc-400">Sin teléfono</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium">Ciudad</span>
                  <span className="font-bold text-zinc-900">{activeOrder.city}</span>
                </div>

                <div className="pt-2 border-t border-zinc-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium">Dirección de entrega</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(`${activeOrder.address}, ${activeOrder.city}`, 'Dirección')
                      }
                      className="text-[10.5px] font-bold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </button>
                  </div>
                  <p className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 font-semibold text-zinc-900">
                    {activeOrder.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Mapa de Ubicación de Entrega */}
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-800" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Mapa de Destino
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activeOrder.address + ', ' + activeOrder.city
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-zinc-700 hover:text-zinc-950 inline-flex items-center gap-1"
                >
                  <span>Abrir en Maps</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              <div className="relative w-full h-56 bg-zinc-100">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    activeOrder.address + ', ' + activeOrder.city
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full grayscale-[10%]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
