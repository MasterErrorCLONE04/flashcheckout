'use client'

import { useState } from 'react'
import { Search, User, MessageCircle, ExternalLink, Award, DollarSign, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

type CustomerRecord = {
  phone: string
  name: string
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
}

export default function CustomerCRM({
  initialCustomers,
}: {
  initialCustomers: CustomerRecord[]
}) {
  const [search, setSearch] = useState('')
  const [customers] = useState<CustomerRecord[]>(initialCustomers)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const totalSpentAll = customers.reduce((s, c) => s + c.totalSpent, 0)
  const averageSpent = customers.length > 0 ? totalSpentAll / customers.length : 0

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI: Total Customers */}
        <div className="premium-card p-5 bg-white border border-zinc-200/60 shadow-sm rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Clientes Únicos</span>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">{customers.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border flex items-center justify-center text-zinc-400">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Customer Average LTV */}
        <div className="premium-card p-5 bg-white border border-zinc-200/60 shadow-sm rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Gasto Promedio (LTV)</span>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">${Math.round(averageSpent).toLocaleString('es-CO')}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border flex items-center justify-center text-zinc-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI: Top Customer Reward Tier */}
        <div className="premium-card p-5 bg-white border border-zinc-200/60 shadow-sm rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Clientes recurrentes</span>
            <span className="text-2xl font-black text-zinc-950 tabular-nums">
              {customers.filter(c => c.totalOrders > 1).length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="premium-card p-6 bg-white border border-zinc-200/60 shadow-sm rounded-2xl space-y-4">
        {/* Search Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o teléfono..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-zinc-300 transition-all font-medium"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Pedidos colocados</th>
                <th className="py-3 px-4">Total facturado (LTV)</th>
                <th className="py-3 px-4">Última compra</th>
                <th className="py-3 px-4 text-right">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-zinc-400 font-bold py-12 uppercase tracking-widest">
                    No se encontraron clientes registrados
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.phone || `${c.name}-${idx}`} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-50 border flex items-center justify-center text-zinc-500 font-bold">
                          {c.name.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-800 leading-none">{c.name || 'Cliente sin nombre'}</p>
                          <p className="text-[10px] text-zinc-400 mt-1 tabular-nums">{c.phone ? `+${c.phone}` : 'Teléfono no registrado'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-700 tabular-nums">
                      {c.totalOrders} {c.totalOrders === 1 ? 'pedido' : 'pedidos'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-zinc-950 tabular-nums">
                      ${c.totalSpent.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{c.lastOrderDate.slice(0, 10)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.phone ? (
                        <a
                          href={`https://wa.me/${c.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all font-bold"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat</span>
                          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-400 italic">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
