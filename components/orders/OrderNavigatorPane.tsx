'use client'

import React from 'react'
import { ShoppingBag, Search, MapPin, X, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, type Order } from './types'
import { StatusBadge } from './OrderStatusBadge'

interface OrderNavigatorPaneProps {
  orders: Order[]
  filteredOrders: Order[]
  filter: string
  onFilterChange: (value: string) => void
  sourceFilter?: 'all' | 'web' | 'whatsapp'
  onSourceFilterChange?: (value: 'all' | 'web' | 'whatsapp') => void
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedOrderId: string | null
  onSelectOrder: (orderId: string) => void
}

export function OrderNavigatorPane({
  orders,
  filteredOrders,
  sourceFilter = 'all',
  onSourceFilterChange,
  searchQuery,
  onSearchChange,
  selectedOrderId,
  onSelectOrder,
}: OrderNavigatorPaneProps) {
  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 h-full bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col overflow-hidden select-none">
      {/* Cabecera Fija de Búsqueda y Filtro por Canal */}
      <div className="p-3.5 border-b border-zinc-200 space-y-2.5 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por #ID, cliente, ciudad o producto..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-8 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg pl-9 pr-8 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
            {[
              { id: 'all' as const, label: 'Todos los canales' },
              { id: 'web' as const, label: 'Tienda Web' },
              { id: 'whatsapp' as const, label: 'WhatsApp IA' },
            ].map(src => (
              <button
                key={src.id}
                type="button"
                onClick={() => onSourceFilterChange?.(src.id)}
                className={cn(
                  'h-6 px-2.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer border-0',
                  sourceFilter === src.id
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                {src.label}
              </button>
            ))}
          </div>

          <span className="text-[10.5px] font-bold text-zinc-400 tabular-nums shrink-0">
            {filteredOrders.length} / {orders.length}
          </span>
        </div>
      </div>

      {/* Lista Scrollable de Órdenes */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {filteredOrders.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-2.5">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-zinc-900">
              No hay pedidos en esta etapa
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Prueba cambiando el filtro superior o buscando otro término.
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isSelected = order.id === selectedOrderId
            const isWa =
              order.source === 'WHATSAPP' || order.source === 'WHATSAPP_WEBVIEW'
            const itemsCount = order.items.reduce((sum, it) => sum + (it.qty || 1), 0)
            const firstItemName = order.items[0]?.name || 'Pedido en tienda'

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectOrder(order.id)}
                className={cn(
                  'w-full text-left p-3.5 transition-all flex flex-col gap-2 cursor-pointer border-0 relative',
                  isSelected
                    ? 'bg-zinc-950/[0.045] border-l-2 border-l-zinc-950'
                    : 'bg-white hover:bg-zinc-50/80'
                )}
              >
                {/* Fila 1: Código, Canal y Monto */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-xs font-black text-zinc-950">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded text-[9.5px] font-bold',
                        isWa
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          : 'bg-zinc-100 text-zinc-700'
                      )}
                    >
                      {isWa ? 'WhatsApp' : 'Web'}
                    </span>
                    {order.trackingNumber && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 text-[9px] font-bold">
                        <Truck className="w-2.5 h-2.5" />
                        Guía
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-black text-zinc-950 tabular-nums shrink-0">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                {/* Fila 2: Cliente y Resumen de Producto */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-900 truncate">
                    {order.customerName}
                  </span>
                  <span className="text-[10.5px] font-medium text-zinc-500 truncate max-w-[150px]">
                    {itemsCount} uds · {firstItemName}
                  </span>
                </div>

                {/* Fila 3: Ciudad, Fecha y Estado */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span
                    suppressHydrationWarning
                    className="text-[10.5px] font-medium text-zinc-400 flex items-center gap-1 truncate"
                  >
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {order.city} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>

                  <StatusBadge
                    status={order.status}
                    paymentStatus={order.paymentStatus}
                  />
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
