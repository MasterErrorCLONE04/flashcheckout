'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Bot,
  Send,
  MessageCircle,
  ShieldAlert,
  Star,
  Tag,
  CheckCircle,
  MoreVertical,
  Paperclip,
  Smile,
  Lock,
  Copy,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Zap,
  Package,
  Check,
  Loader2,
  Wifi
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Message = {
  sender: 'user' | 'bot'
  text: string
  time: string
}

type SessionNote = {
  id: string
  text: string
  createdAt: string
  author: string
}

type ChatSession = {
  id: string
  phoneNumber: string
  customerName: string
  avatarUrl: string | null
  lastInteraction: string
  step: string
  messages: Message[]
}

type ChatSessionExtended = ChatSession & {
  tags: string[]
  notes: SessionNote[]
  assignedTo: string
  isFavorite: boolean
  status: 'active' | 'closed'
}

type CustomerDetails = {
  orders: Array<{ id: string; total: number; status: string; createdAt: string }>
  totalSpent: number
  ordersCount: number
  cartItems: Array<{ name: string; qty: number; price: number }>
  firstInteractionDate: string
}

type ChatSessionInit = ChatSession & Partial<Pick<ChatSessionExtended, 'tags' | 'notes' | 'assignedTo' | 'isFavorite' | 'status'>>

type SessionUpdateData = Partial<Pick<ChatSessionExtended, 'tags' | 'notes' | 'assignedTo' | 'isFavorite' | 'status'>>

type SessionAction = {
  type: string
  payload?: {
    products?: Array<{ name: string; stock: number; category?: string; active?: boolean; price: number }>
    product?: {
      name: string
      price: number
      stock: number
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
    order?: unknown
    metrics?: unknown
    customerName?: string
  }
}

export default function ChatHistoryViewer({
  initialSessions,
  whatsappConnected,
}: {
  initialSessions: ChatSessionInit[]
  whatsappConnected: boolean
}) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(whatsappConnected)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [qrCodeText, setQrCodeText] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [pollingStatus, setPollingStatus] = useState(false)

  useEffect(() => {
    if (isConnected) return

    async function initWhatsAppConnection() {
      setLoadingQr(true)
      try {
        const statusRes = await fetch('/api/whatsapp/instance')
        if (statusRes.ok) {
          const data = await statusRes.json()
          if (data.status === 'CONNECTED') {
            setIsConnected(true)
            toast.success("¡WhatsApp conectado!")
            return
          } else if (data.status === 'QRCODE') {
            setQrCodeBase64(data.base64 || null)
            setQrCodeText(data.code || null)
            setPollingStatus(true)
            setLoadingQr(false)
            return
          }
        }

        const connectRes = await fetch('/api/whatsapp/instance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'connect' })
        })
        if (connectRes.ok) {
          const data = await connectRes.json()
          if (data.status === 'CONNECTED') {
            setIsConnected(true)
          } else {
            setQrCodeBase64(data.base64 || null)
            setQrCodeText(data.code || null)
            setPollingStatus(true)
          }
        }
      } catch (err) {
        console.error("Error checking/generating WhatsApp connection QR:", err)
      } finally {
        setLoadingQr(false)
      }
    }

    initWhatsAppConnection()
  }, [isConnected])

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    if (pollingStatus && !isConnected) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch('/api/whatsapp/instance')
          if (res.ok) {
            const data = await res.json()
            if (data.status === 'CONNECTED') {
              setIsConnected(true)
              setQrCodeBase64(null)
              setPollingStatus(false)
              toast.success("¡WhatsApp enlazado con éxito! ✅", {
                description: "Tu número celular ahora está vinculado a FlashCheckout y respondiendo de forma automática."
              })
              router.refresh()
            } else if (data.status === 'QRCODE') {
              if (data.base64 && data.base64 !== qrCodeBase64) {
                setQrCodeBase64(data.base64)
                setQrCodeText(data.code)
              }
            }
          }
        } catch (err) {
          console.error("Error polling WhatsApp QR connection status:", err)
        }
      }, 3000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [pollingStatus, isConnected, qrCodeBase64, router])

  const [sessions, setSessions] = useState<ChatSessionExtended[]>(() =>
    initialSessions.map((s) => ({
      ...s,
      tags: s.tags || [],
      notes: s.notes || [],
      assignedTo: s.assignedTo || 'Tú',
      isFavorite: s.isFavorite ?? false,
      status: s.status || 'active'
    }))
  )

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessions.length > 0 ? sessions[0].id : null
  )
  const [takeoverText, setTakeoverText] = useState('')
  const [disconnecting, setDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que deseas desconectar WhatsApp? Se detendrán las respuestas automáticas del bot.')) {
      return
    }

    setDisconnecting(true)
    const loadToast = toast.loading('Desconectando WhatsApp...')
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Fallo al desconectar')
      
      setIsConnected(false)
      setQrCodeBase64(null)
      setPollingStatus(false)
      toast.success('WhatsApp desconectado correctamente', { id: loadToast })
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al desconectar WhatsApp', { id: loadToast })
    } finally {
      setDisconnecting(false)
    }
  }

  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'assigned' | 'unassigned'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [composerTab, setComposerTab] = useState<'reply' | 'note'>('reply')

  // Note state
  const [newNoteText, setNewNoteText] = useState('')

  // Tag state
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTagText, setNewTagText] = useState('')

  // Customer details loaded dynamically
  const [activeDetails, setActiveDetails] = useState<CustomerDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const itemsPerPage = 8
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch active details from backend when switching sessions
  useEffect(() => {
    if (!activeSessionId) {
      setActiveDetails(null)
      return
    }
    setDetailsLoading(true)
    fetch(`/api/whatsapp/session?sessionId=${activeSessionId}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: CustomerDetails) => {
        setActiveDetails(data)
      })
      .catch(() => {
        toast.error('No se pudieron cargar los detalles del cliente')
      })
      .finally(() => {
        setDetailsLoading(false)
      })
  }, [activeSessionId])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  // Tab counts
  const totalCount = sessions.length
  const unreadCount = sessions.filter(s => s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user').length
  const assignedCount = sessions.filter(s => s.assignedTo === 'Tú').length
  const unassignedCount = sessions.filter(s => s.assignedTo !== 'Tú' && s.assignedTo !== 'Bot de IA').length

  // Filter conversations
  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phoneNumber.includes(searchQuery) ||
      s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user') ||
      (activeTab === 'assigned' && s.assignedTo === 'Tú') ||
      (activeTab === 'unassigned' && s.assignedTo !== 'Tú' && s.assignedTo !== 'Bot de IA')

    return matchesSearch && matchesTab
  })

  // Pagination
  const totalPages = Math.max(Math.ceil(filteredSessions.length / itemsPerPage), 1)
  const currentSessions = filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const persistSessionUpdate = async (sessionId: string, data: SessionUpdateData) => {
    try {
      const res = await fetch('/api/whatsapp/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...data })
      })
      if (!res.ok) throw new Error()
    } catch {
      toast.error('Error al persistir cambios en el servidor')
    }
  }

  const toggleFavorite = async (id: string) => {
    const session = sessions.find(s => s.id === id)
    if (!session) return
    const nextVal = !session.isFavorite
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isFavorite: nextVal } : s))
    toast.success(nextVal ? 'Marcado como favorito' : 'Quitado de favoritos')
    await persistSessionUpdate(id, { isFavorite: nextVal })
  }

  const toggleStatus = async (id: string) => {
    const session = sessions.find(s => s.id === id)
    if (!session) return
    const nextVal = session.status === 'active' ? 'closed' : 'active'
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: nextVal } : s))
    toast.success(nextVal === 'closed' ? 'Conversación cerrada' : 'Conversación reabierta')
    await persistSessionUpdate(id, { status: nextVal })
  }

  const handleAssigneeChange = async (id: string, assignee: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, assignedTo: assignee } : s))
    toast.success(`Asignado a: ${assignee}`)
    await persistSessionUpdate(id, { assignedTo: assignee })
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim() || !activeSessionId || !activeSession) return
    const text = newNoteText.trim()
    setNewNoteText('')

    const newNote: SessionNote = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Tú'
    }

    const updatedNotes = [...activeSession.notes, newNote]
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, notes: updatedNotes } : s))
    toast.success('Nota interna guardada')
    await persistSessionUpdate(activeSessionId, { notes: updatedNotes })
  }

  const handleDeleteNote = async (sessionId: string, noteId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return
    const updatedNotes = session.notes.filter(n => n.id !== noteId)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, notes: updatedNotes } : s))
    toast.success('Nota eliminada')
    await persistSessionUpdate(sessionId, { notes: updatedNotes })
  }

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagText.trim() || !activeSessionId || !activeSession) return
    const tag = newTagText.trim()
    setNewTagText('')
    setShowAddTag(false)

    if (activeSession.tags.includes(tag)) return
    const updatedTags = [...activeSession.tags, tag]
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, tags: updatedTags } : s))
    toast.success(`Etiqueta "${tag}" agregada`)
    await persistSessionUpdate(activeSessionId, { tags: updatedTags })
  }

  const handleRemoveTag = async (sessionId: string, tag: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return
    const updatedTags = session.tags.filter(t => t !== tag)
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, tags: updatedTags } : s))
    toast.success(`Etiqueta "${tag}" eliminada`)
    await persistSessionUpdate(sessionId, { tags: updatedTags })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Número copiado')
  }

  const exportChats = () => {
    const headers = ['ID Sesión', 'Cliente', 'WhatsApp', 'Última interacción', 'Estado', 'Mensajes']
    const rows = sessions.map(s => [
      s.id,
      s.customerName,
      s.phoneNumber,
      new Date(s.lastInteraction).toLocaleString('es-CO'),
      s.status === 'active' ? 'Activa' : 'Cerrada',
      s.messages.map(m => `[${m.time} - ${m.sender === 'user' ? 'Cliente' : 'Asesor'}]: ${m.text}`).join(' || ')
    ])

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Chats_Export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Conversaciones exportadas en CSV')
  }

  const handleTakeover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!takeoverText.trim() || !activeSessionId || sending) return
    const newMsg = takeoverText.trim()
    setTakeoverText('')
    setSending(true)

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, { sender: 'bot', text: '[Asesor Humano]: ' + newMsg, time: timeNow }]
        }
      }
      return s
    }))

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId, text: newMsg })
      })
      if (!res.ok) throw new Error()
      toast.success('Mensaje enviado')
    } catch {
      toast.error('Error al enviar el mensaje por WhatsApp')
    } finally {
      setSending(false)
    }
  }

  const handleSendPaymentLink = async () => {
    if (!activeSessionId) return
    const loadingToast = toast.loading('Generando y enviando link de pago...')
    try {
      const res = await fetch('/api/whatsapp/session/send-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSessionId })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send payment link')
      }
      toast.success('Link de pago enviado correctamente por WhatsApp', { id: loadingToast })
      
      // Update sidebar details and list
      const resDetails = await fetch(`/api/whatsapp/session?sessionId=${activeSessionId}`)
      const detailsData = (await resDetails.json()) as CustomerDetails
      setActiveDetails(detailsData)
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar link de pago', { id: loadingToast })
    }
  }

  function renderMessageText(text: string) {
    if (text.startsWith('[PRODUCT_CARD]')) {
      const parts = text.replace('[PRODUCT_CARD] ', '').split(' | ')
      const title = parts[0] || 'Producto'
      const price = parts[1] || '$0'
      const desc = parts[2] || ''
      return (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden mt-1 max-w-xs text-zinc-955 font-semibold p-0.5">
          <div className="w-full h-24 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center relative p-3">
            <Package className="w-6 h-6 text-zinc-400" />
            <span className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase select-none">
              Bot
            </span>
          </div>
          <div className="p-3 space-y-1">
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-bold text-xs truncate max-w-[130px]">{title}</span>
              <span className="text-[10px] font-extrabold text-emerald-600 tabular-nums shrink-0">{price}</span>
            </div>
            {desc && <p className="text-[9px] text-zinc-400 font-medium leading-relaxed truncate">{desc}</p>}
            <button
              onClick={() => toast.success(`Abriendo enlace de: ${title}`)}
              className="w-full text-center py-1.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-[9px] font-bold text-zinc-655 transition-colors uppercase tracking-widest mt-2 cursor-pointer h-7 flex items-center justify-center"
            >
              Ver producto
            </button>
          </div>
        </div>
      )
    }

    if (text.startsWith('[Link de Pago Enviado]')) {
      const parts = text.split('\n')
      const amount = parts[0]?.replace('[Link de Pago Enviado]: ', '') || ''
      const url = parts[1] || '#'
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden mt-1 max-w-xs text-emerald-955 p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-xs">Link de Pago Generado</span>
          </div>
          <p className="text-[10px] text-emerald-805 font-semibold leading-relaxed">
            Se ha enviado un link de pago por valor de <strong className="text-emerald-955">{amount}</strong>.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold transition-all block"
          >
            PAGAR AHORA
          </a>
        </div>
      )
    }

    const isHumanTakeover = text.startsWith('[Asesor Humano]')
    const cleanText = isHumanTakeover ? text.replace('[Asesor Humano]: ', '') : text

    return (
      <div className="space-y-1">
        {isHumanTakeover && (
          <span className="block text-[8px] opacity-75 font-black tracking-wider leading-none text-zinc-400">
            Intervención Humana
          </span>
        )}
        <p className="leading-relaxed break-words font-semibold text-zinc-800">{cleanText}</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-6 pb-12 font-sans text-left">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Conversaciones</h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Esperando conexión de WhatsApp...
            </div>
          </div>
        </div>

        {/* CONNECTION CARD */}
        <div className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] mt-8 select-none">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Left side: QR Code container */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center">
              <div className="relative aspect-square w-64 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-center p-6 shadow-inner">
                {loadingQr ? (
                  <div className="flex flex-col items-center gap-2.5">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Generando QR...</span>
                  </div>
                ) : qrCodeBase64 ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                      src={qrCodeBase64} 
                      alt="WhatsApp QR Code" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px] rounded-xl pointer-events-none" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <Wifi className="w-8 h-8 text-zinc-350 animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Sin señal de QR</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Actualización automática en tiempo real</span>
              </div>
            </div>

            {/* Right side: Instructions */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-md text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                  <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 animate-bounce" />
                  Conexión Requerida
                </div>
                <h2 className="text-xl font-extrabold text-zinc-900 leading-tight">Vincular tu cuenta de WhatsApp</h2>
                <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                  Para visualizar, gestionar y responder las conversaciones de tus clientes mediante Inteligencia Artificial o de forma manual, vincula tu número telefónico.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { step: "1", text: "Abre WhatsApp en tu teléfono celular." },
                  { step: "2", text: "Toca Dispositivos vinculados en el menú de Configuración." },
                  { step: "3", text: "Selecciona Vincular un dispositivo y escanea el código QR de la izquierda." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-700 shrink-0">
                      {item.step}
                    </div>
                    <p className="text-xs font-bold text-zinc-650 pt-0.5 leading-normal">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-zinc-400">
                  ¿Problemas con el código? Si tarda en cargar, intenta regenerar.
                </p>
                <button
                  onClick={async () => {
                    setLoadingQr(true)
                    try {
                      await fetch('/api/whatsapp/instance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'connect' })
                      })
                      const res = await fetch('/api/whatsapp/instance')
                      const data = await res.json()
                      if (data.status === 'CONNECTED') {
                        setIsConnected(true)
                      } else {
                        setQrCodeBase64(data.base64 || null)
                        setQrCodeText(data.code || null)
                        setPollingStatus(true)
                      }
                    } catch (e) {
                      toast.error("Error al regenerar código QR")
                    } finally {
                      setLoadingQr(false)
                    }
                  }}
                  className="w-full h-9 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Regenerar Código QR
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Conversaciones</h1>
          <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gestiona y responde todas tus conversaciones.
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={exportChats}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-semibold text-zinc-755 transition-all cursor-pointer select-none"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Exportar conversaciones</span>
          </button>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-350 rounded-lg text-xs font-bold text-rose-600 transition-all cursor-pointer select-none disabled:opacity-50 active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Desconectar WhatsApp</span>
          </button>
        </div>
      </div>

      {/* THREE-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN 1: CONVERSATIONS LIST PANEL */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between h-[680px]">
          
          <div className="p-4 space-y-4">
            
            {/* Filter Tabs */}
            <div className="flex gap-1 pb-1 overflow-x-auto border-b border-zinc-100 text-[10px] font-bold text-zinc-500">
              <button 
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={cn(
                  "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
                  activeTab === 'all' ? "text-emerald-600" : "hover:text-zinc-950"
                )}
              >
                Todas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{totalCount}</span>
                {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
              </button>

              <button 
                onClick={() => { setActiveTab('unread'); setCurrentPage(1); }}
                className={cn(
                  "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
                  activeTab === 'unread' ? "text-emerald-600" : "hover:text-zinc-955"
                )}
              >
                No leídas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{unreadCount}</span>
                {activeTab === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
              </button>

              <button 
                onClick={() => { setActiveTab('assigned'); setCurrentPage(1); }}
                className={cn(
                  "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
                  activeTab === 'assigned' ? "text-emerald-600" : "hover:text-zinc-955"
                )}
              >
                Asignadas <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{assignedCount}</span>
                {activeTab === 'assigned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
              </button>

              <button 
                onClick={() => { setActiveTab('unassigned'); setCurrentPage(1); }}
                className={cn(
                  "pb-2 px-1 relative transition-colors shrink-0 cursor-pointer",
                  activeTab === 'unassigned' ? "text-emerald-600" : "hover:text-zinc-955"
                )}
              >
                Sin asignar <span className="text-[9px] font-semibold text-zinc-400 ml-0.5 bg-zinc-100 px-1.5 py-0.2 rounded-full">{unassignedCount}</span>
                {activeTab === 'unassigned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
              </button>
            </div>

            {/* Search conversations */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar conversación..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg text-xs font-semibold outline-none transition-all placeholder:text-zinc-400"
                />
              </div>
              <button className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors shrink-0 cursor-pointer">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Conversations list container */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 custom-scrollbar pr-0.5">
            {currentSessions.length === 0 ? (
              <div className="py-20 text-center text-zinc-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
                <p className="font-semibold text-xs leading-relaxed">No hay conversaciones</p>
              </div>
            ) : (
              currentSessions.map(s => {
                const isSelected = s.id === activeSessionId
                const lastMsgObj = s.messages[s.messages.length - 1]
                let lastMsg = lastMsgObj ? lastMsgObj.text : 'Conversación iniciada'
                if (lastMsg.startsWith('[PRODUCT_CARD]')) {
                  const parts = lastMsg.replace('[PRODUCT_CARD] ', '').split(' | ')
                  lastMsg = `Tarjeta de producto: ${parts[0] || 'Producto'}`
                } else if (lastMsg.startsWith('[Link de Pago Enviado]')) {
                  lastMsg = 'Link de Pago Enviado 🛒'
                }
                const lastTime = lastMsgObj ? lastMsgObj.time : '10:00'
                const isUnread = s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user'

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id)
                      setNewNoteText('')
                      setNewTagText('')
                      setShowAddTag(false)
                    }}
                    className={cn(
                      "w-full text-left p-4 hover:bg-zinc-50 transition-colors flex items-start gap-3 relative group/session",
                      isSelected && "bg-zinc-50"
                    )}
                  >
                    {/* Profile image with WhatsApp Badge */}
                    <div className="relative shrink-0 select-none">
                      {s.avatarUrl ? (
                        <img 
                          src={s.avatarUrl} 
                          alt={s.customerName}
                          className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border border-zinc-200"
                        />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-extrabold text-zinc-650 flex items-center justify-center uppercase">
                          {s.customerName.slice(0, 2)}
                        </div>
                      )}
                      {/* superposed WhatsApp icon */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white p-0.5">
                        <MessageCircle className="w-2.5 h-2.5 fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-zinc-950 text-xs truncate leading-tight">{s.customerName}</span>
                          {s.status === 'closed' && (
                            <Lock className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-400 tabular-nums font-bold shrink-0">{lastTime}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate font-semibold">{lastMsg}</p>
                    </div>

                    {/* Unread dot indicator */}
                    {isUnread && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-extrabold flex items-center justify-center shrink-0 ml-1.5 self-center">
                        {s.messages.filter(m => m.sender === 'user').length}
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Paginated Footer */}
          {filteredSessions.length > 0 && (
            <div className="bg-white border-t border-zinc-100 p-3.5 flex items-center justify-between text-[10px] font-semibold text-zinc-400">
              <span>Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSessions.length)} de {filteredSessions.length}</span>
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-5.5 h-5.5 rounded border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={cn(
                      "w-5.5 h-5.5 rounded text-[9px] flex items-center justify-center transition-all cursor-pointer",
                      currentPage === idx + 1 ? "bg-zinc-950 text-white font-bold" : "border border-zinc-200 text-zinc-500"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-5.5 h-5.5 rounded border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: CONVERSATION DIALOG CHAT WINDOW */}
        <div className="lg:col-span-8 xl:col-span-6 bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between h-[680px] relative">
          {activeSession ? (
            <>
              {/* Header section with assignee and toolbar */}
              <div className="bg-white border-b border-zinc-100 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Circular profile image placeholder */}
                  <div className="relative select-none">
                    {activeSession.avatarUrl ? (
                      <img 
                        src={activeSession.avatarUrl} 
                        alt={activeSession.customerName}
                        className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border border-zinc-200"
                      />
                    ) : (
                      <div className="w-8.5 h-8.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-extrabold text-zinc-650 flex items-center justify-center uppercase">
                        {activeSession.customerName.slice(0, 2)}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white flex items-center justify-center" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-zinc-950 leading-none">{activeSession.customerName}</h4>
                      <span className="text-emerald-500 flex items-center shrink-0">
                        <Check className="w-3 h-3 text-white bg-emerald-500 rounded-full p-0.5" />
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold select-all">+{activeSession.phoneNumber}</span>
                    </div>
                    
                    {/* Assignment Selector Dropdown */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-400 font-semibold">Asignado a:</span>
                      <select
                        value={activeSession.assignedTo}
                        onChange={(e) => handleAssigneeChange(activeSession.id, e.target.value)}
                        className="bg-transparent border-none text-[10px] font-bold text-zinc-700 cursor-pointer focus:outline-none hover:text-zinc-955 transition-colors p-0 leading-none"
                      >
                        <option value="Tú">Tú</option>
                        <option value="Bot de IA">Bot de IA</option>
                        <option value="Soporte Técnico">Soporte</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-1 text-zinc-400">
                  <button 
                    onClick={() => toggleFavorite(activeSession.id)}
                    className={cn(
                      "w-7.5 h-7.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-all cursor-pointer",
                      activeSession.isFavorite ? "text-amber-500" : "text-zinc-400 hover:text-zinc-700"
                    )}
                    title="Favorito"
                  >
                    <Star className={cn("w-3.5 h-3.5", activeSession.isFavorite && "fill-current")} />
                  </button>
                  <button 
                    onClick={() => setShowAddTag(!showAddTag)}
                    className="w-7.5 h-7.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center hover:text-zinc-700 transition-all cursor-pointer"
                    title="Etiquetas"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => toggleStatus(activeSession.id)}
                    className={cn(
                      "w-7.5 h-7.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-all cursor-pointer",
                      activeSession.status === 'closed' ? "text-emerald-500" : "text-zinc-400 hover:text-zinc-700"
                    )}
                    title="Resolver"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-zinc-200 mx-1" />
                  <button className="w-7.5 h-7.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center hover:text-zinc-700 transition-all cursor-pointer">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat Stream Dialog Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-50/20 custom-scrollbar flex flex-col">
                <div className="w-fit mx-auto text-[9px] font-bold text-zinc-400 bg-zinc-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider mb-2 shrink-0 select-none">
                  Hoy
                </div>

                <div className="space-y-4 flex-1">
                  {activeSession.messages.map((msg, idx) => {
                    const isUser = msg.sender === 'user'
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex w-full animate-in duration-200",
                          isUser ? "justify-start" : "justify-end"
                        )}
                      >
                        <div className="flex items-start gap-2.5 max-w-[70%]">
                          {isUser && (
                            <div className="relative select-none shrink-0 mt-0.5">
                              {activeSession.avatarUrl ? (
                                <img
                                  src={activeSession.avatarUrl}
                                  alt={activeSession.customerName}
                                  className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-150 border border-zinc-200 flex items-center justify-center text-[9px] text-zinc-655 font-bold uppercase">
                                  {activeSession.customerName.slice(0, 1)}
                                </div>
                              )}
                            </div>
                          )}

                          <div className={cn(
                            "rounded-lg px-3.5 py-2.5 text-xs flex flex-col gap-1.5",
                            isUser 
                              ? "bg-zinc-100 text-zinc-955 rounded-tl-none border border-zinc-200/40" 
                              : msg.text.startsWith('[PRODUCT_CARD]') || msg.text.startsWith('[Link de Pago Enviado]')
                              ? "bg-transparent p-0 border-none shadow-none"
                              : "bg-[#E6F4EA] text-emerald-955 rounded-tr-none border border-emerald-100"
                          )}>
                            {/* Render message body (supports product cards) */}
                            {renderMessageText(msg.text)}

                            {/* Timestamp + checkmarks */}
                            {!msg.text.startsWith('[PRODUCT_CARD]') && !msg.text.startsWith('[Link de Pago Enviado]') && (
                              <div className={cn(
                                "flex items-center justify-end gap-1 text-[8px] font-semibold mt-1 select-none leading-none",
                                isUser ? "text-zinc-400" : "text-emerald-700"
                              )}>
                                <span>{msg.time}</span>
                                {!isUser && (
                                  <span className="text-emerald-600 font-extrabold">✓✓</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Cart item added notification banner inside chat feed if cart is active */}
                  {activeDetails && activeDetails.cartItems.length > 0 && (
                    <div className="w-fit mx-auto text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-3 py-1 rounded-full flex items-center gap-1 select-none">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Producto agregado al carrito</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Tag Add Popover Form */}
              {showAddTag && (
                <form 
                  onSubmit={handleAddTag} 
                  className="absolute bottom-[160px] left-6 right-6 p-4 bg-white border border-zinc-200 rounded-lg z-30 animate-in fade-in duration-200 flex gap-2"
                >
                  <input
                    type="text"
                    value={newTagText}
                    onChange={e => setNewTagText(e.target.value)}
                    placeholder="Escribe el nombre de la etiqueta..."
                    className="flex-1 bg-zinc-550/5 border border-zinc-250 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-zinc-355 font-semibold"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-lg px-4 py-1.5 active:scale-95 transition-transform cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddTag(false); setNewTagText(''); }}
                    className="border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold text-xs rounded-lg px-3 py-1.5 active:scale-95 transition-transform cursor-pointer"
                  >
                    Cancelar
                  </button>
                </form>
              )}

              {/* Bot takeover warning notification banner */}
              <div className="bg-amber-50 border-t border-b border-amber-100 p-2.5 flex items-center gap-2 px-4.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-[9px] text-amber-800 font-bold tracking-wide leading-none select-none">
                  El bot está respondiendo automáticamente. Al enviar un mensaje tomarás el control.
                </p>
              </div>

              {/* Message Composer Footer Input area */}
              <div className="p-4 bg-white border-t border-zinc-150 shrink-0 space-y-3">
                
                {/* Tabs Responder / Nota Interna */}
                <div className="flex gap-4 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 pb-1.5">
                  <button
                    type="button"
                    onClick={() => setComposerTab('reply')}
                    className={cn(
                      "pb-0.5 relative transition-colors cursor-pointer",
                      composerTab === 'reply' ? "text-emerald-600" : "hover:text-zinc-900"
                    )}
                  >
                    Responder
                    {composerTab === 'reply' && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerTab('note')}
                    className={cn(
                      "pb-0.5 relative transition-colors cursor-pointer",
                      composerTab === 'note' ? "text-emerald-600" : "hover:text-zinc-900"
                    )}
                  >
                    Nota interna
                    {composerTab === 'note' && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                  </button>
                </div>

                {composerTab === 'reply' ? (
                  <form onSubmit={handleTakeover} className="space-y-3">
                    <textarea
                      rows={1}
                      value={takeoverText}
                      onChange={e => setTakeoverText(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded-lg px-4 py-2.5 text-xs outline-none font-semibold resize-none transition-all custom-scrollbar leading-relaxed"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleTakeover(e)
                        }
                      }}
                    />
                    
                    <div className="flex items-center justify-between gap-4 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => toast.info('Emojis (Próximamente)')}
                          className="w-8 h-8 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center hover:text-zinc-700 transition-all cursor-pointer"
                        >
                          <Smile className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => toast.info('Adjuntar archivos (Próximamente)')}
                          className="w-8 h-8 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center hover:text-zinc-700 transition-all cursor-pointer"
                        >
                          <Paperclip className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setTakeoverText('¡Hola! Claro que sí, con gusto te ayudo.')
                            toast.success('Respuesta rápida cargada')
                          }}
                          className="w-8 h-8 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center hover:text-zinc-700 transition-all cursor-pointer"
                          title="Respuesta rápida"
                        >
                          <Zap className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={!takeoverText.trim() || sending}
                        className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 fill-current rotate-45 -translate-x-[2px] translate-y-[2px]" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <textarea
                      rows={1}
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      placeholder="Escribe una nota interna..."
                      className="w-full bg-amber-50/30 border border-amber-200/50 hover:border-amber-250 focus:border-amber-350 focus:bg-white rounded-lg px-4 py-2.5 text-xs outline-none font-semibold resize-none transition-all custom-scrollbar leading-relaxed"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAddNote(e)
                        }
                      }}
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-45 cursor-pointer"
                      >
                        Guardar nota
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <MessageCircle className="w-12 h-12 text-zinc-250 mb-2" />
              <p className="font-bold text-xs tracking-wider">Selecciona un chat para ver el historial</p>
            </div>
          )}
        </div>

        {/* COLUMN 3: CONVERSATION DETAILS & METADATA SIDEBAR */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-5">
          
          {activeSession ? (
            <>
              {/* Card 1: Información del cliente */}
              <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
                <h4 className="text-xs font-bold text-zinc-955 tracking-wider select-none">Información del cliente</h4>
                
                <div className="flex items-center gap-3.5 select-none">
                  {activeSession.avatarUrl ? (
                    <img 
                      src={activeSession.avatarUrl} 
                      alt={activeSession.customerName}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-zinc-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-lg font-extrabold text-zinc-650 uppercase shrink-0">
                      {activeSession.customerName.slice(0, 2)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-zinc-955 truncate leading-tight">{activeSession.customerName}</h4>
                      <span className="bg-emerald-50 border border-emerald-250 text-emerald-600 text-[8px] px-1 py-0.2 rounded font-extrabold uppercase shrink-0">
                        Cliente
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 mt-1 block flex items-center gap-1">
                      <span>+{activeSession.phoneNumber}</span>
                      <button 
                        onClick={() => copyToClipboard('+' + activeSession.phoneNumber)}
                        className="text-zinc-350 hover:text-zinc-500 cursor-pointer ml-0.5"
                        title="Copiar"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                <div className="space-y-3.5 text-xs font-semibold text-zinc-600">
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-400 select-none">Cliente desde:</span>
                    <span className="text-zinc-950">
                      {detailsLoading ? 'Cargando...' : activeDetails?.firstInteractionDate || '15 mar 2025'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-400 select-none">Total compras:</span>
                    <span className="text-zinc-950 font-bold">
                      {detailsLoading ? 'Cargando...' : `$${activeDetails?.totalSpent.toLocaleString('es-CO') || '0'}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-400 select-none">Pedidos:</span>
                    <span className="text-zinc-955">
                      {detailsLoading ? 'Cargando...' : `${activeDetails?.ordersCount || 0} pedidos`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/clientes?search=${activeSession.customerName}`)}
                  className="w-full text-center py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all cursor-pointer mt-2 block"
                >
                  Ver perfil completo
                </button>
              </div>

              {/* Card 2: Carrito actual */}
              <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-baseline select-none">
                  <h4 className="text-xs font-bold text-zinc-955 tracking-wider">Carrito actual</h4>
                  <span className="text-[10px] text-zinc-400 font-bold">{activeDetails?.cartItems.length || 0} productos</span>
                </div>

                {activeDetails && activeDetails.cartItems.length > 0 ? (
                  <div className="space-y-3">
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                      {activeDetails.cartItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 items-center text-xs font-semibold text-zinc-755 py-1.5 border-b border-zinc-50 last:border-none">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-8.5 h-8.5 rounded border border-zinc-100 object-cover shrink-0" />
                          ) : (
                            <div className="w-8.5 h-8.5 bg-zinc-50 border border-zinc-150 rounded flex items-center justify-center text-zinc-400 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-zinc-900 truncate text-[11px] leading-tight">{item.name}</h5>
                            <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Cant: {item.qty}</p>
                          </div>
                          <span className="font-bold text-zinc-900 shrink-0 text-[11px]">${(item.price * item.qty).toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-zinc-100 pt-1" />

                    <div className="space-y-2 text-[11px] font-semibold text-zinc-650">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Subtotal</span>
                        <span>${activeDetails.cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Envío</span>
                        <span className="text-emerald-600 font-bold">Gratis</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-zinc-950 pt-1.5 border-t border-zinc-50">
                        <span>Total</span>
                        <span>${activeDetails.cartItems.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString('es-CO')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSendPaymentLink}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3 select-none active:scale-[0.98]"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Enviar link de pago</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 font-semibold py-4 text-center select-none">No hay productos en el carrito</p>
                )}
              </div>

              {/* Card 3: Historial reciente */}
              <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-baseline select-none">
                  <h4 className="text-xs font-bold text-zinc-955 tracking-wider">Historial reciente</h4>
                  <button 
                    onClick={() => router.push(`/pedidos?search=${activeSession.customerName}`)} 
                    className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Ver todos
                  </button>
                </div>

                {activeDetails && activeDetails.orders.length > 0 ? (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {activeDetails.orders.slice(0, 4).map((order, idx) => {
                      const isPaid = order.status === 'paid' || order.paymentStatus === 'PAID'
                      const statusText = isPaid ? 'Pagado' : order.status === 'failed' ? 'Reembolsado' : 'Pendiente'
                      const statusColor = isPaid 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-250' 
                        : order.status === 'failed'
                        ? 'bg-rose-50 text-rose-600 border-rose-250'
                        : 'bg-amber-50 text-amber-600 border-amber-250'

                      return (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-semibold py-1.5 border-b border-zinc-50 last:border-none">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-zinc-800 truncate">Pedido #{order.id.slice(-6).toUpperCase()}</span>
                            <span className="text-[9px] text-zinc-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border scale-90", statusColor)}>
                              {statusText}
                            </span>
                            <span className="font-bold text-zinc-950">${order.total.toLocaleString('es-CO')}</span>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isPaid ? "bg-emerald-500" : order.status === 'failed' ? "bg-rose-500" : "bg-amber-500")} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 font-semibold py-4 text-center select-none">No registra pedidos anteriores</p>
                )}
              </div>

              {/* Card 4: Etiquetas */}
              <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-baseline select-none">
                  <h4 className="text-xs font-bold text-zinc-955 tracking-wider">Etiquetas</h4>
                  <button 
                    onClick={() => setShowAddTag(!showAddTag)} 
                    className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeSession.tags.map((tag, tIdx) => {
                    let color = 'text-[#6F42C1] bg-purple-50 border-purple-200'
                    if (tag.toLowerCase().includes('compra')) color = 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    if (tag.toLowerCase().includes('envio') || tag.toLowerCase().includes('domicilio')) color = 'text-amber-700 bg-amber-50 border-amber-200'

                    return (
                      <span 
                        key={tIdx} 
                        className={cn(
                          "px-2 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-1 leading-none",
                          color
                        )}
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(activeSession.id, tag)}
                          className="hover:text-zinc-955 text-[10px] ml-0.5 opacity-60 hover:opacity-100"
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}

                  <button
                    onClick={() => setShowAddTag(!showAddTag)}
                    className="flex items-center justify-center gap-1 px-2 py-0.5 border border-dashed border-zinc-200 hover:border-zinc-300 rounded-md text-[9px] font-bold text-zinc-500 transition-colors bg-white cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 text-zinc-450" />
                    <span>Nueva etiqueta</span>
                  </button>
                </div>
              </div>

              {/* Close session button action */}
              <button
                onClick={() => toggleStatus(activeSession.id)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 border rounded-lg py-3 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer",
                  activeSession.status === 'closed'
                    ? "border-emerald-250 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50"
                    : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50/30"
                )}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{activeSession.status === 'closed' ? 'Reabrir conversación' : 'Cerrar conversación'}</span>
              </button>
            </>
          ) : (
            <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center justify-center text-center py-20 text-zinc-400">
              Selecciona un chat
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
