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
  Users,
  Bot,
  Settings,
  MapPin,
  Clock,
  Calendar,
  Shield,
  ChevronDown,
  Save,
  Power,
  Pencil,
  Building2,
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
  settings?: any;
}

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'perfil', label: 'Perfil del negocio' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'notificaciones', label: 'Notificaciones' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'actividad', label: 'Registro de actividad' },
]

const SCHEDULE_DAYS = [
  { key: 'lunes',    label: 'Lunes',    from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'martes',   label: 'Martes',   from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'miercoles',label: 'Miércoles',from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'jueves',   label: 'Jueves',   from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'viernes',  label: 'Viernes',  from: '7:00 a. m.', to: '9:00 p. m.', enabled: true },
  { key: 'sabado',   label: 'Sábado',   from: '8:00 a. m.', to: '9:00 p. m.', enabled: true },
  { key: 'domingo',  label: 'Domingo',  from: '8:00 a. m.', to: '6:00 p. m.', enabled: true },
]

export default function StoreSettingsManager({
  initialStore,
  isPro,
}: {
  initialStore: StoreSettingsData
  isPro: boolean
}) {
  const [activeTab, setActiveTab] = useState<'general' | 'perfil' | 'pagos' | 'notificaciones' | 'usuarios' | 'seguridad' | 'actividad'>('general')
  
  const storeSettings = typeof initialStore.settings === 'object' && initialStore.settings !== null
    ? (initialStore.settings as any)
    : {}

  const [form, setForm] = useState({
    name: initialStore.name,
    whatsapp: initialStore.whatsapp,
    bio: initialStore.bio || '',
    category: initialStore.category || 'General',
    logoFile: null as File | null,
    contactEmail: storeSettings.contactEmail || 'hola@tiendawebs.com',
    currency: storeSettings.currency || 'COP',
    timezone: storeSettings.timezone || 'GMT-05:00',
    language: storeSettings.language || 'es',
    dateFormat: storeSettings.dateFormat || 'DD/MM/YYYY',
    isActive: storeSettings.isActive ?? true,
    botEnabled: storeSettings.botEnabled ?? true,
    autoReply: storeSettings.autoReply ?? true,
    humanHandoff: storeSettings.humanHandoff ?? true,
    address: storeSettings.address || 'Calle 70 # 45-23',
    city: storeSettings.city || 'Medellín',
    department: storeSettings.department || 'Antioquia',
    postalCode: storeSettings.postalCode || '050021',
    country: storeSettings.country || 'Colombia',
  })

  // Dynamic state bindings for the new tabs
  const [bannerUrl, setBannerUrl] = useState<string | null>(storeSettings.bannerUrl || null)
  const [brandColor, setBrandColor] = useState<string>(storeSettings.brandColor || '#10B981')
  const [instagramUrl, setInstagramUrl] = useState<string>(storeSettings.instagramUrl || '')
  const [facebookUrl, setFacebookUrl] = useState<string>(storeSettings.facebookUrl || '')
  const [tiktokUrl, setTiktokUrl] = useState<string>(storeSettings.tiktokUrl || '')
  const [websiteUrl, setWebsiteUrl] = useState<string>(storeSettings.websiteUrl || '')

  const [notifications, setNotifications] = useState({
    orderWhatsapp: storeSettings.notifications?.orderWhatsapp ?? true,
    orderEmail: storeSettings.notifications?.orderEmail ?? false,
    resumenEmail: storeSettings.notifications?.resumenEmail ?? true,
    resumenWhatsapp: storeSettings.notifications?.resumenWhatsapp ?? false,
    stockWhatsapp: storeSettings.notifications?.stockWhatsapp ?? true,
    stockEmail: storeSettings.notifications?.stockEmail ?? true,
    esperaWhatsapp: storeSettings.notifications?.esperaWhatsapp ?? true,
    esperaEmail: storeSettings.notifications?.esperaEmail ?? false,
  })

  const defaultTeam = [
    { name: initialStore.name + ' Admin', email: 'admin@tiendawebs.com', role: 'Propietario', active: true },
    { name: 'Diana Gómez', email: 'diana@tiendawebs.com', role: 'Administrador', active: true },
    { name: 'Soporte Ventas', email: 'ventas@tiendawebs.com', role: 'Soporte / Chat', active: false }
  ]
  const [team, setTeam] = useState<any[]>(storeSettings.team || defaultTeam)

  const [doubleFactor, setDoubleFactor] = useState<boolean>(storeSettings.security?.doubleFactor ?? false)
  const [autologout, setAutologout] = useState<boolean>(storeSettings.security?.autologout ?? true)
  const [apiToken, setApiToken] = useState<string>(storeSettings.security?.apiToken || 'flash_token_live_38294hjda8921jkdskla')

  const defaultLogs = [
    { event: 'Inicio de sesión exitoso', detail: 'Ingreso desde Medellín, CO (Chrome/Windows)', user: initialStore.name + ' Admin', time: 'Hoy, 08:34 a. m.' },
    { event: 'Panel configurado', detail: 'Se cargaron los ajustes de inicialización', user: 'Sistema', time: 'Hace unos instantes' }
  ]
  const [activityLog, setActivityLog] = useState<any[]>(storeSettings.activityLog || defaultLogs)

  const [schedule, setSchedule] = useState(storeSettings.schedule || SCHEDULE_DAYS)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(false)

  const [mpConnected, setMpConnected] = useState(!!initialStore.mpConnected)
  const [mpPublicKey, setMpPublicKey] = useState(initialStore.mpPublicKey || '')
  const [disconnectingMp, setDisconnectingMp] = useState(false)
  
  const [logoPreview, setLogoPreview] = useState<string | null>(initialStore.logoUrl)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [whatsappConnected, setWhatsappConnected] = useState(!!initialStore.whatsappConnected)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [qrCodeText, setQrCodeText] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [pollingStatus, setPollingStatus] = useState(false)

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
          if (!res.ok) { console.warn("checkInitialStatus got response status", res.status); return }
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
          if (!res.ok) { console.warn("pollingStatus got response status", res.status); return }
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
    return () => { if (intervalId) clearInterval(intervalId); };
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
      const res = await fetch('/api/whatsapp/instance', { method: 'DELETE' });
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
      const res = await fetch('/api/stores/disconnect-mercadopago', { method: 'POST' })
      if (!res.ok) throw new Error('Error al desconectar')
      setMpConnected(false)
      setMpPublicKey('')
      toast.success("Mercado Pago desconectado", { description: "Se han removido las credenciales del comercio." })
    } catch (error) {
      toast.error("Error al desconectar", { description: "No se pudo desconectar tu cuenta de Mercado Pago. Inténtalo de nuevo." })
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
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) throw new Error('Falló subida')
        const uploadData = await uploadRes.json()
        finalLogoUrl = uploadData.url
      } else if (logoPreview === null) {
        finalLogoUrl = null
      }

      // Build updated settings JSON payload
      const updatedSettings = {
        bannerUrl,
        brandColor,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        websiteUrl,
        notifications,
        team,
        schedule,
        security: {
          doubleFactor,
          autologout,
          apiToken
        },
        contactEmail: form.contactEmail,
        currency: form.currency,
        timezone: form.timezone,
        language: form.language,
        dateFormat: form.dateFormat,
        isActive: form.isActive,
        botEnabled: form.botEnabled,
        autoReply: form.autoReply,
        humanHandoff: form.humanHandoff,
        address: form.address,
        city: form.city,
        department: form.department,
        postalCode: form.postalCode,
        country: form.country,
        activityLog: [
          {
            event: 'Configuración guardada',
            detail: 'Se actualizaron los ajustes de la tienda',
            user: initialStore.name + ' Admin',
            time: 'Hace unos instantes'
          },
          ...activityLog.slice(0, 15) // Keep last 15 entries
        ]
      }

      // Optimistically show the save action in the audit logs tab
      setActivityLog(updatedSettings.activityLog)

      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          whatsapp: form.whatsapp,
          bio: form.bio,
          category: form.category,
          ...(finalLogoUrl !== undefined && { logoUrl: finalLogoUrl }),
          settings: updatedSettings
        }),
      })
      if (!res.ok) throw new Error('Fallo guardando datos')
      setForm(prev => ({ ...prev, logoFile: null }))
      setSuccess(true)
      toast.success("Configuración sincronizada", { description: "Los cambios ya son visibles en tu tienda pública." })
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error(error)
      toast.error("Error de sincronización", { description: "No pudimos guardar los cambios. Revisa tu conexión e intenta de nuevo." })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = () => {
    const name = prompt('Ingrese el nombre del nuevo miembro:')
    if (!name) return
    const email = prompt('Ingrese el correo electrónico del miembro:')
    if (!email) return
    
    const newUser = {
      name,
      email,
      role: 'Soporte / Chat',
      active: true
    }
    setTeam(prev => [...prev, newUser])
    toast.success(`${name} invitado(a) al equipo`)
  }

  const handleToggleUser = (idx: number) => {
    setTeam(prev => prev.map((u, i) => i === idx ? { ...u, active: !u.active } : u))
  }

  const handleBannerUrlChange = () => {
    const url = prompt('Ingrese la URL de la imagen de portada o banner:')
    if (url !== null) {
      setBannerUrl(url || null)
    }
  }

  const handleRegenerateToken = () => {
    const newToken = 'flash_token_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setApiToken(newToken)
    toast.success('Nuevo Token de API generado. ¡Guarda los cambios para aplicarlo!')
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(storefrontUrl)
    toast.success("¡Enlace copiado!", { description: "El enlace a tu tienda ha sido copiado al portapapeles." })
  }

  // ─── Toggle helper ───────────────────────────────────────────
  function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
          checked ? "bg-emerald-500" : "bg-zinc-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    )
  }

  return (
    <div className="space-y-6 pb-12 animate-in duration-300 font-sans text-left">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 select-none">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Configuración</h1>
          <p className="text-[12px] font-medium text-zinc-500 mt-1">Administra los ajustes generales de tu negocio.</p>
        </div>
        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="flex items-center gap-2 h-9 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-none border border-emerald-400 transition-all active:scale-95 disabled:opacity-50 cursor-pointer select-none"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Guardar cambios</span>
        </button>
      </div>

      {/* ── Tab Navigation ────────────────────────────────── */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6 select-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0",
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Main Two-Column Layout ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── LEFT / CENTER CONTENT ─── */}
        <div className="lg:col-span-8 space-y-6">

          {/* ════════ TAB: GENERAL ════════ */}
          {activeTab === 'general' && (
            <>
              {/* Perfil del negocio */}
              <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Perfil del negocio</h3>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Información básica de tu tienda.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer select-none"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar información
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="w-20 h-20 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8 text-zinc-300" />
                        )}
                      </div>
                      <label className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors">
                        <ImagePlus className="w-3 h-3" />
                        Editar logo
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoSelect} />
                      </label>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 block">Nombre de la tienda</label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-zinc-800">{form.name}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 block">Correo electrónico</label>
                        {editingProfile ? (
                          <input
                            type="email"
                            value={form.contactEmail}
                            onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-zinc-800">{form.contactEmail}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 block">Teléfono</label>
                        {editingProfile ? (
                          <input
                            type="text"
                            value={form.whatsapp}
                            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-zinc-800">{form.whatsapp}</p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[11px] font-bold text-zinc-500 block">Descripción</label>
                        {editingProfile ? (
                          <div className="relative">
                            <textarea
                              rows={2}
                              value={form.bio}
                              onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 160) }))}
                              className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all resize-none"
                            />
                            <div className="absolute bottom-2 right-3 text-[9px] font-bold text-zinc-400">{form.bio.length}/160</div>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-zinc-800">{form.bio || <span className="text-zinc-400">Sin descripción</span>}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dirección del negocio */}
              <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Dirección del negocio</h3>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Esta información se mostrará en tu tienda y documentos.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingAddress(!editingAddress)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer select-none"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>
                <div className="p-6">
                  {editingAddress ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'address', label: 'Dirección' },
                        { key: 'country', label: 'País' },
                        { key: 'city', label: 'Ciudad' },
                        { key: 'department', label: 'Departamento' },
                        { key: 'postalCode', label: 'Código postal' },
                      ].map(f => (
                        <div key={f.key} className="space-y-1.5">
                          <label className="text-[11px] font-bold text-zinc-500 block">{f.label}</label>
                          <input
                            type="text"
                            value={(form as any)[f.key]}
                            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-500 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                      {[
                        { label: 'Dirección', value: form.address },
                        { label: 'País', value: form.country },
                        { label: 'Ciudad', value: form.city },
                        { label: 'Departamento', value: form.department },
                        { label: 'Código postal', value: form.postalCode },
                      ].map(item => (
                        <div key={item.label}>
                          <p className="text-[11px] font-bold text-zinc-400 mb-0.5">{item.label}</p>
                          <p className="text-sm font-semibold text-zinc-800">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Horario de atención */}
              <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Horario de atención</h3>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Configura los horarios en los que tu negocio está disponible.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSchedule(!editingSchedule)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer select-none"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {editingSchedule ? 'Listo' : 'Editar horario'}
                  </button>
                </div>
                <div className="divide-y divide-zinc-100">
                  {schedule.map((day: any, idx: number) => (
                    <div key={day.key} className="flex items-center justify-between px-6 py-3">
                       <span className="text-xs font-semibold text-zinc-700 w-24 shrink-0">{day.label}</span>
                       <span className="text-xs font-semibold text-zinc-500 flex-1">
                         {day.enabled ? `${day.from} - ${day.to}` : <span className="text-zinc-300">Cerrado</span>}
                       </span>
                       <Toggle
                         checked={day.enabled}
                         onChange={(v: boolean) => setSchedule((prev: any[]) => prev.map((d: any, i: number) => i === idx ? { ...d, enabled: v } : d))}
                       />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════════ TAB: PAGOS ════════ */}
          {activeTab === 'pagos' && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100">
                <h3 className="text-sm font-bold text-zinc-900">Métodos de Pago</h3>
                <p className="text-xs text-zinc-500 mt-1">Conecta tus pasarelas para recaudar fondos directamente de las compras de tus clientes.</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Stripe */}
                <div className="flex items-start justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-lg gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#635BFF] text-white flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Stripe Connect</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold">Pasarela Global · Tarjetas, Apple Pay, Google Pay</p>
                    </div>
                  </div>
                  {initialStore.stripeConnectAccountId ? (
                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">Conectado</span>
                  ) : (
                    <button className="flex items-center gap-1.5 h-8 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-bold shadow-none transition-all cursor-pointer shrink-0">
                      <span>Conectar</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Mercado Pago */}
                <div className="flex items-start justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-lg gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00B1EA] text-white flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">Mercado Pago Connect</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold">Pasarela Local · PSE, Efecty y más</p>
                    </div>
                  </div>
                  {mpConnected ? (
                    <button
                      onClick={handleDisconnectMercadoPago}
                      disabled={disconnectingMp}
                      className="flex items-center gap-1.5 h-8 px-3.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] font-bold shadow-none transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {disconnectingMp ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                      <span>Desconectar</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectMercadoPago}
                      className="flex items-center gap-1.5 h-8 px-3.5 bg-[#00B1EA] hover:bg-[#009ed2] text-white rounded-lg text-[11px] font-bold shadow-none transition-all cursor-pointer shrink-0"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Conectar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB: PERFIL ════════ */}
          {activeTab === 'perfil' && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Perfil y Personalización</h3>
                <p className="text-xs text-zinc-500 mt-1">Personaliza la apariencia visual de tu tienda y redes sociales.</p>
              </div>

              {/* Cover Banner Photo */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 block select-none">Imagen de Portada (Banner)</label>
                <div 
                  onClick={handleBannerUrlChange}
                  className="relative w-full h-36 bg-zinc-50 border border-zinc-200 border-dashed rounded-xl overflow-hidden flex items-center justify-center group cursor-pointer"
                >
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner de Portada" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10">
                        <span className="text-zinc-700 text-xs font-bold flex items-center gap-1"><ImagePlus className="w-4 h-4" /> Cambiar portada</span>
                      </div>
                      <span className="text-zinc-400 text-xs font-semibold select-none flex items-center gap-1.5"><ImagePlus className="w-5 h-5" /> Configurar URL de imagen de banner</span>
                    </>
                  )}
                </div>
              </div>

              {/* Brand Color selection */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-500 block select-none">Color de Marca (Botones y destacados)</label>
                <div className="flex items-center gap-3">
                  {[
                    { hex: '#10B981', name: 'Esmeralda' },
                    { hex: '#635BFF', name: 'Índigo' },
                    { hex: '#EF4444', name: 'Rojo' },
                    { hex: '#3B82F6', name: 'Azul' },
                    { hex: '#F59E0B', name: 'Ámbar' },
                    { hex: '#18181B', name: 'Zinc' }
                  ].map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => {
                        setBrandColor(color.hex)
                        toast.success(`Color ${color.name} seleccionado`)
                      }}
                      className="w-8.5 h-8.5 rounded-full border border-zinc-250/50 flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer shadow-sm relative"
                      style={{ backgroundColor: color.hex }}
                    >
                      {color.hex === brandColor && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-4">
                    <input 
                      type="color" 
                      value={brandColor} 
                      onChange={e => setBrandColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-zinc-200" 
                    />
                    <span className="text-xs text-zinc-500 font-semibold select-none">Personalizado</span>
                  </div>
                </div>
              </div>

              {/* Social networks links */}
              <div className="space-y-4 pt-2 border-t border-zinc-100">
                <h4 className="text-xs font-bold text-zinc-800 select-none">Redes sociales del negocio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 block">Instagram</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://instagram.com/tu_tienda"
                        value={instagramUrl}
                        onChange={e => setInstagramUrl(e.target.value)}
                        className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold outline-none transition-all"
                      />
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 block">Facebook</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://facebook.com/tu_tienda"
                        value={facebookUrl}
                        onChange={e => setFacebookUrl(e.target.value)}
                        className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold outline-none transition-all"
                      />
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 block">TikTok</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://tiktok.com/@tu_tienda"
                        value={tiktokUrl}
                        onChange={e => setTiktokUrl(e.target.value)}
                        className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold outline-none transition-all"
                      />
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 block">Sitio Web Externo</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://tudominio.com"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        className="w-full bg-zinc-50/50 border border-zinc-200 focus:border-zinc-300 focus:bg-white rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold outline-none transition-all"
                      />
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB: NOTIFICACIONES ════════ */}
          {activeTab === 'notificaciones' && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Ajustes de Notificaciones</h3>
                <p className="text-xs text-zinc-500 mt-1">Configura qué eventos y canales te alertarán sobre la actividad de tu negocio.</p>
              </div>

              <div className="space-y-4 divide-y divide-zinc-100">
                {[
                  {
                    title: 'Nuevos Pedidos por WhatsApp',
                    desc: 'Enviar una alerta instantánea a tu WhatsApp de administrador cuando un cliente realice un pedido.',
                    whatsappKey: 'orderWhatsapp',
                    emailKey: 'orderEmail'
                  },
                  {
                    title: 'Resumen de Ventas Diario',
                    desc: 'Recibir un correo electrónico todas las noches con el balance de ventas de tu tienda.',
                    whatsappKey: 'resumenWhatsapp',
                    emailKey: 'resumenEmail'
                  },
                  {
                    title: 'Alertas de Stock Bajo',
                    desc: 'Notificar cuando un producto tenga menos de 5 unidades disponibles en el inventario.',
                    whatsappKey: 'stockWhatsapp',
                    emailKey: 'stockEmail'
                  },
                  {
                    title: 'Mensajes de Clientes en Espera',
                    desc: 'Notificar por WhatsApp cuando un cliente solicite atención humana o pase más de 10 minutos sin responder.',
                    whatsappKey: 'esperaWhatsapp',
                    emailKey: 'esperaEmail'
                  }
                ].map((notif, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-900">{notif.title}</p>
                      <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed max-w-md">{notif.desc}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 pt-1 select-none">
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!(notifications as any)[notif.whatsappKey]} 
                          onChange={e => setNotifications(prev => ({ ...prev, [notif.whatsappKey]: e.target.checked }))} 
                          className="rounded border-zinc-350 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                        />
                        <span>WhatsApp</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!(notifications as any)[notif.emailKey]} 
                          onChange={e => setNotifications(prev => ({ ...prev, [notif.emailKey]: e.target.checked }))} 
                          className="rounded border-zinc-350 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                        />
                        <span>Email</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ TAB: USUARIOS ════════ */}
          {activeTab === 'usuarios' && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden p-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Usuarios y Equipo</h3>
                  <p className="text-xs text-zinc-500 mt-1">Invita y gestiona a los miembros de tu equipo con acceso al panel.</p>
                </div>
                <button 
                  onClick={handleInviteUser}
                  className="h-8.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer"
                >
                  Invitar usuario
                </button>
              </div>

              <div className="space-y-3">
                {team.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-50/50 border border-zinc-200 rounded-xl gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-200 border border-zinc-250/50 flex items-center justify-center font-bold text-xs text-zinc-650 shrink-0 select-none">
                        {user.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 leading-tight truncate">{user.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-semibold block leading-tight truncate mt-0.5">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-zinc-150 border border-zinc-200 text-zinc-650 text-[9px] font-black tracking-wide uppercase select-none">
                        {user.role}
                      </span>
                      <Toggle checked={user.active} onChange={() => handleToggleUser(idx)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ TAB: SEGURIDAD ════════ */}
          {activeTab === 'seguridad' && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Ajustes de Seguridad</h3>
                <p className="text-xs text-zinc-500 mt-1">Administra tus llaves de API, credenciales de accesibilidad y opciones de seguridad.</p>
              </div>

              <div className="space-y-4">
                {/* API Webhooks Key */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center select-none">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-zinc-500" />
                      <h4 className="text-xs font-bold text-zinc-850">Token de API del Comercio</h4>
                    </div>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-600 uppercase">Privado</span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      value={apiToken} 
                      readOnly 
                      className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 outline-none select-all" 
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(apiToken)
                        toast.success('Token copiado')
                      }} 
                      className="px-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-750 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                    <button 
                      type="button"
                      onClick={handleRegenerateToken} 
                      className="px-3 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-750 cursor-pointer transition-all select-none active:scale-95"
                    >
                      Regenerar
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="divide-y divide-zinc-100">
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-850">Doble Factor de Autenticación (2FA)</p>
                      <p className="text-[10px] text-zinc-400 font-semibold">Requiere un código temporal para iniciar sesión en el panel.</p>
                    </div>
                    <Toggle checked={doubleFactor} onChange={setDoubleFactor} />
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-850">Cerrar Sesión por Inactividad</p>
                      <p className="text-[10px] text-zinc-400 font-semibold">Desconectar automáticamente del panel tras 30 minutos sin actividad.</p>
                    </div>
                    <Toggle checked={autologout} onChange={setAutologout} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB: ACTIVIDAD ════════ */}
          {activeTab === 'actividad' && (
            <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Registro de Actividad</h3>
                <p className="text-xs text-zinc-500 mt-1">Historial detallado de las operaciones de administración de tu tienda.</p>
              </div>

              <div className="relative pl-6 border-l border-zinc-150 space-y-6">
                {activityLog.map((act, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Circle bullet indicator */}
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 select-none">
                      <h4 className="text-xs font-bold text-zinc-900 leading-none">{act.event}</h4>
                      <span className="text-[9.5px] font-semibold text-zinc-400 leading-none">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">{act.detail}</p>
                    <div className="text-[9.5px] text-zinc-500 font-bold select-none pt-0.5">
                      Por: <span className="text-zinc-650 font-black">{act.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Preferencias generales */}
          <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">Preferencias generales</h3>
              <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Ajustes principales de tu tienda.</p>
            </div>
            <div className="p-5 space-y-4">
              {[
                {
                  label: 'Idioma',
                  key: 'language',
                  options: [
                    { value: 'es', label: 'Español' },
                    { value: 'en', label: 'English' },
                  ]
                },
                {
                  label: 'Moneda',
                  key: 'currency',
                  options: [
                    { value: 'COP', label: 'Peso colombiano (COP)' },
                    { value: 'USD', label: 'Dólar Americano (USD)' },
                    { value: 'MXN', label: 'Peso Mexicano (MXN)' },
                    { value: 'EUR', label: 'Euro (EUR)' },
                  ]
                },
                {
                  label: 'Zona horaria',
                  key: 'timezone',
                  options: [
                    { value: 'GMT-05:00', label: '(GMT-5) Bogotá, Lima, Quito' },
                    { value: 'GMT-06:00', label: '(GMT-6) Ciudad de México' },
                    { value: 'GMT-04:00', label: '(GMT-4) Caracas, La Paz' },
                    { value: 'GMT-03:00', label: '(GMT-3) Buenos Aires' },
                  ]
                },
                {
                  label: 'Formato de fecha',
                  key: 'dateFormat',
                  options: [
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]
                },
              ].map(field => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">{field.label}</label>
                  <div className="relative">
                    <select
                      value={(form as any)[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full appearance-none bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-2.5 text-xs font-semibold text-zinc-800 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              ))}

              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-none transition-all active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Guardar cambios
              </button>
            </div>
          </div>

          {/* Estado del bot (Nova) */}
          <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">Estado del bot (Nova)</h3>
              <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Controla el comportamiento de tu asistente IA.</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600">Estado actual</span>
                <span className={cn(
                  "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                  form.botEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                )}>
                  {form.botEnabled ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800">Respuesta automática</p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Nova responde automáticamente a tus clientes.</p>
                  </div>
                  <Toggle checked={form.autoReply} onChange={v => setForm(f => ({ ...f, autoReply: v }))} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800">Desvío a humano</p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Permitir que los clientes soliciten atención humana.</p>
                  </div>
                  <Toggle checked={form.humanHandoff} onChange={v => setForm(f => ({ ...f, humanHandoff: v }))} />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('pagos')}
                className="w-full flex items-center justify-center gap-1.5 h-8 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                Configurar comportamiento
              </button>
            </div>
          </div>

          {/* Información del plan */}
          <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">Información del plan</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-zinc-400">Plan actual</p>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Activo</span>
              </div>

              <div className="flex items-center gap-2.5">
                {isPro ? (
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
                <span className="text-base font-bold text-zinc-900">{isPro ? 'Pro' : 'Free'}</span>
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-500">Renovación</span>
                  <span className="font-bold text-zinc-800">15 de junio de 2025</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-500">Conversaciones incluidas</span>
                  <span className="font-bold text-zinc-800">10.000 / mes</span>
                </div>
              </div>

              <div className="pt-1">
                <SubscriptionButton isPro={isPro} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
