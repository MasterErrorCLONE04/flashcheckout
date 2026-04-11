'use client'

import { useState } from 'react'
import { Loader2, Store, Phone, AlignLeft, ImagePlus, X, Check, Globe, HelpCircle, Shirt, Smartphone, Home, Sparkles, Utensils, Dumbbell, Gamepad2, MoreHorizontal, CreditCard, ShieldCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import SubscriptionButton from '@/components/SubscriptionButton'
import { toast } from 'sonner'

interface StoreSettingsData {
  id: string;
  name: string;
  whatsapp: string;
  bio: string | null;
  logoUrl: string | null;
  category?: string | null;
}

export default function StoreSettingsManager({
  initialStore,
  isPro,
}: {
  initialStore: StoreSettingsData
  isPro: boolean
}) {
  const [form, setForm] = useState({
    name: initialStore.name,
    whatsapp: initialStore.whatsapp,
    bio: initialStore.bio || '',
    category: initialStore.category || 'General',
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
          category: form.category,
          ...(finalLogoUrl !== undefined && { logoUrl: finalLogoUrl }),
        }),
      })

      if (!res.ok) throw new Error('Fallo guardando datos')
      
      setForm(prev => ({ ...prev, logoFile: null }))
      setSuccess(true)
      toast.success("Configuración sincronizada", {
        description: "Los cambios ya son visibles en tu tienda pública."
      })
      setTimeout(() => setSuccess(false), 3000)

    } catch (error) {
      console.error(error)
      toast.error("Error de sincronización", {
        description: "No pudimos guardar los cambios. Revisa tu conexión e intenta de nuevo."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="premium-card p-10 md:p-14 mb-0 animate-in relative overflow-hidden bg-white border-gray-200">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] -mr-40 -mt-20" />
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div>
            <p className="text-[13px] font-medium tracking-tight text-emerald-600 mb-1">Identidad visual</p>
            <h3 className="text-3xl font-medium text-zinc-950 tracking-tight font-display">
              Configuración de tienda
            </h3>
          </div>
          <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-gray-200 flex items-center justify-center text-zinc-300">
            <Globe className="w-5 h-5" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          {/* Logo Section */}
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="shrink-0 relative group">
              {logoPreview ? (
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-lg overflow-hidden border border-gray-200 bg-zinc-50 relative group/img transition-all">
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
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-lg border-2 border-dashed border-gray-200 bg-zinc-50 flex flex-col items-center justify-center text-zinc-300 hover:bg-zinc-100/50 transition-all">
                  <Store className="w-10 h-10 opacity-20 mb-3" />
                  <span className="text-[11px] font-bold tracking-widest opacity-50 uppercase">Sin logo</span>
                </div>
              )}
              
              <label className="absolute -bottom-2 -right-2 bg-primary text-white border border-primary/20 hover:bg-zinc-900 font-bold text-[11px] tracking-widest rounded-lg px-5 py-3 cursor-pointer transition-all flex items-center gap-2 active:scale-95 uppercase">
                <ImagePlus className="w-4 h-4" />
                Actualizar
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoSelect} />
              </label>
            </div>

            <div className="flex-1 space-y-8 w-full pt-4 md:pt-2">
              <div className="space-y-3 group">
                <label className="text-[13px] font-medium tracking-tight text-zinc-500 group-focus-within:text-emerald-600 transition-colors flex items-center gap-2 px-1">
                  <Store className="w-3.5 h-3.5" />
                  Nombre comercial
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-6 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all"
                  value={form.name}
                  onChange={e => {setForm(f => ({...f, name: e.target.value})); setSuccess(false)}}
                  placeholder="Nombre de tu marca"
                />
              </div>
              
              <div className="space-y-3 group">
                <label className="text-[13px] font-medium tracking-tight text-zinc-500 group-focus-within:text-emerald-600 transition-colors flex items-center gap-2 px-1">
                  <Phone className="w-3.5 h-3.5" />
                  WhatsApp de ventas
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-6 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all tabular-nums"
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

          <div className="space-y-3 group">
            <label className="text-[13px] font-medium tracking-tight text-zinc-500 group-focus-within:text-emerald-600 transition-colors flex items-center gap-2 px-1">
              <AlignLeft className="w-3.5 h-3.5" />
              Descripción de la tienda
            </label>
            <textarea
              className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-6 py-5 text-base font-semibold text-black placeholder:text-zinc-300 focus:outline-none focus:border-primary/30 transition-all resize-none min-h-[140px]"
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

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[13px] font-medium tracking-tight text-zinc-500">
                Categoría comercial
              </label>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg tracking-tight">
                Actual: {form.category}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  onClick={() => {setForm(f => ({ ...f, category: cat.id })); setSuccess(false)}}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border transition-all text-left group",
                    form.category === cat.id
                      ? "bg-zinc-950 border-zinc-950 text-white scale-[1.02]"
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
                success && "bg-zinc-100 text-zinc-400 border border-gray-200 cursor-default hover:bg-zinc-100"
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
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Plan & Subscription Section */}
      <div className="premium-card p-10 md:p-14 bg-zinc-50/50 border-black/[0.02] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                isPro ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border border-black/[0.05] text-zinc-400"
              )}>
                {isPro ? <Sparkles className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1.5">Plan actual</p>
                <h4 className="text-2xl font-semibold text-black tracking-tight uppercase">
                  {isPro ? 'Flash Pro Premium' : 'Free Terminal'}
                </h4>
              </div>
            </div>
            
            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-lg">
              {isPro 
                ? 'Tu tienda opera bajo el protocolo Pro. Tienes acceso a inventario ilimitado, soporte prioritario y todas las capacidades del motor de pagos acelerado.' 
                : 'Actualmente usas el plan básico. Desbloquea el inventario ilimitado y gestiona tu escala comercial sin restricciones activando el motor Premium.'}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black/[0.03] text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Seguridad Encriptada
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-black/[0.03] text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Checkout Acelerado
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-4">
            <SubscriptionButton isPro={isPro} />
            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
              Gestionado vía Stripe Secure Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
