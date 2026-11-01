'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChatSessionExtended,
  ChatSessionInit,
  CustomerDetails,
  SessionNote,
  SessionUpdateData
} from './types'

export function useChatSessions(initialSessions: ChatSessionInit[]) {
  const router = useRouter()
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

  // Poll for real-time WhatsApp session and message updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/whatsapp/sessions')
        if (res.ok) {
          const data = await res.json()
          if (data.sessions) {
            setSessions(data.sessions)
          }
        }
      } catch (err) {
        console.error('Error polling for chat updates:', err)
      }
    }, 3500)

    return () => clearInterval(pollInterval)
  }, [])

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  // Filtering
  const filteredSessions = sessions.filter(s => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = s.customerName.toLowerCase().includes(query) || s.phoneNumber.includes(query)
    if (!matchesSearch) return false

    if (activeTab === 'unread') {
      return s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user'
    }
    if (activeTab === 'assigned') {
      return s.assignedTo && s.assignedTo !== 'Sin asignar'
    }
    if (activeTab === 'unassigned') {
      return !s.assignedTo || s.assignedTo === 'Sin asignar'
    }
    return true
  })

  const totalCount = sessions.length
  const unreadCount = sessions.filter(s => s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'user').length
  const assignedCount = sessions.filter(s => s.assignedTo && s.assignedTo !== 'Sin asignar').length
  const unassignedCount = sessions.filter(s => !s.assignedTo || s.assignedTo === 'Sin asignar').length

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage) || 1
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
      
      const resDetails = await fetch(`/api/whatsapp/session?sessionId=${activeSessionId}`)
      const detailsData = (await resDetails.json()) as CustomerDetails
      setActiveDetails(detailsData)
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar link de pago', { id: loadingToast })
    }
  }

  return {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    activeSession,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    filteredSessions,
    currentSessions,
    totalCount,
    unreadCount,
    assignedCount,
    unassignedCount,
    takeoverText,
    setTakeoverText,
    sending,
    composerTab,
    setComposerTab,
    newNoteText,
    setNewNoteText,
    showAddTag,
    setShowAddTag,
    newTagText,
    setNewTagText,
    activeDetails,
    detailsLoading,
    chatEndRef,
    toggleFavorite,
    toggleStatus,
    handleAssigneeChange,
    handleAddNote,
    handleDeleteNote,
    handleAddTag,
    handleRemoveTag,
    copyToClipboard,
    exportChats,
    handleTakeover,
    handleSendPaymentLink
  }
}

export type ChatSessionsState = ReturnType<typeof useChatSessions>
