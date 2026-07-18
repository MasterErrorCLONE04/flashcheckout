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
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import CustomUserMenu from '@/components/dashboard/CustomUserMenu'

type StepType = {
  num: number
  label: string
  desc: string
}

const STEPS: StepType[] = [
  { num: 1, label: 'Bienvenido', desc: 'Paso 1 de 8' },
  { num: 2, label: 'Información de tu negocio', desc: 'Paso 2 de 8' },
  { num: 3, label: 'Conecta WhatsApp', desc: 'Paso 3 de 8' },
  { num: 4, label: 'Catálogo de productos', desc: 'Paso 4 de 8' },
  { num: 5, label: 'Métodos de pago', desc: 'Paso 5 de 8' },
  { num: 6, label: 'Preferencias de tienda', desc: 'Paso 6 de 8' },
  { num: 7, label: 'Revisa y confirma', desc: 'Paso 7 de 8' },
  { num: 8, label: '¡Listo!', desc: 'Paso 8 de 8' }
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
  const [qrExpiresIn, setQrExpiresIn] = useState(180) // 3 minutes in seconds
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
    welcomeMessage: '¡Hola! Bienvenido a nuestra tienda de WhatsApp. 🤖 ¿En qué te puedo ayudar hoy?',
    systemPrompt: 'Eres Nova, un asistente de ventas de WhatsApp empático y proactivo. Tu objetivo es guiar al cliente por el catálogo, ayudarle a armar su carrito y motivarlo a concretar el pago mediante Smart Pay.',
    businessHours: 'Lunes a Viernes 8:00 AM - 6:00 PM',
    themeColor: 'emerald'
  })

  // Business Profile for Nova Memory (Chocodate Style Onboarding)
  const [businessProfile, setBusinessProfile] = useState({
    niche: '',
    targetAudience: '',
    brandTone: 'Sofisticado y elegante',
    coreProposition: ''
  })

  // Check database state on mount to prevent skipping and restore step context
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
              name: data.store.name,
              slug: data.store.slug,
              whatsapp: data.store.whatsapp,
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
            
            // Check connected WhatsApp status
            if (data.store.whatsappConnected) {
              setWhatsappStatus('CONNECTED')
            }

            // Fetch products count
            const productsRes = await fetch('/api/products')
            const productsData = await productsRes.json()
            const prods = productsData.products || []
            setAddedProducts(prods)

            // Determine correct onboarding step based on completed fields
            if (prods.length === 0) {
              setCurrentStep(4) // Need to add first product
            } else if (!data.store.welcomeMessage) {
              setCurrentStep(6) // Need to set store/bot preferences
            } else {
              setCurrentStep(8) // Ready screen
            }
          } else {
            setCurrentStep(1) // Normal fresh start
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
  }, [])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // QR Timer count-down
  const startQrTimer = () => {
    stopQrTimer()
    setQrExpiresIn(180)
    timerRef.current = setInterval(() => {
      setQrExpiresIn(prev => {
        if (prev <= 1) {
          stopQrTimer()
          // Re-trigger WhatsApp connection to get a new QR
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

  // Polling to check WhatsApp state
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

  // Trigger Evolution API Connection
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

  // File upload logic for product image
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
          toast.success('Imagen de producto cargada correctamente.')
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

  // Add Product to database
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

  // Next step handler
  const handleNext = async () => {
    setError('')
    
    // Validate Step 2 inputs before saving Store
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
          setError(data.error || 'Fallo al inicializar la tienda. El slug ya podría estar en uso.')
          setLoading(false)
          return
        }

        const data = await res.json()
        setCreatedStore(data.store)
        toast.success('¡Negocio configurado con éxito! 🏪')
      } catch (err) {
        setError('Error al registrar la información del negocio.')
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }
    }

    // Step 4 Catalog protection: Must have at least 1 product
    if (currentStep === 4 && addedProducts.length === 0) {
      toast.warning('Por favor añade al menos 1 producto a tu catálogo para continuar.')
      return
    }

    // Save preferences on Step 6
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
            settings: {
              businessProfile
            }
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
      // Clean intervals if exiting WhatsApp connect step
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
      // Set store active flag on final step
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

  if (isNewStore && !isPro && hasExistingStores) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-50 font-sans p-4 select-none">
        <div className="max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 text-center shadow-lg space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-500 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-zinc-900">Actualiza a Pro</h2>
            <p className="text-sm font-medium text-zinc-500">
              Has alcanzado el límite de 1 tienda en el plan Gratuito. Para crear y administrar múltiples tiendas en tu workspace, actualiza tu suscripción.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button 
              onClick={() => {
                window.location.href = '/pricing'
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              Ver planes de suscripción
            </button>
            
            <button 
              onClick={() => {
                document.cookie = "create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                window.location.reload();
              }}
              className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold text-xs rounded-lg transition-all cursor-pointer"
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
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Cargando Onboarding...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white flex overflow-hidden shadow-none animate-in fade-in duration-300 font-sans text-left">
      
      {/* 1. PROGRESS SIDEBAR (LEFT COLUMN) */}
      <aside className="hidden lg:flex w-[260px] xl:w-[320px] bg-[#FAFAFA] border-r border-zinc-200 p-6 xl:p-8 flex-col justify-between shrink-0 select-none h-full font-sans">
        <div className="space-y-8 xl:space-y-12">
          {/* Logo Brand Header matching /dashboard */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="h-5 w-5 text-white fill-current" />
            </div>
            <span className="text-sm xl:text-base font-bold text-zinc-900 tracking-tight">Flashcheckouts</span>
          </div>

          <div className="space-y-1.5">
            {STEPS.map(s => {
              const isCompleted = s.num < currentStep
              const isActive = s.num === currentStep
              return (
                <div 
                  key={s.num} 
                  className={cn(
                    "flex items-center justify-between p-2.5 xl:p-3 rounded-lg transition-all border",
                    isActive 
                      ? "bg-white border-zinc-200 text-zinc-900 font-bold" 
                      : "border-transparent text-zinc-400"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5px]" />
                      ) : (
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
                          isActive 
                            ? "bg-zinc-900 border-zinc-900 text-white" 
                            : "border-zinc-300 text-zinc-400 bg-white"
                        )}>
                          {s.num}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-xs font-semibold tracking-tight",
                        isActive ? "text-zinc-900 font-bold" : isCompleted ? "text-zinc-600" : "text-zinc-400"
                      )}>
                        {s.label}
                      </h4>
                      <p className="text-[9px] xl:text-[10px] font-medium text-zinc-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-zinc-900" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar Footer User Area */}
        <div className="flex items-center gap-3 border-t border-zinc-200 pt-4 xl:pt-6 px-2">
          <CustomUserMenu />
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase select-none">
            Flashcheckouts v1.0
          </span>
        </div>
      </aside>

      {/* 2. MIDDLE COLUMN (MOCK WHATSAPP PREVIEW - ONLY IN STEP 1) */}
      {currentStep === 1 && (
        <div className="hidden xl:flex w-[350px] xl:w-[400px] 2xl:w-[460px] border-r border-zinc-200 p-8 xl:p-10 flex-col justify-center items-center text-center shrink-0 select-none animate-in slide-in-from-left duration-300 bg-[#FAFAFA] h-full">
          <h4 className="text-[11px] xl:text-xs font-bold text-zinc-500 tracking-wide mb-5">Así vende Nova por ti en WhatsApp</h4>
          
          {/* Smart Phone Frame */}
          <div className="w-[280px] xl:w-[300px] bg-white rounded-[24px] overflow-hidden border border-zinc-200 flex flex-col aspect-[9/17.5] relative">
            {/* Phone Header */}
            <div className="bg-[#075E54] px-2.5 py-2 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <ChevronLeft className="w-3.5 h-3.5 text-zinc-200" />
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="/nova_robot_mascot.png" alt="Nova Avatar" className="w-5 h-5 object-contain" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] font-bold leading-none">Nova</span>
                    <CheckCircle2 className="w-3 h-3 text-[#25D366] fill-white stroke-[2px]" />
                  </div>
                  <span className="text-[7px] text-zinc-200 block mt-0.5">En línea</span>
                </div>
              </div>
              <MoreHorizontal className="w-3.5 h-3.5 text-zinc-200" />
            </div>

            {/* Messages body */}
            <div className="flex-grow p-2 space-y-2 overflow-y-auto custom-scrollbar flex flex-col justify-end bg-zinc-50">
              {/* Message 1: User */}
              <div className="bg-[#E1F3D4] self-end rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-none relative flex flex-col text-left">
                <p className="leading-tight">Hola, quiero ver el catálogo por favor 👋</p>
                <div className="self-end flex items-center gap-0.5 mt-0.5">
                  <span className="text-[7px] text-zinc-400">10:00 AM</span>
                  <span className="text-[8px] text-[#34B7F1] font-bold">✓✓</span>
                </div>
              </div>

              {/* Message 2: Nova */}
              <div className="bg-white self-start rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-none relative flex flex-col gap-1 text-left border border-zinc-150">
                <p className="leading-tight">¡Hola! Bienvenido a Boutique Bella Vista 🌸 Aquí tienes nuestro catálogo:</p>
                
                {/* Store link card */}
                <div className="bg-zinc-50 border border-zinc-150 rounded p-1 flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-[#075E54] rounded flex items-center justify-center text-white shrink-0">
                    <Store className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <h6 className="text-[8px] font-bold text-zinc-900 leading-tight">Ver catálogo</h6>
                    <p className="text-[7px] text-zinc-400 truncate">boutique-bella.flashcheckout.co</p>
                  </div>
                </div>
                <span className="self-end text-[7px] text-zinc-400">10:01 AM</span>
              </div>

              {/* Message 3: User */}
              <div className="bg-[#E1F3D4] self-end rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-none relative flex flex-col text-left">
                <p className="leading-tight">Me interesa el vestido floral rojo en talla M.</p>
                <div className="self-end flex items-center gap-0.5 mt-0.5">
                  <span className="text-[7px] text-zinc-400">10:01 AM</span>
                  <span className="text-[8px] text-[#34B7F1] font-bold">✓✓</span>
                </div>
              </div>

              {/* Message 4: Nova with product card */}
              <div className="bg-white self-start rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-none relative flex flex-col gap-1 text-left border border-zinc-150">
                <p className="leading-tight">¡Excelente elección! 🌸 Nos quedan 3 en stock. Para confirmar tu pedido, puedes pagar de forma segura aquí:</p>
                
                {/* Product Card */}
                <div className="bg-zinc-50 border border-zinc-150 rounded p-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <img src="/red_floral_dress.png" alt="Product" className="w-8 h-10 object-cover rounded border bg-white shrink-0" />
                    <div className="min-w-0">
                      <h6 className="text-[8px] font-bold text-zinc-900 leading-tight truncate font-sans">Vestido Floral Rojo (Talla M)</h6>
                      <p className="text-[8px] font-extrabold text-emerald-600 mt-0.5">$25.000 COP</p>
                    </div>
                  </div>
                  <button className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-[8px] rounded py-1 flex items-center justify-center transition-all cursor-pointer">
                    Pagar ahora
                  </button>
                </div>
                <span className="self-end text-[7px] text-zinc-400">10:02 AM</span>
              </div>
            </div>
            {/* Phone Footer Input Bar */}
            <div className="p-1.5 bg-[#F0F2F5] border-t border-zinc-200 flex items-center gap-1.5 shrink-0 select-none">
              <div className="flex-grow bg-white rounded-full px-2.5 py-1 flex items-center justify-between border border-zinc-200 min-w-0">
                <span className="text-[7.5px] text-zinc-400 font-medium truncate">Escribe un mensaje...</span>
                <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316A2.192 2.192 0 0014.512 4h-5.024c-.587 0-1.13.318-1.435.82L6.827 6.175zM12 16.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                  </svg>
                </div>
              </div>
              <div className="w-5.5 h-5.5 rounded-full bg-[#075E54] flex items-center justify-center text-white cursor-pointer shrink-0">
                <svg className="w-2 h-2 fill-current transform rotate-45 -translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 justify-center mt-6">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          </div>

          <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed max-w-[260px] mt-4">
            Nova atiende tus chats, responde dudas, sugiere productos y cierra la venta con pasarelas de pago automatizadas.
          </p>
        </div>
      )}

      {/* 3. RIGHT CONTENT PANEL */}
      <div className="flex-1 p-6 md:p-8 xl:p-12 flex flex-col justify-between h-full overflow-hidden relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-4">
            {currentStep > 1 && currentStep !== 8 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver
              </button>
            )}
            <div className="lg:hidden shrink-0">
              <CustomUserMenu />
            </div>
          </div>
          <div className="flex items-center gap-3 select-none">
            <span className="text-[10px] font-extrabold text-zinc-450 tracking-wider">
              PASO {currentStep} DE 8
            </span>
            <div className="flex gap-1">
              {STEPS.map(s => (
                <div 
                  key={s.num}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    s.num === currentStep 
                      ? "w-6 bg-zinc-950" 
                      : s.num < currentStep 
                      ? "w-2 bg-zinc-300" 
                      : "w-2 bg-zinc-150"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Middle Step Content */}
        <div className={cn(
          "flex-grow py-6 overflow-y-auto scrollbar-none pr-1",
          (currentStep === 1 || currentStep === 8 || currentStep === 5 || currentStep === 6 || currentStep === 7 || currentStep === 2) && "md:flex md:flex-col md:justify-center"
        )}>
          
          {/* STEP 1: WELCOME SCREEN */}
          {currentStep === 1 && (
            <div className="space-y-6 text-left animate-in fade-in duration-300 max-w-3xl mx-auto w-full">
              <div className="space-y-1.5">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                  Bienvenido a Flashcheckouts
                </h2>
                <p className="text-sm font-semibold text-zinc-800">
                  La plataforma AI First para vender más por WhatsApp.
                </p>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  En pocos minutos tendrás tu tienda lista para empezar a vender.
                </p>
              </div>

              {/* Feature blocks in 2x2 Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-zinc-200 bg-white rounded-lg shadow-none hover:bg-zinc-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-900 leading-none">Vende 24/7 por WhatsApp</h5>
                      <p className="text-[10px] font-semibold text-zinc-400 mt-1 max-w-[210px] leading-tight">Nova responde y vende automáticamente mientras tú te enfocas en tu negocio.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-4 border border-zinc-200 bg-white rounded-lg shadow-none hover:bg-zinc-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-900 leading-none">Catálogo inteligente</h5>
                      <p className="text-[10px] font-semibold text-zinc-400 mt-1 max-w-[210px] leading-tight">Crea tu catálogo en segundos con IA y mantenlo siempre actualizado.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-4 border border-zinc-200 bg-white rounded-lg shadow-none hover:bg-zinc-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-900 leading-none">Cobros seguros</h5>
                      <p className="text-[10px] font-semibold text-zinc-400 mt-1 max-w-[210px] leading-tight">Recibe pagos fácilmente con múltiples métodos de pago integrados.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-4 border border-zinc-200 bg-white rounded-lg shadow-none hover:bg-zinc-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-900 leading-none">Todo en un solo lugar</h5>
                      <p className="text-[10px] font-semibold text-zinc-400 mt-1 max-w-[210px] leading-tight">Gestiona pedidos, clientes, productos y análisis desde tu dashboard.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
                </div>
              </div>

              {/* Sparkles Box */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-zinc-900 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-900 font-bold leading-none">
                      En menos de 5 minutos tendrás tu tienda lista para empezar a vender.
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                      Fácil, rápido y sin complicaciones.
                    </p>
                  </div>
                </div>
                
                {/* 5 min badge */}
                <div className="bg-white border border-zinc-200 px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] text-zinc-650 font-bold shrink-0">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>5 min</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleNext}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg h-11 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Comenzar ahora
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-zinc-450 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  Es gratis. Configura tu tienda sin tarjeta de crédito.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS INFORMATION */}
          {currentStep === 2 && (
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300 text-left w-full">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900">Información de tu negocio</h3>
                <p className="text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Establece tu identidad digital</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="storeName" className="text-[11px] font-bold text-zinc-500">Nombre de la tienda</label>
                  <input
                    id="storeName"
                    type="text"
                    required
                    placeholder="Ej. Boutique Bella Vista"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all"
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

                <div className="space-y-1.5">
                  <label htmlFor="storeSlug" className="text-[11px] font-bold text-zinc-500">Dirección web única (Slug)</label>
                  <div className="flex items-center bg-white border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-950 transition-all">
                    <span className="pl-3 text-xs font-semibold text-zinc-400 select-none shrink-0">flash.checkout/tienda/</span>
                    <input
                      id="storeSlug"
                      type="text"
                      required
                      placeholder="boutique-bella"
                      className="flex-1 px-1 py-2.5 text-xs border-none bg-transparent focus:outline-none font-bold text-zinc-900 min-w-0"
                      value={storeForm.slug}
                      onChange={e => setStoreForm(f => ({ ...f, slug: generateSlug(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="storeWhatsapp" className="text-[11px] font-bold text-zinc-500">WhatsApp del Negocio</label>
                  <input
                    id="storeWhatsapp"
                    type="tel"
                    required
                    placeholder="573001234567"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-955 transition-all tabular-nums"
                    value={storeForm.whatsapp}
                    onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '') }))}
                  />
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Incluye el código de país sin el símbolo "+" (Ej: Colombia: 57)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500">Categoría comercial</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Moda', icon: Shirt, label: 'Moda' },
                      { id: 'Tecnología', icon: Smartphone, label: 'Tecnología' },
                      { id: 'Hogar', icon: Home, label: 'Hogar' },
                      { id: 'Comida', icon: Utensils, label: 'Comida' },
                      { id: 'Deportes', icon: Dumbbell, label: 'Deportes' },
                      { id: 'Otros', icon: MoreHorizontal, label: 'Otros' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setStoreForm(f => ({ ...f, category: cat.id }))}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left cursor-pointer active:scale-95",
                          storeForm.category === cat.id
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                        )}
                      >
                        <cat.icon className={cn("w-3.5 h-3.5 shrink-0", storeForm.category === cat.id ? "text-white" : "text-zinc-400")} />
                        <span className="text-[10px] font-bold tracking-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CONNECT WHATSAPP */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300 w-full text-left">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  Conecta tu WhatsApp 
                  <Smartphone className="w-5 h-5 text-zinc-900" />
                </h3>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  Escanea el código QR con tu WhatsApp Business para conectar tu número y activar tu bot de ventas automatizado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Left Card: QR and instructions */}
                <div className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col justify-between gap-6 relative min-h-[350px]">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 select-none">
                    <div className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      whatsappStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                    )} />
                    <span className="text-xs font-bold text-zinc-800">
                      Estado: {whatsappStatus === 'CONNECTED' ? 'Conectado' : 'Esperando conexión'}
                    </span>
                  </div>

                  {/* QR Box */}
                  <div className="flex flex-col items-center justify-center flex-grow py-2">
                    {whatsappStatus === 'LOADING' ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Generando QR...</span>
                      </div>
                    ) : whatsappStatus === 'QRCODE' && qrCodeBase64 ? (
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="relative border border-zinc-200 rounded-lg p-2 bg-white">
                          <img 
                            src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                            alt="QR de conexión de WhatsApp" 
                            className="w-40 h-40 object-contain"
                          />
                        </div>

                        {/* Expiration Timer badge */}
                        <div className="bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full flex items-center gap-1.5 text-zinc-900 text-xs font-bold select-none">
                          <Clock className="w-3.5 h-3.5 text-zinc-650" />
                          <span>El código expirará en {formatTime(qrExpiresIn)}</span>
                        </div>
                      </div>
                    ) : whatsappStatus === 'CONNECTED' ? (
                      <div className="flex flex-col items-center gap-2 text-zinc-900">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        <span className="text-xs font-bold">¡WhatsApp Vinculado!</span>
                      </div>
                    ) : (
                      <button 
                        onClick={triggerWhatsappConnect}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg px-5 py-2.5 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Generar código QR
                      </button>
                    )}
                  </div>

                  {/* Connect Steps list */}
                  <div className="space-y-2 pt-4 border-t border-zinc-250">
                    <h5 className="text-[9px] font-bold text-zinc-450 tracking-wider uppercase">Pasos para conectar:</h5>
                    <div className="space-y-1.5">
                      {[
                        "Abre WhatsApp Business en tu celular.",
                        "Ve a Configuración > Dispositivos vinculados.",
                        "Escanea este código QR con la cámara."
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-600 font-semibold">
                          <span className="w-4.5 h-4.5 rounded-full bg-zinc-100 text-zinc-900 font-bold text-[10px] flex items-center justify-center shrink-0">{i + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Card: Status summary / Features */}
                <div className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col justify-between gap-6">
                  
                  {/* Status Illustration */}
                  <div className="flex flex-col items-center text-center justify-center py-4 flex-grow space-y-3 border-b border-zinc-100">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center border",
                      whatsappStatus === 'CONNECTED' 
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                    )}>
                      {whatsappStatus === 'CONNECTED' ? (
                        <Check className="w-6 h-6 stroke-[3px]" />
                      ) : (
                        <Smartphone className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">
                        {whatsappStatus === 'CONNECTED' ? '¡WhatsApp conectado!' : 'Esperando Vinculación'}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                        {whatsappStatus === 'CONNECTED' 
                          ? `Tu número +${storeForm.whatsapp} ha sido conectado correctamente.`
                          : 'Escanea el código con tu celular para activar el bot de ventas Nova.'}
                      </p>
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-zinc-900 leading-none">Nova está lista para conversar</h5>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Responderá a tus clientes e ingresará pedidos al instante.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-zinc-900 leading-none">Atención 24/7 sin límites</h5>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Tus compradores serán atendidos a cualquier hora del día.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRODUCT CATALOG */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 w-full text-left">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900">Catálogo de productos</h3>
                <p className="text-xs text-zinc-500 font-semibold">Crea el primer producto de tu menú visual</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left side: Product Form */}
                <div className="md:col-span-7 bg-white border border-zinc-200 rounded-lg p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="prodName" className="text-[11px] font-bold text-zinc-500">Nombre del producto</label>
                    <input
                      id="prodName"
                      type="text"
                      placeholder="Ej. Pizza Margarita Gigante"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all"
                      value={productForm.name}
                      onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="prodPrice" className="text-[11px] font-bold text-zinc-500">Precio (COP)</label>
                      <input
                        id="prodPrice"
                        type="number"
                        placeholder="25000"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all tabular-nums"
                        value={productForm.price}
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="prodStock" className="text-[11px] font-bold text-zinc-500">Stock físico</label>
                      <input
                        id="prodStock"
                        type="number"
                        placeholder="10"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all tabular-nums"
                        value={productForm.stock}
                        onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="prodDesc" className="text-[11px] font-bold text-zinc-500">Descripción (Opcional)</label>
                    <textarea
                      id="prodDesc"
                      placeholder="Ingredientes, tallas, colores o detalles importantes del artículo..."
                      rows={2}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all resize-none leading-relaxed"
                      value={productForm.description}
                      onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* Image upload */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 block">Foto del producto</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center gap-2 border border-zinc-200 rounded-lg px-3 py-2 cursor-pointer text-xs font-bold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 transition-all">
                        <Upload className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Subir Imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {uploadingImage && <Loader2 className="w-4 h-4 text-zinc-900 animate-spin" />}
                    </div>
                  </div>

                  <button
                    onClick={handleAddProduct}
                    disabled={loading || !productForm.name || !productForm.price}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg py-2.5 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir al Catálogo
                  </button>
                </div>

                {/* Right side: Catalog View */}
                <div className="md:col-span-5 bg-zinc-50 border border-zinc-200 rounded-lg p-5 flex flex-col justify-between h-full min-h-[300px]">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                      <h4 className="text-[10px] font-extrabold text-zinc-800 uppercase tracking-wider">Catálogo preliminar</h4>
                      <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-[10px] font-bold text-zinc-700">
                        {addedProducts.length} productos
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      {addedProducts.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="w-8 h-8 stroke-[1.5px]" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">Tu menú está vacío</p>
                        </div>
                      ) : (
                        addedProducts.map((p, idx) => (
                          <div key={idx} className="flex gap-2.5 p-2 bg-white border border-zinc-200 rounded-lg items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-2 min-w-0">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-9 h-9 object-cover rounded border" />
                              ) : (
                                <div className="w-9 h-9 bg-zinc-50 rounded border flex items-center justify-center text-zinc-300">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-zinc-900 truncate leading-tight">{p.name}</h5>
                                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Stock: {p.stock}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-zinc-900 shrink-0 tabular-nums">
                              ${p.price.toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-100/50 border border-zinc-200 rounded-lg text-[10px] text-zinc-500 leading-normal font-semibold">
                    💡 Agrega tus productos estrella para que Nova empiece a recomendarlos a tus clientes desde el día uno.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT METHODS */}
          {currentStep === 5 && (
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300 text-left w-full">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900">Métodos de pago</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Elige cómo te pagarán tus clientes</p>
              </div>

              <div className="space-y-4">
                {/* Option 1: Manual Bank Transfer */}
                <label className="flex items-start gap-3.5 p-4 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-zinc-900 border-zinc-300 rounded focus:ring-0"
                    checked={payments.manual}
                    onChange={e => setPayments(p => ({ ...p, manual: e.target.checked }))}
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      Transferencia Manual (Nequi / Daviplata)
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[9px] font-bold px-1.5 py-0.5 rounded">Recomendado</span>
                    </span>
                    <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                      Tus clientes adjuntarán la captura de la transferencia en el chat y tú auditarás y aprobarás manualmente el pago desde el panel.
                    </p>
                  </div>
                </label>

                {/* Option 2: Mercado Pago */}
                <label className="flex items-start gap-3.5 p-4 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50/50 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-zinc-900 border-zinc-300 rounded focus:ring-0"
                    checked={payments.mercadopago}
                    onChange={e => setPayments(p => ({ ...p,  mercadopago: e.target.checked }))}
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      Mercado Pago Connect
                      <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    </span>
                    <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                      Permite cobros con tarjetas de crédito, PSE y efectivo. Podrás vincular tu cuenta real de Mercado Pago fácilmente desde el panel una vez finalices la configuración.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: STORE PREFERENCES */}
          {currentStep === 6 && (
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300 text-left w-full">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900">Preferencias del bot y tienda</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Personaliza el comportamiento de Nova</p>
              </div>

              <div className="space-y-4">
                {/* Memoria de Negocio Form Cards */}
                <div className="bg-zinc-50 p-4 border border-zinc-150 rounded-xl space-y-3.5 select-none mb-3 text-left animate-in fade-in duration-300">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">🧠 Memoria del Negocio (Contexto para Nova)</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block">¿Qué tipo de productos vendes? (Nicho)</label>
                    <input 
                      type="text"
                      placeholder="Ej: Dátiles rellenos premium y chocolates artesanales"
                      value={businessProfile.niche}
                      onChange={e => setBusinessProfile(prev => ({ ...prev, niche: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block">¿Quién es tu público objetivo?</label>
                    <input 
                      type="text"
                      placeholder="Ej: Personas de 25-50 años que compran regalos gourmet"
                      value={businessProfile.targetAudience}
                      onChange={e => setBusinessProfile(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-950"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block">Propuesta de Valor / Historia</label>
                    <textarea 
                      placeholder="Ej: Fusionamos dátiles naturales con chocolate belga fino para crear confitería de lujo."
                      value={businessProfile.coreProposition}
                      onChange={e => setBusinessProfile(prev => ({ ...prev, coreProposition: e.target.value }))}
                      rows={2}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 block">Tono de voz de la marca</label>
                    <select
                      value={businessProfile.brandTone}
                      onChange={e => setBusinessProfile(prev => ({ ...prev, brandTone: e.target.value }))}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-bold text-zinc-800 focus:outline-none cursor-pointer"
                    >
                      <option value="Sofisticado y elegante">Sofisticado y elegante (Estilo Chocodate)</option>
                      <option value="Amigable y cercano">Amigable y cercano</option>
                      <option value="Profesional y directo">Profesional y directo</option>
                      <option value="Divertido e informal">Divertido e informal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="welcomeMessage" className="text-[11px] font-bold text-zinc-500">Mensaje de bienvenida automático</label>
                  <textarea
                    id="welcomeMessage"
                    rows={2}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all resize-none leading-relaxed"
                    value={preferences.welcomeMessage}
                    onChange={e => setPreferences(p => ({ ...p, welcomeMessage: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="systemPrompt" className="text-[11px] font-bold text-zinc-500">Instrucciones de comportamiento (Prompt de Nova)</label>
                  <textarea
                    id="systemPrompt"
                    rows={3}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all resize-none leading-relaxed"
                    value={preferences.systemPrompt}
                    onChange={e => setPreferences(p => ({ ...p, systemPrompt: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="businessHours" className="text-[11px] font-bold text-zinc-500">Horarios de atención comercial</label>
                  <input
                    id="businessHours"
                    type="text"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-950 transition-all"
                    value={preferences.businessHours}
                    onChange={e => setPreferences(p => ({ ...p, businessHours: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW AND CONFIRM */}
          {currentStep === 7 && (
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300 text-left w-full">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900">Revisa y confirma</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Todo listo para lanzar tu tienda</p>
              </div>

              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3.5 text-xs font-semibold text-zinc-700">
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">Tienda</span>
                  <span className="font-bold text-zinc-900">{storeForm.name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-200 gap-4">
                  <span className="text-zinc-500">Enlace público</span>
                  <span className="font-bold text-zinc-900 break-all text-right max-w-[65%]">flash.checkout/tienda/{storeForm.slug}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">WhatsApp conectado</span>
                  <span className={cn(
                    "font-bold",
                    whatsappStatus === 'CONNECTED' ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {whatsappStatus === 'CONNECTED' ? 'Sí (Conectado)' : 'No (Omitido por ahora)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-200">
                  <span className="text-zinc-500">Catálogo inicial</span>
                  <span className="font-bold text-zinc-900">{addedProducts.length} productos registrados</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500">Métodos de Pago</span>
                  <span className="font-bold text-zinc-900">
                    {payments.manual && 'Manual '}
                    {payments.mercadopago && 'Mercado Pago'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: COMPLETION SUCCESS */}
          {currentStep === 8 && (
            <div className="max-w-md mx-auto text-center space-y-6 py-6 animate-in zoom-in-95 duration-300 w-full">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 stroke-[3px]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
                  ¡Todo listo y configurado!
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Tu tienda digital ha sido lanzada en producción
                </p>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                Has completado exitosamente la configuración de tu tienda. Nova ya está lista para recibir mensajes, interactuar y cerrar ventas en tiempo real.
              </p>

              <div className="pt-4">
                <button
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg px-6 py-2.5 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Lanzando panel...
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

        {/* Bottom Navigation Buttons */}
        {currentStep !== 8 && currentStep !== 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold text-xs rounded-lg px-4 py-2.5 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Volver
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={
                loading || 
                (currentStep === 2 && (!storeForm.name || !storeForm.slug || !storeForm.whatsapp)) ||
                (currentStep === 4 && addedProducts.length === 0)
              }
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg px-5 py-2.5 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {currentStep === 7 ? 'Confirmar y Lanzar' : 'Continuar'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
