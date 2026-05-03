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
    <div className="space-y-6 animate-in duration-300">
      <div className="rounded-xl p-6 sm:p-8 bg-white border border-zinc-200 relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500 mb-1">Identidad de tu negocio</p>
            <h3 className="text-2xl font-bold text-zinc-900 tracking-tight font-sans">
              Configuración de tienda
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
            <Globe className="w-4 h-4" />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Logo Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 relative group">
              {logoPreview ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 relative group/img transition-all">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"
                    title="Remover logo"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-100/50 transition-all">
                  <Store className="w-8 h-8 opacity-40 mb-2" />
                  <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase">Sin logo</span>
                </div>
              )}
              
              <label className="absolute -bottom-1 -right-1 bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 font-bold text-[10px] tracking-wider rounded px-3 py-1.5 cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 uppercase">
                <ImagePlus className="w-3 h-3" />
                Subir
                <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoSelect} />
              </label>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-zinc-600 group-focus-within:text-zinc-900 transition-colors flex items-center gap-1.5 px-1">
                  <Store className="w-3.5 h-3.5" />
                  Nombre comercial
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all"
                  value={form.name}
                  onChange={e => {setForm(f => ({...f, name: e.target.value})); setSuccess(false)}}
                  placeholder="Nombre de tu marca"
                />
              </div>
              
              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-zinc-600 group-focus-within:text-zinc-900 transition-colors flex items-center gap-1.5 px-1">
                  <Phone className="w-3.5 h-3.5" />
                  WhatsApp de ventas
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all tabular-nums"
                    value={form.whatsapp}
                    onChange={e => {setForm(f => ({...f, whatsapp: e.target.value})); setSuccess(false)}}
                    placeholder="573210000000"
                  />
                  <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300" />
                </div>
                <p className="text-[10px] text-zinc-400 font-medium tracking-tight px-1">Ingresar código de país sin el símbolo "+".</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 group">
            <label className="text-xs font-semibold text-zinc-600 group-focus-within:text-zinc-900 transition-colors flex items-center gap-1.5 px-1">
              <AlignLeft className="w-3.5 h-3.5" />
              Descripción de la tienda
            </label>
            <textarea
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all resize-none min-h-[100px]"
              value={form.bio}
              onChange={e => {setForm(f => ({...f, bio: e.target.value})); setSuccess(false)}}
              placeholder="Describe brevemente tus productos u horarios..."
              maxLength={300}
            />
            <div className="flex justify-between text-[10px] font-medium tracking-tight text-zinc-400 px-1">
              <span>Se mostrará en la cabecera de tu tienda pública.</span>
              <span>{form.bio.length} / 300</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-semibold text-zinc-600">
                Categoría comercial
              </label>
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded uppercase tracking-wider">
                Actual: {form.category}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                    "flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left",
                    form.category === cat.id
                      ? "bg-zinc-950 border-zinc-950 text-white"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50/60"
                  )}
                >
                  <cat.icon className={cn(
                    "w-4 h-4 transition-transform",
                    form.category === cat.id ? "text-white" : "text-zinc-400"
                  )} />
                  <span className="text-xs font-semibold tracking-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2 items-center">
               <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
               <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                 Los cambios se reflejan automáticamente en tu tienda.
               </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full sm:w-auto h-10 px-5 rounded-lg bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2",
                success && "bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-default hover:bg-zinc-100"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
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
      <div className="rounded-xl p-6 sm:p-8 bg-zinc-50 border border-zinc-200 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                isPro ? "bg-zinc-900 text-white shadow-lg" : "bg-white border border-zinc-200 text-zinc-400"
              )}>
                {isPro ? <Sparkles className="w-5 h-5 text-amber-400" /> : <CreditCard className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Plan actual</p>
                <h4 className="text-xl font-bold text-zinc-900 tracking-tight">
                  {isPro ? 'Flash Pro Premium' : 'Free Terminal'}
                </h4>
              </div>
            </div>
            
            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-lg">
              {isPro 
                ? 'Tu tienda opera bajo el protocolo Pro. Tienes acceso a inventario ilimitado, soporte prioritario y todas las capacidades del motor de pagos acelerado.' 
                : 'Actualmente usas el plan básico. Desbloquea el inventario ilimitado y gestiona tu escala comercial sin restricciones activando el motor Premium.'}
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Seguridad Encriptada
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase">
                <Zap className="w-3 h-3 text-amber-500" />
                Checkout Acelerado
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-3">
            <SubscriptionButton isPro={isPro} />
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
              Gestionado vía Stripe Secure Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
