'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ClientContainerProps, SmartInboxAlert, ActiveChat } from './types'

export function useDashboardClientState(props: ClientContainerProps) {
  const {
    storeUrl,
    storeName,
    storeSlug,
    initialWhatsappConnected = false,
    chartData,
    initialAlerts = [],
    initialChats = [],
    initialActivities = [],
  } = props

  const [copied, setCopied] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showSuggestionBanner, setShowSuggestionBanner] = useState(true)
  const [showAllAlertsModal, setShowAllAlertsModal] = useState(false)

  const [alerts, setAlerts] = useState<SmartInboxAlert[]>(initialAlerts)
  const [chats, setChats] = useState<ActiveChat[]>(initialChats)
  const [activities, setActivities] = useState<any[]>(initialActivities)

  const [whatsappConnected, setWhatsappConnected] = useState(initialWhatsappConnected)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [pollingStatus, setPollingStatus] = useState(false)

  // Polling WhatsApp Instance status on connection modal open
  useEffect(() => {
    let intervalId: any
    if (pollingStatus && !whatsappConnected) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/whatsapp/instance?storeSlug=${storeSlug}`)
          const data = await res.json()
          if (data.connected) {
            setWhatsappConnected(true)
            setPollingStatus(false)
            setShowWhatsAppModal(false)
            setQrCodeBase64(null)
            toast.success('¡WhatsApp vinculado exitosamente!')
          } else if (data.qr) {
            setQrCodeBase64(data.qr)
          }
        } catch (err) {
          console.error('Error checking WhatsApp status:', err)
        }
      }, 3000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [pollingStatus, whatsappConnected, storeSlug])

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showQrModal || showWhatsAppModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showQrModal, showWhatsAppModal])

  const handleStripeRedirect = async () => {
    try {
      setLoadingStripe(true)
      const response = await fetch('/api/stripe')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Fallo al conectar con la pasarela de pagos.')
      }

      toast.info("Redirigiendo...", {
        description: "Serás redirigido de forma segura al portal de facturación de Stripe."
      })
      window.location.href = data.url
    } catch (error: any) {
      toast.error("Error financiero", {
        description: error.message || 'No pudimos conectar con Stripe.'
      })
    } finally {
      setLoadingStripe(false)
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    toast.success('¡Enlace copiado al portapapeles!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleConnectWhatsApp() {
    setLoadingQr(true)
    setQrCodeBase64(null)
    try {
      const res = await fetch('/api/whatsapp/instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeSlug })
      })
      const data = await res.json()
      if (data.qr) {
        setQrCodeBase64(data.qr)
        setPollingStatus(true)
      } else if (data.connected) {
        setWhatsappConnected(true)
        toast.success('WhatsApp ya se encuentra conectado')
      }
    } catch (err) {
      toast.error('Error al generar código QR de WhatsApp')
      console.error(err)
    } finally {
      setLoadingQr(false)
    }
  }

  function handleDownloadReport() {
    const headers = ['Fecha', 'Ventas Web', 'Ventas WhatsApp', 'Total Diario']
    const rows = chartData.map(d => [
      d.date,
      d.webSales,
      d.whatsappSales,
      d.total
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `Reporte_Ventas_${storeName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const activeAlerts = alerts.filter(a => {
    if (a.id === 'whatsapp-disconnected' || a.type === 'whatsapp_disconnected') {
      return !whatsappConnected
    }
    return true
  })

  return {
    copied,
    showQrModal,
    setShowQrModal,
    showWhatsAppModal,
    setShowWhatsAppModal,
    loadingStripe,
    showQuickActions,
    setShowQuickActions,
    showSuggestionBanner,
    setShowSuggestionBanner,
    showAllAlertsModal,
    setShowAllAlertsModal,
    alerts,
    setAlerts,
    chats,
    setChats,
    activities,
    setActivities,
    whatsappConnected,
    setWhatsappConnected,
    qrCodeBase64,
    loadingQr,
    pollingStatus,
    setPollingStatus,
    activeAlerts,
    handleStripeRedirect,
    handleCopyLink,
    handleConnectWhatsApp,
    handleDownloadReport,
  }
}
