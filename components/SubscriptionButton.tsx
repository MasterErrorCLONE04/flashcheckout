'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

export default function SubscriptionButton({ isPro }: { isPro: boolean }) {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Fallo desconocido en la API de pagos.')
      }

      window.location.href = data.url
    } catch (error: any) {
      alert(`¡Ups! Hubo un error al crear el portal de pago:\n${error.message}`)
      console.error('El Portal de Cobro falló', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
        isPro 
          ? 'bg-white border border-border text-foreground hover:bg-muted' 
          : 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:shadow-emerald-600/20 shadow-emerald-600/10 hover:scale-[1.02]'
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CreditCard className="w-5 h-5" />
      )}
      {isPro ? 'Gestionar Facturación' : 'Desbloquear PRO'}
    </button>
  )
}
