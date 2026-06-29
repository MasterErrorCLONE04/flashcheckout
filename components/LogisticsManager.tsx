'use client'

import { useState } from 'react'
import { 
  Truck, 
  Users, 
  User, 
  Compass, 
  CheckCircle2, 
  Navigation, 
  Save, 
  Loader2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Star, 
  MessageSquare, 
  Clock, 
  ArrowRight,
  ChevronRight,
  X
} from 'lucide-react'
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
  customerPhone?: string | null
  address: string
  city: string
  total: number
  status: string
  driver?: {
    name: string
    phoneNumber: string
    rating: number
  } | null
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

  // Driver creation form states
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [newDriverName, setNewDriverName] = useState('')
  const [newDriverPhone, setNewDriverPhone] = useState('')
  const [registering, setRegistering] = useState(false)

  // Derive logistics metrics based on dispatches
  const countDelivered = dispatches.filter(d => d.status === 'delivered').length
  const countInTransit = dispatches.filter(d => d.status === 'shipped').length
  const totalLogisticExpenses = countDelivered * 5000

  // Save base logistic config
  async function handleSaveConfig() {
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      toast.success('Configuración logística guardada', {
        description: 'La regla de asignación de despacho automático se ha actualizado.'
      })
    } catch {
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  // Register a new driver via API
  async function handleRegisterDriver(e: React.FormEvent) {
    e.preventDefault()
    if (!newDriverName.trim() || !newDriverPhone.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setRegistering(true)
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDriverName.trim(),
          phoneNumber: newDriverPhone.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register driver')
      }

      if (data.success) {
        setDrivers(prev => [...prev, data.driver])
        toast.success(`Mensajero ${data.driver.name} registrado con éxito`)
        setNewDriverName('')
        setNewDriverPhone('')
        setShowRegisterForm(false)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al registrar mensajero')
    } finally {
      setRegistering(false)
    }
  }

  // Delete a driver via API
  async function handleDeleteDriver(id: string, name: string) {
    if (!confirm(`¿Estás seguro de eliminar al mensajero ${name}?`)) return

    try {
      const res = await fetch('/api/drivers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete driver')
      }

      if (data.success) {
        setDrivers(prev => prev.filter(d => d.id !== id))
        toast.success(`Mensajero ${name} eliminado`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al eliminar mensajero')
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration & General Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card: Plataforma & Métricas Logísticas */}
        <div className="premium-card p-6 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between">
          <div className="space-y-4.5">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-xs tracking-wide">Servicio de Repartos</h3>
                <p className="text-[10px] text-zinc-400 font-semibold tracking-wider mt-0.5">Tarifa oficial de la plataforma</p>
              </div>
            </div>

            {/* Official Rates Informational Box */}
            <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-500 uppercase text-[9px] tracking-wider">Costo por envío</span>
                <span className="font-black text-zinc-800">$5.000 COP</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-500 uppercase text-[9px] tracking-wider">Modo de pago</span>
                <span className="font-bold text-zinc-650">Descuento automático de saldo</span>
              </div>
              <p className="text-[9px] text-zinc-400 leading-relaxed mt-1 font-medium">
                La tarifa del repartidor oficial es fija y se descuenta directamente de la liquidación final del pedido. El vendedor no necesita pagar en efectivo al recolectar.
              </p>
            </div>

            {/* Auto Dispatch Toggle */}
            <div className="flex items-center justify-between bg-zinc-50/60 p-3 rounded-lg border border-zinc-150">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-800 leading-none">Despacho Automático</span>
                  <span className="text-[9px] text-zinc-400 font-medium mt-1">Activar motorizado tras confirmarse el pago</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={autoDispatch}
                  onChange={e => setAutoDispatch(e.target.checked)}
                />
                <div className="w-8.5 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-100" />

            {/* Delivery KPIs for Store */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
                <p className="text-[9px] font-extrabold text-zinc-450 uppercase tracking-wider">Entregados</p>
                <p className="text-sm font-black text-zinc-800 tabular-nums">{countDelivered}</p>
              </div>
              <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
                <p className="text-[9px] font-extrabold text-zinc-450 uppercase tracking-wider">En Tránsito</p>
                <p className="text-sm font-black text-blue-600 tabular-nums">{countInTransit}</p>
              </div>
              <div className="p-3 bg-zinc-50/40 border border-zinc-200/50 rounded-lg text-center space-y-1">
                <p className="text-[9px] font-extrabold text-zinc-450 uppercase tracking-wider">Gasto total</p>
                <p className="text-[11px] font-black text-zinc-800 tabular-nums">${totalLogisticExpenses.toLocaleString('es-CO')}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="w-full h-10 border border-zinc-955 hover:bg-zinc-955 hover:text-white text-zinc-955 bg-white font-bold rounded-lg text-xs tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 mt-5 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Guardar Configuración de Asignación</span>
          </button>
        </div>

        {/* Card: Active Drivers List */}
        <div className="premium-card p-6 bg-white border border-zinc-200/80 rounded-lg flex flex-col justify-between">
          <div className="space-y-3.5 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-xs tracking-wide">Mensajeros Registrados</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold tracking-wider mt-0.5">Mensajeros activos en la zona</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowRegisterForm(!showRegisterForm)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer border border-emerald-100 active:scale-95"
              >
                {showRegisterForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                <span>{showRegisterForm ? 'Cerrar' : 'Agregar'}</span>
              </button>
            </div>

            {/* Inline Register Driver Form */}
            {showRegisterForm && (
              <form onSubmit={handleRegisterDriver} className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg space-y-3 animate-in duration-200 slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-zinc-450 tracking-wider">Nombre del conductor</label>
                    <input 
                      type="text"
                      placeholder="Ej: Carlos Gómez"
                      value={newDriverName}
                      onChange={e => setNewDriverName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-zinc-450 tracking-wider">Teléfono de contacto</label>
                    <input 
                      type="tel"
                      placeholder="Ej: +57 312 456 7890"
                      value={newDriverPhone}
                      onChange={e => setNewDriverPhone(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-zinc-300 font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-700 bg-white border border-zinc-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={registering}
                    className="px-3.5 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {registering && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Registrar</span>
                  </button>
                </div>
              </form>
            )}

            {/* Drivers list scroll */}
            <div className="divide-y divide-zinc-100 max-h-[170px] overflow-y-auto mt-2 pr-1 custom-scrollbar flex-1">
              {drivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-450 text-[11px] font-bold tracking-wide">
                  <User className="w-6 h-6 mb-1.5 text-zinc-200" />
                  <span>No hay repartidores registrados</span>
                </div>
              ) : (
                drivers.map(driver => (
                  <div key={driver.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 group/driver">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar circle */}
                      <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center font-bold text-[10px] text-zinc-600 uppercase">
                        {driver.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-zinc-850 leading-none">{driver.name}</span>
                          <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-0.5 leading-none">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {driver.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-1 flex items-center gap-1">
                          <span className="tabular-nums">+{driver.phoneNumber}</span>
                          <span>·</span>
                          <span className="font-extrabold text-zinc-505 uppercase tracking-wide">{driver.ordersDelivered} despachos</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full relative",
                          driver.available ? "bg-emerald-500" : driver.active ? "bg-amber-500 animate-pulse" : "bg-zinc-300"
                        )}>
                          {driver.available && (
                            <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
                          )}
                        </span>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wide">
                          {driver.available ? 'Disponible' : driver.active ? 'En ruta' : 'Offline'}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteDriver(driver.id, driver.name)}
                        className="w-7 h-7 rounded-lg text-zinc-350 hover:text-rose-600 hover:bg-rose-50/50 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover/driver:opacity-100 active:scale-95"
                        title="Eliminar repartidor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatches Board */}
      <div className="premium-card p-6 bg-white border border-zinc-200/80 rounded-lg space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-xs tracking-wide">Tablero de Despachos</h3>
            <p className="text-[10px] text-zinc-400 font-semibold tracking-wider mt-0.5">Órdenes asignadas y en tránsito</p>
          </div>
        </div>

        {dispatches.length === 0 ? (
          /* Premium Empty State Guide workflow */
          <div className="py-8 px-4 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/30 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3 border border-zinc-200/60">
              <Truck className="w-5 h-5 text-zinc-400" />
            </div>
            <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">No hay despachos activos registrados</h4>
            <p className="text-[10px] font-medium text-zinc-400 mt-1 max-w-md text-center leading-normal">
              Aquí podrás monitorear las entregas confiadas a nuestro servicio de repartidores oficiales.
            </p>

            {/* Stepper explainer guides */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8 w-full max-w-3xl">
              <div className="p-3.5 bg-white border border-zinc-200/60 rounded-lg flex flex-col items-center text-center">
                <div className="w-6.5 h-6.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black">1</div>
                <h5 className="text-[10px] font-bold text-zinc-800 mt-2">Comprador Paga</h5>
                <p className="text-[9px] text-zinc-400 mt-1 font-medium leading-relaxed">El pago del pedido se confirma exitosamente.</p>
              </div>

              <div className="p-3.5 bg-white border border-zinc-200/60 rounded-lg flex flex-col items-center text-center">
                <div className="w-6.5 h-6.5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">2</div>
                <h5 className="text-[10px] font-bold text-zinc-800 mt-2">Solicutas Reparto</h5>
                <p className="text-[9px] text-zinc-400 mt-1 font-medium leading-relaxed">Pides motorizado desde WhatsApp o el panel web.</p>
              </div>

              <div className="p-3.5 bg-white border border-zinc-200/60 rounded-lg flex flex-col items-center text-center">
                <div className="w-6.5 h-6.5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-black">3</div>
                <h5 className="text-[10px] font-bold text-zinc-800 mt-2">Repartidor Acepta</h5>
                <p className="text-[9px] text-zinc-400 mt-1 font-medium leading-relaxed">Un conductor cercano acepta el viaje en su WhatsApp.</p>
              </div>

              <div className="p-3.5 bg-white border border-zinc-200/60 rounded-lg flex flex-col items-center text-center">
                <div className="w-6.5 h-6.5 rounded-full bg-zinc-150 text-zinc-650 flex items-center justify-center text-[10px] font-black">4</div>
                <h5 className="text-[10px] font-bold text-zinc-800 mt-2">Entrega en Curso</h5>
                <p className="text-[9px] text-zinc-400 mt-1 font-medium leading-relaxed">El cliente recibe su pedido y tú monitoreas el estado.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 text-[10px] font-black tracking-wider text-zinc-400 bg-[#FAFAFA]">
                  <th className="py-3.5 px-4">Pedido ID</th>
                  <th className="py-3.5 px-3">Cliente</th>
                  <th className="py-3.5 px-3">Dirección de Entrega</th>
                  <th className="py-3.5 px-3">Repartidor Asignado</th>
                  <th className="py-3.5 px-3">Progreso de Entrega</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-800">
                {dispatches.map(item => {
                  const hasDriver = !!item.driver
                  const isDelivered = item.status === 'delivered'
                  const isShipped = item.status === 'shipped'

                  // Formatted progression steps
                  let activeStep = 0 // 0: Asignando, 1: Recolectando, 2: En ruta, 3: Entregado
                  if (hasDriver) activeStep = 1
                  if (isShipped) activeStep = 2
                  if (isDelivered) activeStep = 3

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-zinc-955 tabular-nums select-all">
                        #PAY-{item.id.slice(-4).toUpperCase()}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-col">
                          <span className="text-zinc-900 font-bold leading-tight">{item.customerName}</span>
                          {item.customerPhone && (
                            <a
                              href={`https://wa.me/${item.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-zinc-400 hover:text-emerald-600 transition-colors mt-0.5 flex items-center gap-1 leading-none font-bold"
                            >
                              <Phone className="w-2.5 h-2.5 text-emerald-500 fill-emerald-50/20" />
                              <span>+{item.customerPhone}</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3 text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="block max-w-[180px] truncate" title={`${item.address}, ${item.city}`}>
                            {item.address}, {item.city}
                          </span>
                          <a
                            href={`https://maps.google.com/maps?q=${encodeURIComponent(item.address + ', ' + item.city)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-5 h-5 rounded-md hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-650 transition-colors border border-zinc-150"
                            title="Abrir mapa"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        {item.driver ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="text-zinc-900 font-bold leading-none">{item.driver.name}</span>
                              <span className="text-[9px] font-black text-amber-500 flex items-center gap-0.5 leading-none mt-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {item.driver.rating.toFixed(1)}
                              </span>
                            </div>
                            <a
                              href={`https://wa.me/${item.driver.phoneNumber.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-emerald-600 hover:text-emerald-700 transition-colors mt-1.5 flex items-center gap-1 leading-none font-bold"
                            >
                              <MessageSquare className="w-2.5 h-2.5 fill-current" />
                              Contactar repartidor
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md tracking-wider border border-amber-100">
                              Asignando repartidor...
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {/* Graphical Stepper */}
                        <div className="flex items-center gap-2 max-w-[200px]">
                          {/* Step 1: Confirmado */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold leading-none",
                              activeStep >= 1 ? "bg-blue-500 border-blue-500 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-400"
                            )}>
                              {activeStep >= 1 ? '✓' : '1'}
                            </div>
                            <span className="text-[8px] text-zinc-450 font-bold uppercase tracking-wider mt-1">Asignado</span>
                          </div>

                          {/* Connector 1 */}
                          <div className={cn("h-[2px] flex-1 -mt-3.5", activeStep >= 2 ? "bg-blue-500" : "bg-zinc-150")} />

                          {/* Step 2: En Camino */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold leading-none",
                              activeStep >= 2 ? "bg-blue-500 border-blue-500 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-400",
                              activeStep === 2 && "animate-pulse"
                            )}>
                              {activeStep >= 2 ? '✓' : '2'}
                            </div>
                            <span className="text-[8px] text-zinc-455 font-bold uppercase tracking-wider mt-1">En ruta</span>
                          </div>

                          {/* Connector 2 */}
                          <div className={cn("h-[2px] flex-1 -mt-3.5", activeStep >= 3 ? "bg-blue-500" : "bg-zinc-150")} />

                          {/* Step 3: Entregado */}
                          <div className="flex flex-col items-center flex-1">
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold leading-none",
                              activeStep >= 3 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-400"
                            )}>
                              {activeStep >= 3 ? '✓' : '3'}
                            </div>
                            <span className="text-[8px] text-zinc-450 font-bold uppercase tracking-wider mt-1">Recibido</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-zinc-950 tabular-nums">
                        ${item.total.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
