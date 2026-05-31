'use client'

import { useState } from 'react'
import { Truck, Users, User, Compass, CheckCircle2, Navigation, Save, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Driver = {
  id: string
  name: string
  phoneNumber: string
  active: boolean
  available: boolean
  rating: number
  ordersDelivered: number
}

type OrderDispatch = {
  id: string
  customerName: string
  address: string
  city: string
  total: number
  status: string
  driver?: string
}

export default function LogisticsManager({
  initialDrivers,
  initialDispatches,
}: {
  initialDrivers: Driver[]
  initialDispatches: OrderDispatch[]
}) {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers)
  const [dispatches, setDispatches] = useState<OrderDispatch[]>(initialDispatches)
  const [saving, setSaving] = useState(false)
  const [autoDispatch, setAutoDispatch] = useState(true)
  const [basePrice, setBasePrice] = useState('5000')
  const [perKmPrice, setPerKmPrice] = useState('1500')

  async function handleSaveConfig() {
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      toast.success('Configuración logística guardada', {
        description: 'Las tarifas de envío y las reglas de asignación se han actualizado.'
      })
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration & General Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card: Configurations */}
        <div className="premium-card p-6 bg-white border border-zinc-200/60 shadow-sm rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-[14px]">Tarifas y Reglas</h3>
              <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">Definición de costos de despacho</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tarifa base ($ COP)</label>
              <input
                type="number"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-zinc-300 font-bold transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Precio por Km ($ COP)</label>
              <input
                type="number"
                value={perKmPrice}
                onChange={e => setPerKmPrice(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-zinc-300 font-bold transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-zinc-800 leading-none">Despacho Inteligente</span>
                <span className="text-[10px] text-zinc-400 font-medium mt-1">Matchmaker automático de repartidores</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={autoDispatch}
                onChange={e => setAutoDispatch(e.target.checked)}
              />
              <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="w-full btn-premium h-11 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Guardar Configuración</span>
          </button>
        </div>

        {/* Card: Active Drivers List */}
        <div className="premium-card p-6 bg-white border border-zinc-200/60 shadow-sm rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-[14px]">Mensajeros Registrados</h3>
                <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">Mensajeros activos en la zona</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {drivers.filter(d => d.available).length} disponibles
            </span>
          </div>

          <div className="divide-y divide-zinc-100 max-h-[220px] overflow-y-auto mt-2 pr-1 custom-scrollbar">
            {drivers.length === 0 ? (
              <p className="text-center text-zinc-400 text-xs py-10 font-bold uppercase tracking-wider">No hay repartidores registrados</p>
            ) : (
              drivers.map(driver => (
                <div key={driver.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 border flex items-center justify-center text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-800 leading-none">{driver.name}</p>
                      <p className="text-[10px] text-zinc-400 mt-1 tabular-nums">{driver.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      driver.available ? "bg-emerald-500" : driver.active ? "bg-amber-500 animate-pulse" : "bg-zinc-300"
                    )} />
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      {driver.available ? 'Disponible' : driver.active ? 'En ruta' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dispatches Board */}
      <div className="premium-card p-6 bg-white border border-zinc-200/60 shadow-sm rounded-2xl space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-[14px]">Tablero de Despachos</h3>
            <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">Órdenes asignadas y en tránsito</p>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Pedido ID</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Repartidor</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {dispatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-zinc-400 font-bold py-12 uppercase tracking-widest">
                    No hay despachos registrados
                  </td>
                </tr>
              ) : (
                dispatches.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-zinc-900 tabular-nums">#{item.id.slice(-6).toUpperCase()}</td>
                    <td className="py-3.5 px-4 font-bold text-zinc-800">{item.customerName}</td>
                    <td className="py-3.5 px-4 text-zinc-500 font-medium">
                      <span className="block max-w-[200px] truncate" title={`${item.address}, ${item.city}`}>
                        {item.address}, {item.city}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.driver ? (
                        <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{item.driver}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          Esperando
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        item.status === 'shipped' ? "bg-blue-50 text-blue-700" :
                        item.status === 'delivered' ? "bg-emerald-50 text-emerald-700" :
                        "bg-amber-50 text-amber-700"
                      )}>
                        {item.status === 'shipped' ? 'En ruta' :
                         item.status === 'delivered' ? 'Entregado' : 'Asignando'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-zinc-950 tabular-nums">
                      ${item.total.toLocaleString('es-CO')}
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
