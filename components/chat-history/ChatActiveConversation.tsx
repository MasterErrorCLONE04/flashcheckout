'use client'

import React from 'react'
import {
  Check,
  Star,
  Tag,
  CheckCircle,
  MoreVertical,
  ShieldAlert,
  Plus,
  Smile,
  Paperclip,
  Zap,
  Send,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ChatSessionsState } from './useChatSessions'
import { ChatMessageBubble } from './ChatMessageBubble'

interface ChatActiveConversationProps {
  chat: ChatSessionsState
}

export function ChatActiveConversation({ chat }: ChatActiveConversationProps) {
  const {
    activeSession,
    handleAssigneeChange,
    toggleFavorite,
    showAddTag,
    setShowAddTag,
    toggleStatus,
    activeDetails,
    chatEndRef,
    newTagText,
    setNewTagText,
    handleAddTag,
    composerTab,
    setComposerTab,
    handleTakeover,
    takeoverText,
    setTakeoverText,
    sending,
    newNoteText,
    setNewNoteText,
    handleAddNote
  } = chat

  if (!activeSession) {
    return (
      <div className="lg:col-span-8 xl:col-span-6 bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between h-[680px] relative">
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-zinc-400">
          <MessageCircle className="w-12 h-12 text-zinc-250 mb-2" />
          <p className="font-bold text-xs tracking-wider">Selecciona un chat para ver el historial</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-8 xl:col-span-6 bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col justify-between h-[680px] relative">
      {/* Header section with assignee and toolbar */}
      <div className="bg-white border-b border-zinc-100 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative select-none">
            {activeSession.avatarUrl ? (
              <img 
                src={activeSession.avatarUrl} 
                alt={activeSession.customerName}
                className="w-8.5 h-8.5 rounded-full object-cover shrink-0 border border-zinc-200"
              />
            ) : (
              <div className="w-8.5 h-8.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-extrabold text-zinc-650 flex items-center justify-center uppercase">
                {activeSession.customerName.slice(0, 2)}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white flex items-center justify-center" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-zinc-950 leading-none">{activeSession.customerName}</h4>
              <span className="text-emerald-500 flex items-center shrink-0">
                <Check className="w-3 h-3 text-white bg-emerald-500 rounded-full p-0.5" />
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold select-all">+{activeSession.phoneNumber}</span>
            </div>
            
            {/* Assignment Selector Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400 font-semibold">Asignado a:</span>
              <select
                value={activeSession.assignedTo}
                onChange={(e) => handleAssigneeChange(activeSession.id, e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-zinc-700 cursor-pointer focus:outline-none hover:text-zinc-955 transition-colors p-0 leading-none"
              >
                <option value="Tú">Tú</option>
                <option value="Bot de IA">Bot de IA</option>
                <option value="Soporte Técnico">Soporte</option>
              </select>
            </div>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1 text-zinc-400">
          <button 
            onClick={() => toggleFavorite(activeSession.id)}
            className={cn(
              "w-7.5 h-7.5 rounded-lg border border-transparent hover:border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-all cursor-pointer",
              activeSession.isFavorite ? "text-amber-500" : "text-zinc-400 hover:text-zinc-700"
            )}
            title="Favorito"
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
            title="Resolver"
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
          Hoy
        </div>

        <div className="space-y-4 flex-1">
          {activeSession.messages.map((msg, idx) => (
            <ChatMessageBubble
              key={idx}
              msg={msg}
              customerName={activeSession.customerName}
              avatarUrl={activeSession.avatarUrl}
            />
          ))}
          
          {/* Cart item added notification banner inside chat feed if cart is active */}
          {activeDetails && activeDetails.cartItems.length > 0 && (
            <div className="w-fit mx-auto text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-3 py-1 rounded-full flex items-center gap-1 select-none">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Producto agregado al carrito</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Tag Add Popover Form */}
      {showAddTag && (
        <form 
          onSubmit={handleAddTag} 
          className="absolute bottom-[160px] left-6 right-6 p-4 bg-white border border-zinc-200 rounded-lg z-30 animate-in fade-in duration-200 flex gap-2"
        >
          <input
            type="text"
            value={newTagText}
            onChange={e => setNewTagText(e.target.value)}
            placeholder="Escribe el nombre de la etiqueta..."
            className="flex-1 bg-zinc-550/5 border border-zinc-250 rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-zinc-355 font-semibold"
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
            className="border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold text-xs rounded-lg px-3 py-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Bot takeover warning notification banner */}
      <div className="bg-amber-50 border-t border-b border-amber-100 p-2.5 flex items-center gap-2 px-4.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <p className="text-[9px] text-amber-800 font-bold tracking-wide leading-none select-none">
          El bot está respondiendo automáticamente. Al enviar un mensaje tomarás el control.
        </p>
      </div>

      {/* Message Composer Footer Input area */}
      <div className="p-4 bg-white border-t border-zinc-150 shrink-0 space-y-3">
        {/* Tabs Responder / Nota Interna */}
        <div className="flex gap-4 border-b border-zinc-100 text-[10px] font-bold text-zinc-500 pb-1.5">
          <button
            type="button"
            onClick={() => setComposerTab('reply')}
            className={cn(
              "pb-0.5 relative transition-colors cursor-pointer",
              composerTab === 'reply' ? "text-emerald-600" : "hover:text-zinc-900"
            )}
          >
            Responder
            {composerTab === 'reply' && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
          </button>
          <button
            type="button"
            onClick={() => setComposerTab('note')}
            className={cn(
              "pb-0.5 relative transition-colors cursor-pointer",
              composerTab === 'note' ? "text-emerald-600" : "hover:text-zinc-900"
            )}
          >
            Nota interna
            {composerTab === 'note' && <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
          </button>
        </div>

        {composerTab === 'reply' ? (
          <form onSubmit={handleTakeover} className="space-y-3">
            <textarea
              rows={1}
              value={takeoverText}
              onChange={e => setTakeoverText(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded-lg px-4 py-2.5 text-xs outline-none font-semibold resize-none transition-all custom-scrollbar leading-relaxed"
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
                    setTakeoverText('¡Hola! Claro que sí, con gusto te ayudo.')
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
                className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-current rotate-45 -translate-x-[2px] translate-y-[2px]" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={1}
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              placeholder="Escribe una nota interna..."
              className="w-full bg-amber-50/30 border border-amber-200/50 hover:border-amber-250 focus:border-amber-350 focus:bg-white rounded-lg px-4 py-2.5 text-xs outline-none font-semibold resize-none transition-all custom-scrollbar leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddNote(e)
                }
              }}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-4 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-45 cursor-pointer"
              >
                Guardar nota
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
