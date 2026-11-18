'use client'

import React, { useEffect, useState } from 'react'
import {
  Bell,
  Check,
  Eye,
  Loader2,
  Send,
  ShoppingCart,
  Sliders,
  Smartphone,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AutomationRule {
  id: string
  name: string
  description: string
  active: boolean
  sentToday: number
  rate: string
  rateLabel: string
  icon: string
  channels: string[]
  customTemplate?: string | null
}

interface TabAutomatizacionesProps {
  storeName?: string
  storeWhatsapp?: string
  onPreviewInSimulator?: (text: string, label?: string) => void
}

const DYNAMIC_TAGS = [
  { tag: '{{cliente}}', label: 'Nombre del cliente' },
  { tag: '{{pedido_id}}', label: 'ID del pedido' },
  { tag: '{{total}}', label: 'Total en COP' },
  { tag: '{{tienda}}', label: 'Nombre de la tienda' },
]

export function TabAutomatizaciones({
  storeName = 'Mi Tienda',
  storeWhatsapp,
  onPreviewInSimulator,
}: TabAutomatizacionesProps) {
  const [automations, setAutomations] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [templateDraft, setTemplateDraft] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [recoveringCarts, setRecoveringCarts] = useState(false)

  useEffect(() => {
    async function loadAutomations() {
      try {
        const res = await fetch('/api/automation')
        if (!res.ok) throw new Error('Error al cargar automatizaciones')
        const data = await res.json()
        setAutomations(data.automations || [])
      } catch {
        toast.error('No se pudieron cargar las notificaciones automáticas')
      } finally {
        setLoading(false)
      }
    }
    loadAutomations()
  }, [])

  const formatPreviewSample = (template: string) => {
    return template
      .replace(/{{cliente}}/g, 'María Gómez')
      .replace(/{{pedido_id}}/g, 'FC-8942')
      .replace(/{{total}}/g, '85.000')
      .replace(/{{tienda}}/g, storeName)
  }

  const handleToggle = async (rule: AutomationRule) => {
    const nextActive = !rule.active
    setAutomations(prev =>
      prev.map(a => (a.id === rule.id ? { ...a, active: nextActive } : a))
    )

    try {
      const res = await fetch('/api/automation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationId: rule.id, active: nextActive }),
      })
      if (!res.ok) throw new Error()
      toast.success(
        nextActive ? `"${rule.name}" activada` : `"${rule.name}" pausada`
      )
    } catch {
      setAutomations(prev =>
        prev.map(a => (a.id === rule.id ? { ...a, active: rule.active } : a))
      )
      toast.error('No se pudo actualizar el estado')
    }
  }

  const handleStartEdit = (rule: AutomationRule) => {
    setEditingId(rule.id)
    setTemplateDraft(
      rule.customTemplate ||
        '¡Hola {{cliente}}! Tu pedido *#{{pedido_id}}* por *${{total}}* en *{{tienda}}* ha sido actualizado.'
    )
  }

  const handleSaveTemplate = async (ruleId: string) => {
    setSavingId(ruleId)
    try {
      const res = await fetch('/api/automation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          automationId: ruleId,
          customTemplate: templateDraft,
        }),
      })
      if (!res.ok) throw new Error()
      setAutomations(prev =>
        prev.map(a =>
          a.id === ruleId ? { ...a, customTemplate: templateDraft } : a
        )
      )
      setEditingId(null)
      toast.success('Plantilla de WhatsApp guardada')
    } catch {
      toast.error('Error al guardar la plantilla')
    } finally {
      setSavingId(null)
    }
  }

  const handleSendRealTest = async (rule: AutomationRule) => {
    setTestingId(rule.id)
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-automation',
          automationId: rule.id,
          targetPhone: storeWhatsapp,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar la prueba')
      toast.success(data.message || 'Mensaje de prueba enviado a tu WhatsApp')
      if (onPreviewInSimulator && data.previewText) {
        onPreviewInSimulator(data.previewText, `Prueba: ${rule.name}`)
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar mensaje de prueba por WhatsApp')
    } finally {
      setTestingId(null)
    }
  }

  const handleRecoverCartsNow = async () => {
    setRecoveringCarts(true)
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recover-carts' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en recuperación')
      if (data.sentCount > 0) {
        toast.success(data.message)
        setAutomations(prev =>
          prev.map(a =>
            a.name.toLowerCase().includes('carrito')
              ? { ...a, sentToday: a.sentToday + data.sentCount }
              : a
          )
        )
      } else {
        toast.info(data.message || 'No hay carritos abandonados pendientes por recuperar.')
      }
    } catch (e: any) {
      toast.error(e.message || 'No se pudo ejecutar la recuperación de carritos')
    } finally {
      setRecoveringCarts(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-12 flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-600 mb-2" />
        <span className="text-xs font-semibold">Cargando disparadores de WhatsApp...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Banner de Recuperación de Carritos Abandonados en 1 Clic */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-zinc-950">
                Recuperación de Carritos Abandonados por WhatsApp
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Conectado a WhatsAppSession
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              Detecta clientes que armaron su bolsa en tu tienda o en el chat y no finalizaron el pago, enviándoles un recordatorio automático con el link a tu tienda.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRecoverCartsNow}
          disabled={recoveringCarts}
          className="h-9 px-4 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all active:scale-95"
        >
          {recoveringCarts ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{recoveringCarts ? 'Revisando carritos...' : 'Recuperar Carritos Ahora'}</span>
        </button>
      </div>

      {/* Lista de Disparadores Transaccionales Reales */}
      <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 overflow-hidden">
        <div className="px-5 py-3.5 bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-800" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
              Disparadores Transaccionales de WhatsApp
            </span>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500">
            Variables: {'{{cliente}}'} · {'{{pedido_id}}'} · {'{{total}}'} · {'{{tienda}}'}
          </span>
        </div>

        {automations.map(rule => {
          const isEditing = editingId === rule.id
          const currentTemplate =
            (isEditing ? templateDraft : rule.customTemplate) ||
            '¡Hola {{cliente}}! Tu pedido *#{{pedido_id}}* por *${{total}}* en *{{tienda}}* ha sido actualizado.'

          return (
            <div key={rule.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-lg shrink-0">
                    {rule.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-zinc-950">{rule.name}</h4>
                      <span
                        className={cn(
                          'text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border',
                          rule.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                        )}
                      >
                        {rule.active ? 'Activa' : 'Pausada'}
                      </span>
                      {rule.sentToday > 0 && (
                        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                          {rule.sentToday} enviados
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">{rule.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {onPreviewInSimulator && (
                    <button
                      type="button"
                      onClick={() => {
                        onPreviewInSimulator(
                          formatPreviewSample(currentTemplate),
                          rule.name
                        )
                        toast.info(`Previsualizando "${rule.name}" en el simulador de WhatsApp`)
                      }}
                      className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[11px] font-bold text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Ver cómo luce este mensaje en el simulador de la derecha"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Simular</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSendRealTest(rule)}
                    disabled={testingId === rule.id}
                    className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-[11px] font-bold text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    title="Enviar prueba real a tu WhatsApp"
                  >
                    {testingId === rule.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>Probar WA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => (isEditing ? setEditingId(null) : handleStartEdit(rule))}
                    className={cn(
                      'h-8 px-3 rounded-lg border text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all',
                      isEditing
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                    )}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cerrar' : 'Plantilla'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(rule)}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                      rule.active ? 'bg-emerald-500' : 'bg-zinc-200'
                    )}
                    aria-label={`Activar o desactivar ${rule.name}`}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200',
                        rule.active ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="pt-3 mt-2 border-t border-zinc-100 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-7 space-y-2">
                      <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Editar Plantilla de Mensaje
                      </label>
                      <textarea
                        rows={4}
                        value={templateDraft}
                        onChange={e => setTemplateDraft(e.target.value)}
                        className="w-full p-3 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="md:col-span-5 space-y-2">
                      <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Vista Previa con Datos Reales
                      </label>
                      <div className="p-3 rounded-xl bg-[#DCF8C6]/60 border border-emerald-200/80 text-xs font-medium text-zinc-900 whitespace-pre-line leading-relaxed min-h-[96px]">
                        {formatPreviewSample(templateDraft)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 mr-1">
                        Insertar variable:
                      </span>
                      {DYNAMIC_TAGS.map(t => (
                        <button
                          key={t.tag}
                          type="button"
                          onClick={() => setTemplateDraft(prev => `${prev} ${t.tag}`)}
                          className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-[10px] font-mono font-bold text-zinc-800 cursor-pointer transition-colors"
                          title={t.label}
                        >
                          {t.tag}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveTemplate(rule.id)}
                      disabled={savingId === rule.id}
                      className="h-8 px-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {savingId === rule.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Guardar plantilla</span>
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
