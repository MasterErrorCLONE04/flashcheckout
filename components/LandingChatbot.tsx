'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot,
  X, 
  Send, 
  Paperclip, 
  Mic, 
  MoreHorizontal, 
  Sparkles, 
  ChevronDown,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  time: string
}

const FAQS_PILLS = [
  { text: '¿Cómo me ayuda FlashCheckout?' },
  { text: '¿Qué integraciones ofrece?' },
  { text: '¿Tienen un plan gratuito?' },
  { text: '¿Cómo puedo probar la demo?' }
]

const getBotResponse = (input: string): string => {
  const text = input.toLowerCase()
  
  if (text.includes('help') || text.includes('que es') || text.includes('how can') || text.includes('definicion') || (text.includes('flashcheckout') && !text.includes('precio') && !text.includes('gratis') && !text.includes('price') && !text.includes('free'))) {
    return "👋 **FlashCheckout** is a conversational AI platform that automates your sales through WhatsApp.\n\nWe provide you with an optimized online catalog and an **AI Agent (Flashy)** that talks to your customers 24/7, answers stock questions, manages shopping carts, and sends direct secure checkout links to complete purchases automatically.";
  }
  
  if (text.includes('integration') || text.includes('integraciones') || text.includes('stripe') || text.includes('mercadopago') || text.includes('whatsapp') || text.includes('connect')) {
    return "🔌 **FlashCheckout offers native integrations with:**\n* **WhatsApp Business API & Evolution API** for conversational sales.\n* **Stripe & MercadoPago** for secure credit/debit card processing and local bank transfers.\n* Real-time stock synchronization with your digital catalog.";
  }
  
  if (text.includes('free') || text.includes('gratis') || text.includes('pricing') || text.includes('precio') || text.includes('plan') || text.includes('planes') || text.includes('cost')) {
    return "🎁 **Yes! We have a Free Plan (Free Terminal)** that allows you to sell up to 10 active products with our fast checkout.\n\nTo unlock **unlimited products**, your own custom **AI Agent for WhatsApp**, and automatic cart recovery campaigns, you can upgrade to the **Pro Plan** for just **$10/month** (or **$8/month** billed annually).";
  }
  
  if (text.includes('demo') || text.includes('book') || text.includes('probar') || text.includes('registro') || text.includes('cuenta') || text.includes('crear') || text.includes('comenzar') || text.includes('entrar') || text.includes('iniciar')) {
    return "⚡ **Ready to experience it?** You don't need to book a long meeting. You can test FlashCheckout yourself completely free in less than 2 minutes!\n\n👉 [**Create your Free Store now**](/sign-up) and start testing the AI flow on your own WhatsApp.";
  }

  if (text.includes('hola') || text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('saludos')) {
    return "👋 Hey! Welcome! Want to deploy a conversational AI agent for your store? Let me help you figure out if FlashCheckout is the right fit.";
  }
  
  return "💡 FlashCheckout helps e-commerce stores **increase sales and save time** by automating customer support and order generation via WhatsApp.\n\nAsk me about:\n* How it works or what it is.\n* Integrated payment gateways (Stripe/MercadoPago).\n* Free and Pro plan prices.\n* How to start testing it for free.";
}

const parseInlineMarkdown = (line: string) => {
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g
  const splitParts = line.split(regex)
  
  return splitParts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-extrabold text-zinc-900">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/)
      if (match) {
        const [_, label, url] = match
        return (
          <Link key={idx} href={url} className="text-blue-600 hover:underline font-bold">
            {label}
          </Link>
        )
      }
    }
    return part
  })
}

const renderFormattedText = (text: string) => {
  return text.split('\n\n').map((paragraph, pIdx) => {
    if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
      return (
        <ul key={pIdx} className="list-disc pl-5 space-y-1.5 my-2 text-zinc-700">
          {paragraph.split('\n').map((line, lIdx) => {
            const cleanLine = line.replace(/^[\*\-]\s+/, '')
            return <li key={lIdx}>{parseInlineMarkdown(cleanLine)}</li>
          })}
        </ul>
      )
    }
    
    return (
      <p key={pIdx} className="leading-relaxed mb-2.5 last:mb-0 text-zinc-700">
        {paragraph.split('\n').map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {parseInlineMarkdown(line)}
          </React.Fragment>
        ))}
      </p>
    )
  })
}

const SoundwaveIcon = () => (
  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="4" y1="10" x2="4" y2="14" />
    <line x1="8" y1="6" x2="8" y2="18" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="16" y1="6" x2="16" y2="18" />
    <line x1="20" y1="10" x2="20" y2="14" />
  </svg>
)

const VerticalPaperclipIcon = () => (
  <div style={{ transform: 'rotate(45deg)' }} className="flex items-center justify-center">
    <Paperclip className="w-4.5 h-4.5 text-zinc-400 hover:text-zinc-650 transition-colors" />
  </div>
)

export default function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '👋 ¡Hola! ¿Quieres activar un agente de inteligencia artificial en tu tienda?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'welcome-2',
      sender: 'bot',
      text: 'Déjame ayudarte a descubrir si FlashCheckout es la solución ideal para tu negocio.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isTyping, isOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = (textToSend: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)
    setShowTooltip(false)

    // Call the public Flashy API for dynamic AI response
    fetch('/api/agent/flashy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmed,
        history: messages.map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.text
        }))
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('API failed')
      return res.json()
    })
    .then(data => {
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.text || 'Disculpas, he tenido un inconveniente temporal para procesar tu consulta. ¿Me lo podrías repetir?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    })
    .catch(err => {
      console.warn('[Flashy Chatbot API Fallback]:', err)
      const responseText = getBotResponse(trimmed)
      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    })
  }

  const handleQuickReply = (query: string) => {
    handleSend(query)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans flex flex-col items-end">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={() => { setIsOpen(true); setShowTooltip(false); }}
            className="mb-3 mr-1 bg-white border border-zinc-200 shadow-lg px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-700 flex items-center gap-2 cursor-pointer hover:border-zinc-300 transition-all select-none hover:shadow-xl group"
          >
            <div className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse" />
             <span>💬 Escríbeme y responderé tus dudas</span>
            <span className="text-zinc-300 group-hover:text-zinc-500 transition-colors ml-1 font-normal">→</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <div
        role="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (showTooltip) setShowTooltip(false)
        }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border bg-black border-zinc-900 text-white hover:bg-zinc-900 select-none"
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6 animate-in zoom-in duration-200" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black animate-pulse" />
          </div>
        )}
      </div>

      {/* Chat Window - Height increased for taller layout */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-18 right-0 w-[360px] sm:w-[380px] h-[calc(100vh-176px)] bg-white border border-zinc-200 rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-176px)] max-w-[92vw]"
          >
            {/* Header (Lightning Bolt Brand Logo integrated) */}
            <div className="bg-black text-white px-5 py-4 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                {/* Circular Brand Logo badge with FlashCheckout's Lightning Bolt */}
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-white shadow-xs">
                  <Zap className="w-4.5 h-4.5 fill-white stroke-white" />
                </div>
                <h3 className="font-bold text-[15px] tracking-tight text-white">
                  FlashCheckout AI Agent
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <div
                  role="button"
                  onClick={() => {
                    toast.info('FlashCheckout Agent', {
                      description: 'Este asistente de IA interactivo responde dudas sobre la plataforma.'
                    })
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <div
                  role="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-5 bg-white space-y-4 flex flex-col">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[18px] px-4 py-3 text-[13px] font-normal leading-relaxed text-left border-0 ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-tr-xs shadow-sm'
                        : 'bg-zinc-100 text-zinc-800 rounded-tl-xs'
                    }`}
                  >
                    <div>
                      {msg.sender === 'bot' ? renderFormattedText(msg.text) : msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bot typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 rounded-[18px] rounded-tl-xs px-4 py-3 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    <span className="text-[11px] text-zinc-450 font-bold uppercase tracking-wider">Flashy is typing...</span>
                  </div>
                </div>
              )}

              {/* Quick Replies stacked/flowed exactly like Chatbase */}
              {!isTyping && (
                <div className="flex flex-col items-end gap-2.5 pt-2 select-none">
                  {FAQS_PILLS.map((pill, idx) => (
                    <div
                      key={idx}
                      role="button"
                      onClick={() => handleQuickReply(pill.text)}
                      className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 text-[13px] font-medium px-4 py-2.5 rounded-full shadow-2xs transition-all cursor-pointer text-right max-w-full"
                    >
                      {pill.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Centered Brand tag with Lightning Bolt */}
              <div className="flex items-center justify-center gap-1.5 py-4 select-none shrink-0">
                <div className="w-4.5 h-4.5 rounded-full bg-zinc-950 flex items-center justify-center text-white border border-zinc-900 shadow-2xs">
                  <Zap className="w-2.5 h-2.5 fill-white stroke-white" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 tracking-wide">
                  Powered by FlashCheckout
                </span>
              </div>

              <div ref={messagesEndRef} />
            </div>

             {/* Input block - Chatbase style grey panel */}
            <div className={`bg-zinc-100/80 border-t border-zinc-200/50 flex flex-col shrink-0 select-none transition-all duration-300 ${
              showPrivacy ? 'pt-3 pb-4 px-4 gap-2.5' : 'py-3.5 px-4'
            }`}>
              
              {/* Privacy agreement */}
              {showPrivacy && (
                <div className="flex items-center justify-between text-[11.5px] font-normal text-zinc-500 leading-none px-0.5">
                  <span>
                    Al chatear, aceptas nuestra{' '}
                    <Link href="/solutions/privacidad" className="underline text-zinc-650 hover:text-zinc-900 font-medium">
                      política de privacidad
                    </Link>
                    .
                  </span>
                  <div
                    role="button"
                    onClick={() => setShowPrivacy(false)}
                    className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              )}

              {/* Chatbase white input capsule */}
              <div className="h-11 bg-white border border-zinc-200/90 rounded-full pl-3.5 pr-1.5 flex items-center gap-3.5 shadow-2xs">
                {/* Paperclip */}
                <div
                  role="button"
                  onClick={() => {
                    toast.info('Archivos adjuntos', {
                      description: 'Flashy no requiere adjuntar archivos para responder tus dudas sobre FlashCheckout.'
                    })
                  }}
                  className="flex items-center justify-center cursor-pointer p-0.5"
                >
                  <VerticalPaperclipIcon />
                </div>

                {/* Input text */}
                <input
                  type="text"
                  placeholder="Escribe tu pregunta sobre FlashCheckout..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend(inputValue)
                  }}
                  className="flex-1 bg-transparent text-[13px] font-normal text-zinc-800 placeholder-zinc-400 focus:outline-none"
                />
                
                {/* Microphone */}
                <div
                  role="button"
                  onClick={() => {
                    toast.info('Entrada de voz', {
                      description: 'El reconocimiento de voz está desactivado para la demo de Flashy.'
                    })
                  }}
                  className="text-zinc-400 hover:text-zinc-650 cursor-pointer p-0.5"
                >
                  <Mic className="w-[18px] h-[18px]" />
                </div>

                {/* Soundwave wave or Send button */}
                <div
                  role="button"
                  onClick={() => handleSend(inputValue)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    inputValue.trim()
                      ? 'bg-black text-white cursor-pointer hover:bg-zinc-900 active:scale-95'
                      : 'bg-black text-white select-none'
                  }`}
                >
                  {inputValue.trim() ? (
                    <Send className="w-3.5 h-3.5 fill-current text-white" />
                  ) : (
                    <SoundwaveIcon />
                  )}
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
