'use client'

import React from 'react'
import { Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AgentItem, Message } from './types'
import {
  ProductsListCard,
  ProductCreatedCard,
  DiscountCard,
  ProductUpdatedCard,
  OrderStatusUpdatedCard,
  OrdersListCard,
  SalesMetricsCard,
  CustomerChatCard
} from './NovaActionCards'

interface NovaMessageBubbleProps {
  message: Message
  selectedAgent: AgentItem
}

export function NovaMessageBubble({ message, selectedAgent }: NovaMessageBubbleProps) {
  const isBot = message.sender === 'bot'

  return (
    <div className={cn("flex w-full gap-4 items-start animate-in fade-in duration-200", isBot ? "justify-start text-left" : "justify-end text-left")}>
      {isBot && (
        <div className="shrink-0 select-none mt-0.5">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm", selectedAgent.avatarBg)}>
            <Bot className="w-4.5 h-4.5 stroke-[2.5px]" />
          </div>
        </div>
      )}
      <div className={cn("min-w-0 max-w-[85%]", isBot ? "space-y-1.5" : "ml-auto")}>
        <div className={cn(
          "text-sm leading-relaxed font-medium",
          isBot 
            ? "text-zinc-805 bg-white py-1 px-1" 
            : "bg-[#F4F4F4] text-zinc-800 rounded-3xl px-5 py-3 ml-auto inline-block border border-zinc-200/40"
        )}>
          <p className="whitespace-pre-line">{message.text}</p>
          
          {isBot && message.type === 'products_list' && <ProductsListCard message={message} />}
          {isBot && message.type === 'product_created_card' && <ProductCreatedCard message={message} />}
          {isBot && message.type === 'discount_card' && <DiscountCard message={message} />}
          {isBot && message.type === 'product_updated' && <ProductUpdatedCard message={message} />}
          {isBot && message.type === 'order_status_updated' && <OrderStatusUpdatedCard message={message} />}
          {isBot && message.type === 'orders_list' && <OrdersListCard message={message} />}
          {isBot && message.type === 'sales_metrics' && <SalesMetricsCard message={message} />}
          {isBot && message.type === 'customer_chat' && <CustomerChatCard message={message} />}
        </div>

        {isBot && (
          <div className="flex items-center gap-3 pl-1 pt-1.5 select-none opacity-60 hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(message.text)
                toast.success('Mensaje copiado al portapapeles')
              }} 
              className="text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer" 
              title="Copiar mensaje"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => toast.success('Gracias por tu feedback')} 
              className="text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer" 
              title="Me gusta"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => toast.success('Gracias por tu feedback')} 
              className="text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer" 
              title="No me gusta"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
