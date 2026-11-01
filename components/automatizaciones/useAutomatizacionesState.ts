'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { Automation, AutomationFilterTab } from './types'

function getErrorMessage(error: unknown, fallback = 'Error desconocido') {
  return error instanceof Error ? error.message : fallback
}

export function useAutomatizacionesState() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<AutomationFilterTab>('all')

  // Modal creation states
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIcon, setNewIcon] = useState('👋')
  const [newChannels, setNewChannels] = useState<string[]>(['WhatsApp'])
  const [saving, setSaving] = useState(false)

  // Template customization modal states
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [customTemplateText, setCustomTemplateText] = useState('')
  const [updatingTemplate, setUpdatingTemplate] = useState(false)

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
          customTemplate: customTemplateText,
        }),
      })

      if (!res.ok) throw new Error('Fallo al guardar la plantilla')

      setAutomations(prev =>
        prev.map(a =>
          a.id === selectedAutomation.id ? { ...a, customTemplate: customTemplateText } : a
        )
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

  const handleToggle = async (automationId: string, currentActive: boolean) => {
    const nextActive = !currentActive
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
      setAutomations(prev =>
        prev.map(a => (a.id === automationId ? { ...a, active: currentActive } : a))
      )
    }
  }

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
          channels: newChannels,
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

  const handleUseTemplate = async (
    templateName: string,
    desc: string,
    icon: string,
    channels: string[]
  ) => {
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
          channels,
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

  const openConfigureModal = (item: Automation) => {
    setSelectedAutomation(item)
    setCustomTemplateText(item.customTemplate || '')
    setShowConfigModal(true)
  }

  const closeConfigureModal = () => {
    setShowConfigModal(false)
    setSelectedAutomation(null)
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
  const totalSentToday = automations
    .filter(a => a.active)
    .reduce((sum, a) => sum + a.sentToday, 0)
  const activeWithRates = automations.filter(a => a.active && a.rate !== '0%')
  const averageRate =
    activeWithRates.length > 0
      ? Math.round(
          activeWithRates.reduce((sum, a) => sum + parseInt(a.rate), 0) / activeWithRates.length
        )
      : 0

  return {
    loading,
    filterTab,
    setFilterTab,
    showModal,
    setShowModal,
    newName,
    setNewName,
    newDesc,
    setNewDesc,
    newIcon,
    setNewIcon,
    newChannels,
    setNewChannels,
    saving,
    showConfigModal,
    selectedAutomation,
    customTemplateText,
    setCustomTemplateText,
    updatingTemplate,
    handleSaveTemplate,
    handleToggle,
    handleCreate,
    handleUseTemplate,
    openConfigureModal,
    closeConfigureModal,
    totalCount,
    activeCount,
    inactiveCount,
    filtered,
    totalSentToday,
    averageRate,
  }
}

