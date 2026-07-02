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
  Gamepad2, 
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
  Settings,
  HelpCircle,
  TrendingUp,
  Image as ImageIcon,
  Lock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

export default function StoreCreationWizard() {
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
    themeColor: 'indigo'
  })

  // Check database state on mount to prevent skipping and restore step context
  useEffect(() => {
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
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setProductForm(f => ({ ...f, imageUrl: data.url }))
        toast.success('Imagen subida con éxito')
      } else {
        toast.error(data.error || 'Fallo la subida de imagen')
      }
    } catch {
      toast.error('Error al subir imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  // Save Product to DB
  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Nombre y precio del producto son obligatorios')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock || '0'),
          description: productForm.description,
          imageUrl: productForm.imageUrl,
          category: storeForm.category
        })
      })

      const data = await res.json()
      if (res.ok && data.product) {
        setAddedProducts(prev => [...prev, data.product])
        setProductForm({
          name: '',
          price: '',
          stock: '10',
          description: '',
          imageUrl: '',
        })
        toast.success('Producto añadido al catálogo 📦')
      } else {
        toast.error(data.error || 'Error al guardar el producto')
      }
    } catch {
      toast.error('Error de red al guardar producto')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Create or Update Store
  const handleCreateStore = async () => {
    if (!storeForm.name || !storeForm.slug || !storeForm.whatsapp) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    setLoading(true)
    setError('')
    try {
      const url = '/api/stores'
      const method = createdStore ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm)
      })

      const data = await res.json()
      if (res.ok && data.store) {
        setCreatedStore(data.store)
        toast.success(createdStore ? 'Tienda actualizada exitosamente' : 'Tienda registrada exitosamente')
        setCurrentStep(3)
        // Auto trigger connection step if not connected yet
        if (!data.store.whatsappConnected) {
          triggerWhatsappConnect()
        } else {
          setWhatsappStatus('CONNECTED')
        }
      } else {
        setError(data.error || 'Error al registrar la tienda')
      }
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  // Step 6: Save Preferences and Bot settings
  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcomeMessage: preferences.welcomeMessage,
          systemPrompt: preferences.systemPrompt,
          bio: `Especialistas en ${storeForm.category}. Atendemos de ${preferences.businessHours}`,
          category: storeForm.category,
        })
      })

      if (res.ok) {
        toast.success('Configuraciones guardadas')
        setCurrentStep(7)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al guardar preferencias')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // Final Action: Complete and redirect to Active Dashboard
  const handleFinishOnboarding = async () => {
    setLoading(true)
    try {
      router.refresh()
    } catch {
      toast.error('Error al recargar el panel')
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation buttons at bottom
  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      handleCreateStore()
    } else if (currentStep === 3) {
      // Allow proceeding even if disconnected to avoid getting stuck during dev sandbox
      if (whatsappStatus !== 'CONNECTED') {
        toast.info('Continuando sin conectar WhatsApp. Recuerda conectarlo más tarde.')
      }
      stopWhatsappPolling()
      stopQrTimer()
      setCurrentStep(4)
    } else if (currentStep === 4) {
      if (addedProducts.length === 0) {
        toast.error('Por favor agrega al menos un producto para tu catálogo público.')
        return
      }
      setCurrentStep(5)
    } else if (currentStep === 5) {
      setCurrentStep(6)
    } else if (currentStep === 6) {
      handleSavePreferences()
    } else if (currentStep === 7) {
      setCurrentStep(8)
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

  if (initializing) {
    return (
      <div className="w-screen h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Cargando Onboarding...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-white flex overflow-hidden shadow-none animate-in fade-in duration-300">
      
      {/* 1. PROGRESS SIDEBAR (LEFT COLUMN) */}
      <aside className="w-[260px] bg-[#FAFAFA] border-r border-zinc-100 p-6 flex flex-col justify-between shrink-0 select-none h-screen">
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
            </div>
            <span className="text-sm font-extrabold text-zinc-900 tracking-tight">FlashCheckout</span>
          </div>

          <div className="space-y-2">
            {STEPS.map(s => {
              const isCompleted = s.num < currentStep
              const isActive = s.num === currentStep
              return (
                <div 
                  key={s.num} 
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-lg transition-all",
                    isActive ? "bg-indigo-50/50 border border-indigo-100/60" : "border border-transparent"
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-50 stroke-[2.5px]" />
                    ) : (
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
                        isActive 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "border-zinc-300 text-zinc-400 bg-white"
                      )}>
                        {s.num}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-xs font-semibold tracking-tight",
                      isActive ? "text-indigo-650 font-bold" : isCompleted ? "text-zinc-550" : "text-zinc-400"
                    )}>
                      {s.label}
                    </h4>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar help Card (Accurate Match) */}
        <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-2xl p-4 space-y-3 relative overflow-hidden text-left">
          <div className="space-y-1">
            <h5 className="text-[11px] font-bold text-zinc-900 tracking-tight">¿Necesitas ayuda?</h5>
            <p className="text-[10px] font-medium text-zinc-500 leading-normal max-w-[130px]">
              Nova está aquí para ayudarte en cualquier paso.
            </p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg px-3 py-2 flex items-center justify-center transition-all cursor-pointer">
            Hablar con Nova
          </button>
          <img src="/nova_robot_mascot.png" alt="Nova mascot help" className="absolute right-0 bottom-0 w-16 h-16 object-contain pointer-events-none translate-x-2 translate-y-2 opacity-95" />
        </div>
      </aside>

      {/* 2. MIDDLE COLUMN (ROBOT BANNER - ONLY IN STEP 1) */}
      {currentStep === 1 && (
        <div className="w-[330px] border-r border-zinc-100 p-8 flex flex-col justify-center items-center text-center gap-6 shrink-0 select-none animate-in slide-in-from-left duration-300 bg-white h-screen">
          <div className="w-48 h-48 rounded-full bg-indigo-50/50 flex items-center justify-center border border-indigo-100 relative overflow-hidden shadow-inner">
            <img 
              src="/nova_robot_mascot.png" 
              alt="Mascot Nova Avatar" 
              className="w-36 h-36 object-contain hover:scale-105 transition-transform" 
            />
          </div>
          <div className="space-y-2 max-w-[240px]">
            <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
              ¡Hola! Soy <span className="text-indigo-600">Nova</span>, tu asistente de ventas IA.
            </h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              Te ayudaré a configurar tu tienda en <span className="text-indigo-650 font-bold">menos de 5 minutos</span>.
            </p>
          </div>
          {/* Dot Carousel Indicators */}
          <div className="flex gap-2 justify-center mt-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600" />
            <div className="w-2 h-2 rounded-full bg-zinc-200" />
            <div className="w-2 h-2 rounded-full bg-zinc-200" />
          </div>
        </div>
      )}

      {/* 3. RIGHT CONTENT PANEL */}
      <div className="flex-1 p-8 flex flex-col justify-between h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            {currentStep > 1 && currentStep !== 8 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-955 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider">
              PASO {currentStep} DE 8
            </span>
            <div className="flex gap-1">
              {STEPS.map(s => (
                <div 
                  key={s.num}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    s.num === currentStep 
                      ? "w-6 bg-indigo-600" 
                      : s.num < currentStep 
                      ? "w-2 bg-indigo-200" 
                      : "w-2 bg-zinc-150"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Middle Step Content */}
        <div className="flex-grow py-6 overflow-y-auto custom-scrollbar pr-2">
          
          {/* STEP 1: WELCOME SCREEN (ACCURATE MOCKUP MATCH) */}
          {currentStep === 1 && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950 font-display">
                  ¡Bienvenido a FlashCheckout!
                </h2>
                <p className="text-xs text-zinc-450 font-bold uppercase tracking-wider">
                  La plataforma AI First para vender más por WhatsApp.
                </p>
              </div>

              {/* Feature blocks (4 items) */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 hover:bg-zinc-50/50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 leading-none">Vende por WhatsApp 24/7</h5>
                    <p className="text-[11px] font-medium text-zinc-500 mt-1">Nova atiende, responde y vende automáticamente mientras tú te enfocas en tu negocio.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 hover:bg-zinc-50/50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 leading-none">Catálogo inteligente</h5>
                    <p className="text-[11px] font-medium text-zinc-500 mt-1">Crea tu catálogo en segundos con IA y mantenlo siempre actualizado.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 hover:bg-zinc-50/50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 leading-none">Cobros seguros</h5>
                    <p className="text-[11px] font-medium text-zinc-500 mt-1">Recibe pagos fácilmente con múltiples métodos de pago integrados.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 hover:bg-zinc-50/50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 leading-none">Todo en un solo lugar</h5>
                    <p className="text-[11px] font-medium text-zinc-500 mt-1">Gestiona pedidos, clientes, productos y análisis desde tu dashboard.</p>
                  </div>
                </div>
              </div>

              {/* Sparkles Box */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-[11px] text-indigo-755 font-bold leading-normal">
                  En <span className="underline">menos de 5 minutos</span> tendrás tu tienda lista para empezar a vender.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleNext}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl h-12 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-sm cursor-pointer select-none"
                >
                  Comenzar
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-zinc-400 font-bold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-zinc-350" />
                  Es gratis. Configura tu tienda sin tarjeta de crédito.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS INFORMATION */}
          {currentStep === 2 && (
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-955 tracking-tight">Información de tu negocio</h3>
                <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Establece tu identidad digital</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="storeName" className="text-xs font-bold text-zinc-700">Nombre de la tienda</label>
                  <input
                    id="storeName"
                    type="text"
                    required
                    placeholder="Ej. Boutique Bella Vista"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all font-medium"
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

                <div className="space-y-2">
                  <label htmlFor="storeSlug" className="text-xs font-bold text-zinc-700">Dirección web única (Slug)</label>
                  <div className="flex items-center bg-white border border-zinc-200 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                    <span className="pl-4 text-xs font-semibold text-zinc-405 select-none">flash.checkout/tienda/</span>
                    <input
                      id="storeSlug"
                      type="text"
                      required
                      placeholder="boutique-bella"
                      className="flex-1 px-1 py-3 text-xs border-none bg-transparent focus:outline-none font-bold text-indigo-650"
                      value={storeForm.slug}
                      onChange={e => setStoreForm(f => ({ ...f, slug: generateSlug(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="storeWhatsapp" className="text-xs font-bold text-zinc-700">WhatsApp del Negocio</label>
                  <input
                    id="storeWhatsapp"
                    type="tel"
                    required
                    placeholder="573001234567"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all font-medium tabular-nums"
                    value={storeForm.whatsapp}
                    onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '') }))}
                  />
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Incluye el código de país sin el símbolo "+" (Ej: Colombia: 57)</p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-700">Categoría comercial</label>
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
                          "flex items-center gap-2.5 p-3 rounded-lg border transition-all text-left cursor-pointer",
                          storeForm.category === cat.id
                            ? "bg-indigo-600 border-indigo-600 text-white scale-[1.02]"
                            : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50"
                        )}
                      >
                        <cat.icon className={cn("w-4 h-4 shrink-0", storeForm.category === cat.id ? "text-white" : "text-zinc-400")} />
                        <span className="text-xs font-semibold tracking-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-650 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CONNECT WHATSAPP */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-955 tracking-tight flex items-center justify-center gap-2">
                  Conecta tu WhatsApp 
                  <Smartphone className="w-5 h-5 text-emerald-650 fill-emerald-50" />
                </h3>
                <p className="text-xs text-zinc-500 font-semibold max-w-md mx-auto leading-relaxed">
                  Escanea el código QR con tu WhatsApp Business para conectar tu número.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Left Card: QR and instructions */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col justify-between gap-5 relative min-h-[380px]">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 select-none">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full animate-pulse",
                      whatsappStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                    )} />
                    <span className="text-xs font-bold text-zinc-800">
                      Estado: {whatsappStatus === 'CONNECTED' ? 'Conectado' : 'Esperando conexión'}
                    </span>
                  </div>

                  {/* QR Box */}
                  <div className="flex flex-col items-center justify-center flex-1 py-2">
                    {whatsappStatus === 'LOADING' ? (
                      <div className="flex flex-col items-center gap-2.5">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
                        <span className="text-xs text-zinc-400 font-semibold tracking-wider">Generando QR...</span>
                      </div>
                    ) : whatsappStatus === 'QRCODE' && qrCodeBase64 ? (
                      <div className="space-y-4 flex flex-col items-center">
                        <div className="relative border-4 border-zinc-100 rounded-xl overflow-hidden p-2 bg-white hover:scale-102 transition-transform">
                          <img 
                            src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                            alt="QR de conexión de WhatsApp" 
                            className="w-48 h-48 object-contain"
                          />
                          <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow">
                            <Smartphone className="w-5 h-5 text-emerald-655" />
                          </div>
                        </div>

                        {/* Expiration Timer badge */}
                        <div className="bg-indigo-50/70 border border-indigo-100 px-4 py-1.5 rounded-full flex items-center gap-1.5 text-indigo-755 text-xs font-bold select-none">
                          <Clock className="w-3.5 h-3.5 text-indigo-655" />
                          <span>El código expirará en {formatTime(qrExpiresIn)}</span>
                        </div>
                      </div>
                    ) : whatsappStatus === 'CONNECTED' ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-12 h-12 stroke-[2px]" />
                        <span className="text-sm font-bold">¡WhatsApp Vinculado!</span>
                      </div>
                    ) : (
                      <button 
                        onClick={triggerWhatsappConnect}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg px-4 py-2.5 active:scale-95 transition-transform"
                      >
                        Generar código QR
                      </button>
                    )}
                  </div>

                  {/* Connect Steps list */}
                  <div className="space-y-2 pt-3 border-t border-zinc-100 text-left">
                    <h5 className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">Pasos para conectar:</h5>
                    <ol className="text-[11px] text-zinc-500 font-semibold space-y-1.5 list-decimal pl-4 leading-normal">
                      <li>Abre WhatsApp Business en tu celular.</li>
                      <li>Ve a Configuración &gt; Dispositivos vinculados.</li>
                      <li>Escanea este código QR.</li>
                    </ol>
                  </div>
                </div>

                {/* Right Card: Status summary / Features */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between gap-6">
                  
                  {/* Status Illustration / Message */}
                  <div className="flex flex-col items-center text-center justify-center py-6 flex-1 space-y-4 border-b border-zinc-100/60">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center border animate-in zoom-in-50",
                      whatsappStatus === 'CONNECTED' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                    )}>
                      {whatsappStatus === 'CONNECTED' ? (
                        <Check className="w-8 h-8 stroke-[3.5px]" />
                      ) : (
                        <Smartphone className="w-7 h-7" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-zinc-950">
                        {whatsappStatus === 'CONNECTED' ? '¡WhatsApp conectado!' : 'Esperando Vinculación'}
                      </h4>
                      <p className="text-xs text-zinc-500 font-semibold mt-1">
                        {whatsappStatus === 'CONNECTED' 
                          ? `Tu número +${storeForm.whatsapp || '57 312 456 7890'} ha sido conectado correctamente.`
                          : 'Escanea el código con tu celular para activar el bot de ventas Nova.'}
                      </p>
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
                        <MessageSquare className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 leading-none">Nova está lista para conversar</h5>
                        <p className="text-[11px] font-medium text-zinc-400 mt-1">Responderá a tus clientes e ingresará pedidos al instante.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 leading-none">Atención 24/7 sin límites</h5>
                        <p className="text-[11px] font-medium text-zinc-400 mt-1">Tus compradores serán atendidos a cualquier hora del día.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0 mt-0.5">
                        <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 leading-none">Seguro y confiable</h5>
                        <p className="text-[11px] font-medium text-zinc-400 mt-1">Tus conversaciones y datos de clientes están 100% protegidos.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRODUCT CATALOG */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-955 tracking-tight">Catálogo de productos</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Crea el primer producto de tu menú visual</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left side: Product Form (7/12) */}
                <div className="md:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 space-y-4 text-left">
                  <div className="space-y-2">
                    <label htmlFor="prodName" className="text-xs font-bold text-zinc-700">Nombre del producto</label>
                    <input
                      id="prodName"
                      type="text"
                      placeholder="Ej. Pizza Margarita Gigante"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium"
                      value={productForm.name}
                      onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="prodPrice" className="text-xs font-bold text-zinc-700">Precio (COP)</label>
                      <input
                        id="prodPrice"
                        type="number"
                        placeholder="25000"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-semibold tabular-nums"
                        value={productForm.price}
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="prodStock" className="text-xs font-bold text-zinc-700">Stock físico</label>
                      <input
                        id="prodStock"
                        type="number"
                        placeholder="10"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-semibold tabular-nums"
                        value={productForm.stock}
                        onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="prodDesc" className="text-xs font-bold text-zinc-700">Descripción (Opcional)</label>
                    <textarea
                      id="prodDesc"
                      placeholder="Ingredientes, tallas, colores o detalles importantes del artículo..."
                      rows={3}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium resize-none"
                      value={productForm.description}
                      onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* Image upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 block">Foto del producto</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-lg px-4 py-2.5 cursor-pointer text-xs font-bold text-zinc-600 bg-zinc-50 hover:bg-zinc-100/50 transition-all flex-1">
                        <Upload className="w-4 h-4 text-zinc-400" />
                        <span>Subir Imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {uploadingImage && <Loader2 className="w-4 h-4 text-indigo-650 animate-spin" />}
                    </div>
                  </div>

                  <button
                    onClick={handleAddProduct}
                    disabled={loading || !productForm.name || !productForm.price}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-lg py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir al Catálogo
                  </button>
                </div>

                {/* Right side: Catalog View (5/12) */}
                <div className="md:col-span-5 bg-zinc-50/50 border border-zinc-200 border-dashed rounded-xl p-5 space-y-4 flex flex-col h-full min-h-[360px] justify-between text-left">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                      <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">Catálogo preliminar</h4>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-150 text-[10px] font-extrabold text-indigo-700 tracking-wider">
                        {addedProducts.length} productos
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {addedProducts.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="w-8 h-8 stroke-[1.5px]" />
                          <p className="text-[11px] font-semibold tracking-wider uppercase font-sans">Tu menú está vacío</p>
                        </div>
                      ) : (
                        addedProducts.map((p, idx) => (
                          <div key={idx} className="flex gap-3 p-2 bg-white border border-zinc-200 rounded-lg items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-3 min-w-0">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded border" />
                              ) : (
                                <div className="w-10 h-10 bg-zinc-100 rounded border flex items-center justify-center text-zinc-300">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-zinc-955 truncate leading-tight">{p.name}</h5>
                                <p className="text-[10px] font-semibold text-zinc-400 tracking-wider mt-0.5">Stock: {p.stock}</p>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-zinc-900 shrink-0 tabular-nums">
                              ${p.price.toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[11px] text-indigo-755 leading-normal font-semibold">
                    💡 Agrega tus productos estrella para que Nova empiece a recomendarlos a tus clientes desde el día uno.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT METHODS */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-955 tracking-tight">Métodos de pago</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Elige cómo te pagarán tus clientes</p>
              </div>

              <div className="space-y-4">
                
                {/* Option 1: Manual Bank Transfer */}
                <label className="flex items-start gap-4 p-4 border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50/30 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-indigo-650 border-zinc-300 rounded focus:ring-indigo-50"
                    checked={payments.manual}
                    onChange={e => setPayments(p => ({ ...p, manual: e.target.checked }))}
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-zinc-955 flex items-center gap-1.5">
                      Transferencia Manual (Nequi / Daviplata)
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded-md select-none leading-none">Recomendado</span>
                    </span>
                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                      Tus clientes adjuntarán la captura de la transferencia en el chat y tú auditarás y aprobarás manualmente el pago desde el panel.
                    </p>
                  </div>
                </label>

                {/* Option 2: Mercado Pago */}
                <label className="flex items-start gap-4 p-4 border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50/30 transition-all cursor-pointer text-left">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-indigo-650 border-zinc-300 rounded focus:ring-indigo-50"
                    checked={payments.mercadopago}
                    onChange={e => setPayments(p => ({ ...p,  mercadopago: e.target.checked }))}
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-zinc-955 flex items-center gap-1.5">
                      Mercado Pago Connect
                      <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                    </span>
                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                      Permite cobros con tarjetas de crédito, PSE y efectivo. Podrás vincular tu cuenta real de Mercado Pago fácilmente desde el panel una vez finalices la configuración.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: STORE PREFERENCES */}
          {currentStep === 6 && (
            <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-955 tracking-tight">Preferencias del bot y tienda</h3>
                <p className="text-xs text-zinc-550 font-bold uppercase tracking-widest">Personaliza el comportamiento de Nova</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="welcomeMessage" className="text-xs font-bold text-zinc-700">Mensaje de bienvenida automático</label>
                  <textarea
                    id="welcomeMessage"
                    rows={2}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium resize-none leading-normal"
                    value={preferences.welcomeMessage}
                    onChange={e => setPreferences(p => ({ ...p, welcomeMessage: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="systemPrompt" className="text-xs font-bold text-zinc-700">Instrucciones de comportamiento (Prompt de Nova)</label>
                  <textarea
                    id="systemPrompt"
                    rows={4}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium resize-none leading-normal"
                    value={preferences.systemPrompt}
                    onChange={e => setPreferences(p => ({ ...p, systemPrompt: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="businessHours" className="text-xs font-bold text-zinc-700">Horarios de atención comercial</label>
                  <input
                    id="businessHours"
                    type="text"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-medium"
                    value={preferences.businessHours}
                    onChange={e => setPreferences(p => ({ ...p, businessHours: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW AND CONFIRM */}
          {currentStep === 7 && (
            <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-955 tracking-tight">Revisa y confirma</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Todo listo para lanzar tu tienda</p>
              </div>

              <div className="p-5 bg-[#FAFAFA] border border-zinc-200 rounded-xl space-y-4 text-xs font-semibold text-zinc-700 font-sans">
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span>Tienda</span>
                  <span className="font-bold text-zinc-955">{storeForm.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span>Enlace público</span>
                  <span className="font-bold text-indigo-650">flash.checkout/tienda/{storeForm.slug}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span>WhatsApp conectado</span>
                  <span className={cn(
                    "font-bold",
                    whatsappStatus === 'CONNECTED' ? "text-emerald-650" : "text-amber-600"
                  )}>
                    {whatsappStatus === 'CONNECTED' ? 'Sí (Conectado)' : 'No (Omitido por ahora)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100">
                  <span>Catálogo inicial</span>
                  <span className="font-bold text-zinc-955">{addedProducts.length} productos registrados</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Métodos de Pago habilitados</span>
                  <span className="font-bold text-zinc-955">
                    {payments.manual && 'Manual '}
                    {payments.mercadopago && 'Mercado Pago'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: COMPLETION SUCCESS */}
          {currentStep === 8 && (
            <div className="max-w-md mx-auto text-center space-y-6 py-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8 stroke-[3px]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-955 font-display">
                  ¡Todo listo y configurado!
                </h3>
                <p className="text-xs text-zinc-550 font-bold uppercase tracking-wider">
                  Tu tienda digital ha sido lanzada en producción
                </p>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed font-normal">
                Has completado exitosamente la configuración de tu tienda. Nova ya está lista para recibir mensajes, interactuar y cerrar ventas en tiempo real.
              </p>

              <div className="pt-6">
                <button
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg px-8 py-3.5 shadow-sm shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
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
          <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-655 font-bold text-xs rounded-lg px-5 py-3.5 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer select-none"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg px-6 py-3.5 shadow-sm shadow-indigo-100 hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
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
