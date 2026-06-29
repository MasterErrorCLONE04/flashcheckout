'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  History,
  User,
  Bot,
  Send,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  Star,
  Tag,
  CheckCircle,
  MoreVertical,
  Paperclip,
  Smile,
  Lock,
  Copy,
  Calendar,
  Smartphone,
  Plus,
  SlidersHorizontal,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Zap,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Message = {
  sender: 'user' | 'bot'
  text: string
  time: string
}

type ChatSession = {
  id: string
  phoneNumber: string
  customerName: string
  lastInteraction: string
  step: string
  messages: Message[]
}

type InternalNote = {
  id: string
  text: string
  createdAt: string
  author: string
}

type ChatSessionExtended = ChatSession & {
  tags: string[]
  notes: InternalNote[]
  assignedTo: string
  isFavorite: boolean
  status: 'active' | 'closed'
}

export default function ChatHistoryViewer({
  initialSessions,
  whatsappConnected,
}: {
  initialSessions: ChatSession[]
  whatsappConnected: boolean
}) {
  const router = useRouter()
  // Wrap initial sessions with metadata for interactive mock functionality
  const [sessions, setSessions] = useState<ChatSessionExtended[]>(() =>
    initialSessions.map((s, idx) => {
      return {
        ...s,
        messages: s.messages,
        tags: [],
        notes: [],
        assignedTo: 'Tú',
        isFavorite: false,
        status: 'active'
      }
    })
  )

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessions.length > 0 ? sessions[0].id : null
  )
  const [takeoverText, setTakeoverText] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'assigned' | 'closed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Note adding state
  const [newNoteText, setNewNoteText] = useState('')
  
  // Tag adding state
  const [showAddTag, setShowAddTag] = useState(false)
  const [newTagText, setNewTagText] = useState('')

  const itemsPerPage = 8
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  // Filter conversations list
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phoneNumber.includes(searchQuery) ||
      s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'unread' && s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user') ||
      (activeTab === 'assigned' && s.assignedTo === 'Tú') ||
      (activeTab === 'closed' && s.status === 'closed')

    return matchesSearch && matchesTab
  })

  // Pagination bounds
  const totalPages = Math.max(Math.ceil(filteredSessions.length / itemsPerPage), 1)
  const currentSessions = filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Helper to persist session property updates to database via PATCH
  const persistSessionUpdate = async (sessionId: string, data: any) => {
    try {
      const res = await fetch('/api/whatsapp/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...data })
      })
      if (!res.ok) throw new Error('Error al guardar en base de datos')
    } catch (err: any) {
      console.error('[persistSessionUpdate Error]', err)
      toast.error('No se pudo guardar el cambio en el servidor')
    }
  }

  // Toggle Favorite
  const toggleFavorite = async (id: string) => {
    const sessionToUpdate = sessions.find(s => s.id === id)
    if (!sessionToUpdate) return
    const nextFavorite = !sessionToUpdate.isFavorite

    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, isFavorite: nextFavorite } : s))
    )
    toast.success(nextFavorite ? 'Agregado a favoritos' : 'Quitado de favoritos')
    await persistSessionUpdate(id, { isFavorite: nextFavorite })
  }

  // Toggle Status (Resolve/Close)
  const toggleStatus = async (id: string) => {
    const sessionToUpdate = sessions.find(s => s.id === id)
    if (!sessionToUpdate) return
    const nextStatus = sessionToUpdate.status === 'active' ? 'closed' : 'active'

    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, status: nextStatus } : s))
    )
    toast.success(nextStatus === 'closed' ? 'Conversación cerrada con éxito' : 'Conversación reabierta')
    await persistSessionUpdate(id, { status: nextStatus })
  }

  // Update Assignment
  const handleAssigneeChange = async (id: string, assignee: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, assignedTo: assignee } : s))
    )
    toast.success(`Conversación asignada a: ${assignee}`)
    await persistSessionUpdate(id, { assignedTo: assignee })
  }

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim() || !activeSessionId) return

    const noteText = newNoteText.trim()
    setNewNoteText('')

    const sessionToUpdate = sessions.find(s => s.id === activeSessionId)
    if (!sessionToUpdate) return

    const newNote: InternalNote = {
      id: Date.now().toString(),
      text: noteText,
      createdAt: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: 'Tú'
    }
    const updatedNotes = [...sessionToUpdate.notes, newNote]

    setSessions(prev =>
      prev.map(s => (s.id === activeSessionId ? { ...s, notes: updatedNotes } : s))
    )
    toast.success('Nota interna agregada con éxito')
    await persistSessionUpdate(activeSessionId, { notes: updatedNotes })
  }

  // Delete Note
  const handleDeleteNote = async (sessionId: string, noteId: string) => {
    const sessionToUpdate = sessions.find(s => s.id === sessionId)
    if (!sessionToUpdate) return

    const updatedNotes = sessionToUpdate.notes.filter(n => n.id !== noteId)

    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, notes: updatedNotes } : s))
    )
    toast.success('Nota interna eliminada')
    await persistSessionUpdate(sessionId, { notes: updatedNotes })
  }

  // Add Tag
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagText.trim() || !activeSessionId) return

    const tag = newTagText.trim()
    setNewTagText('')
    setShowAddTag(false)

    const sessionToUpdate = sessions.find(s => s.id === activeSessionId)
    if (!sessionToUpdate) return
    if (sessionToUpdate.tags.includes(tag)) return

    const updatedTags = [...sessionToUpdate.tags, tag]

    setSessions(prev =>
      prev.map(s => (s.id === activeSessionId ? { ...s, tags: updatedTags } : s))
    )
    toast.success(`Etiqueta "${tag}" agregada`)
    await persistSessionUpdate(activeSessionId, { tags: updatedTags })
  }

  // Remove Tag
  const handleRemoveTag = async (sessionId: string, tag: string) => {
    const sessionToUpdate = sessions.find(s => s.id === sessionId)
    if (!sessionToUpdate) return

    const updatedTags = sessionToUpdate.tags.filter(t => t !== tag)

    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, tags: updatedTags } : s))
    )
    toast.success(`Etiqueta "${tag}" quitada`)
    await persistSessionUpdate(sessionId, { tags: updatedTags })
  }

  // Copy Phone Number
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Número copiado al portapapeles')
  }

  // Trigger CSV export
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

  // Send WhatsApp message (API Takeover)
  async function handleTakeover(e: React.FormEvent) {
    e.preventDefault()
    if (!takeoverText.trim() || !activeSessionId || sending) return

    const newMsg = takeoverText.trim()
    setTakeoverText('')
    setSending(true)

    // Optimistic Update
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              { sender: 'bot', text: '[Asesor Humano]: ' + newMsg, time: timeNow }
            ]
          }
        }
        return s
      })
    )

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          text: newMsg,
        }),
      })

      if (!res.ok) {
        throw new Error('Error al enviar el mensaje')
      }
      toast.success('Mensaje enviado por WhatsApp')
    } catch (error: any) {
      toast.error('No se pudo enviar el mensaje', {
        description: error.message || 'Ocurrió un error en el servidor. Inténtalo de nuevo.'
      })
    } finally {
      setSending(false)
    }
  }

  // Parse product card special messages
  function renderMessageText(text: string) {
    if (text.startsWith('[PRODUCT_CARD]')) {
      const parts = text.replace('[PRODUCT_CARD] ', '').split(' | ')
      const title = parts[0] || 'Producto'
      const price = parts[1] || '$0 COP'
      const desc = parts[2] || ''
      return (
        <div className="bg-white border border-zinc-200/80 rounded-lg overflow-hidden mt-1 max-w-sm text-zinc-950 font-semibold p-0.5 shadow-sm">
          {/* Mock image container */}
          <div className="w-full h-24 bg-emerald-50/20 border-b border-zinc-100 flex items-center justify-center relative p-3">
            <div className="w-12 h-12 rounded-lg border border-zinc-250 bg-white flex items-center justify-center p-2 text-zinc-400">
              <Package className="w-6 h-6 text-zinc-400" />
            </div>
            <span className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
              Bot
            </span>
          </div>
          <div className="p-3.5 space-y-1.5">
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-bold text-xs truncate max-w-[130px]">{title}</span>
              <span className="text-[10px] font-extrabold text-emerald-600 tabular-nums shrink-0">{price}</span>
            </div>
            {desc && <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">{desc}</p>}
            <button
              onClick={() => toast.success(`Abriendo enlace de: ${title}`)}
              className="w-full text-center py-2 border border-zinc-250 hover:border-zinc-350 hover:bg-zinc-50 rounded-lg text-[10px] font-bold text-zinc-650 transition-colors uppercase tracking-widest mt-2 cursor-pointer h-8 flex items-center justify-center"
            >
              Ver producto
            </button>
          </div>
        </div>
      )
    }

    const isHumanTakeover = text.startsWith('[Asesor Humano]')
    const cleanText = isHumanTakeover ? text.replace('[Asesor Humano]: ', '') : text

    return (
      <div className="space-y-1.5">
        {isHumanTakeover && (
          <span className="block text-[8px] opacity-75 font-black tracking-wider leading-none">
            Intervención Humana
          </span>
        )}
        <p className="leading-relaxed break-words">{cleanText}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Historial de Chats</h1>
          <div className="text-[12px] font-medium text-zinc-505 mt-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Bandeja de Entrada — <span className="text-zinc-900 font-bold">Monitoreo de conversaciones en vivo</span>
          </div>
        </div>

        <button
          onClick={exportChats}
          className="flex items-center justify-center gap-2 h-9 px-4 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-semibold text-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95 self-end sm:self-center"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Exportar conversaciones</span>
        </button>
      </div>

      {/* THREE-COLUMN WORKSPACE GRID */}
      {whatsappConnected ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN 1: CONVERSATIONS LIST PANEL (Spans 3/12 or 4/12) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white border border-zinc-200/80 rounded-lg overflow-hidden flex flex-col justify-between h-[650px]">
          
          <div className="p-4 space-y-4">
            {/* Search conversations */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-8.5 pr-3 py-1.5 bg-zinc-50/40 border border-zinc-200 hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded-lg text-xs font-semibold outline-none transition-all placeholder:text-zinc-400"
                />
              </div>
              <button className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors shrink-0 cursor-pointer">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px] font-bold text-zinc-500">
              <button 
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer",
                  activeTab === 'all' ? "bg-zinc-950 text-white" : "hover:bg-zinc-100/60 hover:text-zinc-955"
                )}
              >
                Todos <span className={cn("ml-1 px-1 py-0.2 rounded text-[8px]", activeTab === 'all' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-450")}>{sessions.length}</span>
              </button>

              <button 
                onClick={() => { setActiveTab('unread'); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer",
                  activeTab === 'unread' ? "bg-zinc-950 text-white" : "hover:bg-zinc-100/60 hover:text-zinc-955"
                )}
              >
                No leídos <span className={cn("ml-1 px-1 py-0.2 rounded text-[8px]", activeTab === 'unread' ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-450")}>1</span>
              </button>

              <button 
                onClick={() => { setActiveTab('assigned'); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer",
                  activeTab === 'assigned' ? "bg-zinc-950 text-white" : "hover:bg-zinc-100/60 hover:text-zinc-955"
                )}
              >
                Asignados
              </button>

              <button 
                onClick={() => { setActiveTab('closed'); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer",
                  activeTab === 'closed' ? "bg-zinc-950 text-white" : "hover:bg-zinc-100/60 hover:text-zinc-955"
                )}
              >
                Cerrados
              </button>
            </div>
          </div>

          {/* Conversations list container */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100/60 custom-scrollbar pr-0.5">
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
                }
                const lastTime = lastMsgObj ? lastMsgObj.time : '10:00 AM'
                const isUnread = s.id === 'demo-session' // Mock unread indicator
                
                // Get initials for profile placeholder
                const initials = s.customerName.slice(0, 2)

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
                      "w-full text-left p-4 hover:bg-zinc-50/50 transition-colors flex items-start gap-3 relative group/session",
                      isSelected && "bg-zinc-50"
                    )}
                  >
                    {/* Profile image with WhatsApp Badge */}
                    <div className="relative shrink-0">
                      <div className="w-8.5 h-8.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-extrabold text-zinc-650 flex items-center justify-center uppercase">
                        {initials}
                      </div>
                      {/* superposed WhatsApp icon */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white p-0.5">
                        <MessageCircle className="w-2.5 h-2.5 fill-current" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-zinc-950 text-xs truncate max-w-[100px] leading-tight">{s.customerName}</span>
                        <span className="text-[9px] text-zinc-400 tabular-nums font-bold shrink-0">{lastTime}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate font-semibold">{lastMsg}</p>
                    </div>

                    {/* Unread dot or counter */}
                    {isUnread && (
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white text-[8px] font-extrabold flex items-center justify-center shrink-0 ml-1.5 self-center">
                        2
                      </div>
                    )}
                    {!isUnread && s.status === 'active' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1.5 self-center opacity-0 group-hover/session:opacity-100 transition-opacity" />
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

        {/* COLUMN 2: CONVERSATION DIALOG CHAT WINDOW (Spans 5/12 or 6/12) */}
        <div className="lg:col-span-8 xl:col-span-6 bg-white border border-zinc-200/80 rounded-lg overflow-hidden flex flex-col justify-between h-[650px] relative">
          {activeSession ? (
            <>
              {/* Header section with assignee and toolbar */}
              <div className="bg-white border-b border-zinc-150 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Circular profile image placeholder */}
                  <div className="relative">
                    <div className="w-8.5 h-8.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-extrabold text-zinc-650 flex items-center justify-center uppercase">
                      {activeSession.customerName.slice(0, 2)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white p-0.5">
                      <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-zinc-950 leading-none">{activeSession.customerName}</h4>
                    
                    {/* Assignment Selector Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-400 font-medium">Asignado a:</span>
                      <select
                        value={activeSession.assignedTo}
                        onChange={(e) => handleAssigneeChange(activeSession.id, e.target.value)}
                        className="bg-transparent border-none text-[10px] font-bold text-zinc-700 cursor-pointer focus:outline-none hover:text-zinc-950 transition-colors p-0 leading-none"
                      >
                        <option value="Tú">Tú</option>
                        <option value="Bot de IA">Bot de IA</option>
                        <option value="Soporte Técnico">Soporte</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <button 
                    onClick={() => toggleFavorite(activeSession.id)}
                    className={cn(
                      "w-7.5 h-7.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-all cursor-pointer",
                      activeSession.isFavorite ? "text-amber-500" : "text-zinc-400 hover:text-zinc-700"
                    )}
                    title={activeSession.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
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
                    title={activeSession.status === 'closed' ? "Reabrir chat" : "Resolver conversación"}
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
                  Hoy, 14 de Mayo
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
                            <div className="w-6 h-6 rounded-full bg-zinc-150 border border-zinc-250/50 flex items-center justify-center text-[9px] text-zinc-650 font-bold shrink-0 mt-0.5 uppercase">
                              {activeSession.customerName.slice(0, 1)}
                            </div>
                          )}

                          <div className={cn(
                            "rounded-lg px-3.5 py-2.5 text-xs font-semibold flex flex-col gap-1.5",
                            isUser 
                              ? "bg-white text-zinc-950 rounded-tl-none border border-zinc-200/60" 
                              : msg.text.startsWith('[PRODUCT_CARD]')
                              ? "bg-transparent p-0 border-none shadow-none"
                              : msg.text.startsWith('[Asesor Humano]')
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-zinc-950 text-white rounded-tr-none"
                          )}>
                            {/* Render message body (supports product cards) */}
                            {renderMessageText(msg.text)}

                            {/* Timestamp + checkmarks */}
                            {!msg.text.startsWith('[PRODUCT_CARD]') && (
                              <div className={cn(
                                "flex items-center justify-end gap-1.5 text-[8px] font-bold mt-1 select-none leading-none",
                                isUser ? "text-zinc-400" : "text-white/60"
                              )}>
                                <span>{msg.time}</span>
                                {!isUser && (
                                  <span className="text-emerald-400 font-extrabold">✓✓</span>
                                )}
                              </div>
                            )}
                          </div>

                          {!isUser && (
                            <div className="w-6 h-6 rounded-full bg-zinc-950 text-white flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                              {msg.text.startsWith('[Asesor Humano]') ? 'Yo' : <Bot className="w-3.5 h-3.5" />}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Tag Add Popover Form */}
              {showAddTag && (
                <form 
                  onSubmit={handleAddTag} 
                  className="absolute bottom-[160px] left-6 right-6 p-4 bg-white border border-zinc-200 rounded-lg shadow-lg z-30 animate-in fade-in duration-200 flex gap-2"
                >
                  <input
                    type="text"
                    value={newTagText}
                    onChange={e => setNewTagText(e.target.value)}
                    placeholder="Escribe el nombre de la etiqueta..."
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-zinc-300 font-semibold"
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
                    className="border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold text-xs rounded-lg px-3 py-1.5 active:scale-95 transition-transform"
                  >
                    Cancelar
                  </button>
                </form>
              )}

              {/* Bot takeover warning notification banner */}
              <div className="bg-amber-50 border-t border-b border-amber-200/50 p-2.5 flex items-center gap-2 px-4.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-[9px] text-amber-800 font-bold tracking-wide leading-none">
                  El bot está respondiendo automáticamente. Al enviar un mensaje tomarás el control.
                </p>
              </div>

              {/* Message Composer Footer Input area */}
              <div className="p-4 bg-white border-t border-zinc-150 shrink-0 space-y-3">
                <form onSubmit={handleTakeover} className="space-y-3">
                  <textarea
                    rows={1}
                    value={takeoverText}
                    onChange={e => setTakeoverText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="w-full bg-zinc-50/50 border border-zinc-200 hover:border-zinc-250 focus:border-zinc-350 focus:bg-white rounded-lg px-4.5 py-3 text-xs outline-none font-semibold resize-none transition-all custom-scrollbar leading-relaxed"
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
                          setTakeoverText('¡Hola! Claro que sí, con mucho gusto.')
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
                      className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 shadow-sm shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 fill-current rotate-45 -translate-x-[2px] translate-y-[2px]" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <MessageCircle className="w-12 h-12 text-zinc-250 mb-2" />
              <p className="font-bold text-xs tracking-wider">Selecciona un chat para ver el historial</p>
            </div>
          )}
        </div>

        {/* COLUMN 3: CONVERSATION DETAILS & METADATA SIDEBAR (Spans 3/12) */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-5">
          
          {/* PROFILE SUMMARY WIDGET */}
          {activeSession ? (
            <>
              {/* DETAILS CARD */}
              <div className="bg-white border border-zinc-200/80 p-5 rounded-lg flex flex-col items-center justify-center text-center space-y-3.5">
                <div className="w-14 h-14 rounded-full bg-zinc-100 border border-zinc-250 flex items-center justify-center text-lg font-extrabold text-zinc-650 uppercase select-none">
                  {activeSession.customerName.slice(0, 2)}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-950">{activeSession.customerName}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-zinc-500">
                    <span>+{activeSession.phoneNumber}</span>
                    <button 
                      onClick={() => copyToClipboard('+' + activeSession.phoneNumber)}
                      className="text-zinc-405 hover:text-zinc-700 transition-colors"
                      title="Copiar número"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* INFORMATION DETAILS CARD */}
              <div className="bg-white border border-zinc-200/80 p-5 rounded-lg space-y-4">
                <h4 className="text-xs font-bold text-zinc-950 tracking-wider">Información</h4>
                
                <div className="space-y-3 text-xs font-semibold text-zinc-600">
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-400">Primera interacción</span>
                    <span className="text-zinc-950 text-right">14 May, 10:21 AM</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-400">Último mensaje</span>
                    <span className="text-zinc-955 text-right">14 May, 10:24 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Canal</span>
                    <span className="text-zinc-950 flex items-center gap-1.5">
                      {/* WhatsApp Mini Logo */}
                      <span className="text-emerald-500 flex items-center">
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      </span>
                      WhatsApp
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Estado</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md border text-[9px] font-extrabold leading-none uppercase",
                      activeSession.status === 'active' ? "text-emerald-600 bg-emerald-50 border-emerald-200/50" : "text-rose-600 bg-rose-50 border-rose-200/50"
                    )}>
                      {activeSession.status === 'active' ? 'Activa' : 'Cerrada'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-400">Asignado a</span>
                    <span className="text-zinc-955">{activeSession.assignedTo}</span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE TAGS WIDGET */}
              <div className="bg-white border border-zinc-200/80 p-5 rounded-lg space-y-4">
                <h4 className="text-xs font-bold text-zinc-955 tracking-wider">Etiquetas</h4>
                
                <div className="flex flex-wrap gap-2">
                  {/* Pre-defined labels loop */}
                  {activeSession.tags.map((tag, tIdx) => {
                    let color = 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                    if (tag.toLowerCase() === 'kit facial') color = 'text-purple-700 bg-purple-50 border-purple-200/60'
                    if (tag.toLowerCase().includes('envio')) color = 'text-amber-700 bg-amber-50 border-amber-200/60'
                    
                    return (
                      <span 
                        key={tIdx} 
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 leading-none group/tag",
                          color
                        )}
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(activeSession.id, tag)}
                          className="w-3.5 h-3.5 rounded-md hover:bg-black/5 flex items-center justify-center shrink-0 text-current hover:text-zinc-900 transition-colors ml-0.5 opacity-60 hover:opacity-100"
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}

                  <button
                    onClick={() => setShowAddTag(!showAddTag)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 h-7.5 border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-lg text-[10px] font-bold text-zinc-650 transition-colors bg-white active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-zinc-450" />
                    <span>Agregar etiqueta</span>
                  </button>
                </div>
              </div>

              {/* INTERNAL NOTES BOARD CARD */}
              <div className="bg-white border border-zinc-200/80 p-5 rounded-lg space-y-4 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-zinc-950 tracking-wider">Notas internas</h4>
                
                {/* Notes Loop */}
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {activeSession.notes.length === 0 ? (
                    <p className="text-[10px] text-zinc-450 font-medium py-4 text-center">Sin notas internas registradas</p>
                  ) : (
                    activeSession.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg space-y-2 relative group/note text-xs">
                        <p className="font-semibold text-zinc-800 leading-relaxed break-words">{note.text}</p>
                        <div className="flex justify-between items-center text-[8px] font-bold text-zinc-400">
                          <span>Agregado por {note.author} · {note.createdAt}</span>
                          <button
                            onClick={() => handleDeleteNote(activeSession.id, note.id)}
                            className="w-4 h-4 rounded text-zinc-400 hover:text-rose-600 flex items-center justify-center shrink-0 transition-colors hover:bg-zinc-150/50"
                            title="Eliminar nota"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add note form text box */}
                <form onSubmit={handleAddNote} className="pt-3.5 border-t border-zinc-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe una nota..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    className="flex-1 bg-zinc-550/5 border border-zinc-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold outline-none focus:bg-white focus:border-zinc-300 transition-colors placeholder:text-zinc-400"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-lg px-3.5 py-1.5 active:scale-95 transition-transform cursor-pointer shrink-0"
                  >
                    Agregar
                  </button>
                </form>
              </div>

              {/* Close session button action */}
              <button
                onClick={() => toggleStatus(activeSession.id)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 border rounded-lg py-3 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm",
                  activeSession.status === 'closed'
                    ? "border-emerald-250 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50"
                    : "border-rose-200/60 bg-white text-rose-600 hover:bg-rose-50/30"
                )}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{activeSession.status === 'closed' ? 'Reabrir conversación' : 'Cerrar conversación'}</span>
              </button>
            </>
          ) : (
            <div className="bg-white border border-zinc-200/80 p-5 rounded-lg flex items-center justify-center text-center py-20 text-zinc-400">
              Selecciona un chat
            </div>
          )}

        </div>
      </div>
    ) : (
        <div className="bg-white border border-zinc-200/80 rounded-lg p-8 md:p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-500 shadow-sm animate-bounce">
            <MessageCircle className="w-8 h-8 fill-current" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-955">Enlaza tu WhatsApp para comenzar</h2>
            <p className="text-xs text-zinc-505 max-w-md mx-auto leading-relaxed">
              Monitorea conversaciones en vivo, responde preguntas frecuentes automáticamente con tu bot de IA e interviene directamente desde una sola pantalla.
            </p>
          </div>

          <div className="w-full border-t border-zinc-100 my-2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
            <div className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-lg space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Bot Inteligente</h4>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                Tu bot de IA responderá automáticamente con tu catálogo oficial las 24 horas del día.
              </p>
            </div>

            <div className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-lg space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Chat en Vivo</h4>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                Interviene en cualquier chat en tiempo real cuando el bot detecte una consulta humana.
              </p>
            </div>

            <div className="p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-lg space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Gestión de Leads</h4>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                Organiza a tus clientes mediante etiquetas personalizadas y notas internas de seguimiento.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/configuracion')}
            className="flex items-center justify-center gap-2 h-11 px-6 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer mt-4"
          >
            <span>Enlazar WhatsApp</span>
            <span className="text-white/60">→</span>
          </button>
        </div>
      )}
    </div>
  )
}
