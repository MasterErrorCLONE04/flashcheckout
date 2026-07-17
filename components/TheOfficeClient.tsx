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
  Sliders,
  RotateCw,
  Save
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
  settings: {
    customAgents?: Agent[]
    officeLayout?: LayoutItem[]
  }
}

interface LayoutItem {
  id: string
  name: string
  type: 'desk' | 'whiteboard' | 'printer' | 'coffee' | 'water' | 'plant' | 'lounge' | 'shelf' | 'meeting'
  col: number
  row: number
  w: number
  h: number
  rotation: number
  agentId?: string
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
    sittingDeskUrl: '/images/deskt2/01-Photoroom.png',
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
    sittingDeskUrl: '/images/deskt/01-Photoroom.png',
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
    sittingDeskUrl: '/images/deskt3/01-Photoroom.png',
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
    sittingDeskUrl: '/images/deskt4/01.png',
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

const DEFAULT_LAYOUT_ITEMS: LayoutItem[] = [
  // 1. Desks for Base Agents
  { id: 'desk_nova', name: 'Nova Desk', type: 'desk', col: 11, row: 5, w: 3, h: 3, rotation: 0, agentId: 'Nova' },
  { id: 'desk_sales', name: 'SalesBot Desk', type: 'desk', col: 5, row: 4, w: 3, h: 3, rotation: 0, agentId: 'SalesBot' },
  { id: 'desk_logistics', name: 'Logistics Desk', type: 'desk', col: 15, row: 4, w: 3, h: 3, rotation: 0, agentId: 'Logistics' },
  { id: 'desk_growth', name: 'Growth Desk', type: 'desk', col: 18, row: 8, w: 3, h: 3, rotation: 0, agentId: 'Growth' },
  
  // 2. Stations (Whiteboard, Printer, Coffee Bar, Water Coolers) - Moved to row 3 to avoid blocking windows
  { id: 'station_whiteboard', name: 'Whiteboard', type: 'whiteboard', col: 11, row: 3, w: 3, h: 2, rotation: 0 },
  { id: 'station_printer', name: 'Printer', type: 'printer', col: 7, row: 3, w: 2, h: 2, rotation: 0 },
  { id: 'station_coffee', name: 'Coffee Bar', type: 'coffee', col: 15, row: 3, w: 2, h: 2, rotation: 0 },
  { id: 'station_water_left', name: 'H2O Left', type: 'water', col: 2, row: 5, w: 1, h: 2, rotation: 0 },
  { id: 'station_water_right', name: 'H2O Right', type: 'water', col: 21, row: 5, w: 1, h: 2, rotation: 0 },
  { id: 'station_shipping', name: 'Despacho', type: 'meeting', col: 2, row: 3, w: 2, h: 2, rotation: 0 },

  // 3. Lounge Areas
  { id: 'lounge_sofa', name: 'Sofa Area', type: 'lounge', col: 11, row: 9, w: 4, h: 2, rotation: 0 },

  // 4. Vacant Desks for custom agents
  { id: 'vacant_1', name: 'Escritorio Vacante', type: 'desk', col: 5, row: 8, w: 3, h: 3, rotation: 0 },
  { id: 'vacant_2', name: 'Escritorio Vacante', type: 'desk', col: 8, row: 8, w: 3, h: 3, rotation: 0 },
  { id: 'vacant_3', name: 'Escritorio Vacante', type: 'desk', col: 14, row: 8, w: 3, h: 3, rotation: 0 },

  // 5. Decor Plants (1x1) - Placed safely at row 3 or below
  { id: 'plant_1', name: 'Planta', type: 'plant', col: 1, row: 3, w: 1, h: 1, rotation: 0 },
  { id: 'plant_2', name: 'Planta', type: 'plant', col: 1, row: 10, w: 1, h: 1, rotation: 0 },
  { id: 'plant_3', name: 'Planta', type: 'plant', col: 22, row: 3, w: 1, h: 1, rotation: 0 },
  { id: 'plant_4', name: 'Planta', type: 'plant', col: 22, row: 10, w: 1, h: 1, rotation: 0 }
]

const OFFICE_ASSET_URLS = {
  Desk: '/images/desk_l_empty.png',
  Board: '/images/station_whiteboard.png',
  Coffee: '/images/station_coffee.png',
  Plant: '/images/pixel_plant.png',
  Water: '/images/station_water.png',
  Printer: '/images/station_printer.png',
  Lounge: '/images/furniture_sofa_corner.png',
  Shelf: '/images/office_bookshelf_tall.png',
  Meeting: '/images/desk_l_marketing.png',
  Entrance: '/images/floor_transition_floor.png',
  Extinguisher: '/images/floor_accent_outlet.png'
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
  ordersCount,
  pendingOrdersCount = 0,
  outOfStockCount = 0
}: {
  store: StoreData
  productsCount: number
  ordersCount: number
  pendingOrdersCount?: number
  outOfStockCount?: number
}) {
  const [customAgents, setCustomAgents] = useState<Agent[]>(() => {
    const loaded: Agent[] = store.settings?.customAgents || []
    // Assign desk coords to match concept
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

  const [agentsList, setAgentsList] = useState<Agent[]>(() => {
    return [...BASE_AGENTS, ...customAgents]
  })

  // Layout States for Grid Customizer
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(() => {
    const rawItems: LayoutItem[] = store.settings?.officeLayout || DEFAULT_LAYOUT_ITEMS
    return rawItems.map((it) => {
      const row = it.row < 3 ? 3 : it.row
      const isDesk = it.type === 'desk'
      const w = isDesk ? 3 : it.w
      const h = isDesk ? 3 : it.h
      return { ...it, row, w, h }
    })
  })
  const [isEditingLayout, setIsEditingLayout] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<'select' | 'move' | 'rotate' | 'delete'>('select')
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState<number>(32)

  // Drag and drop tracking states
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const getAgentDeskPosition = (agentId: string) => {
    const desk = layoutItems?.find(it => it.type === 'desk' && it.agentId === agentId)
    if (desk) {
      const left = desk.col * 4.166 + (desk.w / 2) * 4.166
      const top = desk.row * 8.333 + (desk.h / 2) * 8.333
      return { top: `${top}%`, left: `${left}%` }
    }

    if (agentId === 'Nova') return { top: '56%', left: '52%' }
    if (agentId === 'SalesBot') return { top: '38%', left: '32%' }
    if (agentId === 'Logistics') return { top: '38%', left: '68%' }
    if (agentId === 'Growth') return { top: '78%', left: '76%' }
    
    const customIdx = customAgents.findIndex(a => a.id === agentId)
    if (customIdx !== -1) {
      const slots = [
        { top: '78%', left: '26%' },
        { top: '56%', left: '24%' },
        { top: '56%', left: '78%' },
        { top: '78%', left: '50%' }
      ]
      return slots[customIdx % slots.length]
    }
    return { top: '50%', left: '50%' }
  }

  const getStationCoordinates = (type: 'whiteboard' | 'printer' | 'coffee' | 'water' | 'lounge' | 'meeting') => {
    const station = layoutItems?.find(it => it.type === type)
    if (station) {
      const left = station.col * 4.166 + (station.w / 2) * 4.166
      const top = station.row * 8.333 + (station.h / 2) * 8.333
      return { top: `${top}%`, left: `${left}%` }
    }

    if (type === 'whiteboard') return { top: '18%', left: '52%' }
    if (type === 'printer') return { top: '20%', left: '32%' }
    if (type === 'coffee') return { top: '20%', left: '80%' }
    if (type === 'water') return { top: '55%', left: '12%' }
    return { top: '50%', left: '50%' }
  }

  // Handle coordinates for all agents
  const [agentPositions, setAgentPositions] = useState<Record<string, { top: string; left: string }>>(() => {
    const coords: Record<string, { top: string; left: string }> = {}
    const rawLayout: LayoutItem[] = store.settings?.officeLayout || DEFAULT_LAYOUT_ITEMS
    const initialLayout = rawLayout.map((it) => {
      const row = it.row < 3 ? 3 : it.row
      const isDesk = it.type === 'desk'
      const w = isDesk ? 3 : it.w
      const h = isDesk ? 3 : it.h
      return { ...it, row, w, h }
    })
    BASE_AGENTS.forEach(a => {
      const desk = initialLayout.find((it) => it.type === 'desk' && it.agentId === a.id)
      if (desk) {
        const left = desk.col * 4.166 + (desk.w / 2) * 4.166
        const top = desk.row * 8.333 + (desk.h / 2) * 8.333
        coords[a.id] = { top: `${top}%`, left: `${left}%` }
      } else {
        coords[a.id] = { ...a.deskPosition }
      }
    })
    customAgents.forEach((a) => {
      const desk = initialLayout.find((it) => it.type === 'desk' && it.agentId === a.id)
      if (desk) {
        const left = desk.col * 4.166 + (desk.w / 2) * 4.166
        const top = desk.row * 8.333 + (desk.h / 2) * 8.333
        coords[a.id] = { top: `${top}%`, left: `${left}%` }
      } else {
        coords[a.id] = { ...a.deskPosition }
      }
    })
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

  // New States for memory and interactions
  const [chatHistories, setChatHistories] = useState<Record<string, Array<{ role: 'user' | 'assistant'; content: string }>>>({})
  const [printedTickets, setPrintedTickets] = useState<Array<{ time: string; agent: string; action: string; details: string }>>([])
  const [printedTicketsModalOpen, setPrintedTicketsModalOpen] = useState(false)
  const [coffeeModalOpen, setCoffeeModalOpen] = useState(false)
  const [boostedAgents, setBoostedAgents] = useState<Record<string, boolean>>({})

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
  const [logsModalOpen, setLogsModalOpen] = useState(false)

  const terminalEndRef = useRef<HTMLDivElement>(null)
  const consolidatedEndRef = useRef<HTMLDivElement>(null)

  // Load and clean sprites and assets from solid white backgrounds
  useEffect(() => {
    const processSpritesAndAssets = async () => {
      const spriteMap: Record<string, string> = {}
      const assetMap: Record<string, string> = {}
      
      // Sprites & Sitting Desks
      const allList = [...BASE_AGENTS, ...customAgents]
      for (const ag of allList) {
        try {
          const cleanUrl = await removeWhiteBg(ag.spriteUrl)
          spriteMap[ag.id] = cleanUrl
        } catch {
          spriteMap[ag.id] = ag.spriteUrl
        }
        
        if (ag.sittingDeskUrl) {
          try {
            const cleanDeskUrl = await removeWhiteBg(ag.sittingDeskUrl)
            spriteMap[`desk_${ag.id}`] = cleanDeskUrl
          } catch {
            spriteMap[`desk_${ag.id}`] = ag.sittingDeskUrl
          }
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
  }, [consolidatedLogs, logsModalOpen])

  const walkAgent = (
    agentId: string,
    destination: { top: string; left: string },
    actionText: string,
    finalText: string,
    onArrival: () => void,
    onFinish: () => void
  ) => {
    // Instead of standing up and walking, the agent stays at their desk and immediately starts working!
    setAgentStatus(prev => ({ ...prev, [agentId]: 'working' }))
    onArrival()

    // Hold 'working' state for 4s, then finish
    setTimeout(() => {
      setAgentStatus(prev => ({ ...prev, [agentId]: 'idle' }))
      onFinish()
    }, 4000)
  }

  // Simulation Loop: triggers dynamic walking activities periodically for ANY agent in the office
  useEffect(() => {
    const interval = setInterval(() => {
      const list = [...BASE_AGENTS, ...customAgents]
      if (list.length === 0) return

      const randomAgent = list[Math.floor(Math.random() * list.length)]
      if (agentStatus[randomAgent.id] && agentStatus[randomAgent.id] !== 'idle') return

      const destinations: Array<'printer' | 'water' | 'whiteboard' | 'coffee'> = ['printer', 'water', 'whiteboard', 'coffee']
      const destType = destinations[Math.floor(Math.random() * destinations.length)]
      const destination = getStationCoordinates(destType)

      const activities = {
        printer: { action: 'Imprimiendo documentos...', log: 'Imprimiendo reportes de operaciones...' },
        water: { action: 'Tomando agua...', log: 'Tomando un descanso en el dispensador de agua...' },
        whiteboard: { action: 'Revisando planes...', log: 'Analizando diagramas de flujo de trabajo...' },
        coffee: { action: 'Preparando café...', log: 'Tomando una taza de café en el break...' }
      }

      const activity = activities[destType]
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
  }, [customAgents, agentStatus, agentPositions, layoutItems])

  // Synchronize idle agent positions to their desks dynamically
  useEffect(() => {
    setAgentPositions(prev => {
      const nextPositions = { ...prev }
      agentsList.forEach(a => {
        if (!agentStatus[a.id] || agentStatus[a.id] === 'idle') {
          nextPositions[a.id] = getAgentDeskPosition(a.id)
        }
      })
      return nextPositions
    })
  }, [layoutItems, agentsList, agentStatus])

  const gridRef = useRef<HTMLDivElement>(null)

  const handleItemMouseDown = (e: React.MouseEvent, itemId: string) => {
    if (!isEditingLayout || editMode !== 'move') return
    e.preventDefault()
    
    const item = layoutItems.find(it => it.id === itemId)
    if (!item) return

    setSelectedItemId(itemId)
    
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect()
      const itemRect = e.currentTarget.getBoundingClientRect()
      
      const cellWidth = rect.width / 24
      const cellHeight = rect.height / 12
      
      const offsetXCells = Math.floor((e.clientX - itemRect.left) / cellWidth)
      const offsetYCells = Math.floor((e.clientY - itemRect.top) / cellHeight)
      
      setDraggedItemId(itemId)
      setIsDragging(true)
      setDragOffset({ x: offsetXCells, y: offsetYCells })
    }
  }

  const handleGridMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedItemId || !gridRef.current) return
    
    const rect = gridRef.current.getBoundingClientRect()
    const cellWidth = rect.width / 24
    const cellHeight = rect.height / 12
    
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    
    let targetCol = Math.round(relX / cellWidth) - dragOffset.x
    let targetRow = Math.round(relY / cellHeight) - dragOffset.y
    
    const item = layoutItems.find(it => it.id === draggedItemId)
    if (!item) return
    
    targetCol = Math.max(0, Math.min(24 - item.w, targetCol))
    targetRow = Math.max(3, Math.min(12 - item.h, targetRow))
    
    setLayoutItems(prev => prev.map(it => {
      if (it.id === draggedItemId) {
        return { ...it, col: targetCol, row: targetRow }
      }
      return it
    }))
  }

  const handleGridMouseUp = () => {
    if (isDragging) {
      // Check for overlap on drop
      const item = layoutItems.find(it => it.id === draggedItemId)
      if (item) {
        const isOverlap = layoutItems.some(it => 
          it.id !== item.id && 
          item.col < it.col + it.w &&
          item.col + item.w > it.col &&
          item.row < it.row + it.h &&
          item.row + item.h > it.row
        )
        if (isOverlap) {
          toast.warning("Hay superposición con otro objeto, intenta ubicarlo en una zona libre.")
        }
      }
      setIsDragging(false)
      setDraggedItemId(null)
    }
  }

  const handleRotateItem = (itemId: string) => {
    setLayoutItems(prev => prev.map(it => {
      if (it.id === itemId) {
        const nextRotation = ((it.rotation || 0) + 90) % 360
        return { ...it, rotation: nextRotation }
      }
      return it
    }))
    toast.success('Elemento rotado 90°')
  }

  const handleDeleteItem = (itemId: string) => {
    const item = layoutItems.find(it => it.id === itemId)
    if (!item) return
    
    if (item.agentId) {
      toast.error(`No puedes eliminar este escritorio porque está asignado a ${item.agentId}. Despide o desvincula al agente primero.`)
      return
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
      setLayoutItems(prev => prev.filter(it => it.id !== itemId))
      setSelectedItemId(null)
      toast.success(`${item.name} eliminado de la oficina.`)
    }
  }

  const handleAddItem = (type: LayoutItem['type']) => {
    let w = 2
    let h = 2
    let name = 'Mobiliario'
    
    if (type === 'desk') {
      w = 3; h = 3; name = 'Escritorio'
    } else if (type === 'meeting') {
      w = 3; h = 2; name = 'Reuniones'
    } else if (type === 'lounge') {
      w = 4; h = 2; name = 'Lounge'
    } else if (type === 'plant') {
      w = 1; h = 1; name = 'Planta'
    } else if (type === 'shelf') {
      w = 2; h = 2; name = 'Estantería'
    }
    
    const newItem: LayoutItem = {
      id: `item_${Date.now()}`,
      name,
      type,
      col: 2,
      row: 3,
      w,
      h,
      rotation: 0
    }
    
    setLayoutItems(prev => [...prev, newItem])
    setSelectedItemId(newItem.id)
    setEditMode('move')
    toast.success(`¡${name} agregado! Arrástralo por la cuadrícula para ubicarlo.`);
  }

  const handleSaveLayout = async () => {
    try {
      const res = await fetch('/api/agent/office/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutItems })
      })
      if (!res.ok) throw new Error('Error al guardar diseño')
      toast.success('¡Diseño de la oficina guardado exitosamente!')
      setIsEditingLayout(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error de conexion')
    }
  }

  const triggerWaterCoolerTalk = () => {
    const list = [...BASE_AGENTS, ...customAgents]
    if (list.length < 2) {
      toast.info('Se necesitan al menos 2 agentes en la oficina para conversar.')
      return
    }
    const idleAgents = list.filter(a => !agentStatus[a.id] || agentStatus[a.id] === 'idle')
    if (idleAgents.length < 2) {
      toast.warning('Los agentes están muy ocupados ahora. Inténtalo más tarde.')
      return
    }
    
    const agentA = idleAgents[Math.floor(Math.random() * idleAgents.length)]
    let agentB = idleAgents[Math.floor(Math.random() * idleAgents.length)]
    while (agentB.id === agentA.id) {
      agentB = idleAgents[Math.floor(Math.random() * idleAgents.length)]
    }

    const timeStr = new Date().toLocaleTimeString()

    setConsolidatedLogs(prev => [
      ...prev,
      `[${timeStr}] [System] Charla informal iniciada entre ${agentA.name} y ${agentB.name} junto al dispensador de agua.`
    ])

    const waterPos = getStationCoordinates('water')
    const leftVal = parseFloat(waterPos.left)
    const topVal = parseFloat(waterPos.top)

    walkAgent(
      agentA.id,
      { top: `${topVal}%`, left: `${leftVal + 2}%` },
      'Conversando... ☕',
      'De vuelta en mi puesto.',
      () => {},
      () => {}
    )

    walkAgent(
      agentB.id,
      { top: `${topVal}%`, left: `${leftVal + 6}%` },
      'Escuchando... 💬',
      'De vuelta en mi puesto.',
      () => {
        setTimeout(() => {
          setAgentBubbles(prev => ({ ...prev, [agentA.id]: '¡Hola! ¿Cómo va todo hoy?' }))
          setTimeout(() => {
            setAgentBubbles(prev => ({ ...prev, [agentB.id]: '¡Hola! Todo súper, procesando las ventas con éxito 🚀' }))
            setTimeout(() => {
              setAgentBubbles(prev => ({ ...prev, [agentA.id]: '¡Excelente! Sigamos trabajando en equipo. 👍' }))
            }, 2000)
          }, 2000)
        }, 1000)
      },
      () => {}
    )
  }

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
    const currentHistory = chatHistories[selectedAgentId] || []
    
    // Update local chat history with the user message
    setChatHistories(prev => ({
      ...prev,
      [selectedAgentId]: [
        ...currentHistory,
        { role: 'user', content: userQuery }
      ]
    }))

    setInstruction('')
    setSubmitting(true)

    // Set temporary thinking bubble at their desk
    setAgentStatus(prev => ({ ...prev, [selectedAgentId]: 'working' }))
    setAgentBubbles(prev => ({ ...prev, [selectedAgentId]: 'Pensando... 🧠' }))

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

      // Update history with assistant response
      setChatHistories(prev => ({
        ...prev,
        [selectedAgentId]: [
          ...(prev[selectedAgentId] || []),
          { role: 'assistant' as 'user' | 'assistant', content: String(data.text || '') }
        ].slice(-10)
      }))

      // Determine visual destination based on the tool executed
      let destination = getStationCoordinates('whiteboard')
      let actionText = 'Escribiendo reporte... ✍️'
      let logText = 'Procesando análisis en la pizarra principal...'
 
      const toolType = data.action?.type
      if (toolType && toolType !== 'NONE') {
        if (toolType === 'create_coupon') {
          destination = getStationCoordinates('printer')
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
          destination = getStationCoordinates('meeting') // Despacho (Shipping station)
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
          destination = getStationCoordinates('whiteboard')
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

      // Now start the walking animation to the specific station
      walkAgent(
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

    } catch (err: any) {
      const errorTime = new Date().toLocaleTimeString()
      setTerminalLogs(prev => ({
        ...prev,
        [selectedAgentId]: [
          ...(prev[selectedAgentId] || []),
          `[${errorTime}] [ERROR] Falló procesamiento: ${err.message || 'Error de conexión'}`
        ]
      }))
      setAgentStatus(prev => ({ ...prev, [selectedAgentId]: 'idle' }))
      setAgentBubbles(prev => ({ ...prev, [selectedAgentId]: 'Error en el sistema.' }))
      toast.error('Error al comandar al agente')
      setSubmitting(false)
    }
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

      const data = (await res.json()) as { customAgents?: Agent[]; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed creation')

      const updatedCustoms = (data.customAgents || []).map((a) => {
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
          deskPosition: { top: '50%', left: '50%' } // Resolved dynamically
        }
      })

      setCustomAgents(updatedCustoms)
      setAgentsList([...BASE_AGENTS, ...updatedCustoms])
      
      const newestAgent = updatedCustoms[updatedCustoms.length - 1]

      // Setup coordinates for the new agent desk slot and logs
      setTerminalLogs(prev => ({
        ...prev,
        [newestAgent.id]: [
          `Agente personalizado ${newestAgent.name} inicializado.`,
          `Rol: ${newestAgent.role}`,
          `Herramientas: [${newestAgent.tools.join(', ')}]`,
          'Esperando instrucciones...'
        ]
      }))

      // Assign desk dynamically in layoutItems
      setLayoutItems(prev => {
        let assigned = false
        const nextLayout = prev.map(it => {
          if (it.type === 'desk' && !it.agentId && !assigned) {
            assigned = true
            return { ...it, agentId: newestAgent.id, name: `${newestAgent.name} Desk` }
          }
          return it
        })
        
        if (!assigned) {
          nextLayout.push({
            id: `item_desk_${Date.now()}`,
            name: `${newestAgent.name} Desk`,
            type: 'desk',
            col: 2,
            row: 8,
            w: 3,
            h: 3,
            rotation: 0,
            agentId: newestAgent.id
          })
        }
        
        fetch('/api/agent/office/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layoutItems: nextLayout })
        }).catch(err => console.error('Auto-saving layout failed:', err))

        return nextLayout
      })

      toast.success(`¡Agente ${newName} contratado exitosamente!`)
      setHiringModalOpen(false)
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

      const updatedCustoms = (data.customAgents || []).map((a) => {
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
          deskPosition: { top: '50%', left: '50%' }
        }
      })

      setCustomAgents(updatedCustoms)
      setAgentsList([...BASE_AGENTS, ...updatedCustoms])
      setSelectedAgentId(null)

      // Clear agentId from their desk in layoutItems
      setLayoutItems(prev => {
        const nextLayout = prev.map(it => {
          if (it.agentId === agentId) {
            return { ...it, agentId: undefined, name: 'Escritorio Vacante' }
          }
          return it
        })
        
        fetch('/api/agent/office/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layoutItems: nextLayout })
        }).catch(err => console.error('Auto-saving layout failed:', err))

        return nextLayout
      })

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
    <>
      <style>{`
        @keyframes salesDeskAnim {
          0%, 9.9% { background-image: url('/images/deskt/01-Photoroom.png'); }
          10%, 19.9% { background-image: url('/images/deskt/02-Photoroom.png'); }
          20%, 29.9% { background-image: url('/images/deskt/03-Photoroom.png'); }
          30%, 39.9% { background-image: url('/images/deskt/04-Photoroom.png'); }
          40%, 49.9% { background-image: url('/images/deskt/05-Photoroom.png'); }
          50%, 59.9% { background-image: url('/images/deskt/06-Photoroom.png'); }
          60%, 69.9% { background-image: url('/images/deskt/07-Photoroom.png'); }
          70%, 79.9% { background-image: url('/images/deskt/08-Photoroom.png'); }
          80%, 89.9% { background-image: url('/images/deskt/09-Photoroom.png'); }
          90%, 100% { background-image: url('/images/deskt/10-Photoroom.png'); }
        }
        @keyframes novaDeskAnim {
          0%, 7.1% { background-image: url('/images/deskt2/01-Photoroom.png'); }
          7.2%, 14.2% { background-image: url('/images/deskt2/02-Photoroom.png'); }
          14.3%, 21.4% { background-image: url('/images/deskt2/03-Photoroom.png'); }
          21.5%, 28.5% { background-image: url('/images/deskt2/04-Photoroom.png'); }
          28.6%, 35.7% { background-image: url('/images/deskt2/05-Photoroom.png'); }
          35.8%, 42.8% { background-image: url('/images/deskt2/06-Photoroom.png'); }
          42.9%, 50.0% { background-image: url('/images/deskt2/07-Photoroom.png'); }
          50.1%, 57.1% { background-image: url('/images/deskt2/08-Photoroom.png'); }
          57.2%, 64.2% { background-image: url('/images/deskt2/09-Photoroom.png'); }
          64.3%, 71.4% { background-image: url('/images/deskt2/10-Photoroom.png'); }
          71.5%, 78.5% { background-image: url('/images/deskt2/11-Photoroom.png'); }
          78.6%, 85.7% { background-image: url('/images/deskt2/12-Photoroom.png'); }
          85.8%, 92.8% { background-image: url('/images/deskt2/13-Photoroom.png'); }
          92.9%, 100% { background-image: url('/images/deskt2/14-Photoroom.png'); }
        }
        @keyframes logisticsDeskAnim {
          0%, 7.1% { background-image: url('/images/deskt3/01-Photoroom.png'); }
          7.2%, 14.2% { background-image: url('/images/deskt3/02-Photoroom.png'); }
          14.3%, 21.4% { background-image: url('/images/deskt3/03-Photoroom.png'); }
          21.5%, 28.5% { background-image: url('/images/deskt3/04-Photoroom.png'); }
          28.6%, 35.7% { background-image: url('/images/deskt3/05-Photoroom.png'); }
          35.8%, 42.8% { background-image: url('/images/deskt3/06-Photoroom.png'); }
          42.9%, 50.0% { background-image: url('/images/deskt3/07-Photoroom.png'); }
          50.1%, 57.1% { background-image: url('/images/deskt3/08-Photoroom.png'); }
          57.2%, 64.2% { background-image: url('/images/deskt3/09-Photoroom.png'); }
          64.3%, 71.4% { background-image: url('/images/deskt3/10-Photoroom.png'); }
          71.5%, 78.5% { background-image: url('/images/deskt3/11-Photoroom.png'); }
          78.6%, 85.7% { background-image: url('/images/deskt3/12-Photoroom.png'); }
          85.8%, 92.8% { background-image: url('/images/deskt3/13-Photoroom.png'); }
          92.9%, 100% { background-image: url('/images/deskt3/14-Photoroom.png'); }
        }
        @keyframes growthDeskAnim {
          0%, 3.9% { background-image: url('/images/deskt4/01.png'); }
          4%, 7.9% { background-image: url('/images/deskt4/02.png'); }
          8%, 11.9% { background-image: url('/images/deskt4/03.png'); }
          12%, 15.9% { background-image: url('/images/deskt4/04.png'); }
          16%, 19.9% { background-image: url('/images/deskt4/05.png'); }
          20%, 23.9% { background-image: url('/images/deskt4/06.png'); }
          24%, 27.9% { background-image: url('/images/deskt4/07.png'); }
          28%, 31.9% { background-image: url('/images/deskt4/08.png'); }
          32%, 35.9% { background-image: url('/images/deskt4/09.png'); }
          36%, 39.9% { background-image: url('/images/deskt4/10.png'); }
          40%, 43.9% { background-image: url('/images/deskt4/11.png'); }
          44%, 47.9% { background-image: url('/images/deskt4/12.png'); }
          48%, 51.9% { background-image: url('/images/deskt4/13.png'); }
          52%, 55.9% { background-image: url('/images/deskt4/14.png'); }
          56%, 59.9% { background-image: url('/images/deskt4/15.png'); }
          60%, 63.9% { background-image: url('/images/deskt4/16.png'); }
          64%, 67.9% { background-image: url('/images/deskt4/17.png'); }
          68%, 71.9% { background-image: url('/images/deskt4/18.png'); }
          72%, 75.9% { background-image: url('/images/deskt4/19.png'); }
          76%, 79.9% { background-image: url('/images/deskt4/20.png'); }
          80%, 83.9% { background-image: url('/images/deskt4/21.png'); }
          84%, 87.9% { background-image: url('/images/deskt4/22.png'); }
          88%, 91.9% { background-image: url('/images/deskt4/23.png'); }
          92%, 95.9% { background-image: url('/images/deskt4/24.png'); }
          96%, 100% { background-image: url('/images/deskt4/25.png'); }
        }
      `}</style>
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
            onClick={() => {
              setIsEditingLayout(!isEditingLayout)
              setSelectedItemId(null)
              toast.info(isEditingLayout ? 'Personalización cerrada.' : '¡Modo de maquetación activo! Utiliza la cuadrícula para reordenar tu oficina.')
            }}
            className={cn(
              "text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-sm active:scale-98 transition-all select-none cursor-pointer border",
              isEditingLayout
                ? "border-purple-700 hover:bg-purple-700 text-white"
                : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800"
            )}
            style={isEditingLayout ? { backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#6d28d9' } : {}}
          >
            <Sliders className="w-4 h-4" />
            <span>{isEditingLayout ? 'Salir de Edición' : 'Personalizar oficina'}</span>
          </button>

          <button 
            onClick={() => setLogsModalOpen(true)}
            className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-sm active:scale-98 transition-all select-none cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-zinc-650" />
            <span>Ver Logs</span>
          </button>

          <button 
            onClick={() => setHiringModalOpen(true)}
            className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-200/20 text-white text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-md active:scale-98 transition-all select-none cursor-pointer"
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

      {/* Layout Split when customizing */}
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        
        {/* Main Office Map Container */}
        <div className="flex-1 w-full relative">
          <div 
            ref={gridRef}
            onMouseMove={handleGridMouseMove}
            onMouseUp={handleGridMouseUp}
            onMouseLeave={handleGridMouseUp}
            className="relative w-full aspect-[2/1] min-h-[380px] md:min-h-[480px] border border-zinc-300 rounded-none overflow-hidden shadow-2xl select-none"
            style={{
              backgroundImage: "url('/images/pixel_wall.png'), url('/images/pixel_floor.png')",
              backgroundSize: "100% 25%, 4.166% 8.333%",
              backgroundPosition: "top left, top left",
              backgroundRepeat: "no-repeat, repeat",
              imageRendering: 'pixelated'
            }}
          >
            {/* GRID LAYOUT OVERLAY (Tower Defense style) */}
            {isEditingLayout && showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(24, 1fr)',
                  gridTemplateRows: 'repeat(12, 1fr)',
                }}
              >
                {Array.from({ length: 12 }).map((_, r) =>
                  Array.from({ length: 24 }).map((_, c) => {
                    const isWindowArea = r < 3;
                    const draggedItem = draggedItemId ? layoutItems.find(it => it.id === draggedItemId) : null;
                    
                    const isOccupiedByDragged = draggedItem &&
                      c >= draggedItem.col && c < draggedItem.col + draggedItem.w &&
                      r >= draggedItem.row && r < draggedItem.row + draggedItem.h;

                    const isOccupiedByOther = layoutItems.some(it =>
                      it.id !== draggedItemId &&
                      c >= it.col && c < it.col + it.w &&
                      r >= it.row && r < it.row + it.h
                    );

                    let borderClass = 'border-white/5';
                    let bgClass = 'bg-transparent';

                    if (isWindowArea) {
                      bgClass = 'bg-red-500/5';
                      borderClass = 'border-red-500/10';
                    } else if (isOccupiedByDragged) {
                      const isInvalid = draggedItem.row < 3 || isOccupiedByOther;
                      bgClass = isInvalid ? 'bg-red-500/25' : 'bg-emerald-500/25';
                      borderClass = isInvalid ? 'border-red-500/40' : 'border-emerald-500/40';
                    } else {
                      borderClass = 'border-zinc-300/15';
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={cn(
                          "border-r border-b transition-all duration-100",
                          borderClass,
                          bgClass
                        )}
                      />
                    );
                  })
                )}
              </div>
            )}
            {/* ================= STATIC & INTERACTIVE DYNAMIC FURNITURE ================= */}
            {layoutItems.map(item => {
              const agent = item.type === 'desk' && item.agentId
                ? [...BASE_AGENTS, ...customAgents].find(a => a.id === item.agentId)
                : null

              const isAgentIdle = agent && (agentStatus[agent.id] === 'idle' || agentStatus[agent.id] === 'working' || !agentStatus[agent.id])

              let imgUrl = ''
              if (item.type === 'desk') {
                imgUrl = (agent && isAgentIdle) 
                  ? (processedSprites[`desk_${agent.id}`] || agent.sittingDeskUrl) 
                  : (processedAssets.Desk || OFFICE_ASSET_URLS.Desk)
              } else if (item.type === 'whiteboard') {
                imgUrl = processedAssets.Board || OFFICE_ASSET_URLS.Board
              } else if (item.type === 'printer') {
                imgUrl = processedAssets.Printer || OFFICE_ASSET_URLS.Printer
              } else if (item.type === 'coffee') {
                imgUrl = processedAssets.Coffee || OFFICE_ASSET_URLS.Coffee
              } else if (item.type === 'water') {
                imgUrl = processedAssets.Water || OFFICE_ASSET_URLS.Water
              } else if (item.type === 'plant') {
                imgUrl = processedAssets.Plant || OFFICE_ASSET_URLS.Plant
              } else if (item.type === 'lounge') {
                imgUrl = processedAssets.Lounge || '/images/furniture_sofa_corner.png'
              } else if (item.type === 'shelf') {
                imgUrl = processedAssets.Shelf || '/images/office_bookshelf_tall.png'
              } else if (item.type === 'meeting') {
                imgUrl = processedAssets.Meeting || '/images/desk_l_marketing.png'
              }

              const isSelected = selectedItemId === item.id && isEditingLayout

              const handleItemClick = (e: React.MouseEvent) => {
                e.stopPropagation()
                if (isEditingLayout) {
                  setSelectedItemId(item.id)
                  if (editMode === 'rotate') {
                    handleRotateItem(item.id)
                  } else if (editMode === 'delete') {
                    handleDeleteItem(item.id)
                  }
                } else {
                  if (item.type === 'desk' && agent) {
                    setSelectedAgentId(agent.id)
                  } else if (item.type === 'printer') {
                    setPrintedTicketsModalOpen(true)
                  } else if (item.type === 'coffee') {
                    setCoffeeModalOpen(true)
                  } else if (item.type === 'water') {
                    triggerWaterCoolerTalk()
                  } else if (item.type === 'whiteboard') {
                    const timeStr = new Date().toLocaleTimeString()
                    setConsolidatedLogs(prev => [
                      ...prev,
                      `[${timeStr}] [System] Inspeccionando Pizarra: Catálogo con ${productsCount} productos y logs operativos.`
                    ])
                    toast.info('Pizarra: Todo el equipo agéntico sincronizado.')
                  }
                }
              }

              const onMouseDown = (e: React.MouseEvent) => {
                if (isEditingLayout && editMode === 'move') {
                  handleItemMouseDown(e, item.id)
                }
              }

              return (
                <div
                  key={item.id}
                  onClick={handleItemClick}
                  onMouseDown={onMouseDown}
                  className={cn(
                    "absolute flex flex-col justify-end items-center p-1.5 select-none",
                    isEditingLayout ? "cursor-grab active:cursor-grabbing border border-dashed border-zinc-700/30 hover:bg-zinc-800/10" : "",
                    isSelected ? "border-2 border-solid border-purple-500 rounded-2xl" : "",
                    !isEditingLayout && item.type === 'desk' && agent ? "bg-zinc-950/20 backdrop-blur-[1px] border border-zinc-700/60 rounded-xl" : ""
                  )}
                  style={{
                    left: `${item.col * 4.166}%`,
                    top: `${item.row * 8.333}%`,
                    width: `${item.w * 4.166}%`,
                    height: `${item.h * 8.333}%`,
                    transform: `rotate(${item.rotation || 0}deg)`,
                    imageRendering: 'pixelated',
                    zIndex: item.type === 'plant' ? 12 : 11
                  }}
                >
                  {isSelected && (
                    <>
                      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                    </>
                  )}

                  {!isEditingLayout && item.type === 'desk' && (
                    agent ? (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[90%] bg-zinc-900/90 border border-zinc-800 rounded px-1.5 py-0.5 text-center shadow-sm select-none z-20">
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[7.5px] font-black text-white uppercase tracking-wide truncate">{agent.name}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[90%] text-center select-none z-20">
                        <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest block">Vacante</span>
                      </div>
                    )
                  )}

                  {!isEditingLayout && item.type === 'desk' && agent && agent.id === 'Logistics' && pendingOrdersCount > 0 && (
                    <div className="absolute -top-2.5 -right-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[8px] px-2 py-1 rounded-full shadow-lg border border-red-500 animate-bounce flex items-center gap-1 cursor-pointer z-30 select-none"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAgentId(agent.id)
                        setActiveTab('console')
                        setInstruction('Despacha los pedidos pendientes')
                        toast.info('Coordinador seleccionado. Ejecuta la orden para despachar.')
                      }}
                    >
                      <span>📦 {pendingOrdersCount}</span>
                    </div>
                  )}

                  {!isEditingLayout && item.type === 'desk' && agent && (agent.id === 'Nova' || agent.id === 'SalesBot') && outOfStockCount > 0 && (
                    <div className="absolute -top-2.5 -right-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[8px] px-2 py-1 rounded-full shadow-lg border border-amber-500 animate-bounce flex items-center gap-1 cursor-pointer z-30 select-none"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAgentId(agent.id)
                        setActiveTab('console')
                        setInstruction('Lista los productos agotados en stock')
                        toast.info('Agente seleccionado. Ejecuta la orden para ver stock.')
                      }}
                    >
                      <span>⚠️ {outOfStockCount}</span>
                    </div>
                  )}

                  {imgUrl ? (
                    (item.type === 'desk' && agent && isAgentIdle && (
                      agent.id === 'SalesBot' || 
                      agent.sittingDeskUrl.includes('deskt') || 
                      agent.sittingDeskUrl.includes('deskt2') || 
                      agent.sittingDeskUrl.includes('deskt3') ||
                      agent.sittingDeskUrl.includes('deskt4')
                    )) ? (
                      <div 
                        className="w-full h-full bg-no-repeat bg-contain bg-center mix-blend-multiply"
                        style={{
                          animation: agent.sittingDeskUrl.includes('deskt4')
                            ? 'growthDeskAnim 2.5s infinite'
                            : agent.sittingDeskUrl.includes('deskt3')
                            ? 'logisticsDeskAnim 2.0s infinite'
                            : agent.sittingDeskUrl.includes('deskt2')
                            ? 'novaDeskAnim 2.0s infinite'
                            : 'salesDeskAnim 1.5s infinite',
                          width: '100%',
                          height: '92%',
                          imageRendering: 'pixelated'
                        }}
                      />
                    ) : (
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="max-w-full max-h-[85%] object-contain mix-blend-multiply"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )
                  ) : (
                    <div className="w-[85%] h-[80%] bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center">
                      <span className="text-xl">
                        {item.type === 'meeting' ? '👥' : item.type === 'shelf' ? '📚' : '📦'}
                      </span>
                      <span className="text-[6.5px] text-zinc-500 font-black uppercase mt-0.5">{item.name}</span>
                    </div>
                  )}

                  {isEditingLayout && (
                    <span className="absolute bottom-1 right-1 bg-zinc-955/80 text-[6.5px] font-bold text-zinc-400 px-1 rounded block pointer-events-none select-none">
                      {item.w}x{item.h}
                    </span>
                  )}
                </div>
              )
            })}

            {/* ================= DYNAMIC AGENT CHARACTERS ================= */}
            {[...BASE_AGENTS, ...customAgents].map(agent => {
              const isActive = selectedAgentId === agent.id
              const bubbleText = agentBubbles[agent.id]
              const position = agentPositions[agent.id] || getAgentDeskPosition(agent.id)
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
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => {
                        if (!isEditingLayout) setSelectedAgentId(agent.id)
                      }}
                      className={cn(
                        "w-12 h-12 flex flex-col justify-end items-center relative outline-none cursor-pointer transform transition-all duration-300 z-10",
                        status === 'walking' ? "animate-bounce" : ""
                      )}
                      style={{ animationDuration: '0.8s' }}
                    >
                      {status === 'walking' && (
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

            {/* Grid controls overlay when editing */}
            {isEditingLayout && (
              <div className="absolute top-4 left-4 bg-zinc-950/90 border border-zinc-800 backdrop-blur text-white p-3 rounded-xl shadow-lg z-30 flex flex-col gap-2 max-w-xs text-xs font-semibold text-left">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] uppercase font-black tracking-wider text-zinc-400">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={() => setShowGrid(!showGrid)}
                    className="rounded border-zinc-800 bg-zinc-900 text-purple-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Mostrar cuadrícula</span>
                </label>
                <div>
                  <span className="text-[8px] text-zinc-500 uppercase font-black block mb-1">Tamaño de cuadrícula</span>
                  <select
                    value={gridSize}
                    onChange={e => setGridSize(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-2.5 py-1 text-[9px] text-white focus:outline-none"
                  >
                    <option value={16}>16px</option>
                    <option value={32}>32px (Estándar)</option>
                    <option value={48}>48px</option>
                  </select>
                </div>
              </div>
            )}

            {/* Floating Controls Tip info overlay when not editing */}
            {!isEditingLayout && (
              <div className="absolute bottom-4 left-4 bg-zinc-900/85 backdrop-blur text-white px-3 py-2 rounded-xl text-[10px] font-semibold flex items-center gap-2 max-w-xs shadow-md border border-zinc-800 select-none z-20">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Oficina Pixel Art de FlashCheckout. Haz clic en un agente para abrir su terminal e ingresarle tareas.</span>
              </div>
            )}

            {/* Bottom toolbar for editor mode */}
            {isEditingLayout && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950/90 border border-zinc-800 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl z-30 select-none">
                <button
                  onClick={() => setEditMode('select')}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                    editMode === 'select' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <span>Seleccionar</span>
                </button>
                <button
                  onClick={() => setEditMode('move')}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                    editMode === 'move' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <span>Mover</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedItemId) {
                      handleRotateItem(selectedItemId)
                    } else {
                      setEditMode('rotate')
                      toast.info('Modo Rotar activo: Haz clic en un mueble para rotarlo.')
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                    editMode === 'rotate' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <span>Rotar</span>
                </button>
                <button
                  onClick={() => {
                    if (selectedItemId) {
                      handleDeleteItem(selectedItemId)
                    } else {
                      setEditMode('delete')
                      toast.info('Modo Eliminar activo: Haz clic en un mueble para borrarlo.')
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                    editMode === 'delete' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <span>Eliminar</span>
                </button>
                <div className="w-px h-5 bg-zinc-800" />
                <button
                  onClick={handleSaveLayout}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg active:scale-95 cursor-pointer transition-all flex items-center gap-1 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar diseño</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Agregar puesto */}
        {isEditingLayout && (
          <div className="w-full xl:w-64 bg-zinc-950 border border-zinc-800 rounded-3xl p-4 flex flex-col shrink-0 text-left select-none shadow-xl animate-in slide-in-from-right duration-250">
            <h3 className="text-white font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-450" />
              <span>Agregar puesto</span>
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold mb-4 leading-normal">
              Haz clic en uno de los puestos de abajo para agregarlo a la oficina:
            </p>
            
            <div className="space-y-2.5">
              <button
                onClick={() => handleAddItem('desk')}
                className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-lg">🖥️</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">Escritorio</span>
                    <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 3x3</span>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAddItem('meeting')}
                className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-lg">👥</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">Mesa grande</span>
                    <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 3x2</span>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAddItem('lounge')}
                className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-lg">🛋️</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">Lounge</span>
                    <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 4x2</span>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAddItem('plant')}
                className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-lg">🪴</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">Planta</span>
                    <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 1x1</span>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => handleAddItem('shelf')}
                className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-lg">📚</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">Estantería</span>
                    <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 2x2</span>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>

            <div className="mt-6 bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl text-[10px] text-zinc-400 font-semibold leading-relaxed">
              <span className="text-[8px] uppercase tracking-wider font-black text-amber-500 block mb-1">💡 Consejo</span>
              <span>Cada puesto ocupa un espacio determinado. Planifica tu oficina estratégicamente.</span>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Dim backdrop cover when drawer is open (Light and transparent overlay to NOT blur the office) */}
      {selectedAgent && (
        <div 
          onClick={() => setSelectedAgentId(null)}
          className="fixed inset-0 bg-black/10 z-40 transition-all duration-300" 
        />
      )}

      {/* Slide-over Inspector Agent Drawer (Solid Premium Light Palette) */}
      {selectedAgent && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300 select-text text-zinc-800 font-sans">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50 select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                <img 
                  src={processedSprites[selectedAgent.id] || selectedAgent.spriteUrl} 
                  alt={selectedAgent.name} 
                  className="w-9 h-9 object-contain mix-blend-multiply"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-zinc-900 text-sm xl:text-base">{selectedAgent.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-250 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                    En línea
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{selectedAgent.role}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedAgentId(null)}
              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Navigation Tabs (Segmented control style) */}
          <div className="flex bg-zinc-100 p-1 rounded-xl gap-1 mx-4 my-2.5 select-none border border-zinc-200/60">
            <button 
              onClick={() => setActiveTab('console')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold text-center rounded-lg outline-none cursor-pointer transition-all",
                activeTab === 'console' ? "bg-white text-zinc-800 shadow-sm border border-zinc-200/40" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Consola del Agente
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold text-center rounded-lg outline-none cursor-pointer transition-all",
                activeTab === 'profile' ? "bg-white text-zinc-800 shadow-sm border border-zinc-200/40" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Especificaciones y Perfil
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 pt-1.5 select-text">
            {activeTab === 'console' ? (
              /* Monospace console logs */
              <div className="w-full h-full bg-zinc-95 border border-zinc-200 rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-sm min-h-[300px]">
                <div className="flex-1 overflow-y-auto font-mono text-[10px] text-zinc-650 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                  {terminalLogs[selectedAgent.id]?.map((log, index) => {
                    const isOrder = log.includes('> ORDEN')
                    const isError = log.includes('[ERROR]')
                    const isSystem = log.includes('[System]') || log.includes('inicializada') || log.includes('activo') || log.includes('en línea')
                    
                    return (
                      <div 
                        key={index}
                        className={cn(
                          "whitespace-pre-wrap leading-relaxed",
                          isOrder ? "text-purple-600 font-bold border-b border-zinc-100 pb-1" : 
                          isError ? "text-red-500 animate-pulse" :
                          isSystem ? "text-zinc-400 font-bold" : 
                          "text-zinc-600"
                        )}
                      >
                        {log}
                      </div>
                    )
                  })}
                  {submitting && (
                    <div className="text-zinc-500 font-bold animate-pulse flex items-center gap-1.5">
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
              <div className="space-y-5 text-left text-zinc-700">
                <div>
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Descripción del Agente</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-semibold mt-1.5">{selectedAgent.description}</p>
                </div>

                <div className="h-px bg-zinc-200" />

                {/* Tech specifications grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                    <Cpu className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Modelo LLM</span>
                      <span className="text-xs font-black text-zinc-900 mt-1 block truncate leading-none" title={selectedAgent.model}>
                        {selectedAgent.model.split('/').pop()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                    <Activity className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Latencia Promedio</span>
                      <span className="text-xs font-black text-zinc-900 mt-1 block leading-none">{selectedAgent.latency}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                    <Coins className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Tokens Consumidos</span>
                      <span className="text-xs font-black text-zinc-900 mt-1 block leading-none font-mono">{selectedAgent.tokensUsed.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl flex items-center gap-2.5">
                    <TrendingUp className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Efectividad (Acc)</span>
                      <span className="text-xs font-black text-zinc-900 mt-1 block leading-none">{selectedAgent.accuracy}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-200" />

                {/* Scope capabilities lists */}
                <div>
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Herramientas Autorizadas</h4>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {selectedAgent.tools.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-650 font-mono text-[10px] rounded-lg">
                        🔧 {t}
                      </span>
                    ))}
                  </div>

                  {/* Dismiss agent option if it is custom */}
                  {selectedAgent.id.startsWith('Custom_') && (
                    <button
                      onClick={() => handleDismissAgent(selectedAgent.id)}
                      className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-extrabold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer select-none"
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
          <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 select-none">
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
                  className="flex-1 bg-white border border-zinc-200 focus:border-zinc-400 rounded-xl px-4 py-2.5 text-xs text-zinc-800 outline-none transition-all font-semibold pr-10 disabled:opacity-75 placeholder:text-zinc-400 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!instruction.trim() || submitting || (agentStatus[selectedAgent.id] && agentStatus[selectedAgent.id] !== 'idle')}
                  className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg cursor-pointer transition-all active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:scale-100"
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

      {/* HIRING MODAL (Crear Agentes - Premium Light Glassmorphism) */}
      {hiringModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
            
            <button 
              onClick={() => setHiringModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-150 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 select-none">
              <Building className="w-5 h-5 text-zinc-800" />
              <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Contratar Nuevo Agente de Oficina</h2>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Nombre del Agente</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SupportBot, Analyst"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Rol / Cargo</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asistente de Catálogo"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Modelo de IA</label>
                  <select
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none cursor-pointer transition-all"
                  >
                    <option value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B (Recomendado)</option>
                    <option value="google/gemma-2-9b-it">Gemma 2 9B (Veloz)</option>
                    <option value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B (Complejo)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Emoji / Sprite base</label>
                  <select
                    value={newAvatarEmoji}
                    onChange={e => setNewAvatarEmoji(e.target.value)}
                    className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none cursor-pointer transition-all"
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
                <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">Descripción Breve</label>
                <input
                  type="text"
                  placeholder="e.g. Asiste en tareas de catalogación de productos y ofertas..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none transition-all placeholder:text-zinc-400"
                />
              </div>

              <div>
                <label className="text-[9px] text-zinc-500 uppercase font-black block mb-1">System Prompt (Instrucción Base/Personalidad)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Eres un agente enfocado en la atención y redacción. Responde siempre con tono ejecutivo..."
                  value={newSystemPrompt}
                  onChange={e => setNewSystemPrompt(e.target.value)}
                  className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none resize-none font-mono transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Tool checkboxes */}
              <div>
                <label className="text-[9px] text-zinc-500 uppercase font-black block mb-2">Herramientas Autorizadas (Funcionalidades)</label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-55 border border-zinc-200 p-3 rounded-xl max-h-32 overflow-y-auto">
                  {AVAILABLE_TOOLS.map(t => {
                    const checked = newTools.includes(t.name)
                    return (
                      <label key={t.name} className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) setNewTools(newTools.filter(x => x !== t.name))
                            else setNewTools([...newTools, t.name])
                          }}
                          className="rounded border-zinc-300 bg-white text-zinc-950 focus:ring-0 cursor-pointer"
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
                  className="flex-1 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-bold rounded-xl py-2.5 text-center cursor-pointer transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName || !newRole || !newSystemPrompt}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl py-2.5 text-center cursor-pointer transition-all active:scale-[0.98] disabled:bg-zinc-100 disabled:text-zinc-400 disabled:scale-100 border border-zinc-800 disabled:border-zinc-200 disabled:cursor-not-allowed"
                >
                  {creating ? 'Contratando...' : 'Confirmar Contratación'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COFFEE BOOST MODAL */}
      {coffeeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
            
            <button 
              onClick={() => setCoffeeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-150 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 select-none">
              <Coffee className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Bar de Café Premium</h2>
            </div>

            <p className="text-xs text-zinc-500 mb-4 font-semibold">
              Invita una taza de café recién preparado a tus agentes para optimizar sus tiempos de respuesta y darles un empujón de energía.
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {agentsList.map(agent => {
                const isBoosted = boostedAgents[agent.id]
                return (
                  <div key={agent.id} className="flex justify-between items-center bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{agent.avatarEmoji}</span>
                      <div className="text-left">
                        <span className="text-xs font-bold text-zinc-900 block">{agent.name}</span>
                        <span className="text-[10px] text-zinc-500 block font-semibold">{agent.role}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const timeStr = new Date().toLocaleTimeString()
                        setBoostedAgents(prev => ({ ...prev, [agent.id]: true }))
                        setAgentBubbles(prev => ({ ...prev, [agent.id]: '¡Gracias por el café! ☕️ Latencia optimizada.' }))
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
                      }}
                      disabled={isBoosted}
                      className={cn(
                        "text-[10px] font-black rounded-lg px-3 py-1.5 select-none transition-all active:scale-95 cursor-pointer",
                        isBoosted 
                          ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed active:scale-100" 
                          : "bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                      )}
                    >
                      {isBoosted ? 'Con Cafeína ⚡' : 'Invitar Café ☕'}
                    </button>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      )}

      {/* PRINTER TICKETS MODAL */}
      {printedTicketsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
            
            <button 
              onClick={() => setPrintedTicketsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-150 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 select-none">
              <Printer className="w-5 h-5 text-zinc-800" />
              <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Tickets de Operación Impresos</h2>
            </div>

            <p className="text-xs text-zinc-500 mb-4 font-semibold">
              Registro físico simulado de las operaciones de base de datos exitosas realizadas por el equipo de agentes.
            </p>

            <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-xl max-h-80 overflow-y-auto space-y-3.5 font-mono text-[10px] text-zinc-650">
              {printedTickets.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 font-semibold">
                  No hay tickets impresos en esta sesión. Envía comandos con herramientas para generar recibos.
                </div>
              ) : (
                printedTickets.map((t, idx) => (
                  <div key={idx} className="border-b border-dashed border-zinc-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between text-zinc-500 font-bold mb-1">
                      <span>[{t.time}] {t.action}</span>
                      <span>AGENTE: {t.agent}</span>
                    </div>
                    <div className="text-zinc-700 pl-2 border-l border-zinc-300 leading-relaxed">
                      {t.details}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* OFFICE LOGS MODAL */}
      {logsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[999] flex items-center justify-center animate-in fade-in duration-200 select-none">
          <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 text-zinc-900 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left select-text">
            
            <button 
              onClick={() => setLogsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-150 text-zinc-400 hover:text-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center mb-4 select-none pr-8">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-zinc-800" />
                <h2 className="text-base font-extrabold tracking-tight text-zinc-900">Visor de Actividades Generales (The Office Logs)</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 tracking-wider uppercase">Stream Consolidado</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-4 font-semibold">
              Registro de acciones en tiempo real ejecutadas por los agentes en el espacio modular.
            </p>

            <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-xl max-h-96 overflow-y-auto space-y-2 font-mono text-[10.5px] text-zinc-650">
              {consolidatedLogs.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 font-semibold">
                  No hay actividades registradas aún.
                </div>
              ) : (
                consolidatedLogs.map((log, idx) => {
                  let colorClass = 'text-zinc-600'
                  const baseList = [...BASE_AGENTS, ...customAgents]
                  baseList.forEach(a => {
                    if (log.includes(`[${a.name}]`)) {
                      if (a.color === 'emerald') colorClass = 'text-emerald-650 font-semibold'
                      else if (a.color === 'teal') colorClass = 'text-teal-650 font-semibold'
                      else if (a.color === 'blue') colorClass = 'text-blue-650 font-semibold'
                      else if (a.color === 'amber') colorClass = 'text-amber-650 font-semibold'
                    }
                  })
                  if (log.includes('ORDEN RECIBIDA')) colorClass = 'text-purple-650 font-bold border-b border-dashed border-zinc-200/85 pb-0.5 mb-0.5'
                  
                  return (
                    <div key={idx} className={colorClass}>
                      {log}
                    </div>
                  )
                })
              )}
              <div ref={consolidatedEndRef} />
            </div>

            <div className="flex justify-end pt-4 select-none">
              <button
                type="button"
                onClick={() => setLogsModalOpen(false)}
                className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl px-5 py-2.5 text-center cursor-pointer transition-all active:scale-[0.98] border border-zinc-800"
              >
                Cerrar Visor
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  )
}
