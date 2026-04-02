'use client'

import { useState } from 'react'
import { Loader2, Store, Phone, AlignLeft, ImagePlus, X, Check } from 'lucide-react'

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
      setSuccess(false) // reset success state when altered
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
      
      setForm(prev => ({ ...prev, logoFile: null })) // Reset file input state
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
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">Información Pública</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Logo Section */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="shrink-0 relative group">
            {logoPreview ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-border bg-muted shadow-inner relative">
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title="Remover logo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex flex-col items-center justify-center text-emerald-600 transition-colors">
                <Store className="w-8 h-8 sm:w-10 sm:h-10 opacity-50 mb-2" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider opacity-70">Sin Logo</span>
              </div>
            )}
            
            <label className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-white border border-border shadow-sm text-foreground hover:bg-muted font-medium text-xs rounded-full px-3 py-1.5 cursor-pointer transition-colors shadow-sm flex items-center gap-1.5 group-hover:border-emerald-200">
              <ImagePlus className="w-3.5 h-3.5 text-emerald-600" />
              Cambiar
              <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoSelect} />
            </label>
          </div>

          <div className="flex-1 space-y-4 w-full mt-4 sm:mt-0">
            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" />
                Nombre de la Tienda
              </label>
              <input
                type="text"
                required
                className="w-full border border-border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                value={form.name}
                onChange={e => {setForm(f => ({...f, name: e.target.value})); setSuccess(false)}}
                placeholder="Ej. Mi Emprendimiento"
              />
            </div>
            
            {/* Whatsapp */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Número de WhatsApp (Ventas)
              </label>
              <input
                type="text"
                required
                className="w-full border border-border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                value={form.whatsapp}
                onChange={e => {setForm(f => ({...f, whatsapp: e.target.value})); setSuccess(false)}}
                placeholder="573210000000"
              />
              <p className="text-xs text-muted-foreground pl-1">Asegúrate de incluir el código de país sin el "+". (Ej: 57 para Colombia).</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-emerald-600" />
            Biografía o Descripción Breve
          </label>
          <textarea
            className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none min-h-[100px]"
            value={form.bio}
            onChange={e => {setForm(f => ({...f, bio: e.target.value})); setSuccess(false)}}
            placeholder="Escribe algo corto para presentar tu tienda o informar horarios..."
            maxLength={300}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Aparecerá debado del título principal.</span>
            <span>{form.bio.length} / 300</span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">Los cambios pueden tardar un instante en reflejarse en la tienda pública.</p>
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto min-w-[160px] rounded-xl py-3 px-6 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              success 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                ¡Actualizado!
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
