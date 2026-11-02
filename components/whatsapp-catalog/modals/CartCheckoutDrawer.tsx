'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { X, ShoppingBag, Minus, Plus, MessageCircle, CreditCard, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  cartProducts: (Product & {
    cartKey: string
    qty: number
    variations: Record<string, string>
  })[]
  total: number
  changeQtyByKey: (cartKey: string, delta: number) => void
  form: {
    customerName: string
    address: string
    city: string
    lat: number | null
    lng: number | null
  }
  setForm: React.Dispatch<
    React.SetStateAction<{
      customerName: string
      address: string
      city: string
      lat: number | null
      lng: number | null
    }>
  >
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
  cardPaymentsEnabled,
}: CartCheckoutDrawerProps) {
  if (!isOpen) return null

  const isPreviewMobile = device === 'movil' || device === 'tablet'

  return (
    <div
      className={cn(
        'inset-0 z-[100] flex animate-in fade-in duration-200',
        isPreviewMobile ? 'items-end justify-center' : 'items-stretch justify-end',
        device ? 'absolute' : 'fixed'
      )}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full bg-white overflow-hidden flex flex-col shadow-2xl',
          isPreviewMobile
            ? 'rounded-t-[12px] max-h-[92%] animate-in slide-in-from-bottom duration-250'
            : 'sm:max-w-[430px] h-full border-l border-[#EAEAE8] animate-in slide-in-from-right duration-250'
        )}
      >
        {/* Minimalist Waterdrop Bag Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-[#EAEAE8] shrink-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[17px] font-extrabold text-[#111111] tracking-[-0.02em]">
              Tu bolsa
            </h2>
            <span className="text-[12px] font-medium text-[#71717A] tabular-nums">
              ({itemsInCart} {itemsInCart === 1 ? 'artículo' : 'artículos'})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar bolsa"
            className="w-8 h-8 rounded-full hover:bg-[#F6F6F4] flex items-center justify-center text-[#111111] cursor-pointer transition-colors border-0 bg-transparent"
          >
            <X className="w-4.5 h-4.5 stroke-[1.7]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Architectural Free Shipping Progress Bar */}
          {freeShipping.enabled &&
            cartProducts.length > 0 &&
            (() => {
              const threshold = freeShipping.threshold || 120000
              const difference = threshold - total
              const isFree = difference <= 0
              const percent = Math.min((total / threshold) * 100, 100)
              return (
                <div
                  className={cn(
                    'rounded-[4px] p-3.5 space-y-2 text-left select-none border',
                    isFree
                      ? 'bg-[#DDF3E4]/65 border-[#BDE5CA]'
                      : 'bg-[#F6F6F4] border-[#EAEAE8]'
                  )}
                >
                  <div className="flex items-center gap-2 text-[11.5px] text-[#111111]">
                    <Truck className="w-3.5 h-3.5 shrink-0 stroke-[1.8]" />
                    <p className="leading-snug font-medium">
                      {isFree ? (
                        <span className="font-bold text-[#0D3B26]">
                          ¡Felicidades! Desbloqueaste envío gratuito.
                        </span>
                      ) : (
                        <>
                          Agrega{' '}
                          <span className="font-bold text-[#111111]">
                            ${difference.toLocaleString('es-CO')}
                          </span>{' '}
                          más para obtener envío gratis.
                        </>
                      )}
                    </p>
                  </div>
                  <div className="w-full h-1 bg-[#E2E2DF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#111111] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })()}

          {/* Bag Product Rows */}
          {cartProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F6F6F4] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6 text-[#71717A] stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-bold text-[#111111]">Tu bolsa está vacía</p>
                <p className="text-[12px] text-[#71717A]">
                  Explora nuestras colecciones y añade tus favoritos.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#EAEAE8]">
              {cartProducts.map(p => (
                <div key={p.cartKey} className="py-3.5 first:pt-0 flex items-center gap-3.5">
                  <div className="w-16 h-20 rounded-[4px] bg-[#F6F6F4] p-1.5 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl.split(',')[0]}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-zinc-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-left space-y-1">
                    <p className="font-semibold text-[13px] text-[#111111] leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    {Object.keys(p.variations).length > 0 && (
                      <p className="text-[11px] text-[#71717A] font-normal">
                        {Object.entries(p.variations)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div className="inline-flex items-center gap-2 border border-[#E5E5E3] rounded-full px-1.5 py-0.5 bg-white">
                        <button
                          type="button"
                          onClick={() => changeQtyByKey(p.cartKey, -1)}
                          className="w-5 h-5 flex items-center justify-center cursor-pointer text-[#111111] hover:opacity-60 border-0 bg-transparent p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[11.5px] font-bold w-4 text-center tabular-nums text-[#111111]">
                          {p.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQtyByKey(p.cartKey, 1)}
                          className="w-5 h-5 flex items-center justify-center cursor-pointer text-[#111111] hover:opacity-60 border-0 bg-transparent p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[13px] font-bold text-[#111111] tabular-nums">
                        ${(p.price * p.qty).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delivery Details Form */}
          {cartProducts.length > 0 && (
            <div className="space-y-3.5 pt-4 border-t border-[#EAEAE8] text-left">
              <label className="text-[10.5px] font-bold text-[#71717A] uppercase tracking-[0.08em] block">
                Datos de envío
              </label>

              <input
                placeholder="Nombre completo de quien recibe"
                className="w-full bg-white border border-[#D4D4D2] rounded-[4px] px-3.5 py-2.5 text-[12.5px] font-medium text-[#111111] placeholder:text-[#A1A1AA] outline-none focus:border-[#111111] transition-colors"
                value={form.customerName}
                onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  placeholder="Ciudad"
                  className="w-full bg-white border border-[#D4D4D2] rounded-[4px] px-3.5 py-2.5 text-[12.5px] font-medium text-[#111111] placeholder:text-[#A1A1AA] outline-none focus:border-[#111111] transition-colors"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                />
                <input
                  placeholder="Dirección exacta"
                  className="w-full bg-white border border-[#D4D4D2] rounded-[4px] px-3.5 py-2.5 text-[12.5px] font-medium text-[#111111] placeholder:text-[#A1A1AA] outline-none focus:border-[#111111] transition-colors"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>

              <div className="rounded-[4px] overflow-hidden border border-[#E5E5E3] h-36">
                <MapPicker
                  onLocationSelectAction={(lat, lng, addr) => {
                    setForm(f => ({
                      ...f,
                      lat,
                      lng,
                      address: addr || f.address,
                      city: f.city || 'Bogotá',
                    }))
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Checkout Actions Footer */}
        {cartProducts.length > 0 && (
          <div className="px-6 py-5 bg-white border-t border-[#EAEAE8] space-y-3 shrink-0">
            <div className="flex justify-between items-baseline">
              <span className="text-[12px] font-medium text-[#71717A]">Subtotal estimado</span>
              <span className="text-[20px] font-extrabold text-[#111111] tracking-tight tabular-nums">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>

            {cardPaymentsEnabled && (
              <button
                type="button"
                onClick={handleCardPayment}
                disabled={loadingAction !== null}
                className={cn(
                  'w-full h-11.5 bg-[#111111] hover:bg-[#27272A] text-white rounded-full text-[11.5px] font-bold uppercase tracking-[0.08em] flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer border-0',
                  loadingAction === 'card' && 'opacity-70 cursor-not-allowed'
                )}
              >
                <CreditCard className="w-4 h-4 stroke-[1.8]" />
                <span>
                  {loadingAction === 'card' ? 'Iniciando pago...' : 'Pagar con tarjeta'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              disabled={loadingAction !== null}
              className={cn(
                'w-full h-11.5 rounded-full text-[11.5px] font-bold uppercase tracking-[0.08em] flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer border',
                cardPaymentsEnabled
                  ? 'bg-white hover:bg-[#F6F6F4] text-[#111111] border-[#111111]'
                  : 'bg-[#111111] hover:bg-[#27272A] text-white border-[#111111]',
                loadingAction === 'whatsapp' && 'opacity-70 cursor-not-allowed'
              )}
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
              <span>
                {loadingAction === 'whatsapp'
                  ? 'Procesando pedido...'
                  : 'Finalizar por WhatsApp'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
