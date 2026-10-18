'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Store, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Shirt, 
  Smartphone, 
  Home, 
  Sparkles, 
  Utensils, 
  Dumbbell, 
  MoreHorizontal, 
  CheckCircle2, 
  Upload, 
  Plus, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Zap, 
  MessageSquare,
  CreditCard,
  TrendingUp,
  Image as ImageIcon,
  Lock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  RefreshCw,
  ShoppingBag,
  BadgeCheck,
  Send,
  Eye,
  Bot,
  HelpCircle,
  CheckCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import CustomUserMenu from '@/components/dashboard/CustomUserMenu'

type StepType = {
  num: number
  label: string
  shortLabel: string
  category: string
  desc: string
}

const STEPS: StepType[] = [
  { num: 1, label: 'Bienvenido', shortLabel: 'Inicio', category: 'Introducción', desc: 'Conoce cómo Nova venderá por ti' },
  { num: 2, label: 'Información del negocio', shortLabel: 'Negocio', category: 'Identidad Comercial', desc: 'Nombre, slug público y número' },
  { num: 3, label: 'Conecta WhatsApp', shortLabel: 'WhatsApp', category: 'Canal de Ventas', desc: 'Vincula tu WhatsApp Business con QR' },
  { num: 4, label: 'Catálogo de productos', shortLabel: 'Productos', category: 'Inventario', desc: 'Añade tus artículos estrella' },
  { num: 5, label: 'Métodos de pago', shortLabel: 'Pagos', category: 'Cobranza', desc: 'Nequi, Daviplata y Mercado Pago' },
  { num: 6, label: 'Preferencias de Nova', shortLabel: 'Agente IA', category: 'Memoria & Bot', desc: 'Personaliza tono y bienvenida' },
  { num: 7, label: 'Revisa y confirma', shortLabel: 'Resumen', category: 'Verificación', desc: 'Comprueba los detalles de tu tienda' },
  { num: 8, label: '¡Lanzamiento!', shortLabel: 'Listo', category: 'En producción', desc: 'Tu tienda está en vivo' }
]

export default function StoreCreationWizard({ 
  isNewStore = false,
  isPro = false,
  hasExistingStores = false
}: { 
  isNewStore?: boolean
  isPro?: boolean
  hasExistingStores?: boolean
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form State
  const [storeForm, setStoreForm] = useState({
    name: '',
    slug: '',
    whatsapp: '',
    category: 'Moda',
  })
  const [createdStore, setCreatedStore] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState('')

  // WhatsApp Connection State
  const [whatsappStatus, setWhatsappStatus] = useState<'DISCONNECTED' | 'LOADING' | 'QRCODE' | 'CONNECTED' | 'ERROR'>('DISCONNECTED')
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [qrExpiresIn, setQrExpiresIn] = useState(180)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Product Catalog State
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '10',
    description: '',
    imageUrl: '',
  })
  const [addedProducts, setAddedProducts] = useState<any[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  // Payment Methods State
  const [payments, setPayments] = useState({
    mercadopago: false,
    manual: true,
  })

  // Store Preferences / Bot Settings
  const [preferences, setPreferences] = useState({
    welcomeMessage: '¡Hola! Bienvenido a nuestra tienda de WhatsApp. 🛍️ ¿En qué te puedo ayudar hoy?',
    systemPrompt: 'Eres Nova, un asistente de ventas de WhatsApp empático y proactivo. Tu objetivo es guiar al cliente por el catálogo, ayudarle a armar su carrito y motivarlo a concretar el pago mediante Smart Pay.',
    businessHours: 'Lunes a Viernes 8:00 AM - 6:00 PM',
    themeColor: 'emerald'
  })

  // Business Profile for Nova Memory
  const [businessProfile, setBusinessProfile] = useState({
    niche: '',
    targetAudience: '',
    brandTone: 'Sofisticado y elegante',
    coreProposition: ''
  })

  // Preview Mode Toggle: WhatsApp Chat vs Web Catalog
  const [previewTab, setPreviewTab] = useState<'chat' | 'catalog'>('chat')

  // Restore onboarding progress from existing store
  useEffect(() => {
    if (isNewStore) {
      setCurrentStep(1)
      setInitializing(false)
      return
    }

    async function restoreOnboardingProgress() {
      try {
        const res = await fetch('/api/stores')
        if (res.ok) {
          const data = await res.json()
          if (data.store) {
            setCreatedStore(data.store)
            setStoreForm({
              name: data.store.name || '',
              slug: data.store.slug || '',
              whatsapp: data.store.whatsapp || '',
              category: data.store.category || 'Moda',
            })

            if (data.store.settings && typeof data.store.settings === 'object') {
              const bp = (data.store.settings as any).businessProfile
              if (bp) {
                setBusinessProfile({
                  niche: bp.niche || '',
                  targetAudience: bp.targetAudience || '',
                  brandTone: bp.brandTone || 'Sofisticado y elegante',
                  coreProposition: bp.coreProposition || ''
                })
              }
            }
            
            if (data.store.whatsappConnected) {
              setWhatsappStatus('CONNECTED')
            }

            const productsRes = await fetch('/api/products')
            const productsData = await productsRes.json()
            const prods = productsData.products || []
            setAddedProducts(prods)

            if (prods.length === 0) {
              setCurrentStep(4)
            } else if (!data.store.welcomeMessage) {
              setCurrentStep(6)
            } else {
              setCurrentStep(8)
            }
          } else {
            setCurrentStep(1)
          }
        }
      } catch (e) {
        console.error('Failed to restore progress:', e)
      } finally {
        setInitializing(false)
      }
    }

    restoreOnboardingProgress()

    return () => {
      stopWhatsappPolling()
      stopQrTimer()
    }
  }, [isNewStore])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const startQrTimer = () => {
    stopQrTimer()
    setQrExpiresIn(180)
    timerRef.current = setInterval(() => {
      setQrExpiresIn(prev => {
        if (prev <= 1) {
          stopQrTimer()
          triggerWhatsappConnect()
          return 180
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopQrTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startWhatsappPolling = () => {
    stopWhatsappPolling()
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/whatsapp/instance')
        if (res.ok) {
          const data = await res.json()
          if (data.connected || data.status === 'CONNECTED') {
            setWhatsappStatus('CONNECTED')
            stopWhatsappPolling()
            stopQrTimer()
            toast.success('¡WhatsApp conectado con éxito! 🎉')
          } else if (data.status === 'QRCODE' && data.base64) {
            setWhatsappStatus('QRCODE')
            setQrCodeBase64(data.base64)
          }
        }
      } catch (e) {
        console.error('Error polling whatsapp status:', e)
      }
    }, 5000)
  }

  const stopWhatsappPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
  }

  const triggerWhatsappConnect = async () => {
    setWhatsappStatus('LOADING')
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      })
      const data = await res.json()
      
      if (data.connected || data.status === 'CONNECTED') {
        setWhatsappStatus('CONNECTED')
        toast.success('¡WhatsApp conectado!')
      } else if (data.status === 'QRCODE') {
        setWhatsappStatus('QRCODE')
        setQrCodeBase64(data.base64 || data.qr)
        startQrTimer()
        startWhatsappPolling()
      } else {
        setWhatsappStatus('DISCONNECTED')
      }
    } catch (err) {
      console.error('Error connecting WhatsApp:', err)
      setWhatsappStatus('ERROR')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true)
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          const data = await res.json()
          setProductForm(f => ({ ...f, imageUrl: data.url }))
          toast.success('Imagen cargada correctamente.')
        } else {
          toast.error('Error al subir la imagen del producto.')
        }
      } catch (err) {
        console.error(err)
        toast.error('Fallo de conexión al subir imagen.')
      } finally {
        setUploadingImage(false)
      }
    }
  }

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) return
    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock) || 10,
          description: productForm.description,
          imageUrl: productForm.imageUrl,
          active: true,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAddedProducts(prev => [data.product, ...prev])
        setProductForm({
          name: '',
          price: '',
          stock: '10',
          description: '',
          imageUrl: '',
        })
        toast.success('Producto añadido al catálogo.')
      } else {
        toast.error('Error al guardar el producto.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Fallo de red al agregar producto.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAddedProducts(prev => prev.filter(p => p.id !== id))
        toast.success('Producto removido.')
      }
    } catch (e) {
      console.error('Error removing product', e)
    }
  }

  const handleNext = async () => {
    setError('')
    
    if (currentStep === 2) {
      if (!storeForm.name || !storeForm.slug || !storeForm.whatsapp) {
        setError('Por favor completa todos los campos del negocio.')
        return
      }
      
      setLoading(true)
      try {
        const res = await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(storeForm)
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'El slug ya podría estar en uso. Prueba con otro.')
          setLoading(false)
          return
        }

        const data = await res.json()
        setCreatedStore(data.store)
        toast.success('¡Negocio configurado!')
      } catch (err) {
        setError('Error al registrar la información del negocio.')
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }
    }

    if (currentStep === 4 && addedProducts.length === 0) {
      toast.warning('Añade al menos 1 producto para continuar.')
      return
    }

    if (currentStep === 6) {
      setLoading(true)
      try {
        const res = await fetch('/api/stores', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            welcomeMessage: preferences.welcomeMessage,
            systemPrompt: preferences.systemPrompt,
            businessHours: preferences.businessHours,
            themeColor: preferences.themeColor,
            settings: { businessProfile }
          })
        })
        if (!res.ok) {
          toast.error('Fallo al guardar tus preferencias.')
          setLoading(false)
          return
        }
      } catch (err) {
        console.error(err)
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }
    }

    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 8) {
      if (currentStep === 3) {
        stopWhatsappPolling()
        stopQrTimer()
      }
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFinishOnboarding = async () => {
    setLoading(true)
    try {
      await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      })
      if (createdStore?.id) {
        document.cookie = `active_store_id=${createdStore.id}; path=/; max-age=31536000`
      }
      document.cookie = `create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`
      window.location.href = '/dashboard'
    } catch (e) {
      console.error(e)
      window.location.href = '/dashboard'
    } finally {
      setLoading(false)
    }
  }

  // Upgrade to Pro Gate
  if (isNewStore && !isPro && hasExistingStores) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-50 font-sans p-4 select-none">
        <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 text-center shadow-lg space-y-6 animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-500 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">Actualiza a Pro</h2>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              Has alcanzado el límite de 1 tienda en el plan Gratuito. Para crear y administrar múltiples tiendas en tu workspace, actualiza tu suscripción.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button 
              onClick={() => { window.location.href = '/pricing' }}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              Ver planes de suscripción
            </button>
            
            <button 
              onClick={() => {
                document.cookie = "create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
                window.location.reload()
              }}
              className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
            >
              Volver a mi tienda
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (initializing) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-zinc-950" />
          <span className="text-xs text-zinc-400 font-bold tracking-wider">Cargando Onboarding...</span>
        </div>
      </div>
    )
  }

  const currentStepData = STEPS.find(s => s.num === currentStep) || STEPS[0]
  const storeDisplayName = storeForm.name.trim() || 'Tu Tienda'
  const storeDisplaySlug = storeForm.slug.trim() || 'tu-tienda'
  const primaryProduct = addedProducts[0] || (productForm.name ? {
    name: productForm.name,
    price: parseFloat(productForm.price) || 25000,
    imageUrl: productForm.imageUrl || '/red_floral_dress.png',
    stock: productForm.stock || 10
  } : null)

  return (
    <div className="w-full h-screen flex flex-col bg-white overflow-hidden font-sans text-left selection:bg-zinc-900 selection:text-white">
      
      {/* 1. TOP HEADER (Identical aesthetic to /dashboard breadcrumb header) */}
      <header className="h-14 w-full shrink-0 items-center justify-between border-b border-zinc-200/80 bg-[#FAFAFA] px-6 sticky top-0 z-40 flex">
        
        {/* Brand & Setup Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center shadow-xs">
            <Zap className="h-4.5 w-4.5 text-white fill-current" />
          </div>
          
          <span className="text-zinc-300 font-light select-none">/</span>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-950 tracking-tight">Flashcheckouts</span>
            <span className="text-zinc-300 font-light select-none">/</span>
            <span className="text-xs font-semibold text-zinc-500">Configuración de Tienda</span>
          </div>
        </div>

        {/* Center: Dynamic Step Timeline Pills */}
        <div className="hidden md:flex items-center gap-1.5 select-none bg-white border border-zinc-200/80 py-1.5 px-3 rounded-full shadow-2xs">
          <div className="flex items-center gap-1 mr-2">
            {STEPS.map((s) => {
              const isPast = s.num < currentStep
              const isCurrent = s.num === currentStep
              return (
                <div
                  key={s.num}
                  title={`${s.num}. ${s.label}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    isCurrent ? "w-6 bg-zinc-950" : isPast ? "w-2.5 bg-emerald-500" : "w-1.5 bg-zinc-200"
                  )}
                />
              )
            })}
          </div>
          <span className="text-[11px] font-bold text-zinc-900 tracking-tight">
            Paso {currentStep} de 8
          </span>
          <span className="text-zinc-300 text-xs">•</span>
          <span className="text-[11px] font-semibold text-zinc-500 truncate max-w-[140px]">
            {currentStepData.shortLabel}
          </span>
        </div>

        {/* Right Status & User Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Guardado automático</span>
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

          <CustomUserMenu />
        </div>
      </header>

      {/* 2. SPLIT-SCREEN MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: ACTIVE STEP FORM (54%) */}
        <div className="flex-1 lg:w-[54%] xl:w-[52%] flex flex-col justify-between overflow-y-auto custom-scrollbar border-r border-zinc-200/80 bg-white">
          
          <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-2xl mx-auto w-full flex flex-col justify-center">
            
            {/* Step Metadata Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                Paso {currentStep} de 8 • {currentStepData.category}
              </span>
              {currentStep > 1 && currentStep !== 8 && (
                <span className="text-[11px] text-zinc-400 font-semibold">
                  {Math.round((currentStep / 8) * 100)}% completado
                </span>
              )}
            </div>

            {/* STEP 1: BIENVENIDA */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
                    Bienvenido a Flashcheckouts
                  </h1>
                  <p className="text-sm md:text-base font-semibold text-zinc-700">
                    La plataforma AI-First para vender automáticamente por WhatsApp.
                  </p>
                  <p className="text-xs md:text-sm text-zinc-500 font-medium leading-relaxed">
                    Configura tu tienda en menos de 5 minutos. Nova atenderá a tus compradores, enviará tu catálogo y cerrará ventas 24/7.
                  </p>
                </div>

                {/* 2x2 Bento Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-950">Venta 24/7 por WhatsApp</h3>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
                      Nova atiende clientes, responde preguntas y concreta carritos de compra sin pausas.
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-950">Catálogo Inteligente</h3>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
                      Sube fotos, sincroniza precios y comparte tu menú visual instantáneamente.
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-950">Pagos Automatizados</h3>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
                      Recibe pagos por Nequi, Daviplata, Mercado Pago o PSE con validación segura.
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-200/90 rounded-xl bg-white hover:border-zinc-300 hover:shadow-xs transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 mb-3 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-950">Control Centralizado</h3>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-snug">
                      Métricas en tiempo real, trazabilidad de pedidos y gestión de clientes desde tu panel.
                    </p>
                  </div>
                </div>

                {/* Guarantee Banner */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-zinc-950 shrink-0" />
                    <span className="text-xs font-semibold text-zinc-800">
                      Configuración guiada y sin complicaciones en pocos clics.
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 bg-white border border-zinc-200 px-2 py-0.5 rounded-full shrink-0">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>~3 min</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: INFORMACIÓN DEL NEGOCIO */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                    Información de tu negocio
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Personaliza la identidad y el link público de tu tienda en Flashcheckouts.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Store Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="storeName" className="text-xs font-bold text-zinc-700 block">
                      Nombre de la tienda <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="storeName"
                      type="text"
                      required
                      placeholder="Ej. Boutique Bella Vista"
                      className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all"
                      value={storeForm.name}
                      onChange={e => {
                        const name = e.target.value
                        setStoreForm(f => ({
                          ...f,
                          name,
                          slug: generateSlug(name)
                        }))
                      }}
                    />
                  </div>

                  {/* Slug / Web Address */}
                  <div className="space-y-1.5">
                    <label htmlFor="storeSlug" className="text-xs font-bold text-zinc-700 block">
                      Dirección web única (Slug) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center bg-zinc-50/60 border border-zinc-200/90 rounded-xl overflow-hidden focus-within:border-zinc-950 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-950/5 transition-all">
                      <span className="pl-3.5 pr-1 text-xs font-semibold text-zinc-400 select-none shrink-0">
                        flash.checkout/tienda/
                      </span>
                      <input
                        id="storeSlug"
                        type="text"
                        required
                        placeholder="boutique-bella"
                        className="flex-1 px-1 py-2.5 text-xs border-none bg-transparent focus:outline-none font-bold text-zinc-950 min-w-0"
                        value={storeForm.slug}
                        onChange={e => setStoreForm(f => ({ ...f, slug: generateSlug(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-1.5">
                    <label htmlFor="storeWhatsapp" className="text-xs font-bold text-zinc-700 block">
                      Número de WhatsApp del Negocio <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="storeWhatsapp"
                      type="tel"
                      required
                      placeholder="573001234567"
                      className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all tabular-nums"
                      value={storeForm.whatsapp}
                      onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '') }))}
                    />
                    <p className="text-[11px] text-zinc-400 font-medium">
                      Ingresa el número con el código de país sin espacios ni signo "+" (Ej: Colombia: 57).
                    </p>
                  </div>

                  {/* Category Pills */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-zinc-700 block">Categoría principal</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'Moda', icon: Shirt, label: 'Moda & Ropa' },
                        { id: 'Tecnología', icon: Smartphone, label: 'Tecnología' },
                        { id: 'Hogar', icon: Home, label: 'Hogar & Deco' },
                        { id: 'Comida', icon: Utensils, label: 'Comida & Bebidas' },
                        { id: 'Deportes', icon: Dumbbell, label: 'Fitness & Deporte' },
                        { id: 'Otros', icon: MoreHorizontal, label: 'Servicios / Otros' }
                      ].map(cat => {
                        const isSelected = storeForm.category === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setStoreForm(f => ({ ...f, category: cat.id }))}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-98",
                              isSelected
                                ? "bg-zinc-950 border-zinc-950 text-white shadow-xs"
                                : "bg-white border-zinc-200/90 text-zinc-700 hover:bg-zinc-50"
                            )}
                          >
                            <cat.icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-white" : "text-zinc-400")} />
                            <span className="text-[11px] font-bold tracking-tight">{cat.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: CONECTA WHATSAPP */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
                    Conecta tu WhatsApp
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Escanea el código QR con WhatsApp Business para activar las respuestas automáticas de Nova.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-1">
                  
                  {/* Left QR Container */}
                  <div className="border border-zinc-200/90 rounded-2xl p-5 bg-white flex flex-col justify-between items-center text-center gap-4">
                    
                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-zinc-50 border border-zinc-200/70 select-none">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        whatsappStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
                      )} />
                      <span>{whatsappStatus === 'CONNECTED' ? 'Conectado con éxito' : 'Esperando vinculación'}</span>
                    </div>

                    {/* QR Display */}
                    <div className="w-48 h-48 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
                      {whatsappStatus === 'LOADING' ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-7 h-7 animate-spin text-zinc-950" />
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Generando QR...</span>
                        </div>
                      ) : whatsappStatus === 'QRCODE' && qrCodeBase64 ? (
                        <img 
                          src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                          alt="QR de conexión" 
                          className="w-full h-full object-contain"
                        />
                      ) : whatsappStatus === 'CONNECTED' ? (
                        <div className="flex flex-col items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="w-12 h-12 text-emerald-500 stroke-[2.5px]" />
                          <span className="text-xs font-bold">¡WhatsApp Vinculado!</span>
                        </div>
                      ) : (
                        <button 
                          onClick={triggerWhatsappConnect}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl px-4 py-2.5 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          Generar código QR
                        </button>
                      )}
                    </div>

                    {/* Timer or Refresh */}
                    {whatsappStatus === 'QRCODE' && (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-600">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Expira en {formatTime(qrExpiresIn)}</span>
                        <button 
                          onClick={triggerWhatsappConnect}
                          className="text-zinc-400 hover:text-zinc-900 ml-1 cursor-pointer" 
                          title="Regenerar QR"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Instruction Steps */}
                  <div className="border border-zinc-200/90 rounded-2xl p-5 bg-zinc-50/50 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                        Pasos para escanear:
                      </h4>

                      <div className="space-y-2.5">
                        {[
                          "Abre WhatsApp o WhatsApp Business en tu celular.",
                          "Entra a Configuración > Dispositivos vinculados.",
                          "Toca en 'Vincular un dispositivo' y apunta la cámara a la pantalla."
                        ].map((txt, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 font-semibold leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-white border border-zinc-200 text-zinc-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{txt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-zinc-200/80 rounded-xl text-[11px] text-zinc-500 font-medium">
                      💡 ¿No tienes tu celular a mano? Puedes continuar y conectar tu número más tarde desde la sección de Configuración.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CATÁLOGO DE PRODUCTOS */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                    Catálogo de productos
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Añade al menos un producto para que Nova empiece a recomendarlo en tus chats.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Product Form Card */}
                  <div className="border border-zinc-200/90 rounded-2xl p-5 bg-white space-y-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="prodName" className="text-xs font-bold text-zinc-700 block">
                        Nombre del producto <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="prodName"
                        type="text"
                        placeholder="Ej. Vestido Floral Rojo (Talla M)"
                        className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all"
                        value={productForm.name}
                        onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="prodPrice" className="text-xs font-bold text-zinc-700 block">
                          Precio en COP <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="prodPrice"
                          type="number"
                          placeholder="25000"
                          className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all tabular-nums"
                          value={productForm.price}
                          onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="prodStock" className="text-xs font-bold text-zinc-700 block">
                          Stock inicial
                        </label>
                        <input
                          id="prodStock"
                          type="number"
                          placeholder="10"
                          className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all tabular-nums"
                          value={productForm.stock}
                          onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="prodDesc" className="text-xs font-bold text-zinc-700 block">
                        Descripción o detalles (Opcional)
                      </label>
                      <textarea
                        id="prodDesc"
                        rows={2}
                        placeholder="Color, talla, materiales o información de entrega..."
                        className="w-full bg-white border border-zinc-200/90 rounded-xl p-3 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all resize-none leading-relaxed"
                        value={productForm.description}
                        onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                      />
                    </div>

                    {/* Image Upload Area */}
                    <div className="flex items-center gap-3 pt-1">
                      <label className="flex items-center gap-2 border border-zinc-200/90 rounded-xl px-3.5 py-2 cursor-pointer text-xs font-bold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-all shrink-0">
                        <Upload className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{productForm.imageUrl ? 'Cambiar imagen' : 'Subir foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      {uploadingImage && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                          <span>Subiendo imagen...</span>
                        </div>
                      )}

                      {productForm.imageUrl && !uploadingImage && (
                        <div className="flex items-center gap-2">
                          <img src={productForm.imageUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border" />
                          <span className="text-[11px] font-bold text-emerald-600">✓ Foto lista</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleAddProduct}
                      disabled={loading || !productForm.name || !productForm.price}
                      className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir al Catálogo
                    </button>
                  </div>

                  {/* Added Products Pill List */}
                  {addedProducts.length > 0 && (
                    <div className="border border-zinc-200/80 rounded-2xl p-4 bg-zinc-50/50 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-800 pb-1">
                        <span>Productos registrados ({addedProducts.length})</span>
                        <span className="text-emerald-600 text-[11px]">✓ Catálogo activo</span>
                      </div>
                      
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                        {addedProducts.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-2.5 bg-white border border-zinc-200/80 rounded-xl">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-zinc-900 truncate leading-tight">{p.name}</h4>
                                <span className="text-[10px] text-zinc-400 font-semibold">Stock: {p.stock} uds</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-bold text-zinc-950 tabular-nums">
                                ${p.price?.toLocaleString('es-CO')} COP
                              </span>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: MÉTODOS DE PAGO */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                    Métodos de pago
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Configura cómo tus clientes transferirán el dinero de sus compras en WhatsApp.
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* Manual Payment Option */}
                  <label className={cn(
                    "flex items-start gap-3.5 p-4 border rounded-2xl transition-all cursor-pointer",
                    payments.manual 
                      ? "bg-white border-zinc-950 ring-1 ring-zinc-950/10 shadow-xs" 
                      : "bg-white border-zinc-200/80 hover:bg-zinc-50"
                  )}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-zinc-950 border-zinc-300 rounded focus:ring-0 cursor-pointer"
                      checked={payments.manual}
                      onChange={e => setPayments(p => ({ ...p, manual: e.target.checked }))}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                          Transferencia Directa (Nequi / Daviplata / Bancolombia)
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                        Tus compradores envían la captura del comprobante por WhatsApp y podrás auditarlo y confirmarlo fácilmente con un clic desde el panel.
                      </p>
                    </div>
                  </label>

                  {/* Mercado Pago Option */}
                  <label className={cn(
                    "flex items-start gap-3.5 p-4 border rounded-2xl transition-all cursor-pointer",
                    payments.mercadopago 
                      ? "bg-white border-zinc-950 ring-1 ring-zinc-950/10 shadow-xs" 
                      : "bg-white border-zinc-200/80 hover:bg-zinc-50"
                  )}>
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-zinc-950 border-zinc-300 rounded focus:ring-0 cursor-pointer"
                      checked={payments.mercadopago}
                      onChange={e => setPayments(p => ({ ...p, mercadopago: e.target.checked }))}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-950 flex items-center gap-1.5">
                          Mercado Pago Connect
                          <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                        </span>
                        <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Tarjetas & PSE
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                        Cobra con tarjetas de crédito, débito, PSE y puntos de pago en efectivo. Podrás vincular tu cuenta oficial de Mercado Pago en cualquier momento.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 6: PREFERENCIAS & MEMORIA DE NOVA */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                    Preferencias & Memoria de Nova
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Dale a tu agente de IA el contexto de tu marca para que hable exactamente como tú.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Context Cards */}
                  <div className="bg-zinc-50/70 border border-zinc-200/80 rounded-2xl p-4.5 space-y-3.5">
                    <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">
                      🧠 Memoria de Negocio para Nova
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-700 block">Nicho o productos</label>
                        <input
                          type="text"
                          placeholder="Ej: Joyería artesanal y plata 925"
                          value={businessProfile.niche}
                          onChange={e => setBusinessProfile(prev => ({ ...prev, niche: e.target.value }))}
                          className="w-full bg-white border border-zinc-200/90 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-700 block">Tono de voz de la marca</label>
                        <select
                          value={businessProfile.brandTone}
                          onChange={e => setBusinessProfile(prev => ({ ...prev, brandTone: e.target.value }))}
                          className="w-full bg-white border border-zinc-200/90 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none cursor-pointer"
                        >
                          <option value="Sofisticado y elegante">Sofisticado y elegante</option>
                          <option value="Amigable y cercano">Amigable y cercano</option>
                          <option value="Profesional y directo">Profesional y directo</option>
                          <option value="Divertido e informal">Divertido e informal</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 block">Público objetivo</label>
                      <input
                        type="text"
                        placeholder="Ej: Hombres y mujeres de 20 a 45 años que buscan regalos únicos"
                        value={businessProfile.targetAudience}
                        onChange={e => setBusinessProfile(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className="w-full bg-white border border-zinc-200/90 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="welcomeMessage" className="text-xs font-bold text-zinc-700 block">
                      Mensaje de saludo inicial en WhatsApp
                    </label>
                    <textarea
                      id="welcomeMessage"
                      rows={2}
                      className="w-full bg-white border border-zinc-200/90 rounded-xl p-3 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all resize-none leading-relaxed"
                      value={preferences.welcomeMessage}
                      onChange={e => setPreferences(p => ({ ...p, welcomeMessage: e.target.value }))}
                    />
                  </div>

                  {/* Business Hours */}
                  <div className="space-y-1.5">
                    <label htmlFor="businessHours" className="text-xs font-bold text-zinc-700 block">
                      Horarios de atención
                    </label>
                    <input
                      id="businessHours"
                      type="text"
                      className="w-full bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-950 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/5 transition-all"
                      value={preferences.businessHours}
                      onChange={e => setPreferences(p => ({ ...p, businessHours: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: REVISA Y CONFIRMA */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                    Revisa y confirma
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium">
                    Verifica los datos de tu nueva tienda antes de ponerla en producción.
                  </p>
                </div>

                <div className="border border-zinc-200/90 rounded-2xl bg-zinc-50/50 p-5 space-y-3 text-xs font-semibold text-zinc-700">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
                    <span className="text-zinc-500">Nombre de la Tienda</span>
                    <span className="font-bold text-zinc-950">{storeForm.name || 'Sin especificar'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
                    <span className="text-zinc-500">Enlace público</span>
                    <span className="font-bold text-zinc-950 bg-white border border-zinc-200 px-2 py-0.5 rounded-lg text-[11px]">
                      flash.checkout/tienda/{storeForm.slug}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
                    <span className="text-zinc-500">Estado de WhatsApp</span>
                    <span className={cn(
                      "font-bold px-2 py-0.5 rounded-full text-[10px]",
                      whatsappStatus === 'CONNECTED' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    )}>
                      {whatsappStatus === 'CONNECTED' ? 'Conectado ✓' : 'Pendiente de escaneo'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
                    <span className="text-zinc-500">Productos en Catálogo</span>
                    <span className="font-bold text-zinc-950">{addedProducts.length} productos registrados</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-zinc-200/80">
                    <span className="text-zinc-500">Cobranza</span>
                    <span className="font-bold text-zinc-950">
                      {[payments.manual ? 'Nequi/Daviplata' : null, payments.mercadopago ? 'Mercado Pago' : null].filter(Boolean).join(' + ') || 'Manual'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-500">Tono de Nova</span>
                    <span className="font-bold text-zinc-950">{businessProfile.brandTone}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tu tienda está lista para ser activada y empezar a recibir clientes.</span>
                </div>
              </div>
            )}

            {/* STEP 8: COMPLETION SUCCESS */}
            {currentStep === 8 && (
              <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-8 h-8 stroke-[3px]" />
                </div>
                
                <div className="space-y-1.5">
                  <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950">
                    ¡Tu tienda está lista! 🎉
                  </h2>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    Lanzada en producción con éxito
                  </p>
                </div>

                <p className="text-xs md:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed font-medium">
                  Hemos configurado tu tienda <strong className="text-zinc-950">{storeDisplayName}</strong>. Nova ya está lista para responder mensajes, enviar tu catálogo y procesar pedidos en tiempo real.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleFinishOnboarding}
                    disabled={loading}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl px-6 py-3 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Iniciando tu panel...
                      </>
                    ) : (
                      <>
                        Ir al Panel de Control
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM PERSISTENT NAVIGATION BAR */}
          {currentStep !== 8 && (
            <footer className="h-18 px-6 md:px-12 border-t border-zinc-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between sticky bottom-0 z-30">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 border border-zinc-200/90 hover:bg-zinc-50 rounded-xl px-4 py-2.5 transition-all cursor-pointer select-none active:scale-98"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleNext}
                  disabled={
                    loading || 
                    (currentStep === 2 && (!storeForm.name || !storeForm.slug || !storeForm.whatsapp)) ||
                    (currentStep === 4 && addedProducts.length === 0)
                  }
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl px-5 py-2.5 active:scale-98 transition-all flex items-center gap-2 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      {currentStep === 1 
                        ? 'Comenzar ahora' 
                        : currentStep === 7 
                        ? 'Confirmar y Lanzar' 
                        : 'Continuar'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </footer>
          )}

        </div>

        {/* RIGHT COLUMN: DYNAMIC LIVE WHATSAPP & STORE PREVIEW (46%) */}
        <div className="hidden lg:flex flex-1 lg:w-[46%] xl:w-[48%] bg-[#F8F9FA] p-6 xl:p-8 flex-col justify-between items-center relative overflow-hidden select-none">
          
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-zinc-950/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Preview Status Bar */}
          <div className="w-full max-w-[340px] flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-zinc-900 tracking-tight">
                Vista previa en tiempo real
              </span>
            </div>

            {/* Device Switcher Pills */}
            <div className="flex items-center gap-1 bg-white border border-zinc-200/80 rounded-full p-1 shadow-2xs">
              <button
                onClick={() => setPreviewTab('chat')}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                  previewTab === 'chat' 
                    ? "bg-zinc-950 text-white shadow-xs" 
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                WhatsApp Nova
              </button>
              <button
                onClick={() => setPreviewTab('catalog')}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                  previewTab === 'catalog' 
                    ? "bg-zinc-950 text-white shadow-xs" 
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Catálogo Web
              </button>
            </div>
          </div>

          {/* SMARTPHONE DEVICE FRAME */}
          <div className="my-auto w-[310px] xl:w-[325px] aspect-[9/18.5] bg-zinc-950 rounded-[44px] p-2.5 shadow-2xl border-4 border-zinc-800/80 relative flex flex-col overflow-hidden z-10 transition-all duration-300">
            
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-950 rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 ml-auto mr-1" />
            </div>

            {/* Screen Inner Display */}
            <div className="w-full h-full bg-[#EFEAE2] rounded-[36px] overflow-hidden flex flex-col relative text-left">
              
              {/* WhatsApp App Header */}
              <div className="bg-[#075E54] pt-7 pb-2.5 px-3 text-white flex items-center justify-between shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ChevronLeft className="w-4 h-4 text-white shrink-0" />
                  <div className="w-7 h-7 rounded-full bg-white/20 p-0.5 flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                    <img src="/nova_robot_mascot.png" alt="Nova" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold leading-none truncate max-w-[130px]">
                        Nova • {storeDisplayName}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-[#25D366] fill-white stroke-[2px] shrink-0" />
                    </div>
                    <span className="text-[8px] text-emerald-100 block mt-0.5 leading-none">
                      en línea
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-white/80 shrink-0" />
              </div>

              {/* VIEW 1: WHATSAPP CHAT FLOW */}
              {previewTab === 'chat' && (
                <>
                  <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar flex flex-col justify-end text-[10px]">
                    
                    {/* Date Pill */}
                    <div className="self-center bg-white/80 backdrop-blur-xs text-zinc-600 px-2.5 py-0.5 rounded-full text-[8px] font-bold shadow-2xs border border-zinc-200/50">
                      HOY
                    </div>

                    {/* Message 1: Buyer */}
                    <div className="bg-[#E1F3D4] self-end rounded-xl rounded-tr-xs p-2 max-w-[85%] text-zinc-900 shadow-2xs">
                      <p className="leading-snug">Hola, buenas tardes 👋 ¿Tienen catálogo disponible?</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-zinc-400">
                        <span>10:41 AM</span>
                        <CheckCheck className="w-3 h-3 text-[#34B7F1]" />
                      </div>
                    </div>

                    {/* Message 2: Nova Welcome + Store Link */}
                    <div className="bg-white self-start rounded-xl rounded-tl-xs p-2.5 max-w-[88%] text-zinc-900 shadow-2xs space-y-2 border border-zinc-200/40">
                      <p className="leading-snug">
                        {currentStep >= 6 && preferences.welcomeMessage ? (
                          preferences.welcomeMessage
                        ) : (
                          <>¡Hola! Te damos la bienvenida a <strong>{storeDisplayName}</strong> ✨ ¿Qué producto te gustaría conocer hoy?</>
                        )}
                      </p>

                      {/* Store Link Card */}
                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-2 flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#075E54] rounded-md flex items-center justify-center text-white shrink-0">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-[9px] font-bold text-zinc-900 leading-none truncate">
                            {storeDisplayName}
                          </h5>
                          <span className="text-[8px] text-zinc-400 truncate block mt-0.5">
                            flash.checkout/tienda/{storeDisplaySlug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end text-[8px] text-zinc-400">
                        <span>10:41 AM</span>
                      </div>
                    </div>

                    {/* Message 3: Buyer asks for product */}
                    <div className="bg-[#E1F3D4] self-end rounded-xl rounded-tr-xs p-2 max-w-[85%] text-zinc-900 shadow-2xs">
                      <p className="leading-snug">
                        {primaryProduct ? `Me interesa ${primaryProduct.name}` : 'Quiero ver sus productos estrella.'}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-zinc-400">
                        <span>10:42 AM</span>
                        <CheckCheck className="w-3 h-3 text-[#34B7F1]" />
                      </div>
                    </div>

                    {/* Message 4: Nova Interactive Product Card */}
                    <div className="bg-white self-start rounded-xl rounded-tl-xs p-2.5 max-w-[88%] text-zinc-900 shadow-2xs space-y-2 border border-zinc-200/40">
                      <p className="leading-snug">
                        ¡Excelente elección! 🌸 Lo tenemos disponible para entrega inmediata:
                      </p>

                      {/* Interactive Product Card */}
                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-2 space-y-2">
                        <div className="flex items-center gap-2">
                          {primaryProduct?.imageUrl ? (
                            <img 
                              src={primaryProduct.imageUrl} 
                              alt="Producto" 
                              className="w-10 h-10 rounded-lg object-cover border shrink-0 bg-white" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h6 className="text-[9px] font-bold text-zinc-900 leading-tight truncate">
                              {primaryProduct?.name || 'Vestido Floral Rojo (Talla M)'}
                            </h6>
                            <p className="text-[9px] font-extrabold text-emerald-600 mt-0.5">
                              ${(primaryProduct?.price || 25000).toLocaleString('es-CO')} COP
                            </p>
                          </div>
                        </div>

                        {/* Payment CTA Button */}
                        <div className="w-full bg-[#059669] text-white font-bold text-[8.5px] rounded-lg py-1.5 flex items-center justify-center gap-1 shadow-2xs">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          <span>Pagar con Smart Pay</span>
                        </div>
                      </div>

                      {/* Payment Methods Indicator */}
                      <div className="flex items-center justify-between text-[7.5px] text-zinc-400 font-semibold pt-0.5">
                        <span>{payments.manual ? '✓ Nequi / Daviplata' : ''} {payments.mercadopago ? '✓ Mercado Pago' : ''}</span>
                        <span>10:42 AM</span>
                      </div>
                    </div>

                  </div>

                  {/* WhatsApp Input Bar */}
                  <div className="p-2 bg-[#F0F2F5] border-t border-zinc-200 flex items-center gap-1.5 shrink-0 select-none">
                    <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center justify-between border border-zinc-200/60 min-w-0">
                      <span className="text-[8.5px] text-zinc-400 font-medium truncate">Escribe un mensaje...</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#075E54] flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Send className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </>
              )}

              {/* VIEW 2: WEB STORE CATALOG PREVIEW */}
              {previewTab === 'catalog' && (
                <div className="flex-1 bg-white p-3 overflow-y-auto custom-scrollbar flex flex-col justify-start space-y-3">
                  <div className="text-center py-2 border-b border-zinc-100">
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-zinc-400 block">Tienda Oficial</span>
                    <h4 className="text-xs font-bold text-zinc-900">{storeDisplayName}</h4>
                    <span className="text-[8px] text-emerald-600 font-bold">● Abierto ahora</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-zinc-900 block">Productos destacados:</span>
                    
                    {addedProducts.length === 0 ? (
                      <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center text-zinc-400 text-[9px]">
                        Añade productos en el paso 4 para verlos aquí
                      </div>
                    ) : (
                      addedProducts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200/80 rounded-xl">
                          <div className="flex items-center gap-2">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-7 h-7 rounded-md object-cover border" />
                            ) : (
                              <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center text-zinc-400">
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <h6 className="text-[8.5px] font-bold text-zinc-900 truncate max-w-[110px]">{p.name}</h6>
                              <span className="text-[8px] text-emerald-600 font-bold">${p.price?.toLocaleString('es-CO')}</span>
                            </div>
                          </div>
                          <span className="bg-zinc-950 text-white text-[7.5px] font-bold px-2 py-0.5 rounded">Comprar</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Context Pill */}
          <div className="w-full max-w-[340px] p-3 bg-white border border-zinc-200/80 rounded-2xl flex items-center gap-3 shadow-2xs z-10">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h5 className="text-[11px] font-bold text-zinc-950 leading-tight">
                {currentStepData.label}
              </h5>
              <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                {currentStepData.desc}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
