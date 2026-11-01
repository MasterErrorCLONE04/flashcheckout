import { useState } from 'react'
import { toast } from 'sonner'
import { Product, PhotoActionType, PhotoScene } from './types'

interface UsePhotoStudioParams {
  selectedProduct: Product | null
}

export function usePhotoStudio({ selectedProduct }: UsePhotoStudioParams) {
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string | null>(null)
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [photoActionType, setPhotoActionType] = useState<PhotoActionType | null>(null)
  const [selectedScene, setSelectedScene] = useState<PhotoScene>('marble')
  const [customScenePrompt, setCustomScenePrompt] = useState('')
  const [isGeneratingI2V, setIsGeneratingI2V] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)

  // Foto Studio IA: Enhance Photo
  const handleEnhancePhoto = async (action: PhotoActionType) => {
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
        if (data.isBillingError) {
          toast.dismiss(toastId)
          toast.error('Saldo de Replicate agotado ($0 USD). Recarga $5 USD en replicate.com/account/billing para procesar con IA.', {
            duration: 10000,
            action: {
              label: 'Recargar Replicate',
              onClick: () => window.open('https://replicate.com/account/billing', '_blank')
            }
          })
          return
        }
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

  // Establecer foto mejorada como portada oficial
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

  // Animación 3D Image-to-Video
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
      if (!res.ok || !data.success) {
        if (data.isBillingError) {
          toast.dismiss(toastId)
          toast.error('Saldo de Replicate agotado ($0 USD). Recarga $5 USD en replicate.com/account/billing para procesar con IA.', {
            duration: 10000,
            action: {
              label: 'Recargar Replicate',
              onClick: () => window.open('https://replicate.com/account/billing', '_blank')
            }
          })
          return
        }
        throw new Error(data.error || 'Error al generar video')
      }

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

  return {
    enhancedPhotoUrl,
    setEnhancedPhotoUrl,
    isProcessingPhoto,
    photoActionType,
    selectedScene,
    setSelectedScene,
    customScenePrompt,
    setCustomScenePrompt,
    isGeneratingI2V,
    generatedVideoUrl,
    handleEnhancePhoto,
    handleSetPrimaryPhoto,
    handleGenerateI2V
  }
}
