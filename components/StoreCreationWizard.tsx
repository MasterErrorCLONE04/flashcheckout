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
    themeColor: 'emerald'
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

  // Step 2: Create Store
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
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Cargando Onboarding...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white flex overflow-hidden shadow-none animate-in fade-in duration-300">
      
      {/* 1. PROGRESS SIDEBAR (LEFT COLUMN) */}
      <aside className="hidden lg:flex w-[260px] xl:w-[320px] bg-[#FAFAFA] border-r border-zinc-100 p-6 xl:p-8 flex-col justify-between shrink-0 select-none h-full font-sans">
        <div className="space-y-8 xl:space-y-12">
          <div className="flex items-center gap-2 xl:gap-3 px-2 py-1">
            <div className="w-6 h-6 xl:w-8 xl:h-8 bg-zinc-950 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-white fill-current" />
            </div>
            <span className="text-sm xl:text-base font-extrabold text-zinc-900 tracking-tight">FlashCheckout</span>
          </div>

          <div className="space-y-2 xl:space-y-3">
            {STEPS.map(s => {
              const isCompleted = s.num < currentStep
              const isActive = s.num === currentStep
              return (
                <div 
                  key={s.num} 
                  className={cn(
                    "flex items-center justify-between p-2.5 xl:p-3.5 rounded-lg transition-all",
                    isActive ? "bg-white border border-zinc-200/80 shadow-sm" : "border border-transparent"
                  )}
                >
                  <div className="flex items-start gap-3 xl:gap-4">
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 xl:w-6 xl:h-6 text-zinc-900 fill-zinc-50 stroke-[2.5px]" />
                      ) : (
                        <div className={cn(
                          "w-5 h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center text-[10px] xl:text-xs font-bold border transition-colors",
                          isActive 
                            ? "bg-zinc-950 border-zinc-950 text-white" 
                            : "border-zinc-300 text-zinc-400 bg-white"
                        )}>
                          {s.num}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-xs xl:text-sm font-semibold tracking-tight",
                        isActive ? "text-zinc-950 font-bold" : isCompleted ? "text-zinc-550" : "text-zinc-400"
                      )}>
                        {s.label}
                      </h4>
                      <p className="text-[10px] xl:text-xs font-medium text-zinc-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-950" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar Footer User Area (Clerk CustomUserMenu next to brand text) */}
        <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 xl:pt-6 px-2">
          <CustomUserMenu />
          <span className="text-[10px] xl:text-xs font-bold tracking-widest text-zinc-400 uppercase select-none">
            FlashCheckout v1.0
          </span>
        </div>
      </aside>

      {/* 2. MIDDLE COLUMN (MOCK WHATSAPP PREVIEW - ONLY IN STEP 1) */}
      {currentStep === 1 && (
        <div className="hidden xl:flex w-[350px] xl:w-[400px] 2xl:w-[460px] border-r border-zinc-100 p-8 xl:p-10 2xl:p-12 flex-col justify-center items-center text-center shrink-0 select-none animate-in slide-in-from-left duration-300 bg-[#FAFAFA] h-full">
          <h4 className="text-[11px] xl:text-xs 2xl:text-sm font-bold text-zinc-700 tracking-wide mb-5">Así vende Nova por ti en WhatsApp</h4>
          
          {/* Smart Phone Frame (Off-White Background) */}
          <div className="w-[280px] xl:w-[300px] 2xl:w-[320px] bg-[#F6F7F9] rounded-[36px] overflow-hidden border-[8px] border-zinc-200 shadow-2xl shadow-zinc-300/80 flex flex-col aspect-[9/17.5] relative">
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
            <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar flex flex-col justify-end">
              {/* Message 1: User */}
              <div className="bg-[#E1F3D4] self-end rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-sm relative flex flex-col text-left">
                <p className="leading-tight">Hola, quiero ver el catálogo por favor 👋</p>
                <div className="self-end flex items-center gap-0.5 mt-0.5">
                  <span className="text-[7px] text-zinc-400">10:00 AM</span>
                  <span className="text-[8px] text-[#34B7F1] font-bold">✓✓</span>
                </div>
              </div>

              {/* Message 2: Nova */}
              <div className="bg-white self-start rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-sm relative flex flex-col gap-1 text-left">
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
              <div className="bg-[#E1F3D4] self-end rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-sm relative flex flex-col text-left">
                <p className="leading-tight">Me interesa el vestido floral rojo en talla M.</p>
                <div className="self-end flex items-center gap-0.5 mt-0.5">
                  <span className="text-[7px] text-zinc-400">10:01 AM</span>
                  <span className="text-[8px] text-[#34B7F1] font-bold">✓✓</span>
                </div>
              </div>

              {/* Message 4: Nova with product card */}
              <div className="bg-white self-start rounded-lg p-1.5 max-w-[85%] text-[9px] text-zinc-800 shadow-sm relative flex flex-col gap-1 text-left">
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
            <div className="p-1.5 bg-[#F0F2F5] border-t border-zinc-200/50 flex items-center gap-1.5 shrink-0 select-none">
              <div className="flex-grow bg-white rounded-full px-2.5 py-1 flex items-center justify-between border border-zinc-200/60 min-w-0">
                <span className="text-[7.5px] text-zinc-400 font-medium truncate">Escribe un mensaje...</span>
                <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
                  {/* Paperclip attachment icon */}
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {/* Camera icon */}
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316A2.192 2.192 0 0014.512 4h-5.024c-.587 0-1.13.318-1.435.82L6.827 6.175zM12 16.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                  </svg>
                </div>
              </div>
              <div className="w-5.5 h-5.5 rounded-full bg-[#075E54] flex items-center justify-center text-white cursor-pointer shrink-0">
                {/* Send icon arrow */}
                <svg className="w-2 h-2 fill-current transform rotate-45 -translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Phone dot carousel */}
          <div className="flex gap-1.5 justify-center mt-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          </div>

          <p className="text-[9px] xl:text-[10px] 2xl:text-xs text-zinc-450 font-medium leading-relaxed max-w-[220px] xl:max-w-[260px] mt-4 xl:mt-6">
            Nova atiende tus chats, responde dudas, sugiere productos y cierra la venta con pasarelas de pago automatizadas.
          </p>
        </div>
      )}

      {/* 3. RIGHT CONTENT PANEL */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 xl:p-12 2xl:p-16 flex flex-col justify-between h-full overflow-hidden relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 xl:pb-8 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            {currentStep > 1 && currentStep !== 8 && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-1 text-xs xl:text-sm font-semibold text-zinc-500 hover:text-zinc-955 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                Volver
              </button>
            )}
            {/* Clerk CustomUserMenu shown on mobile when sidebar is hidden */}
            <div className="lg:hidden shrink-0">
              <CustomUserMenu />
            </div>
          </div>
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] xl:text-xs font-extrabold text-zinc-500 tracking-wider">
              PASO {currentStep} DE 8
            </span>
            <div className="flex gap-1">
              {STEPS.map(s => (
                <div 
                  key={s.num}
                  className={cn(
                    "h-1 xl:h-1.5 rounded-full transition-all duration-300",
                    s.num === currentStep 
                      ? "w-6 xl:w-8 bg-zinc-950" 
                      : s.num < currentStep 
                      ? "w-2 xl:w-3 bg-zinc-300" 
                      : "w-2 xl:w-3 bg-zinc-150"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Middle Step Content */}
        <div className={cn(
          "flex-grow py-6 overflow-y-auto scrollbar-none pr-2",
          (currentStep === 1 || currentStep === 8 || currentStep === 5 || currentStep === 6 || currentStep === 7 || currentStep === 2) && "md:flex md:flex-col md:justify-center"
        )}>
          
          {/* STEP 1: WELCOME SCREEN (ACCURATE MOCKUP MATCH) */}
          {currentStep === 1 && (
            <div className="space-y-6 text-left animate-in fade-in duration-300 max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto w-full">
              <div className="space-y-1.5 xl:space-y-3 text-left">
                <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-zinc-900 leading-none">
                  Bienvenido a FlashCheckout
                </h2>
                <p className="text-sm xl:text-base 2xl:text-lg font-bold text-zinc-955">
                  La plataforma AI First para vender más por WhatsApp.
                </p>
                <p className="text-xs xl:text-sm 2xl:text-base text-zinc-400 font-semibold leading-relaxed">
                  En pocos minutos tendrás tu tienda lista para empezar a vender.
                </p>
              </div>

              {/* Feature blocks in 2x2 Grid with ChevronRight arrow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
                <div className="flex items-center justify-between p-4 xl:p-6 border border-zinc-200 bg-white rounded-xl shadow-none hover:bg-zinc-50/20 transition-all">
                  <div className="flex items-center gap-4 xl:gap-5">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 xl:w-14 xl:h-14 shrink-0 select-none">
                      <rect width="48" height="48" rx="12" fill="#F4F4F5" />
                      <path d="M34 22C34 26.9706 29.9706 31 25 31C23.3705 31 21.8512 30.5668 20.5387 29.8119L15.1 31.45L16.63 26.212C15.6634 24.988 15.1 23.557 15.1 22C15.1 17.0294 19.1294 13 24.1 13C29.9706 13 34 17.0294 34 22Z" fill="#09090b" />
                      <circle cx="21.4" cy="22" r="1.2" fill="white" />
                      <circle cx="25" cy="22" r="1.2" fill="white" />
                      <circle cx="28.6" cy="22" r="1.2" fill="white" />
                    </svg>
                    <div className="text-left">
                      <h5 className="text-xs xl:text-sm 2xl:text-base font-bold text-zinc-900 leading-none">Vende 24/7 por WhatsApp</h5>
                      <p className="text-[10px] xl:text-xs 2xl:text-sm font-semibold text-zinc-400 mt-1 max-w-[210px] xl:max-w-none leading-tight">Nova responde y vende automáticamente mientras tú te enfocas en tu negocio.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-300 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-4 xl:p-6 border border-zinc-200 bg-white rounded-xl shadow-none hover:bg-zinc-50/20 transition-all">
                  <div className="flex items-center gap-4 xl:gap-5">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 xl:w-14 xl:h-14 shrink-0 select-none">
                      <rect width="48" height="48" rx="12" fill="#EEF2FF" />
                      <path d="M16 19.5L20.5 17C21.3 18.2 22.6 19 24 19C25.4 19 26.7 18.2 27.5 17L32 19.5L33.8 24L30.6 25.3L30.2 33.5C30.2 34.3 29.5 35 28.7 35H19.3C18.5 35 17.8 34.3 17.8 33.5L17.4 25.3L14.2 24L16 19.5Z" fill="#4F46E5" />
                      <circle cx="24" cy="24.5" r="1.2" fill="white" />
                      <circle cx="24" cy="28.5" r="1.2" fill="white" />
                    </svg>
                    <div className="text-left">
                      <h5 className="text-xs xl:text-sm 2xl:text-base font-bold text-zinc-900 leading-none">Catálogo inteligente</h5>
                      <p className="text-[10px] xl:text-xs 2xl:text-sm font-semibold text-zinc-400 mt-1 max-w-[210px] xl:max-w-none leading-tight">Crea tu catálogo en segundos con IA y mantenlo siempre actualizado.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-300 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-4 xl:p-6 border border-zinc-200 bg-white rounded-xl shadow-none hover:bg-zinc-50/20 transition-all">
                  <div className="flex items-center gap-4 xl:gap-5">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 xl:w-14 xl:h-14 shrink-0 select-none">
                      <rect width="48" height="48" rx="12" fill="#F5F3FF" />
                      <rect x="13" y="17" width="22" height="14" rx="2" fill="#8B5CF6" />
                      <rect x="13" y="20" width="22" height="3" fill="#4C1D95" />
                      <rect x="16" y="26" width="4" height="2" rx="0.5" fill="#C084FC" />
                      <rect x="30" y="26" width="2" height="2" rx="0.5" fill="#E9D5FF" />
                    </svg>
                    <div className="text-left">
                      <h5 className="text-xs xl:text-sm 2xl:text-base font-bold text-zinc-900 leading-none">Cobros seguros</h5>
                      <p className="text-[10px] xl:text-xs 2xl:text-sm font-semibold text-zinc-400 mt-1 max-w-[210px] xl:max-w-none leading-tight">Recibe pagos fácilmente con múltiples métodos de pago integrados.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-300 shrink-0" />
                </div>

                <div className="flex items-center justify-between p-4 xl:p-6 border border-zinc-200 bg-white rounded-xl shadow-none hover:bg-zinc-50/20 transition-all">
                  <div className="flex items-center gap-4 xl:gap-5">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 xl:w-14 xl:h-14 shrink-0 select-none">
                      <rect width="48" height="48" rx="12" fill="#F4F4F5" />
                      <rect x="14" y="16" width="20" height="16" rx="2" fill="white" stroke="#09090b" strokeWidth="1.5" />
                      <rect x="14" y="16" width="20" height="4" fill="#E4E4E7" />
                      <circle cx="17" cy="18" r="0.8" fill="#09090b" />
                      <circle cx="19.5" cy="18" r="0.8" fill="#09090b" />
                      <path d="M17 28L21 24L25 26.5L31 21" stroke="#09090b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-left">
                      <h5 className="text-xs xl:text-sm 2xl:text-base font-bold text-zinc-900 leading-none">Todo en un solo lugar</h5>
                      <p className="text-[10px] xl:text-xs 2xl:text-sm font-semibold text-zinc-400 mt-1 max-w-[210px] xl:max-w-none leading-tight">Gestiona pedidos, clientes, productos y análisis desde tu dashboard.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-300 shrink-0" />
                </div>
              </div>

              {/* Sparkles Box with 5 min badge on the right */}
              <div className="p-4 xl:p-6 bg-zinc-50 border border-zinc-200/60 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 xl:w-6 xl:h-6 text-zinc-900 shrink-0 animate-pulse" />
                  <div className="text-left">
                    <p className="text-[11px] xl:text-xs 2xl:text-sm text-zinc-900 font-bold leading-none">
                      En menos de 5 minutos tendrás tu tienda lista para empezar a vender.
                    </p>
                    <p className="text-[9px] xl:text-xs 2xl:text-sm text-zinc-400 font-semibold mt-1">
                      Fácil, rápido y sin complicaciones.
                    </p>
                  </div>
                </div>
                
                {/* 5 min badge */}
                <div className="bg-white border border-zinc-200 px-2 py-0.5 xl:px-3 xl:py-1 rounded-full flex items-center gap-1 text-[9px] xl:text-xs text-zinc-650 font-extrabold select-none shrink-0 h-6 xl:h-8">
                  <Clock className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-zinc-400" />
                  <span>5 min</span>
                </div>
              </div>

              <div className="space-y-3 xl:space-y-4">
                <button
                  onClick={handleNext}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs xl:text-sm rounded-xl h-12 xl:h-14 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-sm cursor-pointer select-none"
                >
                  Comenzar ahora
                  <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5" />
                </button>

                <p className="text-[10px] xl:text-xs text-zinc-455 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-zinc-455" />
                  Es gratis. Configura tu tienda sin tarjeta de crédito.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS INFORMATION */}
          {currentStep === 2 && (
            <div className="max-w-md xl:max-w-xl 2xl:max-w-2xl mx-auto space-y-6 xl:space-y-8 animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-zinc-955 tracking-tight">Información de tu negocio</h3>
                <p className="text-xs xl:text-sm 2xl:text-base text-zinc-400 font-bold tracking-widest uppercase">Establece tu identidad digital</p>
              </div>

              <div className="space-y-4 xl:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="storeName" className="text-xs xl:text-sm font-bold text-zinc-700">Nombre de la tienda</label>
                  <input
                    id="storeName"
                    type="text"
                    required
                    placeholder="Ej. Boutique Bella Vista"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 xl:px-5 xl:py-4 text-xs xl:text-sm focus:outline-none focus:border-zinc-955 focus:ring-2 focus:ring-zinc-100 transition-all font-medium"
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
                  <label htmlFor="storeSlug" className="text-xs xl:text-sm font-bold text-zinc-700">Dirección web única (Slug)</label>
                  <div className="flex items-center bg-white border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-955 focus-within:ring-2 focus-within:ring-zinc-100 transition-all">
                    <span className="pl-3 sm:pl-4 text-[10px] sm:text-xs xl:text-sm font-semibold text-zinc-405 select-none shrink-0">flash.checkout/tienda/</span>
                    <input
                      id="storeSlug"
                      type="text"
                      required
                      placeholder="boutique-bella"
                      className="flex-1 px-1 py-3 xl:py-4 text-[10px] sm:text-xs xl:text-sm border-none bg-transparent focus:outline-none font-bold text-zinc-900 min-w-0"
                      value={storeForm.slug}
                      onChange={e => setStoreForm(f => ({ ...f, slug: generateSlug(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="storeWhatsapp" className="text-xs xl:text-sm font-bold text-zinc-700">WhatsApp del Negocio</label>
                  <input
                    id="storeWhatsapp"
                    type="tel"
                    required
                    placeholder="573001234567"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 xl:px-5 xl:py-4 text-xs xl:text-sm focus:outline-none focus:border-zinc-955 focus:ring-2 focus:ring-zinc-100 transition-all font-medium tabular-nums"
                    value={storeForm.whatsapp}
                    onChange={e => setStoreForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '') }))}
                  />
                  <p className="text-[10px] xl:text-xs 2xl:text-sm text-zinc-400 font-semibold mt-1">Incluye el código de país sin el símbolo "+" (Ej: Colombia: 57)</p>
                </div>

                <div className="space-y-3 xl:space-y-4">
                  <label className="text-xs xl:text-sm font-bold text-zinc-700">Categoría comercial</label>
                  <div className="grid grid-cols-2 gap-2 xl:gap-3">
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
                          "flex items-center gap-2.5 p-3 xl:p-4 rounded-lg border transition-all text-left cursor-pointer",
                          storeForm.category === cat.id
                            ? "bg-zinc-950 border-zinc-950 text-white scale-[1.02]"
                            : "bg-white border-zinc-200 text-zinc-655 hover:bg-zinc-50"
                        )}
                      >
                        <cat.icon className={cn("w-4 h-4 xl:w-5 xl:h-5 shrink-0", storeForm.category === cat.id ? "text-white" : "text-zinc-400")} />
                        <span className="text-xs xl:text-sm font-semibold tracking-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-650 text-xs xl:text-sm font-bold px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CONNECT WHATSAPP */}
          {currentStep === 3 && (
            <div className="space-y-6 xl:space-y-8 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto animate-in fade-in duration-300 font-sans">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-[10px] xl:text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Configuración del Canal
                </div>
                <h3 className="text-2xl xl:text-3xl 2xl:text-4xl font-black text-zinc-955 tracking-tight flex items-center justify-center gap-2">
                  Conecta tu WhatsApp 
                  <Smartphone className="w-6 h-6 xl:w-8 xl:h-8 text-zinc-900 fill-zinc-50" />
                </h3>
                <p className="text-sm xl:text-base 2xl:text-lg text-zinc-500 font-medium max-w-md xl:max-w-xl mx-auto leading-relaxed">
                  Escanea el código QR con tu WhatsApp Business para conectar tu número y activar tu bot de ventas automatizado.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8 items-stretch">
                
                {/* Left Card: QR and instructions */}
                <div className="bg-white border border-zinc-200 hover:border-zinc-300/80 rounded-2xl p-6 xl:p-8 flex flex-col justify-between gap-6 xl:gap-8 shadow-sm hover:shadow-md transition-all duration-300 relative min-h-[390px] xl:min-h-[460px]">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 select-none">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full animate-pulse",
                      whatsappStatus === 'CONNECTED' ? 'bg-zinc-950' : 'bg-amber-500'
                    )} />
                    <span className="text-xs xl:text-sm font-bold text-zinc-800">
                      Estado: {whatsappStatus === 'CONNECTED' ? 'Conectado' : 'Esperando conexión'}
                    </span>
                  </div>

                  {/* QR Box */}
                  <div className="flex flex-col items-center justify-center flex-1 py-2">
                    {whatsappStatus === 'LOADING' ? (
                      <div className="flex flex-col items-center gap-2.5">
                        <Loader2 className="w-8 h-8 xl:w-10 xl:h-10 animate-spin text-zinc-900" />
                        <span className="text-xs xl:text-sm text-zinc-400 font-semibold tracking-wider">Generando QR...</span>
                      </div>
                    ) : whatsappStatus === 'QRCODE' && qrCodeBase64 ? (
                      <div className="space-y-4 flex flex-col items-center">
                        <div className="relative border-4 border-zinc-100 rounded-xl overflow-hidden p-2 bg-white hover:scale-102 transition-transform">
                          <img 
                            src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`} 
                            alt="QR de conexión de WhatsApp" 
                            className="w-48 h-48 xl:w-56 xl:h-56 object-contain"
                          />
                          <div className="absolute inset-0 m-auto w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow">
                            <Smartphone className="w-5 h-5 xl:w-6 xl:h-6 text-zinc-900" />
                          </div>
                        </div>

                        {/* Expiration Timer badge */}
                        <div className="bg-zinc-100 border border-zinc-200 px-4 py-1.5 rounded-full flex items-center gap-1.5 text-zinc-900 text-xs xl:text-sm font-bold select-none">
                          <Clock className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-zinc-900" />
                          <span>El código expirará en {formatTime(qrExpiresIn)}</span>
                        </div>
                      </div>
                    ) : whatsappStatus === 'CONNECTED' ? (
                      <div className="flex flex-col items-center gap-2 text-zinc-950">
                        <CheckCircle2 className="w-12 h-12 xl:w-16 xl:h-16 stroke-[2px]" />
                        <span className="text-sm xl:text-base font-bold">¡WhatsApp Vinculado!</span>
                      </div>
                    ) : (
                      <button 
                        onClick={triggerWhatsappConnect}
                        className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs xl:text-sm rounded-xl px-6 py-3.5 xl:px-8 xl:py-4.5 shadow-sm shadow-zinc-200 hover:shadow-md hover:shadow-zinc-300/40 active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4 fill-current animate-pulse" />
                        Generar código QR
                      </button>
                    )}
                  </div>

                  {/* Connect Steps list */}
                  <div className="space-y-3 pt-4 border-t border-zinc-100 text-left">
                    <h5 className="text-[10px] xl:text-xs font-bold text-zinc-450 tracking-wider uppercase">Pasos para conectar:</h5>
                    <div className="space-y-2">
                      {[
                        "Abre WhatsApp Business en tu celular.",
                        "Ve a Configuración > Dispositivos vinculados.",
                        "Escanea este código QR con la cámara."
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs xl:text-sm text-zinc-650 font-medium">
                          <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-900 font-bold text-[10px] xl:text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Card: Status summary / Features */}
                <div className="bg-white border border-zinc-200 hover:border-zinc-300/80 rounded-2xl p-6 xl:p-8 flex flex-col justify-between gap-6 xl:gap-8 shadow-sm hover:shadow-md transition-all duration-300">
                  
                  {/* Status Illustration / Message */}
                  <div className="flex flex-col items-center text-center justify-center py-6 flex-1 space-y-4 border-b border-zinc-100/60">
                    <div className={cn(
                      "w-16 h-16 xl:w-20 xl:h-20 rounded-full flex items-center justify-center border relative animate-in zoom-in-50",
                      whatsappStatus === 'CONNECTED' 
                        ? 'bg-zinc-950 border-zinc-950 text-white'
                        : 'bg-[#FAFAFA] border-zinc-200 text-zinc-400'
                    )}>
                      {whatsappStatus !== 'CONNECTED' && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-zinc-950/10 animate-ping" />
                          <div className="absolute -inset-2 rounded-full border border-dashed border-zinc-950/20 animate-spin [animation-duration:15s]" />
                        </>
                      )}
                      {whatsappStatus === 'CONNECTED' ? (
                        <Check className="w-8 h-8 xl:w-10 xl:h-10 stroke-[3px]" />
                      ) : (
                        <Smartphone className="w-7 h-7 xl:w-9 xl:h-9 animate-bounce [animation-duration:3s]" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-base xl:text-lg 2xl:text-xl font-bold text-zinc-955">
                        {whatsappStatus === 'CONNECTED' ? '¡WhatsApp conectado!' : 'Esperando Vinculación'}
                      </h4>
                      <p className="text-xs xl:text-sm 2xl:text-base text-zinc-555 font-semibold mt-1">
                        {whatsappStatus === 'CONNECTED' 
                          ? `Tu número +${storeForm.whatsapp || '57 312 456 7890'} ha sido conectado correctamente.`
                          : 'Escanea el código con tu celular para activar el bot de ventas Nova.'}
                      </p>
                    </div>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-4 xl:space-y-6 text-left">
                    <div className="flex items-start gap-3 xl:gap-4">
                      <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                        <MessageSquare className="w-4.5 h-4.5 xl:w-5.5 xl:h-5.5" />
                      </div>
                      <div>
                        <h5 className="text-xs xl:text-sm 2xl:text-base font-bold text-zinc-900 leading-none">Nova está lista para conversar</h5>
                        <p className="text-[11px] xl:text-xs 2xl:text-sm font-medium text-zinc-400 mt-1">Responderá a tus clientes e ingresará pedidos al instante.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 xl:gap-4">
                      <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                        <Clock className="w-4.5 h-4.5 xl:w-5.5 xl:h-5.5" />
                      </div>
                      <div>
                        <h5 className="text-xs xl:text-sm 2xl:text-base font-bold text-zinc-900 leading-none">Atención 24/7 sin límites</h5>
                        <p className="text-[11px] xl:text-xs 2xl:text-sm font-medium text-zinc-400 mt-1">Tus compradores serán atendidos a cualquier hora del día.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 xl:gap-4">
                      <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-900 shrink-0 mt-0.5">
                        <ShieldCheck className="w-4.5 h-4.5 xl:w-5.5 xl:h-5.5 text-zinc-900" />
                      </div>
                      <div>
                        <h5 className="text-xs xl:text-sm 2xl:text-base font-bold text-zinc-900 leading-none">Seguro y confiable</h5>
                        <p className="text-[11px] xl:text-xs 2xl:text-sm font-medium text-zinc-400 mt-1">Tus conversaciones y datos de clientes están 100% protegidos.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PRODUCT CATALOG */}
          {currentStep === 4 && (
            <div className="space-y-6 xl:space-y-8 max-w-3xl xl:max-w-5xl 2xl:max-w-6xl mx-auto animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-zinc-955 tracking-tight">Catálogo de productos</h3>
                <p className="text-xs xl:text-sm 2xl:text-base text-zinc-500 font-bold uppercase tracking-widest">Crea el primer producto de tu menú visual</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 xl:gap-8 items-start">
                
                {/* Left side: Product Form (7/12) */}
                <div className="md:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 xl:p-8 space-y-4 xl:space-y-6 text-left">
                  <div className="space-y-2">
                    <label htmlFor="prodName" className="text-xs xl:text-sm font-bold text-zinc-700">Nombre del producto</label>
                    <input
                      id="prodName"
                      type="text"
                      placeholder="Ej. Pizza Margarita Gigante"
                      className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 xl:px-5 xl:py-3.5 text-xs xl:text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium"
                      value={productForm.name}
                      onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="prodPrice" className="text-xs xl:text-sm font-bold text-zinc-700">Precio (COP)</label>
                      <input
                        id="prodPrice"
                        type="number"
                        placeholder="25000"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 xl:px-5 xl:py-3.5 text-xs xl:text-sm focus:outline-none focus:border-emerald-500 transition-all font-semibold tabular-nums"
                        value={productForm.price}
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="prodStock" className="text-xs xl:text-sm font-bold text-zinc-700">Stock físico</label>
                      <input
                        id="prodStock"
                        type="number"
                        placeholder="10"
                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 xl:px-5 xl:py-3.5 text-xs xl:text-sm focus:outline-none focus:border-emerald-500 transition-all font-semibold tabular-nums"
                        value={productForm.stock}
                        onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="prodDesc" className="text-xs xl:text-sm font-bold text-zinc-700">Descripción (Opcional)</label>
                    <textarea
                      id="prodDesc"
                      placeholder="Ingredientes, tallas, colores o detalles importantes del artículo..."
                      rows={3}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-3 xl:p-4 text-xs xl:text-sm focus:outline-none focus:border-emerald-500 transition-all font-medium resize-none"
                      value={productForm.description}
                      onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* Image upload */}
                  <div className="space-y-2">
                    <label className="text-xs xl:text-sm font-bold text-zinc-700 block">Foto del producto</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 hover:border-zinc-350 rounded-lg px-4 py-2.5 xl:px-5 xl:py-3.5 cursor-pointer text-xs xl:text-sm font-bold text-zinc-655 bg-zinc-50 hover:bg-zinc-100/50 transition-all flex-1">
                        <Upload className="w-4 h-4 xl:w-5 xl:h-5 text-zinc-400" />
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
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs xl:text-sm rounded-lg py-3 xl:py-3.5 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 xl:w-5 xl:h-5" />
                    Añadir al Catálogo
                  </button>
                </div>

                {/* Right side: Catalog View (5/12) */}
                <div className="md:col-span-5 bg-zinc-50/50 border border-zinc-200 border-dashed rounded-xl p-5 xl:p-8 space-y-4 xl:space-y-6 flex flex-col h-full min-h-[240px] md:min-h-[360px] xl:min-h-[420px] justify-between text-left">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                      <h4 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Catálogo preliminar</h4>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] xl:text-xs font-extrabold text-zinc-900 tracking-wider">
                        {addedProducts.length} productos
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {addedProducts.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="w-8 h-8 xl:w-10 xl:h-10 stroke-[1.5px]" />
                          <p className="text-[11px] xl:text-xs 2xl:text-sm font-semibold tracking-wider uppercase font-sans">Tu menú está vacío</p>
                        </div>
                      ) : (
                        addedProducts.map((p, idx) => (
                          <div key={idx} className="flex gap-3 p-2 xl:p-3 bg-white border border-zinc-200 rounded-lg items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-3 min-w-0">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 xl:w-12 xl:h-12 object-cover rounded border" />
                              ) : (
                                <div className="w-10 h-10 xl:w-12 xl:h-12 bg-zinc-100 rounded border flex items-center justify-center text-zinc-300">
                                  <ImageIcon className="w-4 h-4 xl:w-5 xl:h-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="text-xs xl:text-sm font-bold text-zinc-955 truncate leading-tight">{p.name}</h5>
                                <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 tracking-wider mt-0.5">Stock: {p.stock}</p>
                              </div>
                            </div>
                            <span className="text-xs xl:text-sm font-extrabold text-zinc-900 shrink-0 tabular-nums">
                              ${p.price.toLocaleString('es-CO')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] xl:text-xs 2xl:text-sm text-zinc-900 leading-normal font-semibold">
                    💡 Agrega tus productos estrella para que Nova empiece a recomendarlos a tus clientes desde el día uno.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT METHODS */}
          {currentStep === 5 && (
            <div className="max-w-md xl:max-w-xl 2xl:max-w-2xl mx-auto space-y-6 xl:space-y-8 animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-zinc-955 tracking-tight">Métodos de pago</h3>
                <p className="text-xs xl:text-sm 2xl:text-base text-zinc-500 font-bold uppercase tracking-widest">Elige cómo te pagarán tus clientes</p>
              </div>

              <div className="space-y-4 xl:space-y-6">
                
                {/* Option 1: Manual Bank Transfer */}
                <label className="flex items-start gap-4 p-4 xl:p-6 border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50/30 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1.5 h-4 w-4 xl:h-5 xl:w-5 text-zinc-950 border-zinc-300 rounded focus:ring-zinc-950/20"
                    checked={payments.manual}
                    onChange={e => setPayments(p => ({ ...p, manual: e.target.checked }))}
                  />
                  <div className="space-y-1">
                    <span className="text-xs xl:text-sm 2xl:text-base font-extrabold text-zinc-955 flex items-center gap-1.5">
                      Transferencia Manual (Nequi / Daviplata)
                      <span className="bg-zinc-950 text-white border border-zinc-950 text-[9px] xl:text-xs font-bold px-1.5 py-0.2 rounded-md select-none leading-none">Recomendado</span>
                    </span>
                    <p className="text-[11px] xl:text-xs 2xl:text-sm text-zinc-400 font-medium leading-relaxed">
                      Tus clientes adjuntarán la captura de la transferencia en el chat y tú auditarás y aprobarás manualmente el pago desde el panel.
                    </p>
                  </div>
                </label>

                {/* Option 2: Mercado Pago */}
                <label className="flex items-start gap-4 p-4 xl:p-6 border border-zinc-200 rounded-xl bg-white hover:bg-zinc-50/30 transition-all cursor-pointer text-left">
                  <input
                    type="checkbox"
                    className="mt-1.5 h-4 w-4 xl:h-5 xl:w-5 text-zinc-955 border-zinc-300 rounded focus:ring-zinc-950/20"
                    checked={payments.mercadopago}
                    onChange={e => setPayments(p => ({ ...p,  mercadopago: e.target.checked }))}
                  />
                  <div className="space-y-1">
                    <span className="text-xs xl:text-sm 2xl:text-base font-extrabold text-zinc-955 flex items-center gap-1.5">
                      Mercado Pago Connect
                      <CreditCard className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-zinc-500" />
                    </span>
                    <p className="text-[11px] xl:text-xs 2xl:text-sm text-zinc-400 font-medium leading-relaxed">
                      Permite cobros con tarjetas de crédito, PSE y efectivo. Podrás vincular tu cuenta real de Mercado Pago fácilmente desde el panel una vez finalices la configuración.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: STORE PREFERENCES */}
          {currentStep === 6 && (
            <div className="max-w-md xl:max-w-xl 2xl:max-w-2xl mx-auto space-y-6 xl:space-y-8 animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-zinc-955 tracking-tight">Preferencias del bot y tienda</h3>
                <p className="text-xs xl:text-sm 2xl:text-base text-zinc-550 font-bold uppercase tracking-widest">Personaliza el comportamiento de Nova</p>
              </div>

              <div className="space-y-4 xl:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="welcomeMessage" className="text-xs xl:text-sm font-bold text-zinc-700">Mensaje de bienvenida automático</label>
                  <textarea
                    id="welcomeMessage"
                    rows={2}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-3 xl:p-4 text-xs xl:text-sm focus:outline-none focus:border-zinc-955 transition-all font-medium resize-none leading-normal"
                    value={preferences.welcomeMessage}
                    onChange={e => setPreferences(p => ({ ...p, welcomeMessage: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="systemPrompt" className="text-xs xl:text-sm font-bold text-zinc-700">Instrucciones de comportamiento (Prompt de Nova)</label>
                  <textarea
                    id="systemPrompt"
                    rows={4}
                    className="w-full bg-white border border-zinc-200 rounded-lg p-3 xl:p-4 text-xs xl:text-sm focus:outline-none focus:border-zinc-955 transition-all font-medium resize-none leading-normal"
                    value={preferences.systemPrompt}
                    onChange={e => setPreferences(p => ({ ...p, systemPrompt: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="businessHours" className="text-xs xl:text-sm font-bold text-zinc-700">Horarios de atención comercial</label>
                  <input
                    id="businessHours"
                    type="text"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 xl:px-5 xl:py-3.5 text-xs xl:text-sm focus:outline-none focus:border-zinc-955 transition-all font-medium"
                    value={preferences.businessHours}
                    onChange={e => setPreferences(p => ({ ...p, businessHours: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW AND CONFIRM */}
          {currentStep === 7 && (
            <div className="max-w-md xl:max-w-xl 2xl:max-w-2xl mx-auto space-y-6 xl:space-y-8 animate-in fade-in duration-300 text-left">
              <div className="text-center space-y-2">
                <h3 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-zinc-955 tracking-tight">Revisa y confirma</h3>
                <p className="text-xs xl:text-sm 2xl:text-base text-zinc-555 font-bold uppercase tracking-widest">Todo listo para lanzar tu tienda</p>
              </div>

              <div className="p-5 xl:p-8 bg-[#FAFAFA] border border-zinc-200 rounded-xl space-y-4 xl:space-y-6 text-xs xl:text-sm font-semibold text-zinc-700 font-sans">
                <div className="flex justify-between py-1.5 xl:py-3 border-b border-zinc-100">
                  <span>Tienda</span>
                  <span className="font-bold text-zinc-955">{storeForm.name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 xl:py-3 border-b border-zinc-100 gap-4">
                  <span>Enlace público</span>
                  <span className="font-bold text-zinc-955 break-all text-right max-w-[65%]">flash.checkout/tienda/{storeForm.slug}</span>
                </div>
                <div className="flex justify-between py-1.5 xl:py-3 border-b border-zinc-100">
                  <span>WhatsApp conectado</span>
                  <span className={cn(
                    "font-bold",
                    whatsappStatus === 'CONNECTED' ? "text-zinc-955" : "text-amber-600"
                  )}>
                    {whatsappStatus === 'CONNECTED' ? 'Sí (Conectado)' : 'No (Omitido por ahora)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 xl:py-3 border-b border-zinc-100">
                  <span>Catálogo inicial</span>
                  <span className="font-bold text-zinc-955">{addedProducts.length} productos registrados</span>
                </div>
                <div className="flex justify-between py-1.5 xl:py-3">
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
            <div className="max-w-md xl:max-w-xl 2xl:max-w-2xl mx-auto text-center space-y-6 xl:space-y-8 py-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8 xl:w-10 xl:h-10 stroke-[3px]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight text-zinc-955 font-display">
                  ¡Todo listo y configurado!
                </h3>
                <p className="text-xs xl:text-sm 2xl:text-base text-zinc-555 font-bold uppercase tracking-wider">
                  Tu tienda digital ha sido lanzada en producción
                </p>
              </div>
              <p className="text-sm xl:text-base 2xl:text-lg text-zinc-500 leading-relaxed font-normal">
                Has completado exitosamente la configuración de tu tienda. Nova ya está lista para recibir mensajes, interactuar y cerrar ventas en tiempo real.
              </p>

              <div className="pt-6">
                <button
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                  className="bg-zinc-955 hover:bg-zinc-900 text-white font-bold text-sm xl:text-base rounded-lg px-8 py-3.5 xl:px-10 xl:py-4.5 shadow-sm shadow-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Lanzando panel...
                    </>
                  ) : (
                    <>
                      Ir al Panel de Control
                      <ArrowRight className="w-4 h-4 xl:w-5 xl:h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Buttons */}
        {currentStep !== 8 && currentStep !== 1 && (
          <div className="flex items-center justify-between pt-6 xl:pt-8 border-t border-zinc-100">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-655 font-bold text-xs xl:text-sm rounded-lg px-5 py-3.5 xl:px-7 xl:py-4.5 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
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
              className="bg-zinc-955 hover:bg-zinc-900 text-white font-bold text-xs xl:text-sm rounded-lg px-6 py-3.5 xl:px-8 xl:py-4.5 shadow-sm shadow-zinc-200 hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {currentStep === 7 ? 'Confirmar y Lanzar' : 'Continuar'}
                  <ArrowRight className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
