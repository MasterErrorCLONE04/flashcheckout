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
  Video,
  Radio,
  FileText,
  Camera,
  Scissors
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

export interface AiAvatar {
  id: string
  name: string
  niche: string
  badge: string
  imageUrl: string
  gender: 'female' | 'male'
  tone: string
}

export type AvatarLayout = 'BUBBLE_PIP' | 'SPLIT_UGC' | 'NONE'

export const AI_AVATARS: AiAvatar[] = [
  {
    id: 'sofia_ugc',
    name: 'Sofía',
    niche: 'Moda & Tendencias',
    badge: 'Más Popular',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    gender: 'female',
    tone: 'Espontánea & Fresca'
  },
  {
    id: 'carlos_tech',
    name: 'Carlos',
    niche: 'Tech & Gadgets',
    badge: 'Reviewer Pro',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    gender: 'male',
    tone: 'Analítico & Seguro'
  },
  {
    id: 'valentina_sales',
    name: 'Valentina',
    niche: 'Ofertas & Belleza',
    badge: 'Alta Conversión',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    gender: 'female',
    tone: 'Entusiasta & Enérgica'
  },
  {
    id: 'mateo_business',
    name: 'Mateo',
    niche: 'Lujo & Estilo',
    badge: 'Premium',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    gender: 'male',
    tone: 'Elegante & Convincente'
  }
]

export default function StudioIaClient({
  store,
  products,
  coupons,
  initialCreations = []
}: StudioIaClientProps) {
  // Pestañas principales del Studio IA completo: 'foto' | 'contenido' | 'video' | 'creaciones'
  const [mainTab, setMainTab] = useState<'foto' | 'contenido' | 'video' | 'creaciones'>('foto')

  // Estados de Foto Studio IA (Replicate / FLUX)
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string | null>(null)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [photoActionType, setPhotoActionType] = useState<'remove-bg' | 'generate-scene' | 'upscale' | null>(null)
  const [selectedScene, setSelectedScene] = useState<'marble' | 'neon-podium' | 'luxury-wood' | 'sunlight-nature' | 'urban-minimal'>('marble')
  const [customScenePrompt, setCustomScenePrompt] = useState('')
  const [isGeneratingI2V, setIsGeneratingI2V] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)

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
  
  // Sistema de Avatares de IA & Creadores UGC
  const [selectedAvatar, setSelectedAvatar] = useState<AiAvatar>(AI_AVATARS[0])
  const [avatarLayout, setAvatarLayout] = useState<AvatarLayout>('BUBBLE_PIP')
  
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
    copyAida?: { attention: string; interest: string; desire: string; action: string }
    copyPas?: { problem: string; agitation: string; solution: string }
    couponRecommendation?: string
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
  const [copyFramework, setCopyFramework] = useState<'aida' | 'pas'>('aida')

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

  // ── FOTO STUDIO IA HANDLERS ──────────────────────────────────────────
  const handleEnhancePhoto = async (action: 'remove-bg' | 'generate-scene' | 'upscale') => {
    if (!selectedProduct?.imageUrl) {
      toast.error('El producto seleccionado no tiene una imagen base.')
      return
    }

    setIsProcessingPhoto(true)
    setPhotoActionType(action)
    const toastId = toast.loading(
      action === 'remove-bg' 
        ? 'Removiendo fondo del producto con IA...' 
        : action === 'generate-scene' 
        ? 'Generando escenario fotográfico con IA...' 
        : 'Mejorando resolución a 4K con IA...'
    )

    try {
      const res = await fetch('/api/studio-ia/enhance-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          imageUrl: enhancedPhotoUrl || selectedProduct.imageUrl,
          productId: selectedProduct.id,
          sceneType: selectedScene,
          customPrompt: customScenePrompt || undefined
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar la foto con IA.')
      }

      setEnhancedPhotoUrl(data.resultUrl)
      toast.dismiss(toastId)
      toast.success(data.message || '¡Proceso fotográfico completado con éxito!')
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err.message || 'Error al conectar con el motor de IA.')
    } finally {
      setIsProcessingPhoto(false)
      setPhotoActionType(null)
    }
  }

  // Establecer foto mejorada como imagen principal del producto
  const handleSetPrimaryPhoto = async () => {
    if (!selectedProduct || !enhancedPhotoUrl) return
    const toastId = toast.loading('Guardando como foto principal del producto...')
    try {
      const res = await fetch('/api/studio-ia/enhance-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-primary',
          imageUrl: enhancedPhotoUrl,
          productId: selectedProduct.id
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al actualizar producto')

      selectedProduct.imageUrl = enhancedPhotoUrl
      toast.dismiss(toastId)
      toast.success('¡Foto de estudio establecida como portada oficial del producto!')
    } catch (e: any) {
      toast.dismiss(toastId)
      toast.error(e.message || 'No se pudo actualizar el producto')
    }
  }

  // ── VIDEO I2V HANDLER ──────────────────────────────────────────
  const handleGenerateI2V = async () => {
    if (!selectedProduct?.imageUrl) {
      toast.error('Elige un producto con imagen para generar video.')
      return
    }

    setIsGeneratingI2V(true)
    const toastId = toast.loading('Animando producto con IA (Image-to-Video)... Esto puede tomar unos segundos.')
    try {
      const res = await fetch('/api/studio-ia/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'i2v',
          imageUrl: enhancedPhotoUrl || selectedProduct.imageUrl,
          productId: selectedProduct.id
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al generar video')

      setGeneratedVideoUrl(data.videoUrl)
      toast.dismiss(toastId)
      toast.success('¡Video cinemático generado con éxito!')
    } catch (e: any) {
      toast.dismiss(toastId)
      toast.error(e.message || 'No se pudo generar el video')
    } finally {
      setIsGeneratingI2V(false)
    }
  }

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

      // Pre-cargar la imagen del producto con soporte CORS y fallback seguro
      let imageLoadFailed = false
      const img = new (window as any).Image()
      img.crossOrigin = 'anonymous'

      await new Promise((resolve) => {
        if (!selectedProduct.imageUrl) {
          imageLoadFailed = true
          resolve(true)
          return
        }
        img.onload = () => resolve(true)
        img.onerror = () => {
          console.warn('[Studio IA] Imagen externa con CORS no habilitado. Usando renderizado cinemático vector.')
          imageLoadFailed = true
          resolve(true)
        }
        img.src = selectedProduct.imageUrl
      })

      // Pre-cargar la imagen del avatar seleccionado si no está en 'NONE'
      let avatarLoadFailed = false
      const avatarImg = new (window as any).Image()
      avatarImg.crossOrigin = 'anonymous'

      if (avatarLayout !== 'NONE' && selectedAvatar?.imageUrl) {
        await new Promise((resolve) => {
          avatarImg.onload = () => resolve(true)
          avatarImg.onerror = () => {
            console.warn('[Studio IA] Imagen de avatar no disponible vía CORS.')
            avatarLoadFailed = true
            resolve(true)
          }
          avatarImg.src = selectedAvatar.imageUrl
        })
      }

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
      const isActualMp4 = selectedMime.includes('mp4')
      const fileExt = isActualMp4 ? 'mp4' : 'webm'
      const totalSeconds = duration === '15s' ? 10 : 15

      // Iniciar sintetizador de audio profesional con voz de IA y música comercial
      let audioCtx: AudioContext | null = null
      let audioDest: MediaStreamAudioDestinationNode | null = null

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContextClass) {
          audioCtx = new AudioContextClass()
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume()
          }
          audioDest = audioCtx.createMediaStreamDestination()

          // 1. OBTENER LOCUCIÓN REAL DE LA IA (MP3)
          try {
            const voiceRes = await fetch('/api/studio-ia/generate-voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `${generatedData.hook}. ${generatedData.script}`,
                voice: tone === 'luxury' ? 'onyx' : tone === 'casual' ? 'shimmer' : 'nova'
              })
            })
            if (voiceRes.ok) {
              const arrayBuffer = await voiceRes.arrayBuffer()
              if (arrayBuffer.byteLength > 500) {
                const voiceBuffer = await audioCtx.decodeAudioData(arrayBuffer)
                const voiceSource = audioCtx.createBufferSource()
                voiceSource.buffer = voiceBuffer
                const voiceGain = audioCtx.createGain()
                voiceGain.gain.setValueAtTime(1.0, audioCtx.currentTime) // Voz al 100%
                voiceSource.connect(voiceGain)
                voiceGain.connect(audioDest)
                voiceSource.start(audioCtx.currentTime + 0.2) // Inicia a los 200ms
              }
            }
          } catch (vErr) {
            console.warn('[Studio IA Voiceover Download Error]:', vErr)
          }

          // 2. MEZCLAR PISTA MUSICAL DE FONDO COMERCIAL (CHORDS + RHYTHM GROOVE)
          const musicGain = audioCtx.createGain()
          musicGain.gain.setValueAtTime(0.18, audioCtx.currentTime) // 18% para no tapar la voz
          musicGain.connect(audioDest)

          const filter = audioCtx.createBiquadFilter()
          filter.type = 'lowpass'
          filter.frequency.setValueAtTime(musicTrack === 'lofi' ? 700 : 1300, audioCtx.currentTime)
          filter.connect(musicGain)

          const chordProgressions: Record<string, number[][]> = {
            viral: [
              [220, 261.63, 329.63],   // Am
              [174.61, 220, 261.63],   // F
              [130.81, 164.81, 196.00],// C
              [196.00, 246.94, 293.66] // G
            ],
            lofi: [
              [146.83, 174.61, 220, 261.63],     // Dm7
              [196.00, 246.94, 293.66, 349.23],  // G7
              [130.81, 164.81, 196.00, 246.94],  // Cmaj7
              [220.00, 277.18, 329.63, 392.00]   // A7
            ],
            upbeat: [
              [261.63, 329.63, 392.00], // C
              [196.00, 246.94, 293.66], // G
              [220.00, 261.63, 329.63], // Am
              [174.61, 220.00, 261.63]  // F
            ],
            luxury: [
              [174.61, 220.00, 261.63, 329.63], // Fmaj7
              [164.81, 196.00, 246.94, 293.66], // Em7
              [146.83, 174.61, 220.00, 261.63], // Dm7
              [130.81, 164.81, 196.00, 246.94]  // Cmaj7
            ]
          }

          const chords = chordProgressions[musicTrack] || chordProgressions.viral
          const chordDuration = 2.0
          const totalChords = Math.ceil(totalSeconds / chordDuration)

          for (let i = 0; i < totalChords; i++) {
            const chord = chords[i % chords.length]
            const startTime = audioCtx.currentTime + (i * chordDuration)

            chord.forEach((freq) => {
              if (!audioCtx) return
              const osc = audioCtx.createOscillator()
              const noteGain = audioCtx.createGain()
              osc.type = musicTrack === 'luxury' ? 'sine' : musicTrack === 'lofi' ? 'triangle' : 'sawtooth'
              osc.frequency.setValueAtTime(freq, startTime)

              noteGain.gain.setValueAtTime(0.001, startTime)
              noteGain.gain.exponentialRampToValueAtTime(0.07, startTime + 0.12)
              noteGain.gain.exponentialRampToValueAtTime(0.04, startTime + chordDuration * 0.7)
              noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration - 0.05)

              osc.connect(noteGain)
              noteGain.connect(filter)
              osc.start(startTime)
              osc.stop(startTime + chordDuration)
            })

            // Golpe suave de bajo rítmico en cada cambio
            const bassOsc = audioCtx.createOscillator()
            const bassGain = audioCtx.createGain()
            bassOsc.type = 'sine'
            bassOsc.frequency.setValueAtTime(chord[0] / 2, startTime)
            bassGain.gain.setValueAtTime(0.14, startTime)
            bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55)
            bassOsc.connect(bassGain)
            bassGain.connect(musicGain)
            bassOsc.start(startTime)
            bassOsc.stop(startTime + 0.6)
          }
        }
      } catch (audioErr) {
        console.warn('[Studio IA Audio Track]', audioErr)
      }

      const canvasStream = canvas.captureStream(30)
      let combinedStream = canvasStream
      if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioDest.stream.getAudioTracks()
        ])
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000 // 6 Mbps alta definición
      })

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }

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

        // 2. DIBUJADO SEGÚN EL MODO DE AVATAR (SPLIT_UGC | BUBBLE_PIP | NONE)
        if (avatarLayout === 'SPLIT_UGC') {
          // --- MODO PANTALLA DIVIDIDA 50/50 ---
          // MITAD SUPERIOR: AVATAR UGC (y: 0 a 860)
          if (!avatarLoadFailed && avatarImg.complete && avatarImg.naturalWidth > 0) {
            try {
              const avZoom = 1.0 + Math.sin(t * 3) * 0.02
              const avW = 1080 * avZoom
              const avH = 880 * avZoom
              const avOx = (1080 - avW) / 2
              const avOy = (860 - avH) / 2
              ctx.drawImage(avatarImg, avOx, avOy, avW, avH)
            } catch (e) {
              avatarLoadFailed = true
            }
          }
          if (avatarLoadFailed || !avatarImg.complete || avatarImg.naturalWidth === 0) {
            const avGrad = ctx.createLinearGradient(0, 0, 0, 860)
            avGrad.addColorStop(0, '#2e1065')
            avGrad.addColorStop(1, '#09090b')
            ctx.fillStyle = avGrad
            ctx.fillRect(0, 0, 1080, 860)
          }

          // Sombra en base de mitad superior
          const avShadow = ctx.createLinearGradient(0, 680, 0, 860)
          avShadow.addColorStop(0, 'transparent')
          avShadow.addColorStop(1, 'rgba(0,0,0,0.95)')
          ctx.fillStyle = avShadow
          ctx.fillRect(0, 680, 1080, 180)

          // Badge del creador UGC
          ctx.fillStyle = 'rgba(0,0,0,0.7)'
          ctx.beginPath()
          ctx.roundRect(80, 750, 480, 75, 20)
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.2)'
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 32px sans-serif'
          ctx.textAlign = 'left'
          ctx.fillText(`🎙️ ${selectedAvatar.name} • Creador UGC`, 110, 800)

          // MITAD INFERIOR: PRODUCTO (y: 860 a 1920)
          if (!imageLoadFailed && img.complete && img.naturalWidth > 0) {
            try {
              const pZoom = 1.0 + (t / totalSeconds) * 0.15
              const pW = 1080 * pZoom
              const pH = 1060 * pZoom
              const pOx = (1080 - pW) / 2
              const pOy = 860 + (1060 - pH) / 2
              ctx.drawImage(img, pOx, pOy, pW, pH)
            } catch (e) {
              imageLoadFailed = true
            }
          }
          if (imageLoadFailed || !img.complete || img.naturalWidth === 0) {
            const pGrad = ctx.createLinearGradient(0, 860, 0, 1920)
            pGrad.addColorStop(0, '#1e1b4b')
            pGrad.addColorStop(1, '#09090b')
            ctx.fillStyle = pGrad
            ctx.fillRect(0, 860, 1080, 1060)
          }
        } else {
          // --- MODO PANTALLA COMPLETA DEL PRODUCTO ---
          if (!imageLoadFailed && img.complete && img.naturalWidth > 0) {
            try {
              const zoom = 1.0 + (t / totalSeconds) * 0.18
              const w = 1080 * zoom
              const h = 1920 * zoom
              const ox = (1080 - w) / 2
              const oy = (1920 - h) / 2
              ctx.drawImage(img, ox, oy, w, h)
            } catch (corsErr) {
              imageLoadFailed = true
            }
          }
          if (imageLoadFailed || !img.complete || img.naturalWidth === 0) {
            const grad = ctx.createLinearGradient(0, 0, 1080, 1920)
            grad.addColorStop(0, '#1e1b4b')
            grad.addColorStop(0.5, '#2e1065')
            grad.addColorStop(1, '#09090b')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, 1080, 1920)
          }
        }

        // Sombras superior e inferior
        const topGrad = ctx.createLinearGradient(0, 0, 0, 420)
        topGrad.addColorStop(0, 'rgba(0,0,0,0.85)')
        topGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = topGrad
        ctx.fillRect(0, 0, 1080, 420)

        const btmGrad = ctx.createLinearGradient(0, 1250, 0, 1920)
        btmGrad.addColorStop(0, 'transparent')
        btmGrad.addColorStop(1, 'rgba(0,0,0,0.92)')
        ctx.fillStyle = btmGrad
        ctx.fillRect(0, 1250, 1080, 670)

        // 3. Cabecera Tienda
        ctx.fillStyle = 'rgba(0,0,0,0.65)'
        ctx.beginPath()
        ctx.roundRect(60, 60, 520, 100, 50)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = '#7c3aed'
        ctx.beginPath()
        ctx.arc(115, 110, 36, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 34px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(store.name.charAt(0).toUpperCase(), 115, 122)

        ctx.textAlign = 'left'
        ctx.font = 'bold 34px sans-serif'
        ctx.fillText(store.name.slice(0, 18), 175, 122)

        // 4. SUBTÍTULOS ESTILO CAPCUT (KARAOKE DINÁMICO PALABRA POR PALABRA)
        const fullScript = (t <= 3.2 ? generatedData.hook : generatedData.script)
          .replace(/[*#_~`]/g, '')
          .trim()
        const allWords = fullScript.split(/\s+/).filter(Boolean)
        const scriptDuration = t <= 3.2 ? 3.2 : (totalSeconds - 3.2)
        const elapsedScript = t <= 3.2 ? t : (t - 3.2)
        const activeWordIndex = Math.min(
          Math.floor((elapsedScript / scriptDuration) * allWords.length),
          Math.max(0, allWords.length - 1)
        )

        // Ventana de 3 a 4 palabras visibles con karaoke fluido
        const windowSize = 4
        const chunkIndex = Math.floor(activeWordIndex / windowSize)
        const startIdx = chunkIndex * windowSize
        const visibleWords = allWords.slice(startIdx, startIdx + windowSize)

        const subY = avatarLayout === 'SPLIT_UGC' ? 1000 : 840

        ctx.save()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.82)'
        ctx.beginPath()
        ctx.roundRect(60, subY - 80, 960, 150, 26)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.font = '900 46px system-ui, -apple-system, sans-serif'
        let phraseTotalWidth = 0
        const wordMetrics = visibleWords.map(w => {
          const m = ctx.measureText(w.toUpperCase() + ' ')
          phraseTotalWidth += m.width
          return m.width
        })

        let wordStartX = 540 - (phraseTotalWidth / 2)

        visibleWords.forEach((word, idx) => {
          const globalIdx = startIdx + idx
          const isActive = globalIdx === activeWordIndex
          const wWidth = wordMetrics[idx]
          const wordCenterX = wordStartX + (wWidth / 2)

          ctx.save()
          if (isActive) {
            ctx.font = '900 52px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#facc15' // Amarillo CapCut brillante
            ctx.shadowColor = 'rgba(250, 204, 21, 0.85)'
            ctx.shadowBlur = 18

            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 10
            ctx.strokeText(word.toUpperCase(), wordCenterX, subY)
            ctx.fillText(word.toUpperCase(), wordCenterX, subY)
          } else {
            ctx.font = '800 44px system-ui, -apple-system, sans-serif'
            ctx.fillStyle = '#ffffff'
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)'
            ctx.lineWidth = 6
            ctx.strokeText(word.toUpperCase(), wordCenterX, subY)
            ctx.fillText(word.toUpperCase(), wordCenterX, subY)
          }
          ctx.restore()

          wordStartX += wWidth
        })
        ctx.restore()

        // 5. SI ESTÁ ACTIVO MODO BURBUJA FLOTANTE (BUBBLE_PIP)
        if (avatarLayout === 'BUBBLE_PIP') {
          const bubbleX = 180
          const bubbleY = 1380
          const bubbleRadius = 95

          // Anillo reactivo de audio (pulso suave de onda de voz)
          ctx.save()
          const ringPulse = Math.sin(t * 12) * 8
          ctx.beginPath()
          ctx.arc(bubbleX, bubbleY, bubbleRadius + 10 + ringPulse, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)'
          ctx.lineWidth = 6
          ctx.stroke()

          // Círculo de la foto del avatar
          ctx.beginPath()
          ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2)
          ctx.clip()

          if (!avatarLoadFailed && avatarImg.complete && avatarImg.naturalWidth > 0) {
            try {
              ctx.drawImage(avatarImg, bubbleX - bubbleRadius, bubbleY - bubbleRadius, bubbleRadius * 2, bubbleRadius * 2)
            } catch (e) {
              avatarLoadFailed = true
            }
          }
          if (avatarLoadFailed || !avatarImg.complete || avatarImg.naturalWidth === 0) {
            ctx.fillStyle = '#7c3aed'
            ctx.fillRect(bubbleX - bubbleRadius, bubbleY - bubbleRadius, bubbleRadius * 2, bubbleRadius * 2)
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 44px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(selectedAvatar.name.charAt(0), bubbleX, bubbleY + 15)
          }
          ctx.restore()

          // Badge con el nombre del Avatar
          ctx.save()
          ctx.fillStyle = 'rgba(15, 15, 20, 0.85)'
          ctx.beginPath()
          ctx.roundRect(bubbleX - 110, bubbleY + bubbleRadius + 12, 220, 48, 14)
          ctx.fill()
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.lineWidth = 1.5
          ctx.stroke()

          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 24px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`🎙️ ${selectedAvatar.name} (IA)`, bubbleX, bubbleY + bubbleRadius + 34)
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
        if (audioCtx) {
          try { audioCtx.close() } catch (e) {}
        }
        const blob = new Blob(chunks, { type: selectedMime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const sanitized = selectedProduct.name.replace(/[^a-zA-Z0-9]/g, '_')
        a.href = url
        a.download = `${sanitized}_reel_promo.${fileExt}`
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
        toast.success(`¡Video ${fileExt.toUpperCase()} en alta definición descargado con éxito!`)
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

    let phoneToSend = store.whatsapp
    if (type === 'TEST' && !phoneToSend) {
      const inputPhone = window.prompt('Ingresa tu número de WhatsApp con código de país (ej: 573001234567):')
      if (!inputPhone || !inputPhone.trim()) return
      phoneToSend = inputPhone.trim()
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
          targetPhone: phoneToSend || undefined,
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

  // Re-publicar pieza de la biblioteca
  const handleRepublish = async (item: any) => {
    if (!store.whatsappConnected) {
      toast.error('Conecta tu WhatsApp en Integraciones antes de publicar.')
      return
    }
    const toastId = toast.loading('Publicando pieza en WhatsApp...')
    try {
      const res = await fetch('/api/studio-ia/publish-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STATUS',
          caption: item.copyCaption || item.title,
          mediaUrl: item.thumbnailUrl || undefined,
          mediaType: 'image',
          productId: item.productId,
          title: item.title
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al re-publicar')
      }
      toast.dismiss(toastId)
      toast.success('¡Pieza re-publicada en los Estados de WhatsApp!')
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err.message || 'Error al re-publicar')
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

        {/* PESTAÑAS PRINCIPALES DEL STUDIO IA COMPLETO */}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-150 pt-4 mt-5">
          {[
            { id: 'foto' as const, label: '📸 Foto Studio IA', icon: Camera, badge: 'Replicate FLUX' },
            { id: 'contenido' as const, label: '✍️ Content Studio', icon: FileText, badge: 'Copy AIDA' },
            { id: 'video' as const, label: '🎬 Video & Avatar Studio', icon: Video, badge: 'Reels 9:16' },
            { id: 'creaciones' as const, label: '📁 Biblioteca & Activos', count: savedCreations.length, icon: ShoppingBag }
          ].map(t => {
            const Icon = t.icon
            const isActive = mainTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className={cn(
                  "px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer",
                  isActive 
                    ? "bg-zinc-950 text-white shadow-md ring-2 ring-zinc-950" 
                    : "bg-zinc-50 border border-zinc-200/90 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-purple-300" : "text-zinc-400")} />
                <span>{t.label}</span>
                {t.badge && (
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.2 rounded font-black hidden sm:inline-block",
                    isActive ? "bg-purple-900/60 text-purple-200 border border-purple-700/60" : "bg-zinc-200/80 text-zinc-600"
                  )}>
                    {t.badge}
                  </span>
                )}
                {t.count !== undefined && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded font-black",
                    isActive ? "bg-zinc-800 text-purple-200" : "bg-zinc-200 text-zinc-700"
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
      {products.length === 0 ? (
        <div className="py-16 px-6 bg-white border border-zinc-200/90 rounded-2xl text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-extrabold text-zinc-950">Aún no tienes productos en tu catálogo</h2>
            <p className="text-xs text-zinc-500 font-medium">
              Studio IA necesita al menos un producto para crear reels virales, textos publicitarios y audios comerciales.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <span>+ Crear Mi Primer Producto</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      ) : mainTab === 'foto' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header de Foto Studio */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Estudio Fotográfico de Productos (AI Product Photography)
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Elimina fondos desordenados y coloca tu producto en escenarios hiperrealistas de estudio con luces y sombras 3D.
                  </p>
                </div>
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-bold text-zinc-500">Producto:</span>
                  <span className="text-xs font-black text-zinc-950 truncate max-w-[160px]">{selectedProduct.name}</span>
                </div>
              )}
            </div>

            {/* Selector de Producto en Carrusel */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {products.map(p => {
                const isSelected = selectedProduct?.id === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p)
                      setEnhancedPhotoUrl(null)
                    }}
                    className={cn(
                      "shrink-0 flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer text-left",
                      isSelected
                        ? "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950 shadow-xs"
                        : "border-zinc-200/90 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 m-2.5 text-zinc-300" />
                      )}
                    </div>
                    <div className="pr-2">
                      <span className="text-xs font-extrabold text-zinc-900 block truncate max-w-[140px]">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500">
                        {formatCOP(p.price)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Grid de 2 Columnas: Panel de IA (5 cols) + Comparador Visual (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            
            {/* Panel de Herramientas IA */}
            <div className="lg:col-span-5 space-y-5">
              {/* Acciones de Edición Rápida */}
              <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Mejoras Rápidas con IA
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEnhancePhoto('remove-bg')}
                    disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                    className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 disabled:opacity-50 transition-all text-left space-y-1.5 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-zinc-950 block">Quitar Fondo</span>
                    <p className="text-[10px] text-zinc-500 font-medium">Recorte perfecto con Replicate RMBG</p>
                  </button>

                  <button
                    onClick={() => handleEnhancePhoto('upscale')}
                    disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                    className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 disabled:opacity-50 transition-all text-left space-y-1.5 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-zinc-950 block">Upscaling 4K</span>
                    <p className="text-[10px] text-zinc-500 font-medium">Elimina ruido y aumenta nitidez</p>
                  </button>
                </div>
              </div>

              {/* Generador de Escenarios 3D con FLUX */}
              <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Escenarios de Estudio Hiperrealistas
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: 'marble' as const, name: 'Mármol Blanco & Oro', desc: 'Cosméticos, perfumes y joyería de lujo', icon: '🏛️' },
                    { id: 'neon-podium' as const, name: 'Podio Minimalista Neón', desc: 'Tecnología, gadgets y zapatillas', icon: '⚡' },
                    { id: 'luxury-wood' as const, name: 'Madera Noble & Café Cálido', desc: 'Cuero, calzado y accesorios artesanales', icon: '🪵' },
                    { id: 'sunlight-nature' as const, name: 'Naturaleza & Luz Solar', desc: 'Skincare, ropa orgánica y bienestar', icon: '🌿' },
                    { id: 'urban-minimal' as const, name: 'Urbano Minimalista', desc: 'Moda streetwear y estilo contemporáneo', icon: '🏙️' }
                  ].map(sc => {
                    const isSel = selectedScene === sc.id
                    return (
                      <button
                        key={sc.id}
                        onClick={() => setSelectedScene(sc.id)}
                        className={cn(
                          "w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                          isSel
                            ? "border-purple-600 bg-purple-50/50 ring-2 ring-purple-600 shadow-xs"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{sc.icon}</span>
                          <div>
                            <span className="text-xs font-extrabold text-zinc-950 block">{sc.name}</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{sc.desc}</span>
                          </div>
                        </div>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                {/* Prompt personalizado opcional */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">
                    Instrucción adicional para la IA (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customScenePrompt}
                    onChange={(e) => setCustomScenePrompt(e.target.value)}
                    placeholder="Ej: Iluminación cálida de atardecer, reflejos de agua..."
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white"
                  />
                </div>

                <button
                  onClick={() => handleEnhancePhoto('generate-scene')}
                  disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                  className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Sparkles className={cn("w-4 h-4", isProcessingPhoto && "animate-spin text-purple-400")} />
                  <span>
                    {isProcessingPhoto 
                      ? 'Generando escenario con Replicate FLUX...' 
                      : 'Generar Escenario de Estudio con IA'}
                  </span>
                </button>
              </div>
            </div>

            {/* Comparador Visual Before / After */}
            <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  Visualizador de Catálogo Fotográfico
                </span>
                {enhancedPhotoUrl && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Procesado por Replicate AI
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Foto Original */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-zinc-500 block text-center">
                    Foto Original del Producto
                  </span>
                  <div className="relative aspect-square rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden bg-zinc-50 flex items-center justify-center">
                    {selectedProduct?.imageUrl ? (
                      <img src={selectedProduct.imageUrl} alt="Original" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-zinc-300" />
                    )}
                  </div>
                </div>

                {/* Foto Mejorada con IA */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-purple-700 block text-center">
                    Foto de Estudio Generada con IA
                  </span>
                  <div className="relative aspect-square rounded-2xl border-2 border-purple-300 overflow-hidden bg-zinc-950 flex items-center justify-center shadow-md">
                    {enhancedPhotoUrl ? (
                      <img src={enhancedPhotoUrl} alt="Mejorada con IA" className="w-full h-full object-cover animate-in zoom-in-95 duration-300" />
                    ) : isProcessingPhoto ? (
                      <div className="text-center p-4 space-y-2">
                        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <span className="text-xs font-bold text-white block">Creando fotografía de estudio...</span>
                        <span className="text-[10px] text-zinc-400 block">Aplicando iluminación y sombras 3D</span>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-1.5">
                        <Wand2 className="w-10 h-10 text-zinc-600 mx-auto" />
                        <span className="text-xs font-bold text-zinc-400 block">Sin procesar aún</span>
                        <p className="text-[10px] text-zinc-500">
                          Selecciona una acción (Quitar fondo o Escenario) para ver el resultado aquí.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción al tener foto mejorada */}
              {enhancedPhotoUrl && (
                <div className="pt-3 border-t border-zinc-150 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                  <a
                    href={enhancedPhotoUrl}
                    download="producto_estudio_ia.png"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Imagen HD</span>
                  </a>

                  <button
                    onClick={handleSetPrimaryPhoto}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-black text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>⭐ Establecer como Portada Oficial del Producto</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : mainTab === 'contenido' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header & Product Selector */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Redactor Publicitario de Alto Impacto (AI Content & Growth Engine)
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Genera guiones virales para Reels/TikTok, descripciones AIDA/PAS para la tienda y copys de WhatsApp en 1 clic.
                  </p>
                </div>
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-bold text-zinc-500">Producto:</span>
                  <span className="text-xs font-black text-zinc-950 truncate max-w-[160px]">{selectedProduct.name}</span>
                </div>
              )}
            </div>

            {/* Carrusel de Selección Rápida de Productos */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {products.map(p => {
                const isSelected = selectedProduct?.id === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p)
                      handleGenerateContent(p)
                    }}
                    className={cn(
                      "shrink-0 flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer text-left",
                      isSelected
                        ? "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950 shadow-xs"
                        : "border-zinc-200/90 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 m-2.5 text-zinc-300" />
                      )}
                    </div>
                    <div className="pr-2">
                      <span className="text-xs font-extrabold text-zinc-900 block truncate max-w-[140px]">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500">
                        {formatCOP(p.price)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Configuración Rápida: Tono, Cupón y Botón Generador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1">Tono de Comunicación</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as CreativeTone)}
                  className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-800 focus:outline-none focus:border-zinc-950"
                >
                  <option value="urgency">⚡ Urgencia & Oferta Flash</option>
                  <option value="luxury">💎 Elegante & Calidad Superior</option>
                  <option value="casual">👋 Cercano & Amigable</option>
                  <option value="educational">💡 Problema / Solución</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-700 block mb-1">Cupón Asociado</label>
                <select
                  value={selectedCouponId}
                  onChange={(e) => setSelectedCouponId(e.target.value)}
                  className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-800 focus:outline-none focus:border-zinc-950"
                >
                  <option value="">Precio normal (Sin cupón)</option>
                  {coupons.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} ({c.valor} {c.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleGenerateContent()}
                  disabled={isGenerating || !selectedProduct}
                  className="w-full py-2 px-4 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin text-purple-400")} />
                  <span>{isGenerating ? 'Generando Estrategia...' : 'Regenerar con IA'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid de 2 Columnas de Contenido de Alto Impacto */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Columna Izquierda (7 cols): Guión Viral + Metodologías AIDA & PAS */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Guión para Reels & TikTok */}
              <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Guion Viral para Reels / TikTok
                    </h3>
                  </div>
                  {generatedData && (
                    <button
                      onClick={() => handleCopyText(`Gancho:\n${generatedData.hook}\n\nGuion:\n${generatedData.script}`, 'guion-full')}
                      className="text-[10px] text-purple-700 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedKey === 'guion-full' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar Guion Completo</span>
                    </button>
                  )}
                </div>

                {isGenerating ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-7 h-7 rounded-full border-2 border-zinc-950 border-t-purple-500 animate-spin mx-auto" />
                    <p className="text-xs text-zinc-500 font-medium">Redactando gancho de 3s y guión publicitario...</p>
                  </div>
                ) : generatedData ? (
                  <div className="space-y-3">
                    {/* Gancho de 3 segundos */}
                    <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-transparent border border-amber-300/80 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                          ⚡ Gancho de los Primeros 3 Segundos (Detén el Scroll)
                        </span>
                        <button
                          onClick={() => handleCopyText(generatedData.hook, 'hook')}
                          className="text-[10px] text-amber-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {copiedKey === 'hook' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar</span>
                        </button>
                      </div>
                      <p className="text-xs font-black text-zinc-950">
                        "{generatedData.hook}"
                      </p>
                    </div>

                    {/* Guion de Locución / Storytelling */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                          Argumento de Valor & Manejo de Objeciones
                        </span>
                        <button
                          onClick={() => handleCopyText(generatedData.script, 'script')}
                          className="text-[10px] text-zinc-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          {copiedKey === 'script' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar</span>
                        </button>
                      </div>
                      <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line">
                        {generatedData.script}
                      </p>
                    </div>

                    {/* Llamada a la Acción CTA */}
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[11px] font-bold text-purple-950">CTA sugerido:</span>
                        <span className="text-xs font-black text-purple-800">{generatedData.callToAction}</span>
                      </div>
                      <button
                        onClick={() => handleCopyText(generatedData.callToAction, 'cta')}
                        className="text-[10px] text-purple-700 font-bold hover:underline cursor-pointer"
                      >
                        {copiedKey === 'cta' ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* 2. Descripciones Persuasivas para Tienda Online (AIDA & PAS) */}
              <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Descripciones Persuasivas para Tienda Online
                    </h3>
                  </div>

                  {/* Selector AIDA vs PAS */}
                  <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                    <button
                      onClick={() => setCopyFramework('aida')}
                      className={cn(
                        "px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer",
                        copyFramework === 'aida' ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      Fórmula AIDA
                    </button>
                    <button
                      onClick={() => setCopyFramework('pas')}
                      className={cn(
                        "px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer",
                        copyFramework === 'pas' ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      Fórmula PAS
                    </button>
                  </div>
                </div>

                {isGenerating ? (
                  <div className="py-6 text-center text-xs text-zinc-400">Generando descripción con copywriting probado...</div>
                ) : generatedData ? (
                  copyFramework === 'aida' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2.5">
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">A - ATENCIÓN</span>
                          <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.attention}</p>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">I - INTERÉS</span>
                          <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.interest}</p>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">D - DESEO</span>
                          <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.desire}</p>
                        </div>
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">A - ACCIÓN</span>
                          <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.action}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const aidaText = `${generatedData.copyAida?.attention}\n\n${generatedData.copyAida?.interest}\n\n${generatedData.copyAida?.desire}\n\n${generatedData.copyAida?.action}`
                          handleCopyText(aidaText, 'aida')
                        }}
                        className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {copiedKey === 'aida' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar Descripción AIDA Completa</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2.5">
                        <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-black uppercase text-red-700 tracking-wider">P - PROBLEMA</span>
                          <p className="text-xs text-zinc-800 font-medium">{generatedData.copyPas?.problem}</p>
                        </div>
                        <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">A - AGITACIÓN</span>
                          <p className="text-xs text-zinc-800 font-medium">{generatedData.copyPas?.agitation}</p>
                        </div>
                        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">S - SOLUCIÓN</span>
                          <p className="text-xs text-zinc-800 font-medium">{generatedData.copyPas?.solution}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const pasText = `${generatedData.copyPas?.problem}\n\n${generatedData.copyPas?.agitation}\n\n${generatedData.copyPas?.solution}`
                          handleCopyText(pasText, 'pas')
                        }}
                        className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {copiedKey === 'pas' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar Descripción PAS Completa</span>
                      </button>
                    </div>
                  )
                ) : null}
              </div>

            </div>

            {/* Columna Derecha (5 cols): WhatsApp + Cupones Flash */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 3. Copys para WhatsApp con formato enriquecido */}
              <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Difusión para WhatsApp (1 Clic)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Formato Negritas
                  </span>
                </div>

                {generatedData && (
                  <div className="space-y-3">
                    <div className="p-4 bg-[#DCF8C6]/50 border border-emerald-200 rounded-2xl space-y-2 relative shadow-xs">
                      <p className="text-xs text-zinc-900 leading-relaxed whitespace-pre-line font-sans">
                        {generatedData.copyWhatsApp}
                      </p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 font-mono">
                        <span>12:00</span>
                        <Check className="w-3 h-3 text-sky-500 stroke-[3]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleCopyText(generatedData.copyWhatsApp, 'wpp')}
                        className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {copiedKey === 'wpp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copiar Mensaje para WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handlePublishWhatsApp('TEST')}
                        disabled={isPublishing}
                        className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enviar Prueba a mi WhatsApp {store.whatsapp ? `(${store.whatsapp})` : ''}</span>
                      </button>

                      <button
                        onClick={() => handlePublishWhatsApp('STATUS')}
                        disabled={isPublishing}
                        className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Publicar en Estado de WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Estrategia de Oferta & Cupón Flash */}
              <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Tag className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Estrategia de Oferta & Cupones Flash
                  </h3>
                </div>

                {generatedData && (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-purple-800 text-[11px] font-black uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recomendación Inteligente de Oferta</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-900">
                        {generatedData.couponRecommendation}
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-zinc-500">Caption para Instagram / TikTok</span>
                        <button
                          onClick={() => handleCopyText(`${generatedData.copyInstagram}\n\n${generatedData.hashtags.join(' ')}`, 'insta')}
                          className="text-[10px] text-purple-700 font-bold hover:underline cursor-pointer"
                        >
                          {copiedKey === 'insta' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-3 font-medium">
                        {generatedData.copyInstagram}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {generatedData.hashtags.map((h, i) => (
                          <span key={i} className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/50">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : mainTab === 'video' ? (
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

            {/* GENERACIÓN IMAGE-TO-VIDEO (I2V) CON REPLICATE */}
            <div className="bg-gradient-to-r from-purple-900/5 via-indigo-900/5 to-transparent border border-purple-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                    <Film className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Animación 3D Image-to-Video (I2V) con Replicate
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Anima la foto de tu producto con movimiento de cámara 360°, paneo cinemático y luces de estudio.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  Minimax Video-01
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleGenerateI2V}
                  disabled={isGeneratingI2V || !selectedProduct?.imageUrl}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles className={cn("w-4 h-4", isGeneratingI2V && "animate-spin")} />
                  <span>{isGeneratingI2V ? 'Generando Video Cinemático...' : 'Generar Animación 3D del Producto (I2V)'}</span>
                </button>

                {generatedVideoUrl && (
                  <a
                    href={generatedVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    download="animacion_producto_ia.mp4"
                    className="px-4 py-2.5 bg-zinc-950 text-white hover:bg-zinc-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Video I2V</span>
                  </a>
                )}
              </div>

              {generatedVideoUrl && (
                <div className="rounded-xl overflow-hidden border border-purple-200 bg-black aspect-video max-h-56 flex items-center justify-center mt-2">
                  <video src={generatedVideoUrl} controls autoPlay loop className="h-full w-full object-contain" />
                </div>
              )}
            </div>

            {/* 3. AVATARES DE IA & CREADORES UGC */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Paso 3: Avatar de IA & Creador UGC
                    </h2>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      Elige el rostro virtual que presentará y venderá tu producto.
                    </p>
                  </div>
                </div>

                {/* Selector de Modo de Layout del Avatar */}
                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                  {[
                    { id: 'BUBBLE_PIP' as AvatarLayout, label: 'Burbuja PIP' },
                    { id: 'SPLIT_UGC' as AvatarLayout, label: 'Split 50/50' },
                    { id: 'NONE' as AvatarLayout, label: 'Sin Avatar' }
                  ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => setAvatarLayout(l.id)}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer",
                        avatarLayout === l.id
                          ? "bg-white text-zinc-950 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {avatarLayout !== 'NONE' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AI_AVATARS.map((avatar) => {
                    const isSelected = selectedAvatar.id === avatar.id
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={cn(
                          "relative p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between overflow-hidden",
                          isSelected
                            ? "border-purple-600 bg-purple-50/40 ring-2 ring-purple-600 shadow-sm"
                            : "border-zinc-200/90 bg-white hover:border-zinc-300"
                        )}
                      >
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2 bg-zinc-100">
                          <img
                            src={avatar.imageUrl}
                            alt={avatar.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-black/70 backdrop-blur-md text-white">
                            {avatar.badge}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-zinc-950 truncate">
                              {avatar.name}
                            </span>
                            <span className="text-[9px] font-bold text-purple-700">
                              IA
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                            {avatar.niche}
                          </p>
                          <span className="text-[9px] text-zinc-400 font-semibold block mt-1">
                            {avatar.tone}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 4. GUIONES Y COPYS ADAPTABLES */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-150 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                      Paso 4: Guion & Copys Generados
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
                
                {/* Fondo cinemático con zoom dinámico Ken Burns y soporte para Split Screen UGC */}
                {avatarLayout === 'SPLIT_UGC' ? (
                  <div className="absolute inset-0 flex flex-col">
                    {/* Mitad superior: Avatar UGC */}
                    <div className="relative h-1/2 w-full overflow-hidden bg-zinc-950">
                      <img 
                        src={selectedAvatar.imageUrl} 
                        alt={selectedAvatar.name} 
                        className={cn("w-full h-full object-cover transition-transform duration-1000", isPlaying ? "scale-105" : "scale-100")} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                      <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] font-bold text-white flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{selectedAvatar.name} • Creador UGC</span>
                      </div>
                    </div>
                    {/* Mitad inferior: Producto */}
                    <div className="relative h-1/2 w-full overflow-hidden bg-zinc-900">
                      {selectedProduct?.imageUrl ? (
                        <img 
                          src={selectedProduct.imageUrl} 
                          alt="" 
                          className={cn("w-full h-full object-cover transition-transform duration-1000", isPlaying ? "scale-110" : "scale-100")} 
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    </div>
                  </div>
                ) : selectedProduct?.imageUrl ? (
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

                {/* Burbuja Flotante PIP del Avatar si está activo BUBBLE_PIP */}
                {avatarLayout === 'BUBBLE_PIP' && (
                  <div className="absolute bottom-24 left-3 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 pr-2.5 rounded-full border border-purple-500/50 shadow-xl">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-400 ring-2 ring-purple-500/40 shadow-sm">
                        <img src={selectedAvatar.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-ping" />
                    </div>
                    <span className="text-[10px] font-black text-white tracking-tight">
                      {selectedAvatar.name} (IA)
                    </span>
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

                {/* Capa Central: Hook de 3s o Subtítulos Karaoke Dinámicos estilo CapCut */}
                <div className="relative z-10 text-center space-y-2 my-auto px-2">
                  {previewSecond <= 3 ? (
                    <div className="animate-in zoom-in duration-300">
                      <span className="inline-block bg-amber-400 text-zinc-950 px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-tight shadow-xl border-2 border-amber-300">
                        {generatedData?.hook || '¡OFERTA IMPERDIBLE! 🔥'}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-black/80 backdrop-blur-md py-2.5 px-3 rounded-2xl border border-white/20 animate-in fade-in duration-200 shadow-xl">
                      {(() => {
                        const fullText = (generatedData?.script || selectedProduct?.name || '').replace(/[*#_~`]/g, '')
                        const words = fullText.split(/\s+/).filter(Boolean)
                        const activeWordIdx = Math.min(
                          Math.floor(((previewSecond - 3) / (maxSeconds - 3)) * words.length),
                          Math.max(0, words.length - 1)
                        )
                        const windowSize = 4
                        const chunkIdx = Math.floor(activeWordIdx / windowSize)
                        const start = chunkIdx * windowSize
                        const visible = words.slice(start, start + windowSize)

                        return (
                          <div>
                            <div className="flex flex-wrap items-center justify-center gap-1.5 font-black text-xs leading-tight">
                              {visible.map((w, idx) => {
                                const isCur = (start + idx) === activeWordIdx
                                return (
                                  <span
                                    key={idx}
                                    className={cn(
                                      "transition-all duration-150 uppercase tracking-tight",
                                      isCur 
                                        ? "text-yellow-400 scale-110 drop-shadow-[0_2px_8px_rgba(250,204,21,0.9)] font-black underline decoration-yellow-400 decoration-2" 
                                        : "text-white drop-shadow-sm font-extrabold"
                                    )}
                                  >
                                    {w}
                                  </span>
                                )
                              })}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-zinc-300 font-bold">
                              <Music className="w-2.5 h-2.5 text-purple-400 animate-spin" />
                              <span>Subtítulos CapCut IA • {selectedAvatar.name}</span>
                            </div>
                          </div>
                        )
                      })()}
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
                disabled={isPublishing || !generatedData}
                className="w-full py-2.5 px-4 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 disabled:opacity-50 text-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Enviar prueba a mi WhatsApp {store.whatsapp ? `(${store.whatsapp})` : ''}</span>
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
              onClick={() => setMainTab('video')}
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
                onClick={() => setMainTab('video')}
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
                      onClick={() => handleRepublish(item)}
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
                  setMainTab('video')
                }
              },
              {
                title: '💎 Unboxing & Lujo Visual',
                tag: 'Alta Gama',
                desc: 'Transiciones lentas, iluminación de estudio y foco en texturas y materiales para justificar un ticket alto.',
                action: () => {
                  setMode('GENERATIVE_I2V')
                  setTone('luxury')
                  setMainTab('video')
                }
              },
              {
                title: '🤝 Testimonio Cliente Satisfecho',
                tag: 'Confianza & Prueba Social',
                desc: 'Un vocero digital cuenta su experiencia real utilizando el producto para derribar objeciones de compra.',
                action: () => {
                  setMode('AVATAR_UGC')
                  setTone('casual')
                  setMainTab('video')
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
