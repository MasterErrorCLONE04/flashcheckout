'use client'

import { useState } from 'react'
import { Bot, Save, Loader2, Send, MessageSquare, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type AgentSettings = {
  systemPrompt: string
  welcomeMessage: string
  active: boolean
}

export default function AgentSettingsManager({
  initialSettings,
  storeName,
}: {
  initialSettings: AgentSettings
  storeName: string
}) {
  const [settings, setSettings] = useState<AgentSettings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    { sender: 'bot', text: initialSettings.welcomeMessage || '¡Hola! Bienvenido a la tienda.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  async function handleSave() {
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

      if (!res.ok) {
        let errorMsg = 'Error desconocido'
        try {
          const data = await res.json()
          errorMsg = data.error || errorMsg
        } catch (_) {}
        throw new Error(`Falló al guardar: ${res.status} - ${errorMsg}`)
      }

      toast.success('Configuración del Agente guardada', {
        description: 'La IA se actualizará con las nuevas instrucciones.'
      })
    } catch (err: any) {
      console.error(err)
      toast.error('Error al guardar la configuración', {
        description: err.message || 'No pudimos guardar los cambios. Inténtalo más tarde.'
      })
    } finally {
      setSaving(false)
    }
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!inputText.trim()) return

    const userMsg = inputText.trim()
    setInputText('')
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }])
    
    setIsTyping(true)

    // Simulate Agent response based on system prompt / context
    setTimeout(() => {
      setIsTyping(false)
      let botResponse = `Hola, soy el asistente virtual de ${storeName}. Estoy configurado para atenderte 24/7.`
      
      if (userMsg.toLowerCase().includes('hola') || userMsg.toLowerCase().includes('buenos')) {
        botResponse = settings.welcomeMessage || '¡Hola! ¿En qué puedo ayudarte hoy?'
      } else if (userMsg.toLowerCase().includes('precio') || userMsg.toLowerCase().includes('cuanto')) {
        botResponse = 'Nuestros precios de catálogo están siempre actualizados en el menú visual. ¿Hay algún producto en específico que busques?'
      } else if (userMsg.toLowerCase().includes('domicilio') || userMsg.toLowerCase().includes('envio')) {
        botResponse = 'Ofrecemos despachos express. Si me dices tu dirección, puedo ayudarte a calcular el envío.'
      } else {
        botResponse = `Recibido: "${userMsg}". Según mis instrucciones de prompt: "${settings.systemPrompt.slice(0, 40)}...", te confirmo que puedo procesar tu orden.`
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse, time: timeStr }])
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Settings Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="premium-card p-6 bg-white border border-zinc-200/60 shadow-sm rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-[15px]">Configuración General</h3>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">Controla tu asistente de IA</p>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.active}
                  onChange={e => setSettings(s => ({ ...s, active: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Mensaje de Bienvenida</label>
                <input
                  type="text"
                  value={settings.welcomeMessage}
                  onChange={e => setSettings(s => ({ ...s, welcomeMessage: e.target.value }))}
                  placeholder="Ej: ¡Hola! Bienvenido a nuestra tienda. ¿Qué estás buscando hoy? 🛒"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[14px] text-zinc-900 outline-none focus:bg-white focus:border-primary/30 transition-all font-medium"
                />
                <p className="text-[11px] text-zinc-400">Este mensaje se enviará automáticamente en la primera interacción del cliente.</p>
              </div>

              {/* Prompt System */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Instrucciones del Agente (System Prompt)</label>
                  <span className="text-[11px] text-zinc-400 font-medium">{settings.systemPrompt.length}/1000</span>
                </div>
                <textarea
                  rows={6}
                  value={settings.systemPrompt}
                  onChange={e => setSettings(s => ({ ...s, systemPrompt: e.target.value.slice(0, 1000) }))}
                  placeholder="Ej: Eres un asistente de ventas de una tienda de tecnología. Sé amable, responde de forma concisa y guía siempre al usuario a ver el catálogo de productos..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-[14px] text-zinc-900 outline-none focus:bg-white focus:border-primary/30 transition-all font-medium resize-none leading-relaxed"
                />
                <p className="text-[11px] text-zinc-400">Instrucciones críticas que rigen la personalidad, restricciones y reglas de búsqueda del agente de IA.</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-premium h-11 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prompt Guidelines Card */}
          <div className="premium-card p-6 bg-amber-50/20 border border-amber-200/50 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-amber-800 uppercase tracking-wide">Mejores Prácticas de Entrenamiento</h4>
              <ul className="text-[12px] text-amber-700/90 list-disc ml-4 mt-2 space-y-1.5 font-medium">
                <li>Define claramente qué productos vendes y cuáles no tienes disponibles.</li>
                <li>Ordena al bot que mantenga respuestas cortas (los clientes en WhatsApp no leen textos largos).</li>
                <li>Incluye reglas de envío básicas en el prompt para cotizaciones automáticas.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive WhatsApp Bot Simulator */}
        <div className="lg:col-span-5 flex flex-col h-[560px] bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-inner relative">
          
          {/* Simulator Top Header */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between shrink-0 text-white select-none">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#075E54]" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">AI Agent Simulator</h4>
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Online • Autorespuesta</span>
              </div>
            </div>
            <button 
              onClick={() => setChatMessages([{ sender: 'bot', text: settings.welcomeMessage || '¡Hola! Bienvenido.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
              title="Reiniciar chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Simulator Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#E5DDD5]">
            <div className="mx-auto w-fit bg-yellow-50 text-yellow-800 text-[10px] px-3 py-1 rounded-lg border border-yellow-100 font-bold uppercase tracking-wider mb-2 select-none shadow-sm">
              Simulador Local de WhatsApp
            </div>

            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end animate-in slide-in-from-right-3' : 'justify-start animate-in slide-in-from-left-3'}`}
              >
                <div className={`relative max-w-[80%] rounded-xl px-3.5 py-2 text-sm shadow-sm ${msg.sender === 'user' ? 'bg-[#DCF8C6] text-zinc-900 rounded-tr-none' : 'bg-white text-zinc-900 rounded-tl-none'}`}>
                  <p className="leading-snug font-medium break-words">{msg.text}</p>
                  <span className="block text-[9px] text-zinc-400 text-right mt-1.5 leading-none tabular-nums font-bold select-none">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex w-full justify-start animate-pulse">
                <div className="bg-white rounded-xl px-4 py-2 text-xs text-zinc-400 font-bold shadow-sm rounded-tl-none">
                  El agente está escribiendo...
                </div>
              </div>
            )}
          </div>

          {/* Simulator Input Action Area */}
          <form onSubmit={handleSendMessage} className="bg-white border-t border-zinc-200 p-3 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escribe un mensaje de prueba..."
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2 text-sm outline-none focus:bg-white focus:border-zinc-300 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-[#128C7E] hover:bg-[#0b665c] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 shadow-md"
            >
              <Send className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
