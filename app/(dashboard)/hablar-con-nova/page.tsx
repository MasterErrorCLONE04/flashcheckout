"use client"

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
  ChevronLeft, 
  Plus, 
  Settings, 
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Clock,
  Ticket
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  time: string
  // For special custom card contents in replies
  type?: 'products_list' | 'discount_card' | 'text'
  products?: { name: string; sales: string; price: string }[]
  coupon?: { code: string; desc: string; validity: string; active: boolean }
}

export default function HablarConNovaPage() {
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Preloaded interactive chat messages based exactly on the screenshot
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: '¡Hola Juan! 👋 Soy Nova, tu asistente de ventas.\n¿En qué puedo ayudarte hoy?',
      time: '10:30 AM',
      type: 'text'
    },
    {
      id: 'm2',
      sender: 'user',
      text: '¿Cuáles fueron mis productos más vendidos en la última semana?',
      time: '10:30 AM',
      type: 'text'
    },
    {
      id: 'm3',
      sender: 'bot',
      text: 'Estos fueron tus productos más vendidos en los últimos 7 días:',
      time: '10:30 AM',
      type: 'products_list',
      products: [
        { name: 'Café de vainilla', sales: '128 unidades vendidas', price: '$1.280.000' },
        { name: 'Brownie de chocolate', sales: '96 unidades vendidas', price: '$960.000' },
        { name: 'Capuchino tradicional', sales: '78 unidades vendidas', price: '$780.000' }
      ]
    },
    {
      id: 'm4',
      sender: 'user',
      text: 'Crea un descuento del 15% para todos los cafés, válido hasta el domingo.',
      time: '10:31 AM',
      type: 'text'
    },
    {
      id: 'm5',
      sender: 'bot',
      text: '¡Listo! He creado el descuento que solicitaste.',
      time: '10:31 AM',
      type: 'discount_card',
      coupon: {
        code: '15%',
        desc: 'Descuento en cafés',
        validity: 'Válido hasta: domingo, 1 de junio de 2025',
        active: true
      }
    }
  ])

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Helper function to get current time format
  const getFormattedTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Simulated AI response selector based on user queries
  const getSimulatedNovaReply = (query: string): Partial<Message> => {
    const q = query.toLowerCase()
    
    if (q.includes('crear producto') || q.includes('nuevo producto') || q.includes('añade un producto')) {
      return {
        text: '¡Por supuesto! Puedo ayudarte a ingresar un nuevo producto a tu catálogo de Café del Valle. Por favor indícame:\n\n1. Nombre del producto\n2. Precio de venta\n3. Stock inicial\n\nO si prefieres, puedes crearlo directamente desde el panel visual en [Productos](file:///productos). 📦',
        type: 'text'
      }
    }
    
    if (q.includes('pedidos') || q.includes('ventas') || q.includes('facturación')) {
      return {
        text: 'He verificado la base de datos de tu negocio. Actualmente tienes **8 pedidos pendientes** y **25 ventas confirmadas** este mes. Puedes auditar los detalles en la sección de [Pedidos](file:///pedidos) o validar transferencias en [Pagos](file:///pagos). 🛒',
        type: 'text'
      }
    }

    if (q.includes('reporte') || q.includes('grafica') || q.includes('rendimiento')) {
      return {
        text: '¡Excelente! He generado un reporte general de rendimiento para ti.\n\nDurante los últimos 7 días, tu tienda Café del Valle obtuvo una facturación acumulada de **$3.020.000 COP** con un ticket promedio de $38.500 COP. Tus categorías más fuertes son Bebidas Calientes (65%) y Repostería (35%). 📈',
        type: 'text'
      }
    }

    if (q.includes('descuento') || q.includes('cupón') || q.includes('promoción')) {
      return {
        text: '¡Listo! He configurado y activado un cupón de descuento en tu tienda.',
        type: 'discount_card',
        coupon: {
          code: 'PROMO15',
          desc: 'Descuento especial del 15% en compras',
          validity: 'Válido hasta: domingo, 1 de junio de 2025',
          active: true
        }
      }
    }

    if (q.includes('tienda') || q.includes('apariencia') || q.includes('colores') || q.includes('logo')) {
      return {
        text: '¡Entendido! Para modificar la apariencia visual, logotipo, banner, tipografía o secciones de tu vitrina digital de WhatsApp, te recomiendo abrir el personalizador visual en la sección de [Tienda](file:///tienda). ¿Quieres que te asista desde aquí o prefieres ir al editor? 🎨',
        type: 'text'
      }
    }

    return {
      text: 'Entiendo tu solicitud sobre tu tienda Café del Valle. Estoy procesando la información y la configuraré de inmediato en el bot de atención virtual. ¿Hay algo específico que te gustaría ajustar sobre este tema? 🤖',
      type: 'text'
    }
  }

  // Trigger send message
  const handleSend = (textToSend: string) => {
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

    // Simulate typing delay
    setTimeout(() => {
      const novaReply = getSimulatedNovaReply(textToSend)
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: novaReply.text || 'Procesando...',
        time: getFormattedTime(),
        type: novaReply.type || 'text',
        products: novaReply.products,
        coupon: novaReply.coupon
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 1200)
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
        query = '¿Cómo configuro el logo y apariencia de mi tienda?'
        break
      default:
        query = suggestion
    }
    handleSend(query)
  }

  return (
    <div className="space-y-6 pb-2 animate-in duration-300">
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
        
        {/* LEFT COLUMN: Chat Console (8/12) */}
        <div className="lg:col-span-8 flex flex-col justify-between border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden h-[calc(100vh-140px)] min-h-[500px]">
          
          {/* Header */}
          <header className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
            <div className="text-left space-y-0.5">
              <h2 className="text-lg font-black text-zinc-950 tracking-tight">Hablar con Nova</h2>
              <p className="text-[10px] xl:text-xs font-semibold text-zinc-400">Tu asistente de ventas inteligente</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-200/50 rounded-full select-none">
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
                      <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Bot className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-950 flex items-center justify-center text-white border border-zinc-900 shadow-sm text-xs font-bold font-sans">
                        DV
                      </div>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-xs font-black text-zinc-800">{isBot ? 'Nova' : 'Tú'}</span>
                      <span className="text-[10px] font-semibold text-zinc-400">{m.time}</span>
                    </div>

                    <div className={cn(
                      "p-3.5 rounded-2xl shadow-sm text-xs xl:text-sm font-medium leading-relaxed break-words",
                      isBot 
                        ? "bg-white border border-zinc-200 text-zinc-850" 
                        : "bg-[#6F42C1] text-white"
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
                          <button className="w-full mt-2 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                            Ver reporte completo
                          </button>
                        </div>
                      )}

                      {isBot && m.type === 'discount_card' && m.coupon && (
                        <div className="mt-4 space-y-2">
                          <div className="bg-emerald-50/30 border border-emerald-100/60 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="px-2 py-1 bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-800 font-black text-xs shrink-0">
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
                              <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer select-none">
                                Ver descuento
                              </button>
                            </Link>
                            <button className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer select-none">
                              Compartir enlace
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions bar for bot replies */}
                    {isBot && (
                      <div className="flex items-center gap-3 pl-2 select-none">
                        <button className="text-zinc-400 hover:text-zinc-650 transition-colors" title="Copiar mensaje">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-zinc-400 hover:text-zinc-650 transition-colors" title="Me gusta">
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-zinc-400 hover:text-zinc-650 transition-colors" title="No me gusta">
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
                  <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-zinc-800">Nova</span>
                  <div className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm text-zinc-400 flex items-center gap-1.5">
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
          <footer className="p-3 xl:p-4 border-t border-zinc-100 bg-white shrink-0 space-y-3">
            
            {/* Input textarea */}
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus-within:border-zinc-950 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
              <button className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0">
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
                disabled={!inputText.trim()}
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
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Card 1: Nova puede ayudarte con */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
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
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Contexto de tu tienda</h3>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                  <Store className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase">Tienda</span>
                  <span className="text-xs xl:text-sm font-extrabold text-zinc-950 mt-0.5 block leading-none">Café del Valle</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-600 shrink-0">
                  <Crown className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase">Plan actual</span>
                  <span className="text-xs xl:text-sm font-extrabold text-zinc-950 mt-0.5 block leading-none">Founder</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase">Estado WhatsApp</span>
                  <span className="text-xs xl:text-sm font-extrabold text-emerald-700 mt-0.5 block leading-none">Conectado</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase">Conexión de pagos</span>
                  <span className="text-xs xl:text-sm font-extrabold text-zinc-950 mt-0.5 block leading-none">Mercado Pago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Actividad de Nova */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Actividad de Nova</h3>
              <button className="text-[10px] font-bold text-[#6F42C1] hover:underline cursor-pointer select-none">Ver todo</button>
            </div>

            <div className="space-y-3 font-sans">
              {[
                { title: '3 productos recomendados', desc: 'Hoy' },
                { title: '2 enlaces de pago enviados', desc: 'Hoy' },
                { title: '1 pedido creado', desc: 'Hoy' }
              ].map((act, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-zinc-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <span className="truncate text-zinc-850">{act.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0 ml-2 select-none">{act.desc}</span>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-zinc-100 pt-1" />

            <Link 
              href="/conversaciones" 
              className="text-xs xl:text-sm font-bold text-[#6F42C1] hover:text-purple-700 flex items-center justify-between px-2 pt-1 select-none"
            >
              <span>Ver historial completo</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  )
}
