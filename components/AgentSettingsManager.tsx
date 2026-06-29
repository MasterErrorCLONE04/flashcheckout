'use client'

import { useState } from 'react'
import { 
  Bot, 
  Save, 
  Loader2, 
  Send, 
  MessageSquare, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Settings, 
  Package, 
  Link as LinkIcon, 
  Sparkles, 
  Eye, 
  Plus, 
  Smile, 
  Paperclip,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Star,
  Trash2,
  Sliders,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type AgentSettings = {
  systemPrompt: string
  welcomeMessage: string
  active: boolean
  aiSettings?: any
}

type ProductExtended = {
  id: string
  name: string
  price: number
  active: boolean
  aiRecommendation: boolean
  aiDescription: string
}

type FaqItem = {
  id: string
  question: string
  answer: string
}

export default function AgentSettingsManager({
  initialSettings,
  storeName,
  storeSlug,
  storeId,
  initialProducts,
  initialFaqs,
}: {
  initialSettings: AgentSettings
  storeName: string
  storeSlug: string
  storeId: string
  initialProducts: ProductExtended[]
  initialFaqs: FaqItem[]
}) {
  const [settings, setSettings] = useState<AgentSettings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'configuracion' | 'catalogo' | 'respuestas' | 'comportamiento' | 'integraciones'>('configuracion')
  
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

  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string; options?: string[] }[]>([
    { 
      sender: 'bot', 
      text: initialSettings.welcomeMessage || '¡Hola! Bienvenido.', 
      time: '10:30 AM',
      options: ['Ver productos', 'Recomendaciones', 'Consultar pedido']
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
          aiSettings: behavior,
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

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return

    const userMsg = inputText.trim()
    setInputText('')
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }])
    
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      let botResponse = `Hola, soy el asistente virtual de ${storeName}. Estoy configurado para atenderte 24/7.`
      
      if (userMsg.toLowerCase().includes('hola') || userMsg.toLowerCase().includes('buenos')) {
        botResponse = settings.welcomeMessage || '¡Hola! ¿En qué puedo ayudarte hoy?'
      } else if (userMsg.toLowerCase().includes('precio') || userMsg.toLowerCase().includes('cuanto')) {
        botResponse = 'Nuestros precios de catálogo están siempre actualizados en el menú visual. ¿Hay algún producto en específico que busques?'
      } else if (userMsg.toLowerCase().includes('domicilio') || userMsg.toLowerCase().includes('envio')) {
        botResponse = 'Ofrecemos despachos express. Si me dices tu dirección, puedo ayudarte a calcular el envío.'
      } else if (faqs.length > 0) {
        // Simple client-side search mock matching for preview
        const match = faqs.find(f => userMsg.toLowerCase().includes(f.question.toLowerCase()))
        if (match) botResponse = match.answer
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse, time: timeStr }])
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Agente de WhatsApp</h1>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors",
              settings.active 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : "bg-zinc-100 text-zinc-500 border-zinc-200"
            )}>
              {settings.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-xs font-medium text-zinc-500 mt-1">
            Configura tu asistente con inteligencia artificial para atender, asesorar y crear carritos automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700">Agente activo</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.active}
                onChange={e => setSettings(s => ({ ...s, active: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <button
            onClick={activeTab === 'comportamiento' ? handleSaveBehavior : handleSavePrompts}
            disabled={saving}
            className="flex items-center justify-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-none border border-emerald-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Guardar cambios</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-6 pb-px mb-6 overflow-x-auto select-none no-scrollbar">
        <button
          onClick={() => setActiveTab('configuracion')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'configuracion'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'catalogo'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <Package className="w-4 h-4" />
          <span>Productos y Catálogo</span>
        </button>

        <button
          onClick={() => setActiveTab('respuestas')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'respuestas'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Respuestas Rápidas</span>
        </button>

        <button
          onClick={() => setActiveTab('comportamiento')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'comportamiento'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <Sliders className="w-4 h-4" />
          <span>Comportamiento</span>
        </button>

        <button
          onClick={() => setActiveTab('integraciones')}
          className={cn(
            "flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === 'integraciones'
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-zinc-550 hover:text-zinc-900"
          )}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Integraciones</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Tab Content (Spans 8/12) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Tab 1: Configuración */}
          {activeTab === 'configuracion' && (
            <div className="space-y-5 animate-in">
              {/* System Prompt Card */}
              <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Instrucciones del sistema (System Prompt)</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Define la personalidad, tono y reglas que seguirá tu agente de IA al conversar con los clientes.
                    </p>
                  </div>
                  <button className="flex items-center gap-1.5 h-7 px-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Consejos</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={settings.systemPrompt}
                    onChange={e => setSettings(s => ({ ...s, systemPrompt: e.target.value.slice(0, 2000) }))}
                    placeholder="Ej: Eres un asistente de ventas de una tienda de tecnología. Sé amable, responde de forma concisa..."
                    className="w-full bg-white border border-zinc-200 rounded-lg p-4 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all leading-relaxed resize-none"
                  />
                  <div className="absolute bottom-3.5 right-4 text-[10px] font-bold text-zinc-450">
                    {settings.systemPrompt.length} / 2000
                  </div>
                </div>
              </div>

              {/* Welcome Message Card */}
              <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Mensaje de bienvenida</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Este es el mensaje inicial que recibirán los clientes nuevos al iniciar una conversación.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={settings.welcomeMessage}
                    onChange={e => setSettings(s => ({ ...s, welcomeMessage: e.target.value.slice(0, 500) }))}
                    placeholder="Ej: ¡Hola! Bienvenido a nuestra tienda..."
                    className="w-full bg-white border border-zinc-200 rounded-lg p-4 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all leading-relaxed resize-none"
                  />
                  <div className="absolute bottom-3.5 right-4 text-[10px] font-bold text-zinc-450">
                    {settings.welcomeMessage.length} / 500
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Agregar botón</span>
                  </button>
                  
                  <button className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Vista previa</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Catálogo e IA */}
          {activeTab === 'catalogo' && (
            <div className="space-y-5 animate-in">
              <div className="p-6 bg-white border border-zinc-200 rounded-lg space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Entrenamiento por producto</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Controla qué productos puede sugerir la IA y dale instrucciones específicas de recomendación.
                  </p>
                </div>

                <div className="divide-y divide-zinc-150 border-t border-zinc-100">
                  {products.length === 0 ? (
                    <p className="text-center py-8 text-zinc-400 text-xs font-semibold">No hay productos registrados en el catálogo.</p>
                  ) : (
                    products.map(p => {
                      const isEditing = editingProductId === p.id
                      return (
                        <div key={p.id} className="py-4 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-zinc-950">{p.name}</h4>
                              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                                ${p.price.toLocaleString('es-CO')} · {p.active ? 'Activo' : 'Inactivo'}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Recommend toggle */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-zinc-400">Recomendar</span>
                                <input
                                  type="checkbox"
                                  checked={p.aiRecommendation}
                                  onChange={e => handleSaveProductAI(p.id, e.target.checked, p.aiDescription)}
                                  className="w-3.5 h-3.5 rounded border-zinc-350 text-emerald-600 focus:ring-emerald-500/20"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingProductId(null)
                                  } else {
                                    setEditingProductId(p.id)
                                    setEditingAiDescription(p.aiDescription)
                                  }
                                }}
                                className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 transition-colors"
                              >
                                {isEditing ? 'Cancelar' : 'Entrenar'}
                              </button>
                            </div>
                          </div>

                          {isEditing && (
                            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-lg space-y-3 animate-in">
                              <label className="text-[10px] font-bold text-zinc-400 block">Detalles adicionales para la IA (Ej: tallas, cuidados, material):</label>
                              <textarea
                                rows={3}
                                value={editingAiDescription}
                                onChange={e => setEditingAiDescription(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold outline-none focus:border-emerald-500 transition-all resize-none text-zinc-950 placeholder:text-zinc-300"
                                placeholder="Escribe instrucciones especiales que el bot usará para describir este producto..."
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleSaveProductAI(p.id, p.aiRecommendation, editingAiDescription)}
                                  disabled={savingProductId === p.id}
                                  className="flex items-center gap-1.5 h-8 px-4 bg-zinc-950 text-white rounded-lg text-[10px] font-bold tracking-wide cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                  {savingProductId === p.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                  <span>Guardar Instrucciones</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Respuestas Rápidas (FAQ) */}
          {activeTab === 'respuestas' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-in">
              {/* Form to add FAQ */}
              <div className="md:col-span-5 p-5 bg-white border border-zinc-200 rounded-lg space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900">Agregar FAQ</h3>
                  <p className="text-[10px] text-zinc-400 mt-1">Suministra respuestas manuales para que el bot responda preguntas comunes.</p>
                </div>

                <form onSubmit={handleAddFaq} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wider">Pregunta clave (Palabras clave)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Metodos de pago"
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500/35 text-zinc-950 placeholder:text-zinc-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wider">Respuesta automática</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Aceptamos Nequi, Daviplata, Mercado Pago y Contra entrega en Bogota..."
                      value={newAnswer}
                      onChange={e => setNewAnswer(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded-lg p-3 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500/35 text-zinc-950 placeholder:text-zinc-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingFaq}
                    className="w-full flex items-center justify-center gap-1.5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isAddingFaq ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Añadir al bot</span>
                  </button>
                </form>
              </div>

              {/* FAQs List */}
              <div className="md:col-span-7 p-5 bg-white border border-zinc-200 rounded-lg space-y-4">
                <h3 className="text-xs font-bold text-zinc-900">Base de conocimiento del agente ({faqs.length})</h3>

                <div className="divide-y divide-zinc-100 max-h-[350px] overflow-y-auto pr-1">
                  {faqs.length === 0 ? (
                    <p className="text-center py-16 text-zinc-400 text-xs italic font-bold">No hay preguntas de respuestas rápidas creadas.</p>
                  ) : (
                    faqs.map(faq => (
                      <div key={faq.id} className="py-3 flex items-start justify-between gap-4 group">
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-zinc-950 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{faq.question}</span>
                          </h4>
                          <p className="text-[10px] text-zinc-450 leading-relaxed font-semibold pr-2 pl-3">{faq.answer}</p>
                        </div>

                        <button
                          onClick={() => handleDeleteFaq(faq.id)}
                          disabled={deletingFaqId === faq.id}
                          className="w-8 h-8 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors border-none shrink-0"
                          title="Eliminar FAQ"
                        >
                          {deletingFaqId === faq.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Comportamiento */}
          {activeTab === 'comportamiento' && (
            <div className="space-y-5 animate-in">
              <div className="p-6 bg-white border border-zinc-200 rounded-lg space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Parámetros de conversación</h3>
                  <p className="text-xs text-zinc-500 mt-1">Ajusta el tono de voz de la IA, reglas de stock y tiempos de respuesta.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 tracking-wider">Tono de voz de la IA</label>
                    <select
                      value={behavior.tone}
                      onChange={e => setBehavior(b => ({ ...b, tone: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold outline-none text-zinc-700 focus:bg-white focus:border-zinc-300"
                    >
                      <option value="Formal">Formal y Corporativo</option>
                      <option value="Informal">Informal y Cercano (Tú)</option>
                      <option value="Divertido">Divertido (Uso de emojis)</option>
                      <option value="Persuasivo">Persuasivo y Enfocado en Ventas</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500 tracking-wider">Idioma predeterminado</label>
                    <select
                      value={behavior.language}
                      onChange={e => setBehavior(b => ({ ...b, language: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold outline-none text-zinc-700 focus:bg-white focus:border-zinc-300"
                    >
                      <option value="Español">Español (LATAM)</option>
                      <option value="Inglés">Inglés (English)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Toggle Out of stock */}
                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 leading-none">Permitir venta sin stock</h4>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-1">La IA ofrecerá productos aunque tengan stock en 0.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={behavior.comprarSinStock}
                        onChange={e => setBehavior(b => ({ ...b, comprarSinStock: e.target.checked }))}
                      />
                      <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Toggle Ask for email */}
                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 leading-none">Exigir correo electrónico</h4>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-1">El agente de IA pedirá email obligatoriamente antes del checkout.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={behavior.pedirEmail}
                        onChange={e => setBehavior(b => ({ ...b, pedirEmail: e.target.checked }))}
                      />
                      <div className="w-9 h-5 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Timeout */}
                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 leading-none">Espera para intervención humana</h4>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-1">Tiempo que el bot se silenciará tras mensaje del asesor.</p>
                    </div>
                    <select
                      value={behavior.timeout}
                      onChange={e => setBehavior(b => ({ ...b, timeout: e.target.value }))}
                      className="bg-white border border-zinc-200 rounded-lg text-xs font-bold px-2 py-1 focus:outline-none text-zinc-700 cursor-pointer h-8 w-24 transition-colors"
                    >
                      <option value="5 min">5 min</option>
                      <option value="10 min">10 min</option>
                      <option value="15 min">15 min</option>
                      <option value="Nunca">Nunca</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveBehavior}
                    disabled={saving}
                    className="flex items-center gap-1.5 h-10 px-6 bg-zinc-950 text-white rounded-lg text-xs font-bold cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Guardar Comportamiento</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Integraciones */}
          {activeTab === 'integraciones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in">
              {/* WhatsApp Integration card */}
              <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 leading-none">WhatsApp API Gateway</h4>
                      <span className="text-[9px] text-emerald-600 font-bold block mt-1">Activo (Evolution API)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    Conexión nativa de mensajería bidireccional de alto rendimiento.
                  </p>
                  
                  <div className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-lg text-[9px] font-bold text-zinc-500 space-y-1">
                    <div>Instancia: <span className="text-zinc-800 font-bold">store_{storeId.slice(0, 8)}</span></div>
                    <div>Token de conexión: <span className="text-zinc-800 font-bold font-mono">45d55ad587...</span></div>
                  </div>
                </div>

                <Link
                  href="/configuracion?tab=integraciones"
                  className="w-full text-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[10px] font-bold transition-all"
                >
                  Gestionar Conexión
                </Link>
              </div>

              {/* Mercado Pago card */}
              <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 leading-none">Pasarela Mercado Pago</h4>
                      <span className="text-[9px] text-blue-600 font-bold block mt-1">Conectado (OAuth 2.0)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    Los links de pago se generan automáticamente por la IA tras confirmar el pedido.
                  </p>
                </div>

                <Link
                  href="/configuracion?tab=pagos"
                  className="w-full text-center py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[10px] font-bold transition-all"
                >
                  Configurar Pagos
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Mobile Simulator (Spans 4/12) */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Vista previa del chat</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Así verán tus clientes la conversación con tu agente.
            </p>
          </div>

          {/* WhatsApp Phone Mockup Frame */}
          <div className="flex flex-col h-[520px] bg-[#E5DDD5] border border-zinc-200 rounded-lg overflow-hidden shadow-none select-none relative">
            
            {/* WhatsApp Mock Top Bar */}
            <div className="bg-[#0B665C] px-3.5 py-2.5 flex items-center justify-between shrink-0 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Left Back Arrow Mock */}
                <span className="text-sm font-bold opacity-80 cursor-pointer hover:opacity-100 shrink-0">{"‹"}</span>
                
                {/* Avatar Profile */}
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 text-emerald-700 font-extrabold text-[13px]">
                  🤖
                </div>
                
                <div className="min-w-0 flex flex-col justify-center">
                  <h4 className="text-xs font-bold leading-none truncate flex items-center gap-1">
                    <span>{storeName}</span>
                    {/* Green Verified Badge */}
                    <span className="w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 border border-emerald-600 text-[6px]">✔</span>
                  </h4>
                  <span className="text-[9px] opacity-75 font-semibold mt-0.5 leading-none">En línea</span>
                </div>
              </div>

              <button 
                onClick={() => setChatMessages([
                  { 
                    sender: 'bot', 
                    text: settings.welcomeMessage || '¡Hola! Bienvenido.', 
                    time: '10:30 AM',
                    options: ['Ver productos', 'Recomendaciones', 'Consultar pedido']
                  }
                ])}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center active:scale-90 transition-transform shrink-0"
                title="Reiniciar chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  <div className={cn("flex w-full", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "relative max-w-[85%] rounded-lg px-3.5 py-2 text-[12px] shadow-none leading-relaxed",
                      msg.sender === 'user' 
                        ? 'bg-[#DCF8C6] text-zinc-900 rounded-tr-none' 
                        : 'bg-white text-zinc-900 rounded-tl-none'
                    )}>
                      {/* Message text */}
                      <p className="font-semibold whitespace-pre-line">{msg.text}</p>
                      
                      <span className="block text-[8px] text-zinc-400 text-right mt-1 leading-none font-bold">
                        {msg.time}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Button Options below welcome message */}
                  {msg.options && (
                    <div className="flex flex-wrap gap-1.5 justify-start pl-1">
                      {msg.options.map((opt, optIdx) => (
                        <button 
                          key={optIdx}
                          onClick={() => {
                            setInputText(opt)
                          }}
                          className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-none transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                          {opt === 'Ver productos' && <ShoppingBag className="w-3 h-3 text-zinc-400" />}
                          {opt === 'Recomendaciones' && <Star className="w-3 h-3 text-zinc-400" />}
                          {opt === 'Consultar pedido' && <MessageSquare className="w-3 h-3 text-zinc-400" />}
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex w-full justify-start animate-pulse">
                  <div className="bg-white rounded-lg px-3.5 py-2 text-[10px] text-zinc-400 font-bold shadow-none rounded-tl-none">
                    Agente escribiendo...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input form bar */}
            <form onSubmit={handleSendMessage} className="bg-white border-t border-zinc-200/80 p-2.5 flex items-center gap-2 shrink-0">
              <Smile className="w-5 h-5 text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-600" />
              <Paperclip className="w-5 h-5 text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-600" />
              
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-1.5 text-xs outline-none focus:bg-white focus:border-zinc-300 transition-all font-semibold"
              />
              
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 shrink-0 shadow-none cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            </form>

          </div>

          {/* Simulated Chat Warning Footer */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-550 font-bold leading-normal">
              El agente usará IA para entender y responder de forma automática según las instrucciones configuradas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
