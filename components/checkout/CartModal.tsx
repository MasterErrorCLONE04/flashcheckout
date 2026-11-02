'use client'

import dynamic from 'next/dynamic'
import {
  ShoppingBag,
  MapPin,
  User,
  Minus,
  Plus,
  MessageCircle,
  X,
  Trash2,
  CreditCard,
  Zap,
  ChevronRight,
  Globe,
} from 'lucide-react'
import type { CheckoutProduct, CheckoutFormValues, CheckoutLoadingAction } from './types'

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false })

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cartProducts: CheckoutProduct[]
  cart: Record<string, number>
  itemsInCart: number
  total: number
  cardPaymentsEnabled: boolean
  onRemove: (id: string) => void
  onChangeQty: (id: string, delta: number) => void
  form: CheckoutFormValues
  setForm: React.Dispatch<React.SetStateAction<CheckoutFormValues>>
  loadingAction: CheckoutLoadingAction
  payError: string | null
  handleSubmit: () => void
  handlePayWithCard: () => void
}

const DELIVERY_FIELDS = [
  { key: 'customerName', label: 'Nombre de recibo', placeholder: 'Nombre de quién recibe', Icon: User },
  { key: 'address', label: 'Dirección de entrega', placeholder: 'Calle, carrera, número...', Icon: MapPin },
  { key: 'city', label: 'Ciudad / municipio', placeholder: 'Ciudad o municipio', Icon: Globe },
] as const

export function CartModal({
  isOpen,
  onClose,
  cartProducts,
  cart,
  itemsInCart,
  total,
  cardPaymentsEnabled,
  onRemove,
  onChangeQty,
  form,
  setForm,
  loadingAction,
  payError,
  handleSubmit,
  handlePayWithCard,
}: CartModalProps) {
  const loading = loadingAction !== null
  const formValid = Boolean(
    form.customerName.trim() && form.address.trim() && form.city.trim()
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4">
      {/* Overlay con blur profundo */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-md transition-opacity duration-500"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[540px] glass-premium rounded-t-[32px] sm:rounded-[32px] flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/40 shadow-2xl animate-in">
        {/* Header */}
        <div className="flex justify-between items-start p-8 pb-6 border-b border-white/20">
          <div>
            <h2 className="text-[32px] font-black tracking-tighter text-zinc-900 m-0 leading-tight">
              Tu pedido
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase m-0">
                Revisión final de compra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/50 hover:bg-white border border-white/40 cursor-pointer flex items-center justify-center text-zinc-500 transition-all active:scale-95 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-8 scroll-smooth">
          {/* Items Section */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <span className="text-[10px] font-black tracking-[0.15em] text-zinc-400">
                Resumen de ítems
              </span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tight">
                {itemsInCart} {itemsInCart === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {cartProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white/40 hover:bg-white/60 transition-colors rounded-[20px] border border-white/40 p-4 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-500">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl.split(',')[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 m-5 text-zinc-200" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-[15px] text-zinc-900 mb-1.5 truncate max-w-[180px] tracking-tight">
                        {p.name}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white/80 rounded-full h-8 border border-zinc-200/50 px-1 shadow-sm">
                          <button
                            onClick={() => onChangeQty(p.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-20 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-[13px] font-bold text-zinc-900 tabular-nums">
                            {cart[p.id]}
                          </span>
                          <button
                            onClick={() => onChangeQty(p.id, +1)}
                            disabled={cart[p.id] >= p.stock}
                            className="w-7 h-7 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-20 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[15px] font-black text-blue-600 tabular-nums">
                          ${(p.price * (cart[p.id] ?? 0)).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemove(p.id)}
                    className="w-9 h-9 rounded-xl bg-white/50 hover:bg-red-50 hover:text-red-500 text-zinc-300 border border-white/20 transition-all flex items-center justify-center shrink-0 active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Form Section */}
          <section className="border-t border-white/20 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-black tracking-[0.15em] text-zinc-400">
                Detalles de entrega
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {DELIVERY_FIELDS.map(({ key, label, placeholder, Icon }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-zinc-500 ml-1">
                    {label}
                  </label>
                  <div className="relative group">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input
                      className="w-full bg-white/50 border border-white/60 rounded-[18px] pl-11 pr-4 py-3.5 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all shadow-sm"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                  {key === 'address' && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-white/60 shadow-inner bg-white/30">
                      <MapPicker
                        onLocationSelectAction={(lat, lng, address, city) =>
                          setForm(f => ({
                            ...f,
                            lat,
                            lng,
                            address: address || f.address,
                            city: city || f.city,
                          }))
                        }
                        initialLat={form.lat || undefined}
                        initialLng={form.lng || undefined}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer: Bottom Bar con glass fuerte */}
        <div className="border-t border-white/20 p-8 pt-6 bg-white/40 backdrop-blur-xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[11px] font-bold text-zinc-500 tracking-widest mb-1">
                Total del pedido
              </p>
              <h3 className="text-[44px] font-black text-zinc-900 tracking-tighter leading-none m-0 tabular-nums">
                ${total.toLocaleString('es-CO')}
              </h3>
            </div>
            {itemsInCart > 0 && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-white bg-blue-600 px-4 py-1.5 rounded-full tracking-widest shadow-lg shadow-blue-500/20">
                  Confirmado
                </span>
              </div>
            )}
          </div>

          {payError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold text-center px-4 py-3 rounded-2xl mb-4 animate-in">
              {payError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {cardPaymentsEnabled && (
              <button
                onClick={handlePayWithCard}
                disabled={loading || !formValid}
                className="webview-cta group relative w-full h-14 bg-zinc-900 text-white rounded-[20px] font-black text-[15px] tracking-tight flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-zinc-800 active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loadingAction === 'card' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Segurizando sesión...</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                    <span>Pagar con Tarjeta</span>
                    <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-all" />
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !formValid}
              className="webview-cta w-full h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-[20px] font-black text-[15px] tracking-tight flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-green-500/10"
            >
              {loadingAction === 'whatsapp' ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmar vía WhatsApp</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 opacity-30">
            <Zap className="w-3 h-3 text-zinc-900" />
            <p className="text-[10px] text-zinc-900 font-extrabold tracking-[0.2em] m-0">
              Protocolo Seguro v2.0 • Flashcheckouts
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

