'use client'

import React from 'react'
import Link from 'next/link'
import {
  FolderOpen,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Message } from './types'

interface ActionCardProps {
  message: Message
}

export function ProductsListCard({ message }: ActionCardProps) {
  if (!message.products) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-1.5 space-y-1.5">
        {message.products.map((p, idx) => (
          <div key={idx} className="p-3.5 flex items-center justify-between bg-white rounded-lg border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-sm">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-zinc-900 truncate text-xs xl:text-sm">{p.name}</h5>
                <p className="text-xs font-semibold text-zinc-400 mt-1 leading-none">{p.sales}</p>
              </div>
            </div>
            <span className="font-bold text-zinc-900 text-xs xl:text-sm shrink-0">{p.price}</span>
          </div>
        ))}
      </div>
      <Link href="/productos" className="block w-full">
        <button className="w-full mt-2 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer">
          <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
          <span>Ver inventario completo</span>
        </button>
      </Link>
    </div>
  )
}

export function ProductCreatedCard({ message }: ActionCardProps) {
  if (!message.productDetail) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <img 
            src={message.productDetail.image} 
            alt={message.productDetail.name} 
            className="w-16 h-16 rounded-lg object-cover border border-zinc-200 bg-white shrink-0" 
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="font-bold text-zinc-950 text-sm">{message.productDetail.name}</h5>
              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-full text-[9px] font-black uppercase tracking-wider">
                {message.productDetail.status}
              </span>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mt-1.5">{message.productDetail.category}</p>
            <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 pr-2">{message.productDetail.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 text-right">
          <span className="font-black text-zinc-950 text-sm xl:text-base">{message.productDetail.price}</span>
          <span className="text-[11px] font-semibold text-zinc-400 mt-1.5">{message.productDetail.stock}</span>
        </div>
      </div>
    </div>
  )
}

export function DiscountCard({ message }: ActionCardProps) {
  if (!message.coupon) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-2 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-800 font-black text-xs shrink-0">
            {message.coupon.code}
          </span>
          <div className="min-w-0">
            <h5 className="font-bold text-zinc-900 truncate text-xs xl:text-sm leading-tight">{message.coupon.desc}</h5>
            <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">{message.coupon.validity}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[9px] font-black shrink-0 tracking-wide">
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
  )
}

export function ProductUpdatedCard({ message }: ActionCardProps) {
  const prod = message.action?.payload?.product as any
  if (!prod) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
          <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">
            Producto Actualizado: {prod.name || ''}
          </h5>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white border border-zinc-200 p-2.5 rounded-lg flex flex-col shadow-sm">
            <span className="text-[10px] text-zinc-400 font-bold uppercase leading-none">Precio</span>
            <span className="font-bold text-zinc-800 mt-1.5 flex items-center gap-1.5">
              {prod.oldPrice !== prod.newPrice ? (
                <>
                  <span className="line-through text-zinc-400 font-semibold">${prod.oldPrice?.toLocaleString('es-CO') ?? '0'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-800 font-extrabold">${prod.newPrice?.toLocaleString('es-CO') ?? '0'}</span>
                </>
              ) : (
                <span>${prod.newPrice?.toLocaleString('es-CO') ?? '0'}</span>
              )}
            </span>
          </div>
          <div className="bg-white border border-zinc-200 p-2.5 rounded-lg flex flex-col shadow-sm">
            <span className="text-[10px] text-zinc-400 font-bold uppercase leading-none">Inventario</span>
            <span className="font-bold text-zinc-800 mt-1.5 flex items-center gap-1.5">
              {prod.oldStock !== prod.newStock ? (
                <>
                  <span className="line-through text-zinc-400 font-semibold">{prod.oldStock ?? '0'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-blue-700 font-extrabold">{prod.newStock ?? '0'} uds</span>
                </>
              ) : (
                <span>{prod.newStock ?? '0'} uds</span>
              )}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-200/60 pt-2.5 mt-1 select-none">
          <span>Estado en la tienda:</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
            prod.newActive ? "bg-zinc-100 text-zinc-800 border border-zinc-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"
          )}>
            {prod.newActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
      <Link href="/productos" className="block w-full">
        <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
          <span>Gestionar en Catálogo</span>
        </button>
      </Link>
    </div>
  )
}

export function OrderStatusUpdatedCard({ message }: ActionCardProps) {
  const order = message.action?.payload?.order
  if (!order) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">
            Orden #{order.id.slice(-6)}
          </h5>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
            order.newStatus === 'delivered' ? 'bg-zinc-100 text-zinc-800 border-zinc-200' :
            order.newStatus === 'ready' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            order.newStatus === 'preparing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            order.newStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-zinc-50 text-zinc-600 border-zinc-200'
          )}>
            {order.newStatus}
          </span>
        </div>
        <p className="text-xs text-zinc-600">
          Cliente: <span className="font-bold text-zinc-800">{order.customerName}</span>
        </p>
        <p className="text-xs text-zinc-600 mt-1 leading-none font-semibold">
          Total: <span className="font-bold text-zinc-900">${order.total.toLocaleString('es-CO')}</span>
        </p>
        
        {order.adminComment && (
          <div className="bg-white border border-zinc-200 p-2.5 rounded-lg text-xs italic text-zinc-500">
            Nota: "{order.adminComment}"
          </div>
        )}
      </div>
      <Link href="/pedidos" className="block w-full">
        <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
          <span>Ver listado de pedidos</span>
        </button>
      </Link>
    </div>
  )
}

export function OrdersListCard({ message }: ActionCardProps) {
  const orders = message.action?.payload?.orders
  if (!orders) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-[#FAFAFA] border border-zinc-200 rounded-xl p-1.5 space-y-1.5">
        {orders.map((order) => (
          <div key={order.id} className="p-3 flex items-center justify-between bg-white rounded-lg border border-zinc-100 shadow-sm">
            <div className="flex flex-col text-left min-w-0">
              <h5 className="font-bold text-zinc-900 truncate text-xs">
                #{order.id.slice(-6)} - {order.customerName}
              </h5>
              <span className="text-[10px] text-zinc-400 mt-1 leading-none font-semibold">
                {order.city} | Pago: {order.paymentStatus}
              </span>
            </div>
            <div className="flex flex-col items-end shrink-0 text-right">
              <span className="font-bold text-zinc-800 text-xs">${order.total.toLocaleString('es-CO')}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase mt-1",
                order.status === 'delivered' ? 'bg-zinc-100 text-zinc-800' :
                order.status === 'ready' ? 'bg-blue-50 text-blue-700' :
                order.status === 'preparing' ? 'bg-amber-50 text-amber-700' :
                order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                'bg-zinc-50 text-zinc-500'
              )}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Link href="/pedidos" className="block w-full">
        <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
          <span>Administrar Pedidos Completo</span>
        </button>
      </Link>
    </div>
  )
}

export function SalesMetricsCard({ message }: ActionCardProps) {
  const metrics = message.action?.payload?.metrics
  if (!metrics) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-zinc-500" />
          <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">Rendimiento Comercial</h5>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-zinc-200 p-2 rounded-lg flex flex-col text-center shadow-sm">
            <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Ventas</span>
            <span className="font-black text-zinc-800 text-[11px] xl:text-xs mt-1.5 leading-none">
              ${metrics.totalSales.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="bg-white border border-zinc-200 p-2 rounded-lg flex flex-col text-center shadow-sm">
            <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Pedidos</span>
            <span className="font-black text-zinc-800 text-[11px] xl:text-xs mt-1.5 leading-none">
              {metrics.totalOrders}
            </span>
          </div>
          <div className="bg-white border border-zinc-200 p-2 rounded-lg flex flex-col text-center shadow-sm">
            <span className="text-[9px] text-zinc-400 font-bold uppercase leading-none">Ticket Prom.</span>
            <span className="font-black text-blue-700 text-[11px] xl:text-xs mt-1.5 leading-none">
              ${metrics.avgTicket.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
        
        {metrics.topProducts && metrics.topProducts.length > 0 && (
          <div className="space-y-1.5 text-left border-t border-zinc-200/60 pt-3">
            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider select-none">Productos más vendidos</span>
            {metrics.topProducts.map((p, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-zinc-700 py-0.5">
                <span className="truncate pr-4">{idx+1}. {p.name}</span>
                <span className="shrink-0 text-zinc-500">{p.qty} uds (${p.sales.toLocaleString('es-CO')})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Link href="/dashboard" className="block w-full">
        <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
          <span>Ver Gráficas en el Dashboard</span>
        </button>
      </Link>
    </div>
  )
}

export function CustomerChatCard({ message }: ActionCardProps) {
  const payload = message.action?.payload
  if (!payload) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-zinc-900 text-xs xl:text-sm">
            Chat con {payload.customerName}
          </h5>
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider select-none">
            Paso: {payload.step}
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1 select-none">
          Asignado a: <span className="font-bold text-zinc-700">{payload.assignedTo}</span> | Tel: <span className="font-bold text-zinc-700">{payload.phoneNumber}</span>
        </p>
        
        <div className="border border-zinc-200 bg-white rounded-lg p-2.5 max-h-40 overflow-y-auto space-y-2 flex flex-col text-xs scrollbar-none mt-2 select-text">
          {payload.chatHistory && payload.chatHistory.length > 0 ? (
            payload.chatHistory.map((chat, idx: number) => {
              const isCustomer = chat.sender === 'user'
              return (
                <div key={idx} className={cn(
                  "p-2 rounded-lg max-w-[85%] text-left",
                  isCustomer 
                    ? "bg-zinc-100 text-zinc-900 mr-auto" 
                    : "bg-zinc-100 text-zinc-800 ml-auto border border-zinc-200"
                )}>
                  <p className="font-black text-[8px] uppercase opacity-65 mb-0.5 leading-none select-none">
                    {isCustomer ? 'Cliente' : 'Bot'}
                  </p>
                  <p className="font-medium leading-normal">{chat.text}</p>
                </div>
              )
            })
          ) : (
            <p className="text-zinc-400 text-center py-4 select-none">No hay historial reciente de mensajes.</p>
          )}
        </div>
      </div>
      <Link href="/conversaciones" className="block w-full">
        <button className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer select-none">
          <span>Ver en Bandeja de Entrada</span>
        </button>
      </Link>
    </div>
  )
}
