'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  ShoppingBag,
  ArrowUpRight,
  Video,
  Camera,
  FileText,
  Film,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Send,
  MessageCircle,
  Search,
  Check,
  RefreshCw,
  UserCheck,
  Wand2,
  Scissors,
  Layers,
  Copy,
  CheckCircle2,
  Clock,
  Flame,
  Music,
  Upload,
  Sliders,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Product,
  StudioIaClientProps,
  CreativeMode,
  CreativeTone,
  MusicTrack,
  AiAvatar,
  AvatarLayout,
  StudioMainTab,
  GeneratedData,
  AI_AVATARS,
  renderStudioVideo,
  FotoStudioTab,
  ContenidoTab,
  CreacionesTab,
  formatCOP
} from './studio-ia'
import { useVoiceover } from './studio-ia/useVoiceover'
import { usePhotoStudio } from './studio-ia/usePhotoStudio'
import { SocialPublishModal, type MetaSocialBrief } from './studio-ia/SocialPublishModal'
import { SiInstagram, SiFacebook } from 'react-icons/si'

export { AI_AVATARS }
export type { AiAvatar, AvatarLayout }

type LeftToolTab = 'catalogo' | 'avatares' | 'efectos' | 'foto-rapida'

export default function StudioIaClient({
  store,
  products,
  coupons,
  initialCreations = []
}: StudioIaClientProps) {
  // Modo principal del Estudio Superior
  const [mainTab, setMainTab] = useState<StudioMainTab>('video')
  // Sub-herramienta activa en el panel izquierdo del editor de video
  const [leftTool, setLeftTool] = useState<LeftToolTab>('catalogo')

  // Producto seleccionado
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products.length > 0 ? products[0] : null
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Hook de Foto Studio IA + Video 3D (I2V) + Avatar Lip-Sync
  const {
    enhancedPhotoUrl,
    setEnhancedPhotoUrl,
    photoHistory,
    isProcessingPhoto,
    photoActionType,
    selectedScene,
    setSelectedScene,
    customScenePrompt,
    setCustomScenePrompt,
    isGeneratingI2V,
    generatedVideoUrl,
    isGeneratingAvatarVideo,
    avatarVideoUrl,
    handleEnhancePhoto,
    handleSetPrimaryPhoto,
    handleGenerateI2V,
    handleGenerateTalkingAvatar
  } = usePhotoStudio({ selectedProduct })

  // Galería multi-foto del catálogo para transiciones entre escenas
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [isUploadingCustomAvatar, setIsUploadingCustomAvatar] = useState(false)
  const [lastRenderedVideoUrl, setLastRenderedVideoUrl] = useState<string | null>(null)

  // Parámetros creativos
  const [mode, setMode] = useState<CreativeMode>('DYNAMIC_REEL')
  const [tone, setTone] = useState<CreativeTone>('urgency')
  const [duration, setDuration] = useState<'15s' | '30s'>('15s')
  const [musicTrack, setMusicTrack] = useState<MusicTrack>('viral')
  const [selectedCouponId, setSelectedCouponId] = useState<string>('')

  // Sistema de Avatares de IA & Creadores UGC
  const [selectedAvatar, setSelectedAvatar] = useState<AiAvatar>(AI_AVATARS[0])
  const [avatarLayout, setAvatarLayout] = useState<AvatarLayout>('BUBBLE_PIP')

  // Estados de generación y publicación
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [metaSocialState, setMetaSocialState] = useState<MetaSocialBrief | null>(
    (store as any).metaSocial || null
  )
  const [inspectorCopyTab, setInspectorCopyTab] = useState<'whatsapp' | 'instagram'>('whatsapp')

  // Contenido generado
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null)

  // Reproductor y línea de tiempo (Timeline de 4 escenas)
  const [isPlaying, setIsPlaying] = useState(true)
  const [previewSecond, setPreviewSecond] = useState(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [savedCreations, setSavedCreations] = useState<any[]>(initialCreations)
  const [copyFramework, setCopyFramework] = useState<'aida' | 'pas'>('aida')

  // Estados de renderizado de video MP4
  const [isRenderingVideo, setIsRenderingVideo] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)

  // Bloquear doble scroll en pantalla completa del estudio (solo en desktop)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  // Hook de síntesis de voz y locución
  const {
    isVoiceActive,
    isMuted,
    stopVoiceover,
    toggleVoice,
    toggleMute
  } = useVoiceover({
    generatedData,
    previewSecond,
    isPlaying
  })

  // Timer del reproductor
  const maxSeconds = duration === '15s' ? 15 : 30
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isPlaying) {
      interval = setInterval(() => {
        setPreviewSecond(prev => (prev >= maxSeconds ? 0 : prev + 1))
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, maxSeconds])

  // Filtrado reactivo de catálogo
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCoupon = coupons.find(c => c.id === selectedCouponId)
  const hasAutoGeneratedRef = useRef(false)

  const handleToggleGalleryImage = (url: string) => {
    setGalleryImages(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    )
  }

  const handleUploadCustomAvatar = async (file: File) => {
    setIsUploadingCustomAvatar(true)
    const toastId = toast.loading('Subiendo tu foto de Avatar...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo subir la foto')

      const customAv: AiAvatar = {
        id: `custom_${Date.now()}`,
        name: store.name.split(' ')[0] || 'Mi Avatar',
        niche: 'Vocero Oficial de la Marca',
        badge: 'Personalizado',
        imageUrl: data.url,
        gender: 'female',
        tone: 'Auténtico & Cercano'
      }
      setSelectedAvatar(customAv)
      toast.dismiss(toastId)
      toast.success('¡Tu foto fue cargada como Avatar! Pulsa "Generar Lip-Sync" para animarla.')
    } catch (e: any) {
      toast.dismiss(toastId)
      toast.error(e.message || 'Error al subir foto de avatar')
    } finally {
      setIsUploadingCustomAvatar(false)
    }
  }

  const handleUpdateGeneratedData = (patch: Partial<GeneratedData>) => {
    setGeneratedData(prev => (prev ? { ...prev, ...patch } : prev))
  }

  // Generar contenido con IA
  const handleGenerateContent = async (customProduct?: Product, isSilent: boolean = false) => {
    const productToUse = customProduct || selectedProduct
    if (!productToUse) {
      if (!isSilent) toast.error('Selecciona un producto primero')
      return
    }

    setIsGenerating(true)
    stopVoiceover()

    try {
      const res = await fetch('/api/studio-ia/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productToUse.id,
          mode,
          tone,
          couponId: selectedCouponId || undefined
        })
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al generar guion')
      }

      setGeneratedData(json.data)
      setPreviewSecond(0)
      setIsPlaying(true)
      if (!isSilent) {
        toast.success('¡Guion, escenas y copys actualizados con IA!')
      }
    } catch (err: any) {
      console.error(err)
      if (!isSilent) {
        toast.error(err.message || 'Error al comunicarse con el motor de IA')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Generación inicial silenciosa una sola vez
  useEffect(() => {
    if (!hasAutoGeneratedRef.current && !generatedData && selectedProduct) {
      hasAutoGeneratedRef.current = true
      handleGenerateContent(selectedProduct, true)
    }
  }, [])

  // Renderizador y descargador de video MP4
  const handleDownloadVideo = async () => {
    if (!selectedProduct || !generatedData) {
      toast.error('Primero selecciona un producto y genera el contenido.')
      return
    }

    setIsRenderingVideo(true)
    setRenderProgress(5)

    try {
      const result = await renderStudioVideo({
        selectedProduct: enhancedPhotoUrl
          ? { ...selectedProduct, imageUrl: enhancedPhotoUrl }
          : selectedProduct,
        generatedData,
        selectedAvatar,
        avatarLayout,
        duration,
        musicTrack,
        tone,
        selectedCoupon,
        avatarVideoUrl,
        productVideoUrl: generatedVideoUrl,
        galleryImages,
        store: { name: store.name, slug: store.slug },
        onProgress: setRenderProgress
      })

      // Descargar archivo generado
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${result.sanitizedName}_reel_promo.${result.fileExt}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Subir a Supabase Storage para dejarlo listo para WhatsApp y Biblioteca
      let uploadedVideoUrl: string | null = generatedVideoUrl || avatarVideoUrl || null
      try {
        const videoFile = new File(
          [result.blob],
          `${result.sanitizedName}_reel.${result.fileExt}`,
          { type: result.selectedMime.split(';')[0] || `video/${result.fileExt}` }
        )
        const upForm = new FormData()
        upForm.append('file', videoFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: upForm })
        const upJson = await upRes.json()
        if (upRes.ok && upJson.url) {
          uploadedVideoUrl = upJson.url
          setLastRenderedVideoUrl(upJson.url)
        }
      } catch (upErr) {
        console.warn('Upload rendered video warn:', upErr)
      }

      // Guardar creación en la biblioteca DB
      try {
        const res = await fetch('/api/studio-ia/save-creation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Reel HD - ${selectedProduct.name}`,
            type: mode,
            format: '9:16',
            productId: selectedProduct.id,
            script: generatedData.script,
            copyCaption: generatedData.copyInstagram,
            hookText: generatedData.hook,
            callToAction: generatedData.callToAction,
            videoUrl: uploadedVideoUrl,
            thumbnailUrl: enhancedPhotoUrl || selectedProduct.imageUrl
          })
        })
        const saveJson = await res.json()
        if (saveJson.creation) {
          setSavedCreations(prev => [saveJson.creation, ...prev])
        }
      } catch (e) {
        console.warn('Save creation DB:', e)
      }

      toast.success(`¡Video ${result.fileExt.toUpperCase()} HD (1080×1920) exportado con éxito!`)
    } catch (err: any) {
      console.error(err)
      toast.error('Error al generar el video MP4')
    } finally {
      setIsRenderingVideo(false)
    }
  }

  // Publicar en WhatsApp (envía el video real si existe o la foto mejorada)
  const handlePublishWhatsApp = async (type: 'STATUS' | 'TEST') => {
    if (!store.whatsappConnected) {
      toast.error('Conecta tu WhatsApp en Integraciones antes de publicar estados.')
      return
    }

    if (!generatedData) {
      toast.error('Genera el contenido antes de publicar.')
      return
    }

    let phoneToSend = store.whatsapp
    if (type === 'TEST' && !phoneToSend) {
      const inputPhone = window.prompt('Ingresa tu número de WhatsApp con código de país (ej: 573001234567):')
      if (!inputPhone || !inputPhone.trim()) return
      phoneToSend = inputPhone.trim()
    }

    setIsPublishing(true)
    try {
      const videoUrlToSend = lastRenderedVideoUrl || generatedVideoUrl || avatarVideoUrl
      const mediaUrlToSend = videoUrlToSend || enhancedPhotoUrl || selectedProduct?.imageUrl || undefined
      const mediaTypeToSend = videoUrlToSend ? 'video' : 'image'

      const res = await fetch('/api/studio-ia/publish-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          caption: generatedData.copyWhatsApp,
          mediaUrl: mediaUrlToSend,
          mediaType: mediaTypeToSend,
          targetPhone: phoneToSend || undefined,
          productId: selectedProduct?.id,
          title: `Reel IA - ${selectedProduct?.name}`
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al publicar')
      }

      const newCreation = {
        id: Math.random().toString(),
        title: `Reel IA - ${selectedProduct?.name}`,
        type: mode,
        videoUrl: videoUrlToSend,
        thumbnailUrl: enhancedPhotoUrl || selectedProduct?.imageUrl,
        copyCaption: generatedData.copyWhatsApp,
        createdAt: new Date().toISOString(),
        product: selectedProduct
      }
      setSavedCreations(prev => [newCreation, ...prev])

      toast.success(data.message || '¡Publicado exitosamente en WhatsApp!')
    } catch (err: any) {
      toast.error(err.message || 'Error al publicar en WhatsApp')
    } finally {
      setIsPublishing(false)
    }
  }

  // Re-publicar pieza desde la biblioteca
  const handleRepublish = async (item: any) => {
    if (!store.whatsappConnected) {
      toast.error('Conecta tu WhatsApp en Integraciones antes de publicar.')
      return
    }
    const toastId = toast.loading('Publicando pieza en WhatsApp...')
    try {
      const hasVideo = Boolean(item.videoUrl)
      const res = await fetch('/api/studio-ia/publish-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STATUS',
          caption: item.copyCaption || item.title,
          mediaUrl: item.videoUrl || item.thumbnailUrl || undefined,
          mediaType: hasVideo ? 'video' : 'image',
          productId: item.productId,
          title: item.title
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al re-publicar')
      }
      toast.dismiss(toastId)
      toast.success('¡Pieza publicada en los Estados de WhatsApp!')
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err.message || 'Error al re-publicar')
    }
  }

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success('¡Copiado al portapapeles!')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Diapositiva activa para el lienzo central
  const allSlides = Array.from(
    new Set(
      [
        ...(enhancedPhotoUrl ? [enhancedPhotoUrl] : []),
        ...galleryImages,
        ...(selectedProduct?.imageUrl ? selectedProduct.imageUrl.split(',').map(s => s.trim()) : [])
      ].filter(Boolean)
    )
  )
  const activeSlideUrl =
    allSlides.length > 0
      ? allSlides[Math.floor((previewSecond / Math.max(1, maxSeconds)) * allSlides.length) % allSlides.length]
      : selectedProduct?.imageUrl || null

  // Escenas del Timeline inferior
  const scenes = [
    { id: 1, title: '01 · Gancho (Hook)', range: '0s – 3s', startSec: 0, endSec: 3 },
    {
      id: 2,
      title: '02 · Showcase Catálogo',
      range: `3s – ${Math.round(maxSeconds * 0.45)}s`,
      startSec: 3,
      endSec: Math.round(maxSeconds * 0.45)
    },
    {
      id: 3,
      title: '03 · Beneficios & Voz',
      range: `${Math.round(maxSeconds * 0.45)}s – ${Math.round(maxSeconds * 0.78)}s`,
      startSec: Math.round(maxSeconds * 0.45),
      endSec: Math.round(maxSeconds * 0.78)
    },
    {
      id: 4,
      title: '04 · Oferta & CTA',
      range: `${Math.round(maxSeconds * 0.78)}s – ${maxSeconds}s`,
      startSec: Math.round(maxSeconds * 0.78),
      endSec: maxSeconds
    }
  ]

  const currentScene =
    scenes.find(s => previewSecond >= s.startSec && previewSecond <= s.endSec) || scenes[0]

  // Estado vacío si no hay productos en la tienda
  if (products.length === 0) {
    return (
      <div className="py-20 px-6 bg-white border border-zinc-200 rounded-xl text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-zinc-50 text-zinc-700 border border-zinc-200 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-zinc-950">Tu catálogo aún no tiene productos</h2>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            Agrega tu primer producto en el catálogo para habilitar el Estudio Creativo de Video, Avatares Lip-Sync y Fotografía IA.
          </p>
        </div>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-all"
        >
          <span>Ir a crear mi primer producto</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR COMPACTA DEL ESTUDIO (TOP STUDIO BAR) ────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Studio IA
          </h1>
        </div>

        {/* Centro: Conmutador de Modos del Estudio (Segmented Control) */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {[
            { id: 'video' as const, label: 'Video & Reels', icon: Video },
            { id: 'foto' as const, label: 'Foto Studio', icon: Camera },
            { id: 'contenido' as const, label: 'Copys IA', icon: FileText },
            { id: 'creaciones' as const, label: `Biblioteca (${savedCreations.length})`, icon: Film }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = mainTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainTab(tab.id)}
                className={cn(
                  'h-7 px-3 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs border border-zinc-200/60'
                    : 'text-zinc-500 hover:text-zinc-900'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Derecha: Acciones de Exportación y Publicación Rápida */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSocialModal(true)}
            className="h-8 px-3 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Publicar post o Reel en Instagram y Facebook"
          >
            <SiInstagram className="w-3 h-3 text-[#E1306C]" />
            <SiFacebook className="w-3 h-3 text-[#1877F2]" />
            <span>Publicar IG / FB</span>
          </button>

          <button
            type="button"
            onClick={() => handlePublishWhatsApp('STATUS')}
            disabled={isPublishing || !generatedData}
            className="hidden sm:inline-flex h-8 px-3 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-800 border border-zinc-200 rounded-lg text-[11px] font-bold items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Publicar directamente en Estados de WhatsApp"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span>{isPublishing ? 'Publicando...' : 'Estado WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadVideo}
            disabled={isRenderingVideo || !generatedData}
            className="h-8 px-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <Download className={cn('w-3.5 h-3.5', isRenderingVideo && 'animate-bounce')} />
            <span>
              {isRenderingVideo ? `Exportando ${renderProgress}%` : 'Exportar MP4 HD'}
            </span>
          </button>
        </div>
      </header>

      {/* ── 2. ÁREA DE TRABAJO SEGÚN MODO ACTIVO ─────────────────────────── */}
      {mainTab === 'video' ? (
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* ━━ COLUMNA IZQUIERDA: HERRAMIENTAS, CATÁLOGO, AVATARES Y 3D ━━ */}
          <aside className="w-full lg:w-[360px] xl:w-[390px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col h-full overflow-hidden">
            {/* Barra de 4 Pestañas de Herramientas */}
            <div className="grid grid-cols-4 border-b border-zinc-200 bg-zinc-50/70 p-1 gap-1 shrink-0">
              {[
                { id: 'catalogo' as const, label: 'Catálogo', icon: Package },
                { id: 'avatares' as const, label: 'Avatar IA', icon: UserCheck },
                { id: 'efectos' as const, label: 'Video 3D', icon: Sparkles },
                { id: 'foto-rapida' as const, label: 'Foto IA', icon: Wand2 }
              ].map(t => {
                const Icon = t.icon
                const active = leftTool === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLeftTool(t.id)}
                    className={cn(
                      'py-2 px-1 rounded-md text-[10.5px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                      active
                        ? 'bg-white text-zinc-950 shadow-2xs border border-zinc-200/80'
                        : 'text-zinc-500 hover:text-zinc-900'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Contenido desplazable del panel izquierdo */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* HERRAMIENTA 1: CATÁLOGO Y SECUENCIA MULTI-FOTO */}
              {leftTool === 'catalogo' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900">
                        1. Producto Principal del Reel
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {filteredProducts.length} disp.
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Buscar producto en tu catálogo..."
                        className="w-full h-8.5 pl-8.5 pr-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Grilla de productos */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredProducts.map(p => {
                      const isSelected = selectedProduct?.id === p.id
                      const firstImg = p.imageUrl?.split(',')[0]?.trim() || ''
                      const inSequence = firstImg ? galleryImages.includes(firstImg) : false

                      return (
                        <div
                          key={p.id}
                          className={cn(
                            'group relative rounded-xl border p-2 transition-all flex flex-col justify-between bg-white',
                            isSelected
                              ? 'border-zinc-950 ring-1 ring-zinc-950 bg-zinc-50/40'
                              : 'border-zinc-200/80 hover:border-zinc-300'
                          )}
                        >
                          <div
                            onClick={() => {
                              if (selectedProduct?.id !== p.id) {
                                setSelectedProduct(p)
                                setEnhancedPhotoUrl(null)
                                handleGenerateContent(p)
                              }
                            }}
                            className="cursor-pointer"
                          >
                            <div className="aspect-square rounded-lg bg-zinc-100 overflow-hidden relative mb-2 border border-zinc-200/50">
                              {firstImg ? (
                                <img
                                  src={firstImg}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <ShoppingBag className="w-6 h-6 text-zinc-300 m-auto mt-10" />
                              )}
                              {isSelected && (
                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[9px] font-bold">
                                  Principal
                                </span>
                              )}
                            </div>

                            <span className="text-[11.5px] font-bold text-zinc-900 line-clamp-1 block">
                              {p.name}
                            </span>
                            <span className="text-[11px] font-extrabold text-zinc-600 tabular-nums block mt-0.5">
                              {formatCOP(p.price)}
                            </span>
                          </div>

                          {/* Botón para añadir a las transiciones de escenas */}
                          {firstImg && (
                            <button
                              type="button"
                              onClick={() => handleToggleGalleryImage(firstImg)}
                              className={cn(
                                'mt-2 w-full h-6.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer',
                                inSequence || isSelected
                                  ? 'bg-zinc-900 text-white border-zinc-900'
                                  : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                              )}
                            >
                              <Check className="w-2.5 h-2.5" />
                              <span>{inSequence || isSelected ? 'En escenas' : '+ Incluir en escenas'}</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* HERRAMIENTA 2: AVATARES IA & LIP-SYNC EN ESPAÑOL */}
              {leftTool === 'avatares' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 block">
                      Disposición del Presentador IA
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                      {[
                        { id: 'BUBBLE_PIP' as AvatarLayout, label: 'Burbuja PIP' },
                        { id: 'SPLIT_UGC' as AvatarLayout, label: 'Split 50/50' },
                        { id: 'NONE' as AvatarLayout, label: 'Sin Avatar' }
                      ].map(l => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setAvatarLayout(l.id)}
                          className={cn(
                            'py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer',
                            avatarLayout === l.id
                              ? 'bg-white text-zinc-950 shadow-2xs'
                              : 'text-zinc-500 hover:text-zinc-900'
                          )}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {avatarLayout !== 'NONE' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900">
                            Selecciona o Sube tu Avatar
                          </span>
                          <label className="text-[10.5px] font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-md border border-zinc-200 cursor-pointer inline-flex items-center gap-1 transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>{isUploadingCustomAvatar ? 'Subiendo...' : 'Subir mi foto'}</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              disabled={isUploadingCustomAvatar}
                              onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) handleUploadCustomAvatar(f)
                              }}
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {AI_AVATARS.map(av => {
                            const isSel = selectedAvatar.id === av.id
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => setSelectedAvatar(av)}
                                className={cn(
                                  'p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5',
                                  isSel
                                    ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950'
                                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                                )}
                              >
                                <img
                                  src={av.imageUrl}
                                  alt={av.name}
                                  className="w-11 h-11 rounded-lg object-cover shrink-0 border border-zinc-200"
                                />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-zinc-950 block truncate">
                                    {av.name}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-medium block truncate">
                                    {av.niche}
                                  </span>
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                                    {av.badge}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Tarjeta de Sincronización de Labios Real (Lip-Sync IA) */}
                      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-zinc-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                            Lip-Sync Real con Voz en Español
                          </span>
                          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                            Genera un video real de <strong>{selectedAvatar.name}</strong> moviendo los labios y pronunciando el guion de tu producto.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleGenerateTalkingAvatar({
                              avatarImageUrl: selectedAvatar.imageUrl,
                              scriptText: `${generatedData?.hook || ''}. ${generatedData?.script || ''}`.trim(),
                              voice: selectedAvatar.gender === 'male' ? 'onyx' : 'nova'
                            })
                          }
                          disabled={isGeneratingAvatarVideo || !generatedData?.script}
                          className="w-full h-9 px-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles className={cn('w-3.5 h-3.5', isGeneratingAvatarVideo && 'animate-spin')} />
                          <span>
                            {isGeneratingAvatarVideo
                              ? 'Generando Lip-Sync (~40s)...'
                              : `Animar a ${selectedAvatar.name} Hablando`}
                          </span>
                        </button>

                        {avatarVideoUrl && (
                          <div className="space-y-2 pt-1">
                            <div className="rounded-lg overflow-hidden border border-zinc-200 bg-black aspect-video flex items-center justify-center">
                              <video src={avatarVideoUrl} controls className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Integrado automáticamente en el reproductor 9:16
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* HERRAMIENTA 3: VIDEO 3D (I2V), ESTILO Y MÚSICA */}
              {leftTool === 'efectos' && (
                <div className="space-y-4">
                  {/* Generador 3D Image-to-Video */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zinc-950">
                        Animación 3D del Producto (I2V)
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700">
                        Minimax Video-01
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                      Convierte la foto de <strong>{selectedProduct?.name}</strong> en una toma cinematográfica en movimiento con luces de estudio.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleGenerateI2V()}
                      disabled={isGeneratingI2V || !selectedProduct?.imageUrl}
                      className="w-full h-9 px-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <Film className={cn('w-3.5 h-3.5', isGeneratingI2V && 'animate-spin')} />
                      <span>
                        {isGeneratingI2V
                          ? 'Renderizando Toma 3D (~35s)...'
                          : 'Generar Toma 3D en Movimiento'}
                      </span>
                    </button>

                    {generatedVideoUrl && (
                      <div className="rounded-lg overflow-hidden border border-zinc-200 bg-black aspect-video">
                        <video src={generatedVideoUrl} controls autoPlay loop muted className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Plantilla Creativa */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 block">
                      Formato de Dirección Creativa
                    </span>
                    <div className="space-y-2">
                      {[
                        { id: 'DYNAMIC_REEL' as CreativeMode, title: 'Reel de Venta Rápida', desc: 'Enfoque en oferta, precio y llamado a la acción', icon: Flame },
                        { id: 'GENERATIVE_I2V' as CreativeMode, title: 'Comercial Cinemático', desc: 'Estética editorial y foco en calidad del producto', icon: Sparkles },
                        { id: 'AVATAR_UGC' as CreativeMode, title: 'Testimonio Creador UGC', desc: 'Recomendación cercana en primera persona', icon: UserCheck }
                      ].map(m => {
                        const Icon = m.icon
                        const active = mode === m.id
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMode(m.id)}
                            className={cn(
                              'w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5',
                              active
                                ? 'border-zinc-950 bg-zinc-50 ring-1 ring-zinc-950'
                                : 'border-zinc-200 bg-white hover:border-zinc-300'
                            )}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                              active ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-zinc-950 block">{m.title}</span>
                              <span className="text-[10.5px] text-zinc-500 font-medium block truncate">{m.desc}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Ajustes de Audio, Tono y Duración */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                        Tono del Guion
                      </label>
                      <select
                        value={tone}
                        onChange={e => setTone(e.target.value as CreativeTone)}
                        className="w-full h-8.5 text-xs font-semibold bg-white border border-zinc-200 rounded-lg px-2.5 text-zinc-900 focus:outline-none focus:border-zinc-950"
                      >
                        <option value="urgency">⚡ Urgencia & Oferta Flash</option>
                        <option value="luxury">💎 Elegante & Premium</option>
                        <option value="casual">👋 Cercano & Amigable</option>
                        <option value="educational">💡 Problema / Solución</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                        Pista Musical de Fondo
                      </label>
                      <select
                        value={musicTrack}
                        onChange={e => setMusicTrack(e.target.value as MusicTrack)}
                        className="w-full h-8.5 text-xs font-semibold bg-white border border-zinc-200 rounded-lg px-2.5 text-zinc-900 focus:outline-none focus:border-zinc-950"
                      >
                        <option value="viral">🔥 Beat Viral de TikTok</option>
                        <option value="upbeat">⚡ Electrónica Comercial</option>
                        <option value="lofi">☕ Lo-Fi Chill E-Commerce</option>
                        <option value="luxury">✨ Lounge Minimalista</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                        Duración del Reel
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['15s', '30s'] as const).map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDuration(d)}
                            className={cn(
                              'h-8 rounded-lg border text-xs font-bold cursor-pointer transition-all',
                              duration === d
                                ? 'bg-zinc-950 text-white border-zinc-950'
                                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                            )}
                          >
                            {d === '15s' ? '15 Segundos (Flash)' : '30 Segundos (Completo)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HERRAMIENTA 4: RETOQUE RÁPIDO DE FOTO DEL PRODUCTO SIN SALIR DEL VIDEO */}
              {leftTool === 'foto-rapida' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 block">
                      Retoque IA de la Foto para el Reel
                    </span>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Mejora la foto de <strong>{selectedProduct?.name}</strong> aquí mismo y el cambio se aplicará al instante en tu video.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEnhancePhoto('remove-bg')}
                      disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                      className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-left space-y-1 cursor-pointer transition-all"
                    >
                      <Scissors className="w-4 h-4 text-zinc-800" />
                      <span className="text-xs font-bold text-zinc-950 block">Quitar Fondo</span>
                      <span className="text-[10px] text-zinc-500 block">Recorte limpio RMBG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEnhancePhoto('upscale')}
                      disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                      className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-50 text-left space-y-1 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-zinc-800" />
                      <span className="text-xs font-bold text-zinc-950 block">Nitidez 4K</span>
                      <span className="text-[10px] text-zinc-500 block">Upscale Real-ESRGAN</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-zinc-700 block">
                      Escenario 3D (Preserva tu producto con IC-Light)
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'marble' as const, name: '🏛️ Mármol Blanco & Luz de Mañana' },
                        { id: 'neon-podium' as const, name: '⚡ Podio Oscuro con Luz Neón' },
                        { id: 'luxury-wood' as const, name: '🪵 Mesa de Madera & Ambiente Cálido' },
                        { id: 'sunlight-nature' as const, name: '🌿 Piedra Orgánica & Hojas Naturales' },
                        { id: 'urban-minimal' as const, name: '🏙️ Concreto Arquitectónico Minimal' }
                      ].map(sc => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => setSelectedScene(sc.id)}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-all',
                            selectedScene === sc.id
                              ? 'border-zinc-950 bg-zinc-50 text-zinc-950'
                              : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                          )}
                        >
                          <span>{sc.name}</span>
                          {selectedScene === sc.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={customScenePrompt}
                      onChange={e => setCustomScenePrompt(e.target.value)}
                      placeholder="O escribe cómo quieres editar la foto..."
                      className="w-full h-8.5 px-3 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEnhancePhoto('generate-scene')}
                        disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                        className="h-8.5 px-3 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                      >
                        {isProcessingPhoto ? 'Procesando...' : 'Generar Escenario'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEnhancePhoto('edit-photo')}
                        disabled={isProcessingPhoto || !customScenePrompt.trim()}
                        className="h-8.5 px-3 bg-white border border-zinc-950 hover:bg-zinc-50 disabled:opacity-50 text-zinc-950 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                      >
                        Editar con Prompt
                      </button>
                    </div>

                    {enhancedPhotoUrl && (
                      <button
                        type="button"
                        onClick={handleSetPrimaryPhoto}
                        className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar como Portada Oficial del Producto</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ━━ COLUMNA CENTRAL: LIENZO DE PREVISUALIZACIÓN 9:16 + TIMELINE DE ESCENAS ━━ */}
          <section className="flex-1 min-w-0 bg-[#F4F4F5] flex flex-col justify-between overflow-hidden relative">
            {/* Barra Flotante Superior del Lienzo */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-200/70 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-extrabold text-zinc-900 uppercase tracking-wider">
                  {currentScene.title}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">
                  ({currentScene.range})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={cn(
                    'h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer',
                    isVoiceActive
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  )}
                >
                  <Volume2 className={cn('w-3.5 h-3.5', isVoiceActive && 'animate-pulse')} />
                  <span>{isVoiceActive ? 'Locución IA Activa' : 'Escuchar Locución IA'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="h-7 w-7 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 flex items-center justify-center cursor-pointer transition-colors"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Escenario Central con Smartphone 9:16 */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-y-auto">
              <div className="relative w-[275px] sm:w-[295px] aspect-[9/16] bg-zinc-950 rounded-[32px] p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] border-2 border-zinc-800 flex flex-col">
                {/* Pantalla interna 9:16 */}
                <div className="relative flex-1 rounded-[24px] overflow-hidden bg-zinc-900 flex flex-col justify-between p-3.5 text-white">
                  {/* CAPA DE FONDO: SPLIT 50/50 | VIDEO 3D | GALERÍA MULTICAPA */}
                  {avatarLayout === 'SPLIT_UGC' ? (
                    <div className="absolute inset-0 flex flex-col">
                      <div className="relative h-1/2 w-full overflow-hidden bg-zinc-950">
                        {avatarVideoUrl ? (
                          <video
                            src={avatarVideoUrl}
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={selectedAvatar.imageUrl}
                            alt={selectedAvatar.name}
                            className={cn(
                              'w-full h-full object-cover transition-transform duration-1000',
                              isPlaying ? 'scale-105' : 'scale-100'
                            )}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
                        <div className="absolute bottom-2 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] font-bold text-white flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>
                            {selectedAvatar.name} • {avatarVideoUrl ? 'Lip-Sync IA' : 'Vocero UGC'}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-1/2 w-full overflow-hidden bg-zinc-900">
                        {generatedVideoUrl ? (
                          <video
                            src={generatedVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : activeSlideUrl ? (
                          <img
                            src={activeSlideUrl}
                            alt=""
                            className={cn(
                              'w-full h-full object-cover transition-transform duration-1000',
                              isPlaying ? 'scale-110' : 'scale-100'
                            )}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      </div>
                    </div>
                  ) : generatedVideoUrl ? (
                    <div className="absolute inset-0 overflow-hidden bg-zinc-950">
                      <video
                        src={generatedVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/90" />
                    </div>
                  ) : activeSlideUrl ? (
                    <div
                      className={cn(
                        'absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out',
                        isPlaying ? 'scale-110' : 'scale-100'
                      )}
                      style={{ backgroundImage: `url(${activeSlideUrl})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/90" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-zinc-700" />
                    </div>
                  )}

                  {/* BURBUJA PIP DEL AVATAR */}
                  {avatarLayout === 'BUBBLE_PIP' && (
                    <div className="absolute bottom-24 left-3 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 pr-3 rounded-full border border-white/25 shadow-xl">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400 bg-zinc-900">
                          {avatarVideoUrl ? (
                            <video
                              src={avatarVideoUrl}
                              autoPlay
                              loop
                              muted={isMuted}
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img src={selectedAvatar.imageUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-ping" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-white block leading-none">
                          {selectedAvatar.name}
                        </span>
                        <span className="text-[8px] font-semibold text-emerald-400 block mt-0.5">
                          {avatarVideoUrl ? 'Lip-Sync Activo' : 'Presentador IA'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CABECERA DE TIENDA EN EL REEL */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                      <div className="w-4.5 h-4.5 rounded-full bg-white text-zinc-950 flex items-center justify-center text-[9px] font-black">
                        {store.name.charAt(0)}
                      </div>
                      <span className="text-[10.5px] font-bold text-white truncate max-w-[115px]">
                        {store.name}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    </div>

                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider text-white border border-white/15">
                      {allSlides.length > 1 ? `${allSlides.length} Tomas` : '9:16 HD'}
                    </span>
                  </div>

                  {/* SUBTÍTULOS DINÁMICOS / GANCHO SEGÚN ESCENA */}
                  <div className="relative z-10 text-center my-auto px-1">
                    {previewSecond <= 3 ? (
                      <div className="animate-in zoom-in-95 duration-200">
                        <span className="inline-block bg-amber-400 text-zinc-950 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-tight shadow-lg border border-amber-300">
                          {generatedData?.hook || '¡OFERTA IMPERDIBLE HOY! 🔥'}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-black/80 backdrop-blur-md py-2 px-3 rounded-xl border border-white/15 shadow-xl">
                        {(() => {
                          const fullText = (generatedData?.script || selectedProduct?.name || '').replace(/[*#_~`]/g, '')
                          const words = fullText.split(/\s+/).filter(Boolean)
                          const activeWordIdx = Math.min(
                            Math.floor(((previewSecond - 3) / Math.max(1, maxSeconds - 3)) * words.length),
                            Math.max(0, words.length - 1)
                          )
                          const windowSize = 4
                          const chunkIdx = Math.floor(activeWordIdx / windowSize)
                          const start = chunkIdx * windowSize
                          const visible = words.slice(start, start + windowSize)

                          return (
                            <div>
                              <div className="flex flex-wrap items-center justify-center gap-1.5 font-bold text-xs leading-tight">
                                {visible.map((w, idx) => {
                                  const isCur = start + idx === activeWordIdx
                                  return (
                                    <span
                                      key={idx}
                                      className={cn(
                                        'transition-all duration-150 uppercase tracking-tight',
                                        isCur
                                          ? 'text-yellow-400 scale-105 font-black underline decoration-yellow-400 decoration-2'
                                          : 'text-white font-bold'
                                      )}
                                    >
                                      {w}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  {/* FOOTER DEL REEL: PRECIO + CUPÓN + CTA */}
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider block">
                          Precio Oficial
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-black text-white leading-none">
                            {selectedProduct ? formatCOP(selectedProduct.price) : '$0'}
                          </span>
                          {selectedCoupon && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-500 text-white rounded">
                              -{selectedCoupon.valor}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-white border border-white/10">
                        <Clock className="w-2.5 h-2.5 text-amber-300" />
                        <span>Envío Rápido</span>
                      </div>
                    </div>

                    <div className="w-full py-2 bg-emerald-400 text-zinc-950 font-black text-[11px] rounded-lg flex items-center justify-center gap-1.5 shadow-md">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="truncate px-1">
                        {generatedData?.callToAction || 'Comprar Ahora en 1 Clic'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ━━ TIMELINE DE 4 ESCENAS EN LA BASE DEL LIENZO ━━ */}
            <div className="bg-white border-t border-zinc-200 px-4 py-3 space-y-2.5 shrink-0 z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white flex items-center justify-center cursor-pointer transition-all"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                  <span className="text-xs font-extrabold text-zinc-950 font-mono tabular-nums">
                    00:{previewSecond.toString().padStart(2, '0')}{' '}
                    <span className="text-zinc-400 font-normal">/ 00:{maxSeconds}</span>
                  </span>
                </div>

                <span className="text-[10.5px] font-semibold text-zinc-500 hidden sm:block">
                  Haz clic en cualquier escena para previsualizar ese corte
                </span>
              </div>

              {/* Pista de 4 bloques de escena */}
              <div className="grid grid-cols-4 gap-2">
                {scenes.map(sc => {
                  const isCurrent = currentScene.id === sc.id
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setPreviewSecond(sc.startSec)}
                      className={cn(
                        'p-2 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden',
                        isCurrent
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-2xs'
                          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800'
                      )}
                    >
                      <span className="text-[10.5px] font-bold block truncate">{sc.title}</span>
                      <span
                        className={cn(
                          'text-[9.5px] font-mono block mt-0.5',
                          isCurrent ? 'text-zinc-300' : 'text-zinc-400'
                        )}
                      >
                        {sc.range}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* ━━ COLUMNA DERECHA: INSPECTOR DE ESCENAS, GUION EN VIVO Y PUBLICACIÓN ━━ */}
          <aside className="w-full lg:w-[360px] xl:w-[390px] shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-zinc-200 flex flex-col h-full overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-zinc-700" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                  Inspector de Escenas & Guion
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleGenerateContent()}
                disabled={isGenerating || !selectedProduct}
                className="h-7 px-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={cn('w-3 h-3', isGenerating && 'animate-spin')} />
                <span>{isGenerating ? 'Generando...' : 'Regenerar IA'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Edición directa de las escenas del video */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center justify-between mb-1">
                    <span>Escena 1: Gancho Inicial (0s – 3s)</span>
                    <span className="text-[9.5px] font-semibold text-zinc-400">En pantalla</span>
                  </label>
                  <input
                    type="text"
                    value={generatedData?.hook || ''}
                    onChange={e => handleUpdateGeneratedData({ hook: e.target.value })}
                    placeholder="Ej: ¡Oferta relámpago por 24 horas! 🔥"
                    className="w-full h-8.5 px-3 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 focus:bg-white focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center justify-between mb-1">
                    <span>Escenas 2 y 3: Locución IA & Subtítulos</span>
                    <span className="text-[9.5px] font-semibold text-zinc-400">Voz + Karaoke</span>
                  </label>
                  <textarea
                    rows={4}
                    value={generatedData?.script || ''}
                    onChange={e => handleUpdateGeneratedData({ script: e.target.value })}
                    placeholder="Escribe o edita el guion que pronunciará la voz de IA..."
                    className="w-full p-2.5 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Escena 4: Botón CTA
                    </label>
                    <input
                      type="text"
                      value={generatedData?.callToAction || ''}
                      onChange={e => handleUpdateGeneratedData({ callToAction: e.target.value })}
                      className="w-full h-8.5 px-2.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 focus:bg-white focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Cupón en Pantalla
                    </label>
                    <select
                      value={selectedCouponId}
                      onChange={e => setSelectedCouponId(e.target.value)}
                      className="w-full h-8.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950"
                    >
                      <option value="">Sin cupón</option>
                      {coupons.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.code} (-{c.valor})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Copys para acompañar el video en WhatsApp / Instagram */}
              <div className="pt-3 border-t border-zinc-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900">
                    Texto Acompañante (Caption)
                  </span>
                  <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-md border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setInspectorCopyTab('whatsapp')}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all',
                        inspectorCopyTab === 'whatsapp'
                          ? 'bg-white text-zinc-950 shadow-2xs'
                          : 'text-zinc-500'
                      )}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorCopyTab('instagram')}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all',
                        inspectorCopyTab === 'instagram'
                          ? 'bg-white text-zinc-950 shadow-2xs'
                          : 'text-zinc-500'
                      )}
                    >
                      IG / TikTok
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={
                    inspectorCopyTab === 'whatsapp'
                      ? generatedData?.copyWhatsApp || ''
                      : generatedData?.copyInstagram || ''
                  }
                  onChange={e =>
                    handleUpdateGeneratedData(
                      inspectorCopyTab === 'whatsapp'
                        ? { copyWhatsApp: e.target.value }
                        : { copyInstagram: e.target.value }
                    )
                  }
                  className="w-full p-2.5 text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:bg-white focus:outline-none focus:border-zinc-950 resize-none leading-relaxed"
                />

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      (inspectorCopyTab === 'whatsapp'
                        ? generatedData?.copyWhatsApp
                        : generatedData?.copyInstagram) || '',
                      inspectorCopyTab
                    )
                  }
                  className="w-full h-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedKey === inspectorCopyTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¡Texto copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Copiar texto para {inspectorCopyTab === 'whatsapp' ? 'WhatsApp' : 'Instagram'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer fijo de Exportación y Envío */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/60 space-y-2 shrink-0">
              {isRenderingVideo && (
                <div className="space-y-1 pb-1">
                  <div className="flex justify-between text-[10.5px] font-bold text-zinc-800">
                    <span>Renderizando capas de video 1080×1920...</span>
                    <span>{renderProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-950 transition-all duration-200"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleDownloadVideo}
                disabled={isRenderingVideo || !generatedData}
                className="w-full h-9.5 px-4 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {isRenderingVideo
                    ? `Exportando Video (${renderProgress}%)...`
                    : 'Descargar Video MP4 HD (1080×1920)'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowSocialModal(true)}
                  className="h-8.5 px-2.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <SiInstagram className="w-3 h-3 text-[#E1306C]" />
                  <SiFacebook className="w-3 h-3 text-[#1877F2]" />
                  <span>Publicar IG / FB</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePublishWhatsApp('STATUS')}
                  disabled={isPublishing || !generatedData}
                  className="h-8.5 px-2.5 bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-50 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Estado WhatsApp</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* ── MODOS SECUNDARIOS CON SCROLL PROPIO DENTRO DEL ESTUDIO ──────── */
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {mainTab === 'foto' ? (
              <FotoStudioTab
                products={products}
                selectedProduct={selectedProduct}
                onSelectProduct={p => {
                  setSelectedProduct(p)
                  setEnhancedPhotoUrl(null)
                }}
                enhancedPhotoUrl={enhancedPhotoUrl}
                onSelectEnhancedPhoto={setEnhancedPhotoUrl}
                photoHistory={photoHistory}
                isProcessingPhoto={isProcessingPhoto}
                photoActionType={photoActionType}
                selectedScene={selectedScene}
                onSelectScene={setSelectedScene}
                customScenePrompt={customScenePrompt}
                onChangeCustomScenePrompt={setCustomScenePrompt}
                onEnhancePhoto={handleEnhancePhoto}
                onSetPrimaryPhoto={handleSetPrimaryPhoto}
              />
            ) : mainTab === 'contenido' ? (
              <ContenidoTab
                products={products}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                tone={tone}
                onChangeTone={setTone}
                selectedCouponId={selectedCouponId}
                onChangeCouponId={setSelectedCouponId}
                coupons={coupons}
                isGenerating={isGenerating}
                onGenerateContent={handleGenerateContent}
                generatedData={generatedData}
                copyFramework={copyFramework}
                onChangeCopyFramework={setCopyFramework}
                copiedKey={copiedKey}
                onCopyText={handleCopyText}
                isPublishing={isPublishing}
                onPublishWhatsApp={handlePublishWhatsApp}
                storeWhatsapp={store.whatsapp}
              />
            ) : (
              <CreacionesTab
                savedCreations={savedCreations}
                onNewCreation={() => setMainTab('video')}
                onCopyText={handleCopyText}
                onRepublish={handleRepublish}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal de Publicación Multicanal (Instagram, Facebook y WhatsApp) */}
      <SocialPublishModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        storeName={store.name}
        storeSlug={store.slug}
        whatsappConnected={store.whatsappConnected}
        metaSocial={metaSocialState}
        onMetaUpdated={next => setMetaSocialState(next)}
        product={selectedProduct}
        mediaUrl={
          lastRenderedVideoUrl ||
          generatedVideoUrl ||
          avatarVideoUrl ||
          enhancedPhotoUrl ||
          selectedProduct?.imageUrl?.split(',')[0]?.trim() ||
          null
        }
        mediaType={
          lastRenderedVideoUrl || generatedVideoUrl || avatarVideoUrl
            ? 'video'
            : 'image'
        }
        initialCaption={
          generatedData?.copyInstagram ||
          generatedData?.copyWhatsApp ||
          selectedProduct?.description ||
          ''
        }
        hookText={generatedData?.hook}
        hashtags={generatedData?.hashtags}
        onPublishedSuccess={creation => {
          setSavedCreations(prev => [creation, ...prev])
        }}
      />
    </div>
  )
}
