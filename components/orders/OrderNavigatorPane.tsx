'use client'

import { ShoppingBag, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_OPTIONS, formatCurrency, type Order } from './types'
import { StatusBadge, FilterTab } from './OrderStatusBadge'

interface OrderNavigatorPaneProps {
  orders: Order[]
  filteredOrders: Order[]
  filter: string
  onFilterChange: (value: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedOrderId: string | null
  onSelectOrder: (orderId: string) => void
}

export function OrderNavigatorPane({
  orders,
  filteredOrders,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  selectedOrderId,
  onSelectOrder,
}: OrderNavigatorPaneProps) {
  return (
    <div className="xl:col-span-4 space-y-4 xl:sticky xl:top-6">
      <div className="rounded-lg bg-white border border-zinc-200  p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-zinc-950 tracking-tight">Pedidos</h4>
            <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">
              {filteredOrders.length} visibles de {orders.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* Live Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar cliente, ciudad o ID..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 text-xs font-bold text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950/25 focus:bg-white transition-all"
          />
        </div>

        {/* Filters grid */}
        <div className="flex flex-wrap gap-2">
          <FilterTab
            label="Todos"
            value="all"
            active={filter === 'all'}
            count={orders.length}
            onClick={() => onFilterChange('all')}
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
                onClick={() => onFilterChange(s.value)}
              />
            )
          })}
        </div>
      </div>

      {/* Cards List container with self scroll */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-390px)] min-h-[360px] pr-1 custom-scrollbar">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-lg">
            <ShoppingBag className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-bold tracking-widest">Sin coincidencias</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isSelected = order.id === selectedOrderId
            return (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all flex flex-col gap-3 group relative overflow-hidden',
                  isSelected
                    ? 'bg-zinc-950 border-zinc-950 text-white '
                    : 'bg-white border-zinc-200 text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'text-sm font-semibold truncate leading-none tracking-tight',
                      isSelected ? 'text-white' : 'text-zinc-950'
                    )}
                  >
                    {order.customerName}
                  </span>
                  <span className="text-xs font-semibold tabular-nums leading-none shrink-0 tracking-tight">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    suppressHydrationWarning
                    className={cn(
                      'text-[10px] font-semibold tracking-tight',
                      isSelected ? 'text-zinc-400' : 'text-zinc-400'
                    )}
                  >
                    {order.city} -{' '}
                    {new Date(order.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <StatusBadge status={order.status} isSelected={isSelected} />
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

