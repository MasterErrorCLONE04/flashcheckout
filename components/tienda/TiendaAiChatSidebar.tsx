'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Trash2,
  ChevronLeft,
  Check,
  Undo2,
  Loader2,
  Wand2,
  Palette,
  FileText,
  Layers,
  ArrowRight,
  Bot,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIScope } from './AiDesignModal'
import { Product } from './types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  scope?: AIScope
  hasProposalActions?: boolean
  changesSummary?: string[]
  generatedImageUrl?: string
  imageTarget?: 'banner' | 'logo'
}

interface TiendaAiChatSidebarProps {
  storeName: string
  products?: Product[]
  onGenerate: (params: { prompt: string; scope: AIScope }) => Promise<void>
  onApplyImage?: (imageUrl: string, target: 'banner' | 'logo') => void
  isGenerating: boolean
  aiProposalActive: boolean
  onAcceptProposal: () => void
  onUndoProposal: () => void
  onClose?: () => void
}

const INSPIRATION_PROMPTS = [
  {
    title: '✨ Generar Portada / Banner con IA',
    prompt: 'Genera una imagen comercial de portada para mi tienda con alta definición, iluminación cinemática y estilo editorial',
    scope: 'all' as AIScope,
  },
  {
    title: '🎨 Generar Logotipo con IA',
    prompt: 'Genera un logotipo vectorial minimalista y geométrico sobre fondo blanco puro para mi marca',
    scope: 'all' as AIScope,
  },
  {
    title: '☕ Café Gourmet & Tonos Tierra',
    prompt: 'Tienda de café especial de origen. Paleta cálida con tonos tierra, crema y acento café oscuro. Tipografía editorial elegante, hero enfocado en café recién tostado y preguntas frecuentes sobre envíos.',
    scope: 'all' as AIScope,
  },
  {
    title: '👟 Streetwear Urbano & Minimal',
    prompt: 'Marca de ropa urbana y zapatillas streetwear. Estética monocromática moderna en negro y grafito. Tipografía futurista bold y collage de alta energía.',
    scope: 'all' as AIScope,
  },
  {
    title: '🌸 Skincare Natural & Botánico',
    prompt: 'Línea de cuidado facial y cosméticos orgánicos. Fondo limpio, toques arena suave y rosa palo. Textos centrados en ingredientes botánicos, pureza y ritual en 3 pasos.',
    scope: 'all' as AIScope,
  },
  {
    title: '💎 Joyería de Lujo & Silencioso',
    prompt: 'Joyería fina en plata y oro con diseño minimalista contemporáneo. Estética de lujo silencioso Waterdrop, fuentes serif refinadas y fotografía macro de joyas.',
    scope: 'all' as AIScope,
  },
  {
    title: '⚡ Tecnología & Gadgets',
    prompt: 'Tienda de gadgets de alta tecnología y accesorios inteligentes. Estilo limpio y tecnológico, acentos azul cobalto sobrio y tarjetas con especificaciones claras.',
    scope: 'all' as AIScope,
  },
  {
    title: '🎨 Solo Paleta & Tipografía',
    prompt: 'Aplica una paleta moderna y sofisticada con fondo crema suave, acentos carbón neutro y tipografía sans-serif editorial.',
    scope: 'style' as AIScope,
  },
]

export function TiendaAiChatSidebar({
  storeName,
  products = [],
  onGenerate,
  onApplyImage,
  isGenerating,
  aiProposalActive,
  onAcceptProposal,
  onUndoProposal,
  onClose,
}: TiendaAiChatSidebarProps) {
  const realProducts = products.filter(p => !p.id.startsWith('demo-') && !p.id.startsWith('preview-'))
  const totalStock = realProducts.reduce((acc, p) => acc + Math.max(0, Number(p.stock) || 0), 0)
  const uniqueCategories = Array.from(
    new Set(realProducts.map(p => (p.category || '').trim()).filter(Boolean))
  )

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola! Soy tu arquitecto de tienda con IA para **${storeName || 'tu tienda'}**.${
        realProducts.length > 0
          ? `\n\n📦 **Contexto conectado:** He detectado **${realProducts.length} productos reales** (${totalStock} uds en stock) en ${uniqueCategories.length || 1} colección(es)${uniqueCategories.length ? ` (*${uniqueCategories.slice(0, 3).join(', ')}*)` : ''}. Diseñaré tu página usando tus productos, precios y fotos reales.`
          : ''
      }

Pídeme cualquier diseño o ajuste en lenguaje natural:
• *"Diseña una tienda editorial premium enfocada en mis productos con más stock"*
• *"Pon modo oscuro elegante con 3 columnas y oculta las preguntas frecuentes"*
• *"Genera una foto de portada cinematográfica para mi tienda"*`,
      timestamp: 'Ahora',
    },
  ])

  const [input, setInput] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [selectedScope, setSelectedScope] = useState<AIScope>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isGenerating, isGeneratingImage])

  const handleSendMessage = async (textToSend?: string, scopeToSend?: AIScope) => {
    const text = (textToSend || input).trim()
    const scope = scopeToSend || selectedScope

    if (!text || isGenerating || isGeneratingImage) return

    const userMsgId = `user-${Date.now()}`
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scope,
      },
    ]

    setMessages(newMessages)
    setInput('')

    // Detectar si el usuario está solicitando generar una imagen específica
    const isImageRequest =
      /(genera|crea|diseña|haz)\s+(una\s+)?(imagen|foto|banner|portada|logo|fotografia)/i.test(text) ||
      text.startsWith('/imagen') ||
      text.startsWith('/image')

    if (isImageRequest) {
      setIsGeneratingImage(true)
      const isLogo = /logo/i.test(text)
      const target: 'banner' | 'logo' = isLogo ? 'logo' : 'banner'

      try {
        const res = await fetch('/api/stores/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, target }),
        })
        const data = await res.json()

        if (!res.ok || !data.imageUrl) {
          throw new Error(data.error || 'No se pudo generar la imagen.')
        }

        setMessages([
          ...newMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: `He generado esta imagen con IA para **${isLogo ? 'el logotipo' : 'el banner de portada'}**. Puedes aplicarla a tu tienda con los botones de abajo:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            generatedImageUrl: data.imageUrl,
            imageTarget: target,
          },
        ])
      } catch (err: any) {
        setMessages([
          ...newMessages,
          {
            id: `assistant-error-${Date.now()}`,
            role: 'assistant',
            content: `No se pudo generar la imagen: ${err?.message || 'Error en el servicio de IA'}. Intenta con otra descripción.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } finally {
        setIsGeneratingImage(false)
      }
      return
    }

    try {
      await onGenerate({ prompt: text, scope })

      const summaryItems: string[] = []
      if (realProducts.length > 0) {
        summaryItems.push(`📦 ${realProducts.length} productos en stock sincronizados`)
      }
      if (scope === 'all' || scope === 'style') {
        summaryItems.push('🎨 Paleta de colores y tipografía')
        summaryItems.push('✨ Tarjetas y botones actualizados')
      }
      if (scope === 'all' || scope === 'copy') {
        summaryItems.push('📝 Copy comercial adaptado a tu catálogo')
        summaryItems.push('❓ Preguntas frecuentes y garantías')
      }
      if (scope === 'all') {
        summaryItems.push('🧱 Distribución responsiva (Web, Tablet y Móvil)')
      }

      setMessages([
        ...newMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content:
            realProducts.length > 0
              ? `¡Listo! He diseñado tu tienda tomando como base tus **${realProducts.length} productos activos** (${totalStock} unidades en stock). Haz clic en cualquier texto, botón, imagen o producto del lienzo para editarlo al instante.`
              : `He aplicado los cambios solicitados a tu tienda. Haz clic en cualquier elemento del simulador central para personalizarlo.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasProposalActions: true,
          changesSummary: summaryItems,
        },
      ])
    } catch {
      setMessages([
        ...newMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: 'Ocurrió un problema al procesar la solicitud con IA. Por favor intenta reformular tu indicación.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversación reiniciada. ¿Qué cambios deseas realizar en **${storeName || 'tu tienda'}**?`,
        timestamp: 'Ahora',
      },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <aside className="w-[340px] xl:w-[370px] shrink-0 h-full border-r border-zinc-200/90 bg-white text-zinc-900 flex flex-col overflow-hidden select-none z-10 shadow-xs">
      {/* Top Header - Clean Light Aesthetic */}
      <div className="px-4 py-3 bg-white border-b border-zinc-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-zinc-950 tracking-wide">Copiloto IA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-500 font-medium leading-none mt-0.5">
              Diseño asistido en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer border-0 bg-transparent"
            title="Limpiar chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer border-0 bg-transparent"
              title="Ocultar panel de IA"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Live Inventory & Stock Context Bar */}
      <div className="px-3.5 py-2 bg-emerald-50/80 border-b border-emerald-200/70 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Package className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="text-[10.5px] font-bold text-emerald-950 truncate">
            {realProducts.length > 0
              ? `${realProducts.length} productos · ${totalStock} en stock`
              : `${products.length} productos demo activos`}
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-emerald-600/15 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wider shrink-0">
          IA Conectada
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-zinc-50/50">
        {messages.map(msg => {
          const isUser = msg.role === 'user'

          return (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col',
                isUser ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[92%] rounded-2xl p-3.5 text-left transition-all leading-relaxed',
                  isUser
                    ? 'bg-zinc-900 text-white rounded-tr-xs font-normal shadow-xs'
                    : 'bg-white border border-zinc-200/90 text-zinc-800 rounded-tl-xs shadow-2xs'
                )}
              >
                {/* Assistant header */}
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-zinc-900 font-bold text-[10.5px]">
                    <Bot className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Diseñador IA</span>
                    <span className="text-[9.5px] text-zinc-400 font-normal ml-auto">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-[11.5px] leading-relaxed">
                  {msg.content}
                </div>

                {/* AI Generated Image card */}
                {msg.generatedImageUrl && (
                  <div className="mt-2.5 space-y-2">
                    <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 flex items-center justify-center max-h-56">
                      <img
                        src={msg.generatedImageUrl}
                        alt="Imagen generada con IA"
                        className="w-full h-auto max-h-56 object-contain"
                      />
                    </div>
                    {onApplyImage && (
                      <div className="flex flex-col gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            onApplyImage(msg.generatedImageUrl!, msg.imageTarget || 'banner')
                          }
                          className="w-full flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-1.5 px-2.5 rounded-lg text-[11px] transition-colors cursor-pointer border-0 shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {msg.imageTarget === 'logo'
                              ? 'Aplicar como Logotipo'
                              : 'Aplicar como Portada Principal'}
                          </span>
                        </button>
                        {msg.imageTarget !== 'logo' && (
                          <button
                            type="button"
                            onClick={() => onApplyImage(msg.generatedImageUrl!, 'logo')}
                            className="w-full flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-1.5 px-2.5 rounded-lg text-[11px] transition-colors cursor-pointer border border-zinc-200"
                          >
                            <span>O aplicar como Logotipo</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Changes Summary Badges */}
                {msg.changesSummary && msg.changesSummary.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-150 flex flex-wrap gap-1">
                    {msg.changesSummary.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons inside bubble if proposal is active */}
                {msg.hasProposalActions && aiProposalActive && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-200 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onAcceptProposal}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-1.5 px-2.5 rounded-lg text-[11px] transition-colors cursor-pointer border-0 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mantener</span>
                    </button>
                    <button
                      type="button"
                      onClick={onUndoProposal}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 text-zinc-700 font-bold py-1.5 px-2.5 rounded-lg text-[11px] transition-colors cursor-pointer border border-zinc-300 shadow-2xs"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Deshacer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Live Loading Indicator */}
        {isGenerating && (
          <div className="flex items-start gap-2 animate-in fade-in duration-200">
            <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-xs p-3.5 text-left max-w-[90%] shadow-2xs">
              <div className="flex items-center gap-2 text-zinc-950 font-bold text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                <span>Generando diseño y aplicando cambios...</span>
              </div>
              <p className="text-[10.5px] text-zinc-500 mt-1 leading-snug">
                Sincronizando paleta, tipografía, bloques y redacción en vivo.
              </p>
            </div>
          </div>
        )}

        {/* Image Generation Loading Indicator */}
        {isGeneratingImage && (
          <div className="flex items-start gap-2 animate-in fade-in duration-200">
            <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-xs p-3.5 text-left max-w-[90%] shadow-2xs">
              <div className="flex items-center gap-2 text-zinc-950 font-bold text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                <span>Sintetizando imagen con IA (~8-10s)...</span>
              </div>
              <p className="text-[10.5px] text-zinc-500 mt-1 leading-snug">
                Generando imagen en alta definición y optimizando para tu tienda.
              </p>
            </div>
          </div>
        )}

        {/* Inspiration chips (shown initially or when chat is short) */}
        {messages.length <= 2 && !isGenerating && (
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-zinc-500 mb-2">
              <Wand2 className="w-3 h-3 text-zinc-700" />
              <span>Plantillas e inspiración rápida:</span>
            </div>
            <div className="space-y-1.5">
              {INSPIRATION_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt, item.scope)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer group flex items-center justify-between shadow-2xs"
                >
                  <span className="text-[11px] font-semibold truncate group-hover:text-zinc-950 transition-colors">
                    {item.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scope Selector Bar */}
      <div className="px-3 pt-2.5 pb-1 bg-white border-t border-zinc-200/80">
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-[10.5px] font-bold">
          <button
            type="button"
            onClick={() => setSelectedScope('all')}
            className={cn(
              'flex-1 py-1 rounded-lg text-center transition-all cursor-pointer border-0 flex items-center justify-center gap-1',
              selectedScope === 'all'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
            )}
          >
            <Layers className="w-3 h-3" />
            <span>Todo</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedScope('style')}
            className={cn(
              'flex-1 py-1 rounded-lg text-center transition-all cursor-pointer border-0 flex items-center justify-center gap-1',
              selectedScope === 'style'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
            )}
          >
            <Palette className="w-3 h-3" />
            <span>Estilo</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedScope('copy')}
            className={cn(
              'flex-1 py-1 rounded-lg text-center transition-all cursor-pointer border-0 flex items-center justify-center gap-1',
              selectedScope === 'copy'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
            )}
          >
            <FileText className="w-3 h-3" />
            <span>Textos</span>
          </button>
        </div>
      </div>

      {/* Input Composer Box */}
      <div className="p-3 bg-white shrink-0">
        <div className="relative bg-white border border-zinc-250 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900/10 rounded-xl transition-all shadow-xs">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating || isGeneratingImage}
            placeholder="Pídele un cambio o que genere una imagen a la IA..."
            className="w-full bg-transparent px-3 pt-2.5 pb-8 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none resize-none leading-relaxed"
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            <span className="text-[9.5px] text-zinc-400 font-medium hidden sm:inline">
              Enter ↵
            </span>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isGenerating || isGeneratingImage}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border-0',
                input.trim() && !isGenerating && !isGeneratingImage
                  ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-xs'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              )}
              title="Enviar mensaje"
            >
              {isGenerating || isGeneratingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1 text-[9.5px] text-zinc-400">
          <span>Shift + Enter para salto de línea</span>
          {aiProposalActive && (
            <span className="text-zinc-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-ping" />
              Propuesta en vivo
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
