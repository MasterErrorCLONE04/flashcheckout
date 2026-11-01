'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useWhatsAppConnection(initialConnected: boolean) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(initialConnected)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [qrCodeText, setQrCodeText] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [pollingStatus, setPollingStatus] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    if (isConnected) return

    async function initWhatsAppConnection() {
      setLoadingQr(true)
      try {
        const statusRes = await fetch('/api/whatsapp/instance')
        if (statusRes.ok) {
          const data = await statusRes.json()
          if (data.status === 'CONNECTED') {
            setIsConnected(true)
            toast.success("¡WhatsApp conectado!")
            return
          } else if (data.status === 'QRCODE') {
            setQrCodeBase64(data.base64 || null)
            setQrCodeText(data.code || null)
            setPollingStatus(true)
            setLoadingQr(false)
            return
          }
        }

        const connectRes = await fetch('/api/whatsapp/instance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'connect' })
        })
        if (connectRes.ok) {
          const data = await connectRes.json()
          if (data.status === 'CONNECTED') {
            setIsConnected(true)
          } else {
            setQrCodeBase64(data.base64 || null)
            setQrCodeText(data.code || null)
            setPollingStatus(true)
          }
        }
      } catch (err) {
        console.error("Error checking/generating WhatsApp connection QR:", err)
      } finally {
        setLoadingQr(false)
      }
    }

    initWhatsAppConnection()
  }, [isConnected])

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    if (pollingStatus && !isConnected) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch('/api/whatsapp/instance')
          if (res.ok) {
            const data = await res.json()
            if (data.status === 'CONNECTED') {
              setIsConnected(true)
              setQrCodeBase64(null)
              setPollingStatus(false)
              toast.success("¡WhatsApp enlazado con éxito! ✅", {
                description: "Tu número celular ahora está vinculado a Flashcheckouts y respondiendo de forma automática."
              })
              router.refresh()
            } else if (data.status === 'QRCODE') {
              if (data.base64 && data.base64 !== qrCodeBase64) {
                setQrCodeBase64(data.base64)
                setQrCodeText(data.code)
              }
            }
          }
        } catch (err) {
          console.error("Error polling WhatsApp QR connection status:", err)
        }
      }, 3000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [pollingStatus, isConnected, qrCodeBase64, router])

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que deseas desconectar WhatsApp? Se detendrán las respuestas automáticas del bot.')) {
      return
    }

    setDisconnecting(true)
    const loadToast = toast.loading('Desconectando WhatsApp...')
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Fallo al desconectar')
      
      setIsConnected(false)
      setQrCodeBase64(null)
      setPollingStatus(false)
      toast.success('WhatsApp desconectado correctamente', { id: loadToast })
      router.refresh()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al desconectar WhatsApp', { id: loadToast })
    } finally {
      setDisconnecting(false)
    }
  }

  const handleRegenerateQr = async () => {
    setLoadingQr(true)
    try {
      await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      })
      const res = await fetch('/api/whatsapp/instance')
      const data = await res.json()
      if (data.status === 'CONNECTED') {
        setIsConnected(true)
      } else {
        setQrCodeBase64(data.base64 || null)
        setQrCodeText(data.code || null)
        setPollingStatus(true)
      }
    } catch {
      toast.error("Error al regenerar código QR")
    } finally {
      setLoadingQr(false)
    }
  }

  return {
    isConnected,
    setIsConnected,
    qrCodeBase64,
    qrCodeText,
    loadingQr,
    pollingStatus,
    disconnecting,
    handleDisconnect,
    handleRegenerateQr
  }
}
