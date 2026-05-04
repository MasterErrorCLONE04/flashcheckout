'use client'

import { useState } from 'react'
import {
  ShoppingBag,
  MapPin,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Package,
  MessageCircle,
  ExternalLink,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type OrderItem = {
  name: string
  qty: number
  price: number
}

type Order = {
  id: string
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Nuevo', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'confirmed', label: 'Confirmado', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { value: 'shipped', label: 'En camino', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'delivered', label: 'Entregado', color: 'text-white bg-emerald-600 border-emerald-600' },
  { value: 'cancelled', label: 'Cancelado', color: 'text-rose-700 bg-rose-50 border-rose-200' },
]

export default function OrderList({
  initialOrders,
  storeName,
}: {
  initialOrders: Order[]
  storeName: string
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filteredOrders =
    filter === 'all' ? orders : orders.filter(o => o.status === filter)

  async function updateStatus(orderId: string, newStatus: string) {
    // Optimistic update
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
    
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-dashed border-zinc-200 rounded-xl max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 mb-1">Sin actividad</h3>
        <p className="text-zinc-500 text-xs font-medium max-w-xs mx-auto leading-relaxed">
          Tus pedidos aparecerán aquí automáticamente en tiempo real.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in duration-300">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <FilterTab
          label="Todos"
          value="all"
          active={filter === 'all'}
          count={orders.length}
          onClick={() => setFilter('all')}
        />
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s.value).length
          if (count === 0 && filter !== s.value) return null
          return (
            <FilterTab
              key={s.value}
              label={s.label}
              value={s.value}
              active={filter === s.value}
              count={count}
              onClick={() => setFilter(s.value)}
            />
          )
        })}
      </div>

      {/* Orders Grid */}
      <div className="space-y-3">
        {filteredOrders.map(order => {
          const isExpanded = expandedId === order.id
          const items = Array.isArray(order.items) ? order.items : []

          return (
            <div
              key={order.id}
              className={cn(
                "rounded-xl overflow-hidden bg-white border border-zinc-200 transition-all duration-300 shadow-sm",
                isExpanded ? "ring-1 ring-zinc-400 border-zinc-300 bg-white" : "hover:border-zinc-300"
              )}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 text-left group gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 border",
                    isExpanded ? "bg-zinc-900 border-zinc-900 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-400 group-hover:bg-zinc-100"
                  )}>
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-zinc-900 truncate tracking-tight">
                      {order.customerName}
                    </h4>
                    <p className="text-xs font-medium tracking-tight text-zinc-400 mt-0.5">
                      {order.city} · {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 md:mt-0">
                  <div className="text-left md:text-right">
                    <p className="text-base font-bold text-zinc-900 tabular-nums leading-none mb-1.5 tracking-tight">
                      ${order.total.toLocaleString('es-CO')}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-all border-zinc-200 text-zinc-400",
                    isExpanded ? "bg-zinc-50 text-zinc-900" : "group-hover:bg-zinc-50"
                  )}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Details Pane */}
              {isExpanded && (
                <div className="border-t border-zinc-100 p-4 sm:p-5 bg-zinc-50/50 space-y-6 animate-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Items Table */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 px-1">
                        <Package className="w-3.5 h-3.5 text-zinc-400" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Resumen de Orden</h5>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
                          >
                            <span className="text-sm font-semibold text-zinc-600">
                              <span className="text-zinc-900 font-bold tabular-nums mr-2.5">{item.qty}×</span>
                              {item.name}
                            </span>
                            <span className="text-sm font-bold text-zinc-900 tabular-nums">
                              ${(item.price * item.qty).toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 px-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Entrega</h5>
                        </div>
                        <div className="p-3.5 bg-white rounded-lg border border-zinc-200">
                          <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                            {order.address}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400 mt-2 tracking-wider uppercase">
                            COLOMBIA · {order.city}
                          </p>
                        </div>
                      </div>

                      {order.customerPhone && (
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `¡Hola ${order.customerName}! Confirmamos tu pedido en ${storeName}, saldrá pronto a reparto.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:brightness-105 h-10 shadow-sm transition-all active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4 fill-current text-white" />
                          Notificar por WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 border-t border-zinc-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          className={cn(
                            "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all active:scale-95",
                            order.status === s.value 
                              ? s.color 
                              : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    
                    <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors tracking-tight px-3 py-1.5 hover:bg-zinc-100 rounded-lg">
                      <Zap className="w-3.5 h-3.5" />
                      Finalizar Gestión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const option = STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0]
  return (
    <span className={cn(
      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block",
      option.color
    )}>
      {option.label}
    </span>
  )
}

function FilterTab({
  label,
  value,
  active,
  count,
  onClick,
}: {
  label: string
  value: string
  active: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 h-9 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border active:scale-95",
        active 
          ? "bg-zinc-950 text-white border-zinc-950 shadow-sm" 
          : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50/60"
      )}
    >
      {label}
      <span className={cn(
        "px-1.5 py-0.5 rounded font-bold min-w-[16px] text-center text-[10px]",
        active ? "bg-white/20 text-white" : "bg-zinc-100 border border-zinc-200 text-zinc-400"
      )}>
        {count}
      </span>
    </button>
  )
}
