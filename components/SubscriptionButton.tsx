'use client'

import { useState } from 'react'
import { CreditCard, Loader2, Sparkles, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'

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

      toast.info("Conectando con Stripe...", {
        description: "Serás redirigido de forma segura al portal de facturación."
      })
      window.location.href = data.url
    } catch (error: any) {
      toast.error("Error financiero", {
        description: `No pudimos conectar con la pasarela de pagos. Detalle: ${error.message}`
      })
      console.error('El Portal de Cobro falló', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={cn(
        "w-full sm:w-auto h-10 px-5 rounded-lg font-medium text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 border",
        isPro 
          ? "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50" 
          : "bg-zinc-950 text-white hover:bg-zinc-800 border-zinc-950 hover:border-zinc-800"
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPro ? (
        <Settings2 className="w-4 h-4" />
      ) : (
        <Sparkles className="w-4 h-4 text-amber-400" />
      )}
      {isPro ? 'Gestionar Facturación' : 'Desbloquear Pro'}
    </button>
  )
}
