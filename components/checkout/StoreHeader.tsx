'use client'

import { ShoppingBag, ChevronRight } from 'lucide-react'

interface StoreHeaderProps {
  storeName: string
  itemsInCart: number
  logoUrl: string | null
  onCartOpen: () => void
}

export function StoreHeader({
  storeName,
  itemsInCart,
  logoUrl,
  onCartOpen,
}: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-premium px-6 md:px-12 py-5 flex items-center justify-center shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[10px] overflow-hidden bg-primary flex items-center justify-center shrink-0 border border-border/10">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">
              {storeName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="font-bold text-[17px] tracking-tight text-foreground leading-none">
            {storeName}
          </div>
          <div className="flex items-center gap-[5px] mt-[3px]">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[9px] text-success font-bold tracking-[0.05em]">
              Tienda verificada
            </span>
          </div>
        </div>
      </div>

      {itemsInCart > 0 && (
        <button
          onClick={onCartOpen}
          className="absolute right-6 md:right-12 bg-primary text-primary-foreground border-none rounded-full cursor-pointer px-[18px] py-[9px] font-bold text-[13px] flex items-center gap-2 tracking-tight"
        >
          <ShoppingBag className="w-[15px] h-[15px]" />
          {itemsInCart}
        </button>
      )}
    </header>
  )
}

interface FloatingCartBarProps {
  itemsInCart: number
  total: number
  onOpen: () => void
}

export function FloatingCartBar({ itemsInCart, total, onOpen }: FloatingCartBarProps) {
  if (total <= 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-40px)] max-w-[500px] animate-in">
      <button
        onClick={onOpen}
        className="w-full bg-zinc-900 border-none rounded-2xl h-16 flex items-center justify-between px-6 cursor-pointer shadow-2xl transition-transform active:scale-95"
      >
        <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-1.5">
          <ShoppingBag className="w-[18px] h-[18px] text-white" />
          <span className="text-white font-black text-base">{itemsInCart}</span>
        </div>
        <span className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
          Finalizar Pedido <ChevronRight className="w-3.5 h-3.5" />
        </span>
        <span className="text-white font-black text-2xl tracking-tighter tabular-nums">
          ${total.toLocaleString('es-CO')}
        </span>
      </button>
    </div>
  )
}

