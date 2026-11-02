'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AddedProduct,
  BusinessProfileState,
  PaymentsState,
  PreferencesState,
  ProductForm,
  STEPS,
  StoreForm,
  WhatsAppStatus
} from './types'

export function useStoreWizardState(isNewStore: boolean = false) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form State
  const [storeForm, setStoreForm] = useState<StoreForm>({
    name: '',
    slug: '',
    whatsapp: '',
    category: 'Moda',
    businessDescription: '',
  })
  const [createdStore, setCreatedStore] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState('')

  // WhatsApp Connection State
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>('DISCONNECTED')
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [qrExpiresIn, setQrExpiresIn] = useState(180)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Product Catalog State
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    price: '',
    stock: '10',
    description: '',
    imageUrl: '',
  })
  const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  // Payment Methods State
  const [payments, setPayments] = useState<PaymentsState>({
    mercadopago: false,
    manual: true,
  })

  // Store Preferences / Bot Settings
  const [preferences, setPreferences] = useState<PreferencesState>({
    welcomeMessage: '¡Hola! Bienvenido a nuestra tienda de WhatsApp. 🛍️ ¿En qué te puedo ayudar hoy?',
    systemPrompt: 'Eres Nova, un asistente de ventas de WhatsApp empático y proactivo. Tu objetivo es guiar al cliente por el catálogo, ayudarle a armar su carrito y motivarlo a concretar el pago mediante Smart Pay.',
    businessHours: 'Lunes a Viernes 8:00 AM - 6:00 PM',
    themeColor: 'emerald'
  })

  // Business Profile for Nova Memory
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileState>({
    niche: '',
    targetAudience: '',
    brandTone: 'Sofisticado y elegante',
    coreProposition: ''
  })

  // Preview Mode Toggle: WhatsApp Chat vs Web Catalog
  const [previewTab, setPreviewTab] = useState<'chat' | 'catalog'>('chat')

  const stopWhatsappPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
  }

  const stopQrTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

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
              businessDescription: data.store.bio || '',
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
        setError('Por favor completa nombre, dirección web y WhatsApp del negocio.')
        return
      }

      setLoading(true)
      try {
        const isUpdatingDraft = Boolean(createdStore?.id)
        const res = await fetch('/api/stores', {
          method: isUpdatingDraft ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isUpdatingDraft
              ? {
                  storeId: createdStore.id,
                  ...storeForm,
                  regeneratePage: true,
                }
              : storeForm
          ),
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'El slug ya podría estar en uso. Prueba con otro.')
          setLoading(false)
          return
        }

        setCreatedStore(data.store)
        if (data.store?.id) {
          document.cookie = `active_store_id=${data.store.id}; path=/; max-age=31536000`
        }

        if (data.generated) {
          setPreferences(prev => ({
            ...prev,
            welcomeMessage: data.generated.welcomeMessage || prev.welcomeMessage,
            systemPrompt: data.generated.systemPrompt || prev.systemPrompt,
          }))
          if (data.generated.businessProfile) {
            setBusinessProfile(data.generated.businessProfile)
          }
        }

        toast.success('¡Negocio y página autogenerados con éxito!')
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
            storeId: createdStore?.id,
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

  const handleCancelNewStore = () => {
    stopWhatsappPolling()
    stopQrTimer()
    document.cookie = 'create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
    window.location.href = '/dashboard'
  }

  const handleFinishOnboarding = async (destination: string = '/dashboard') => {
    setLoading(true)
    try {
      await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: createdStore?.id,
          active: true,
        }),
      })
      if (createdStore?.id) {
        document.cookie = `active_store_id=${createdStore.id}; path=/; max-age=31536000`
      }
      document.cookie = `create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`
      window.location.href = destination
    } catch (e) {
      console.error(e)
      window.location.href = destination
    } finally {
      setLoading(false)
    }
  }

  const currentStepData = STEPS.find(s => s.num === currentStep) || STEPS[0]
  const storeDisplayName = storeForm.name.trim() || 'Tu Tienda'
  const storeDisplaySlug = storeForm.slug.trim() || 'tu-tienda'
  const primaryProduct = addedProducts[0] || (productForm.name ? {
    name: productForm.name,
    price: parseFloat(productForm.price) || 25000,
    imageUrl: productForm.imageUrl || '/red_floral_dress.png',
    stock: parseInt(productForm.stock) || 10
  } : null)

  return {
    currentStep,
    setCurrentStep,
    currentStepData,
    storeForm,
    setStoreForm,
    createdStore,
    loading,
    initializing,
    error,
    setError,
    whatsappStatus,
    setWhatsappStatus,
    qrCodeBase64,
    qrExpiresIn,
    productForm,
    setProductForm,
    addedProducts,
    setAddedProducts,
    uploadingImage,
    payments,
    setPayments,
    preferences,
    setPreferences,
    businessProfile,
    setBusinessProfile,
    previewTab,
    setPreviewTab,
    storeDisplayName,
    storeDisplaySlug,
    primaryProduct,
    generateSlug,
    formatTime,
    triggerWhatsappConnect,
    handleImageUpload,
    handleAddProduct,
    handleDeleteProduct,
    handleNext,
    handleBack,
    handleCancelNewStore,
    handleFinishOnboarding
  }
}

export type StoreWizardState = ReturnType<typeof useStoreWizardState>
