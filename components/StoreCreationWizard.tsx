'use client'

import { useState } from 'react'
import { Store, Loader2, Zap, Layout, ArrowRight, Shirt, Smartphone, Home, Sparkles, Utensils, Dumbbell, Gamepad2, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function StoreCreationWizard() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    whatsapp: '',
    category: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear la tienda')
        setLoading(false)
        return
      }

      router.refresh()
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-24 animate-in relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/[0.03] rounded-full blur-[100px] -z-10" />
      
      <div className="text-center mb-14">
        <div className="w-20 h-20 rounded-lg bg-black flex items-center justify-center mx-auto mb-10 shadow-2xl active:scale-95 transition-transform">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-medium text-zinc-950 tracking-tight font-display">
          Crear tienda
        </h1>
        <p className="text-[17px] text-zinc-500 font-normal mt-5 leading-relaxed tracking-tight">
          Configura tu presencia digital en segundos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-8">
          <div className="group space-y-3">
            <label htmlFor="store-name" className="text-[13px] font-medium tracking-tight text-zinc-500 px-1 group-focus-within:text-emerald-600 transition-colors">
              Nombre de la tienda
            </label>
            <div className="relative">
              <Layout className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
              <input
                id="store-name"
                type="text"
                className="w-full bg-white border border-gray-200 rounded-lg pl-16 pr-6 py-5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm"
                placeholder="Ej: Tienda de moda"
                value={form.name}
                onChange={e => {
                  const name = e.target.value
                  setForm(f => ({
                    ...f,
                    name,
                    slug: generateSlug(name),
                  }))
                }}
                required
              />
            </div>
          </div>

          <div className="group space-y-3">
            <label htmlFor="store-slug" className="text-[13px] font-medium tracking-tight text-zinc-500 px-1 group-focus-within:text-emerald-600 transition-colors">
              Enlace de tu tienda
            </label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary/30 transition-all shadow-sm">
              <span className="pl-6 text-[13px] font-medium text-zinc-300 tracking-tight whitespace-nowrap">
                flash.checkout /
              </span>
              <input
                id="store-slug"
                type="text"
                className="flex-1 py-5 pr-6 border-none text-base bg-transparent focus:outline-none font-normal text-emerald-600 tracking-tight"
                placeholder="tienda-moda"
                value={form.slug}
                onChange={e =>
                  setForm(f => ({ ...f, slug: e.target.value }))
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="group space-y-3 pt-2">
          <label htmlFor="store-whatsapp" className="text-[13px] font-medium tracking-tight text-zinc-500 px-1 group-focus-within:text-emerald-600 transition-colors">
            WhatsApp de negocio
          </label>
          <input
            id="store-whatsapp"
            type="tel"
            className="w-full bg-white border border-gray-200 rounded-lg px-6 py-5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all shadow-sm tabular-nums"
            placeholder="573001234567"
            value={form.whatsapp}
            onChange={e =>
              setForm(f => ({ ...f, whatsapp: e.target.value }))
            }
            required
          />
          <p className="text-[11px] text-zinc-400 font-medium tracking-tight px-1 mt-3">
            Incluir código de país sin el símbolo "+" (Colombia: 57)
          </p>
        </div>

        {/* Category Selection */}
        <div className="space-y-4 pt-4">
          <label className="text-[13px] font-medium tracking-tight text-zinc-500 px-1 transition-colors">
            Categoría comercial
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Moda', icon: Shirt, label: 'Moda' },
              { id: 'Tecnología', icon: Smartphone, label: 'Tecnología' },
              { id: 'Hogar', icon: Home, label: 'Hogar' },
              { id: 'Belleza', icon: Sparkles, label: 'Belleza' },
              { id: 'Comida', icon: Utensils, label: 'Comida' },
              { id: 'Deportes', icon: Dumbbell, label: 'Deportes' },
              { id: 'Juguetes', icon: Gamepad2, label: 'Juguetes' },
              { id: 'Otros', icon: MoreHorizontal, label: 'Otros' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all text-left group",
                  form.category === cat.id
                    ? "bg-zinc-950 border-zinc-950 text-white shadow-xl scale-[1.02]"
                    : "bg-white border-gray-200 text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50"
                )}
              >
                <cat.icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  form.category === cat.id ? "text-white" : "text-zinc-300"
                )} />
                <span className="text-[13px] font-medium tracking-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold tracking-widest rounded-lg px-6 py-4 animate-in fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !form.name || !form.slug || !form.whatsapp || !form.category}
          className="btn-premium w-full h-14 flex items-center justify-center gap-4 mt-12"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              Comenzar ahora
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
