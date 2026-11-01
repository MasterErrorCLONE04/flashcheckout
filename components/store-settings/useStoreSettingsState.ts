'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { StoreSettingsData, StoreFormState, TeamMember, ActivityLogEntry } from './types'
import { SCHEDULE_DAYS, TabId } from './constants'
import { useBrebSettings } from './useBrebSettings'
import { useStoreIntegrations } from './useStoreIntegrations'

export function useStoreSettingsState(initialStore: StoreSettingsData) {
  const [activeTab, setActiveTab] = useState<TabId>('general')

  const storeSettings = typeof initialStore.settings === 'object' && initialStore.settings !== null
    ? (initialStore.settings as any)
    : {}

  const [form, setForm] = useState<StoreFormState>({
    name: initialStore.name,
    whatsapp: initialStore.whatsapp,
    bio: initialStore.bio || '',
    category: initialStore.category || 'General',
    logoFile: null,
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

  const defaultTeam: TeamMember[] = [
    { name: initialStore.name + ' Admin', email: 'admin@tiendawebs.com', role: 'Propietario', active: true },
    { name: 'Diana Gómez', email: 'diana@tiendawebs.com', role: 'Administrador', active: true },
    { name: 'Soporte Ventas', email: 'ventas@tiendawebs.com', role: 'Soporte / Chat', active: false }
  ]
  const [team, setTeam] = useState<TeamMember[]>(storeSettings.team || defaultTeam)

  const [doubleFactor, setDoubleFactor] = useState<boolean>(storeSettings.security?.doubleFactor ?? false)
  const [autologout, setAutologout] = useState<boolean>(storeSettings.security?.autologout ?? true)
  const [apiToken, setApiToken] = useState<string>(storeSettings.security?.apiToken || 'flash_token_live_38294hjda8921jkdskla')

  const defaultLogs: ActivityLogEntry[] = [
    { event: 'Inicio de sesión exitoso', detail: 'Ingreso desde Medellín, CO (Chrome/Windows)', user: initialStore.name + ' Admin', time: 'Hoy, 08:34 a. m.' },
    { event: 'Panel configurado', detail: 'Se cargaron los ajustes de inicialización', user: 'Sistema', time: 'Hace unos instantes' }
  ]
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(storeSettings.activityLog || defaultLogs)

  const [schedule, setSchedule] = useState(storeSettings.schedule || SCHEDULE_DAYS)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(false)

  const [logoPreview, setLogoPreview] = useState<string | null>(initialStore.logoUrl)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const breb = useBrebSettings(initialStore.name)
  const integrations = useStoreIntegrations(initialStore)

  const storefrontUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tienda/${initialStore.name.toLowerCase().replace(/\s+/g, '-')}`
    : `http://localhost:3000/tienda/tienda-webs`

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
          ...activityLog.slice(0, 15)
        ]
      }

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

    const newUser: TeamMember = {
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

  return {
    activeTab,
    setActiveTab,
    form,
    setForm,
    bannerUrl,
    setBannerUrl,
    brandColor,
    setBrandColor,
    instagramUrl,
    facebookUrl,
    tiktokUrl,
    websiteUrl,
    notifications,
    setNotifications,
    team,
    setTeam,
    doubleFactor,
    setDoubleFactor,
    autologout,
    setAutologout,
    apiToken,
    setApiToken,
    activityLog,
    schedule,
    setSchedule,
    editingProfile,
    setEditingProfile,
    editingAddress,
    setEditingAddress,
    editingSchedule,
    setEditingSchedule,
    mpConnected: integrations.mpConnected,
    mpPublicKey: integrations.mpPublicKey,
    disconnectingMp: integrations.disconnectingMp,
    brebConfig: breb.brebConfig,
    setBrebConfig: breb.setBrebConfig,
    loadingBreb: breb.loadingBreb,
    savingBreb: breb.savingBreb,
    logoPreview,
    loading,
    success,
    whatsappConnected: integrations.whatsappConnected,
    qrCodeBase64: integrations.qrCodeBase64,
    qrCodeText: integrations.qrCodeText,
    loadingQr: integrations.loadingQr,
    pollingStatus: integrations.pollingStatus,
    storefrontUrl,
    applyBrebPreset: breb.applyBrebPreset,
    handleConnectWhatsApp: integrations.handleConnectWhatsApp,
    handleDisconnectWhatsApp: integrations.handleDisconnectWhatsApp,
    handleConnectMercadoPago: integrations.handleConnectMercadoPago,
    handleDisconnectMercadoPago: integrations.handleDisconnectMercadoPago,
    handleSaveBrebConfig: breb.handleSaveBrebConfig,
    handleLogoSelect,
    handleRemoveLogo,
    handleSubmit,
    handleInviteUser,
    handleToggleUser,
    handleBannerUrlChange,
    handleRegenerateToken,
    handleCopyLink,
  }
}
