import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Store, Product, parseCartKey } from '../types'

interface UseCatalogCartParams {
  store: Store
  initialCart?: Record<string, number>
  initialPhone?: string
  initialName?: string
  initialAddress?: string
}

export function useCatalogCart({
  store,
  initialCart = {},
  initialPhone,
  initialName = '',
  initialAddress = ''
}: UseCatalogCartParams) {
  const [cart, setCart] = useState<Record<string, number>>(initialCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [loadingAction, setLoadingAction] = useState<null | 'whatsapp' | 'card'>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Formulario de checkout
  const [form, setForm] = useState({
    customerName: initialName,
    address: initialAddress,
    city: 'Colombia',
    lat: null as number | null,
    lng: null as number | null
  })

  // Sincronizar carrito con el backend automáticamente
  useEffect(() => {
    if (!initialPhone || !hasChanged) return
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/whatsapp/sync-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phoneNumber: initialPhone, 
            cartData: { items: cart },
            storeId: store.id,
            customerName: form.customerName,
            address: form.address
          })
        })
      } catch (e) {
        console.error('Sync failed', e)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [cart, initialPhone, store.id, hasChanged, form.customerName, form.address])

  // Total de unidades en el carrito
  const itemsInCart = Object.values(cart).reduce((s, q) => s + q, 0)

  // Valor total monetario del carrito
  const total = Object.entries(cart).reduce((sum, [key, qty]) => {
    const { productId } = parseCartKey(key)
    const product = store.products.find(p => p.id === productId)
    return sum + (product ? product.price * qty : 0)
  }, 0)

  // Productos deserializados con variación
  const cartProducts = Object.entries(cart).map(([key, qty]) => {
    const { productId, variations } = parseCartKey(key)
    const product = store.products.find(p => p.id === productId)
    if (!product) return null
    return {
      ...product,
      cartKey: key,
      qty,
      variations,
    }
  }).filter(Boolean) as (Product & { cartKey: string, qty: number, variations: Record<string, string> })[]

  function changeQtyByKey(cartKey: string, delta: number) {
    const { productId } = parseCartKey(cartKey)
    const product = store.products.find(p => p.id === productId)
    if (!product) return

    setHasChanged(true)
    setCart(prev => {
      const currentQty = prev[cartKey] ?? 0
      const newQty = Math.max(0, Math.min(currentQty + delta, product.stock))
      const next = { ...prev, [cartKey]: newQty }
      if (newQty === 0) delete next[cartKey]
      return next
    })
  }

  function validateForm() {
    if (!form.customerName.trim()) {
      toast.error('Ingresa tu nombre para el pedido')
      return false
    }
    if (!form.address.trim()) {
      toast.error('La dirección de entrega es obligatoria')
      return false
    }
    if (!form.city.trim()) {
      toast.error('Ingresa la ciudad de entrega')
      return false
    }
    return true
  }

  async function handleWhatsAppOrder() {
    if (!validateForm()) return
    setLoadingAction('whatsapp')
    const items = cartProducts.map(p => {
      const variationDetails = Object.keys(p.variations).length > 0
        ? ` (${Object.entries(p.variations).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : ''
      return {
        productId: p.id,
        name: `${p.name}${variationDetails}`,
        qty: p.qty,
        price: p.price
      }
    })
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: store.id, 
          customerPhone: initialPhone,
          ...form, 
          items 
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsSuccess(true)
        toast.success('¡Pedido enviado!')
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank')
        }
      } else {
        toast.error(data.error || 'Error al crear pedido')
        setPayError(data.error)
      }
    } catch {
      toast.error('Error de conexión con el bot')
      setPayError('Error de red')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleCardPayment() {
    if (!validateForm()) return
    setLoadingAction('card')
    const items = cartProducts.map(p => {
      const variationDetails = Object.keys(p.variations).length > 0
        ? ` (${Object.entries(p.variations).map(([k, v]) => `${k}: ${v}`).join(', ')})`
        : ''
      return {
        productId: p.id,
        qty: p.qty,
        nameSuffix: variationDetails
      }
    })
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
          items 
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Error al iniciar pago')
        setPayError(data.error)
      }
    } catch {
      toast.error('Error al conectar con la pasarela de pagos')
      setPayError('Error de conexión')
    } finally {
      setLoadingAction(null)
    }
  }

  return {
    cart,
    setCart,
    isCartOpen,
    setIsCartOpen,
    form,
    setForm,
    itemsInCart,
    total,
    cartProducts,
    changeQtyByKey,
    loadingAction,
    payError,
    isSuccess,
    setIsSuccess,
    handleWhatsAppOrder,
    handleCardPayment
  }
}
