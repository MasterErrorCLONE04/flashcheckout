'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  ActionButton,
  AgentSettings,
  AgentTabType,
  ChatMessage,
  FaqItem,
  ProductExtended
} from './types'

export function useAgentSettingsState({
  initialSettings,
  storeName,
  storeSlug,
  storeId,
  initialProducts,
  initialFaqs
}: {
  initialSettings: AgentSettings
  storeName: string
  storeSlug: string
  storeId: string
  initialProducts: ProductExtended[]
  initialFaqs: FaqItem[]
}) {
  const searchParams = useSearchParams()
  const [settings, setSettings] = useState<AgentSettings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<AgentTabType>('configuracion')

  useEffect(() => {
    const tabParam = searchParams.get('tab') as AgentTabType | null
    if (
      tabParam &&
      ['configuracion', 'modo-cierre', 'catalogo', 'respuestas', 'automatizaciones', 'comportamiento', 'integraciones'].includes(tabParam)
    ) {
      setActiveTab(tabParam)
    }
  }, [searchParams])
  
  // Modo de Cierre (Opción A: Flows vs Opción B: Web)
  const [checkoutMode, setCheckoutMode] = useState<'WEB_CHECKOUT' | 'WHATSAPP_FLOW'>(
    initialSettings.aiSettings?.checkoutMode || 'WEB_CHECKOUT'
  )
  const [flowId, setFlowId] = useState<string>(
    initialSettings.aiSettings?.whatsappCatalogFlowId || ''
  )
  
  // Products/Catalog Tab states
  const [products, setProducts] = useState<ProductExtended[]>(initialProducts)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingAiDescription, setEditingAiDescription] = useState('')
  const [savingProductId, setSavingProductId] = useState<string | null>(null)

  // FAQ Tab states
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [isAddingFaq, setIsAddingFaq] = useState(false)
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null)

  // Behavior settings states
  const [behavior, setBehavior] = useState({
    tone: initialSettings.aiSettings?.tone || 'Formal',
    language: initialSettings.aiSettings?.language || 'Español',
    comprarSinStock: !!initialSettings.aiSettings?.comprarSinStock,
    pedirEmail: !!initialSettings.aiSettings?.pedirEmail,
    timeout: initialSettings.aiSettings?.timeout || '10 min',
  })

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      sender: 'bot', 
      text: initialSettings.welcomeMessage || '¡Hola! Bienvenido.', 
      time: '10:30 AM',
      options: ['Ver productos', 'Recomendaciones', 'Consultar pedido'],
      actionButton: (initialSettings.aiSettings?.checkoutMode || 'WEB_CHECKOUT') === 'WHATSAPP_FLOW'
        ? { text: 'Ver Catálogo 🛍️', type: 'flow' }
        : { text: '🛍️ Abrir Catálogo Web', type: 'web', url: `/tienda/${storeSlug}` }
    },
    {
      sender: 'user',
      text: 'Quiero algo para mejorar mi energía',
      time: '10:31 AM'
    },
    {
      sender: 'bot',
      text: '¡Perfecto! Puedo recomendarte algunas opciones ideales para aumentar tu energía de forma natural. ¿Te gustaría ver nuestras mejores opciones?',
      time: '10:31 AM'
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Guardar Modo de Venta (Opción A vs Opción B)
  async function handleSaveSalesMode(newMode?: 'WEB_CHECKOUT' | 'WHATSAPP_FLOW', newFlowId?: string) {
    const targetMode = newMode ?? checkoutMode
    const targetFlowId = (newFlowId !== undefined ? newFlowId : flowId).trim()
    setSaving(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiSettings: {
            checkoutMode: targetMode,
            whatsappCatalogFlowId: targetFlowId,
          },
        }),
      })

      if (!res.ok) throw new Error('Error al guardar modo de venta')
      toast.success(
        targetMode === 'WHATSAPP_FLOW' 
          ? 'Modo WhatsApp Flows activado' 
          : 'Modo Agente + Checkout Web activado',
        {
          description: targetMode === 'WHATSAPP_FLOW'
            ? 'Los clientes completarán su pedido directamente dentro de WhatsApp con Flows.'
            : 'Los clientes recibirán el enlace a tu tienda web para finalizar su compra.'
        }
      )
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar el modo de venta')
    } finally {
      setSaving(false)
    }
  }

  // Save prompts & state updates (Tab 1: Configuración)
  async function handleSavePrompts() {
    setSaving(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: settings.systemPrompt,
          welcomeMessage: settings.welcomeMessage,
          aiActive: settings.active,
          aiSettings: {
            checkoutMode,
            whatsappCatalogFlowId: flowId.trim(),
          }
        }),
      })

      if (!res.ok) throw new Error('Error al guardar')
      toast.success('Configuración del agente guardada', {
        description: 'La IA se actualizará con las nuevas instrucciones.'
      })
    } catch (err: any) {
      console.error(err)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  // Save product specific AI training (Tab 2: Catálogo)
  async function handleSaveProductAI(productId: string, recommendation: boolean, description: string) {
    setSavingProductId(productId)
    try {
      const res = await fetch('/api/whatsapp/agent/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, aiRecommendation: recommendation, aiDescription: description }),
      })
      if (!res.ok) throw new Error('API patch failed')
      const data = await res.json()
      if (data.success) {
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, aiRecommendation: recommendation, aiDescription: description }
              : p
          )
        )
        setEditingProductId(null)
        toast.success('Instrucciones de catálogo actualizadas')
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo guardar la configuración del producto')
    } finally {
      setSavingProductId(null)
    }
  }

  // Add FAQ (Tab 3: Respuestas Rápidas)
  async function handleAddFaq(e: React.FormEvent) {
    e.preventDefault()
    if (!newQuestion.trim() || !newAnswer.trim()) return
    setIsAddingFaq(true)
    try {
      const res = await fetch('/api/whatsapp/agent/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion.trim(), answer: newAnswer.trim() }),
      })
      if (!res.ok) throw new Error('Failed to create FAQ')
      const data = await res.json()
      if (data.success) {
        setFaqs(prev => [data.faq, ...prev])
        setNewQuestion('')
        setNewAnswer('')
        toast.success('Pregunta frecuente añadida con éxito')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar la pregunta frecuente')
    } finally {
      setIsAddingFaq(false)
    }
  }

  // Delete FAQ (Tab 3: Respuestas Rápidas)
  async function handleDeleteFaq(id: string) {
    setDeletingFaqId(id)
    try {
      const res = await fetch('/api/whatsapp/agent/faq', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed to delete FAQ')
      const data = await res.json()
      if (data.success) {
        setFaqs(prev => prev.filter(f => f.id !== id))
        toast.success('Pregunta frecuente eliminada')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al eliminar')
    } finally {
      setDeletingFaqId(null)
    }
  }

  // Save behavior configurations (Tab 4: Comportamiento)
  async function handleSaveBehavior() {
    setSaving(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiSettings: {
            ...behavior,
            checkoutMode,
            whatsappCatalogFlowId: flowId.trim(),
          },
        }),
      })

      if (!res.ok) throw new Error('Error al guardar')
      toast.success('Comportamiento de la IA guardado', {
        description: 'La personalidad y parámetros logísticos de la IA han sido aplicados.'
      })
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar el comportamiento')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return

    const userMsg = inputText.trim()
    setInputText('')

    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }])
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: `sim_${storeId}`,
          message: userMsg,
          channel: 'WEB',
          storeId,
        }),
      })
      const data = await res.json().catch(() => null)
      const lower = userMsg.toLowerCase()
      const wantsCatalog =
        lower.includes('producto') ||
        lower.includes('catalogo') ||
        lower.includes('catálogo') ||
        lower.includes('precio') ||
        lower.includes('comprar')

      const actionButton: ActionButton | undefined = wantsCatalog
        ? checkoutMode === 'WHATSAPP_FLOW'
          ? { text: 'Ver Catálogo 🛍️', type: 'flow' }
          : { text: '🛍️ Abrir Catálogo Web', type: 'web', url: `/tienda/${storeSlug}` }
        : undefined

      if (res.ok && data?.success && typeof data.response === 'string' && data.response.trim()) {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: data.response.trim(),
            time: timeStr,
            actionButton,
          },
        ])
        return
      }

      // Fallback local con datos reales de FAQs y productos de la tienda si el gateway no tiene API key
      let botResponse =
        settings.welcomeMessage || `¡Hola! Soy el asistente de ${storeName}. ¿En qué puedo ayudarte?`

      const faqMatch = faqs.find(f => lower.includes(f.question.toLowerCase()))
      if (faqMatch) {
        botResponse = faqMatch.answer
      } else if (wantsCatalog && products.length > 0) {
        const list = products
          .filter(p => p.active)
          .slice(0, 4)
          .map(p => `• *${p.name}* — $${p.price.toLocaleString('es-CO')}`)
          .join('\n')
        botResponse = `Estos son algunos de nuestros productos disponibles en *${storeName}*:\n\n${list}\n\n¿Cuál te gustaría agregar a tu pedido?`
      }

      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: botResponse, time: timeStr, actionButton },
      ])
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Soy el asistente de ${storeName}. Pregúntame por nuestros productos o precios.`,
          time: timeStr,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  function handlePreviewInSimulator(text: string, label?: string) {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: label ? `*[${label}]*\n${text}` : text,
        time: timeStr,
      },
    ])
  }

  return {
    settings,
    setSettings,
    saving,
    setSaving,
    activeTab,
    setActiveTab,
    checkoutMode,
    setCheckoutMode,
    flowId,
    setFlowId,
    products,
    setProducts,
    editingProductId,
    setEditingProductId,
    editingAiDescription,
    setEditingAiDescription,
    savingProductId,
    faqs,
    setFaqs,
    newQuestion,
    setNewQuestion,
    newAnswer,
    setNewAnswer,
    isAddingFaq,
    deletingFaqId,
    behavior,
    setBehavior,
    chatMessages,
    setChatMessages,
    inputText,
    setInputText,
    isTyping,
    handleSaveSalesMode,
    handleSavePrompts,
    handleSaveProductAI,
    handleAddFaq,
    handleDeleteFaq,
    handleSaveBehavior,
    handleSendMessage,
    handlePreviewInSimulator
  }
}

export type AgentSettingsState = ReturnType<typeof useAgentSettingsState>
