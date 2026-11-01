'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { BrebConfig } from './types'

export function useBrebSettings(storeName: string) {
  const [brebConfig, setBrebConfig] = useState<BrebConfig>({
    enabled: false,
    keyType: 'PHONE',
    keyValue: '',
    bankProvider: '',
    merchantDisplayName: storeName,
    participantId: '',
    keyTypeCode: '',
    verificationStatus: 'PENDING',
  })
  const [loadingBreb, setLoadingBreb] = useState(true)
  const [savingBreb, setSavingBreb] = useState(false)

  useEffect(() => {
    async function loadBrebConfig() {
      setLoadingBreb(true)
      try {
        const res = await fetch('/api/breb/config')
        if (!res.ok) throw new Error('No se pudo cargar Bre-B')
        const data = await res.json()
        if (data.config) {
          setBrebConfig({
            enabled: Boolean(data.config.enabled),
            keyType: data.config.keyType || 'PHONE',
            keyValue: data.config.keyValue || '',
            bankProvider: data.config.bankProvider || '',
            merchantDisplayName: data.config.merchantDisplayName || storeName,
            participantId: data.config.participantId || '',
            keyTypeCode: data.config.keyTypeCode || '',
            verificationStatus: data.config.verificationStatus || 'PENDING',
          })
        }
      } catch (error) {
        console.error('Error loading Bre-B config:', error)
      } finally {
        setLoadingBreb(false)
      }
    }

    loadBrebConfig()
  }, [storeName])

  const applyBrebPreset = (provider: 'NEQUI' | 'NU' | 'DAVIVIENDA' | 'BANCOLOMBIA') => {
    if (provider === 'NEQUI') {
      setBrebConfig(prev => ({
        ...prev,
        bankProvider: 'Nequi',
        participantId: '1507',
        keyType: 'PHONE',
        keyTypeCode: '02',
      }))
      return
    }

    if (provider === 'DAVIVIENDA') {
      setBrebConfig(prev => ({
        ...prev,
        bankProvider: 'Davivienda',
        participantId: '0051',
        keyType: 'PHONE',
        keyTypeCode: '02',
      }))
      return
    }

    if (provider === 'BANCOLOMBIA') {
      setBrebConfig(prev => ({
        ...prev,
        bankProvider: 'Bancolombia',
        participantId: '0007',
        keyType: 'PHONE',
        keyTypeCode: '02',
      }))
      return
    }

    setBrebConfig(prev => ({
      ...prev,
      bankProvider: 'Nu Colombia',
      participantId: '3201',
      keyType: 'ALPHANUMERIC',
      keyTypeCode: '01',
    }))
  }

  async function handleSaveBrebConfig() {
    setSavingBreb(true)
    try {
      const res = await fetch('/api/breb/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brebConfig),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'No se pudo guardar Bre-B')

      setBrebConfig(prev => ({
        ...prev,
        verificationStatus: data.config?.verificationStatus || prev.verificationStatus,
      }))
      toast.success('Bre-B configurado', {
        description: brebConfig.enabled
          ? 'Tu tienda ya puede generar cobros directos con tu llave Bre-B.'
          : 'La configuracion quedo guardada, pero Bre-B esta desactivado.',
      })
    } catch (error) {
      toast.error('Error guardando Bre-B', {
        description: error instanceof Error ? error.message : 'Intentalo de nuevo.',
      })
    } finally {
      setSavingBreb(false)
    }
  }

  return {
    brebConfig,
    setBrebConfig,
    loadingBreb,
    savingBreb,
    applyBrebPreset,
    handleSaveBrebConfig,
  }
}
