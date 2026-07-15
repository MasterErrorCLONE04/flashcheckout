'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Bot, 
  Send, 
  Paperclip, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  ChevronRight, 
  Store, 
  Crown, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight,
  X,
  TrendingUp,
  Loader2,
  Brain,
  ChevronDown,
  Sparkles,
  Mic,
  Waves,
  MessageSquare,
  Plus,
  Trash2,
  MoreVertical,
  AlignLeft,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  time: string
  type?: 'products_list' | 'discount_card' | 'text' | 'product_created_card' | 'product_updated' | 'order_status_updated' | 'orders_list' | 'sales_metrics' | 'customer_chat'
  products?: { name: string; sales: string; price: string }[]
  coupon?: { code: string; desc: string; validity: string; active: boolean }
  productDetail?: {
    name: string
    status: string
    category: string
    description: string
    price: string
    stock: string
    image: string
  }
  action?: {
    type: string
    payload: ActionPayload
  }
}

type ActionPayload = {
  products?: Array<{ name: string; stock: number; category?: string; active?: boolean; price: number }>
  product?: {
    name: string
    price: number
    stock: number
    oldStock?: number
    newStock?: number
    newActive?: boolean
    category?: string
    description?: string
    imageUrl?: string
  }
  coupon?: {
    code: string
    desc: string
    validoHasta?: string
    validity?: string
  }
  order?: {
    id: string
    newStatus: string
    customerName: string
    total: number
    adminComment?: string | null
  }
  orders?: Array<{
    id: string
    customerName: string
    city: string
    paymentStatus: string
    total: number
    status: string
  }>
  metrics?: {
    totalSales: number
    totalOrders: number
    avgTicket: number
    topProducts?: Array<{ name: string; qty: number; sales: number }>
  }
  customerName?: string
  step?: string
  assignedTo?: string
  phoneNumber?: string
  chatHistory?: Array<{ sender: 'user' | 'bot'; text: string }>
}

type ChatSessionItem = {
  id: string
  title: string
  messages: Message[]
  updatedAt: string
}

interface NovaChatClientProps {
  merchantName: string
  store: {
    id: string
    name: string
    slug: string
    category: string | null
    whatsapp: string | null
    whatsappConnected: boolean
    mpConnected: boolean
    verificationLevel: number
  }
  activeProductsCount: number
  ordersCount: number
  activeChatsCount: number
  initialSessions?: {
    id: string
    title: string
    messages: Message[]
    updatedAt: string
  }[]
}

const formatSessionTime = (dateStr: string) => {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  
  const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  
  if (d.toDateString() === today.toDateString()) {
    return `Hoy, ${timeStr}`
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Ayer, ${timeStr}`
  } else {
    const day = d.getDate()
    const month = d.toLocaleString('es-ES', { month: 'short' })
    return `${day} ${month}, ${timeStr}`
  }
}

const DEMO_SESSIONS = [
  {
    id: 'demo-session-1',
    title: 'Ayúdame a crear un nuevo...',
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'demo-msg-1',
        sender: 'user' as const,
        text: 'Ayúdame a crear un nuevo producto',
        time: '10:24 AM',
        type: 'text' as const
      },
      {
        id: 'demo-msg-2',
        sender: 'bot' as const,
        text: "¡Excelente iniciativa! Para agregar un nuevo producto a tu catálogo de 'Tienda webs', necesito que me compartas los siguientes detalles: **Nombre del producto**, **Precio**, **Stock disponible** y una **breve descripción**. Una vez que me proporciones esta información, podré registrarlo de inmediato en tu panel. Mientras tanto, he preparado una estructura base para que veas cómo se procesará la creación.",
        time: '10:24 AM',
        type: 'products_list' as const,
        products: [
          { name: 'Nuevo Producto', sales: 'Stock: 0', price: '$0' }
        ]
      },
      {
        id: 'demo-msg-3',
        sender: 'user' as const,
        text: 'PC Gamer, 2000000, 99, crea tu la descripcion y colocale la categoria de tecnologia',
        time: '10:25 AM',
        type: 'text' as const
      },
      {
        id: 'demo-msg-4',
        sender: 'bot' as const,
        text: "¡Listo! He creado el producto 'PC Gamer' en tu catálogo con un precio de $2.000.000 y un stock de 99 unidades. Le he asignado la categoría de Tecnología y una descripción atractiva para resaltar sus características. Ya está disponible para que tus clientes lo adquieran a través de tu link de checkout y el chatbot de WhatsApp.",
        time: '10:25 AM',
        type: 'product_created_card' as const,
        productDetail: {
          name: 'PC Gamer',
          status: 'Creado',
          category: 'Tecnología',
          description: 'PC de alto rendimiento ideal para gaming, diseño y tareas exigentes. Procesador potente, gráficos dedicados y excelente refrigeración.',
          price: '$2.000.000',
          stock: 'Stock: 99',
          image: '/images/pc-gamer.png'
        }
      }
    ]
  },
  {
    id: 'demo-session-2',
    title: 'Muéstrame mis últimos pedi...',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages: []
  }
]

const AGENTS = [
  {
    id: 'nova',
    name: 'Nova',
    role: 'Copiloto de la plataforma',
    description: 'Ayuda a gestionar productos, ver métricas, configurar integraciones y responder preguntas generales sobre tu negocio.',
    colorClass: 'bg-emerald-50 border-emerald-100 text-emerald-650',
    avatarBg: 'bg-emerald-500',
    iconColor: 'text-[#10B981]'
  },
  {
    id: 'stella',
    name: 'Stella',
    role: 'Especialista en Marketing',
    description: 'Te ayuda a crear cupones de descuento, diseñar ofertas atractivas, analizar comportamiento de clientes y proponer estrategias de venta.',
    colorClass: 'bg-pink-50 border-pink-100 text-pink-650',
    avatarBg: 'bg-pink-500',
    iconColor: 'text-pink-505'
  },
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Analista de Operaciones',
    description: 'Monitorea tus pedidos, despachos, conductores y stock. Genera reportes de inventario y te alerta sobre productos agotados o críticos.',
    colorClass: 'bg-blue-50 border-blue-100 text-blue-650',
    avatarBg: 'bg-blue-500',
    iconColor: 'text-blue-505'
  },
  {
    id: 'orion',
    name: 'Orion',
    role: 'Ingeniero de Integraciones',
    description: 'Te ayuda con la conexión de tu bot de WhatsApp, pasarelas de pago (Mercado Pago, Stripe), dominios y configuraciones técnicas.',
    colorClass: 'bg-purple-50 border-purple-100 text-purple-650',
    avatarBg: 'bg-purple-500',
    iconColor: 'text-purple-505'
  }
]

export default function NovaChatClient({
  merchantName,
  store,
  activeProductsCount,
  ordersCount,
  activeChatsCount,
  initialSessions = []
}: NovaChatClientProps) {
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showSlashCommands, setShowSlashCommands] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0])
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)

  // Toggle slash commands popover
  useEffect(() => {
    if (inputText.startsWith('/')) {
      setShowSlashCommands(true)
    } else {
      setShowSlashCommands(false)
    }
  }, [inputText])

  // Layout main tag dynamic padding adjuster to achieve full screen layout
  useEffect(() => {
    const mainEl = document.querySelector('main')
    if (mainEl) {
      const originalClassName = mainEl.className
      mainEl.classList.remove('px-4', 'md:px-8', 'pb-8', 'md:pb-12', 'pt-4', 'md:pt-6', 'lg:pl-12')
      mainEl.classList.add('p-0', 'w-full', 'h-[calc(100vh-53px)]')
      return () => {
        mainEl.className = originalClassName
      }
    }
  }, [])

  // Auto-resize textarea to fit text length up to 200px max height
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const nextHeight = Math.min(textarea.scrollHeight, 200)
      textarea.style.height = `${nextHeight}px`
    }
  }, [inputText])

  const mapMessageProperties = (m: Message): Message => {
    if (m.sender !== 'bot' || !m.action || m.action.type === 'NONE') {
      return m
    }

    const { type, payload } = m.action
    const newMsg = { ...m }

    if (type === 'search_products' && payload?.products) {
      newMsg.type = 'products_list'
      newMsg.products = payload.products.map((p) => ({
        name: p.name,
        sales: `Stock: ${p.stock} | Cat: ${p.category} | ${p.active ? 'Activo' : 'Inactivo'}`,
        price: `$${p.price.toLocaleString('es-CO')}`
      }))
    }
    else if (type === 'create_product' && payload?.product) {
      newMsg.type = 'product_created_card'
      newMsg.productDetail = {
        name: payload.product.name,
        price: `$${payload.product.price.toLocaleString('es-CO')}`,
        stock: `Stock: ${payload.product.stock}`,
        category: payload.product.category || 'General',
        description: payload.product.description || '',
        image: payload.product.imageUrl || '/placeholder-product.png',
        status: 'Creado'
      }
    }
    else if (type === 'create_coupon' && payload?.coupon) {
      newMsg.type = 'discount_card'
      newMsg.coupon = {
        code: payload.coupon.code,
        desc: payload.coupon.desc,
        validity: `Válido hasta: ${payload.coupon.validoHasta || payload.coupon.validity || ''}`,
        active: true
      }
    }
    else if (type === 'update_product' && payload?.product) {
      newMsg.type = 'product_updated'
    }
    else if (type === 'update_order_status' && payload?.order) {
      newMsg.type = 'order_status_updated'
    }
    else if (type === 'list_orders' && payload?.orders) {
      newMsg.type = 'orders_list'
    }
    else if (type === 'get_sales_metrics' && payload?.metrics) {
      newMsg.type = 'sales_metrics'
    }
    else if (type === 'get_customer_chat' && payload?.customerName) {
      newMsg.type = 'customer_chat'
    }

    return newMsg
  }

  const [sessions, setSessions] = useState<ChatSessionItem[]>(() => {
    const list = initialSessions.length > 0 ? initialSessions : DEMO_SESSIONS
    return list.map(session => ({
      ...session,
      messages: session.messages.map((m) => mapMessageProperties(m))
    }))
  })
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return sessions.length > 0 ? sessions[0].id : null
  })

  const [messages, setMessages] = useState<Message[]>(() => {
    if (sessions.length > 0) {
      return sessions[0].messages.map((m) => mapMessageProperties(m))
    }
    return []
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const getFormattedTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSelectSession = (sessionId: string) => {
    const sess = sessions.find(s => s.id === sessionId)
    if (sess) {
      setActiveSessionId(sessionId)
      setMessages(sess.messages.map((m) => mapMessageProperties(m)))
    }
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
  }

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    
    // Si es demo, solo remover localmente
    if (sessionId.startsWith('demo-')) {
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (activeSessionId === sessionId) {
        handleNewChat()
      }
      toast.success('Conversación eliminada')
      return
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta conversación? 🗑️')) return

    try {
      const res = await fetch('/api/agent/nova', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        if (activeSessionId === sessionId) {
          handleNewChat()
        }
        toast.success('Conversación eliminada')
      } else {
        throw new Error()
      }
    } catch {
      toast.error('Error al eliminar la conversación')
    }
  }

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      time: getFormattedTime(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/agent/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          sessionId: activeSessionId?.startsWith('demo-') ? null : activeSessionId,
          agent: selectedAgent.id
        })
      })

      if (!res.ok) throw new Error()
      const data = await res.json()

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.text || 'Entendido.',
        time: getFormattedTime(),
        type: data.type || 'text',
        action: data.action
      }

      const botMsgMapped = mapMessageProperties(botMsg)

      setMessages(prev => [...prev, botMsgMapped])

      const isDemo = activeSessionId?.startsWith('demo-')
      if ((!activeSessionId || isDemo) && data.sessionId) {
        setActiveSessionId(data.sessionId)
        const newSess = {
          id: data.sessionId,
          title: textToSend.slice(0, 35) || 'Nuevo Chat',
          messages: [userMsg, botMsgMapped],
          updatedAt: new Date().toISOString()
        }
        setSessions(prev => [newSess, ...prev].filter(s => !s.id.startsWith('demo-')))
      } else if (activeSessionId) {
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, userMsg, botMsgMapped],
              updatedAt: new Date().toISOString()
            }
          }
          return s
        }))
      }
    } catch {
      toast.error(`Error al comunicarse con ${selectedAgent.name}`)
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: 'Lo siento, en este momento tengo problemas para procesar tu consulta. ¿Podrías intentar de nuevo? 🔌',
        time: getFormattedTime(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    let query = ''
    switch (suggestion) {
      case 'producto': query = 'Ayúdame a crear un nuevo producto'; break
      case 'pedidos': query = 'Muéstrame mis últimos pedidos pendientes'; break
      case 'descuento': query = 'Crea un cupón de descuento activo'; break
      default: query = suggestion
    }
    handleSend(query)
  }

  const firstName = merchantName.split(' ')[0] || 'Comerciante'

  return (
    <div className="flex w-full h-full bg-white font-sans text-left overflow-hidden select-none">
      
      <aside className="w-64 border-r border-zinc-200/80 bg-[#FAFAFA] flex flex-col shrink-0 h-full justify-between">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-3">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Chat</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 scrollbar-none select-none">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs font-semibold select-none leading-relaxed">
                No hay chats guardados.
                <br />
                <span className="text-[10px] text-zinc-350">¡Escribe algo para comenzar!</span>
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = activeSessionId === s.id
                const formattedTime = formatSessionTime(s.updatedAt)
                return (
                  <div 
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={cn(
                      "group w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-xs transition-all relative border cursor-pointer select-none",
                      isActive 
                        ? "bg-[#EEFDF7] text-[#065F46] font-bold border-[#A7F3D0]" 
                        : "border-transparent text-zinc-650 hover:bg-zinc-100/50 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                        isActive 
                          ? "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]" 
                          : "bg-white border-zinc-200 text-zinc-400 group-hover:border-zinc-300 group-hover:text-zinc-650"
                      )}>
                        <MessageSquare className="w-4 h-4 stroke-[2px]" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <span className={cn(
                          "block truncate font-bold text-xs leading-none",
                          isActive ? "text-[#065F46]" : "text-zinc-805"
                        )}>
                          {s.title}
                        </span>
                        {formattedTime && (
                          <span suppressHydrationWarning className="block text-[10px] font-semibold text-zinc-400 mt-1.5 leading-none">
                            {formattedTime}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200/50 text-zinc-400 hover:text-red-650 rounded transition-all shrink-0 cursor-pointer absolute right-2.5 bg-transparent"
                      title="Eliminar conversación"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-zinc-450" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="p-3 border-t border-zinc-200/60 bg-[#FAFAFA] shrink-0">
          <button 
            onClick={() => toast.info('Historial completo de conversaciones próximamente')}
            className="w-full flex items-center justify-start gap-2.5 px-3 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <AlignLeft className="w-4 h-4 text-zinc-500" />
            <span>Ver todas las conversaciones</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-white h-full relative">
        <header className="flex items-center justify-between px-6 py-2.5 bg-white shrink-0 border-b border-zinc-100 relative z-30">
          <div className="flex flex-col text-left relative">
            <div 
              onClick={() => setShowAgentDropdown(!showAgentDropdown)}
              className="flex items-center gap-1 text-base font-bold text-zinc-900 cursor-pointer hover:bg-zinc-50 px-2 py-0.5 rounded transition-colors group select-none"
            >
              <span>{selectedAgent.name}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            </div>

            {showAgentDropdown && (
              <div className="absolute left-0 mt-8 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-200 select-none">
                <span className="block px-4 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">Seleccionar Agente</span>
                <div className="max-h-80 overflow-y-auto">
                  {AGENTS.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent)
                        setShowAgentDropdown(false)
                        toast.success(`Agente cambiado a ${agent.name}`)
                      }}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-50 last:border-b-0",
                        selectedAgent.id === agent.id && "bg-zinc-50"
                      )}
                    >
                      <div className={cn("w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border", agent.colorClass)}>
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs xl:text-sm text-zinc-905">{agent.name}</span>
                          <span className="text-[10px] text-zinc-400 font-bold font-sans">({agent.role})</span>
                        </div>
                        <p className="text-[10px] xl:text-[11px] font-semibold text-zinc-400 mt-1 leading-normal">{agent.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-[#10B981] select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>En línea · <span className="text-zinc-400 font-semibold">{selectedAgent.role}</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMemoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-50 text-zinc-650 text-xs font-semibold rounded-lg border border-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Brain className="w-3.5 h-3.5 text-zinc-500" />
              <span>Mostrar memoria</span>
            </button>
            <Link href="/dashboard/suscripcion">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm active:scale-95">
                <Sparkles className="w-3.5 h-3.5 text-white fill-current animate-pulse" />
                <span>Mejorar el plan</span>
              </button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full scrollbar-none flex flex-col items-center select-text">
          {messages.length === 0 ? (
            <div className="flex-1 w-full max-w-2xl mx-auto px-4 flex flex-col justify-center items-center text-center space-y-8 select-none py-12">
              <div className={cn("w-14 h-14 rounded-full border flex items-center justify-center shadow-sm", selectedAgent.colorClass)}>
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h1 className="text-3xl font-medium text-zinc-800 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-300">
                  ¿Cómo puedo ayudarte, {firstName}?
                </h1>
                <p className="text-xs xl:text-sm font-semibold text-zinc-400 animate-in fade-in duration-300">
                  Hablas con <span className="font-bold text-zinc-900">{selectedAgent.name}</span> ({selectedAgent.role}). {selectedAgent.description}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center w-full max-w-lg">
                {[
                  { label: '🛍️ Crear producto', value: 'producto' },
                  { label: '📦 Ver pedidos', value: 'pedidos' },
                  { label: '🏷️ Crear descuento', value: 'descuento' }
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(btn.value)}
                    className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50/50 hover:border-zinc-300 text-zinc-700 text-xs font-semibold rounded-full transition-all shadow-sm cursor-pointer select-none active:scale-95 animate-in fade-in duration-300"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
              {messages.map((m) => {
                const isBot = m.sender === 'bot'
                return (
                  <div key={m.id} className={cn("flex w-full gap-4 items-start animate-in fade-in duration-200", isBot ? "justify-start text-left" : "justify-end text-left")}>
                    {isBot && (
                      <div className="shrink-0 select-none mt-0.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm", selectedAgent.avatarBg)}>
                          <Bot className="w-4.5 h-4.5 stroke-[2.5px]" />
                        </div>
                      </div>
                    )}
                    <div className={cn("min-w-0 max-w-[85%]", isBot ? "space-y-1.5" : "ml-auto")}>
                      <div className={cn(
                        "text-sm leading-relaxed font-medium",
                        isBot 
                          ? "text-zinc-805 bg-white py-1 px-1" 
                          : "bg-[#F4F4F4] text-zinc-800 rounded-3xl px-5 py-3 ml-auto inline-block border border-zinc-200/40"
                      )}>
                        <p className="whitespace-pre-line">{m.text}</p>
                        
                        {isBot && m.type === 'products_list' && m.products && (
                          <div className="mt-4 space-y-2">
                            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-1.5 space-y-1.5">
                              {m.products.map((p, idx) => (
                                <div key={idx} className="p-3.5 flex items-center justify-between bg-white rounded-lg border border-zinc-100 shadow-sm">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-sm">
                                      {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="font-bold text-zinc-900 truncate text-xs xl:text-sm">{p.name}</h5>
                                      <p className="text-xs font-semibold text-zinc-400 mt-1 leading-none">{p.sales}</p>
                                    </div>
                                  </div>
                                  <span className="font-bold text-zinc-900 text-xs xl:text-sm shrink-0">{p.price}</span>
                                </div>
                              ))}
                            </div>
                            <Link href="/productos" className="block w-full">
                              <button className="w-full mt-2 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer">
                                <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Ver inventario completo</span>
                              </button>
                            </Link>
                          </div>
                        )}

                        {isBot && m.type === 'product_created_card' && m.productDetail && (
                          <div className="mt-4 space-y-2">
                            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-4 flex items-center justify-between gap-4">
                              <div className="flex items-start gap-4 min-w-0">
                                <img 
                                  src={m.productDetail.image} 
                                  alt={m.productDetail.name} 
                                  className="w-16 h-16 rounded-lg object-cover border border-zinc-200 bg-white shrink-0" 
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-zinc-955 text-sm">{m.productDetail.name}</h5>
                                    <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] rounded-full text-[9px] font-black uppercase tracking-wider">
                                      {m.productDetail.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-1.5">{m.productDetail.category}</p>
                                  <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 pr-2">{m.productDetail.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0 text-right">
                                <span className="font-black text-zinc-955 text-sm xl:text-base">{m.productDetail.price}</span>
                                <span className="text-[11px] font-semibold text-zinc-400 mt-1.5">{m.productDetail.stock}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {isBot && m.type === 'discount_card' && m.coupon && (
                          <div className="mt-4 space-y-2">
                            <div className="bg-emerald-50/30 border border-emerald-100/60 rounded-lg p-3 flex items-center justify-between gap-3 text-left">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="px-2 py-1 bg-emerald-100 border border-emerald-250 rounded-lg text-emerald-800 font-black text-xs shrink-0">
                                  {m.coupon.code}
                                </span>
                                <div className="min-w-0">
                                  <h5 className="font-bold text-zinc-900 truncate text-xs xl:text-sm leading-tight">{m.coupon.desc}</h5>
                                  <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">{m.coupon.validity}</p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black shrink-0 tracking-wide">
                                • Activo
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link href="/descuentos" className="flex-1">
                                <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none cursor-pointer select-none">
                                  Ver descuento
                                </button>
                              </Link>
                              <button onClick={() => toast.success('Enlace de cupón copiado')} className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                Copiar cupón
                              </button>
                            </div>
                          </div>
                        )}

                        {isBot && m.type === 'product_updated' && m.action?.payload?.product && (() => {
                          const prod = m.action.payload.product as any
                          return (
                            <div className="mt-4 space-y-2">
                              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">
                                    Producto Actualizado: {prod.name || ''}
                                  </h5>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="bg-white border border-zinc-150 p-2.5 rounded-lg flex flex-col shadow-sm">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase leading-none">Precio</span>
                                    <span className="font-bold text-zinc-850 mt-1.5 flex items-center gap-1.5">
                                      {prod.oldPrice !== prod.newPrice ? (
                                        <>
                                          <span className="line-through text-zinc-400 font-semibold">${prod.oldPrice?.toLocaleString('es-CO') ?? '0'}</span>
                                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                          <span className="text-emerald-700 font-extrabold">${prod.newPrice?.toLocaleString('es-CO') ?? '0'}</span>
                                        </>
                                      ) : (
                                        <span>${prod.newPrice?.toLocaleString('es-CO') ?? '0'}</span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="bg-white border border-zinc-150 p-2.5 rounded-lg flex flex-col shadow-sm">
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase leading-none">Inventario</span>
                                    <span className="font-bold text-zinc-850 mt-1.5 flex items-center gap-1.5">
                                      {prod.oldStock !== prod.newStock ? (
                                        <>
                                          <span className="line-through text-zinc-400 font-semibold">{prod.oldStock ?? '0'}</span>
                                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                          <span className="text-blue-700 font-extrabold">{prod.newStock ?? '0'} uds</span>
                                        </>
                                      ) : (
                                        <span>{prod.newStock ?? '0'} uds</span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-200/60 pt-2.5 mt-1 select-none">
                                  <span>Estado en la tienda:</span>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    prod.newActive ? "bg-emerald-50 text-emerald-700 border border-emerald-250" : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                                  )}>
                                    {prod.newActive ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                              <Link href="/productos" className="block w-full">
                                <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                  <span>Gestionar en Catálogo</span>
                                </button>
                              </Link>
                            </div>
                          </div>
                        )
                      })()}

                        {isBot && m.type === 'order_status_updated' && m.action?.payload?.order && (
                          <div className="mt-4 space-y-2">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">
                                  Orden #{m.action.payload.order.id.slice(-6)}
                                </h5>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                  m.action.payload.order.newStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  m.action.payload.order.newStatus === 'ready' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  m.action.payload.order.newStatus === 'preparing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  m.action.payload.order.newStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-zinc-50 text-zinc-600 border-zinc-200'
                                )}>
                                  {m.action.payload.order.newStatus}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-600">
                                Cliente: <span className="font-bold text-zinc-800">{m.action.payload.order.customerName}</span>
                              </p>
                              <p className="text-xs text-zinc-650 mt-1 leading-none font-semibold">
                                Total: <span className="font-bold text-zinc-900">${m.action.payload.order.total.toLocaleString('es-CO')}</span>
                              </p>
                              
                              {m.action.payload.order.adminComment && (
                                <div className="bg-white border border-zinc-150 p-2.5 rounded-lg text-xs italic text-zinc-500">
                                  Nota: "{m.action.payload.order.adminComment}"
                                </div>
                              )}
                            </div>
                            <Link href="/pedidos" className="block w-full">
                              <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                <span>Ver listado de pedidos</span>
                              </button>
                            </Link>
                          </div>
                        )}

                        {isBot && m.type === 'orders_list' && m.action?.payload?.orders && (
                          <div className="mt-4 space-y-2">
                            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-1.5 space-y-1.5">
                              {m.action.payload.orders.map((order, idx: number) => (
                                <div key={order.id} className="p-3 flex items-center justify-between bg-white rounded-lg border border-zinc-100 shadow-sm">
                                  <div className="flex flex-col text-left min-w-0">
                                    <h5 className="font-bold text-zinc-900 truncate text-xs">
                                      #{order.id.slice(-6)} - {order.customerName}
                                    </h5>
                                    <span className="text-[10px] text-zinc-400 mt-1 leading-none font-semibold">
                                      {order.city} | Pago: {order.paymentStatus}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0 text-right">
                                    <span className="font-bold text-zinc-850 text-xs">${order.total.toLocaleString('es-CO')}</span>
                                    <span className={cn(
                                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase mt-1",
                                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                      order.status === 'ready' ? 'bg-blue-50 text-blue-700' :
                                      order.status === 'preparing' ? 'bg-amber-50 text-amber-700' :
                                      order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                      'bg-zinc-50 text-zinc-500'
                                    )}>
                                      {order.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Link href="/pedidos" className="block w-full">
                              <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                <span>Administrar Pedidos Completo</span>
                              </button>
                            </Link>
                          </div>
                        )}

                        {isBot && m.type === 'sales_metrics' && m.action?.payload?.metrics && (
                          <div className="mt-4 space-y-2">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-4">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">Rendimiento Comercial</h5>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-white border border-zinc-150 p-2 rounded-lg flex flex-col text-center shadow-sm">
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Ventas</span>
                                  <span className="font-black text-emerald-700 text-[11px] xl:text-xs mt-1.5 leading-none">
                                    ${m.action.payload.metrics.totalSales.toLocaleString('es-CO')}
                                  </span>
                                </div>
                                <div className="bg-white border border-zinc-150 p-2 rounded-lg flex flex-col text-center shadow-sm">
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Pedidos</span>
                                  <span className="font-black text-zinc-850 text-[11px] xl:text-xs mt-1.5 leading-none">
                                    {m.action.payload.metrics.totalOrders}
                                  </span>
                                </div>
                                <div className="bg-white border border-zinc-150 p-2 rounded-lg flex flex-col text-center shadow-sm">
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Ticket Prom.</span>
                                  <span className="font-black text-blue-700 text-[11px] xl:text-xs mt-1.5 leading-none">
                                    ${m.action.payload.metrics.avgTicket.toLocaleString('es-CO')}
                                  </span>
                                </div>
                              </div>
                              
                              {m.action.payload.metrics.topProducts && m.action.payload.metrics.topProducts.length > 0 && (
                                <div className="space-y-1.5 text-left border-t border-zinc-200/60 pt-3">
                                  <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider select-none">Productos más vendidos</span>
                                  {m.action.payload.metrics.topProducts.map((p, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-xs font-semibold text-zinc-700 py-0.5">
                                      <span className="truncate pr-4">{idx+1}. {p.name}</span>
                                      <span className="shrink-0 text-zinc-500">{p.qty} uds (${p.sales.toLocaleString('es-CO')})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Link href="/dashboard" className="block w-full">
                              <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                <span>Ver Gráficas en el Dashboard</span>
                              </button>
                            </Link>
                          </div>
                        )}

                        {isBot && m.type === 'customer_chat' && m.action?.payload && (
                          <div className="mt-4 space-y-2">
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">
                                  Chat con {m.action.payload.customerName}
                                </h5>
                                <span className="text-[9px] font-black text-zinc-405 uppercase tracking-wider select-none">
                                  Paso: {m.action.payload.step}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-1 select-none">
                                Asignado a: <span className="font-bold text-zinc-700">{m.action.payload.assignedTo}</span> | Tel: <span className="font-bold text-zinc-700">{m.action.payload.phoneNumber}</span>
                              </p>
                              
                              <div className="border border-zinc-200 bg-white rounded-lg p-2.5 max-h-40 overflow-y-auto space-y-2 flex flex-col text-xs scrollbar-none mt-2 select-text">
                                {m.action.payload.chatHistory && m.action.payload.chatHistory.length > 0 ? (
                                  m.action.payload.chatHistory.map((chat, idx: number) => {
                                    const isCustomer = chat.sender === 'user'
                                    return (
                                      <div key={idx} className={cn(
                                        "p-2 rounded-lg max-w-[85%] text-left",
                                        isCustomer 
                                          ? "bg-zinc-150 text-zinc-850 mr-auto" 
                                          : "bg-[#EEFDF7] text-[#065F46] ml-auto border border-[#A7F3D0]"
                                      )}>
                                        <p className="font-black text-[8px] uppercase opacity-65 mb-0.5 leading-none select-none">
                                          {isCustomer ? 'Cliente' : 'Bot'}
                                        </p>
                                        <p className="font-medium leading-normal">{chat.text}</p>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <p className="text-zinc-400 text-center py-4 select-none">No hay historial reciente de mensajes.</p>
                                )}
                              </div>
                            </div>
                            <Link href="/conversaciones" className="block w-full">
                              <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
                                <span>Ver en Bandeja de Entrada</span>
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                      {isBot && (
                        <div className="flex items-center gap-3 pl-1 pt-1.5 select-none opacity-60 hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(m.text)
                              toast.success('Mensaje copiado al portapapeles')
                            }} 
                            className="text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer" 
                            title="Copiar mensaje"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toast.success('Gracias por tu feedback')} className="text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer" title="Me gusta">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toast.success('Gracias por tu feedback')} className="text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer" title="No me gusta">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {isTyping && (
                <div className="flex gap-4 items-start w-full text-left animate-in fade-in duration-300 py-2">
                  <div className="shrink-0 select-none mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center text-zinc-500 shadow-sm">
                      <Bot className="w-4.5 h-4.5 stroke-[2px]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {/* Minimalist Spinner */}
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 border-t-zinc-500 animate-spin shrink-0" />
                    <span className="text-xs font-semibold text-zinc-400 select-none animate-pulse">
                      Nova está pensando...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="w-full max-w-2xl mx-auto px-4 py-3 bg-white shrink-0 select-none border-t border-zinc-100/60 relative">
          {showSlashCommands && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-30 divide-y divide-zinc-100 animate-in slide-in-from-bottom-2 duration-150">
              {[
                { cmd: '/pedidos', desc: 'Ver pedidos recientes de la tienda' },
                { cmd: '/ventas', desc: 'Ver reporte de rendimiento de ventas' },
                { cmd: '/buscar ', desc: 'Buscar un producto' },
                { cmd: '/descuento', desc: 'Crear un cupón de promoción' },
                { cmd: '/pausar-bot', desc: 'Desactivar bot de WhatsApp' },
                { cmd: '/activar-bot', desc: 'Activar bot de WhatsApp' }
              ].filter(c => c.cmd.toLowerCase().startsWith(inputText.toLowerCase())).map((c) => (
                <button
                  key={c.cmd}
                  onClick={() => {
                    setInputText(c.cmd)
                    setShowSlashCommands(false)
                    textareaRef.current?.focus()
                  }}
                  className="w-full px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between text-left text-xs font-bold text-zinc-700 hover:text-zinc-955 transition-colors cursor-pointer"
                >
                  <span className="font-extrabold text-[#065F46] bg-[#EEFDF7] px-1.5 py-0.5 rounded border border-[#A7F3D0]">{c.cmd}</span>
                  <span className="text-zinc-400 font-semibold">{c.desc}</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="relative flex items-end gap-3 bg-[#F4F4F4] border border-zinc-200/65 rounded-[24px] px-4 py-3.5 focus-within:border-zinc-350 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
            <button 
              onClick={() => toast.info('Cargar archivos estará disponible en la versión final')}
              className="w-8 h-8 rounded-full bg-transparent hover:bg-zinc-200/50 border border-zinc-300 text-zinc-505 flex items-center justify-center transition-colors shrink-0 cursor-pointer mb-0.5"
              title="Adjuntar archivo"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
            <textarea 
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(inputText)
                }
              }}
              rows={1}
              placeholder="Preguntar lo que quieras"
              className="flex-1 bg-transparent border-none focus:outline-none resize-none text-sm font-semibold text-zinc-800 placeholder-zinc-400 py-1.5 select-text scrollbar-none min-h-[24px] max-h-[200px]"
            />
            <div className="flex items-center gap-2 shrink-0 mb-0.5">
              <button 
                onClick={() => toast.info('Entrada de voz próximamente')}
                className="p-1.5 text-zinc-400 hover:text-zinc-650 hover:bg-zinc-200/50 rounded-full transition-colors cursor-pointer"
                title="Entrada de voz"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => toast.info('Modo de voz en tiempo real próximamente')}
                className="p-1.5 text-zinc-400 hover:text-zinc-650 hover:bg-zinc-200/50 rounded-full transition-colors cursor-pointer"
                title="Modo de voz"
              >
                <Waves className="w-4.5 h-4.5" />
              </button>
              {inputText.trim() && (
                <button 
                  onClick={() => handleSend(inputText)}
                  disabled={isTyping}
                  className="w-8 h-8 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer ml-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-2">
            Nova puede cometer errores. Considera verificar la información importante.
          </p>
        </footer>
      </div>

      {showMemoryModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white border border-zinc-200 rounded-lg max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 leading-none">Memoria de Nova</h3>
                <p className="text-[10px] font-medium text-zinc-405 mt-1.5 leading-none">Contexto operativo y base de conocimientos activa</p>
              </div>
              <button 
                onClick={() => setShowMemoryModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-5 text-left select-text">
              <div className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-lg text-[11px] font-semibold text-indigo-700 leading-normal">
                🤖 Nova utiliza la información en tiempo real de tu base de datos y canales integrados para entender el contexto de tu negocio de forma automática.
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider select-none">Contexto de la Tienda</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-lg flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">Tienda</span>
                    <span className="text-xs font-bold text-zinc-800 mt-1 block truncate leading-none">{store.name}</span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-lg flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">Plan Actual</span>
                    <span className="text-xs font-bold text-zinc-800 mt-1 block truncate leading-none">
                      {store.verificationLevel === 0 ? 'Básico' : 'Pro'}
                    </span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-lg flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">WhatsApp</span>
                    <span className={cn(
                      "text-xs font-bold mt-1 block leading-none",
                      store.whatsappConnected ? "text-emerald-700 font-extrabold" : "text-zinc-500"
                    )}>
                      {store.whatsappConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-150 p-3 rounded-lg flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase leading-none">Pagos MP</span>
                    <span className={cn(
                      "text-xs font-bold mt-1 block leading-none",
                      store.mpConnected ? "text-blue-700 font-extrabold" : "text-zinc-500"
                    )}>
                      {store.mpConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider select-none">Actividad de tu Negocio</h4>
                <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                      <span className="truncate text-zinc-800">{activeProductsCount} productos activos</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0 select-none">Inventario</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                      <span className="truncate text-zinc-800">{ordersCount} pedidos registrados</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0 select-none">Ventas</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
                      <span className="truncate text-zinc-800">{activeChatsCount} chats de clientes</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0 select-none">Mensajería</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider select-none">Herramientas Asociadas</h4>
                <div className="divide-y divide-zinc-100 bg-white border border-zinc-200 rounded-lg overflow-hidden">
                  {[
                    { label: 'Gestionar productos', href: '/productos' },
                    { label: 'Ver pedidos y ventas', href: '/pedidos' },
                    { label: 'Crear descuentos', href: '/descuentos' },
                    { label: 'Configurar tienda', href: '/tienda' },
                    { label: 'Respuestas automáticas', href: '/automatizaciones' }
                  ].map((tool, idx) => (
                    <Link 
                      key={idx}
                      href={tool.href}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-955 transition-colors group text-xs font-bold"
                    >
                      <span>{tool.label}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-zinc-100 flex justify-end bg-zinc-50/50 select-none">
              <button 
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
