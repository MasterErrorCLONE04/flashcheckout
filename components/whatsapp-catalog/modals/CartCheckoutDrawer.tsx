'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { X, ShoppingBag, Minus, Plus, MessageCircle, CreditCard } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { Product } from '../types'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

export interface CartCheckoutDrawerProps {
  isOpen: boolean
  onClose: () => void
  device?: string
  itemsInCart: number
  freeShipping: {
    enabled?: boolean
    threshold?: number
  }
  cartProducts: (Product & { cartKey: string; qty: number; variations: Record<string, string> })[]
  total: number
  changeQtyByKey: (cartKey: string, delta: number) => void
  form: {
    customerName: string
    address: string
    city: string
    lat: number | null
    lng: number | null
  }
  setForm: React.Dispatch<React.SetStateAction<{
    customerName: string
    address: string
    city: string
    lat: number | null
    lng: number | null
  }>>
  handleWhatsAppOrder: () => void
  handleCardPayment: () => void
  loadingAction: null | 'whatsapp' | 'card'
  cardPaymentsEnabled?: boolean
}

export function CartCheckoutDrawer({
  isOpen,
  onClose,
  device,
  itemsInCart,
  freeShipping,
  cartProducts,
  total,
  changeQtyByKey,
  form,
  setForm,
  handleWhatsAppOrder,
  handleCardPayment,
  loadingAction,
  cardPaymentsEnabled
}: CartCheckoutDrawerProps) {
  if (!isOpen) return null

  return (
    <div className={cn("inset-0 z-[100] flex items-end sm:items-center justify-center animate-in fade-in duration-300", !!device ? "absolute" : "fixed")}>
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Cabecera del Carrito */}
        <div className="p-6 pb-4 flex justify-between items-center border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Tu Pedido</h2>
            <p className="text-xs font-bold text-zinc-400">Total: {itemsInCart} items</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-zinc-50 border border-zinc-200/50 rounded-lg flex items-center justify-center text-zinc-500 cursor-pointer active:scale-90 transition-transform border-none"
          >
            <X className="w-5 h-5 text-zinc-900" />
          </button>
        </div>

        {/* Contenido Desplazable del Pedido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Progreso Envío Gratis (Chocodate Style) */}
          {freeShipping.enabled && cartProducts.length > 0 && (() => {
            const threshold = freeShipping.threshold || 100000
            const difference = threshold - total
            const isFree = difference <= 0
            const percent = Math.min((total / threshold) * 100, 100)
            return (
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 space-y-2 text-left select-none animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🚚</span>
                  <p className="text-[10px] font-bold text-zinc-700 leading-snug">
                    {isFree ? (
                      <span className="text-emerald-700 font-black">¡Felicidades! Tienes envío gratis.</span>
                    ) : (
                      <>Estás a <span className="font-extrabold text-emerald-600">${difference.toLocaleString('es-CO')}</span> de obtener envío gratis.</>
                    )}
                  </p>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })()}

          {/* Listado de Productos en el Carrito */}
          <div className="space-y-4">
            {cartProducts.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto" />
                <p className="text-xs font-bold text-zinc-400">Tu carrito está vacío</p>
              </div>
            ) : (
              cartProducts.map(p => (
                <div key={p.cartKey} className="flex items-center justify-between bg-zinc-50/50 border border-zinc-100 p-3 rounded-xl gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl.split(',')[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-zinc-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-bold text-xs text-zinc-900 truncate">{p.name}</p>
                      {Object.keys(p.variations).length > 0 && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          {Object.entries(p.variations).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-bold">${p.price.toLocaleString('es-CO')} x {p.qty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 p-1 rounded-lg shrink-0">
                    <button onClick={() => changeQtyByKey(p.cartKey, -1)} className="p-1 cursor-pointer hover:bg-zinc-50 rounded text-zinc-500 border-none bg-transparent"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="text-xs font-bold w-4 text-center tabular-nums">{p.qty}</span>
                    <button onClick={() => changeQtyByKey(p.cartKey, 1)} className="p-1 cursor-pointer hover:bg-zinc-50 rounded text-zinc-500 border-none bg-transparent"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Formulario de Checkout */}
          {cartProducts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="space-y-3.5">
                <label className="text-[10px] font-bold text-zinc-400 tracking-wider">Datos de entrega</label>
                
                <input 
                  placeholder="¿A nombre de quién?" 
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all" 
                  value={form.customerName}
                  onChange={e => {
                    setForm(f => ({ ...f, customerName: e.target.value }))
                  }}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    placeholder="Ciudad" 
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all" 
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                  <input 
                    placeholder="Dirección" 
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all" 
                    value={form.address}
                    onChange={e => {
                      setForm(f => ({ ...f, address: e.target.value }))
                    }}
                  />
                </div>
                
                <p className="text-[10px] text-zinc-400 italic font-semibold">* También puedes ubicarte en el mapa interactivo:</p>
              </div>
              
              {/* Mapa Interactivo */}
              <div className="rounded-xl overflow-hidden border border-zinc-200 h-40 shadow-none">
                <MapPicker 
                  onLocationSelectAction={(lat, lng, addr) => {
                    setForm(f => ({ ...f, lat, lng, address: addr || f.address, city: f.city || 'Bogotá' }))
                  }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer de Checkout y Compra */}
        {cartProducts.length > 0 && (
          <div className="p-6 bg-zinc-50 border-t border-zinc-150 space-y-3.5 shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-zinc-500">Total a pagar</span>
              <span className="text-xl font-black text-zinc-950 tabular-nums">${total.toLocaleString('es-CO')}</span>
            </div>
            
            <button 
              onClick={handleWhatsAppOrder}
              disabled={loadingAction !== null}
              className={cn(
                "w-full h-12 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-none border-none",
                loadingAction === 'whatsapp' && "opacity-75 cursor-not-allowed"
              )}
            >
              <MessageCircle className="w-4.5 h-4.5 text-white fill-current" />
              <span>{loadingAction === 'whatsapp' ? 'Procesando...' : 'Pedir por WhatsApp'}</span>
            </button>

            {cardPaymentsEnabled && (
              <button 
                onClick={handleCardPayment}
                disabled={loadingAction !== null}
                className={cn(
                  "w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-none border-none",
                  loadingAction === 'card' && "opacity-75 cursor-not-allowed"
                )}
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>{loadingAction === 'card' ? 'Iniciando Pago...' : 'Pagar con Tarjeta'}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
