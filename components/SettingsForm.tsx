'use client'

import { useState } from 'react'
import { Loader2, Store, Phone, AlignLeft, ImagePlus, X, Check, Globe, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsStore = {
  id: string
  name: string
  whatsapp: string
  bio: string | null
  logoUrl: string | null
}

export default function SettingsForm({
  initialStore,
}: {
  initialStore: SettingsStore
}) {
  const [form, setForm] = useState({
    name: initialStore.name,
    whatsapp: initialStore.whatsapp,
    bio: initialStore.bio || '',
    logoFile: null as File | null,
  })
  
  const [logoPreview, setLogoPreview] = useState<string | null>(initialStore.logoUrl)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setForm(prev => ({ ...prev, logoFile: file }))
      setLogoPreview(URL.createObjectURL(file))
      setSuccess(false)
    }
  }

  function handleRemoveLogo() {
    setForm(prev => ({ ...prev, logoFile: null }))
    setLogoPreview(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      let finalLogoUrl: string | null | undefined = undefined

      if (form.logoFile) {
        const formData = new FormData()
        formData.append('file', form.logoFile)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!uploadRes.ok) throw new Error('Falló subida')
        const uploadData = await uploadRes.json()
        finalLogoUrl = uploadData.url
      } else if (logoPreview === null) {
        finalLogoUrl = null
      }

      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          whatsapp: form.whatsapp,
          bio: form.bio,
          ...(finalLogoUrl !== undefined && { logoUrl: finalLogoUrl }),
        }),
      })

      if (!res.ok) throw new Error('Fallo guardando datos')
      
      setForm(prev => ({ ...prev, logoFile: null }))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

    } catch (error) {
      console.error(error)
      alert("Hubo un error guardando tu configuración.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-card rounded-[2.5rem] p-10 md:p-14 mb-12 animate-in relative overflow-hidden bg-white border-black/[0.05]">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] -mr-40 -mt-20" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary mb-2 uppercase">Identidad visual</p>
          <h3 className="text-3xl font-bold text-black tracking-tight font-display">
            Configuración de tienda
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-zinc-50 border border-black/[0.03] flex items-center justify-center text-zinc-300">
          <Globe className="w-5 h-5" />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
        
        {/* Logo Section */}
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="shrink-0 relative group">
            {logoPreview ? (
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border border-black/[0.05] bg-zinc-50 shadow-xl relative group/img transition-all">
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"
                  title="Remover logo"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-dashed border-black/[0.05] bg-zinc-50 flex flex-col items-center justify-center text-zinc-300 hover:bg-zinc-100/50 transition-all">
                <Store className="w-10 h-10 opacity-20 mb-3" />
                <span className="text-[11px] font-bold tracking-widest opacity-50 uppercase">Sin logo</span>
              </div>
            )}
            
            <label className="absolute -bottom-2 -right-2 bg-primary text-white shadow-xl hover:bg-primary-hover font-bold text-[11px] tracking-widest rounded-full px-5 py-3 cursor-pointer transition-all flex items-center gap-2 active:scale-95 uppercase">
              <ImagePlus className="w-4 h-4" />
              Actualizar
              <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoSelect} />
            </label>
          </div>

          <div className="flex-1 space-y-8 w-full pt-4 md:pt-2">
            {/* Store Name */}
            <div className="space-y-3 group">
              <label className="text-xs font-bold tracking-widest text-zinc-400 group-focus-within:text-primary transition-colors flex items-center gap-2 px-1 uppercase">
                <Store className="w-3.5 h-3.5" />
                Nombre comercial
              </label>
              <input
                type="text"
                required
                className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl px-6 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all"
                value={form.name}
                onChange={e => {setForm(f => ({...f, name: e.target.value})); setSuccess(false)}}
                placeholder="Nombre de tu marca"
              />
            </div>
            
            {/* Whatsapp */}
            <div className="space-y-3 group">
              <label className="text-xs font-bold tracking-widest text-zinc-400 group-focus-within:text-primary transition-colors flex items-center gap-2 px-1 uppercase">
                <Phone className="w-3.5 h-3.5" />
                WhatsApp de ventas
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl px-6 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all tabular-nums"
                  value={form.whatsapp}
                  onChange={e => {setForm(f => ({...f, whatsapp: e.target.value})); setSuccess(false)}}
                  placeholder="573210000000"
                />
                <HelpCircle className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-200" />
              </div>
              <p className="text-[11px] text-zinc-400 font-bold tracking-widest px-1 uppercase">Ingresar código de país sin el símbolo "+".</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-3 group">
          <label className="text-xs font-bold tracking-widest text-zinc-400 group-focus-within:text-primary transition-colors flex items-center gap-2 px-1 uppercase">
            <AlignLeft className="w-3.5 h-3.5" />
            Descripción de la tienda
          </label>
          <textarea
            className="w-full bg-zinc-50 border border-black/[0.05] rounded-2xl px-6 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all resize-none min-h-[140px]"
            value={form.bio}
            onChange={e => {setForm(f => ({...f, bio: e.target.value})); setSuccess(false)}}
            placeholder="Describe brevemente tus productos u horarios..."
            maxLength={300}
          />
          <div className="flex justify-between text-[11px] font-bold tracking-widest text-zinc-400 px-1 opacity-60 uppercase">
            <span>Se mostrará en la cabecera de tu tienda pública.</span>
            <span>{form.bio.length} / 300</span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-10 border-t border-black/[0.03] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-4 items-center">
             <div className="w-2 h-2 rounded-full bg-primary" />
             <p className="text-xs font-bold text-zinc-400 tracking-widest leading-relaxed uppercase">
               Los cambios se reflejan automáticamente en tu storefront público.
             </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full md:w-auto btn-premium h-14 min-w-[300px] flex items-center justify-center gap-4 transition-all active:scale-98",
              success && "bg-zinc-100 text-zinc-400 border border-black/[0.05] cursor-default shadow-none hover:bg-zinc-100"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Sincronizando...
              </>
            ) : success ? (
              <>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                Configuración guardada
              </>
            ) : (
              'Guardar configuración'
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
