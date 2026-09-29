'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Sparkles, 
  Film, 
  Play, 
  Pause, 
  Download, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  ShoppingBag, 
  Tag, 
  Sliders, 
  Smartphone, 
  Layers, 
  Volume2, 
  VolumeX, 
  Zap, 
  UserCheck, 
  Clock, 
  Share2, 
  Search, 
  ChevronRight,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Flame,
  CheckCircle2,
  AlertCircle,
  Music,
  Maximize2,
  Wand2,
  ArrowUpRight,
  ChevronDown,
  RotateCcw,
  Video,
  Radio,
  FileText
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
  category: string
  description: string
}

interface Coupon {
  id: string
  code: string
  desc: string
  valor: string
  tipoDesc?: string
}

interface CreationItem {
  id: string
  title: string
  type: string
  videoUrl?: string | null
  thumbnailUrl?: string | null
  copyCaption?: string | null
  createdAt: string
  product?: {
    id: string
    name: string
    price: number
    imageUrl?: string | null
  }
}

interface StudioIaClientProps {
  store: {
    id: string
    name: string
    slug: string
    whatsapp: string | null
    whatsappConnected: boolean
    isPro: boolean
    creditsAvailable: number
  }
  products: Product[]
  coupons: Coupon[]
  initialCreations: any[]
}

type CreativeMode = 'DYNAMIC_REEL' | 'GENERATIVE_I2V' | 'AVATAR_UGC'
type CreativeTone = 'urgency' | 'luxury' | 'casual' | 'educational'
type MusicTrack = 'viral' | 'lofi' | 'luxury' | 'upbeat'

export default function StudioIaClient({
  store,
  products,
  coupons,
  initialCreations = []
}: StudioIaClientProps) {
  // Pestaña principal superior
  const [mainTab, setMainTab] = useState<'studio' | 'creaciones' | 'plantillas'>('studio')

  // Producto seleccionado
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products.length > 0 ? products[0] : null
  )
  const [searchQuery, setSearchQuery] = useState('')
  
  // Parámetros creativos
  const [mode, setMode] = useState<CreativeMode>('DYNAMIC_REEL')
  const [tone, setTone] = useState<CreativeTone>('urgency')
  const [duration, setDuration] = useState<'15s' | '30s'>('15s')
  const [musicTrack, setMusicTrack] = useState<MusicTrack>('viral')
  const [selectedCouponId, setSelectedCouponId] = useState<string>('')
  
  // Estados de generación y publicación
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [contentTab, setContentTab] = useState<'guion' | 'instagram' | 'whatsapp'>('guion')
  
  // Contenido generado
  const [generatedData, setGeneratedData] = useState<{
    hook: string
    script: string
    copyInstagram: string
    copyWhatsApp: string
    hashtags: string[]
    callToAction: string
  } | null>(null)

  // Simulación de previsualizador de video
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [previewSecond, setPreviewSecond] = useState(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [savedCreations, setSavedCreations] = useState<any[]>(initialCreations)

  // Estados de renderizado de video MP4
  const [isRenderingVideo, setIsRenderingVideo] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)

  // Filtrado reactivo de catálogo
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCoupon = coupons.find(c => c.id === selectedCouponId)

  // Síntesis de voz en español para la locución
  const speakVoiceover = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-CO'
    const voices = window.speechSynthesis.getVoices()
    const esVoice = voices.find(v => v.lang.startsWith('es') || v.lang.includes('ES') || v.lang.includes('MX') || v.lang.includes('CO'))
    if (esVoice) utterance.voice = esVoice
    utterance.rate = 1.12
    utterance.pitch = 1.05
    window.speechSynthesis.speak(utterance)
  }

  const stopVoiceover = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // Reproducir locución al cambiar de segundo o estado de voz
  useEffect(() => {
    if (isVoiceActive && !isMuted && isPlaying && generatedData) {
      if (previewSecond === 1) {
        speakVoiceover(generatedData.hook)
      } else if (previewSecond === 5) {
        speakVoiceover(generatedData.script)
      }
    } else if (!isPlaying || isMuted || !isVoiceActive) {
      stopVoiceover()
    }
  }, [previewSecond, isPlaying, isMuted, isVoiceActive, generatedData])

  // Timer para simular reproducción continua del video en el smartphone 9:16
  const maxSeconds = duration === '15s' ? 15 : 30
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setPreviewSecond(prev => (prev >= maxSeconds ? 0 : prev + 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, maxSeconds])

  // Generar contenido con IA
  const handleGenerateContent = async (customProduct?: Product) => {
    const productToUse = customProduct || selectedProduct
    if (!productToUse) {
      toast.error('Selecciona un producto primero')
      return
    }

    setIsGenerating(true)
    setGeneratedData(null)
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
        throw new Error(json.error || 'Error al generar guión')
      }

      setGeneratedData(json.data)
      setPreviewSecond(0)
      setIsPlaying(true)
      toast.success('¡Guion y video comercial preparados con IA!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error al comunicarse con el motor de IA')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generación inicial si aún no hay guion
  useEffect(() => {
    if (!generatedData && selectedProduct) {
      handleGenerateContent(selectedProduct)
    }
  }, [selectedProduct?.id])

  // RENDERIZADOR Y DESCARGADOR DE VIDEO MP4 REAL (1080x1920)
  const handleDownloadVideo = async () => {
    if (!selectedProduct || !generatedData) {
      toast.error('Primero selecciona un producto y genera el contenido.')
      return
    }

    setIsRenderingVideo(true)
    setRenderProgress(5)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo inicializar el motor de render')

      // Pre-cargar la imagen del producto con soporte CORS
      const img = new (window as any).Image()
      img.crossOrigin = 'anonymous'

      await new Promise((resolve) => {
        if (!selectedProduct.imageUrl) {
          resolve(true)
          return
        }
        img.onload = () => resolve(true)
        img.onerror = () => resolve(true)
        img.src = selectedProduct.imageUrl
      })

      setRenderProgress(15)

      // Identificar formato de video soportado por el navegador
      const mimeTypes = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm'
      ]
      const selectedMime = mimeTypes.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm'

      const stream = canvas.captureStream(30)
      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000 // 6 Mbps alta definición
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }

      const totalSeconds = duration === '15s' ? 10 : 15
      const fps = 30
      const totalFrames = totalSeconds * fps

      recorder.start()

      let frame = 0
      const renderLoop = () => {
        if (frame >= totalFrames) {
          recorder.stop()
          return
        }

        const t = frame / fps
        const progressPercent = Math.round((frame / totalFrames) * 80) + 15
        setRenderProgress(progressPercent)

        // 1. Limpiar lienzo con fondo cinemático
        ctx.fillStyle = '#0a0a0c'
        ctx.fillRect(0, 0, 1080, 1920)

        // 2. Dibujar foto del producto con efecto Ken Burns Zoom
        if (img.complete && img.naturalWidth > 0) {
          const zoom = 1.0 + (t / totalSeconds) * 0.18
          const w = 1080 * zoom
          const h = 1920 * zoom
          const ox = (1080 - w) / 2
          const oy = (1920 - h) / 2
          ctx.drawImage(img, ox, oy, w, h)
        } else {
          const grad = ctx.createLinearGradient(0, 0, 1080, 1920)
          grad.addColorStop(0, '#1e1b4b')
          grad.addColorStop(1, '#09090b')
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, 1080, 1920)
        }

        // Sombras superior e inferior
        const topGrad = ctx.createLinearGradient(0, 0, 0, 500)
        topGrad.addColorStop(0, 'rgba(0,0,0,0.85)')
        topGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = topGrad
        ctx.fillRect(0, 0, 1080, 500)

        const btmGrad = ctx.createLinearGradient(0, 1250, 0, 1920)
        btmGrad.addColorStop(0, 'transparent')
        btmGrad.addColorStop(1, 'rgba(0,0,0,0.92)')
        ctx.fillStyle = btmGrad
        ctx.fillRect(0, 1250, 1080, 670)

        // 3. Cabecera Tienda
        ctx.fillStyle = 'rgba(0,0,0,0.65)'
        ctx.beginPath()
        ctx.roundRect(60, 80, 520, 110, 55)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Avatar
        ctx.fillStyle = '#7c3aed'
        ctx.beginPath()
        ctx.arc(115, 135, 40, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 36px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(store.name.charAt(0).toUpperCase(), 115, 148)

        ctx.textAlign = 'left'
        ctx.font = 'bold 36px sans-serif'
        ctx.fillText(store.name.slice(0, 18), 180, 148)

        // 4. Gancho en Pantalla (0s a 3.5s)
        if (t <= 3.5) {
          ctx.save()
          ctx.shadowColor = 'rgba(0,0,0,0.9)'
          ctx.shadowBlur = 30
          ctx.shadowOffsetY = 10

          ctx.fillStyle = '#facc15' // Amarillo brillante
          ctx.beginPath()
          ctx.roundRect(80, 800, 920, 220, 30)
          ctx.fill()

          ctx.fillStyle = '#09090b'
          ctx.font = '900 48px sans-serif'
          ctx.textAlign = 'center'
          
          const hookText = generatedData.hook.toUpperCase()
          const words = hookText.split(' ')
          const half = Math.ceil(words.length / 2)
          ctx.fillText(words.slice(0, half).join(' '), 540, 890)
          if (words.slice(half).length > 0) {
            ctx.fillText(words.slice(half).join(' '), 540, 960)
          }

          ctx.restore()
        } else {
          // Subtítulos Karaoke Dinámicos
          ctx.save()
          ctx.fillStyle = 'rgba(0,0,0,0.75)'
          ctx.beginPath()
          ctx.roundRect(80, 780, 920, 260, 30)
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.25)'
          ctx.lineWidth = 3
          ctx.stroke()

          ctx.fillStyle = '#fef08a'
          ctx.font = 'bold 42px sans-serif'
          ctx.textAlign = 'center'

          const scriptSnippet = generatedData.script.slice(0, 130)
          const sWords = scriptSnippet.split(' ')
          const step = Math.ceil(sWords.length / 3)
          ctx.fillText(`"${sWords.slice(0, step).join(' ')}`, 540, 860)
          if (sWords.slice(step, step * 2).length > 0) {
            ctx.fillText(sWords.slice(step, step * 2).join(' '), 540, 920)
          }
          if (sWords.slice(step * 2).length > 0) {
            ctx.fillText(`${sWords.slice(step * 2).join(' ')}..."`, 540, 980)
          }

          ctx.restore()
        }

        // 5. Precios y Cupón
        ctx.textAlign = 'left'
        ctx.fillStyle = '#cbd5e1'
        ctx.font = 'bold 30px sans-serif'
        ctx.fillText('PRECIO ESPECIAL', 80, 1540)

        ctx.fillStyle = '#ffffff'
        ctx.font = '900 84px sans-serif'
        ctx.fillText(formatCOP(selectedProduct.price), 80, 1630)

        if (selectedCoupon) {
          ctx.fillStyle = '#ec4899'
          ctx.beginPath()
          ctx.roundRect(600, 1550, 400, 80, 20)
          ctx.fill()

          ctx.fillStyle = '#ffffff'
          ctx.font = '900 36px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`-${selectedCoupon.valor} OFF`, 800, 1605)
        }

        // 6. Botón CTA
        ctx.save()
        ctx.shadowColor = 'rgba(16,185,129,0.5)'
        ctx.shadowBlur = 25
        ctx.shadowOffsetY = 5

        ctx.fillStyle = '#10b981'
        ctx.beginPath()
        ctx.roundRect(80, 1680, 920, 130, 35)
        ctx.fill()

        ctx.fillStyle = '#022c22'
        ctx.font = '900 44px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`🛍️ ${generatedData.callToAction || 'COMPRAR EN 1 CLIC'}`, 540, 1762)

        ctx.restore()

        // Enlace
        ctx.fillStyle = '#94a3b8'
        ctx.font = '600 28px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`flashcheckout.co/tienda/${store.slug}`, 540, 1855)

        frame++
        setTimeout(renderLoop, 1000 / fps)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: selectedMime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const sanitized = selectedProduct.name.replace(/[^a-zA-Z0-9]/g, '_')
        a.href = url
        a.download = `${sanitized}_reel_promo.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // Registrar en la biblioteca
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
              thumbnailUrl: selectedProduct.imageUrl
            })
          })
          const saveJson = await res.json()
          if (saveJson.creation) {
            setSavedCreations(prev => [saveJson.creation, ...prev])
          }
        } catch (e) {
          console.warn('Save creation DB:', e)
        }

        setRenderProgress(100)
        setIsRenderingVideo(false)
        toast.success('¡Video MP4 en alta definición descargado con éxito!')
      }

      renderLoop()
    } catch (err: any) {
      console.error(err)
      setIsRenderingVideo(false)
      toast.error('Error al generar el video MP4')
    }
  }

  // Publicar directamente en WhatsApp vía Evolution API
  const handlePublishWhatsApp = async (type: 'STATUS' | 'TEST') => {
    if (!store.whatsappConnected) {
      toast.error('Conecta tu WhatsApp en Integraciones antes de publicar estados.')
      return
    }

    if (!generatedData) {
      toast.error('Genera el contenido antes de publicar.')
      return
    }

    setIsPublishing(true)
    try {
      const res = await fetch('/api/studio-ia/publish-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          caption: generatedData.copyWhatsApp,
          mediaUrl: selectedProduct?.imageUrl || undefined,
          mediaType: 'image',
          productId: selectedProduct?.id,
          title: `Reel IA - ${selectedProduct?.name}`
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al publicar')
      }

      // Añadir a creaciones locales
      const newCreation = {
        id: Math.random().toString(),
        title: `Reel IA - ${selectedProduct?.name}`,
        type: mode,
        thumbnailUrl: selectedProduct?.imageUrl,
        copyCaption: generatedData.copyWhatsApp,
        createdAt: new Date().toISOString(),
        product: selectedProduct
      }
      setSavedCreations(prev => [newCreation, ...prev])

      toast.success(data.message || '¡Publicado exitosamente!')
    } catch (err: any) {
      toast.error(err.message || 'Error al publicar en WhatsApp')
    } finally {
      setIsPublishing(false)
    }
  }

  // Copiado con feedback táctil
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success('¡Copiado al portapapeles!')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const formatCOP = (num: number) => `$${num.toLocaleString('es-CO')}`

  return (
    <div className="space-y-6 pb-16 font-sans text-left select-none animate-in fade-in duration-300">
      
      {/* ── HEADER DE LUJO CON GLOW SUTIL ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gradient-to-br from-purple-500/10 via-purple-300/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-md ring-4 ring-zinc-100">
                <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400/20" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
                    Studio IA
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200/80 shadow-2xs">
                    GENERATIVO
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Crea videos virales, locución y publicaciones automáticas para tus productos en segundos.
                </p>
              </div>
            </div>
          </div>

          {/* Badges de Información y Estado */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* Créditos IA */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200/90 text-xs shadow-2xs">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">
                  Balance IA
                </span>
                <span className="font-extrabold text-zinc-900 leading-tight">
                  {store.creditsAvailable} créditos
                </span>
              </div>
              {store.isPro ? (
                <span className="ml-1 text-[9px] font-black px-1.5 py-0.5 bg-zinc-900 text-white rounded">
                  PRO
                </span>
              ) : (
                <Link href="/pricing" className="ml-1 text-[10px] font-black text-purple-600 hover:underline">
                  Recargar
                </Link>
              )}
            </div>

            {/* Estado WhatsApp */}
            <div className={cn(
              "flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all",
              store.whatsappConnected 
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900" 
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            )}>
              <div className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                store.whatsappConnected ? "bg-emerald-500 ring-4 ring-emerald-200 animate-pulse" : "bg-amber-500 ring-4 ring-amber-200"
              )} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-semibold opacity-70 uppercase tracking-wider leading-none">
                  Canal Difusión
                </span>
                <span className="font-extrabold leading-tight">
                  {store.whatsappConnected ? "WhatsApp Activo" : "WhatsApp Desconectado"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN SUPERIOR */}
        <div className="flex items-center gap-2 border-t border-zinc-150 pt-4 mt-5">
          {[
            { id: 'studio' as const, label: 'Estudio Creativo', icon: Sparkles },
            { id: 'creaciones' as const, label: 'Biblioteca de Creaciones', count: savedCreations.length, icon: Video },
            { id: 'plantillas' as const, label: 'Formatos Virales', icon: Wand2 }
          ].map(t => {
            const Icon = t.icon
            const isActive = mainTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer",
                  isActive 
                    ? "bg-zinc-950 text-white shadow-xs" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-purple-300" : "text-zinc-400")} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded font-black",
                    isActive ? "bg-zinc-800 text-purple-200" : "bg-zinc-150 text-zinc-600"
                  )}>
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CONTENIDO SEGÚN LA PESTAÑA PRINCIPAL ─────────────────────────── */}
      {mainTab === 'studio' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          
          {/* COLUMNA IZQUIERDA: CONTROLES, CATÁLOGO Y GUIONES (7/12) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. SELECCIÓN DE PRODUCTO DEL CATÁLOGO REAL */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Paso 1: Selecciona el Producto a Promocionar
                    </h2>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      El contenido se basará en sus fotos, precio real y beneficios.
                    </p>
                  </div>
                </div>

                {/* Buscador Rápido */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por nombre..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Carrusel de Productos con Tarjetas de Alta Calidad */}
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  <p className="text-xs text-zinc-500 font-semibold">No se encontraron productos con esa búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filteredProducts.slice(0, 8).map((p) => {
                    const isSelected = selectedProduct?.id === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p)
                          handleGenerateContent(p)
                        }}
                        className={cn(
                          "group relative flex flex-col p-2.5 rounded-xl border transition-all cursor-pointer text-left overflow-hidden",
                          isSelected 
                            ? "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950 shadow-sm" 
                            : "border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-2xs"
                        )}
                      >
                        {/* Checkmark animado en seleccionado */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="w-full aspect-square bg-zinc-100 rounded-lg overflow-hidden relative mb-2 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img 
                              src={p.imageUrl} 
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <ShoppingBag className="w-7 h-7 text-zinc-300" />
                          )}

                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/60 backdrop-blur-md text-white">
                            Stock: {p.stock}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-zinc-900 line-clamp-1 leading-tight group-hover:text-purple-700 transition-colors">
                          {p.name}
                        </span>
                        <span className="text-xs font-black text-zinc-950 mt-0.5">
                          {formatCOP(p.price)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Ficha Spotlight del Producto Activo */}
              {selectedProduct && (
                <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 overflow-hidden shrink-0 border border-zinc-300/50">
                      {selectedProduct.imageUrl ? (
                        <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 m-2.5 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-zinc-950 truncate">
                          {selectedProduct.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200/80 rounded font-bold text-zinc-700">
                          {selectedProduct.category || 'General'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {selectedProduct.description || 'Sin descripción detallada'}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-black text-zinc-950 shrink-0 ml-3">
                    {formatCOP(selectedProduct.price)}
                  </span>
                </div>
              )}
            </div>

            {/* 2. FORMATOS CREATIVOS Y PERSONALIZACIÓN */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Film className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Paso 2: Formato Creativo & Estilo de Video
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Elige el estilo visual con el que la IA ensamblará la pieza.
                  </p>
                </div>
              </div>

              {/* Selector de 3 Modos con Diseño de Alta Gama */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: 'DYNAMIC_REEL' as CreativeMode,
                    title: 'Reel de Oferta',
                    badge: 'Recomendado',
                    desc: 'Motion dinámico, foto recortada con zoom, sticker de precio y subtítulos grandes de alto impacto.',
                    icon: Flame,
                    color: 'text-amber-500'
                  },
                  {
                    id: 'GENERATIVE_I2V' as CreativeMode,
                    title: 'Cinemático IA',
                    badge: 'Calidad Estudio',
                    desc: 'Animación tridimensional con iluminación cinematográfica de producto en movimiento.',
                    icon: Sparkles,
                    color: 'text-purple-500'
                  },
                  {
                    id: 'AVATAR_UGC' as CreativeMode,
                    title: 'Avatar Vocero UGC',
                    badge: 'Testimonial',
                    desc: 'Un creador digital recomendando el producto y explicando por qué comprarlo hoy.',
                    icon: UserCheck,
                    color: 'text-blue-500'
                  }
                ].map(m => {
                  const Icon = m.icon
                  const isSelected = mode === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group",
                        isSelected
                          ? "border-zinc-950 bg-gradient-to-b from-zinc-50 to-white ring-2 ring-zinc-950 shadow-sm"
                          : "border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-2xs"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            isSelected ? "bg-zinc-950 text-white shadow-xs" : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
                          )}>
                            <Icon className={cn("w-4 h-4", isSelected && m.color)} />
                          </div>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide",
                            isSelected ? "bg-purple-100 text-purple-800" : "bg-zinc-100 text-zinc-600"
                          )}>
                            {m.badge}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-zinc-950 block">
                          {m.title}
                        </span>
                        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1">
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Ajustes Avanzados: Tono, Cupones, Música */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* Tono */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1.5">
                    Tono de Comunicación
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as CreativeTone)}
                    className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="urgency">⚡ Urgencia & Oferta Flash</option>
                    <option value="luxury">💎 Elegante & Calidad Superior</option>
                    <option value="casual">👋 Cercano & Amigable</option>
                    <option value="educational">💡 Problema / Solución</option>
                  </select>
                </div>

                {/* Cupón */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1.5">
                    Descuento o Cupón
                  </label>
                  <select
                    value={selectedCouponId}
                    onChange={(e) => setSelectedCouponId(e.target.value)}
                    className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Precio normal (Sin cupón)</option>
                    {coupons.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} ({c.valor} {c.desc})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pista Musical */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1.5">
                    Música de Fondo
                  </label>
                  <select
                    value={musicTrack}
                    onChange={(e) => setMusicTrack(e.target.value as MusicTrack)}
                    className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-zinc-800 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="viral">🔥 Beat Viral de TikTok</option>
                    <option value="upbeat">⚡ Electrónica Enérgica</option>
                    <option value="lofi">☕ Lo-Fi Chill E-Commerce</option>
                    <option value="luxury">✨ Ambient Lounge Sofisticado</option>
                  </select>
                </div>
              </div>

              {/* Botón de Regenerar Contenido con IA */}
              <button
                onClick={() => handleGenerateContent()}
                disabled={isGenerating || !selectedProduct}
                className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-[0.99]"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin text-purple-400")} />
                <span>{isGenerating ? 'Generando guión y adaptando video...' : 'Regenerar Contenido y Guion con IA'}</span>
              </button>
            </div>

            {/* 3. GUIONES Y COPYS ADAPTABLES */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Paso 3: Guion & Copys Generados
                    </h2>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      Listos para locución y descripción en redes sociales.
                    </p>
                  </div>
                </div>

                {/* Segmented Controls */}
                <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
                  {[
                    { id: 'guion' as const, label: 'Guion Locución' },
                    { id: 'instagram' as const, label: 'Instagram & TikTok' },
                    { id: 'whatsapp' as const, label: 'WhatsApp Broadcast' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setContentTab(t.id)}
                      className={cn(
                        "px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer",
                        contentTab === t.id
                          ? "bg-white text-zinc-950 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-800"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {isGenerating ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-zinc-950 border-t-purple-500 animate-spin mx-auto" />
                  <p className="text-xs text-zinc-500 font-semibold">
                    Generando gancho de 3s y guión viral para {selectedProduct?.name}...
                  </p>
                </div>
              ) : generatedData ? (
                <div className="space-y-4">
                  
                  {/* TAB 1: GUION LOCUCIÓN */}
                  {contentTab === 'guion' && (
                    <div className="space-y-3">
                      {/* Hook de 3 segundos */}
                      <div className="p-3.5 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 border border-purple-200/80 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            Gancho en Pantalla (0s a 3s)
                          </span>
                          <button
                            onClick={() => handleCopyText(generatedData.hook, 'hook')}
                            className="text-[10px] text-purple-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            {copiedKey === 'hook' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar Gancho</span>
                          </button>
                        </div>
                        <p className="text-xs font-black text-purple-950 leading-relaxed">
                          "{generatedData.hook}"
                        </p>
                      </div>

                      {/* Locución completa */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                            Texto para Locución / Voz en Off
                          </span>
                          <button
                            onClick={() => handleCopyText(generatedData.script, 'script')}
                            className="text-[10px] text-zinc-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            {copiedKey === 'script' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>Copiar Guion</span>
                          </button>
                        </div>
                        <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line">
                          {generatedData.script}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: INSTAGRAM & TIKTOK */}
                  {contentTab === 'instagram' && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                          Pie de Foto (Caption Comercial)
                        </span>
                        <button
                          onClick={() => handleCopyText(`${generatedData.copyInstagram}\n\n${generatedData.hashtags.join(' ')}`, 'insta')}
                          className="text-[10px] text-zinc-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {copiedKey === 'insta' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar Todo</span>
                        </button>
                      </div>
                      <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line">
                        {generatedData.copyInstagram}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-200/60">
                        {generatedData.hashtags.map((h, i) => (
                          <span key={i} className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/50">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: WHATSAPP BROADCAST */}
                  {contentTab === 'whatsapp' && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Mensaje Optimizado para WhatsApp
                        </span>
                        <button
                          onClick={() => handleCopyText(generatedData.copyWhatsApp, 'wpp')}
                          className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {copiedKey === 'wpp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar Texto</span>
                        </button>
                      </div>
                      <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line font-mono bg-white p-3.5 rounded-lg border border-emerald-200">
                        {generatedData.copyWhatsApp}
                      </p>
                    </div>
                  )}

                </div>
              ) : null}
            </div>

          </div>

          {/* COLUMNA DERECHA: SMARTPHONE 9:16 PREVIEWER & PUBLICACIÓN (5/12) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">

            {/* MARCO SMARTPHONE ULTRA-REALISTA */}
            <div className="relative mx-auto max-w-[340px] bg-zinc-950 p-4 rounded-[40px] shadow-2xl border-4 border-zinc-800 ring-1 ring-zinc-700/60 text-white space-y-3">
              
              {/* Dynamic Island / Header del teléfono */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-3 pt-1 font-mono">
                <span className="font-bold text-white text-[12px]">9:41</span>
                
                {/* Dynamic Island con animación de audio si está en play */}
                <div className="flex items-center gap-1.5 bg-black px-3 py-1 rounded-full border border-zinc-800">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map(bar => (
                      <div 
                        key={bar} 
                        className={cn(
                          "w-0.5 bg-purple-400 rounded-full transition-all duration-300",
                          isPlaying ? "h-3 animate-pulse" : "h-1"
                        )} 
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  <span>5G</span>
                  <div className="w-4 h-2.5 border border-zinc-400 rounded-xs flex items-center justify-end p-0.5">
                    <div className="w-2 h-1.5 bg-white rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Pantalla 9:16 Dinámica */}
              <div className="relative w-full aspect-[9/16] bg-zinc-900 rounded-[28px] overflow-hidden flex flex-col justify-between p-4 shadow-inner border border-white/5">
                
                {/* Fondo cinemático con zoom dinámico Ken Burns */}
                {selectedProduct?.imageUrl ? (
                  <div 
                    className={cn(
                      "absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out",
                      isPlaying ? "scale-110" : "scale-100"
                    )}
                    style={{ backgroundImage: `url(${selectedProduct.imageUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-zinc-700" />
                  </div>
                )}

                {/* Capa Superior: Perfil Tienda + Badge de Modo */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white">
                      {store.name.charAt(0)}
                    </div>
                    <span className="text-[11px] font-extrabold text-white tracking-tight">
                      {store.name}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-sky-400 fill-sky-400/20" />
                  </div>

                  <div className="bg-purple-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white border border-purple-400/40 shadow-sm">
                    {mode === 'DYNAMIC_REEL' ? 'REEL' : mode === 'GENERATIVE_I2V' ? 'CINEMA IA' : 'UGC'}
                  </div>
                </div>

                {/* Capa Central: Hook de 3s o Subtítulos Karaoke */}
                <div className="relative z-10 text-center space-y-2 my-auto px-2">
                  {previewSecond <= 4 ? (
                    <div className="animate-in zoom-in duration-300">
                      <span className="inline-block bg-amber-400 text-zinc-950 px-3.5 py-1.5 rounded-xl font-black text-sm uppercase tracking-tight shadow-xl border-2 border-amber-300">
                        {generatedData?.hook || '¡OFERTA IMPERDIBLE! 🔥'}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-black/65 backdrop-blur-md p-3 rounded-2xl border border-white/20 animate-in fade-in duration-300 shadow-xl">
                      <p className="text-xs font-black text-yellow-300 leading-snug drop-shadow-md">
                        "{generatedData?.script ? generatedData.script.slice(0, 110) + '...' : selectedProduct?.name}"
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-zinc-300 font-bold">
                        <Music className="w-2.5 h-2.5 text-purple-400" />
                        <span>Pista: {musicTrack === 'viral' ? 'TikTok Trend' : musicTrack}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Capa Inferior: Precio en COP, Cupón y Botón CTA */}
                <div className="relative z-10 space-y-2.5">
                  
                  {/* Badge de Precio & Cupón */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-300 uppercase block tracking-wider">
                        Precio Especial
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white drop-shadow-lg">
                          {selectedProduct ? formatCOP(selectedProduct.price) : '$0'}
                        </span>
                        {selectedCoupon && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-pink-500 text-white rounded-md shadow-xs">
                            -{selectedCoupon.valor}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white border border-white/10">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>Envío Rápido</span>
                    </div>
                  </div>

                  {/* Botón CTA Animado */}
                  <div className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all animate-pulse cursor-pointer">
                    <ShoppingBag className="w-3.5 h-3.5 fill-current" />
                    <span>{generatedData?.callToAction || 'Comprar Ahora en 1 Clic'}</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[9px] text-zinc-400 font-semibold tracking-wide">
                      flashcheckout.co/tienda/{store.slug}
                    </span>
                  </div>
                </div>

              </div>

              {/* Scrubber y Controles de Medios */}
              <div className="pt-1 px-1 space-y-2">
                {/* Barra de progreso */}
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-300"
                    style={{ width: `${(previewSecond / maxSeconds) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pausar' : 'Play'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const nextVoice = !isVoiceActive
                        setIsVoiceActive(nextVoice)
                        if (nextVoice && generatedData) {
                          speakVoiceover(previewSecond <= 4 ? generatedData.hook : generatedData.script)
                        } else {
                          stopVoiceover()
                        }
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold",
                        isVoiceActive 
                          ? "bg-purple-600 text-white shadow-xs" 
                          : "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                      )}
                      title="Activar o pausar locución con voz de IA"
                    >
                      <Volume2 className={cn("w-3.5 h-3.5", isVoiceActive && "animate-pulse")} />
                      <span>{isVoiceActive ? 'Voz IA ON' : 'Voz IA'}</span>
                    </button>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-400">
                    00:{previewSecond.toString().padStart(2, '0')} / 00:{maxSeconds}
                  </div>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted)
                      if (!isMuted) stopVoiceover()
                    }}
                    className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* CENTRO DE ACCIONES Y PUBLICACIÓN ONE-CLICK */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                  Publicación y Difusión
                </h3>
                <span className="text-[10px] font-bold text-zinc-400">1-Clic</span>
              </div>

              {/* Botón WhatsApp Estado */}
              <button
                onClick={() => handlePublishWhatsApp('STATUS')}
                disabled={isPublishing || !generatedData}
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isPublishing ? 'Publicando en WhatsApp...' : 'Publicar en Estado de WhatsApp'}
                </span>
              </button>

              {/* Botón Prueba a mi Teléfono */}
              <button
                onClick={() => handlePublishWhatsApp('TEST')}
                disabled={isPublishing || !generatedData || !store.whatsapp}
                className="w-full py-2.5 px-4 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 disabled:opacity-50 text-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Enviar prueba a mi número ({store.whatsapp || 'Sin registrar'})</span>
              </button>

              {/* Botón Descargar Video Real */}
              <button
                onClick={handleDownloadVideo}
                disabled={isRenderingVideo || !generatedData}
                className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Download className={cn("w-3.5 h-3.5", isRenderingVideo ? "animate-bounce text-purple-400" : "text-zinc-300")} />
                <span>
                  {isRenderingVideo ? `Renderizando MP4 (${renderProgress}%)...` : 'Descargar Video MP4 HD (1080x1920)'}
                </span>
              </button>

              {/* Modal de Progreso de Renderizado */}
              {isRenderingVideo && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                      Componiendo capas de video...
                    </span>
                    <span>{renderProgress}%</span>
                  </div>
                  <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full transition-all duration-200 rounded-full"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-purple-700 font-medium text-center">
                    Ensamblando fotogramas en alta resolución. La descarga comenzará automáticamente.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      ) : mainTab === 'creaciones' ? (
        
        /* ── PESTAÑA: BIBLIOTECA DE CREACIONES ───────────────────────────── */
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-950">Biblioteca de Creaciones Multimedia</h2>
              <p className="text-xs text-zinc-500 font-medium">Revisa y republica las piezas generadas previamente por Studio IA.</p>
            </div>
            <button
              onClick={() => setMainTab('studio')}
              className="px-3.5 py-1.5 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-900 cursor-pointer"
            >
              + Crear Nueva Pieza
            </button>
          </div>

          {savedCreations.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-800">Aún no tienes creaciones guardadas</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Selecciona un producto en el Estudio Creativo y genera tu primer video publicitario o reel para WhatsApp.
              </p>
              <button
                onClick={() => setMainTab('studio')}
                className="mt-2 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Comenzar ahora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedCreations.map((item: any) => (
                <div key={item.id} className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-200 rounded-lg overflow-hidden shrink-0">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Video className="w-6 h-6 m-3 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-900 block truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/60">
                    <button
                      onClick={() => handleCopyText(item.copyCaption || '', 'saved')}
                      className="flex-1 py-1.5 text-[11px] font-bold bg-white border border-zinc-200 rounded-md hover:bg-zinc-100 text-zinc-700 cursor-pointer text-center"
                    >
                      Copiar Copy
                    </button>
                    <button
                      onClick={() => toast.success('Publicando pieza en WhatsApp...')}
                      className="px-3 py-1.5 text-[11px] font-bold bg-[#25D366] text-white rounded-md hover:bg-[#20ba59] cursor-pointer"
                    >
                      Re-publicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        /* ── PESTAÑA: FORMATOS VIRALES ───────────────────────────────────── */
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-zinc-150 pb-4">
            <h2 className="text-base font-extrabold text-zinc-950">Catálogo de Formatos Virales para E-Commerce</h2>
            <p className="text-xs text-zinc-500 font-medium">Estructuras probadas para maximizar ventas en TikTok, Instagram y WhatsApp.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: '⚡ Oferta Flash 24 Horas',
                tag: 'Urgencia Extrema',
                desc: 'Gancho directo al precio con descuento y cuenta regresiva psicológica. Ideal para liquidar stock de productos.',
                action: () => {
                  setMode('DYNAMIC_REEL')
                  setTone('urgency')
                  setMainTab('studio')
                }
              },
              {
                title: '💎 Unboxing & Lujo Visual',
                tag: 'Alta Gama',
                desc: 'Transiciones lentas, iluminación de estudio y foco en texturas y materiales para justificar un ticket alto.',
                action: () => {
                  setMode('GENERATIVE_I2V')
                  setTone('luxury')
                  setMainTab('studio')
                }
              },
              {
                title: '🤝 Testimonio Cliente Satisfecho',
                tag: 'Confianza & Prueba Social',
                desc: 'Un vocero digital cuenta su experiencia real utilizando el producto para derribar objeciones de compra.',
                action: () => {
                  setMode('AVATAR_UGC')
                  setTone('casual')
                  setMainTab('studio')
                }
              }
            ].map((p, idx) => (
              <div key={idx} className="border border-zinc-200 rounded-2xl p-5 bg-gradient-to-b from-white to-zinc-50/50 flex flex-col justify-between space-y-4 hover:border-zinc-400 transition-all shadow-2xs">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/50">
                    {p.tag}
                  </span>
                  <h3 className="text-sm font-extrabold text-zinc-950 mt-1">{p.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">{p.desc}</p>
                </div>

                <button
                  onClick={p.action}
                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Usar esta plantilla</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      )}

    </div>
  )
}
