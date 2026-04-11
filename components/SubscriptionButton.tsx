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
        "w-full sm:w-auto h-16 px-10 rounded-full font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all active:scale-95 border border-primary/20",
        isPro 
          ? "bg-white border-zinc-200 text-zinc-400 hover:text-black hover:bg-zinc-50" 
          : "bg-primary text-white hover:bg-zinc-900 border-none"
      )}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isPro ? (
        <Settings2 className="w-4 h-4 text-primary" />
      ) : (
        <Sparkles className="w-4 h-4 text-primary" />
      )}
      {isPro ? 'Gestionar Facturación' : 'Desbloquear Pro'}
    </button>
  )
}
