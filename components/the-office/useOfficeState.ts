'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  StoreData,
  Agent,
  PrintedTicket,
  BASE_AGENTS
} from './types'
import { useOfficeLayout } from './useOfficeLayout'
import { useAgentSimulation } from './useAgentSimulation'
import { useAgentHiring } from './useAgentHiring'

export function useOfficeState(store: StoreData) {
  const [customAgents, setCustomAgents] = useState<Agent[]>(() => {
    const loaded: Agent[] = store.settings?.customAgents || []
    const slots = [
      { top: '78%', left: '26%' },
      { top: '56%', left: '24%' },
      { top: '56%', left: '78%' },
      { top: '78%', left: '50%' }
    ]
    return loaded.map((a, idx: number) => {
      let sittingDeskUrl = '/images/desk_l_vacant.png'
      let spriteUrl = '/images/sprite_sales.png'
      if (a.color === 'emerald') {
        sittingDeskUrl = '/images/deskt2/01-Photoroom.png'
        spriteUrl = '/images/sprite_nova.png'
      } else if (a.color === 'teal') {
        sittingDeskUrl = '/images/deskt/01-Photoroom.png'
        spriteUrl = '/images/sprite_sales.png'
      } else if (a.color === 'blue') {
        sittingDeskUrl = '/images/deskt3/01-Photoroom.png'
        spriteUrl = '/images/sprite_logistics.png'
      } else if (a.color === 'amber') {
        sittingDeskUrl = '/images/deskt4/01.png'
        spriteUrl = '/images/sprite_growth.png'
      }
      
      return {
        ...a,
        spriteUrl: a.spriteUrl || spriteUrl,
        sittingDeskUrl: a.sittingDeskUrl || sittingDeskUrl,
        deskPosition: slots[idx % slots.length]
      }
    })
  })

  const [agentsList, setAgentsList] = useState<Agent[]>(() => [...BASE_AGENTS, ...customAgents])

  // Layout hook
  const layout = useOfficeLayout(store.settings?.officeLayout)

  // Console and consolidated logs
  const [terminalLogs, setTerminalLogs] = useState<Record<string, string[]>>(() => {
    const logs: Record<string, string[]> = {}
    BASE_AGENTS.forEach(a => { logs[a.id] = [...a.initialLogs] })
    customAgents.forEach((a) => {
      logs[a.id] = [
        `Agente personalizado ${a.name} inicializado.`,
        `Rol: ${a.role}`,
        `Herramientas: [${a.tools.join(', ')}]`,
        'Esperando instrucciones...'
      ]
    })
    return logs
  })

  const [consolidatedLogs, setConsolidatedLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [The Office] Espacio agéntico inicializado para tienda: ${store.name}`,
    `[${new Date().toLocaleTimeString()}] [System] Todos los agentes de IA se han reportado a sus puestos de trabajo.`
  ])

  // Simulation hook
  const simulation = useAgentSimulation({
    customAgents,
    agentsList,
    setAgentsList,
    layoutItems: layout.layoutItems,
    getAgentDeskPosition: layout.getAgentDeskPosition,
    getStationCoordinates: layout.getStationCoordinates,
    setTerminalLogs,
    setConsolidatedLogs
  })

  // Selected agent & inspection state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'console' | 'profile'>('console')
  const [instruction, setInstruction] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [chatHistories, setChatHistories] = useState<Record<string, Array<{ role: 'user' | 'assistant'; content: string }>>>({})

  // Modals state
  const [printedTickets, setPrintedTickets] = useState<PrintedTicket[]>([])
  const [printedTicketsModalOpen, setPrintedTicketsModalOpen] = useState(false)
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false)
  const [boostedAgents, setBoostedAgents] = useState<Record<string, boolean>>({})
  const [logsModalOpen, setLogsModalOpen] = useState(false)

  // Hiring hook
  const hiring = useAgentHiring({
    customAgents,
    setCustomAgents,
    setAgentsList,
    setLayoutItems: layout.setLayoutItems,
    setSelectedAgentId,
    setTerminalLogs
  })

  const terminalEndRef = useRef<HTMLDivElement>(null)
  const consolidatedEndRef = useRef<HTMLDivElement>(null)

  // Scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLogs, selectedAgentId])

  useEffect(() => {
    consolidatedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consolidatedLogs, logsModalOpen])

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAgentId || !instruction.trim() || submitting) return

    const agent = [...BASE_AGENTS, ...customAgents].find(a => a.id === selectedAgentId)
    if (!agent) return

    if (simulation.agentStatus[selectedAgentId] && simulation.agentStatus[selectedAgentId] !== 'idle') {
      toast.warning(`${selectedAgentId} está realizando otra tarea. Espera a que regrese.`)
      return
    }

    const timeStr = new Date().toLocaleTimeString()
    
    setTerminalLogs(prev => ({
      ...prev,
      [selectedAgentId]: [
        ...(prev[selectedAgentId] || []),
        `[${timeStr}] > ORDEN: "${instruction}"`
      ]
    }))

    setConsolidatedLogs(prev => [
      ...prev,
      `[${timeStr}] [${selectedAgentId}] ORDEN RECIBIDA: "${instruction}"`
    ])

    const userQuery = instruction
    const currentHistory = chatHistories[selectedAgentId] || []
    
    setChatHistories(prev => ({
      ...prev,
      [selectedAgentId]: [
        ...currentHistory,
        { role: 'user', content: userQuery }
      ]
    }))

    setInstruction('')
    setSubmitting(true)

    simulation.setAgentStatus(prev => ({ ...prev, [selectedAgentId]: 'working' }))
    simulation.setAgentBubbles(prev => ({ ...prev, [selectedAgentId]: 'Pensando... 🧠' }))

    try {
      const res = await fetch('/api/agent/office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: selectedAgentId,
          instruction: userQuery,
          history: currentHistory
        })
      })

      const data = await res.json()
      const finishTime = new Date().toLocaleTimeString()

      if (!res.ok) throw new Error(data.error || 'Failed response')

      setChatHistories(prev => ({
        ...prev,
        [selectedAgentId]: [
          ...(prev[selectedAgentId] || []),
          { role: 'assistant' as const, content: String(data.text || '') }
        ].slice(-10)
      }))

      let destination = layout.getStationCoordinates('whiteboard')
      let actionText = 'Escribiendo reporte... ✍️'
      let logText = 'Procesando análisis en la pizarra principal...'

      const toolType = data.action?.type
      if (toolType && toolType !== 'NONE') {
        if (toolType === 'create_coupon') {
          destination = layout.getStationCoordinates('printer')
          actionText = 'Imprimiendo cupón... 🎟️'
          logText = 'Imprimiendo cupón de descuento en la impresora...'
          
          setPrintedTickets(prev => [
            {
              time: finishTime,
              agent: selectedAgentId,
              action: 'Crear Cupón 🎟️',
              details: `Cupón creado exitosamente. Respuesta: ${data.text.slice(0, 60)}...`
            },
            ...prev
          ])
        } else if (toolType === 'list_orders' || toolType === 'update_order_status') {
          destination = layout.getStationCoordinates('meeting')
          actionText = 'Procesando despachos... 📦'
          logText = 'Gestionando estado de pedidos en la estación de envíos...'
          
          setPrintedTickets(prev => [
            {
              time: finishTime,
              agent: selectedAgentId,
              action: 'Logística / Pedidos 📦',
              details: `Gestión de despacho o listado de órdenes. Respuesta: ${data.text.slice(0, 60)}...`
            },
            ...prev
          ])
        } else if (toolType === 'update_builder_layout' || toolType === 'update_product' || toolType === 'create_product') {
          destination = layout.getStationCoordinates('whiteboard')
          actionText = 'Actualizando catálogo... 🖥️'
          logText = 'Modificando elementos del catálogo o constructor de páginas...'
          
          setPrintedTickets(prev => [
            {
              time: finishTime,
              agent: selectedAgentId,
              action: 'Modificar Catálogo 🖥️',
              details: `Actualizando catálogo o constructor. Respuesta: ${data.text.slice(0, 60)}...`
            },
            ...prev
          ])
        }
      }

      simulation.walkAgent(
        selectedAgentId,
        destination,
        actionText,
        'Orden completada. Esperando comandos.',
        () => {
          const toolActionLog = toolType && toolType !== 'NONE'
            ? `[${finishTime}] [Herramienta] Acción de base de datos ejecutada: ${toolType}.`
            : null

          setTerminalLogs(prev => {
            const list = [...(prev[selectedAgentId] || [])]
            if (toolActionLog) list.push(toolActionLog)
            list.push(`[${finishTime}] [Respuesta] Nova OS:\n${data.text}`)
            return {
              ...prev,
              [selectedAgentId]: list
            }
          })

          setConsolidatedLogs(prev => {
            const list = [...prev]
            if (toolActionLog) list.push(`[${finishTime}] [${selectedAgentId}] ${toolActionLog}`)
            list.push(`[${finishTime}] [${selectedAgentId}] ${logText}`)
            list.push(`[${finishTime}] [${selectedAgentId}] Finalizó procesamiento: "${data.text.slice(0, 80)}..."`)
            return list
          })
        },
        () => {
          setSubmitting(false)
        }
      )

    } catch (err: unknown) {
      const errorTime = new Date().toLocaleTimeString()
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión'
      setTerminalLogs(prev => ({
        ...prev,
        [selectedAgentId]: [
          ...(prev[selectedAgentId] || []),
          `[${errorTime}] [ERROR] Falló procesamiento: ${errorMsg}`
        ]
      }))
      simulation.setAgentStatus(prev => ({ ...prev, [selectedAgentId]: 'idle' }))
      simulation.setAgentBubbles(prev => ({ ...prev, [selectedAgentId]: 'Error en el sistema.' }))
      toast.error('Error al comandar al agente')
      setSubmitting(false)
    }
  }

  const handleBoostAgent = (agent: Agent) => {
    const timeStr = new Date().toLocaleTimeString()
    setBoostedAgents(prev => ({ ...prev, [agent.id]: true }))
    simulation.setAgentBubbles(prev => ({ ...prev, [agent.id]: '¡Gracias por el café! ☕️ Latencia optimizada.' }))
    setConsolidatedLogs(prev => [
      ...prev,
      `[${timeStr}] [System] Has invitado un café premium a ${agent.name}.`
    ])
    
    setAgentsList(prev => prev.map(a => {
      if (a.id === agent.id) {
        return { ...a, latency: '0.4s', accuracy: '99.9%' }
      }
      return a
    }))
    
    toast.success(`¡Café enviado a ${agent.name}!`)
    setCoffeeModalOpen(false)
  }

  const selectedAgent = [...BASE_AGENTS, ...customAgents].find(a => a.id === selectedAgentId) || null

  return {
    customAgents,
    setCustomAgents,
    agentsList,
    setAgentsList,
    ...layout,
    ...simulation,
    ...hiring,
    selectedAgentId,
    setSelectedAgentId,
    selectedAgent,
    activeTab,
    setActiveTab,
    instruction,
    setInstruction,
    submitting,
    consolidatedLogs,
    setConsolidatedLogs,
    terminalLogs,
    setTerminalLogs,
    printedTickets,
    printedTicketsModalOpen,
    setPrintedTicketsModalOpen,
    coffeeModalOpen,
    setCoffeeModalOpen,
    boostedAgents,
    logsModalOpen,
    setLogsModalOpen,
    terminalEndRef,
    consolidatedEndRef,
    handleSendCommand,
    handleBoostAgent
  }
}

export type OfficeState = ReturnType<typeof useOfficeState>
