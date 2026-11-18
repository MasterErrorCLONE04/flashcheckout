import { useState } from 'react'
import { toast } from 'sonner'
import { Product, PhotoActionType, PhotoScene } from './types'

interface UsePhotoStudioParams {
  selectedProduct: Product | null
}

export function usePhotoStudio({ selectedProduct }: UsePhotoStudioParams) {
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string | null>(null)
  const [photoHistory, setPhotoHistory] = useState<string[]>([])
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false)
  const [photoActionType, setPhotoActionType] = useState<PhotoActionType | null>(null)
  const [selectedScene, setSelectedScene] = useState<PhotoScene>('marble')
  const [customScenePrompt, setCustomScenePrompt] = useState('')
  const [isGeneratingI2V, setIsGeneratingI2V] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [isGeneratingAvatarVideo, setIsGeneratingAvatarVideo] = useState(false)
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string | null>(null)

  // Foto Studio IA: Enhance / Edit Photo
  const handleEnhancePhoto = async (action: PhotoActionType) => {
    const baseImg = enhancedPhotoUrl || selectedProduct?.imageUrl?.split(',')[0]
    if (!baseImg) {
      toast.error('El producto seleccionado no tiene una imagen base.')
      return
    }

    if (action === 'edit-photo' && !customScenePrompt.trim()) {
      toast.error('Escribe una instrucción para editar la foto con IA.')
      return
    }

    setIsProcessingPhoto(true)
    setPhotoActionType(action)
    const toastId = toast.loading(
      action === 'remove-bg'
        ? 'Removiendo fondo del producto con IA...'
        : action === 'generate-scene'
        ? 'Colocando tu producto en escenario 3D (IC-Light)...'
        : action === 'edit-photo'
        ? 'Editando tu foto con instrucciones de IA...'
        : 'Mejorando resolución a 4K con IA...'
    )

    try {
      const res = await fetch('/api/studio-ia/enhance-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          imageUrl: baseImg,
          productId: selectedProduct?.id,
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
      setPhotoHistory(prev => [data.resultUrl, ...prev.filter(u => u !== data.resultUrl)].slice(0, 8))
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

      selectedProduct.imageUrl = data.resultUrl || enhancedPhotoUrl
      toast.dismiss(toastId)
      toast.success('¡Foto de estudio establecida como portada oficial del producto!')
    } catch (e: any) {
      toast.dismiss(toastId)
      toast.error(e.message || 'No se pudo actualizar el producto')
    }
  }

  // Animación 3D Image-to-Video
  const handleGenerateI2V = async (customPrompt?: string) => {
    const baseImg = enhancedPhotoUrl || selectedProduct?.imageUrl?.split(',')[0]
    if (!baseImg) {
      toast.error('Elige un producto con imagen para generar video.')
      return
    }

    setIsGeneratingI2V(true)
    const toastId = toast.loading('Animando tu producto con IA (Image-to-Video)... Esto toma ~35 segundos.')
    try {
      const res = await fetch('/api/studio-ia/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'i2v',
          imageUrl: baseImg,
          prompt: customPrompt || undefined,
          productId: selectedProduct?.id
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
      toast.success('¡Video 3D del producto generado y sincronizado con el editor!')
    } catch (e: any) {
      toast.dismiss(toastId)
      toast.error(e.message || 'No se pudo generar el video')
    } finally {
      setIsGeneratingI2V(false)
    }
  }

  // Generar Avatar Hablando con Lip-Sync Real (SadTalker + Voz en Español)
  const handleGenerateTalkingAvatar = async (params: {
    avatarImageUrl: string
    scriptText: string
    voice?: string
  }) => {
    if (!params.avatarImageUrl) {
      toast.error('Selecciona o sube la foto de un avatar primero.')
      return
    }
    if (!params.scriptText?.trim()) {
      toast.error('Genera o escribe un guion primero para que el avatar hable.')
      return
    }

    setIsGeneratingAvatarVideo(true)
    const toastId = toast.loading('Generando Avatar IA con Lip-Sync y voz en español... (~40 seg)')
    try {
      const res = await fetch('/api/studio-ia/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'talking-avatar',
          avatarImageUrl: params.avatarImageUrl,
          scriptText: params.scriptText,
          voice: params.voice || 'nova',
          productId: selectedProduct?.id
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        if (data.isBillingError) {
          toast.dismiss(toastId)
          toast.error('Saldo de Replicate agotado ($0 USD). Recarga $5 USD en replicate.com/account/billing para animar avatares con IA.', {
            duration: 10000,
            action: {
              label: 'Recargar Replicate',
              onClick: () => window.open('https://replicate.com/account/billing', '_blank')
            }
          })
          return
        }
        throw new Error(data.error || 'Error al generar el avatar con Lip-Sync')
      }

      setAvatarVideoUrl(data.videoUrl)
      toast.dismiss(toastId)
      toast.success('¡Avatar IA hablando generado con éxito! Ya está integrado en tu video.')
    } catch (e: any) {
      toast.dismiss(toastId)
      toast.error(e.message || 'No se pudo generar el avatar hablando')
    } finally {
      setIsGeneratingAvatarVideo(false)
    }
  }

  return {
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
    setGeneratedVideoUrl,
    isGeneratingAvatarVideo,
    avatarVideoUrl,
    setAvatarVideoUrl,
    handleEnhancePhoto,
    handleSetPrimaryPhoto,
    handleGenerateI2V,
    handleGenerateTalkingAvatar
  }
}
