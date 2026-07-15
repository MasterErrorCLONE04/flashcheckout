'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  Sparkles,
  Zap,
  Plus,
  MoreHorizontal,
  ChevronRight,
  HelpCircle,
  Mail,
  Loader2,
  TrendingUp,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getErrorMessage(error: unknown, fallback = 'Error desconocido') {
  return error instanceof Error ? error.message : fallback
}

type Automation = {
  id: string
  name: string
  description: string
  active: boolean
  sentToday: number
  rate: string
  rateLabel: string
  icon: string
  iconColor: string
  channels: string[]
  customTemplate?: string | null
}

export default function AutomatizacionesPage() {
  const router = useRouter()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal creation states
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIcon, setNewIcon] = useState('👋')
  const [newChannels, setNewChannels] = useState<string[]>(['WhatsApp'])
  const [saving, setSaving] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [customTemplateText, setCustomTemplateText] = useState('')
  const [updatingTemplate, setUpdatingTemplate] = useState(false)

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAutomation) return

    setUpdatingTemplate(true)
    try {
      const res = await fetch('/api/automation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automationId: selectedAutomation.id,
          customTemplate: customTemplateText
        })
      })

      if (!res.ok) throw new Error('Fallo al guardar la plantilla')
      
      setAutomations(prev =>
        prev.map(a => (a.id === selectedAutomation.id ? { ...a, customTemplate: customTemplateText } : a))
      )
      toast.success('Plantilla guardada con éxito')
      setShowConfigModal(false)
      setSelectedAutomation(null)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Error al guardar la plantilla'))
    } finally {
      setUpdatingTemplate(false)
    }
  }

  // Fetch automations on mount
  useEffect(() => {
    async function fetchAutomations() {
      try {
        const res = await fetch('/api/automation')
        if (!res.ok) throw new Error('Error al obtener automatizaciones')
        const data = await res.json()
        setAutomations(data.automations || [])
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Error al cargar las automatizaciones'))
      } finally {
        setLoading(false)
      }
    }
    fetchAutomations()
  }, [])

  // Toggle active status
  const handleToggle = async (automationId: string, currentActive: boolean) => {
    const nextActive = !currentActive
    // Optimistic Update
    setAutomations(prev =>
      prev.map(a => (a.id === automationId ? { ...a, active: nextActive } : a))
    )

    try {
      const res = await fetch('/api/automation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationId, active: nextActive }),
      })
      if (!res.ok) throw new Error('Fallo al actualizar el estado')
      toast.success(nextActive ? 'Automatización activada' : 'Automatización desactivada')
    } catch {
      toast.error('No se pudo guardar el estado')
      // Revert optimistic update
      setAutomations(prev =>
        prev.map(a => (a.id === automationId ? { ...a, active: currentActive } : a))
      )
    }
  }

  // Create automation
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newDesc.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          icon: newIcon,
          channels: newChannels
        }),
      })

      if (!res.ok) throw new Error('Fallo al crear la regla')
      const data = await res.json()
      setAutomations(prev => [...prev, data.automation])
      toast.success('Automatización creada con éxito')
      setShowModal(false)
      setNewName('')
      setNewDesc('')
      setNewIcon('👋')
      setNewChannels(['WhatsApp'])
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Error al crear automatización'))
    } finally {
      setSaving(false)
    }
  }

  // Auto spawn standard template
  const handleUseTemplate = async (templateName: string, desc: string, icon: string, channels: string[]) => {
    // Check if it already exists
    if (automations.some(a => a.name.toLowerCase() === templateName.toLowerCase())) {
      toast.info(`La automatización "${templateName}" ya está configurada.`)
      return
    }

    const loadToast = toast.loading(`Cargando plantilla "${templateName}"...`)
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          description: desc,
          icon,
          channels
        }),
      })

      if (!res.ok) throw new Error()
      const data = await res.json()
      setAutomations(prev => [...prev, data.automation])
      toast.success(`Plantilla "${templateName}" agregada correctamente`, { id: loadToast })
    } catch {
      toast.error('Error al agregar la plantilla', { id: loadToast })
    }
  }

  // Counts
  const totalCount = automations.length
  const activeCount = automations.filter(a => a.active).length
  const inactiveCount = automations.filter(a => !a.active).length

  // Filtered automations
  const filtered = automations.filter(a => {
    if (filterTab === 'active') return a.active
    if (filterTab === 'inactive') return !a.active
    return true
  })

  // Summary Metrics calculations
  const totalSentToday = automations.filter(a => a.active).reduce((sum, a) => sum + a.sentToday, 0)
  const averageRate = automations.filter(a => a.active && a.rate !== '0%').length > 0
    ? Math.round(
        automations
          .filter(a => a.active && a.rate !== '0%')
          .reduce((sum, a) => sum + parseInt(a.rate), 0) /
          automations.filter(a => a.active && a.rate !== '0%').length
      )
    : 0

  const templates = [
    { name: 'Mensaje de bienvenida', desc: 'Saluda a nuevos clientes', icon: '👋', channels: ['WhatsApp'] },
    { name: 'Recuperar carrito', desc: 'Recordatorio de carrito abandonado', icon: '🛒', channels: ['WhatsApp'] },
    { name: 'Pedido pagado', desc: 'Confirma el pago del pedido', icon: '💳', channels: ['WhatsApp', 'Email'] },
    { name: 'Pedido listo', desc: 'Notifica que el pedido está listo', icon: '📦', channels: ['WhatsApp'] },
    { name: 'Calificar servicio', desc: 'Pide una reseña al cliente', icon: '⭐', channels: ['WhatsApp'] }
  ]

  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Automatizaciones</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Activa y gestiona las automatizaciones de tu negocio.
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none select-none shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva automatización</span>
        </button>
      </div>

      {/* Grid tabs row */}
      <div className="flex gap-1 border-b border-zinc-150 pb-px text-[11px] font-bold text-zinc-500">
        <button
          onClick={() => setFilterTab('all')}
          className={cn(
            "pb-2.5 px-2 relative transition-colors shrink-0 cursor-pointer",
            filterTab === 'all' ? "text-emerald-600 font-extrabold" : "hover:text-zinc-900"
          )}
        >
          Todas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{totalCount}</span>
          {filterTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
        </button>
        <button
          onClick={() => setFilterTab('active')}
          className={cn(
            "pb-2.5 px-2 relative transition-colors shrink-0 cursor-pointer",
            filterTab === 'active' ? "text-emerald-600 font-extrabold" : "hover:text-zinc-900"
          )}
        >
          Activas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{activeCount}</span>
          {filterTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
        </button>
        <button
          onClick={() => setFilterTab('inactive')}
          className={cn(
            "pb-2.5 px-2 relative transition-colors shrink-0 cursor-pointer",
            filterTab === 'inactive' ? "text-emerald-600 font-extrabold" : "hover:text-zinc-900"
          )}
        >
          Inactivas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{inactiveCount}</span>
          {filterTab === 'inactive' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
        </button>
      </div>

      {/* Main Split: List of rules and metrics sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Automation List */}
        <div className="lg:col-span-8 space-y-4">
          
          {loading ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-16 flex flex-col items-center justify-center text-zinc-400 select-none">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <span className="text-xs font-semibold">Cargando automatizaciones del negocio...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-16 flex flex-col items-center justify-center text-center text-zinc-400 select-none">
              <Zap className="w-10 h-10 text-zinc-200 mb-2" />
              <h4 className="text-sm font-bold text-zinc-800">No hay automatizaciones</h4>
              <p className="text-xs text-zinc-400 font-semibold max-w-sm mt-1">Configura o selecciona una plantilla para automatizar tus envíos.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                {/* Left Card info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xl shrink-0 select-none">
                    {item.icon}
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-bold text-zinc-950 text-sm leading-none">{item.name}</h3>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide leading-none border scale-95",
                        item.active 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-250"
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                      )}>
                        {item.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-semibold leading-relaxed">{item.description}</p>
                    
                    {/* Channel capsules list */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {item.channels.map((chan, idx) => (
                        <span 
                          key={idx} 
                          className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border leading-none select-none",
                            chan === 'WhatsApp' 
                              ? "bg-emerald-50/50 text-emerald-600 border-emerald-200/50"
                              : "bg-blue-50/50 text-blue-600 border-blue-200/50"
                          )}
                        >
                          {chan === 'WhatsApp' ? (
                            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-[#25D366] shrink-0" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          ) : (
                            <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                          )}
                          <span>{chan}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Card actions / toggle */}
                <div className="flex items-center justify-between sm:justify-end gap-6 xl:gap-8 w-full sm:w-auto border-t sm:border-t-0 border-zinc-50 pt-3 sm:pt-0 shrink-0">
                  
                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggle(item.id, item.active)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0",
                        item.active ? "bg-emerald-500" : "bg-zinc-200"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out",
                          item.active ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Stats columns */}
                  <div className="flex items-center gap-6 text-left shrink-0">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block select-none">Enviados hoy</span>
                      <span className="text-sm font-bold text-zinc-950 tabular-nums">{item.sentToday}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block select-none">{item.rateLabel}</span>
                      <span className={cn(
                        "text-sm font-bold tabular-nums",
                        item.active && parseInt(item.rate) > 0 ? "text-emerald-600" : "text-zinc-650"
                      )}>{item.rate}</span>
                    </div>
                  </div>

                  {/* Action Menu: Configurar */}
                  <button 
                    onClick={() => {
                      setSelectedAutomation(item)
                      setCustomTemplateText(item.customTemplate || '')
                      setShowConfigModal(true)
                    }} 
                    className="h-8 px-2.5 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 text-[10px] font-bold text-zinc-650 rounded-lg shrink-0 cursor-pointer select-none transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>Configurar</span>
                  </button>

                </div>

              </div>
            ))
          )}

          {/* Bottom disclaimer banner */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 flex items-start gap-2.5 px-4.5 select-none">
            <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
              Las automatizaciones se ejecutan según las reglas configuradas y la disponibilidad de los canales conectados.{' '}
              <a href="#" className="text-emerald-600 hover:underline inline-flex items-center gap-0.5 font-bold">
                Ver documentación <ChevronRight className="w-3 h-3 inline-block" />
              </a>
            </p>
          </div>

        </div>

        {/* Right Column: Sidebar widgets */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: Plantillas disponibles */}
          <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
            <h4 className="text-xs font-bold text-zinc-955 tracking-wider select-none">Plantillas disponibles</h4>
            
            <div className="space-y-3">
              {templates.map((temp, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-zinc-50 last:border-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7.5 h-7.5 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-sm shrink-0 select-none">
                      {temp.icon}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-zinc-900 truncate leading-tight text-[11px]">{temp.name}</h5>
                      <span className="text-[9px] font-semibold text-zinc-400 block leading-tight truncate">{temp.desc}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUseTemplate(temp.name, temp.desc, temp.icon, temp.channels)}
                    className="h-7.5 px-3 border border-zinc-250 hover:bg-zinc-50 text-[10px] font-bold text-zinc-800 rounded-lg shrink-0 cursor-pointer select-none transition-all active:scale-95"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => toast.info('Todas las plantillas cargadas')}
              className="w-full text-center py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-0.5"
            >
              <span>Ver todas las plantillas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Resumen de automatizaciones */}
          <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
            <div className="flex justify-between items-baseline select-none">
              <h4 className="text-xs font-bold text-zinc-955 tracking-wider">Resumen de automatizaciones</h4>
              <select className="bg-transparent border-none text-[9px] font-bold text-zinc-500 cursor-pointer focus:outline-none hover:text-zinc-950 transition-colors p-0">
                <option>Este mes</option>
                <option>Esta semana</option>
                <option>Hoy</option>
              </select>
            </div>

            <div className="space-y-4">
              
              {/* Stat 1 */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 block select-none">Mensajes enviados</span>
                <span className="text-2xl font-bold text-zinc-950 block leading-none tabular-nums">{totalSentToday + 28}</span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 select-none">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>18% <span className="text-zinc-400 font-semibold">vs mes anterior</span></span>
                </div>
              </div>

              {/* Stat grid (1x2) */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-50">
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-zinc-400 block select-none">Tasa prom. apertura</span>
                  <span className="text-lg font-bold text-zinc-950 block leading-none tabular-nums">{averageRate > 0 ? `${averageRate}%` : '94%'}</span>
                  <div className="flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 select-none">
                    <TrendingUp className="w-3 h-3" />
                    <span>6% <span className="text-zinc-400 font-semibold">vs mes</span></span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-zinc-400 block select-none">Tasa prom. conversión</span>
                  <span className="text-lg font-bold text-zinc-950 block leading-none tabular-nums">23%</span>
                  <div className="flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 select-none">
                    <TrendingUp className="w-3 h-3" />
                    <span>4% <span className="text-zinc-400 font-semibold">vs mes</span></span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: ¿Necesitas ayuda? */}
          <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-955 tracking-wider select-none">¿Necesitas ayuda?</h4>
              <p className="text-[10px] text-zinc-400 font-semibold leading-normal max-w-[150px]">
                Nova puede ayudarte a crear y configurar tus automatizaciones.
              </p>
              <button
                onClick={() => router.push('/hablar-con-nova')}
                className="h-8.5 px-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>Hablar con Nova</span>
              </button>
            </div>
            {/* Robot mascot avatar */}
            <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 select-none text-2xl border border-zinc-100">
              🤖
            </div>
          </div>

        </div>

      </div>

      {/* NEW RULE CREATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-md p-6 space-y-4 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center select-none">
              <h3 className="font-bold text-sm text-zinc-950 uppercase tracking-wider">Nueva automatización</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">Nombre de la regla</label>
                <input
                  type="text"
                  placeholder="Ej: Mensaje de bienvenida"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">Descripción</label>
                <textarea
                  placeholder="Explica qué hace esta automatización..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all resize-none h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">Emoji / Icono</label>
                  <select
                    value={newIcon}
                    onChange={e => setNewIcon(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all cursor-pointer"
                  >
                    <option value="👋">👋 Saludo</option>
                    <option value="🛒">🛒 Carrito</option>
                    <option value="💳">💳 Pago</option>
                    <option value="📦">📦 Entrega</option>
                    <option value="🌙">🌙 Inactividad</option>
                    <option value="⭐">⭐ Calificar</option>
                    <option value="⚡">⚡ Rápido</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 block uppercase select-none">Canales</label>
                  <div className="flex gap-2 items-center pt-2">
                    <label className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newChannels.includes('WhatsApp')}
                        onChange={e => {
                          if (e.target.checked) setNewChannels(prev => [...prev, 'WhatsApp'])
                          else setNewChannels(prev => prev.filter(c => c !== 'WhatsApp'))
                        }}
                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                      />
                      <span>WhatsApp</span>
                    </label>

                    <label className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newChannels.includes('Email')}
                        onChange={e => {
                          if (e.target.checked) setNewChannels(prev => [...prev, 'Email'])
                          else setNewChannels(prev => prev.filter(c => c !== 'Email'))
                        }}
                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                      />
                      <span>Email</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-grow py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar regla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* TEMPLATE CUSTOMIZATION MODAL */}
      {showConfigModal && selectedAutomation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg p-6 md:p-8 space-y-5 animate-in zoom-in duration-200 shadow-xl text-left select-none">
            <div className="flex justify-between items-center select-none">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{selectedAutomation.icon}</span>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">Configurar Plantilla</h3>
                  <p className="text-[10px] text-zinc-400 font-bold tracking-wide mt-0.5">{selectedAutomation.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowConfigModal(false)
                  setSelectedAutomation(null)
                }} 
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer p-1 rounded-full hover:bg-zinc-50 transition-colors border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">
                  Mensaje de WhatsApp Personalizado
                </label>
                <textarea
                  placeholder="Escribe el mensaje que se enviará automáticamente..."
                  value={customTemplateText}
                  onChange={e => setCustomTemplateText(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold text-zinc-800 outline-none transition-all h-32 resize-y"
                  required
                />
              </div>

              {/* Dynamic placeholders helper legend */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 space-y-2">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block">
                  Etiquetas dinámicas permitidas
                </span>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                  Puedes incluir estas etiquetas en tu mensaje. El sistema las reemplazará automáticamente con la información real de la venta antes de enviar el mensaje:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { tag: "{{cliente}}", label: "Nombre del cliente" },
                    { tag: "{{pedido_id}}", label: "Identificador del pedido" },
                    { tag: "{{total}}", label: "Total del pedido formateado" },
                    { tag: "{{tienda}}", label: "Nombre de tu tienda" }
                  ].map((place, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setCustomTemplateText(prev => prev + " " + place.tag)
                      }}
                      className="p-1.5 px-2 bg-white border border-zinc-205 rounded-lg hover:border-zinc-300 cursor-pointer flex items-center justify-between text-[10px] font-bold text-zinc-800 active:scale-95 transition-all"
                    >
                      <code className="text-emerald-600 font-mono font-extrabold">{place.tag}</code>
                      <span className="text-[8px] text-zinc-400 font-bold">{place.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 select-none">
                <button
                  type="submit"
                  disabled={updatingTemplate}
                  className="flex-grow py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 border-0"
                >
                  {updatingTemplate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Plantilla</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false)
                    setSelectedAutomation(null)
                  }}
                  className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
