'use client'

import { useState } from 'react'
import { cn } from "@/lib/utils"
import { 
  Store, 
  Upload, 
  Trash2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  Power, 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  Truck, 
  Shield, 
  Award, 
  Clock, 
  FileText, 
  ChevronDown, 
  Save,
  MessageSquare,
  Menu,
  Type
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'

interface Product {
  id: string
  name: string
  price: number
  imageUrl: string | null
  stock: number
}

interface TiendaClientProps {
  initialStore: {
    id: string
    name: string
    slug: string
    category: string | null
    whatsapp: string
    bio: string | null
    logoUrl: string | null
    aiSettings: any
    active: boolean
  }
  products: Product[]
}

export default function TiendaClient({ initialStore, products }: TiendaClientProps) {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'apariencia' | 'info' | 'dominios' | 'seo' | 'redes' | 'politicas'>('apariencia')
  
  // Device Preview selection
  const [device, setDevice] = useState<'escritorio' | 'tablet' | 'movil'>('escritorio')

  // Parse initial settings
  const parsedSettings = initialStore.aiSettings && typeof initialStore.aiSettings === 'object' 
    ? initialStore.aiSettings 
    : {}

  // Color Theme state
  const [colors, setColors] = useState({
    primario: parsedSettings.colors?.primario || '#6F42C1',
    secundario: parsedSettings.colors?.secundario || '#FF7A00',
    acento: parsedSettings.colors?.acento || '#22C55E',
    fondo: parsedSettings.colors?.fondo || '#F8FAFC',
    texto: parsedSettings.colors?.texto || '#1F2937'
  })

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Visible sections toggles matching the screenshot exactly
  const [sections, setSections] = useState({
    banner: parsedSettings.sections?.banner !== false,
    destacados: parsedSettings.sections?.destacados !== false,
    categorias: parsedSettings.sections?.categorias !== false,
    beneficios: parsedSettings.sections?.beneficios !== false,
    testimonios: parsedSettings.sections?.testimonios !== false,
    newsletter: parsedSettings.sections?.newsletter !== false
  })

  // Logo & Banner State
  const [logoUrl, setLogoUrl] = useState<string>(initialStore.logoUrl || '')
  const [bannerUrl, setBannerUrl] = useState<string>(
    parsedSettings.bannerUrl || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop'
  )
  const [bannerTitle, setBannerTitle] = useState(
    parsedSettings.bannerTitle || 'El mejor café, directo a tu puerta'
  )
  const [bannerSubtitle, setBannerSubtitle] = useState(
    parsedSettings.bannerSubtitle || 'Descubre nuestros productos de especialidad cultivados con amor y tostados frescos.'
  )

  // Announcement Bar state
  const [announcement, setAnnouncement] = useState({
    enabled: parsedSettings.announcement?.enabled || false,
    text: parsedSettings.announcement?.text || '🚚 ¡Envíos gratis por compras superiores a $100.000!',
    bgColor: parsedSettings.announcement?.bgColor || '#059669',
    textColor: parsedSettings.announcement?.textColor || '#FFFFFF'
  })

  // Banner Button state
  const [bannerButton, setBannerButton] = useState({
    text: parsedSettings.bannerButton?.text || 'Ver productos',
    action: parsedSettings.bannerButton?.action || 'scroll',
    link: parsedSettings.bannerButton?.link || ''
  })

  // Benefits Custom items
  const [benefits, setBenefits] = useState({
    items: parsedSettings.benefits?.items || [
      { icon: 'Truck', label: 'Envíos rápidos', desc: 'A todo el país' },
      { icon: 'ShieldCheck', label: 'Pagos seguros', desc: 'Múltiples métodos' },
      { icon: 'Award', label: 'Café de calidad', desc: 'Granos seleccionados' },
      { icon: 'Clock', label: 'Atención 24/7', desc: 'Siempre disponibles' }
    ]
  })

  // Social Links display config
  const [socialsShowInCatalog, setSocialsShowInCatalog] = useState(
    parsedSettings.socialsShowInCatalog !== false
  )

  // Opening Hours schedule
  const [schedule, setSchedule] = useState({
    enabled: parsedSettings.schedule?.enabled || false,
    text: parsedSettings.schedule?.text || 'Lunes a Viernes 8:00 AM - 6:00 PM',
    alwaysOpen: parsedSettings.schedule?.alwaysOpen !== false
  })

  // Custom WhatsApp message template
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    parsedSettings.whatsappTemplate || 
    'Hola! Vengo de tu tienda online y quiero realizar el siguiente pedido:\n\n*Productos:*\n{lista_productos}\n\n*Total:* {monto_total}\n\n*Datos de entrega:*\nNombre: {cliente_nombre}\nDirección: {direccion}'
  )
  
  // Typography State
  const [typography, setTypography] = useState(parsedSettings.typography || 'Inter')

  // Copied link state
  const [copied, setCopied] = useState(false)

  // Saving state
  const [isSaving, setIsSaving] = useState(false)

  // Store active state (from DB)
  const [storeActive, setStoreActive] = useState(initialStore.active)

  // Settings states for tabs
  const [storeInfo, setStoreInfo] = useState({
    name: initialStore.name,
    desc: initialStore.bio || '',
    whatsapp: initialStore.whatsapp,
    category: initialStore.category || 'General',
    address: parsedSettings.info?.address || ''
  })

  const [domains, setDomains] = useState({
    subdomain: initialStore.slug,
    customDomain: parsedSettings.domains?.customDomain || ''
  })

  const [seo, setSeo] = useState({
    title: parsedSettings.seo?.title || `${initialStore.name} | Catálogo`,
    desc: parsedSettings.seo?.desc || `Compra online y haz tu pedido por WhatsApp.`
  })

  const [socials, setSocials] = useState({
    instagram: parsedSettings.socials?.instagram || '',
    facebook: parsedSettings.socials?.facebook || '',
    twitter: parsedSettings.socials?.twitter || ''
  })

  const [policies, setPolicies] = useState({
    terms: parsedSettings.policies?.terms || '',
    refunds: parsedSettings.policies?.refunds || ''
  })

  const isImageUrl = (url: string) => {
    return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = toast.loading(`Subiendo ${type === 'logo' ? 'logotipo' : 'banner'}...`)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await res.json()
      
      if (type === 'logo') {
        setLogoUrl(data.url)
        toast.success('Logotipo subido correctamente', { id: toastId })
      } else {
        setBannerUrl(data.url)
        toast.success('Banner subido correctamente', { id: toastId })
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Error al subir la imagen', { id: toastId })
    }
  }

  const copyStoreUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://flashcheckout.co'
    navigator.clipboard.writeText(`${base}/tienda/${domains.subdomain}`)
    setCopied(true)
    toast.success('Enlace de la tienda copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  // Toggle visible sections
  const handleSectionToggle = (key: keyof typeof sections) => {
    setSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Persist all settings in Database
  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeInfo.name,
          whatsapp: storeInfo.whatsapp,
          bio: storeInfo.desc,
          category: storeInfo.category,
          logoUrl: logoUrl || null,
          slug: domains.subdomain,
          active: storeActive,
          aiSettings: {
            colors,
            typography,
            bannerUrl,
            bannerTitle,
            bannerSubtitle,
            announcement,
            bannerButton,
            benefits,
            socialsShowInCatalog,
            schedule,
            whatsappTemplate,
            sections,
            socials,
            policies,
            seo,
            domains: {
              customDomain: domains.customDomain
            },
            info: {
              address: storeInfo.address
            }
          }
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al guardar los cambios')
      }

      toast.success('¡Cambios guardados con éxito!', {
        description: 'La configuración y diseño de tu tienda online han sido guardados.'
      })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Ocurrió un error al guardar los ajustes.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle store state toggle
  const toggleStoreStatus = async () => {
    const newStatus = !storeActive
    setStoreActive(newStatus)
    toast.info(newStatus ? 'Tienda activada' : 'Tienda desactivada temporalmente')
  }

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] flex flex-col overflow-hidden animate-in duration-300 font-sans text-left pb-2">
      
      {/* Header Panel matching screenshot */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none pb-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Tienda
            </h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Personaliza la apariencia de tu tienda online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/tienda/${domains.subdomain}`} target="_blank">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none cursor-pointer select-none">
              <span>Vista previa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
          
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-350 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none active:scale-[0.98] cursor-pointer select-none"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      </header>

      {/* Tabs navigation list */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6 select-none">
        {[
          { id: 'apariencia', label: 'Apariencia' },
          { id: 'info', label: 'Información de la tienda' },
          { id: 'dominios', label: 'Dominios' },
          { id: 'seo', label: 'SEO' },
          { id: 'redes', label: 'Redes sociales' },
          { id: 'politicas', label: 'Políticas' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-800' 
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch overflow-hidden mt-6">
        
        {/* LEFT COLUMN: Customized Widgets based on selected tab (4/12) */}
        <div className="lg:col-span-4 h-full overflow-y-auto pr-2 scrollbar-none pb-12 select-none space-y-6">
          
          {/* TAB 1: APARIENCIA */}
          {activeTab === 'apariencia' && (
            <div className="space-y-6">
              
              {/* Logo Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <input 
                  type="file" 
                  id="logo-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'logo')} 
                />
                <input 
                  type="file" 
                  id="banner-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'banner')} 
                />

                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Logo de la tienda</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Este logo se mostrará en tu tienda online y enlaces de pago.</p>
                </div>

                <div className="border border-zinc-150 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-50/30 min-h-[96px]">
                  {logoUrl ? (
                    isImageUrl(logoUrl) ? (
                      <img src={logoUrl} className="max-h-16 max-w-full object-contain" alt="Logo" />
                    ) : (
                      <div className="text-sm font-black text-zinc-900 border border-zinc-200 px-4 py-2 rounded bg-white tracking-wider flex items-center gap-1.5">
                        <span>☕</span>
                        <span>{logoUrl.toUpperCase()}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">Sin logotipo configurado</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Cambiar logo</span>
                  </button>
                  <button 
                    onClick={() => setLogoUrl('')}
                    className="py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    title="Eliminar logo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>

              {/* Banner Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Banner principal</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Imagen destacada que verán tus clientes en la portada.</p>
                </div>

                <div className="border border-zinc-150 rounded-lg overflow-hidden h-28 relative bg-zinc-100 flex items-center justify-center">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400">Sin banner principal</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Cambiar banner</span>
                  </button>
                  <button 
                    onClick={() => setBannerUrl('')}
                    className="py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    title="Eliminar banner"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Eliminar</span>
                  </button>
                </div>

                {/* Banner Texts Inputs */}
                <div className="space-y-3.5 pt-2 border-t border-zinc-100 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título del banner</label>
                    <input 
                      type="text"
                      value={bannerTitle}
                      onChange={e => setBannerTitle(e.target.value)}
                      placeholder="Ej: El mejor café, directo a tu puerta"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Descripción del banner</label>
                    <textarea 
                      value={bannerSubtitle}
                      onChange={e => setBannerSubtitle(e.target.value)}
                      placeholder="Ej: Descubre nuestros productos de especialidad cultivados con amor."
                      rows={2}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none"
                    />
                  </div>

                  {/* Banner Button Customization */}
                  <div className="space-y-3 pt-2.5 border-t border-zinc-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Texto del botón</label>
                      <input 
                        type="text"
                        value={bannerButton.text}
                        onChange={e => setBannerButton(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Ej: Ver productos"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Acción del botón</label>
                      <select 
                        value={bannerButton.action}
                        onChange={e => setBannerButton(prev => ({ ...prev, action: e.target.value as any }))}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      >
                        <option value="scroll">Hacer scroll a los productos</option>
                        <option value="whatsapp">Abrir chat de WhatsApp</option>
                        <option value="link">Redirigir a enlace externo</option>
                      </select>
                    </div>

                    {bannerButton.action === 'link' && (
                      <div className="space-y-1.5 animate-in fade-in duration-300">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Enlace del botón</label>
                        <input 
                          type="text"
                          value={bannerButton.link}
                          onChange={e => setBannerButton(prev => ({ ...prev, link: e.target.value }))}
                          placeholder="Ej: https://instagram.com/mi-tienda"
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Announcement Bar Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="flex justify-between items-center text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 leading-none">Barra de anuncios</h3>
                    <p className="text-[11px] font-semibold text-zinc-400">Franja llamativa sobre el encabezado de tu tienda.</p>
                  </div>
                  <button
                    onClick={() => setAnnouncement(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      announcement.enabled ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {announcement.enabled && (
                  <div className="space-y-3.5 pt-1.5 animate-in fade-in duration-300">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Texto del anuncio</label>
                      <input 
                        type="text"
                        value={announcement.text}
                        onChange={e => setAnnouncement(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Ej: ¡Envíos gratis por compras superiores a $100.000!"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-tight select-none pt-1">
                      <div className="space-y-1.5 flex flex-col items-center">
                        <input 
                          type="color" 
                          value={announcement.bgColor}
                          onChange={e => setAnnouncement(prev => ({ ...prev, bgColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                        />
                        <span>Fondo</span>
                      </div>

                      <div className="space-y-1.5 flex flex-col items-center">
                        <input 
                          type="color" 
                          value={announcement.textColor}
                          onChange={e => setAnnouncement(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                        />
                        <span>Texto</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits Editor Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Beneficios</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Personaliza los 4 cuadros de beneficios que flotan en tu portada.</p>
                </div>

                <div className="space-y-4 pt-1 text-left">
                  {benefits.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Beneficio #{idx + 1}</span>
                      
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                          <select
                            value={item.icon}
                            onChange={e => {
                              const newItems = [...benefits.items]
                              newItems[idx] = { ...item, icon: e.target.value }
                              setBenefits({ items: newItems })
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-1.5 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                          >
                            <option value="Truck">Camión</option>
                            <option value="ShieldCheck">Escudo</option>
                            <option value="Award">Medalla</option>
                            <option value="Clock">Reloj</option>
                            <option value="Gift">Regalo</option>
                            <option value="Star">Estrella</option>
                          </select>
                        </div>

                        <div className="col-span-8 space-y-1">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                          <input 
                            type="text"
                            value={item.label}
                            onChange={e => {
                              const newItems = [...benefits.items]
                              newItems[idx] = { ...item, label: e.target.value }
                              setBenefits({ items: newItems })
                            }}
                            placeholder="Ej: Envíos rápidos"
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase block">Subtítulo / Bajada</label>
                        <input 
                          type="text"
                          value={item.desc}
                          onChange={e => {
                            const newItems = [...benefits.items]
                            newItems[idx] = { ...item, desc: e.target.value }
                            setBenefits({ items: newItems })
                          }}
                          placeholder="Ej: A todo el país"
                          className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Colors Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Colores del tema</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Personaliza los colores principales de tu tienda.</p>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-tight select-none">
                  {/* Primario */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.primario}
                      onChange={e => handleColorChange('primario', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Primario</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.primario}</span>
                  </div>

                  {/* Secundario */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.secundario}
                      onChange={e => handleColorChange('secundario', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Secundario</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.secundario}</span>
                  </div>

                  {/* Acento */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.acento}
                      onChange={e => handleColorChange('acento', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Acento</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.acento}</span>
                  </div>

                  {/* Fondo */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.fondo}
                      onChange={e => handleColorChange('fondo', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Fondo</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.fondo}</span>
                  </div>

                  {/* Texto */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <input 
                      type="color" 
                      value={colors.texto}
                      onChange={e => handleColorChange('texto', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                    />
                    <span>Texto</span>
                    <span className="font-mono text-[9px] text-zinc-400 normal-case">{colors.texto}</span>
                  </div>
                </div>
              </div>

              {/* Typography Card */}
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Tipografía</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Selecciona la tipografía de tu tienda.</p>
                </div>

                 <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select 
                      value={typography}
                      onChange={e => setTypography(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-xs xl:text-sm font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
                    >
                      <option value="Inter">Inter (Sans-serif)</option>
                      <option value="Georgia">Georgia (Serif)</option>
                      <option value="Courier New">Courier New (Monospace)</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <button 
                    type="button"
                    className="px-4 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap shrink-0"
                  >
                    <Type className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Cambiar tipografía</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INFORMACIÓN DE LA TIENDA */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
                <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Datos del comercio</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Edita la descripción, contacto y localización de la tienda.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Nombre de la tienda</label>
                  <input 
                    type="text"
                    value={storeInfo.name}
                    onChange={e => setStoreInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Teléfono / WhatsApp</label>
                  <input 
                    type="text"
                    value={storeInfo.whatsapp}
                    onChange={e => setStoreInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Dirección física</label>
                  <input 
                    type="text"
                    value={storeInfo.address}
                    onChange={e => setStoreInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                    placeholder="ej: Calle 10 # 43 - 21, Medellín, Colombia"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Biografía / Presentación</label>
                  <textarea 
                    value={storeInfo.desc}
                    onChange={e => setStoreInfo(prev => ({ ...prev, desc: e.target.value }))}
                    rows={4}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Horario de atención Card */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="flex justify-between items-center text-left">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 leading-none">Horario de atención</h3>
                  <p className="text-[11px] font-semibold text-zinc-400">Configura cuándo está abierta tu tienda.</p>
                </div>
                <button
                  onClick={() => setSchedule(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={cn(
                    "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                    schedule.enabled ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {schedule.enabled && (
                <div className="space-y-3.5 pt-1.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between py-1 select-none text-left">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 block">Abierto 24/7 (Siempre abierto)</span>
                      <p className="text-[10px] font-semibold text-zinc-400">Tu comercio no cierra en ningún horario.</p>
                    </div>
                    <button
                      onClick={() => setSchedule(prev => ({ ...prev, alwaysOpen: !prev.alwaysOpen }))}
                      className={cn(
                        "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                        schedule.alwaysOpen ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                      )}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  {!schedule.alwaysOpen && (
                    <div className="space-y-1.5 text-left animate-in fade-in duration-300">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Horario detallado</label>
                      <input 
                        type="text"
                        value={schedule.text}
                        onChange={e => setSchedule(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Ej: Lunes a Viernes 8:00 AM - 6:00 PM"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Plantilla de pedido por WhatsApp Card */}
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Plantilla de WhatsApp</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Personaliza el formato del mensaje que te envían tus clientes.</p>
              </div>

              <div className="space-y-3.5 text-left">
                <div className="space-y-1.5">
                  <textarea 
                    value={whatsappTemplate}
                    onChange={e => setWhatsappTemplate(e.target.value)}
                    rows={6}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none font-mono"
                    placeholder="Escribe la plantilla del mensaje..."
                  />
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Variables soportadas:</span>
                  <div className="grid grid-cols-2 gap-1.5 mt-2 text-[9px] font-semibold text-zinc-500">
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{cliente_nombre}'}</code> - Nombre</div>
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{lista_productos}'}</code> - Productos</div>
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{monto_total}'}</code> - Total compra</div>
                    <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{direccion}'}</code> - Dirección</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* TAB 3: DOMINIOS */}
          {activeTab === 'dominios' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Dominios públicos</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Configura el slug o vincula un dominio propio.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Subdominio local</label>
                  <div className="flex items-stretch">
                    <input 
                      type="text"
                      value={domains.subdomain}
                      onChange={e => setDomains(prev => ({ ...prev, subdomain: e.target.value }))}
                      className="flex-1 bg-white border border-zinc-200 focus:border-zinc-950 rounded-l-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                    />
                    <span className="bg-zinc-50 border border-l-0 border-zinc-200 rounded-r-lg px-4 flex items-center text-xs font-bold text-zinc-500">
                      .flashcheckout.co
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Dominio personalizado (Pro)</label>
                  <input 
                    type="text"
                    value={domains.customDomain}
                    onChange={e => setDomains(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="ej: www.minegocio.com"
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-955 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Meta Tags SEO</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Cómo se verá el catálogo al listarse en buscadores o chats.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Título del sitio (Title)</label>
                  <input 
                    type="text"
                    value={seo.title}
                    onChange={e => setSeo(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Descripción (Meta Description)</label>
                  <textarea 
                    value={seo.desc}
                    onChange={e => setSeo(prev => ({ ...prev, desc: e.target.value }))}
                    rows={4}
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REDES SOCIALES */}
          {activeTab === 'redes' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Redes Sociales</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Enlaces a tus canales de comunicación de redes.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-left pb-3.5 border-b border-zinc-100 select-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-800 block leading-tight">Mostrar en el catálogo</span>
                    <p className="text-[10px] font-semibold text-zinc-400">Mostrar accesos directos a tus redes en la tienda.</p>
                  </div>
                  <button
                    onClick={() => setSocialsShowInCatalog(!socialsShowInCatalog)}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                      socialsShowInCatalog ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Instagram</label>
                  <input 
                    type="text"
                    value={socials.instagram}
                    onChange={e => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/tu_marca"
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Facebook</label>
                  <input 
                    type="text"
                    value={socials.facebook}
                    onChange={e => setSocials(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/tu_marca"
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: POLÍTICAS */}
          {activeTab === 'politicas' && (
            <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
              <div className="text-left space-y-0.5">
                <h3 className="text-sm font-black text-zinc-900 leading-none">Políticas de la tienda</h3>
                <p className="text-[11px] font-semibold text-zinc-400">Términos y condiciones legales para tus clientes.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Políticas de devolución</label>
                  <textarea 
                    value={policies.refunds}
                    onChange={e => setPolicies(prev => ({ ...prev, refunds: e.target.value }))}
                    rows={4}
                    placeholder="Describe los términos para reembolsos o devoluciones de productos..."
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 block">Términos de servicio</label>
                  <textarea 
                    value={policies.terms}
                    onChange={e => setPolicies(prev => ({ ...prev, terms: e.target.value }))}
                    rows={4}
                    placeholder="Describe las condiciones de uso y términos de despacho..."
                    className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}


          {/* GENERAL CONFIGURATION WIDGETS */}
          <div className="h-px bg-zinc-200/60 my-6" />

          {/* Card 1: Switch Toggles (Secciones visibles) */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
            <div className="text-left space-y-0.5">
              <h3 className="text-sm font-black text-zinc-900 leading-none">Secciones visibles</h3>
              <p className="text-[11px] font-semibold text-zinc-400">Activa o desactiva las secciones que deseas mostrar en tu tienda.</p>
            </div>

            <div className="space-y-3.5 select-none font-semibold text-xs text-zinc-700">
              {[
                { id: 'banner', label: 'Banner principal' },
                { id: 'destacados', label: 'Productos destacados' },
                { id: 'categorias', label: 'Categorías' },
                { id: 'beneficios', label: 'Beneficios' },
                { id: 'testimonios', label: 'Testimonios' },
                { id: 'newsletter', label: 'Newsletter' }
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between py-1 border-b border-zinc-100 last:border-0 pb-2 last:pb-0">
                  <span>{item.label}</span>
                  
                  <button
                    onClick={() => handleSectionToggle(item.id as any)}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0",
                      sections[item.id as keyof typeof sections] ? "bg-emerald-500 justify-end" : "bg-zinc-200 justify-start"
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Enlace de tu tienda */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left flex flex-col justify-start">
            <div>
              <h3 className="text-sm font-black text-zinc-900 leading-none">Enlace de tu tienda</h3>
              <p className="text-[11px] font-semibold text-zinc-405 mt-1.5">Comparte este enlace con tus clientes.</p>
            </div>

            <div className="relative w-full">
              <input 
                type="text" 
                readOnly
                value={`https://${domains.subdomain}.flashcheckout.co`}
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-zinc-650 focus:outline-none cursor-default select-all"
              />
              <ExternalLink className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            </div>

            <button 
              onClick={copyStoreUrl}
              className="self-start flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all shadow-none cursor-pointer select-none"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar enlace</span>
            </button>
          </div>

          {/* Card 3: Estado de la tienda */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left flex flex-col justify-start">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-zinc-900 leading-none">Estado de la tienda</h3>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold tracking-tight",
                storeActive ? "bg-[#EEF2F0] text-emerald-700" : "bg-red-50 text-red-650"
              )}>
                {storeActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <p className="text-[11px] font-semibold text-zinc-400">
              {storeActive ? 'Tu tienda está visible para todos los clientes.' : 'Tu tienda está pausada. Los clientes no podrán crear pedidos.'}
            </p>

            <button
              onClick={toggleStoreStatus}
              className={cn(
                "self-start flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-lg transition-all cursor-pointer shadow-none",
                storeActive 
                  ? "bg-red-50/50 border-red-200 hover:bg-red-50 text-red-600"
                  : "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 text-emerald-600"
              )}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{storeActive ? 'Desactivar tienda' : 'Activar tienda'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Customizer Preview (8/12) */}
        <div className="lg:col-span-8 h-full flex flex-col overflow-hidden">
          
          {/* Live Preview Website Container */}
          <div className="bg-white border border-zinc-200 rounded-lg p-5 flex-1 flex flex-col items-center shadow-none min-h-0 overflow-hidden">
            <div className="flex items-center justify-between w-full border-b border-zinc-100 pb-3 select-none shrink-0">
              <h3 className="text-xs xl:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-zinc-400" />
                Vista previa de tu tienda
              </h3>
              
              {/* Device switches */}
              <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50/50">
                {[
                  { id: 'escritorio', icon: Monitor, label: 'Escritorio' },
                  { id: 'tablet', icon: Tablet, label: 'Tablet' },
                  { id: 'movil', icon: Smartphone, label: 'Móvil' }
                ].map(dev => {
                  const Icon = dev.icon
                  return (
                    <button
                      key={dev.id}
                      onClick={() => setDevice(dev.id as any)}
                      className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] xl:text-xs font-bold ${
                        device === dev.id 
                          ? 'bg-white text-zinc-955 shadow-sm border border-zinc-200/40' 
                          : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                      title={dev.label}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{dev.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

             {/* LIVE CANVAS WEB PREVIEW */}
             <div className={cn(
               "w-full flex-1 flex justify-center overflow-hidden relative select-none min-h-0 bg-zinc-50 border border-zinc-150 border-dashed rounded-lg p-4 mt-4",
               device === 'escritorio' ? "bg-white p-0 border-0 mt-4 items-start" : "items-center"
             )}>
                <div 
                  className={cn(
                    "bg-white flex flex-col text-left overflow-y-auto select-none relative transition-all duration-300",
                    device === 'escritorio' ? 'w-full h-full' : 'border border-zinc-200 shadow-xl rounded-lg',
                    device === 'tablet' ? 'w-[440px] h-[92%] max-h-[580px]' : '',
                    device === 'movil' ? 'w-[280px] h-[95%] max-h-[540px] rounded-[32px] border-8 border-zinc-900 shadow-2xl relative pt-4' : ''
                  )}
                  style={{ 
                    fontFamily: typography === 'Inter' ? 'Inter, sans-serif' : typography === 'Georgia' ? 'Georgia, serif' : 'monospace', 
                    backgroundColor: colors.fondo 
                  }}
                >
                  {/* Phone Header notch for Mobile view */}
                  {device === 'movil' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 h-4 w-28 rounded-b-xl z-20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-zinc-800 rounded-full" />
                    </div>
                  )}

                  <WhatsAppCatalog 
                    store={{
                      ...initialStore,
                      name: storeInfo.name,
                      whatsapp: storeInfo.whatsapp,
                      logoUrl: logoUrl || null,
                      bio: storeInfo.desc,
                      products: products,
                      aiSettings: {
                        colors,
                        sections,
                        bannerUrl,
                        bannerTitle,
                        bannerSubtitle,
                        announcement,
                        bannerButton,
                        benefits,
                        socialsShowInCatalog,
                        schedule,
                        whatsappTemplate,
                        socials,
                        policies,
                        typography,
                        info: {
                          address: storeInfo.address
                        }
                      }
                    } as any}
                    device={device}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
  )
}
