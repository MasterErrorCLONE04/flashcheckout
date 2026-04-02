'use client'

import { useState } from 'react'
import { Store, Loader2, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StoreSetupForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    whatsapp: '',
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
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Configura tu tienda
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Completa estos datos para generar tu link de checkout
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="store-name" className="block text-sm font-medium mb-1.5">
            Nombre de tu tienda
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="store-name"
              type="text"
              className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              placeholder="Ej: Joyería Luna"
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

        <div>
          <label htmlFor="store-slug" className="block text-sm font-medium mb-1.5">
            URL de tu tienda
          </label>
          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
            <span className="pl-4 text-sm text-muted-foreground whitespace-nowrap">
              flashcheckout.com/tienda/
            </span>
            <input
              id="store-slug"
              type="text"
              className="flex-1 py-3 pr-4 text-sm bg-transparent focus:outline-none font-medium"
              placeholder="joyeria-luna"
              value={form.slug}
              onChange={e =>
                setForm(f => ({ ...f, slug: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="store-whatsapp" className="block text-sm font-medium mb-1.5">
            Número de WhatsApp
          </label>
          <input
            id="store-whatsapp"
            type="tel"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-white placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            placeholder="573001234567 (con código de país)"
            value={form.whatsapp}
            onChange={e =>
              setForm(f => ({ ...f, whatsapp: e.target.value }))
            }
            required
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Incluye el código de país (57 para Colombia)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !form.name || !form.slug || !form.whatsapp}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear mi tienda'
          )}
        </button>
      </form>
    </div>
  )
}
