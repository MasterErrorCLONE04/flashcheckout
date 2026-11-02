'use client'

import React from 'react'
import { Plus, Mic, Waves, Send } from 'lucide-react'
import { toast } from 'sonner'
import { NovaChatState } from './useNovaChatState'

interface NovaChatInputProps {
  chat: NovaChatState
}

export function NovaChatInput({ chat }: NovaChatInputProps) {
  const {
    showSlashCommands,
    setShowSlashCommands,
    inputText,
    setInputText,
    textareaRef,
    handleSend,
    isTyping
  } = chat

  return (
    <footer className="w-full max-w-2xl mx-auto px-4 py-3 bg-white shrink-0 select-none border-t border-zinc-100/60 relative">
      {showSlashCommands && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-30 divide-y divide-zinc-100 animate-in slide-in-from-bottom-2 duration-150">
          {[
            { cmd: '/pedidos', desc: 'Ver pedidos recientes de la tienda' },
            { cmd: '/ventas', desc: 'Ver reporte de rendimiento de ventas' },
            { cmd: '/buscar ', desc: 'Buscar un producto' },
            { cmd: '/descuento', desc: 'Crear un cupón de promoción' },
            { cmd: '/pausar-bot', desc: 'Desactivar bot de WhatsApp' },
            { cmd: '/activar-bot', desc: 'Activar bot de WhatsApp' }
          ].filter(c => c.cmd.toLowerCase().startsWith(inputText.toLowerCase())).map((c) => (
            <button
              key={c.cmd}
              onClick={() => {
                setInputText(c.cmd)
                setShowSlashCommands(false)
                textareaRef.current?.focus()
              }}
              className="w-full px-4 py-2.5 hover:bg-zinc-50 flex items-center justify-between text-left text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              <span className="font-extrabold text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">{c.cmd}</span>
              <span className="text-zinc-400 font-semibold">{c.desc}</span>
            </button>
          ))}
        </div>
      )}
      
      <div className="relative flex items-end gap-3 bg-[#F4F4F4] border border-zinc-200/65 rounded-[24px] px-4 py-3.5 focus-within:border-zinc-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
        <button 
          onClick={() => toast.info('Cargar archivos estará disponible en la versión final')}
          className="w-8 h-8 rounded-full bg-transparent hover:bg-zinc-200/50 border border-zinc-300 text-zinc-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer mb-0.5"
          title="Adjuntar archivo"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>
        <textarea 
          ref={textareaRef}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(inputText)
            }
          }}
          rows={1}
          placeholder="Preguntar lo que quieras"
          className="flex-1 bg-transparent border-none focus:outline-none resize-none text-sm font-semibold text-zinc-800 placeholder-zinc-400 py-1.5 select-text scrollbar-none min-h-[24px] max-h-[200px]"
        />
        <div className="flex items-center gap-2 shrink-0 mb-0.5">
          <button 
            onClick={() => toast.info('Entrada de voz próximamente')}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-full transition-colors cursor-pointer"
            title="Entrada de voz"
          >
            <Mic className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => toast.info('Modo de voz en tiempo real próximamente')}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-full transition-colors cursor-pointer"
            title="Modo de voz"
          >
            <Waves className="w-4.5 h-4.5" />
          </button>
          {inputText.trim() && (
            <button 
              onClick={() => handleSend(inputText)}
              disabled={isTyping}
              className="w-8 h-8 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer ml-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-zinc-400 text-center mt-2">
        Nova puede cometer errores. Considera verificar la información importante.
      </p>
    </footer>
  )
}
