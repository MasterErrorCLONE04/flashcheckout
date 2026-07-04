'use client'

import { useState, useEffect } from 'react'
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
  User,
  Copy,
  Mail,
  Truck,
  Bell,
  Users
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
  mpAccessToken?: string | null;
  mpPublicKey?: string | null;
  mpConnected?: boolean;
  mpUserId?: string | null;
  whatsappInstanceName?: string | null;
  whatsappConnected?: boolean;
}

export default function StoreSettingsManager({
  initialStore,
  isPro,
}: {
  initialStore: StoreSettingsData
  isPro: boolean
}) {
  const [activeTab, setActiveTab] = useState<'general' | 'personalizacion' | 'dominios' | 'pagos' | 'envios' | 'notificaciones' | 'integraciones' | 'usuarios' | 'facturacion'>('general')
  
  const [form, setForm] = useState({
    name: initialStore.name,
    whatsapp: initialStore.whatsapp,
    bio: initialStore.bio || '',
    category: initialStore.category || 'General',
    logoFile: null as File | null,
    contactEmail: 'hola@tiendawebs.com',
    currency: 'COP',
    timezone: 'GMT-05:00',
    isActive: true
  })

  const [mpConnected, setMpConnected] = useState(!!initialStore.mpConnected)
  const [mpPublicKey, setMpPublicKey] = useState(initialStore.mpPublicKey || '')
  const [disconnectingMp, setDisconnectingMp] = useState(false)
  
  const [logoPreview, setLogoPreview] = useState<string | null>(initialStore.logoUrl)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // WhatsApp QR States
  const [whatsappConnected, setWhatsappConnected] = useState(!!initialStore.whatsappConnected)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [qrCodeText, setQrCodeText] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [pollingStatus, setPollingStatus] = useState(false)

  // Public Storefront URL construction
  const storefrontUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tienda/${initialStore.name.toLowerCase().replace(/\s+/g, '-')}`
    : `http://localhost:3000/tienda/tienda-webs`

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const mpConnectedParam = params.get('mp_connected')
      if (mpConnectedParam === 'success') {
        setMpConnected(true)
        toast.success("¡Mercado Pago conectado!", {
          description: "Tu pasarela de Mercado Pago está lista para procesar transacciones."
        })
        window.history.replaceState({}, '', window.location.pathname)
      } else if (mpConnectedParam === 'error') {
        const reason = params.get('error_reason')
        toast.error("Error al conectar Mercado Pago", {
          description: `Ocurrió un problema: ${reason || 'error_desconocido'}. Inténtalo de nuevo.`
        })
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  useEffect(() => {
    async function checkInitialStatus() {
      if (initialStore.whatsappInstanceName) {
        try {
          const res = await fetch('/api/whatsapp/instance')
          if (!res.ok) {
            console.warn("checkInitialStatus got response status", res.status)
            return
          }
          const data = await res.json()
          if (data.status === 'CONNECTED') {
            setWhatsappConnected(true)
          } else if (data.status === 'QRCODE') {
            setQrCodeBase64(data.base64 || null)
            setQrCodeText(data.code || null)
            setPollingStatus(true)
          }
        } catch (err) {
          console.error("Error checkInitialStatus on mount", err)
        }
      }
    }
    checkInitialStatus()
  }, [initialStore.whatsappInstanceName])

  useEffect(() => {
    let intervalId: any;
    if (pollingStatus && !whatsappConnected) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch('/api/whatsapp/instance');
          if (!res.ok) {
            console.warn("pollingStatus got response status", res.status)
            return
          }
          const data = await res.json();
          if (data.status === 'CONNECTED') {
            setWhatsappConnected(true);
            setQrCodeBase64(null);
            setPollingStatus(false);
            toast.success("¡WhatsApp enlazado con éxito! ✅", {
              description: "Tu número celular ahora está vinculado a FlashCheckout y respondiendo de forma automática."
            });
          } else if (data.status === 'QRCODE') {
            if (data.base64 && data.base64 !== qrCodeBase64) {
              setQrCodeBase64(data.base64);
              setQrCodeText(data.code);
            }
          }
        } catch (err) {
          console.error("Error polling WhatsApp QR connection state", err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollingStatus, whatsappConnected, qrCodeBase64]);

  async function handleConnectWhatsApp() {
    setLoadingQr(true);
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      });
      if (!res.ok) throw new Error('Fallo al conectar');
      const data = await res.json();
      if (data.status === 'CONNECTED') {
        setWhatsappConnected(true);
        toast.success("¡WhatsApp ya está conectado! ✅");
      } else {
        setQrCodeBase64(data.base64 || null);
        setQrCodeText(data.code || null);
        setPollingStatus(true);
        toast.info("Código QR generado. Escanéalo desde tu WhatsApp.");
      }
    } catch (err) {
      toast.error("Error al iniciar conexión de WhatsApp");
    } finally {
      setLoadingQr(false);
    }
  }

  async function handleDisconnectWhatsApp() {
    setLoadingQr(true);
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Fallo al desconectar');
      setWhatsappConnected(false);
      setQrCodeBase64(null);
      setQrCodeText(null);
      setPollingStatus(false);
      toast.success("Dispositivo de WhatsApp desconectado correctamente.");
    } catch (err) {
      toast.error("Error al desconectar dispositivo");
    } finally {
      setLoadingQr(false);
    }
  }

  function handleConnectMercadoPago() {
    const appId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID || ''
    if (!appId) {
      toast.error("Configuración incompleta", {
        description: "NEXT_PUBLIC_MERCADOPAGO_APP_ID no está configurado en las variables de entorno."
      })
      return
    }
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const redirectUri = encodeURIComponent(`${base.replace(/\/$/, '')}/api/mercadopago/callback`)
    const authUrl = `https://auth.mercadopago.com/authorization?client_id=${appId}&response_type=code&redirect_uri=${redirectUri}&state=${initialStore.id}`
    window.location.href = authUrl
  }

  async function handleDisconnectMercadoPago() {
    setDisconnectingMp(true)
    try {
      const res = await fetch('/api/stores/disconnect-mercadopago', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Error al desconectar')
      
      setMpConnected(false)
      setMpPublicKey('')
      toast.success("Mercado Pago desconectado", {
        description: "Se han removido las credenciales del comercio."
      })
    } catch (error) {
      toast.error("Error al desconectar", {
        description: "No se pudo desconectar tu cuenta de Mercado Pago. Inténtalo de nuevo."
      })
    } finally {
      setDisconnectingMp(false)
    }
  }

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

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
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

  function handleCopyLink() {
    navigator.clipboard.writeText(storefrontUrl)
    toast.success("¡Enlace copiado!", {
      description: "El enlace a tu tienda ha sido copiado al portapapeles."
    })
  }

  return (
    <div className="space-y-6">
      {/* Encabezado General */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Ajustes de Tienda</h1>
          <p className="text-xs font-medium text-zinc-500 mt-1">
            Personaliza la información y configuración de tu tienda online.
          </p>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-none border border-emerald-500 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span>Guardar cambios</span>
        </button>
      </div>

      {/* Cuerpo Principal de Ajustes: Menú Lateral y Formulario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 1. Menú Lateral de Ajustes (Columna Izquierda, spans 3/12) */}
        <div className="lg:col-span-3 flex flex-col space-y-1.5 select-none pr-2">
          {[
            { id: 'general', label: 'Información General' },
            { id: 'personalizacion', label: 'Personalización' },
            { id: 'dominios', label: 'Dominios' },
            { id: 'pagos', label: 'Métodos de Pago' },
            { id: 'envios', label: 'Envíos' },
            { id: 'notificaciones', label: 'Notificaciones' },
            { id: 'integraciones', label: 'Integraciones' },
            { id: 'usuarios', label: 'Usuarios' },
            { id: 'facturacion', label: 'Facturación' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center py-2.5 px-3 rounded-none text-xs transition-all text-left cursor-pointer bg-transparent border-y-transparent border-r-transparent border-l-2",
                activeTab === tab.id
                  ? "text-emerald-600 font-bold border-emerald-500"
                  : "text-zinc-650 hover:text-zinc-900 font-semibold border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2. Tarjeta del Formulario Principal (Columna Central, spans 5/12) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* TAB: INFORMACIÓN GENERAL */}
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Bloque: Información General */}
              <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Información General</h3>
                  <p className="text-xs text-zinc-500 mt-1">Actualiza la información básica de tu tienda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre de la tienda */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500">Nombre de la tienda</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nombre comercial"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Correo de contacto */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500">Correo de contacto</label>
                    <input
                      type="email"
                      required
                      value={form.contactEmail}
                      onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Descripción de la tienda */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-zinc-500">Descripción</label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={form.bio}
                        onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 160) }))}
                        placeholder="Tienda online de productos naturales..."
                        className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed"
                      />
                      <div className="absolute bottom-2 right-3.5 text-[9px] font-bold text-zinc-400">
                        {form.bio.length} / 160
                      </div>
                    </div>
                  </div>

                  {/* Teléfono de contacto */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-bold text-zinc-500">Teléfono de contacto</label>
                    <input
                      type="text"
                      required
                      value={form.whatsapp}
                      onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                      placeholder="+57 300 123 4567"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque: Logo de la tienda */}
              <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Logo de la tienda</h3>
                  <p className="text-xs text-zinc-500 mt-1">Este logo se mostrará en tu tienda y en los catálogos.</p>
                </div>

                <div className="flex items-center gap-6">
                  {logoPreview ? (
                    <div className="w-18 h-18 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 relative shrink-0">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-18 h-18 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-zinc-400">Sin logo</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 h-8 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer">
                      <ImagePlus className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Subir nuevo logo</span>
                      <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoSelect} />
                    </label>

                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center justify-center w-8 h-8 bg-white border border-zinc-200 hover:bg-zinc-50 text-red-500 rounded-lg shadow-none transition-all active:scale-95 cursor-pointer"
                        title="Eliminar logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bloque: Moneda y zona horaria */}
              <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Moneda y zona horaria</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Moneda */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500">Moneda</label>
                    <select
                      value={form.currency}
                      onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="COP">Peso Colombiano (COP) - $</option>
                      <option value="USD">Dólar Americano (USD) - $</option>
                      <option value="MXN">Peso Mexicano (MXN) - $</option>
                      <option value="EUR">Euro (EUR) - €</option>
                    </select>
                  </div>

                  {/* Zona Horaria */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500">Zona horaria</label>
                    <select
                      value={form.timezone}
                      onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="GMT-05:00">(GMT-05:00) Bogotá, Lima, Quito</option>
                      <option value="GMT-06:00">(GMT-06:00) Ciudad de México</option>
                      <option value="GMT-04:00">(GMT-04:00) Caracas, La Paz</option>
                      <option value="GMT-03:00">(GMT-03:00) Buenos Aires, Santiago</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloque: Estado de la tienda */}
              <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Estado de la tienda</h3>
                  <p className="text-xs text-zinc-500 mt-1">Activa o desactiva tu tienda online.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Tienda visible</h4>
                    <p className="text-[10px] text-zinc-550 font-semibold mt-0.5">Permite que tus clientes ingresen y compren en línea.</p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-zinc-200 rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Categorías */}
              <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">Categoría comercial</h3>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {form.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left cursor-pointer active:scale-95",
                        form.category === cat.id
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                      )}
                    >
                      <cat.icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </form>
          )}

          {/* TAB: MÉTODOS DE PAGO */}
          {activeTab === 'pagos' && (
            <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Métodos de Pago</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Conecta tus pasarelas para recaudar fondos directamente de las compras de tus clientes.
                </p>
              </div>

              <div className="space-y-4">
                {/* Stripe Connect Gateway */}
                <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#635BFF] text-white flex items-center justify-center">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">Stripe Connect</h4>
                        <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Pasarela Global</p>
                      </div>
                    </div>

                    {initialStore.stripeConnectAccountId ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-wider">
                        Conectado
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-400 uppercase tracking-wider">
                        Desconectado
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                    Recibe pagos con tarjetas internacionales, Apple Pay, Google Pay y PSE de forma automatizada.
                  </p>

                  {initialStore.stripeConnectAccountId ? (
                    <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center justify-between text-[11px] font-bold text-zinc-700">
                      <span>ID: <code className="font-mono text-zinc-950">{initialStore.stripeConnectAccountId}</code></span>
                      <span className="text-[9px] text-emerald-600 flex items-center gap-1">⚡ Cargos habilitados</span>
                    </div>
                  ) : (
                    <button className="flex items-center gap-1.5 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-none transition-all cursor-pointer">
                      <span>Conectar cuenta de Stripe</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* MercadoPago Gateway */}
                <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#00B1EA] text-white flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">Mercado Pago Connect</h4>
                        <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Pasarela Local</p>
                      </div>
                    </div>

                    {mpConnected ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 uppercase tracking-wider">
                        Conectado
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-400 uppercase tracking-wider">
                        Desconectado
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                    Recibe cobros locales mediante PSE, tarjetas y redes de efectivo locales como Efecty.
                  </p>

                  {mpConnected ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-zinc-200 flex flex-col gap-1.5 text-[11px] font-bold text-zinc-700">
                        <div className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>ID de Cuenta: <code className="font-mono text-zinc-950">{initialStore.mpUserId || 'Asociada'}</code></span>
                        </div>
                        {mpPublicKey && (
                          <span className="text-[9px] text-zinc-400 font-mono">Clave Pública: {mpPublicKey.slice(0, 15)}...</span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleDisconnectMercadoPago}
                        disabled={disconnectingMp}
                        className="flex items-center gap-1.5 h-9 px-4 bg-white hover:bg-zinc-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold shadow-none transition-all cursor-pointer disabled:opacity-50"
                      >
                        {disconnectingMp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        <span>Desconectar Mercado Pago</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectMercadoPago}
                      className="flex items-center gap-1.5 h-9 px-4 bg-[#00B1EA] hover:bg-[#009ed2] text-white rounded-lg text-xs font-semibold shadow-none transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Conectar con Mercado Pago</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: INTEGRACIONES (WhatsApp Evolution QR) */}
          {activeTab === 'integraciones' && (
            <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Integración de WhatsApp</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Enlaza tu número celular a FlashCheckout mediante código QR para automatizar respuestas e intervenir directamente en conversaciones.
                </p>
              </div>

              {whatsappConnected ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200/50 rounded-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Línea Conectada e Inteligente</h4>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Tu bot de IA y el chat en vivo están respondiendo activamente.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loadingQr}
                    onClick={handleDisconnectWhatsApp}
                    className="flex items-center gap-1.5 h-9 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold shadow-none transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>Desconectar WhatsApp</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Pasos para conectar:</h4>
                    <ol className="list-decimal list-inside text-xs font-medium text-zinc-500 space-y-2 leading-relaxed">
                      <li>Haz clic en el botón de abajo para generar el Código QR.</li>
                      <li>Abre WhatsApp en tu teléfono celular.</li>
                      <li>Ve a <strong className="text-zinc-900">Dispositivos vinculados</strong> y selecciona <strong className="text-zinc-900">Vincular un dispositivo</strong>.</li>
                      <li>Apunta tu cámara al código QR.</li>
                    </ol>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border border-zinc-200 rounded-lg bg-zinc-50 min-h-[220px]">
                    {loadingQr ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Generando QR...</span>
                      </div>
                    ) : qrCodeBase64 ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-2.5 bg-white border border-zinc-200 rounded-lg">
                          <img src={qrCodeBase64} alt="Scan QR Code" className="w-40 h-40 object-contain" />
                        </div>
                        <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Esperando escaneo...
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Phone className="w-8 h-8 text-zinc-300 mb-1" />
                        <button
                          type="button"
                          onClick={handleConnectWhatsApp}
                          className="flex items-center gap-1.5 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold shadow-none transition-all cursor-pointer"
                        >
                          <span>Generar Código QR</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: FACTURACIÓN / PLAN */}
          {activeTab === 'facturacion' && (
            <div className="p-6 bg-white border border-zinc-200 rounded-lg shadow-none space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Suscripción y Límites</h3>
                <p className="text-xs text-zinc-500 mt-1">Consulta los límites operativos de tu plan comercial.</p>
              </div>

              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                    isPro 
                      ? "bg-zinc-900 border-zinc-950 text-white" 
                      : "bg-white border-zinc-200 text-zinc-400"
                  )}>
                    {isPro ? <Sparkles className="w-5 h-5 text-amber-400 fill-current" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">Plan actual</p>
                    <h4 className="text-sm font-bold text-zinc-900 mt-1">{isPro ? 'Flash Pro Premium' : 'Free Terminal'}</h4>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  {isPro 
                    ? 'Tu tienda opera bajo el plan Pro. Tienes acceso a inventario ilimitado, soporte prioritario por WhatsApp y checkout acelerado.' 
                    : 'Actualmente usas el plan gratuito básico de un solo vendedor. Desbloquea inventario ilimitado y soporte Pro.'}
                </p>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <SubscriptionButton isPro={isPro} />
                </div>
              </div>
            </div>
          )}

          {/* OTHER SIMULATED TABS */}
          {['personalizacion', 'dominios', 'envios', 'notificaciones', 'usuarios'].includes(activeTab) && (
            <div className="p-12 bg-white border border-zinc-200 rounded-lg flex flex-col items-center justify-center text-center space-y-4 shadow-none">
              <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-none">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900">Sección en desarrollo</h4>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  Esta sección estará disponible próximamente para potenciar la personalización, logística y control administrativo de tu comercio.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* 3. Columna Lateral Derecha (Vista Previa & Enlace de la Tienda, spans 4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: Vista previa de tu tienda */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Vista previa de tu tienda</h3>
              <p className="text-xs text-zinc-500 mt-1">Así es como verán tu tienda tus clientes.</p>
            </div>

            {/* Mobile Portada Frame Mockup */}
            <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-none space-y-4 select-none">
              
              {/* Header Mini bar */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <button className="text-zinc-400 hover:text-zinc-600 text-sm">☰</button>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-emerald-600">🌿</span>
                  <span className="text-[10px] font-extrabold text-zinc-900 tracking-tight">{form.name || 'Mi Tienda'}</span>
                </div>
                <button className="text-zinc-400 hover:text-zinc-600 text-sm">🛒</button>
              </div>

              {/* Banner Area */}
              <div className="bg-emerald-50/50 rounded-lg p-3.5 flex items-center justify-between gap-2 border border-emerald-100/40">
                <div className="space-y-1.5 max-w-[60%]">
                  <h4 className="text-[11px] font-extrabold text-emerald-800 leading-snug">
                    Productos naturales para tu bienestar
                  </h4>
                  <p className="text-[8px] text-zinc-500 leading-tight">
                    Descubre nuestra selección de alta calidad.
                  </p>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-[7px] font-bold px-2 py-1 rounded-full cursor-pointer shrink-0 transition-transform active:scale-95 mt-1">
                    Ver productos
                  </button>
                </div>

                {/* CSS supplement/vitamin bottle illustration mockup */}
                <div className="w-12 h-20 bg-white border border-zinc-200 rounded-lg flex flex-col items-center justify-between p-1 relative overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.05)] shrink-0">
                  {/* Bottle Cap */}
                  <div className="w-6 h-2 bg-emerald-600 rounded-t-sm shrink-0" />
                  <div className="w-7 h-0.5 bg-emerald-700 shrink-0" />
                  
                  {/* Bottle Label */}
                  <div className="flex-1 w-full bg-emerald-50/30 rounded border border-emerald-100 flex flex-col items-center justify-center p-0.5 mt-0.5">
                    <span className="text-[4px] font-extrabold text-emerald-800 uppercase tracking-widest leading-none">Vitamins</span>
                    <span className="text-[7px] font-black text-emerald-950 mt-0.5 leading-none">🌿</span>
                    <span className="text-[3px] font-bold text-zinc-400 mt-0.5 leading-none">Natural</span>
                  </div>
                </div>
              </div>

              {/* Lower info badges row */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[7px] font-semibold text-zinc-500 pt-1">
                <div className="p-1 bg-zinc-50 border border-zinc-150 rounded flex flex-col items-center justify-center gap-0.5">
                  <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Envíos rápidos</span>
                </div>
                <div className="p-1 bg-zinc-50 border border-zinc-150 rounded flex flex-col items-center justify-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Pago 100% seguro</span>
                </div>
                <div className="p-1 bg-zinc-50 border border-zinc-150 rounded flex flex-col items-center justify-center gap-0.5">
                  <span>🌿</span>
                  <span>Productos naturales</span>
                </div>
              </div>

            </div>
          </div>

          {/* Card: Enlace de tu tienda */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Enlace de tu tienda</h3>
              <p className="text-xs text-zinc-500 mt-1">Comparte este enlace para que tus clientes visiten tu tienda.</p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-none space-y-3.5">
              <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-2 gap-2 min-w-0">
                <input
                  type="text"
                  readOnly
                  value={storefrontUrl}
                  className="flex-1 bg-transparent text-[11px] font-mono text-zinc-700 outline-none truncate border-none focus:ring-0 p-0 font-bold"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-7 h-7 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-650 flex items-center justify-center active:scale-90 transition-transform shrink-0 cursor-pointer"
                  title="Copiar enlace"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <a
                href={storefrontUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 h-9 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold shadow-none transition-all active:scale-95 cursor-pointer"
              >
                <span>Ver tienda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
