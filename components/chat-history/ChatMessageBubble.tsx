'use client'

import React from 'react'
import { Package, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Message } from './types'
import { cn } from '@/lib/utils'

interface ChatMessageBubbleProps {
  msg: Message
  customerName: string
  avatarUrl: string | null
}

export function ChatMessageBubble({ msg, customerName, avatarUrl }: ChatMessageBubbleProps) {
  const isUser = msg.sender === 'user'

  const renderMessageText = (text: string) => {
    if (text.startsWith('[PRODUCT_CARD]')) {
      const parts = text.replace('[PRODUCT_CARD] ', '').split(' | ')
      const title = parts[0] || 'Producto'
      const price = parts[1] || '$0'
      const desc = parts[2] || ''
      return (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden mt-1 max-w-xs text-zinc-955 font-semibold p-0.5">
          <div className="w-full h-24 bg-zinc-50 border-b border-zinc-100 flex items-center justify-center relative p-3">
            <Package className="w-6 h-6 text-zinc-400" />
            <span className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase select-none">
              Bot
            </span>
          </div>
          <div className="p-3 space-y-1">
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-bold text-xs truncate max-w-[130px]">{title}</span>
              <span className="text-[10px] font-extrabold text-emerald-600 tabular-nums shrink-0">{price}</span>
            </div>
            {desc && <p className="text-[9px] text-zinc-400 font-medium leading-relaxed truncate">{desc}</p>}
            <button
              onClick={() => toast.success(`Abriendo enlace de: ${title}`)}
              className="w-full text-center py-1.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg text-[9px] font-bold text-zinc-655 transition-colors uppercase tracking-widest mt-2 cursor-pointer h-7 flex items-center justify-center"
            >
              Ver producto
            </button>
          </div>
        </div>
      )
    }

    if (text.startsWith('[Link de Pago Enviado]')) {
      const parts = text.split('\n')
      const amount = parts[0]?.replace('[Link de Pago Enviado]: ', '') || ''
      const url = parts[1] || '#'
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg overflow-hidden mt-1 max-w-xs text-emerald-955 p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-xs">Link de Pago Generado</span>
          </div>
          <p className="text-[10px] text-emerald-805 font-semibold leading-relaxed">
            Se ha enviado un link de pago por valor de <strong className="text-emerald-955">{amount}</strong>.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold transition-all block"
          >
            PAGAR AHORA
          </a>
        </div>
      )
    }

    const isHumanTakeover = text.startsWith('[Asesor Humano]')
    const cleanText = isHumanTakeover ? text.replace('[Asesor Humano]: ', '') : text

    return (
      <div className="space-y-1">
        {isHumanTakeover && (
          <span className="block text-[8px] opacity-75 font-black tracking-wider leading-none text-zinc-400">
            Intervención Humana
          </span>
        )}
        <p className="leading-relaxed break-words font-semibold text-zinc-800">{cleanText}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full animate-in duration-200",
        isUser ? "justify-start" : "justify-end"
      )}
    >
      <div className="flex items-start gap-2.5 max-w-[70%]">
        {isUser && (
          <div className="relative select-none shrink-0 mt-0.5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={customerName}
                className="w-6 h-6 rounded-full object-cover border border-zinc-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-150 border border-zinc-200 flex items-center justify-center text-[9px] text-zinc-655 font-bold uppercase">
                {customerName.slice(0, 1)}
              </div>
            )}
          </div>
        )}

        <div className={cn(
          "rounded-lg px-3.5 py-2.5 text-xs flex flex-col gap-1.5",
          isUser 
            ? "bg-zinc-100 text-zinc-955 rounded-tl-none border border-zinc-200/40" 
            : msg.text.startsWith('[PRODUCT_CARD]') || msg.text.startsWith('[Link de Pago Enviado]')
            ? "bg-transparent p-0 border-none shadow-none"
            : "bg-[#E6F4EA] text-emerald-955 rounded-tr-none border border-emerald-100"
        )}>
          {renderMessageText(msg.text)}

          {!msg.text.startsWith('[PRODUCT_CARD]') && !msg.text.startsWith('[Link de Pago Enviado]') && (
            <div className={cn(
              "flex items-center justify-end gap-1 text-[8px] font-semibold mt-1 select-none leading-none",
              isUser ? "text-zinc-400" : "text-emerald-700"
            )}>
              <span>{msg.time}</span>
              {!isUser && (
                <span className="text-emerald-600 font-extrabold">✓✓</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
