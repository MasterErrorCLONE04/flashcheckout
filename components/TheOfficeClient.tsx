'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Building, 
  Bot, 
  Terminal, 
  Send, 
  Cpu, 
  Layers, 
  Activity, 
  TrendingUp, 
  Coins, 
  X, 
  Plus, 
  Trash2,
  Coffee,
  Printer,
  Sliders
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StoreData {
  id: string
  name: string
  slug: string
  category: string
  whatsapp: string | null
  whatsappConnected: boolean
  mpConnected: boolean
  settings: any
}

interface Agent {
  id: string
  name: string
  role: string
  color: string
  avatarBg: string
  avatarEmoji: string
  spriteUrl: string
  sittingDeskUrl: string
  deskPosition: { top: string; left: string }
  model: string
  tokensUsed: number
  accuracy: string
  latency: string
  description: string
  tools: string[]
  initialLogs: string[]
}

const BASE_AGENTS: Agent[] = [
  {
    id: 'Nova',
    name: 'Nova',
    role: 'Copiloto de Administración',
    color: 'emerald',
    avatarBg: 'bg-emerald-500',
    avatarEmoji: '🤖',
    spriteUrl: '/images/sprite_nova.png',
    sittingDeskUrl: '/images/office/desk_nova.png',
    deskPosition: { top: '56%', left: '52%' }, // Escritorio central
    model: 'meta-llama/llama-3.1-8b-instruct',
    tokensUsed: 42350,
    accuracy: '98.5%',
    latency: '1.4s',
    description: 'Gestiona la configuración de la tienda, stock de catálogo, métricas comerciales y diseño del constructor.',
    tools: ['search_products', 'update_product', 'list_orders', 'update_order_status', 'create_coupon', 'update_builder_layout'],
    initialLogs: [
      'Nova inicializada correctamente.',
      'Escaneando base de datos del catálogo... OK.',
      'Sincronizada con el constructor de páginas en http://localhost:3000/tienda',
      'Esperando órdenes del comerciante...'
    ]
  },
  {
    id: 'SalesBot',
    name: 'SalesBot',
    role: 'Vendedor de WhatsApp',
    color: 'teal',
    avatarBg: 'bg-teal-500',
    avatarEmoji: '👩‍💼',
    spriteUrl: '/images/sprite_sales.png',
    sittingDeskUrl: '/images/office/desk_sales.png',
    deskPosition: { top: '38%', left: '32%' }, // Escritorio superior izquierda
    model: 'google/gemma-2-9b-it',
    tokensUsed: 128400,
    accuracy: '97.2%',
    latency: '0.9s',
    description: 'Responde chats entrantes de WhatsApp de clientes finales, recomienda productos y motiva cierres de carritos.',
    tools: ['search_products'],
    initialLogs: [
      'SalesBot en línea en instancia WhatsApp.',
      'Monitoreando mensajes de chat entrantes...',
      'Cargando plantillas de respuesta automatizadas...',
      'Sistema listo para capturar carritos de compra.'
    ]
  },
  {
    id: 'Logistics',
    name: 'Logistics',
    role: 'Coordinador de Envíos',
    color: 'blue',
    avatarBg: 'bg-blue-500',
    avatarEmoji: '📦',
    spriteUrl: '/images/sprite_logistics.png',
    sittingDeskUrl: '/images/office/desk_logistics.png',
    deskPosition: { top: '38%', left: '68%' }, // Escritorio superior derecha
    model: 'qwen/qwen-2.5-72b-instruct',
    tokensUsed: 15300,
    accuracy: '99.1%',
    latency: '1.8s',
    description: 'Monitorea pedidos completados, asigna repartidores locales y gestiona el flujo logístico de despachos.',
    tools: ['list_orders', 'update_order_status'],
    initialLogs: [
      'LogisticAgent en línea.',
      'Escaneando lista de pedidos pendientes de entrega...',
      'Verificando cobertura de zonas de reparto... OK.',
      'Listando repartidores de turno... Esperando cambios de estado.'
    ]
  },
  {
    id: 'Growth',
    name: 'Growth',
    role: 'Estratega de Marketing',
    color: 'amber',
    avatarBg: 'bg-amber-500',
    avatarEmoji: '🚀',
    spriteUrl: '/images/sprite_growth.png',
    sittingDeskUrl: '/images/office/desk_growth1.png',
    deskPosition: { top: '78%', left: '76%' }, // Escritorio inferior derecha
    model: 'google/gemma-2-9b-it',
    tokensUsed: 62400,
    accuracy: '96.8%',
    latency: '1.2s',
    description: 'Analiza métricas de retención, diseña cupones de promoción y redacta copys publicitarios de alta conversión.',
    tools: ['create_coupon', 'search_products'],
    initialLogs: [
      'GrowthAgent activo.',
      'Analizando tasa de rebote del checkout... calculado 18.5%',
      'Generando propuestas de copywriting para campañas...',
      'Listo para diseñar promociones de temporada.'
    ]
  }
]

// Common area coordinates
const COMMON_AREAS = {
  Printer: { top: '20%', left: '32%' },
  WaterCoolerLeft: { top: '55%', left: '12%' },
  WaterCoolerRight: { top: '55%', left: '90%' },
  Whiteboard: { top: '18%', left: '52%' },
  CoffeeArea: { top: '20%', left: '80%' }
}

const DECOR_PLANTS = [
  { top: '15%', left: '18%' },
  { top: '15%', left: '46%' },
  { top: '15%', left: '68%' },
  { top: '15%', left: '94%' },
  { top: '88%', left: '16%' },
  { top: '88%', left: '64%' },
  { top: '88%', left: '94%' }
]

const OFFICE_ASSET_URLS = {
  Desk: '/images/pixel_desk.png',
  Board: '/images/office/whiteboard.png',
  Coffee: '/images/office/coffee_bar.png',
  Plant: '/images/pixel_plant.png',
  Water: '/images/office/cooler_h2o.png',
  Printer: '/images/office/printer.png',
  Entrance: '/images/office/entrance_mat.png',
  Extinguisher: '/images/office/wall_extinguisher.png'
}

const AVAILABLE_TOOLS = [
  { name: 'search_products', label: '🔍 Buscar Productos' },
  { name: 'update_product', label: '🔧 Editar Productos' },
  { name: 'list_orders', label: '📋 Listar Pedidos' },
  { name: 'update_order_status', label: '🚚 Despachar Pedidos' },
  { name: 'create_coupon', label: '🎟️ Crear Cupones' },
  { name: 'update_builder_layout', label: '🖥️ Modificar Constructor' }
]

const removeWhiteBg = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(url)
        return
      }
      ctx.drawImage(img, 0, 0)
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data
        // Target pixels that are white/extremely light grey
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i+1]
          const b = data[i+2]
          if (r > 240 && g > 240 && b > 240) {
            data[i+3] = 0 // Transparent alpha
          }
        }
        ctx.putImageData(imgData, 0, 0)
        resolve(canvas.toDataURL())
      } catch (e) {
        console.warn('[Sprite Clean] Canvas blocked: Same-origin verification required.', e)
        resolve(url)
      }
    }
    img.onerror = () => resolve(url)
  })
}

export default function TheOfficeClient({
  store,
  productsCount,
  ordersCount
}: {
  store: StoreData
  productsCount: number
  ordersCount: number
}) {
  const [customAgents, setCustomAgents] = useState<Agent[]>(() => {
    const loaded = store.settings?.customAgents || []
    // Assign desk coords to match concept
    const slots = [
      { top: '78%', left: '26%' },
      { top: '56%', left: '24%' },
      { top: '56%', left: '78%' },
      { top: '78%', left: '50%' }
    ]
    return loaded.map((a: any, idx: number) => ({
      ...a,
      spriteUrl: a.spriteUrl || '/images/office/agent_human_standing.png',
      sittingDeskUrl: a.sittingDeskUrl || '/images/office/desk_growth2.png',
      deskPosition: slots[idx % slots.length]
    }))
  })

  const [agentsList, setAgentsList] = useState<Agent[]>(() => {
    return [...BASE_AGENTS, ...customAgents]
  })

  // Handle coordinates for all agents
  const [agentPositions, setAgentPositions] = useState<Record<string, { top: string; left: string }>>(() => {
    const coords: Record<string, { top: string; left: string }> = {}
    BASE_AGENTS.forEach(a => { coords[a.id] = { ...a.deskPosition } })
    customAgents.forEach((a: any) => { coords[a.id] = { ...a.deskPosition } })
    return coords
  })

  const [agentFacingLeft, setAgentFacingLeft] = useState<Record<string, boolean>>({})
  const [agentStatus, setAgentStatus] = useState<Record<string, 'idle' | 'walking' | 'working'>>({})

  // Speech bubbles state
  const [agentBubbles, setAgentBubbles] = useState<Record<string, string>>({
    Nova: 'Sincronizada con base de datos. Lista.',
    SalesBot: 'Monitoreando WhatsApp en tiempo real.',
    Logistics: 'Esperando pedidos listos para envío.',
    Growth: 'Ideando campañas de conversión...'
  })

  // Agent console logs
  const [terminalLogs, setTerminalLogs] = useState<Record<string, string[]>>(() => {
    const logs: Record<string, string[]> = {}
    BASE_AGENTS.forEach(a => { logs[a.id] = [...a.initialLogs] })
    customAgents.forEach((a: any) => {
      logs[a.id] = [
        `Agente personalizado ${a.name} inicializado.`,
        `Rol: ${a.role}`,
        `Herramientas: [${a.tools.join(', ')}]`,
        'Esperando instrucciones...'
      ]
    })
    return logs
  })

  const [processedSprites, setProcessedSprites] = useState<Record<string, string>>({})
  const [processedAssets, setProcessedAssets] = useState<Record<string, string>>({})
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'console' | 'profile'>('console')
  const [instruction, setInstruction] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [consolidatedLogs, setConsolidatedLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [The Office] Espacio agéntico inicializado para tienda: ${store.name}`,
    `[${new Date().toLocaleTimeString()}] [System] Todos los agentes de IA se han reportado a sus puestos de trabajo.`
  ])

  // Modals / Creation form state
  const [hiringModalOpen, setHiringModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newModel, setNewModel] = useState('meta-llama/llama-3.1-8b-instruct')
  const [newDescription, setNewDescription] = useState('')
  const [newSystemPrompt, setNewSystemPrompt] = useState('')
  const [newAvatarEmoji, setNewAvatarEmoji] = useState('🕵️')
  const [newTools, setNewTools] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  const terminalEndRef = useRef<HTMLDivElement>(null)
  const consolidatedEndRef = useRef<HTMLDivElement>(null)

  // Load and clean sprites and assets from solid white backgrounds
  useEffect(() => {
    const processSpritesAndAssets = async () => {
      const spriteMap: Record<string, string> = {}
      const assetMap: Record<string, string> = {}
      
      // Sprites
      const allList = [...BASE_AGENTS, ...customAgents]
      for (const ag of allList) {
        try {
          const cleanUrl = await removeWhiteBg(ag.spriteUrl)
          spriteMap[ag.id] = cleanUrl
        } catch {
          spriteMap[ag.id] = ag.spriteUrl
        }
      }

      // Static assets
      for (const [key, url] of Object.entries(OFFICE_ASSET_URLS)) {
        try {
          const cleanUrl = await removeWhiteBg(url)
          assetMap[key] = cleanUrl
        } catch {
          assetMap[key] = url
        }
      }

      setProcessedSprites(spriteMap)
      setProcessedAssets(assetMap)
    }
    processSpritesAndAssets()
  }, [customAgents])

  // Scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalLogs, selectedAgentId])

  useEffect(() => {
    consolidatedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [consolidatedLogs])

  const walkAgent = (
    agentId: string,
    destination: { top: string; left: string },
    actionText: string,
    finalText: string,
    onArrival: () => void,
    onFinish: () => void
  ) => {
    const currentCoords = agentPositions[agentId] || { top: '50%', left: '50%' }
    const deskPosition = [...BASE_AGENTS, ...customAgents].find(a => a.id === agentId)?.deskPosition || { top: '50%', left: '50%' }

    // 1. Determine direction
    const currentLeft = parseFloat(currentCoords.left)
    const destLeft = parseFloat(destination.left)
    setAgentFacingLeft(prev => ({ ...prev, [agentId]: destLeft < currentLeft }))
    setAgentStatus(prev => ({ ...prev, [agentId]: 'walking' }))
    setAgentBubbles(prev => ({ ...prev, [agentId]: 'Yendo a realizar tarea...' }))

    // 2. Start walking
    setAgentPositions(prev => ({ ...prev, [agentId]: destination }))

    // 3. Arrive after 3s
    setTimeout(() => {
      setAgentStatus(prev => ({ ...prev, [agentId]: 'working' }))
      setAgentBubbles(prev => ({ ...prev, [agentId]: actionText }))
      onArrival()

      // 4. Perform action for 4s, then walk back
      setTimeout(() => {
        const deskLeft = parseFloat(deskPosition.left)
        setAgentFacingLeft(prev => ({ ...prev, [agentId]: deskLeft < destLeft }))
        setAgentStatus(prev => ({ ...prev, [agentId]: 'walking' }))
        setAgentBubbles(prev => ({ ...prev, [agentId]: 'Regresando a mi puesto...' }))
        setAgentPositions(prev => ({ ...prev, [agentId]: deskPosition }))

        // 5. Arrive back to desk after 3s
        setTimeout(() => {
          setAgentStatus(prev => ({ ...prev, [agentId]: 'idle' }))
          setAgentFacingLeft(prev => ({ ...prev, [agentId]: false }))
          setAgentBubbles(prev => ({ ...prev, [agentId]: finalText }))
          onFinish()
        }, 3000)

      }, 4000)

    }, 3000)
  }

  // Simulation Loop: triggers dynamic walking activities periodically for ANY agent in the office
  useEffect(() => {
    const interval = setInterval(() => {
      const list = [...BASE_AGENTS, ...customAgents]
      if (list.length === 0) return

      const randomAgent = list[Math.floor(Math.random() * list.length)]
      if (agentStatus[randomAgent.id] && agentStatus[randomAgent.id] !== 'idle') return

      const destinations = ['Printer', 'WaterCoolerLeft', 'WaterCoolerRight', 'Whiteboard', 'CoffeeArea']
      const destName = destinations[Math.floor(Math.random() * destinations.length)]
      const destination = COMMON_AREAS[destName as keyof typeof COMMON_AREAS]

      const activities = {
        Printer: { action: 'Imprimiendo documentos...', log: 'Imprimiendo reportes de operaciones...' },
        WaterCoolerLeft: { action: 'Tomando agua...', log: 'Tomando un descanso en el dispensador de agua...' },
        WaterCoolerRight: { action: 'Tomando agua...', log: 'Recargando energías en el dispensador...' },
        Whiteboard: { action: 'Revisando planes...', log: 'Analizando diagramas de flujo de trabajo...' },
        CoffeeArea: { action: 'Preparando café...', log: 'Tomando una taza de café en el break...' }
      }

      const activity = activities[destName as keyof typeof activities]
      const timeStr = new Date().toLocaleTimeString()

      walkAgent(
        randomAgent.id,
        destination,
        activity.action,
        'De vuelta en el escritorio.',
        () => {
          setTerminalLogs(prev => ({
            ...prev,
            [randomAgent.id]: [...(prev[randomAgent.id] || []), `[${timeStr}] ${activity.log}`].slice(-100)
          }))
          setConsolidatedLogs(prev => [
            ...prev,
            `[${timeStr}] [${randomAgent.id}] ${activity.log}`
          ].slice(-150))
        },
        () => {
          // Increment tokens
          setAgentsList(prev => prev.map(a => {
            if (a.id === randomAgent.id) {
              return { ...a, tokensUsed: a.tokensUsed + Math.floor(Math.random() * 90) + 30 }
            }
            return a
          }))
        }
      )

    }, 15000)

    return () => clearInterval(interval)
  }, [customAgents, agentStatus, agentPositions])

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAgentId || !instruction.trim() || submitting) return

    const agent = [...BASE_AGENTS, ...customAgents].find(a => a.id === selectedAgentId)
    if (!agent) return

    if (agentStatus[selectedAgentId] && agentStatus[selectedAgentId] !== 'idle') {
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
    setInstruction('')
    setSubmitting(true)

    walkAgent(
      selectedAgentId,
      COMMON_AREAS.Whiteboard,
      'Procesando instrucción en la pizarra...',
      'Orden procesada. Esperando comandos.',
      async () => {
        try {
          const res = await fetch('/api/agent/office', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentType: selectedAgentId,
              instruction: userQuery
            })
          })

          const data = await res.json()
          const finishTime = new Date().toLocaleTimeString()

          if (!res.ok) throw new Error(data.error || 'Failed response')

          const toolActionLog = data.action && data.action.type !== 'NONE'
            ? `[${finishTime}] [Herramienta] Acción de base de datos ejecutada: ${data.action.type}.`
            : null

          setTerminalLogs(prev => {
            const list = [...(prev[selectedAgentId] || [])]
            if (toolActionLog) list.push(toolActionLog)
            list.push(`[${finishTime}] [Respuesta] Nova OS:\n${data.text}`)
            return list
          })

          setConsolidatedLogs(prev => {
            const list = [...prev]
            if (toolActionLog) list.push(`[${finishTime}] [${selectedAgentId}] ${toolActionLog}`)
            list.push(`[${finishTime}] [${selectedAgentId}] Finalizó procesamiento: "${data.text.slice(0, 80)}..."`)
            return list
          })

        } catch (err: any) {
          const errorTime = new Date().toLocaleTimeString()
          setTerminalLogs(prev => ({
            ...prev,
            [selectedAgentId]: [
              ...(prev[selectedAgentId] || []),
              `[${errorTime}] [ERROR] Falló procesamiento: ${err.message || 'Error de conexión'}`
            ]
          }))
          toast.error('Error al comanda al agente')
        } finally {
          setSubmitting(false)
        }
      },
      () => {}
    )
  }

  // Create custom agent submit
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newRole || !newSystemPrompt || creating) return

    setCreating(true)
    try {
      const res = await fetch('/api/agent/office/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          role: newRole,
          model: newModel,
          description: newDescription,
          systemPrompt: newSystemPrompt,
          avatarEmoji: newAvatarEmoji,
          tools: newTools
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed creation')

      // Assign slots dynamically to concepts coords
      const slots = [
        { top: '78%', left: '26%' },
        { top: '56%', left: '24%' },
        { top: '56%', left: '78%' },
        { top: '78%', left: '50%' }
      ]
      const updatedCustoms = data.customAgents.map((a: any, idx: number) => ({
        ...a,
        spriteUrl: a.spriteUrl || '/images/office/agent_human_standing.png',
        sittingDeskUrl: a.sittingDeskUrl || '/images/office/desk_growth2.png',
        deskPosition: slots[idx % slots.length]
      }))

      setCustomAgents(updatedCustoms)
      setAgentsList([...BASE_AGENTS, ...updatedCustoms])
      
      // Setup coordinates for the new agent desk slot
      const newestAgent = updatedCustoms[updatedCustoms.length - 1]
      setAgentPositions(prev => ({
        ...prev,
        [newestAgent.id]: { ...newestAgent.deskPosition }
      }))

      // Reset logs for new agent
      setTerminalLogs(prev => ({
        ...prev,
        [newestAgent.id]: [
          `Agente personalizado ${newestAgent.name} inicializado.`,
          `Rol: ${newestAgent.role}`,
          `Herramientas: [${newestAgent.tools.join(', ')}]`,
          'Esperando instrucciones...'
        ]
      }))

      toast.success(`¡Agente ${newName} contratado exitosamente!`)
      setHiringModalOpen(false)
      // Reset form
      setNewName('')
      setNewRole('')
      setNewDescription('')
      setNewSystemPrompt('')
      setNewTools([])
    } catch (e: any) {
      toast.error(e.message || 'Fallo de conexión')
    } finally {
      setCreating(false)
    }
  }

  // Dismiss custom agent
  const handleDismissAgent = async (agentId: string) => {
    if (!confirm('¿Estás seguro de que deseas despedir a este agente de la oficina?')) return

    try {
      const res = await fetch(`/api/agent/office/custom?id=${agentId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed deletion')

      // Map slots to remaining
      const slots = [
        { top: '78%', left: '26%' },
        { top: '56%', left: '24%' },
        { top: '56%', left: '78%' },
        { top: '78%', left: '50%' }
      ]
      const updatedCustoms = data.customAgents.map((a: any, idx: number) => ({
        ...a,
        spriteUrl: a.spriteUrl || '/images/office/agent_human_standing.png',
        sittingDeskUrl: a.sittingDeskUrl || '/images/office/desk_growth2.png',
        deskPosition: slots[idx % slots.length]
      }))

      setCustomAgents(updatedCustoms)
      setAgentsList([...BASE_AGENTS, ...updatedCustoms])
      setSelectedAgentId(null)
      toast.success('Agente despedido con éxito.')
    } catch (e: any) {
      toast.error(e.message || 'Fallo de conexión')
    }
  }

  const selectedAgent = [...BASE_AGENTS, ...customAgents].find(a => a.id === selectedAgentId)

  // Slots positions of all desks in the room to render the desk assets
  const ALL_DESKS = [
    { id: 'NovaDesk', top: '56%', left: '52%' },
    { id: 'SalesDesk', top: '38%', left: '32%' },
    { id: 'LogisticsDesk', top: '38%', left: '68%' },
    { id: 'GrowthDesk', top: '78%', left: '76%' },
    { id: 'DeskSlot1', top: '78%', left: '26%' },
    { id: 'DeskSlot2', top: '56%', left: '24%' },
    { id: 'DeskSlot3', top: '56%', left: '78%' },
    { id: 'DeskSlot4', top: '78%', left: '50%' }
  ]

  const handleCustomizeOffice = () => {
    toast.success('¡Entorno modular personalizable listo! Haz clic en cualquier escritorio o contrata agentes.')
  }

  return (
    <div className="space-y-6 pb-12 font-sans select-none animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
              <Building className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-950">The Office</h1>
              <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">Centro Agéntico de Operaciones de {store.name}</p>
            </div>
          </div>
        </div>
        
        {/* Header Actions & Stats */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCustomizeOffice}
            className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-sm active:scale-98 transition-all select-none cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-zinc-500" />
            <span>Personalizar oficina</span>
          </button>

          <button 
            onClick={() => setHiringModalOpen(true)}
            className="bg-zinc-955 hover:bg-zinc-850 border border-zinc-200/20 text-white text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-md active:scale-98 transition-all select-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Contratar Agente</span>
          </button>

          <div className="flex items-center gap-6 bg-white border border-zinc-200/80 px-4 py-2 rounded-xl shadow-sm">
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block leading-none">Productos</span>
              <span className="text-base font-black text-zinc-900 mt-1 block leading-none">{productsCount}</span>
            </div>
            <div className="w-px h-6 bg-zinc-200" />
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block leading-none">Pedidos</span>
              <span className="text-base font-black text-zinc-900 mt-1 block leading-none">{ordersCount}</span>
            </div>
            <div className="w-px h-6 bg-zinc-200" />
            <div className="text-left">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block leading-none">Agentes Activos</span>
              <span className="text-base font-black text-emerald-600 mt-1 block leading-none animate-pulse">
                {BASE_AGENTS.length + customAgents.length} / 8
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main interactive area: Map container - REBRANDED PREMIUM WOOD & GLASS LAYOUT */}
      <div 
        className="relative w-full aspect-[2/1] min-h-[380px] md:min-h-[480px] border border-zinc-300 rounded-3xl overflow-hidden shadow-2xl select-none"
        style={{
          backgroundImage: "url('/images/premium_floor.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
          imageRendering: 'pixelated'
        }}
      >
        
        {/* Glow lights on corners */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ================= MODERN GLASS WALL PARTITIONS ================= */}
        {/* Top wall divider */}
        <div className="absolute top-0 left-0 w-full h-[14%] bg-white/5 border-b border-white/15 backdrop-blur-[1.5px] z-0 flex justify-around items-end select-none pointer-events-none">
          <div className="w-8 h-full bg-white/10 border-x border-white/5" />
          <div className="w-8 h-full bg-white/10 border-x border-white/5" />
          <div className="w-8 h-full bg-white/10 border-x border-white/5" />
          <div className="w-8 h-full bg-white/10 border-x border-white/5" />
        </div>

        {/* Wall details: fire extinguishers */}
        <div className="absolute top-[4%] left-[8%] z-10 w-6 h-10 select-none pointer-events-none">
          <img 
            src={processedAssets.Extinguisher || OFFICE_ASSET_URLS.Extinguisher} 
            alt="Extinguisher" 
            className="w-full h-full object-contain mix-blend-multiply"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        <div className="absolute top-[4%] right-[8%] z-10 w-6 h-10 select-none pointer-events-none">
          <img 
            src={processedAssets.Extinguisher || OFFICE_ASSET_URLS.Extinguisher} 
            alt="Extinguisher" 
            className="w-full h-full object-contain mix-blend-multiply"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Left wall partition */}
        <div className="absolute left-0 top-0 h-full w-[16px] border-r border-white/10 bg-white/5 backdrop-blur-[1px] z-10 pointer-events-none" />
        
        {/* Right wall partition */}
        <div className="absolute right-0 top-0 h-full w-[16px] border-l border-white/10 bg-white/5 backdrop-blur-[1px] z-10 pointer-events-none" />

        {/* Bottom wall segments flanking the welcome mat */}
        <div className="absolute bottom-0 left-0 w-[42%] h-[24px] border-t border-white/10 bg-white/5 backdrop-blur-[1px] z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[42%] h-[24px] border-t border-white/10 bg-white/5 backdrop-blur-[1px] z-10 pointer-events-none" />

        {/* Welcome mat & loungers (Entrance) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-[36px] z-20 pointer-events-none">
          <img 
            src={processedAssets.Entrance || OFFICE_ASSET_URLS.Entrance} 
            alt="Entrance Mat" 
            className="w-full h-full object-contain mix-blend-multiply animate-in fade-in duration-300"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* ================= STATIC PIXEL ART FURNITURE & STATIONS ================= */}

        {/* 1. Whiteboard (Pizarra) */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in duration-300 z-10 bg-zinc-950/20 backdrop-blur-[1px] border border-zinc-700/30 px-3 py-1 rounded-xl"
          style={{ top: COMMON_AREAS.Whiteboard.top, left: COMMON_AREAS.Whiteboard.left }}
        >
          <img 
            src={processedAssets.Board || OFFICE_ASSET_URLS.Board} 
            alt="Whiteboard" 
            className="w-24 h-20 object-contain mix-blend-multiply"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[8px] text-zinc-700 font-black uppercase mt-1">Whiteboard</span>
        </div>

        {/* 2. Printer Station */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in duration-300 z-10 bg-zinc-950/20 backdrop-blur-[1px] border border-zinc-700/30 px-3 py-1 rounded-xl"
          style={{ top: COMMON_AREAS.Printer.top, left: COMMON_AREAS.Printer.left }}
        >
          <img 
            src={processedAssets.Printer || OFFICE_ASSET_URLS.Printer} 
            alt="Printer" 
            className="w-16 h-16 object-contain mix-blend-multiply"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[8px] text-zinc-700 font-black uppercase mt-1">Printer</span>
        </div>

        {/* 3. Coffee Station */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in duration-300 z-10 bg-zinc-950/20 backdrop-blur-[1px] border border-zinc-700/30 px-3 py-1 rounded-xl"
          style={{ top: COMMON_AREAS.CoffeeArea.top, left: COMMON_AREAS.CoffeeArea.left }}
        >
          <img 
            src={processedAssets.Coffee || OFFICE_ASSET_URLS.Coffee} 
            alt="Coffee Machine" 
            className="w-18 h-18 object-contain mix-blend-multiply"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[8px] text-zinc-700 font-black uppercase mt-1">Coffee Bar</span>
        </div>

        {/* 4. Water Coolers */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in duration-300 z-10"
          style={{ top: COMMON_AREAS.WaterCoolerLeft.top, left: COMMON_AREAS.WaterCoolerLeft.left }}
        >
          <img 
            src={processedAssets.Water || OFFICE_ASSET_URLS.Water} 
            alt="Water Cooler" 
            className="w-12 h-20 object-contain mix-blend-multiply"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[8px] text-zinc-500 font-black uppercase mt-1">H2O</span>
        </div>

        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in duration-300 z-10"
          style={{ top: COMMON_AREAS.WaterCoolerRight.top, left: COMMON_AREAS.WaterCoolerRight.left }}
        >
          <img 
            src={processedAssets.Water || OFFICE_ASSET_URLS.Water} 
            alt="Water Cooler" 
            className="w-12 h-20 object-contain mix-blend-multiply"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[8px] text-zinc-500 font-black uppercase mt-1">H2O</span>
        </div>

        {/* 5. Decor Plants */}
        {DECOR_PLANTS.map((plant, idx) => (
          <div 
            key={idx}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in duration-300 z-10"
            style={{ top: plant.top, left: plant.left }}
          >
            <img 
              src={processedAssets.Plant || OFFICE_ASSET_URLS.Plant} 
              alt="Office Plant" 
              className="w-10 h-14 object-contain mix-blend-multiply"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        ))}

        {/* 6. Dynamic Rebranded Workspaces (Glass cards enclosing the desks) */}
        {ALL_DESKS.map(desk => {
          // Identify agent at this desk
          const agent = [...BASE_AGENTS, ...customAgents].find(
            a => a.deskPosition.top === desk.top && a.deskPosition.left === desk.left
          )

          const isAgentIdle = agent && (agentStatus[agent.id] === 'idle' || !agentStatus[agent.id])

          // Resolve desk image dynamically:
          // If agent is idle, display their custom sitting desk sprite.
          // If agent is walking or workspace is vacant, display empty pixel desk.
          const deskImgUrl = (agent && isAgentIdle) 
            ? agent.sittingDeskUrl 
            : OFFICE_ASSET_URLS.Desk

          return (
            <div 
              key={desk.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 w-38 h-34 rounded-2xl border transition-all duration-300 z-10 flex flex-col justify-end items-center p-2.5 shadow-md",
                agent 
                  ? "bg-zinc-950/20 backdrop-blur-[1px] border-zinc-700/60 shadow-zinc-900/10" 
                  : "bg-white/5 border-dashed border-zinc-300/40 opacity-70"
              )}
              style={{ top: desk.top, left: desk.left }}
            >
              {/* Agent Title Card Header inside the workspace */}
              {agent ? (
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[88%] bg-zinc-900/90 border border-zinc-800 rounded-lg px-2 py-0.5 text-center shadow-sm select-none z-10">
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse animate-duration-1000" />
                    <span className="text-[8px] font-black text-white uppercase tracking-wide">{agent.name}</span>
                  </span>
                  <span className="text-[6.5px] text-zinc-400 font-semibold truncate block mt-0.5 leading-tight">
                    {agentBubbles[agent.id]?.slice(0, 36) || agent.role}
                  </span>
                </div>
              ) : (
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[88%] text-center select-none z-10">
                  <span className="text-[7.5px] font-bold text-zinc-450 uppercase tracking-widest block">Vacante</span>
                </div>
              )}

              {/* Desk asset image */}
              <img 
                src={deskImgUrl} 
                alt="Office Desk" 
                className="w-20 h-20 object-contain mix-blend-multiply"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          )
        })}

        {/* ================= DYNAMIC AGENT CHARACTERS ================= */}
        {[...BASE_AGENTS, ...customAgents].map(agent => {
          const isActive = selectedAgentId === agent.id
          const bubbleText = agentBubbles[agent.id]
          const position = agentPositions[agent.id] || agent.deskPosition
          const isLeft = agentFacingLeft[agent.id]
          const status = agentStatus[agent.id] || 'idle'
          
          return (
            <div 
              key={agent.id}
              className="absolute group z-20 transition-all duration-[3000ms] ease-in-out"
              style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Dynamic Speech bubble */}
              {bubbleText && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 bg-zinc-955 border border-zinc-800 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-30 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95 text-white">
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide leading-none">{agent.name}</div>
                  <div className="text-[10px] font-semibold text-zinc-200 mt-1">{bubbleText}</div>
                  {/* Arrow element */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] border-x-[5px] border-x-transparent border-t-[5px] border-t-zinc-955" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[6px] border-x-[6px] border-x-transparent border-t-[6px] border-t-zinc-800 -z-10" />
                </div>
              )}

              {/* Character representation styling (Pixel Art style) */}
              <div className="flex flex-col items-center">
                {/* Character Name Tag */}
                <span className="px-1.5 py-0.5 bg-zinc-955/90 backdrop-blur border border-zinc-850 text-white font-extrabold text-[8px] rounded-md tracking-wide leading-none mb-1 shadow-sm uppercase select-none z-10">
                  {agent.name}
                </span>

                {/* Pixel Art Sprite button container */}
                <button 
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={cn(
                    "w-12 h-12 flex flex-col justify-end items-center relative outline-none cursor-pointer transform transition-all duration-300 z-10",
                    status === 'walking' ? "animate-bounce" : ""
                  )}
                  style={{ animationDuration: '0.8s' }}
                >
                  {/* Render character ONLY when walking or working, because when idle they are already drawn in the sitting desk image! */}
                  {status !== 'idle' && (
                    <img 
                      src={processedSprites[agent.id] || agent.spriteUrl} 
                      alt={agent.name} 
                      className={cn(
                        "w-11 h-11 object-contain select-none transition-transform pointer-events-none mix-blend-multiply",
                        isLeft ? "scale-x-[-1]" : "",
                        isActive ? "scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" : ""
                      )}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}

                  {/* Active glowing ring base under their feet */}
                  <span className={cn(
                    "absolute bottom-0 w-6 h-1 rounded-full opacity-65 -z-10 blur-[1px]",
                    status === 'idle' ? 'bg-emerald-500/80 animate-pulse' :
                    status === 'walking' ? 'bg-blue-500/80' :
                    'bg-purple-500/80 animate-pulse'
                  )} />
                </button>
              </div>

            </div>
          )
        })}

        {/* Floating Controls Tip info overlay */}
        <div className="absolute bottom-4 left-4 bg-zinc-955/85 backdrop-blur text-white px-3 py-2 rounded-xl text-[10px] font-semibold flex items-center gap-2 max-w-xs shadow-md border border-zinc-800 select-none z-20">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Oficina Pixel Art de FlashCheckout. Haz clic en un agente para abrir su terminal técnica e ingresarle tareas.</span>
        </div>
      </div>

      {/* Consolidated general activity log widget */}
      <div className="bg-zinc-955 border border-zinc-800 rounded-2xl p-4 shadow-xl text-left select-text relative overflow-hidden">
        <div className="absolute top-3 right-4 flex items-center gap-1.5 select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">Stream Consolidado</span>
        </div>
        
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 select-none">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Visor de Actividades Generales (The Office Logs)</span>
        </h3>
        
        <div className="h-28 overflow-y-auto font-mono text-[10.5px] leading-relaxed text-zinc-400 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {consolidatedLogs.map((log, idx) => {
            let colorClass = 'text-zinc-400'
            const baseList = [...BASE_AGENTS, ...customAgents]
            baseList.forEach(a => {
              if (log.includes(`[${a.name}]`)) {
                if (a.color === 'emerald') colorClass = 'text-emerald-400/90'
                else if (a.color === 'teal') colorClass = 'text-teal-400/90'
                else if (a.color === 'blue') colorClass = 'text-blue-400/90'
                else if (a.color === 'amber') colorClass = 'text-amber-400/90'
              }
            })
            if (log.includes('ORDEN RECIBIDA')) colorClass = 'text-purple-400 font-bold'
            
            return (
              <div key={idx} className={colorClass}>
                {log}
              </div>
            )
          })}
          <div ref={consolidatedEndRef} />
        </div>
      </div>

      {/* Slide-over Inspector Agent Drawer (Premium Dark Glassmorphism - No backdrop blur outside) */}
      {selectedAgent && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-955 border-l border-zinc-800/80 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300 select-text text-zinc-100">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-850 flex justify-between items-center bg-zinc-900/20 select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-905 border border-zinc-800 flex items-center justify-center shrink-0">
                <img 
                  src={processedSprites[selectedAgent.id] || selectedAgent.spriteUrl} 
                  alt={selectedAgent.name} 
                  className="w-9 h-9 object-contain mix-blend-multiply"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-sm xl:text-base">{selectedAgent.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                    En línea
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{selectedAgent.role}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedAgentId(null)}
              className="p-1.5 hover:bg-zinc-850 rounded-lg text-zinc-550 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Navigation Tabs (Segmented control style) */}
          <div className="flex bg-zinc-900/60 p-1 rounded-xl gap-1 mx-4 my-2.5 select-none border border-zinc-850/50">
            <button 
              onClick={() => setActiveTab('console')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold text-center rounded-lg outline-none cursor-pointer transition-all",
                activeTab === 'console' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Consola del Agente
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold text-center rounded-lg outline-none cursor-pointer transition-all",
                activeTab === 'profile' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Especificaciones y Perfil
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 pt-1.5 select-text">
            {activeTab === 'console' ? (
              /* Monospace console logs */
              <div className="w-full h-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-inner min-h-[300px]">
                <div className="flex-1 overflow-y-auto font-mono text-[10px] text-zinc-350 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
                  {terminalLogs[selectedAgent.id]?.map((log, index) => {
                    const isOrder = log.includes('> ORDEN')
                    const isError = log.includes('[ERROR]')
                    const isSystem = log.includes('[System]') || log.includes('inicializada') || log.includes('activo') || log.includes('en línea')
                    
                    return (
                      <div 
                        key={index}
                        className={cn(
                          "whitespace-pre-wrap leading-relaxed",
                          isOrder ? "text-purple-400 font-bold border-b border-zinc-900 pb-1" : 
                          isError ? "text-red-400" :
                          isSystem ? "text-zinc-650 font-bold" : 
                          "text-zinc-300"
                        )}
                      >
                        {log}
                      </div>
                    )
                  })}
                  {submitting && (
                    <div className="text-zinc-555 font-bold animate-pulse flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                      <span>{selectedAgent.name} está procesando...</span>
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            ) : (
              /* Technical Specs Profile cards */
              <div className="space-y-5 text-left text-zinc-300">
                <div>
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Descripción del Agente</h4>
                  <p className="text-xs text-zinc-355 leading-relaxed font-semibold mt-1.5">{selectedAgent.description}</p>
                </div>

                <div className="h-px bg-zinc-850" />

                {/* Tech specifications grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-xl flex items-center gap-2.5">
                    <Cpu className="w-4.5 h-4.5 text-zinc-555 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-450 font-bold uppercase block leading-none">Modelo LLM</span>
                      <span className="text-xs font-black text-white mt-1 block truncate leading-none" title={selectedAgent.model}>
                        {selectedAgent.model.split('/').pop()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-850 p-3 rounded-xl flex items-center gap-2.5">
                    <Activity className="w-4.5 h-4.5 text-zinc-555 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-450 font-bold uppercase block leading-none">Latencia Promedio</span>
                      <span className="text-xs font-black text-white mt-1 block leading-none">{selectedAgent.latency}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-855 p-3 rounded-xl flex items-center gap-2.5">
                    <Coins className="w-4.5 h-4.5 text-zinc-555 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-450 font-bold uppercase block leading-none">Tokens Consumidos</span>
                      <span className="text-xs font-black text-white mt-1 block leading-none font-mono">{selectedAgent.tokensUsed.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-855 p-3 rounded-xl flex items-center gap-2.5">
                    <TrendingUp className="w-4.5 h-4.5 text-zinc-555 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-450 font-bold uppercase block leading-none">Efectividad (Acc)</span>
                      <span className="text-xs font-black text-white mt-1 block leading-none">{selectedAgent.accuracy}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-855" />

                {/* Scope capabilities lists */}
                <div>
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Herramientas Autorizadas</h4>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {selectedAgent.tools.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded-lg">
                        🔧 {t}
                      </span>
                    ))}
                  </div>

                  {/* Dismiss agent option if it is custom */}
                  {selectedAgent.id.startsWith('Custom_') && (
                    <button
                      onClick={() => handleDismissAgent(selectedAgent.id)}
                      className="w-full bg-red-955/20 hover:bg-red-955/45 border border-red-900/40 text-red-450 font-extrabold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer select-none"
                    >
                      <Trash2 className="w-4 h-4" />
                      Despedir Agente de la Oficina
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Prompt Entry form bar (Only active in Console tab) */}
          <div className="p-4 border-t border-zinc-850 bg-zinc-950 select-none">
            {activeTab === 'console' ? (
              <form onSubmit={handleSendCommand} className="flex gap-2 relative">
                <input
                  type="text"
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  placeholder={
                    agentStatus[selectedAgent.id] && agentStatus[selectedAgent.id] !== 'idle'
                      ? `${selectedAgent.name} está ocupado moviéndose...`
                      : `Enviar orden a ${selectedAgent.name}...`
                  }
                  disabled={submitting || (agentStatus[selectedAgent.id] && agentStatus[selectedAgent.id] !== 'idle')}
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:bg-zinc-900/80 transition-all font-semibold pr-10 disabled:opacity-75"
                />
                <button
                  type="submit"
                  disabled={!instruction.trim() || submitting || (agentStatus[selectedAgent.id] && agentStatus[selectedAgent.id] !== 'idle')}
                  className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg cursor-pointer transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:scale-100"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="py-2.5 text-center text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                Visualización de Especificaciones Técnicas
              </div>
            )}
          </div>

        </div>
      )}

      {/* Dim backdrop cover when drawer is open (Light and transparent overlay to NOT blur the office) */}
      {selectedAgent && (
        <div 
          onClick={() => setSelectedAgentId(null)}
          className="fixed inset-0 bg-black/10 z-40 transition-all duration-300" 
        />
      )}

      {/* HIRING MODAL (Crear Agentes - Premium Dark Glassmorphism) */}
      {hiringModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[4px] z-50 flex items-center justify-center animate-in fade-in duration-250 select-none">
          <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 text-white rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-200 text-left select-text">
            
            <button 
              onClick={() => setHiringModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 select-none">
              <Building className="w-5 h-5 text-emerald-450" />
              <h2 className="text-base font-extrabold tracking-tight">Contratar Nuevo Agente de Oficina</h2>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-455 uppercase font-black block mb-1">Nombre del Agente</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SupportBot, Analyst"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-455 uppercase font-black block mb-1">Rol / Cargo</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asistente de Catálogo"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-450 uppercase font-black block mb-1">Modelo de IA</label>
                  <select
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B (Recomendado)</option>
                    <option value="google/gemma-2-9b-it">Gemma 2 9B (Veloz)</option>
                    <option value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B (Complejo)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-zinc-450 uppercase font-black block mb-1">Emoji / Sprite base</label>
                  <select
                    value={newAvatarEmoji}
                    onChange={e => setNewAvatarEmoji(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="🕵️">🕵️ Detective (Analista)</option>
                    <option value="🧙">🧙 Mago (Creativo)</option>
                    <option value="🧑‍💻">🧑‍💻 Programador (Soporte)</option>
                    <option value="👩‍🎨">👩‍🎨 Artista (Copywriter)</option>
                    <option value="🤖">🤖 Robot (Operaciones)</option>
                    <option value="🦁">🦁 León (Ventas)</option>
                    <option value="👽">👽 Alien (Especialista)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-zinc-450 uppercase font-black block mb-1">Descripción Breve</label>
                <input
                  type="text"
                  placeholder="e.g. Asiste en tareas de catalogación de productos y ofertas..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-450 uppercase font-black block mb-1">System Prompt (Instrucción Base/Personalidad)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Eres un agente enfocado en la atención y redacción. Responde siempre con tono ejecutivo..."
                  value={newSystemPrompt}
                  onChange={e => setNewSystemPrompt(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none font-mono"
                />
              </div>

              {/* Tool checkboxes */}
              <div>
                <label className="text-[9px] text-zinc-450 uppercase font-black block mb-2">Herramientas Autorizadas (Funcionalidades)</label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 border border-zinc-900 p-3 rounded-xl max-h-32 overflow-y-auto">
                  {AVAILABLE_TOOLS.map(t => {
                    const checked = newTools.includes(t.name)
                    return (
                      <label key={t.name} className="flex items-center gap-2 text-[10px] font-bold text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) setNewTools(newTools.filter(x => x !== t.name))
                            else setNewTools([...newTools, t.name])
                          }}
                          className="rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <span>{t.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 select-none">
                <button
                  type="button"
                  onClick={() => setHiringModalOpen(false)}
                  className="flex-1 bg-zinc-905 hover:bg-zinc-850 text-zinc-350 border border-zinc-800 text-xs font-bold rounded-xl py-2.5 text-center cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName || !newRole || !newSystemPrompt}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl py-2.5 text-center cursor-pointer transition-all active:scale-98 disabled:bg-zinc-900 disabled:text-zinc-650 disabled:scale-100"
                >
                  {creating ? 'Contratando...' : 'Confirmar Contratación'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
