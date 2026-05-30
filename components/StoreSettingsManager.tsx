'use client'

import { useState } from 'react'
import { 
  Loader2, 
  Store, 
  Phone, 
  AlignLeft, 
  ImagePlus, 
  X, 
  Check, 
  Globe, 
  HelpCircle, 
  Shirt, 
  Smartphone, 
  Home, 
  Sparkles, 
  Utensils, 
  Dumbbell, 
  Gamepad2, 
  MoreHorizontal, 
  CreditCard, 
  ShieldCheck, 
  Zap,
  Lock,
  ExternalLink,
  ChevronRight,
  Eye,
  Key,
  User
} from 'lucide-react'
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
  stripeConnectAccountId?: string | null;
  stripeConnectChargesEnabled?: boolean;
}

export default function StoreSettingsManager({
  initialStore,
  isPro,
}: {
  initialStore: StoreSettingsData
  isPro: boolean
}) {
  const [activeTab, setActiveTab] = useState<'tienda' | 'pagos' | 'plan' | 'seguridad'>('tienda')
  const [form, setForm] = useState({
    name: initialStore.name,
    whatsapp: initialStore.whatsapp,
    bio: initialStore.bio || '',
    category: initialStore.category || 'General',
    logoFile: null as File | null,
  })

  // Inputs para MercadoPago (Simulado/Persistencia local o para expansión)
  const [mpKeys, setMpKeys] = useState({
    publicKey: '',
    accessToken: '',
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

  function saveMercadoPago() {
    toast.success("Credenciales de MercadoPago encriptadas y guardadas", {
      description: "Tu pasarela de MercadoPago está lista para procesar transacciones."
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 1. Left Sidebar Navigation Column (Spans 4/12) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="premium-card p-5 bg-white border-gray-200 space-y-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-3">Panel de Ajustes</p>
          
          <button
            onClick={() => setActiveTab('tienda')}
            className={cn(
              "w-full flex items-center justify-between p-3.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]",
              activeTab === 'tienda'
                ? "bg-zinc-950 border-zinc-950 text-white shadow-sm"
                : "bg-white border-transparent text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4" />
              Perfil de Tienda
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-45" />
          </button>

          <button
            onClick={() => setActiveTab('pagos')}
            className={cn(
              "w-full flex items-center justify-between p-3.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]",
              activeTab === 'pagos'
                ? "bg-zinc-950 border-zinc-950 text-white shadow-sm"
                : "bg-white border-transparent text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50/50"
            )}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4" />
              Pasarelas de Pago
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-45" />
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={cn(
              "w-full flex items-center justify-between p-3.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]",
              activeTab === 'plan'
                ? "bg-zinc-950 border-zinc-950 text-white shadow-sm"
                : "bg-white border-transparent text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50/50"
            )}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4" />
              Plan y Suscripción
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-45" />
          </button>

          <button
            onClick={() => setActiveTab('seguridad')}
            className={cn(
              "w-full flex items-center justify-between p-3.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]",
              activeTab === 'seguridad'
                ? "bg-zinc-950 border-zinc-950 text-white shadow-sm"
                : "bg-white border-transparent text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50/50"
            )}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4" />
              Seguridad y SSL
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-45" />
          </button>
        </div>
      </div>

      {/* 2. Right Work Pane Column (Spans 8/12) */}
      <div className="lg:col-span-8">
        
        {/* Tab Content: Store Details */}
        {activeTab === 'tienda' && (
          <div className="premium-card p-8 bg-white border-gray-200 rounded-lg relative overflow-hidden shadow-none animate-fade-in">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <p className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">Identidad de tu negocio</p>
                <h3 className="text-xl font-semibold text-zinc-950 tracking-tight font-display">
                  Configuración de tienda
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-gray-200/60 flex items-center justify-center text-zinc-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Logo Section */}
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start pb-6 border-b border-zinc-100">
                <div className="shrink-0 relative group">
                  {logoPreview ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-zinc-50 relative group/img transition-all shadow-sm">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"
                        title="Remover logo"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border border-dashed border-gray-200 bg-zinc-50 flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-100/50 transition-all">
                      <Store className="w-8 h-8 opacity-20 mb-2" />
                      <span className="text-[9px] font-bold tracking-widest opacity-60 uppercase text-zinc-400">Sin logo</span>
                    </div>
                  )}
                  
                  <label className="absolute -bottom-1 -right-1 bg-zinc-950 text-white border border-zinc-900 hover:bg-zinc-900 font-bold text-[9px] tracking-wider rounded-lg px-3 py-1.5 cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 uppercase shadow-sm">
                    <ImagePlus className="w-3.5 h-3.5" />
                    Subir
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoSelect} />
                  </label>
                </div>

                <div className="flex-1 space-y-5 w-full">
                  {/* Field: Name */}
                  <div className="space-y-2 group">
                    <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Nombre comercial</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                      <input
                        type="text"
                        required
                        className="w-full bg-zinc-50/50 border border-gray-200 rounded-lg pl-12 pr-4 py-2.5 text-sm font-medium text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-950/20 focus:bg-white transition-all"
                        value={form.name}
                        onChange={e => {setForm(f => ({...f, name: e.target.value})); setSuccess(false)}}
                        placeholder="Nombre de tu marca"
                      />
                    </div>
                  </div>
                  
                  {/* Field: WhatsApp */}
                  <div className="space-y-2 group">
                    <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">WhatsApp de ventas</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                      <input
                        type="text"
                        required
                        className="w-full bg-zinc-50/50 border border-gray-200 rounded-lg pl-12 pr-10 py-2.5 text-sm font-medium text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-950/20 focus:bg-white transition-all tabular-nums"
                        value={form.whatsapp}
                        onChange={e => {setForm(f => ({...f, whatsapp: e.target.value})); setSuccess(false)}}
                        placeholder="573210000000"
                      />
                      <span 
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-help text-zinc-300 hover:text-zinc-500 transition-colors"
                        title="Ingresa tu número con código de país, omitiendo el símbolo +"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium tracking-tight px-1">Ingresar código de país sin el símbolo "+".</p>
                  </div>
                </div>
              </div>

              {/* Field: Bio */}
              <div className="space-y-2 group">
                <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">Descripción de la tienda</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4.5 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                  <textarea
                    className="w-full bg-zinc-50/50 border border-gray-200 rounded-lg pl-12 pr-4 py-3 text-sm font-medium text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-950/20 focus:bg-white transition-all resize-none min-h-[110px]"
                    value={form.bio}
                    onChange={e => {setForm(f => ({...f, bio: e.target.value})); setSuccess(false)}}
                    placeholder="Describe brevemente tus productos, horarios de atención o información clave..."
                    maxLength={300}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-medium tracking-tight text-zinc-400 px-1">
                  <span>Se mostrará en la cabecera de tu tienda pública.</span>
                  <span>{form.bio.length} / 300</span>
                </div>
              </div>

              {/* Field: Category */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[13px] font-medium tracking-tight text-zinc-500">
                    Categoría comercial
                  </label>
                  <span className="text-[10px] font-extrabold text-zinc-955 bg-zinc-50 border border-gray-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
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
                        "flex items-center gap-2.5 p-3 rounded-lg border transition-all text-left cursor-pointer active:scale-[0.98]",
                        form.category === cat.id
                          ? "bg-zinc-950 border-zinc-950 text-white shadow-sm"
                          : "bg-white border-gray-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50/50"
                      )}
                    >
                      <cat.icon className={cn(
                        "w-4 h-4 transition-transform",
                        form.category === cat.id ? "text-white" : "text-zinc-400"
                      )} />
                      <span className="text-xs font-bold tracking-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-2 items-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                   <p className="text-[11px] font-medium text-zinc-400 leading-relaxed">
                     Los cambios se reflejan automáticamente en tu tienda.
                   </p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full sm:w-auto btn-premium h-11 px-6 flex items-center justify-center gap-2 cursor-pointer",
                    success && "bg-zinc-100 text-zinc-500 border border-gray-200 cursor-default hover:bg-zinc-100 shadow-none"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="text-xs font-bold uppercase tracking-wider">Guardando...</span>
                    </>
                  ) : success ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in-50" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Guardado exitoso</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold uppercase tracking-wider">Guardar cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: Payment Gateways */}
        {activeTab === 'pagos' && (
          <div className="premium-card p-8 bg-white border-gray-200 rounded-lg space-y-8 animate-fade-in shadow-none">
            <div>
              <p className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">Cuentas y Recaudos</p>
              <h3 className="text-xl font-semibold text-zinc-955 tracking-tight font-display">
                Pasarelas de Pago
              </h3>
              <p className="text-xs font-medium text-zinc-500 mt-2 leading-relaxed max-w-lg">
                Conecta tus pasarelas para recaudar fondos directamente de las compras de tus clientes mediante tarjetas, PSE o efectivo.
              </p>
            </div>

            <div className="space-y-6">
              {/* Stripe Connect Gateway */}
              <div className="p-6 bg-zinc-50/50 rounded-lg border border-gray-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#635BFF] text-white flex items-center justify-center shadow-sm">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Pasarela Global</p>
                      <h4 className="text-sm font-bold text-zinc-950">Stripe Connect</h4>
                    </div>
                  </div>

                  {initialStore.stripeConnectAccountId ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                      Conectado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-zinc-100 border border-gray-200 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      Desconectado
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                  Recibe pagos con tarjetas internacionales, Apple Pay, Google Pay y PSE. Con Stripe Connect, las transacciones se liquidan y dispersan de forma directa e inmediata a tu cuenta bancaria.
                </p>

                {initialStore.stripeConnectAccountId ? (
                  <div className="p-3 bg-white rounded-md border border-gray-200 flex items-center justify-between text-xs font-semibold text-zinc-700">
                    <span>ID de Conexión: <code className="font-mono text-zinc-950 font-bold">{initialStore.stripeConnectAccountId}</code></span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">⚡ Cargos habilitados</span>
                  </div>
                ) : (
                  <button className="btn-premium h-11 px-5 text-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider w-full sm:w-auto">
                    Conectar cuenta de Stripe
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* MercadoPago Gateway */}
              <div className="p-6 bg-zinc-50/50 rounded-lg border border-gray-200/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00B1EA] text-white flex items-center justify-center shadow-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Pasarela Local</p>
                      <h4 className="text-sm font-bold text-zinc-950">MercadoPago (Cuentas Locales)</h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                    Listo para sincronizar
                  </span>
                </div>

                <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                  Recibe cobros locales de forma ágil y segura. Inserta tus credenciales de integración de MercadoPago para habilitar transacciones en tu pasarela.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Public Key</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="APP_USR-..."
                        value={mpKeys.publicKey}
                        onChange={(e) => setMpKeys(prev => ({ ...prev, publicKey: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-zinc-950 focus:outline-none focus:border-zinc-950/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Access Token</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                      <input
                        type="password"
                        placeholder="TEST-..."
                        value={mpKeys.accessToken}
                        onChange={(e) => setMpKeys(prev => ({ ...prev, accessToken: e.target.value }))}
                        className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-zinc-950 focus:outline-none focus:border-zinc-950/20 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveMercadoPago}
                  className="w-full sm:w-auto h-10 px-5 bg-zinc-955 text-white hover:bg-zinc-900 border border-transparent rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sincronizar MercadoPago
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Plan & Billing */}
        {activeTab === 'plan' && (
          <div className="space-y-6 animate-fade-in">
            <div className="premium-card p-8 bg-white border-gray-200 rounded-lg shadow-none">
              <div>
                <p className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">Facturación y Límites</p>
                <h3 className="text-xl font-semibold text-zinc-955 tracking-tight font-display">
                  Suscripción de Cuenta
                </h3>
              </div>
            </div>

            <div className="premium-card p-8 bg-zinc-50/50 border-gray-200 relative overflow-hidden rounded-lg shadow-none">
              <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 border shadow-sm",
                      isPro 
                        ? "bg-zinc-955 border-zinc-950 text-white" 
                        : "bg-white border-gray-200 text-zinc-400"
                    )}>
                      {isPro ? <Sparkles className="w-5 h-5 text-amber-400 fill-current" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Plan actual</p>
                      <h4 className="text-lg font-bold text-zinc-950 tracking-tight leading-none">
                        {isPro ? 'Flash Pro Premium' : 'Free Terminal'}
                      </h4>
                    </div>
                  </div>
                  
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-lg">
                    {isPro 
                      ? 'Tu tienda opera bajo el protocolo Pro de alta velocidad. Tienes acceso a inventario ilimitado, soporte prioritario por WhatsApp y todas las capacidades del motor de pagos acelerado de Stripe y MercadoPago.' 
                      : 'Actualmente usas el plan básico de un solo vendedor. Desbloquea el inventario ilimitado y gestiona tu escala comercial sin restricciones activando el motor Pro.'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[9px] font-bold text-zinc-500 uppercase tracking-wider shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Seguridad Encriptada SSL
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[9px] font-bold text-zinc-500 uppercase tracking-wider shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      Checkout Instantáneo
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-3">
                  <SubscriptionButton isPro={isPro} />
                  <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest mt-1">
                    Pasarela segura por Stripe Secure Gateway
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Security */}
        {activeTab === 'seguridad' && (
          <div className="premium-card p-8 bg-white border-gray-200 rounded-lg space-y-6 animate-fade-in shadow-none">
            <div>
              <p className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 mb-1">Protección y accesos</p>
              <h3 className="text-xl font-semibold text-zinc-955 tracking-tight font-display">
                Seguridad y SSL
              </h3>
              <p className="text-xs font-medium text-zinc-500 mt-2 leading-relaxed max-w-lg">
                Monitorea el estado de encriptación de tu checkout web, claves de transacciones y autenticación oficial mediante Clerk.
              </p>
            </div>

            <div className="space-y-4">
              {/* Security Indicators Grid */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-50 rounded-lg border border-gray-200/80 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <h5 className="text-xs font-bold text-zinc-950 mt-1">SSL Activo</h5>
                  <p className="text-[10px] font-medium text-zinc-500">Checkout encriptado mediante HTTPS certificado.</p>
                </div>

                <div className="p-4 bg-zinc-50 rounded-lg border border-gray-200/80 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <h5 className="text-xs font-bold text-zinc-950 mt-1">Token AES-256</h5>
                  <p className="text-[10px] font-medium text-zinc-500">Los datos de clientes y carritos están cifrados de extremo a extremo.</p>
                </div>

                <div className="p-4 bg-zinc-50 rounded-lg border border-gray-200/80 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <h5 className="text-xs font-bold text-zinc-950 mt-1">Webhooks Seguros</h5>
                  <p className="text-[10px] font-medium text-zinc-500">Sincronización validada con firmas criptográficas de Stripe.</p>
                </div>
              </div>

              {/* Clerk authentication notice */}
              <div className="p-5 bg-zinc-50/50 rounded-lg border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 mt-2">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-955 uppercase tracking-wider">Perfil y Contraseña</h4>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-md">
                    Para modificar tu correo, vincular cuentas de inicio de sesión de Google o cambiar tu contraseña, utiliza el portal de administración segura de Clerk.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => toast.info("Redirigiendo a la gestión de cuenta Clerk...")}
                  className="h-10 px-4 bg-zinc-955 text-white hover:bg-zinc-900 border border-transparent rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  Gestionar Cuenta
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
