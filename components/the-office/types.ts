export interface StoreData {
  id: string
  name: string
  slug: string
  category?: string
  whatsapp?: string | null
  whatsappConnected?: boolean
  mpConnected?: boolean
  settings?: {
    customAgents?: Agent[]
    officeLayout?: LayoutItem[]
    [key: string]: unknown
  }
}

export interface LayoutItem {
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

export interface Agent {
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

export interface PrintedTicket {
  time: string
  agent: string
  action: string
  details: string
}

export const BASE_AGENTS: Agent[] = [
  {
    id: 'Nova',
    name: 'Nova',
    role: 'Copiloto de Administración',
    color: 'emerald',
    avatarBg: 'bg-emerald-500',
    avatarEmoji: '🤖',
    spriteUrl: '/images/sprite_nova.png',
    sittingDeskUrl: '/images/deskt2/01-Photoroom.png',
    deskPosition: { top: '56%', left: '52%' },
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
    deskPosition: { top: '38%', left: '32%' },
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
    deskPosition: { top: '38%', left: '68%' },
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
    deskPosition: { top: '78%', left: '76%' },
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

export const DEFAULT_LAYOUT_ITEMS: LayoutItem[] = [
  // 1. Desks for Base Agents
  { id: 'desk_nova', name: 'Nova Desk', type: 'desk', col: 11, row: 5, w: 3, h: 3, rotation: 0, agentId: 'Nova' },
  { id: 'desk_sales', name: 'SalesBot Desk', type: 'desk', col: 5, row: 4, w: 3, h: 3, rotation: 0, agentId: 'SalesBot' },
  { id: 'desk_logistics', name: 'Logistics Desk', type: 'desk', col: 15, row: 4, w: 3, h: 3, rotation: 0, agentId: 'Logistics' },
  { id: 'desk_growth', name: 'Growth Desk', type: 'desk', col: 18, row: 8, w: 3, h: 3, rotation: 0, agentId: 'Growth' },
  
  // 2. Stations (Whiteboard, Printer, Coffee Bar, Water Coolers)
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

  // 5. Decor Plants (1x1)
  { id: 'plant_1', name: 'Planta', type: 'plant', col: 1, row: 3, w: 1, h: 1, rotation: 0 },
  { id: 'plant_2', name: 'Planta', type: 'plant', col: 1, row: 10, w: 1, h: 1, rotation: 0 },
  { id: 'plant_3', name: 'Planta', type: 'plant', col: 22, row: 3, w: 1, h: 1, rotation: 0 },
  { id: 'plant_4', name: 'Planta', type: 'plant', col: 22, row: 10, w: 1, h: 1, rotation: 0 }
]

export const OFFICE_ASSET_URLS = {
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

export const AVAILABLE_TOOLS = [
  { name: 'search_products', label: '🔍 Buscar Productos' },
  { name: 'update_product', label: '🔧 Editar Productos' },
  { name: 'list_orders', label: '📋 Listar Pedidos' },
  { name: 'update_order_status', label: '🚚 Despachar Pedidos' },
  { name: 'create_coupon', label: '🎟️ Crear Cupones' },
  { name: 'update_builder_layout', label: '🖥️ Modificar Constructor' }
]
