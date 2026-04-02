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
} from 'lucide-react'

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
  { value: 'pending', label: 'Nuevo', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'shipped', label: 'Enviado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'delivered', label: 'Entregado', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-200' },
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
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Sin pedidos todavía</p>
        <p className="text-xs text-muted-foreground mt-1">
          Cuando alguien compre por tu link, los pedidos aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <FilterTab
          label="Todos"
          value="all"
          active={filter === 'all'}
          count={orders.length}
          onClick={() => setFilter('all')}
        />
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s.value).length
          if (count === 0) return null
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

      {/* Orders */}
      <div className="space-y-2 stagger">
        {filteredOrders.map(order => {
          const isExpanded = expandedId === order.id
          const items = Array.isArray(order.items)
            ? (order.items as OrderItem[])
            : []

          return (
            <div
              key={order.id}
              className="bg-white border border-border/60 rounded-xl overflow-hidden transition-all"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : order.id)
                }
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.city} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold">
                    ${order.total.toLocaleString('es-CO')}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border/50 px-4 py-4 space-y-4 animate-fade-in bg-muted/20">
                  {/* Items */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Productos
                    </h4>
                    <div className="space-y-1.5">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {item.qty}× {item.name}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.qty).toLocaleString('es-CO')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{order.address}, {order.city}</span>
                    </div>

                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `¡Hola ${order.customerName}! Confirmamos tu pedido en ${storeName}, saldrá pronto a reparto.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-fit items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border border-[#25D366]/30 px-4 py-2 rounded-xl transition-colors font-semibold text-xs mt-1"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        Confirmar Envío por WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Status Changer */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Cambiar estado
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                            order.status === s.value
                              ? s.color + ' ring-2 ring-offset-1 ring-emerald-200'
                              : 'bg-white border-border text-muted-foreground hover:border-emerald-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
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
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${option.color}`}
    >
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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-white border border-border text-muted-foreground hover:border-emerald-200'
      }`}
    >
      {label}
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          active ? 'bg-white/20' : 'bg-muted'
        }`}
      >
        {count}
      </span>
    </button>
  )
}
