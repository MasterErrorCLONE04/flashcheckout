'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { AgentItem, ChatSessionItem, Message } from './types'
import { AGENTS, DEMO_SESSIONS } from './constants'

export function useNovaChatState(initialSessions: ChatSessionItem[] = []) {
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showSlashCommands, setShowSlashCommands] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentItem>(AGENTS[0])
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
      mainEl.classList.remove('px-4', 'md:px-8', 'pb-8', 'pb-24', 'md:pb-12', 'lg:pb-12', 'pt-4', 'md:pt-6', 'lg:pl-12')
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

  return {
    inputText,
    setInputText,
    isTyping,
    showMemoryModal,
    setShowMemoryModal,
    messagesEndRef,
    textareaRef,
    showSlashCommands,
    setShowSlashCommands,
    selectedAgent,
    setSelectedAgent,
    showAgentDropdown,
    setShowAgentDropdown,
    sessions,
    activeSessionId,
    messages,
    handleSelectSession,
    handleNewChat,
    handleDeleteSession,
    handleSend,
    handleSuggestionClick
  }
}

export type NovaChatState = ReturnType<typeof useNovaChatState>
