'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Link2,
  CheckCircle2,
  QrCode,
  Loader2,
  ExternalLink,
  RefreshCw,
  Power,
  ShieldCheck,
  Sparkles,
  Database,
  CreditCard,
  MessageSquare,
  Store,
  KeyRound,
  Check,
} from 'lucide-react'
import {
  SiWhatsapp,
  SiMercadopago,
  SiDeepseek,
  SiStripe,
  SiShopify,
  SiWoocommerce,
  SiTelegram,
  SiMeta,
} from 'react-icons/si'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useBrebSettings } from './store-settings/useBrebSettings'
import { useStoreIntegrations } from './store-settings/useStoreIntegrations'
import type { BrebKeyType } from '@/lib/payments/breb/emvco'

interface IntegrationsClientProps {
  store: {
    id: string
    name: string
    slug: string
    whatsappConnected: boolean
    whatsappInstanceName?: string | null
    whatsapp: string | null
    mpConnected: boolean
    mpPublicKey: string | null
    hasMpToken?: boolean
    stripeConnected?: boolean
    stripePublicKey?: string | null
    hasStripeSecret?: boolean
    brebConnected: boolean
    brebKeyValue: string | null
    brebBankProvider?: string | null
    metaSocial?: {
      connected: boolean
      facebookPageId: string | null
      facebookPageName: string | null
      instagramAccountId: string | null
      instagramUsername: string | null
      defaultChannels: Array<'INSTAGRAM' | 'FACEBOOK'>
      hasToken: boolean
    } | null
  }
}

type CategoryTab = 'Todas' | 'Pasarelas' | 'Canales' | 'Infraestructura'
type IntegrationId =
  | 'whatsapp'
  | 'meta'
  | 'breb'
  | 'mercadopago'
  | 'stripe'
  | 'deepseek'
  | 'storage'

export default function IntegrationsClient({ store }: IntegrationsClientProps) {
  const [activeTab, setActiveTab] = useState<CategoryTab>('Todas')
  const [selectedId, setSelectedId] = useState<IntegrationId>('breb')

  // Reuse real Bre-B and WhatsApp/MP integration hooks
  const breb = useBrebSettings(store.name)
  const integrations = useStoreIntegrations({
    id: store.id,
    name: store.name,
    whatsapp: store.whatsapp || '',
    bio: null,
    logoUrl: null,
    category: 'General',
    settings: null,
    mpConnected: store.mpConnected,
    mpPublicKey: store.mpPublicKey,
    whatsappConnected: store.whatsappConnected,
    whatsappInstanceName: store.whatsappInstanceName || null,
  })

  // Local state for manual Mercado Pago & Stripe credential configuration
  const [mpPubInput, setMpPubInput] = useState(store.mpPublicKey || '')
  const [mpTokenInput, setMpTokenInput] = useState('')
  const [savingMpManual, setSavingMpManual] = useState(false)

  const [stripeConnected, setStripeConnected] = useState(Boolean(store.stripeConnected))
  const [stripePubInput, setStripePubInput] = useState(store.stripePublicKey || '')
  const [stripeSecInput, setStripeSecInput] = useState('')
  const [savingStripe, setSavingStripe] = useState(false)

  // Meta (Facebook Page & Instagram Business) state
  const [metaConnected, setMetaConnected] = useState(Boolean(store.metaSocial?.connected))
  const [metaTokenInput, setMetaTokenInput] = useState('')
  const [fbPageIdInput, setFbPageIdInput] = useState(store.metaSocial?.facebookPageId || '')
  const [fbPageNameInput, setFbPageNameInput] = useState(
    store.metaSocial?.facebookPageName || ''
  )
  const [igAccountIdInput, setIgAccountIdInput] = useState(
    store.metaSocial?.instagramAccountId || ''
  )
  const [igUsernameInput, setIgUsernameInput] = useState(
    store.metaSocial?.instagramUsername || ''
  )
  const [metaDefaultChannels, setMetaDefaultChannels] = useState<
    Array<'INSTAGRAM' | 'FACEBOOK'>
  >(store.metaSocial?.defaultChannels || ['INSTAGRAM', 'FACEBOOK'])
  const [savingMeta, setSavingMeta] = useState(false)

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!metaTokenInput.trim() && !store.metaSocial?.hasToken && !metaConnected) {
      toast.error('Ingresa el Access Token de Meta Graph API para vincular tus cuentas')
      return
    }
    setSavingMeta(true)
    try {
      const res = await fetch('/api/integrations/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(metaTokenInput.trim() && { accessToken: metaTokenInput.trim() }),
          facebookPageId: fbPageIdInput.trim() || undefined,
          facebookPageName: fbPageNameInput.trim() || undefined,
          instagramAccountId: igAccountIdInput.trim() || undefined,
          instagramUsername: igUsernameInput.trim() || undefined,
          defaultChannels: metaDefaultChannels,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al vincular Facebook e Instagram')
      }
      setMetaConnected(true)
      setMetaTokenInput('')
      if (data.metaSocial?.facebookPageId) setFbPageIdInput(data.metaSocial.facebookPageId)
      if (data.metaSocial?.facebookPageName)
        setFbPageNameInput(data.metaSocial.facebookPageName)
      if (data.metaSocial?.instagramAccountId)
        setIgAccountIdInput(data.metaSocial.instagramAccountId)
      if (data.metaSocial?.instagramUsername)
        setIgUsernameInput(data.metaSocial.instagramUsername)
      toast.success('¡Cuentas de Facebook e Instagram vinculadas con éxito!')
    } catch (err: any) {
      toast.error(err.message || 'No se pudo vincular con Meta Graph API')
    } finally {
      setSavingMeta(false)
    }
  }

  const handleDisconnectMeta = async () => {
    setSavingMeta(true)
    try {
      const res = await fetch('/api/integrations/meta', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setMetaConnected(false)
      setMetaTokenInput('')
      setFbPageIdInput('')
      setFbPageNameInput('')
      setIgAccountIdInput('')
      setIgUsernameInput('')
      toast.success('Facebook e Instagram desconectados')
    } catch {
      toast.error('No se pudo desconectar Meta')
    } finally {
      setSavingMeta(false)
    }
  }

  // Lock body scroll on desktop so /integraciones behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  const handleSaveManualMp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mpPubInput.trim() && !mpTokenInput.trim()) {
      toast.error('Ingresa tu Public Key o Access Token de Mercado Pago')
      return
    }
    setSavingMpManual(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mpPublicKey: mpPubInput.trim() || undefined,
          ...(mpTokenInput.trim() && { mpAccessToken: mpTokenInput.trim() }),
          mpConnected: true,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar credenciales')
      toast.success('Credenciales de Mercado Pago activadas en tu tienda')
      setMpTokenInput('')
      window.location.reload()
    } catch {
      toast.error('No se pudieron guardar las credenciales de Mercado Pago')
    } finally {
      setSavingMpManual(false)
    }
  }

  const handleSaveStripe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripePubInput.trim()) {
      toast.error('Ingresa la Publishable Key (pk_...) de Stripe')
      return
    }
    setSavingStripe(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripePublicKey: stripePubInput.trim(),
          ...(stripeSecInput.trim() && { stripeSecretKey: stripeSecInput.trim() }),
          stripeConnected: true,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar Stripe')
      setStripeConnected(true)
      setStripeSecInput('')
      toast.success('Pasarela Stripe configurada y activada')
    } catch {
      toast.error('No se pudo guardar la configuración de Stripe')
    } finally {
      setSavingStripe(false)
    }
  }

  const handleDisconnectStripe = async () => {
    setSavingStripe(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stripePublicKey: null,
          stripeSecretKey: null,
          stripeConnected: false,
        }),
      })
      if (!res.ok) throw new Error()
      setStripeConnected(false)
      setStripePubInput('')
      setStripeSecInput('')
      toast.success('Stripe desconectado')
    } catch {
      toast.error('No se pudo desconectar Stripe')
    } finally {
      setSavingStripe(false)
    }
  }

  const isBrebActive = breb.brebConfig.enabled
  const isWaActive = integrations.whatsappConnected
  const isMpActive = integrations.mpConnected

  const appsList = [
    {
      id: 'breb' as IntegrationId,
      name: 'Bre-B Colombia (QR & Llaves)',
      category: 'Pasarelas' as const,
      icon: QrCode,
      iconColor: 'text-zinc-950',
      connected: isBrebActive,
      badge: 'Recomendado CO',
      desc: 'Recibe transferencias interbancarias inmediatas desde Nequi, Bancolombia, Davivienda y Nu con QR EMVCo.',
      detailKey: 'Llave Configurada',
      detailVal: isBrebActive
        ? `${breb.brebConfig.bankProvider || 'Activa'} · ${breb.brebConfig.keyValue || store.brebKeyValue || ''}`
        : 'Sin activar · Clic para configurar llave',
    },
    {
      id: 'whatsapp' as IntegrationId,
      name: 'WhatsApp Business (QR Evolution)',
      category: 'Canales' as const,
      icon: SiWhatsapp,
      iconColor: 'text-[#25D366]',
      connected: isWaActive,
      badge: 'Canal Principal',
      desc: 'Conecta el celular de tu tienda por código QR para que el Agente IA atienda y cierre ventas 24/7.',
      detailKey: 'Estado del Enlace',
      detailVal: isWaActive
        ? `Vinculado (+${store.whatsapp || 'Activo'})`
        : 'Sin vincular · Clic para generar QR',
    },
    {
      id: 'meta' as IntegrationId,
      name: 'Facebook & Instagram (Meta Autopost)',
      category: 'Canales' as const,
      icon: SiMeta,
      iconColor: 'text-[#1877F2]',
      connected: metaConnected,
      badge: 'Publicación IA',
      desc: 'Enlaza tu Página de Facebook y cuenta de Instagram Profesional para publicar fotos, posts y Reels desde Studio IA en una o ambas redes a la vez.',
      detailKey: 'Cuentas Vinculadas',
      detailVal: metaConnected
        ? `${fbPageNameInput || 'Facebook'} ${igUsernameInput ? `· @${igUsernameInput}` : ''}`
        : 'Sin vincular · Clic para conectar IG y FB',
    },
    {
      id: 'mercadopago' as IntegrationId,
      name: 'Mercado Pago Checkout',
      category: 'Pasarelas' as const,
      icon: SiMercadopago,
      iconColor: 'text-[#009EE3]',
      connected: isMpActive,
      badge: 'Tarjetas & PSE',
      desc: 'Genera links de pago automáticos con PSE, tarjetas débito/crédito, Nequi y Efecty.',
      detailKey: 'Credenciales',
      detailVal: isMpActive
        ? mpPubInput
          ? `Clave: ${mpPubInput.slice(0, 14)}...`
          : 'Cuenta vinculada'
        : 'Sin vincular · Clic para conectar',
    },
    {
      id: 'stripe' as IntegrationId,
      name: 'Stripe Global Payments',
      category: 'Pasarelas' as const,
      icon: SiStripe,
      iconColor: 'text-[#635BFF]',
      connected: stripeConnected,
      badge: 'Internacional',
      desc: 'Acepta pagos con tarjetas internacionales Visa, Mastercard, Amex y Apple Pay.',
      detailKey: 'Estado de Pasarela',
      detailVal: stripeConnected
        ? `Activa (${stripePubInput.slice(0, 12)}...)`
        : 'Opcional · Clic para configurar llaves',
    },
    {
      id: 'deepseek' as IntegrationId,
      name: 'Motor IA (OpenRouter + Replicate)',
      category: 'Infraestructura' as const,
      icon: SiDeepseek,
      iconColor: 'text-blue-600',
      connected: true,
      badge: 'Nativo',
      desc: 'Modelos LLM conversacionales y generación multimedia para el Agente WhatsApp y Studio IA.',
      detailKey: 'Estado del Motor',
      detailVal: 'En línea · Latencia óptima',
    },
    {
      id: 'storage' as IntegrationId,
      name: 'Supabase Cloud Storage & CDN',
      category: 'Infraestructura' as const,
      icon: Database,
      iconColor: 'text-emerald-600',
      connected: true,
      badge: 'Nativo',
      desc: 'Almacenamiento seguro para fotografías de catálogo, videos generados con IA y comprobantes Bre-B.',
      detailKey: 'Buckets Activos',
      detailVal: 'Productos · Studio IA · Soportes de Pago',
    },
  ]

  const comingSoonApps = [
    {
      id: 'shopify',
      name: 'Shopify Catalog Sync',
      icon: SiShopify,
      iconColor: 'text-[#96BF48]',
      desc: 'Importación bidireccional de inventario y órdenes con Shopify.',
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce Connector',
      icon: SiWoocommerce,
      iconColor: 'text-[#96588A]',
      desc: 'Sincronización de productos con tiendas WordPress.',
    },
    {
      id: 'telegram',
      name: 'Telegram Commerce Bot',
      icon: SiTelegram,
      iconColor: 'text-[#24A1DE]',
      desc: 'Catálogo automatizado para canales de Telegram.',
    },
  ]

  const filteredApps = appsList.filter(app => {
    if (activeTab === 'Todas') return true
    return app.category === activeTab
  })

  const connectedCount = appsList.filter(a => a.connected).length

  const CATEGORY_TABS: Array<{ id: CategoryTab; label: string; count: number }> = [
    { id: 'Todas', label: 'Todas', count: appsList.length },
    {
      id: 'Pasarelas',
      label: 'Pasarelas de Pago',
      count: appsList.filter(a => a.category === 'Pasarelas').length,
    },
    {
      id: 'Canales',
      label: 'Canales & WhatsApp',
      count: appsList.filter(a => a.category === 'Canales').length,
    },
    {
      id: 'Infraestructura',
      label: 'IA & Cloud',
      count: appsList.filter(a => a.category === 'Infraestructura').length,
    },
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO DE INTEGRACIONES ────────────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Integraciones
          </h1>
        </div>

        {/* Centro: Conmutador por Categoría */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-0',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[9.5px] font-extrabold px-1.5 py-0.2 rounded tabular-nums',
                    isActive
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-200/70 text-zinc-600'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Derecha: Accesos rápidos */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/pagos"
            className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold hidden sm:inline-flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
            <span>Ver Pagos</span>
          </Link>

          <Link
            href={`/tienda/${store.slug}`}
            target="_blank"
            className="h-8 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Probar Checkout</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* ── 2. CINTA ARQUITECTÓNICA DE ESTADO DE CONECTIVIDAD ────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white border-b border-zinc-200 divide-x divide-y lg:divide-y-0 divide-zinc-200 shrink-0">
        {/* KPI 1: Bre-B */}
        <div
          onClick={() => setSelectedId('breb')}
          className="px-5 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/80 transition-colors"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Bre-B Colombia (QR)
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  isBrebActive ? 'bg-emerald-500' : 'bg-amber-500'
                )}
              />
              <span className="text-xs font-black text-zinc-950 truncate">
                {isBrebActive
                  ? `${breb.brebConfig.bankProvider || 'Activa'} (${breb.brebConfig.keyValue})`
                  : 'Pendiente de activar'}
              </span>
            </div>
          </div>
          <QrCode className="w-4 h-4 text-zinc-700 shrink-0" />
        </div>

        {/* KPI 2: WhatsApp */}
        <div
          onClick={() => setSelectedId('whatsapp')}
          className="px-5 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/80 transition-colors"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              WhatsApp Business
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  isWaActive ? 'bg-emerald-500' : 'bg-amber-500'
                )}
              />
              <span className="text-xs font-black text-zinc-950 truncate">
                {isWaActive ? 'Instancia Conectada' : 'Conectar por Código QR'}
              </span>
            </div>
          </div>
          <SiWhatsapp className="w-4 h-4 text-[#25D366] shrink-0" />
        </div>

        {/* KPI 3: Mercado Pago */}
        <div
          onClick={() => setSelectedId('mercadopago')}
          className="px-5 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/80 transition-colors"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Mercado Pago & PSE
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  isMpActive ? 'bg-emerald-500' : 'bg-zinc-300'
                )}
              />
              <span className="text-xs font-black text-zinc-950 truncate">
                {isMpActive ? 'Pasarela Vinculada' : 'Vincular Credenciales'}
              </span>
            </div>
          </div>
          <SiMercadopago className="w-4 h-4 text-[#009EE3] shrink-0" />
        </div>

        {/* KPI 4: Stripe & Motor IA */}
        <div
          onClick={() => setSelectedId('stripe')}
          className="px-5 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/80 transition-colors"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Stripe Internacional
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  stripeConnected ? 'bg-emerald-500' : 'bg-zinc-300'
                )}
              />
              <span className="text-xs font-black text-zinc-950 truncate">
                {stripeConnected ? 'Tarjetas Globales Activas' : 'Opcional · Configurar'}
              </span>
            </div>
          </div>
          <SiStripe className="w-4 h-4 text-[#635BFF] shrink-0" />
        </div>
      </section>

      {/* ── 3. LIENZO DIVIDIDO: CATÁLOGO DE INTEGRACIONES + CONSOLA ACTIVA ─ */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* COLUMNA IZQUIERDA: Cuadrícula de Integraciones */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Conexiones e Integraciones Operativas
              </h2>
              <span className="text-[11px] font-medium text-zinc-400">
                Haz clic en cualquier tarjeta para configurarla en el panel derecho
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredApps.map(app => {
                const Icon = app.icon
                const isSelected = selectedId === app.id

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedId(app.id)}
                    className={cn(
                      'group p-4 rounded-2xl border bg-white transition-all cursor-pointer flex flex-col justify-between gap-4',
                      isSelected
                        ? 'border-zinc-950 ring-1 ring-zinc-950 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-400 shadow-2xs'
                    )}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors',
                              isSelected
                                ? 'bg-zinc-950 text-white border-zinc-950'
                                : 'bg-zinc-50 border-zinc-200'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-5 h-5',
                                isSelected ? 'text-white' : app.iconColor
                              )}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs font-black text-zinc-950">
                                {app.name}
                              </h3>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                                {app.badge}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 text-[10px] font-bold mt-0.5',
                                app.connected ? 'text-emerald-700' : 'text-zinc-400'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  app.connected ? 'bg-emerald-500' : 'bg-zinc-300'
                                )}
                              />
                              {app.connected ? 'Conectado' : 'Sin configurar'}
                            </span>
                          </div>
                        </div>

                        {app.connected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                        {app.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 text-[11px]">
                      <div className="min-w-0">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
                          {app.detailKey}
                        </span>
                        <span className="font-bold text-zinc-800 truncate block">
                          {app.detailVal}
                        </span>
                      </div>

                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[10.5px] font-bold shrink-0 transition-colors',
                          isSelected
                            ? 'bg-zinc-950 text-white'
                            : 'bg-zinc-100 text-zinc-800 group-hover:bg-zinc-950 group-hover:text-white'
                        )}
                      >
                        Configurar →
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ecosistema Próximamente */}
          {activeTab === 'Todas' && (
            <div className="space-y-2.5 pt-2">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Conectores en Hoja de Ruta (Próximamente)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {comingSoonApps.map(app => {
                  const Icon = app.icon
                  return (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl border border-zinc-200/80 bg-white/70 flex items-start gap-3 opacity-75"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
                        <Icon className={cn('w-4 h-4', app.iconColor)} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {app.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium leading-snug mt-0.5">
                          {app.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>

        {/* COLUMNA DERECHA FULL-HEIGHT: CONSOLA INTERACTIVA DE CONFIGURACIÓN */}
        <aside className="w-full lg:w-[400px] xl:w-[440px] shrink-0 h-full bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col overflow-hidden">
          {/* ── CONSOLA 1: BRE-B COLOMBIA (SPI ACH) ── */}
          {selectedId === 'breb' && (
            <>
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Configuración Bre-B (Colombia)
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Pagos inmediatos con QR interbancario EMVCo
                    </p>
                  </div>
                </div>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breb.brebConfig.enabled}
                    onChange={e =>
                      breb.setBrebConfig(prev => ({ ...prev, enabled: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-checked:bg-zinc-950 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  <span className="text-[11px] font-bold text-zinc-800">
                    {breb.brebConfig.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1-Click Bank Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                    1. Selecciona tu Entidad (Autocompletar Código SPI)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'NEQUI' as const, label: 'Nequi', code: '1507' },
                      { id: 'BANCOLOMBIA' as const, label: 'Bancolombia', code: '0007' },
                      { id: 'DAVIVIENDA' as const, label: 'Davivienda', code: '0051' },
                      { id: 'NU' as const, label: 'Nu Colombia', code: '3201' },
                    ].map(b => {
                      const isCurrent = breb.brebConfig.participantId === b.code
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => breb.applyBrebPreset(b.id)}
                          className={cn(
                            'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                            isCurrent
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs'
                              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                          )}
                        >
                          <span className="text-xs font-bold">{b.label}</span>
                          <span
                            className={cn(
                              'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded',
                              isCurrent ? 'bg-white/15 text-white' : 'bg-zinc-200/70 text-zinc-600'
                            )}
                          >
                            {b.code}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tipo de Llave y Valor de Llave */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 block">
                      Tipo de Llave Bre-B
                    </label>
                    <select
                      value={breb.brebConfig.keyType}
                      onChange={e =>
                        breb.setBrebConfig(prev => ({
                          ...prev,
                          keyType: e.target.value as BrebKeyType,
                        }))
                      }
                      className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-2.5 text-xs font-bold text-zinc-800 outline-none cursor-pointer"
                    >
                      <option value="PHONE">Celular (@300...)</option>
                      <option value="ALPHANUMERIC">Llave Alfanumérica</option>
                      <option value="DOCUMENT">NIT / Cédula</option>
                      <option value="EMAIL">Correo Electrónico</option>
                      <option value="MERCHANT_CODE">Código de Comercio</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 block">
                      Valor de tu Llave *
                    </label>
                    <input
                      type="text"
                      value={breb.brebConfig.keyValue}
                      onChange={e =>
                        breb.setBrebConfig(prev => ({ ...prev, keyValue: e.target.value }))
                      }
                      placeholder="Ej. 3001234567 o @mitienda"
                      className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs font-bold text-zinc-900 outline-none"
                    />
                  </div>
                </div>

                {/* Banco y Código Participante */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 block">
                      Entidad Bancaria *
                    </label>
                    <input
                      type="text"
                      value={breb.brebConfig.bankProvider}
                      onChange={e =>
                        breb.setBrebConfig(prev => ({
                          ...prev,
                          bankProvider: e.target.value,
                        }))
                      }
                      placeholder="Ej. Nequi, Bancolombia..."
                      className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 block">
                      Código Participante SPI *
                    </label>
                    <input
                      type="text"
                      value={breb.brebConfig.participantId}
                      onChange={e =>
                        breb.setBrebConfig(prev => ({
                          ...prev,
                          participantId: e.target.value,
                        }))
                      }
                      placeholder="1507 / 0007 / 0051 / 3201"
                      className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs font-bold text-zinc-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">
                    Nombre visible del comercio en el QR
                  </label>
                  <input
                    type="text"
                    value={breb.brebConfig.merchantDisplayName}
                    onChange={e =>
                      breb.setBrebConfig(prev => ({
                        ...prev,
                        merchantDisplayName: e.target.value,
                      }))
                    }
                    className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 leading-relaxed">
                  Al activar Bre-B, tus clientes verán tu código QR interbancario en el checkout y podrán subir el comprobante de pago para que lo apruebes desde <strong>Pagos</strong> o <strong>Verificaciones</strong>.
                </div>
              </div>

              <div className="p-3.5 border-t border-zinc-200 bg-zinc-50/60 shrink-0">
                <button
                  type="button"
                  disabled={breb.savingBreb}
                  onClick={breb.handleSaveBrebConfig}
                  className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {breb.savingBreb ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {breb.savingBreb ? 'Guardando Bre-B...' : 'Guardar Configuración Bre-B'}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* ── CONSOLA 2: WHATSAPP BUSINESS (QR EVOLUTION) ── */}
          {selectedId === 'whatsapp' && (
            <>
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                    <SiWhatsapp className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Consola WhatsApp Business
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Vinculación directa por código QR (Evolution API)
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                    isWaActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  )}
                >
                  {isWaActive ? '● Conectado' : '○ Sin vincular'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isWaActive ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Tu WhatsApp está vinculado y respondiendo</span>
                      </div>
                      <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                        El Agente IA recibe mensajes entrantes, muestra tu catálogo y genera links de pago automáticamente.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/conversaciones"
                        className="h-9 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir CRM</span>
                      </Link>
                      <Link
                        href="/agente"
                        className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Configurar Bot</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 flex flex-col items-center justify-center text-center min-h-[240px]">
                      {integrations.loadingQr ? (
                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                          <Loader2 className="w-7 h-7 animate-spin text-zinc-900" />
                          <span className="text-xs font-bold text-zinc-800">
                            Generando código QR de vinculación...
                          </span>
                        </div>
                      ) : integrations.qrCodeBase64 ? (
                        <div className="space-y-3 flex flex-col items-center">
                          <div className="p-3 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                            <img
                              src={integrations.qrCodeBase64}
                              alt="WhatsApp QR"
                              className="w-48 h-48 object-contain"
                            />
                          </div>
                          <p className="text-[11px] font-semibold text-zinc-600 max-w-[240px]">
                            Abre WhatsApp en tu teléfono → <strong>Dispositivos vinculados</strong> → Escanea este código QR.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-2xs">
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-zinc-950">
                              Vincular número de WhatsApp
                            </h4>
                            <p className="text-[11px] text-zinc-500 max-w-[240px]">
                              Genera un código QR en vivo para enlazar el celular de tu tienda.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 border-t border-zinc-200 bg-zinc-50/60 shrink-0">
                {isWaActive ? (
                  <button
                    type="button"
                    disabled={integrations.loadingQr}
                    onClick={integrations.handleDisconnectWhatsApp}
                    className="w-full h-9 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Desconectar Dispositivo WhatsApp</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={integrations.loadingQr}
                    onClick={integrations.handleConnectWhatsApp}
                    className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RefreshCw
                      className={cn('w-3.5 h-3.5', integrations.loadingQr && 'animate-spin')}
                    />
                    <span>
                      {integrations.qrCodeBase64 ? 'Regenerar Código QR' : 'Generar Código QR'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── CONSOLA 3: MERCADO PAGO ── */}
          {selectedId === 'mercadopago' && (
            <>
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                    <SiMercadopago className="w-4 h-4 text-[#009EE3]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Consola Mercado Pago
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Cobros con PSE, Tarjetas, Nequi y Efecty
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                    isMpActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  )}
                >
                  {isMpActive ? '● Activo' : 'Sin vincular'}
                </span>
              </div>

              <form
                onSubmit={handleSaveManualMp}
                className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Opción 1: OAuth 1-Clic */}
                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                      Opción A · Conexión OAuth Oficial
                    </span>
                    <p className="text-[11px] text-zinc-600 leading-snug">
                      Autoriza tu cuenta de Mercado Pago en un clic sin copiar llaves manualmente.
                    </p>
                    <button
                      type="button"
                      onClick={integrations.handleConnectMercadoPago}
                      className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <SiMercadopago className="w-4 h-4 text-[#009EE3]" />
                      <span>Autorizar con Mercado Pago OAuth</span>
                    </button>
                  </div>

                  {/* Opción 2: Credenciales de Producción Manuales */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                      Opción B · Credenciales Directas (Public Key & Access Token)
                    </span>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 block">
                        Public Key (APP_USR-...)
                      </label>
                      <input
                        type="text"
                        value={mpPubInput}
                        onChange={e => setMpPubInput(e.target.value)}
                        placeholder="APP_USR-xxxxxxxx-xxxx-xxxx..."
                        className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs text-zinc-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 block">
                        Access Token Privado (APP_USR-...)
                      </label>
                      <input
                        type="password"
                        value={mpTokenInput}
                        onChange={e => setMpTokenInput(e.target.value)}
                        placeholder={
                          store.hasMpToken
                            ? '•••••••••••••••••••••••• (Guardado)'
                            : 'APP_USR-xxxxxxxxxxxxxxxxxxxx...'
                        }
                        className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs text-zinc-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-2 shrink-0">
                  <button
                    type="submit"
                    disabled={savingMpManual}
                    className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {savingMpManual ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5" />
                    )}
                    <span>Guardar Credenciales Mercado Pago</span>
                  </button>

                  {isMpActive && (
                    <button
                      type="button"
                      disabled={integrations.disconnectingMp}
                      onClick={integrations.handleDisconnectMercadoPago}
                      className="w-full h-8 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Desvincular Mercado Pago
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {/* ── CONSOLA 4: STRIPE CHECKOUT ── */}
          {selectedId === 'stripe' && (
            <>
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                    <SiStripe className="w-4 h-4 text-[#635BFF]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Consola Stripe Checkout
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Pagos internacionales con tarjeta de crédito/débito
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                    stripeConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  )}
                >
                  {stripeConnected ? '● Activo' : 'Inactivo'}
                </span>
              </div>

              <form
                onSubmit={handleSaveStripe}
                className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 leading-relaxed">
                    Ingresa tus llaves de API desde el Dashboard de Stripe para habilitar cobros con tarjeta en el checkout de tu tienda.
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 block">
                      Publishable Key (pk_live_... o pk_test_...) *
                    </label>
                    <input
                      type="text"
                      value={stripePubInput}
                      onChange={e => setStripePubInput(e.target.value)}
                      placeholder="pk_live_51..."
                      className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs text-zinc-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 block">
                      Secret Key (sk_live_... o sk_test_...)
                    </label>
                    <input
                      type="password"
                      value={stripeSecInput}
                      onChange={e => setStripeSecInput(e.target.value)}
                      placeholder={
                        store.hasStripeSecret
                          ? '•••••••••••••••••••••••• (Guardada)'
                          : 'sk_live_51...'
                      }
                      className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs text-zinc-900 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-2 shrink-0">
                  <button
                    type="submit"
                    disabled={savingStripe}
                    className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {savingStripe ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Guardar y Activar Stripe</span>
                  </button>

                  {stripeConnected && (
                    <button
                      type="button"
                      disabled={savingStripe}
                      onClick={handleDisconnectStripe}
                      className="w-full h-8 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Desconectar Stripe
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {/* ── CONSOLA META: FACEBOOK PAGE & INSTAGRAM BUSINESS ── */}
          {selectedId === 'meta' && (
            <>
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] flex items-center justify-center shrink-0">
                    <SiMeta className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Facebook & Instagram
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Publicación en una o ambas redes desde Studio IA
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                    metaConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  )}
                >
                  {metaConnected ? '● Vinculado' : 'Sin vincular'}
                </span>
              </div>

              <form
                onSubmit={handleSaveMeta}
                className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* OAuth 1-Click Connect */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-900">
                        Opción 1: Conexión Rápida OAuth
                      </span>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-600">
                        Meta Login
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Autoriza tu Página de Facebook y tu cuenta de Instagram Profesional vinculada para publicar posts y Reels.
                    </p>
                    <a
                      href="/api/integrations/meta/auth"
                      className="w-full h-9 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors no-underline"
                    >
                      <SiMeta className="w-3.5 h-3.5" />
                      <span>Conectar con Facebook & Instagram</span>
                    </a>
                  </div>

                  {/* Direct Token / Graph API Connection */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-900">
                        Opción 2: Token de Meta Business / Graph API
                      </span>
                      <span className="text-[10px] text-zinc-400">Autodetección</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 block">
                        Page / System User Access Token *
                      </label>
                      <input
                        type="password"
                        value={metaTokenInput}
                        onChange={e => setMetaTokenInput(e.target.value)}
                        placeholder={
                          metaConnected
                            ? '•••••••••••••••••••••••• (Token activo guardado)'
                            : 'EAAGm0PX4ZCpsBA...'
                        }
                        className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 font-mono text-xs text-zinc-900 outline-none"
                      />
                      <p className="text-[10px] text-zinc-400">
                        Al guardar el token, detectamos automáticamente tu Página de Facebook y tu @usuario de Instagram Business.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-zinc-700 block">
                          ID Página Facebook
                        </label>
                        <input
                          type="text"
                          value={fbPageIdInput}
                          onChange={e => setFbPageIdInput(e.target.value)}
                          placeholder="Auto o ej: 1049281..."
                          className="w-full h-8.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg px-2.5 font-mono text-xs text-zinc-900 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-zinc-700 block">
                          Nombre Página FB
                        </label>
                        <input
                          type="text"
                          value={fbPageNameInput}
                          onChange={e => setFbPageNameInput(e.target.value)}
                          placeholder="Ej: Mi Tienda Oficial"
                          className="w-full h-8.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg px-2.5 text-xs text-zinc-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-zinc-700 block">
                          ID Instagram Business
                        </label>
                        <input
                          type="text"
                          value={igAccountIdInput}
                          onChange={e => setIgAccountIdInput(e.target.value)}
                          placeholder="Auto o ej: 178414..."
                          className="w-full h-8.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg px-2.5 font-mono text-xs text-zinc-900 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-zinc-700 block">
                          @Usuario Instagram
                        </label>
                        <input
                          type="text"
                          value={igUsernameInput}
                          onChange={e => setIgUsernameInput(e.target.value)}
                          placeholder="Ej: mitienda.co"
                          className="w-full h-8.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-lg px-2.5 text-xs text-zinc-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* Default Destination Selector */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold text-zinc-700 block">
                        Destino predeterminado al publicar plantilla
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          {
                            id: 'BOTH',
                            label: 'Ambos (IG + FB)',
                            channels: ['INSTAGRAM', 'FACEBOOK'] as Array<
                              'INSTAGRAM' | 'FACEBOOK'
                            >,
                          },
                          {
                            id: 'IG',
                            label: 'Solo Instagram',
                            channels: ['INSTAGRAM'] as Array<'INSTAGRAM' | 'FACEBOOK'>,
                          },
                          {
                            id: 'FB',
                            label: 'Solo Facebook',
                            channels: ['FACEBOOK'] as Array<'INSTAGRAM' | 'FACEBOOK'>,
                          },
                        ].map(opt => {
                          const isSelected =
                            opt.channels.length === metaDefaultChannels.length &&
                            opt.channels.every(c => metaDefaultChannels.includes(c))
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setMetaDefaultChannels(opt.channels)}
                              className={cn(
                                'py-2 px-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer',
                                isSelected
                                  ? 'bg-zinc-950 text-white border-zinc-950'
                                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                              )}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-2 shrink-0">
                  <button
                    type="submit"
                    disabled={savingMeta}
                    className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {savingMeta ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Guardar y Vincular Cuentas</span>
                  </button>

                  {metaConnected && (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/studio-ia"
                        className="h-8 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors no-underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Publicar en Studio IA</span>
                      </Link>
                      <button
                        type="button"
                        disabled={savingMeta}
                        onClick={handleDisconnectMeta}
                        className="h-8 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Desconectar
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </>
          )}

          {/* ── CONSOLA 5 & 6: INFRAESTRUCTURA IA & SUPABASE STORAGE ── */}
          {(selectedId === 'deepseek' || selectedId === 'storage') && (
            <>
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Infraestructura Gestionada
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Servicio nativo incluido en tu tienda
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● Operativo
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {selectedId === 'deepseek'
                        ? 'Motor IA Conversacional & Creativo'
                        : 'Almacenamiento Cloud & CDN'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">100% Uptime</span>
                  </div>
                  <h4 className="text-sm font-black">
                    {selectedId === 'deepseek'
                      ? 'OpenRouter LLM + Replicate Studio'
                      : 'Supabase Storage (S3 Compatible)'}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {selectedId === 'deepseek'
                      ? 'Procesa las respuestas autónomas del Agente de WhatsApp, los guiones publicitarios, la iluminación IC-Light y la síntesis de video en Studio IA.'
                      : 'Aloja de forma persistente las fotos de tus productos, escenas generadas con IA, videos MP4 y los comprobantes de transferencia Bre-B.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/agente"
                    className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ir al Agente IA</span>
                  </Link>
                  <Link
                    href="/studio-ia"
                    className="h-9 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Abrir Studio IA</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
