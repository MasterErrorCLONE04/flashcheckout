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
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  time: string
  type?: 'products_list' | 'discount_card' | 'text'
  products?: { name: string; sales: string; price: string }[]
  coupon?: { code: string; desc: string; validity: string; active: boolean }
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
}

export default function NovaChatClient({
  merchantName,
  store,
  activeProductsCount,
  ordersCount,
  activeChatsCount
}: NovaChatClientProps) {
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Compute initials based on the real merchant name
  const initials = merchantName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DV'

  // Preloaded greeting message using real database values
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'm1',
      sender: 'bot',
      text: `¡Hola ${merchantName.split(' ')[0]}! 👋 Soy Nova, tu asistente de ventas de FlashCheckout.\n¿En qué puedo ayudarte hoy para optimizar tu tienda "${store.name}"?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    }
  ])

  // Scroll to bottom on new messages
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

  // Send message to actual DeepSeek endpoint
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
          history: messages.slice(-10).map(m => ({
            sender: m.sender,
            text: m.text
          }))
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
        products: data.products,
        coupon: data.coupon
      }

      setMessages(prev => [...prev, botMsg])
    } catch {
      toast.error('Error al comunicarse con Nova')
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

  // Handle clicking on quick suggestions
  const handleSuggestionClick = (suggestion: string) => {
    let query = ''
    switch (suggestion) {
      case 'producto':
        query = 'Ayúdame a crear un nuevo producto'
        break
      case 'pedidos':
        query = 'Muéstrame mis últimos pedidos pendientes'
        break
      case 'reporte':
        query = 'Genera un reporte del rendimiento de ventas'
        break
      case 'descuento':
        query = 'Crea un cupón de descuento activo'
        break
      case 'tienda':
        query = `¿Cómo configuro el logo y apariencia de mi tienda ${store.name}?`
        break
      default:
        query = suggestion
    }
    handleSend(query)
  }

  return (
    <div className="space-y-6 pb-2 animate-in duration-300 font-sans text-left">
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
        
        {/* LEFT COLUMN: Chat Console (8/12) */}
        <div className="lg:col-span-8 flex flex-col justify-between border border-zinc-200 rounded-2xl bg-white shadow-none overflow-hidden h-[calc(100vh-140px)] min-h-[500px]">
          
          {/* Header */}
          <header className="p-4 border-b border-zinc-150 flex items-center justify-between shrink-0 bg-white select-none">
            <div className="text-left space-y-0.5">
              <h2 className="text-lg font-black text-zinc-950 tracking-tight">Hablar con Nova</h2>
              <p className="text-[10px] xl:text-xs font-semibold text-zinc-400">Tu asistente de ventas inteligente</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200/50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] xl:text-xs font-bold text-zinc-800">Nova en línea</span>
            </div>
          </header>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-4 xl:p-6 space-y-6 bg-zinc-50/50 scrollbar-none">
            {messages.map((m) => {
              const isBot = m.sender === 'bot'
              return (
                <div key={m.id} className={cn("flex gap-3 max-w-[85%] animate-in fade-in duration-200", isBot ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right")}>
                  
                  {/* Avatar */}
                  <div className="shrink-0 select-none">
                    {isBot ? (
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-none">
                        <Bot className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-950 flex items-center justify-center text-white border border-zinc-900 shadow-none text-xs font-bold font-sans">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-xs font-black text-zinc-800">{isBot ? 'Nova' : merchantName.split(' ')[0]}</span>
                      <span className="text-[10px] font-semibold text-zinc-400">{m.time}</span>
                    </div>

                    <div className={cn(
                      "p-3.5 rounded-2xl shadow-none text-xs xl:text-sm font-medium leading-relaxed break-words border",
                      isBot 
                        ? "bg-white border-zinc-200 text-zinc-850" 
                        : "bg-[#6F42C1] border-[#5E32B0] text-white"
                    )}>
                      {/* Normal text renderer */}
                      <p className="whitespace-pre-line">{m.text}</p>

                      {/* Custom UI components based on reply type */}
                      {isBot && m.type === 'products_list' && m.products && (
                        <div className="mt-4 space-y-2">
                          <div className="bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden divide-y divide-zinc-150">
                            {m.products.map((p, idx) => (
                              <div key={idx} className="p-3 flex items-center justify-between bg-white/50">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-[10px] font-black text-zinc-400 w-4">{idx + 1}.</span>
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-zinc-900 truncate text-xs xl:text-sm">{p.name}</h5>
                                    <p className="text-[10px] font-semibold text-zinc-405 mt-0.5">{p.sales}</p>
                                  </div>
                                </div>
                                <span className="font-black text-zinc-950 text-xs xl:text-sm shrink-0">{p.price}</span>
                              </div>
                            ))}
                          </div>
                          <Link href="/productos" className="block w-full">
                            <button className="w-full mt-2 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer">
                              Ver inventario completo
                            </button>
                          </Link>
                        </div>
                      )}

                      {isBot && m.type === 'discount_card' && m.coupon && (
                        <div className="mt-4 space-y-2">
                          <div className="bg-emerald-50/30 border border-emerald-100/60 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
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
                    </div>

                    {/* Actions bar for bot replies */}
                    {isBot && (
                      <div className="flex items-center gap-3 pl-2 select-none">
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

            {/* Simulated typing status */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto text-left animate-pulse">
                <div className="shrink-0 select-none">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-none">
                    <Bot className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-zinc-800">Nova</span>
                  <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-none text-zinc-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input control box */}
          <footer className="p-3 xl:p-4 border-t border-zinc-150 bg-white shrink-0 space-y-3">
            
            {/* Input textarea */}
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
              <button onClick={() => toast.info('Adjuntar archivos estará disponible en producción')} className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 cursor-pointer">
                <Paperclip className="w-4.5 h-4.5" />
              </button>
              <textarea 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(inputText)
                  }
                }}
                rows={1}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-transparent border-none focus:outline-none resize-none text-xs xl:text-sm font-semibold text-zinc-800 placeholder-zinc-400 py-1"
              />
              <button 
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim() || isTyping}
                className="w-8 h-8 rounded-full bg-[#6F42C1] hover:bg-purple-700 text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick action buttons list */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 justify-start">
              {[
                { label: 'Crear producto', value: 'producto' },
                { label: 'Ver pedidos', value: 'pedidos' },
                { label: 'Generar reporte', value: 'reporte' },
                { label: 'Crear descuento', value: 'descuento' },
                { label: 'Configurar tienda', value: 'tienda' }
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(btn.value)}
                  className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100/50 hover:border-zinc-300 text-zinc-700 text-[11px] xl:text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer select-none active:scale-[0.97]"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </footer>

        </div>

        {/* RIGHT COLUMN: Tooling and Store Context (4/12) */}
        <div className="lg:col-span-4 space-y-6 text-left select-none">
          
          {/* Card 1: Nova puede ayudarte con */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-none">
            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Nova puede ayudarte con:</h3>
            
            <div className="space-y-1">
              {[
                { label: 'Gestionar productos', desc: 'Crear, editar o eliminar productos', href: '/productos' },
                { label: 'Ver pedidos y ventas', desc: 'Consultar pedidos, ventas y métricas', href: '/pedidos' },
                { label: 'Crear descuentos', desc: 'Generar cupones y promociones', href: '/descuentos' },
                { label: 'Configurar tienda', desc: 'Editar logo, colores y ajustes', href: '/tienda' },
                { label: 'Respuestas automáticas', desc: 'Activar o desactivar plantillas', href: '/automatizaciones' }
              ].map((tool, idx) => (
                <Link 
                  key={idx}
                  href={tool.href}
                  className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl transition-all group select-none"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs xl:text-sm font-extrabold text-zinc-900 group-hover:text-emerald-800 transition-colors leading-tight">{tool.label}</h4>
                    <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 mt-0.5 truncate">{tool.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-450 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>

            <div className="h-px w-full bg-zinc-100 pt-1" />

            <Link 
              href="/automatizaciones" 
              className="text-xs xl:text-sm font-bold text-[#6F42C1] hover:text-purple-700 flex items-center justify-between px-2 pt-1 select-none"
            >
              <span>Ver todas las herramientas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Contexto de tu tienda */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-none">
            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Contexto de tu tienda</h3>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-650 shrink-0">
                  <Store className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-405 block tracking-wider uppercase leading-none">Tienda</span>
                  <span className="text-xs xl:text-sm font-extrabold text-zinc-950 mt-1 block leading-none">{store.name}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Crown className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-405 block tracking-wider uppercase leading-none">Plan actual</span>
                  <span className="text-xs xl:text-sm font-extrabold text-zinc-950 mt-1 block leading-none">
                    {store.verificationLevel === 0 ? 'Básico' : 'Pro'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
                  store.whatsappConnected ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-zinc-50 border-zinc-200 text-zinc-400"
                )}>
                  <CheckCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-405 block tracking-wider uppercase leading-none">Estado WhatsApp</span>
                  <span className={cn(
                    "text-xs xl:text-sm font-extrabold mt-1 block leading-none",
                    store.whatsappConnected ? "text-emerald-700" : "text-zinc-500"
                  )}>
                    {store.whatsappConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
                  store.mpConnected ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-zinc-50 border-zinc-200 text-zinc-400"
                )}>
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-405 block tracking-wider uppercase leading-none">Conexión de pagos</span>
                  <span className="text-xs xl:text-sm font-extrabold text-zinc-950 mt-1 block leading-none">
                    {store.mpConnected ? 'Mercado Pago (Conectado)' : 'Mercado Pago (Desconectado)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Actividad de Nova */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-none">
            <div className="flex justify-between items-center">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Actividad de tu Negocio</h3>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <span className="truncate text-zinc-850">{activeProductsCount} productos activos</span>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 ml-2 select-none">Catálogo</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                  <span className="truncate text-zinc-850">{ordersCount} pedidos registrados</span>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 ml-2 select-none">Ventas</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
                  <span className="truncate text-zinc-850">{activeChatsCount} chats de clientes</span>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0 ml-2 select-none">WhatsApp</span>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-100 pt-1" />

            <Link 
              href="/conversaciones" 
              className="text-xs xl:text-sm font-bold text-[#6F42C1] hover:text-purple-700 flex items-center justify-between px-2 pt-1 select-none"
            >
              <span>Ver bandeja de entrada</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  )
}
