'use client'

import { useState, useEffect } from 'react'
import type { CheckoutStore, CheckoutFormValues, CheckoutLoadingAction } from './types'

export function useCheckoutFormState(store: CheckoutStore, initialPhone?: string) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [form, setForm] = useState<CheckoutFormValues>({
    customerName: '',
    address: '',
    city: '',
    lat: null,
    lng: null,
  })
  const [loadingAction, setLoadingAction] = useState<CheckoutLoadingAction>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const itemsInCart = Object.values(cart).reduce((s, q) => s + q, 0)
  const total = store.products.reduce((s, p) => s + p.price * (cart[p.id] ?? 0), 0)
  const cartProducts = store.products.filter(p => (cart[p.id] ?? 0) > 0)

  const displayProducts = store.products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  useEffect(() => {
    if (isCartOpen && itemsInCart === 0) setIsCartOpen(false)
  }, [itemsInCart, isCartOpen])

  function changeQty(id: string, delta: number) {
    const product = store.products.find(p => p.id === id)!
    setCart(prev => {
      const newQty = Math.max(0, Math.min((prev[id] ?? 0) + delta, product.stock))
      const next = { ...prev, [id]: newQty }
      if (newQty === 0) delete next[id]
      return next
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  async function handleSubmit() {
    if (!form.customerName.trim() || !form.address.trim() || !form.city.trim()) return
    setLoadingAction('whatsapp')
    setPayError(null)
    const items = cartProducts.map(p => ({
      productId: p.id,
      name: p.name,
      qty: cart[p.id],
      price: p.price,
    }))
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerPhone: initialPhone,
          ...form,
          items,
          latitude: form.lat,
          longitude: form.lng,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPayError(data.error || 'No se pudo crear el pedido')
        setLoadingAction(null)
        return
      }
      window.location.href = data.whatsappUrl
    } catch {
      setPayError('Error de red. Intenta de nuevo.')
      setLoadingAction(null)
    }
  }

  async function handlePayWithCard() {
    if (!form.customerName.trim() || !form.address.trim() || !form.city.trim()) return
    setLoadingAction('card')
    setPayError(null)
    const items = cartProducts.map(p => ({ productId: p.id, qty: cart[p.id]! }))
    try {
      const res = await fetch('/api/checkout/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          customerPhone: initialPhone,
          customerName: form.customerName.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          items,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPayError(data.error || 'No se pudo iniciar el pago')
        setLoadingAction(null)
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setPayError('Error de red. Intenta de nuevo.')
      setLoadingAction(null)
    }
  }

  return {
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
  }
}

