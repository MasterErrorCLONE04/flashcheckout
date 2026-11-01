'use client'

import { Search } from 'lucide-react'
import {
  type CheckoutFormProps,
  useCheckoutFormState,
  StoreHeader,
  FloatingCartBar,
  StoreProductCard,
  CartModal,
} from './checkout'

export type { CheckoutProduct as Product, CheckoutStore as Store } from './checkout'

export default function CheckoutForm({ store, initialPhone }: CheckoutFormProps) {
  const {
    cart,
    form,
    setForm,
    loadingAction,
    payError,
    isCartOpen,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    itemsInCart,
    total,
    cartProducts,
    displayProducts,
    changeQty,
    removeFromCart,
    handleSubmit,
    handlePayWithCard,
  } = useCheckoutFormState(store, initialPhone)

  return (
    <div className="min-h-screen bg-[#F4F4F7] font-sans text-foreground">
      <StoreHeader
        storeName={store.name}
        itemsInCart={itemsInCart}
        logoUrl={store.logoUrl}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <main className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pt-10 pb-40">
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold tracking-tighter text-foreground leading-none m-0">
            Catálogo
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-[0.1em] mt-2.5 mb-0">
            Suministros seleccionados de alta gama
          </p>
        </div>

        {/* Search */}
        {store.products.length > 4 && (
          <div className="relative max-w-[560px] mb-10">
            <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-[18px] text-[15px] font-medium text-foreground outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        )}

        {/* Grid: 5 Columnas de alta densidad */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {displayProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No se encontraron productos.
            </div>
          ) : (
            displayProducts.map(p => (
              <StoreProductCard
                key={p.id}
                product={p}
                qty={cart[p.id] ?? 0}
                onChangeQty={changeQty}
              />
            ))
          )}
        </div>
      </main>

      {!isCartOpen && (
        <FloatingCartBar
          itemsInCart={itemsInCart}
          total={total}
          onOpen={() => setIsCartOpen(true)}
        />
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartProducts={cartProducts}
        cart={cart}
        itemsInCart={itemsInCart}
        total={total}
        cardPaymentsEnabled={store.cardPaymentsEnabled}
        onRemove={removeFromCart}
        onChangeQty={changeQty}
        form={form}
        setForm={setForm}
        loadingAction={loadingAction}
        payError={payError}
        handleSubmit={handleSubmit}
        handlePayWithCard={handlePayWithCard}
      />
    </div>
  )
}
