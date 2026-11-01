'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { StoreSettingsData } from './types'

export function useStoreIntegrations(initialStore: StoreSettingsData) {
  const [mpConnected, setMpConnected] = useState(!!initialStore.mpConnected)
  const [mpPublicKey, setMpPublicKey] = useState(initialStore.mpPublicKey || '')
  const [disconnectingMp, setDisconnectingMp] = useState(false)

  const [whatsappConnected, setWhatsappConnected] = useState(!!initialStore.whatsappConnected)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [qrCodeText, setQrCodeText] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [pollingStatus, setPollingStatus] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const mpConnectedParam = params.get('mp_connected')
      if (mpConnectedParam === 'success') {
        setMpConnected(true)
        toast.success("¡Mercado Pago conectado!", {
          description: "Tu pasarela de Mercado Pago está lista para procesar transacciones."
        })
        window.history.replaceState({}, '', window.location.pathname)
      } else if (mpConnectedParam === 'error') {
        const reason = params.get('error_reason')
        toast.error("Error al conectar Mercado Pago", {
          description: `Ocurrió un problema: ${reason || 'error_desconocido'}. Inténtalo de nuevo.`
        })
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  useEffect(() => {
    async function checkInitialStatus() {
      if (initialStore.whatsappInstanceName) {
        try {
          const res = await fetch('/api/whatsapp/instance')
          if (!res.ok) { console.warn("checkInitialStatus got response status", res.status); return }
          const data = await res.json()
          if (data.status === 'CONNECTED') {
            setWhatsappConnected(true)
          } else if (data.status === 'QRCODE') {
            setQrCodeBase64(data.base64 || null)
            setQrCodeText(data.code || null)
            setPollingStatus(true)
          }
        } catch (err) {
          console.error("Error checkInitialStatus on mount", err)
        }
      }
    }
    checkInitialStatus()
  }, [initialStore.whatsappInstanceName])

  useEffect(() => {
    let intervalId: any
    if (pollingStatus && !whatsappConnected) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch('/api/whatsapp/instance')
          if (!res.ok) { console.warn("pollingStatus got response status", res.status); return }
          const data = await res.json()
          if (data.status === 'CONNECTED') {
            setWhatsappConnected(true)
            setQrCodeBase64(null)
            setPollingStatus(false)
            toast.success("¡WhatsApp enlazado con éxito! ✅", {
              description: "Tu número celular ahora está vinculado a Flashcheckouts y respondiendo de forma automática."
            })
          } else if (data.status === 'QRCODE') {
            if (data.base64 && data.base64 !== qrCodeBase64) {
              setQrCodeBase64(data.base64)
              setQrCodeText(data.code)
            }
          }
        } catch (err) {
          console.error("Error polling WhatsApp QR connection state", err)
        }
      }, 3000)
    }
    return () => { if (intervalId) clearInterval(intervalId) }
  }, [pollingStatus, whatsappConnected, qrCodeBase64])

  async function handleConnectWhatsApp() {
    setLoadingQr(true)
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      })
      if (!res.ok) throw new Error('Fallo al conectar')
      const data = await res.json()
      if (data.status === 'CONNECTED') {
        setWhatsappConnected(true)
        toast.success("¡WhatsApp ya está conectado! ✅")
      } else {
        setQrCodeBase64(data.base64 || null)
        setQrCodeText(data.code || null)
        setPollingStatus(true)
        toast.info("Código QR generado. Escanéalo desde tu WhatsApp.")
      }
    } catch (err) {
      toast.error("Error al iniciar conexión de WhatsApp")
    } finally {
      setLoadingQr(false)
    }
  }

  async function handleDisconnectWhatsApp() {
    setLoadingQr(true)
    try {
      const res = await fetch('/api/whatsapp/instance', { method: 'DELETE' })
      if (!res.ok) throw new Error('Fallo al desconectar')
      setWhatsappConnected(false)
      setQrCodeBase64(null)
      setQrCodeText(null)
      setPollingStatus(false)
      toast.success("Dispositivo de WhatsApp desconectado correctamente.")
    } catch (err) {
      toast.error("Error al desconectar dispositivo")
    } finally {
      setLoadingQr(false)
    }
  }

  function handleConnectMercadoPago() {
    const appId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID || ''
    if (!appId) {
      toast.error("Configuración incompleta", {
        description: "NEXT_PUBLIC_MERCADOPAGO_APP_ID no está configurado en las variables de entorno."
      })
      return
    }
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const redirectUri = encodeURIComponent(`${base.replace(/\/$/, '')}/api/mercadopago/callback`)
    const authUrl = `https://auth.mercadopago.com/authorization?client_id=${appId}&response_type=code&redirect_uri=${redirectUri}&state=${initialStore.id}`
    window.location.href = authUrl
  }

  async function handleDisconnectMercadoPago() {
    setDisconnectingMp(true)
    try {
      const res = await fetch('/api/stores/disconnect-mercadopago', { method: 'POST' })
      if (!res.ok) throw new Error('Error al desconectar')
      setMpConnected(false)
      setMpPublicKey('')
      toast.success("Mercado Pago desconectado", { description: "Se han removido las credenciales del comercio." })
    } catch (error) {
      toast.error("Error al desconectar", { description: "No se pudo desconectar tu cuenta de Mercado Pago. Inténtalo de nuevo." })
    } finally {
      setDisconnectingMp(false)
    }
  }

  return {
    mpConnected,
    mpPublicKey,
    disconnectingMp,
    whatsappConnected,
    qrCodeBase64,
    qrCodeText,
    loadingQr,
    pollingStatus,
    handleConnectMercadoPago,
    handleDisconnectMercadoPago,
    handleConnectWhatsApp,
    handleDisconnectWhatsApp,
  }
}
