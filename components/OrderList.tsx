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
  { value: 'pending', label: 'Nuevo', color: 'text-amber-600 bg-amber-50 border-gray-200' },
  { value: 'confirmed', label: 'Confirmado', color: 'text-blue-600 bg-blue-50 border-gray-200' },
  { value: 'shipped', label: 'En camino', color: 'text-emerald-600 bg-emerald-50 border-gray-200' },
  { value: 'delivered', label: 'Entregado', color: 'text-white bg-emerald-600 border-emerald-600 shadow-sm' },
  { value: 'cancelled', label: 'Cancelado', color: 'text-rose-500 bg-rose-50 border-gray-200' },
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
      <div className="text-center py-24 premium-card rounded-lg border-dashed bg-white/50 border-gray-200">
        <div className="w-20 h-20 rounded-lg bg-zinc-50 flex items-center justify-center mx-auto mb-8 border border-gray-200">
          <ShoppingBag className="w-8 h-8 text-zinc-200" />
        </div>
        <h3 className="text-xl font-semibold text-black mb-2 uppercase">Sin actividad</h3>
        <p className="text-zinc-400 text-xs max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
          Tus pedidos aparecerán aquí automáticamente en tiempo real.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-in">
      {/* Filter tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
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
      <div className="space-y-4">
        {filteredOrders.map(order => {
          const isExpanded = expandedId === order.id
          const items = Array.isArray(order.items) ? order.items : []

          return (
            <div
              key={order.id}
              className={cn(
                "premium-card rounded-lg overflow-hidden transition-all duration-500",
                isExpanded ? "ring-2 ring-primary/10 shadow-2xl scale-[1.01] bg-white border-primary/20" : "hover:scale-[1.005] hover:border-gray-200 bg-white/80 border-gray-200"
              )}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full flex flex-col md:flex-row md:items-center justify-between px-10 py-10 text-left group"
              >
                <div className="flex items-center gap-8 min-w-0">
                  <div className={cn(
                    "w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-700",
                    isExpanded ? "bg-primary text-white rotate-90 shadow-xl shadow-primary/20" : "bg-zinc-50 text-zinc-300 group-hover:text-primary group-hover:bg-primary/5"
                  )}>
                    <User className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-2xl font-medium text-zinc-950 truncate group-hover:text-emerald-600 transition-colors tracking-tight">
                      {order.customerName}
                    </h4>
                    <p className="text-[13px] font-normal tracking-tight text-zinc-400 mt-1">
                      {order.city} · {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-10 mt-6 md:mt-0 ml-24 md:ml-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-black tabular-nums mb-1 tracking-tight">
                      ${order.total.toLocaleString('es-CO')}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center transition-all",
                    isExpanded ? "bg-primary/10 border-primary/10 text-primary" : "text-zinc-200 group-hover:bg-zinc-50"
                  )}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Details Pane */}
              {isExpanded && (
                <div className="border-t border-gray-200 px-10 py-12 bg-zinc-50/30 space-y-12 animate-in">
                  <div className="grid lg:grid-cols-2 gap-16">
                    {/* Items Table */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 px-1">
                        <Package className="w-3.5 h-3.5 text-primary" />
                        <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Resumen de Orden</h5>
                      </div>
                      <div className="space-y-2">
                        {items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-5 bg-white rounded-lg border border-gray-200 hover:border-primary/20 transition-colors shadow-sm"
                          >
                            <span className="text-sm font-semibold text-zinc-600">
                              <span className="text-primary font-bold tabular-nums mr-3">{item.qty}×</span>
                              {item.name}
                            </span>
                            <span className="text-sm font-bold text-black tabular-nums">
                              ${(item.price * item.qty).toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Entrega</h5>
                        </div>
                        <div className="p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-[15px] font-normal text-zinc-800 leading-relaxed">
                            {order.address}
                          </p>
                          <p className="text-[11px] font-medium text-emerald-600 mt-3 tracking-tight">
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
                          className="btn-premium flex items-center justify-center gap-3 w-full bg-[#25D366] text-white hover:brightness-110 group h-14"
                        >
                          <MessageCircle className="w-5 h-5 fill-current text-white" />
                          NOTIFICAR POR WHATSAPP
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-10 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-lg border transition-all active:scale-95",
                            order.status === s.value 
                              ? s.color + " shadow-md" 
                              : "bg-white border-gray-200 text-zinc-400 hover:text-black hover:border-black/10"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    
                    <button className="flex items-center gap-2 text-[13px] font-medium text-zinc-400 hover:text-zinc-950 transition-colors tracking-tight px-4 py-2 hover:bg-zinc-100 rounded-lg">
                      <Zap className="w-4 h-4" />
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
      "text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border tabular-nums shadow-sm",
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
        "flex items-center gap-3 px-6 py-3.5 rounded-lg text-[10px] font-bold tracking-[0.1em] whitespace-nowrap transition-all border active:scale-95 shadow-sm",
        active 
          ? "bg-primary text-white border-primary shadow-lg shadow-primary/10" 
          : "bg-white border-gray-200 text-zinc-400 hover:text-black hover:border-black/10"
      )}
    >
      {label}
      <span className={cn(
        "px-2 py-0.5 rounded-md font-bold min-w-[20px] text-center",
        active ? "bg-white/20 text-white" : "bg-zinc-50 text-zinc-300"
      )}>
        {count}
      </span>
    </button>
  )
}
