'use client'

import {
  MapPin,
  User,
  Package,
  MessageCircle,
  Zap,
  Truck,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_OPTIONS, formatCurrency, type Order } from './types'
import { StatusBadge } from './OrderStatusBadge'

interface OrderDetailPaneProps {
  activeOrder: Order | null
  storeName: string
  onUpdateStatus: (orderId: string, newStatus: string) => void
  onRequestDelivery: (orderId: string) => void
}

export function OrderDetailPane({
  activeOrder,
  storeName,
  onUpdateStatus,
  onRequestDelivery,
}: OrderDetailPaneProps) {
  return (
    <div className="xl:col-span-8">
      {activeOrder ? (
        <div className="rounded-lg bg-white border border-zinc-200 overflow-hidden divide-y divide-zinc-100 animate-fade-in ">
          {/* Header section */}
          <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-zinc-950 tracking-tight">
                  Pedido #{activeOrder.id.slice(-6).toUpperCase()}
                </h3>
                <span className="px-2 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-[9px] font-semibold text-zinc-500 tracking-wider">
                  {activeOrder.source || 'WEB'}
                </span>
                <StatusBadge status={activeOrder.status} />
              </div>
              <p suppressHydrationWarning className="text-xs font-semibold text-zinc-400 mt-1">
                Registrado el {new Date(activeOrder.createdAt).toLocaleString('es-CO')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-400 tracking-widest">
                Cambiar Estado:
              </span>
              <select
                value={activeOrder.status}
                onChange={e => onUpdateStatus(activeOrder.id, e.target.value)}
                className="h-10 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-semibold px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-950/20 text-zinc-800 cursor-pointer transition-colors shadow-sm"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client & Shipping info */}
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Client info block */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-zinc-400" />
                <h5 className="text-[11px] font-bold tracking-wider text-zinc-400">
                  Informacion del Cliente
                </h5>
              </div>
              <div className="p-5 bg-zinc-50/70 border border-zinc-200 rounded-lg space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 tracking-wider">
                    Nombre Completo
                  </p>
                  <p className="text-sm font-bold text-zinc-955 mt-0.5">
                    {activeOrder.customerName}
                  </p>
                </div>
                {activeOrder.customerPhone && (
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 tracking-wider">
                      Telefono WhatsApp
                    </p>
                    <p className="text-sm font-semibold text-zinc-800 mt-0.5">
                      {activeOrder.customerPhone}
                    </p>
                  </div>
                )}
              </div>

              {activeOrder.customerPhone && (
                <a
                  href={`https://wa.me/${activeOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hola ${activeOrder.customerName}! Confirmamos tu pedido en ${storeName}, saldra pronto a reparto.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-955 text-white rounded-lg font-semibold text-xs tracking-wider h-11 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Chat de WhatsApp
                </a>
              )}
            </div>

            {/* Shipping & Simulated Map */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <h5 className="text-[11px] font-bold tracking-wider text-zinc-400">
                  Ubicacion de Entrega
                </h5>
              </div>

              {/* Premium CSS-simulated Map Widget */}
              <div className="relative w-full h-56 rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 shadow-inner">
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
                  className="absolute inset-0 w-full h-full grayscale-[15%] contrast-[110%]"
                ></iframe>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activeOrder.address + ', ' + activeOrder.city
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 z-10 h-9 px-3 rounded-xl bg-white/95 backdrop-blur border border-zinc-200 text-[11px] font-semibold text-blue-600 flex items-center gap-1.5 shadow-sm hover:bg-white"
                >
                  Abrir en Maps
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                {/* Faux coordinates tag */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-zinc-200/80 flex flex-col gap-1 shadow-md max-w-[90%] pointer-events-none z-10">
                  <span className="text-[9px] font-extrabold text-zinc-400 tracking-widest">
                    Coordenadas de entrega
                  </span>
                  <span className="text-xs font-bold text-zinc-950 truncate leading-none">
                    {activeOrder.city} - {activeOrder.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver & Delivery logistics */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-zinc-400" />
              <h5 className="text-[11px] font-bold tracking-wider text-zinc-400">
                Logistica de Despacho
              </h5>
            </div>

            {activeOrder.driver ? (
              <div className="p-4 bg-zinc-50/70 rounded-lg border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-xs font-bold tracking-tight">
                    {activeOrder.driver.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-zinc-950">
                      {activeOrder.driver.name}
                    </p>
                    <p className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center gap-1.5">
                      Domiciliario Oficial -{' '}
                      <span className="text-zinc-900 font-bold">
                        {activeOrder.driver.ordersDelivered} entregas
                      </span>
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${activeOrder.driver.phoneNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider text-zinc-650 hover:text-zinc-950 transition-colors px-3 py-2 bg-white rounded-lg border border-gray-200 active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-zinc-500 fill-current" />
                  Contactar Repartidor
                </a>
              </div>
            ) : activeOrder.deliveryRequested ? (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-3.5 animate-pulse duration-1000">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    Solicitud de reparto enviada...
                  </p>
                  <p className="text-[10px] font-medium text-amber-600 mt-1">
                    Buscando un repartidor oficial disponible mediante WhatsApp. Te avisaremos inmediatamente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onRequestDelivery(activeOrder.id)}
                  className="w-full h-11 border border-zinc-950 text-zinc-950 hover:bg-zinc-950 hover:text-white rounded-lg text-xs font-semibold tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  Solicitar Repartidor Oficial
                </button>

                <button
                  onClick={() => onUpdateStatus(activeOrder.id, 'shipped')}
                  className="w-full h-11 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 rounded-lg text-xs font-semibold tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Despachar de forma propia
                </button>
              </div>
            )}
          </div>

          {/* Order Items Table */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-zinc-400" />
              <h5 className="text-[11px] font-bold tracking-wider text-zinc-400">
                Resumen de Productos
              </h5>
            </div>

            <div className="space-y-2">
              {activeOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-zinc-50/60 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
                >
                  <span className="text-xs font-semibold text-zinc-700">
                    <span className="text-zinc-955 font-bold tabular-nums mr-2.5">{item.qty}x</span>
                    {item.name}
                  </span>
                  <span className="text-xs font-semibold text-zinc-950 tabular-nums">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs font-bold text-zinc-400 tracking-widest">
                Total del Pedido
              </span>
              <span className="text-xl font-semibold text-zinc-950 tabular-nums tracking-tight">
                {formatCurrency(activeOrder.total)}
              </span>
            </div>
          </div>

          {/* Operations Footer */}
          <div className="p-6 bg-zinc-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={() => onUpdateStatus(activeOrder.id, 'confirmed')}
                className={cn(
                  'text-[10px] font-semibold tracking-wider px-3.5 py-2.5 rounded-xl border transition-all active:scale-95',
                  activeOrder.status === 'confirmed'
                    ? 'text-blue-600 bg-blue-50/50 border-blue-200/50'
                    : 'bg-white border-gray-200 text-zinc-500 hover:text-zinc-955 hover:bg-zinc-50'
                )}
              >
                Confirmar
              </button>
              <button
                onClick={() => onUpdateStatus(activeOrder.id, 'delivered')}
                className={cn(
                  'text-[10px] font-semibold tracking-wider px-3.5 py-2.5 rounded-xl border transition-all active:scale-95',
                  activeOrder.status === 'delivered'
                    ? 'text-zinc-600 bg-zinc-50 border-zinc-200/60'
                    : 'bg-white border-gray-200 text-zinc-500 hover:text-zinc-955 hover:bg-zinc-50'
                )}
              >
                Entregado
              </button>
              <button
                onClick={() => onUpdateStatus(activeOrder.id, 'cancelled')}
                className={cn(
                  'text-[10px] font-semibold tracking-wider px-3.5 py-2.5 rounded-xl border transition-all active:scale-95',
                  activeOrder.status === 'cancelled'
                    ? 'text-rose-600 bg-rose-50/50 border-rose-200/50'
                    : 'bg-white border-gray-200 text-zinc-500 hover:text-zinc-955 hover:bg-zinc-50'
                )}
              >
                Cancelar
              </button>
            </div>

            <button
              onClick={() => onUpdateStatus(activeOrder.id, 'delivered')}
              className="flex items-center justify-center gap-2 text-[10px] font-semibold tracking-widest text-zinc-500 hover:text-zinc-950 hover:bg-white border border-transparent hover:border-zinc-200 transition-all px-4 py-2.5 rounded-xl h-10 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              Finalizar Gestion
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center py-32 bg-white rounded-lg border border-gray-200/80 bg-white/50 text-center min-h-[450px]">
          <div className="w-16 h-16 rounded-full bg-zinc-50 border border-gray-200 flex items-center justify-center mb-5 text-zinc-300">
            <Package className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-zinc-950 tracking-tight font-display">
            Ningun pedido seleccionado
          </h4>
          <p className="text-zinc-400 text-xs font-medium max-w-xs mt-1.5 leading-relaxed">
            Haz clic en un pedido del listado izquierdo para visualizar su detalle y gestionar su despacho en tiempo real.
          </p>
        </div>
      )}
    </div>
  )
}

