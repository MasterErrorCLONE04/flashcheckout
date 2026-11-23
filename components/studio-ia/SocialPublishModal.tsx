'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  X,
  Check,
  Loader2,
  Send,
  Sparkles,
  Image as ImageIcon,
  Video,
  Link2,
  Wand2,
} from 'lucide-react'
import { SiInstagram, SiFacebook, SiWhatsapp, SiMeta } from 'react-icons/si'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type SocialChannel = 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP_STATUS'

export interface MetaSocialBrief {
  connected: boolean
  facebookPageId: string | null
  facebookPageName: string | null
  instagramAccountId: string | null
  instagramUsername: string | null
  defaultChannels: Array<'INSTAGRAM' | 'FACEBOOK'>
}

interface SocialPublishModalProps {
  isOpen: boolean
  onClose: () => void
  storeName: string
  storeSlug: string
  whatsappConnected: boolean
  metaSocial: MetaSocialBrief | null
  onMetaUpdated: (nextMeta: MetaSocialBrief) => void
  product: {
    id: string
    name: string
    price: number
    imageUrl: string | null
    description?: string
  } | null
  mediaUrl: string | null
  mediaType: 'image' | 'video'
  initialCaption: string
  hookText?: string
  hashtags?: string[]
  onPublishedSuccess?: (creation: any) => void
}

export function SocialPublishModal({
  isOpen,
  onClose,
  storeName,
  storeSlug,
  whatsappConnected,
  metaSocial,
  onMetaUpdated,
  product,
  mediaUrl,
  mediaType,
  initialCaption,
  hookText,
  hashtags = [],
  onPublishedSuccess,
}: SocialPublishModalProps) {
  const [selectedChannels, setSelectedChannels] = useState<SocialChannel[]>([
    'INSTAGRAM',
    'FACEBOOK',
  ])
  const [caption, setCaption] = useState(initialCaption)
  const [isPublishing, setIsPublishing] = useState(false)

  // Quick inline Meta connection state if not connected yet
  const [showInlineConnect, setShowInlineConnect] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [fbPageIdInput, setFbPageIdInput] = useState(
    metaSocial?.facebookPageId || ''
  )
  const [igIdInput, setIgIdInput] = useState(
    metaSocial?.instagramAccountId || ''
  )
  const [isSavingMeta, setIsSavingMeta] = useState(false)

  const storePublicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/tienda/${storeSlug}`
      : `https://flashcheckout.co/tienda/${storeSlug}`

  useEffect(() => {
    if (isOpen) {
      if (metaSocial?.defaultChannels?.length) {
        setSelectedChannels([...metaSocial.defaultChannels])
      } else {
        setSelectedChannels(['INSTAGRAM', 'FACEBOOK'])
      }
      setCaption(buildTemplateCaption(initialCaption))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCaption, product?.id])

  function buildTemplateCaption(baseCopy: string) {
    const cleanBase = (baseCopy || '').trim()
    const priceFormatted = product
      ? `$${product.price.toLocaleString('es-CO')} COP`
      : ''
    const tags =
      hashtags.length > 0
        ? hashtags.map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')
        : `#${storeName.replace(/\s+/g, '')} #Colombia #TiendaOnline`

    const lines = [
      hookText && !cleanBase.includes(hookText) ? `🔥 ${hookText}` : '',
      cleanBase || (product ? `Descubre ${product.name} en ${storeName}.` : ''),
      product ? `\n💰 Precio: ${priceFormatted}` : '',
      `🛒 Pide el tuyo aquí: ${storePublicUrl}`,
      `\n${tags}`,
    ].filter(Boolean)

    return lines.join('\n')
  }

  if (!isOpen) return null

  const toggleChannel = (channel: SocialChannel) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const handleSaveInlineMeta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) {
      toast.error('Pega tu Access Token de Meta Graph API')
      return
    }
    setIsSavingMeta(true)
    try {
      const res = await fetch('/api/integrations/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: tokenInput.trim(),
          facebookPageId: fbPageIdInput.trim() || undefined,
          instagramAccountId: igIdInput.trim() || undefined,
          defaultChannels: ['INSTAGRAM', 'FACEBOOK'],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo vincular la cuenta de Meta')
      }
      onMetaUpdated(data.metaSocial)
      setShowInlineConnect(false)
      setTokenInput('')
      toast.success('¡Facebook e Instagram enlazados correctamente!')
    } catch (err: any) {
      toast.error(err.message || 'Error al vincular con Meta')
    } finally {
      setIsSavingMeta(false)
    }
  }

  const handlePublishNow = async () => {
    if (selectedChannels.length === 0) {
      toast.error('Selecciona al menos una red social donde publicar')
      return
    }
    if (!mediaUrl) {
      toast.error('Selecciona un producto con foto o genera un video primero')
      return
    }

    const needsMeta =
      selectedChannels.includes('INSTAGRAM') ||
      selectedChannels.includes('FACEBOOK')
    if (needsMeta && !metaSocial?.connected) {
      setShowInlineConnect(true)
      toast.error('Primero enlaza tu cuenta de Facebook e Instagram')
      return
    }

    setIsPublishing(true)
    try {
      const res = await fetch('/api/studio-ia/publish-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: selectedChannels,
          caption,
          mediaUrl,
          mediaType,
          productId: product?.id,
          title: `${mediaType === 'video' ? 'Reel' : 'Post'} IA - ${
            product?.name || storeName
          }`,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || 'No se pudo completar la publicación en redes sociales'
        )
      }

      toast.success(data.message || '¡Contenido publicado con éxito!')
      if (data.creation && onPublishedSuccess) {
        onPublishedSuccess(data.creation)
      }
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Error al publicar en redes sociales')
    } finally {
      setIsPublishing(false)
    }
  }

  const isBothMetaSelected =
    selectedChannels.includes('INSTAGRAM') &&
    selectedChannels.includes('FACEBOOK') &&
    !selectedChannels.includes('WHATSAPP_STATUS')

  const isOnlyIgSelected =
    selectedChannels.length === 1 && selectedChannels[0] === 'INSTAGRAM'

  const isOnlyFbSelected =
    selectedChannels.length === 1 && selectedChannels[0] === 'FACEBOOK'

  const isAllThreeSelected =
    selectedChannels.includes('INSTAGRAM') &&
    selectedChannels.includes('FACEBOOK') &&
    selectedChannels.includes('WHATSAPP_STATUS')

  return (
    <div className="fixed inset-0 z-[150] bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Send className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950 tracking-tight">
                Publicador Multicanal (Instagram & Facebook)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* 1. Connection Status Banner */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] flex items-center justify-center shrink-0">
                <SiMeta className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-950">
                    {metaSocial?.connected
                      ? 'Cuentas Meta Enlazadas'
                      : 'Enlaza tu cuenta de Facebook e Instagram'}
                  </span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase border',
                      metaSocial?.connected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}
                  >
                    {metaSocial?.connected ? 'Conectado' : 'Sin vincular'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {metaSocial?.connected
                    ? `FB: ${metaSocial.facebookPageName || 'Página activa'} · IG: @${
                        metaSocial.instagramUsername || 'Business'
                      }`
                    : 'Vincula tus cuentas una sola vez para publicar el mismo post en ambas redes.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowInlineConnect(v => !v)}
                className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Link2 className="w-3 h-3" />
                <span>
                  {metaSocial?.connected ? 'Cambiar cuenta' : 'Vincular aquí'}
                </span>
              </button>
              <Link
                href="/integraciones"
                className="h-7 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1 no-underline"
              >
                <span>Integraciones ↗</span>
              </Link>
            </div>
          </div>

          {/* Inline Meta Quick-Connect Form */}
          {showInlineConnect && (
            <form
              onSubmit={handleSaveInlineMeta}
              className="p-4 rounded-xl border border-zinc-950 bg-zinc-50/70 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-950">
                  Vinculación Rápida con Meta Graph API
                </span>
                <a
                  href="/api/integrations/meta/auth"
                  className="text-[11px] font-bold text-[#1877F2] hover:underline inline-flex items-center gap-1"
                >
                  <SiMeta className="w-3 h-3" />
                  <span>O conectar vía OAuth →</span>
                </a>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Access Token de Página / Meta Business *
                </label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  placeholder="EAAGm0PX4ZCpsBA..."
                  className="w-full h-8.5 bg-white border border-zinc-200 rounded-lg px-3 font-mono text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] font-semibold text-zinc-600 block mb-1">
                    ID Página Facebook (opcional, auto)
                  </label>
                  <input
                    type="text"
                    value={fbPageIdInput}
                    onChange={e => setFbPageIdInput(e.target.value)}
                    placeholder="Auto-detectado"
                    className="w-full h-8 bg-white border border-zinc-200 rounded-lg px-2.5 font-mono text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-semibold text-zinc-600 block mb-1">
                    ID Instagram Business (opcional, auto)
                  </label>
                  <input
                    type="text"
                    value={igIdInput}
                    onChange={e => setIgIdInput(e.target.value)}
                    placeholder="Auto-detectado"
                    className="w-full h-8 bg-white border border-zinc-200 rounded-lg px-2.5 font-mono text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInlineConnect(false)}
                  className="h-8 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingMeta}
                  className="h-8 px-3.5 rounded-lg bg-zinc-950 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingMeta ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Guardar y Enlazar</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. Target Platforms Selection (Publish in Both or Single) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                1. ¿Dónde quieres publicar esta plantilla?
              </label>

              {/* Quick 1-click preset pills */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedChannels(['INSTAGRAM', 'FACEBOOK'])}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer',
                    isBothMetaSelected
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                  )}
                >
                  Ambos (IG + FB)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannels(['INSTAGRAM'])}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer',
                    isOnlyIgSelected
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                  )}
                >
                  Solo IG
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannels(['FACEBOOK'])}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer',
                    isOnlyFbSelected
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                  )}
                >
                  Solo FB
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedChannels([
                      'INSTAGRAM',
                      'FACEBOOK',
                      'WHATSAPP_STATUS',
                    ])
                  }
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer',
                    isAllThreeSelected
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                  )}
                >
                  IG + FB + WA
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Instagram Card */}
              <button
                type="button"
                onClick={() => toggleChannel('INSTAGRAM')}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  selectedChannels.includes('INSTAGRAM')
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-2xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <SiInstagram
                    className={cn(
                      'w-4 h-4 shrink-0',
                      selectedChannels.includes('INSTAGRAM')
                        ? 'text-pink-400'
                        : 'text-[#E1306C]'
                    )}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      Instagram
                    </span>
                    <span
                      className={cn(
                        'text-[10px] block truncate',
                        selectedChannels.includes('INSTAGRAM')
                          ? 'text-zinc-300'
                          : 'text-zinc-400'
                      )}
                    >
                      {mediaType === 'video' ? 'Reel 9:16' : 'Post Feed'}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-4 h-4 rounded flex items-center justify-center border shrink-0',
                    selectedChannels.includes('INSTAGRAM')
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                      : 'border-zinc-300'
                  )}
                >
                  {selectedChannels.includes('INSTAGRAM') && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </button>

              {/* Facebook Card */}
              <button
                type="button"
                onClick={() => toggleChannel('FACEBOOK')}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  selectedChannels.includes('FACEBOOK')
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-2xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <SiFacebook
                    className={cn(
                      'w-4 h-4 shrink-0',
                      selectedChannels.includes('FACEBOOK')
                        ? 'text-sky-400'
                        : 'text-[#1877F2]'
                    )}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      Facebook
                    </span>
                    <span
                      className={cn(
                        'text-[10px] block truncate',
                        selectedChannels.includes('FACEBOOK')
                          ? 'text-zinc-300'
                          : 'text-zinc-400'
                      )}
                    >
                      Página Oficial
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-4 h-4 rounded flex items-center justify-center border shrink-0',
                    selectedChannels.includes('FACEBOOK')
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                      : 'border-zinc-300'
                  )}
                >
                  {selectedChannels.includes('FACEBOOK') && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </button>

              {/* WhatsApp Status Card */}
              <button
                type="button"
                onClick={() => toggleChannel('WHATSAPP_STATUS')}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  selectedChannels.includes('WHATSAPP_STATUS')
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-2xs'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <SiWhatsapp className="w-4 h-4 text-[#25D366] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">
                      WhatsApp
                    </span>
                    <span
                      className={cn(
                        'text-[10px] block truncate',
                        selectedChannels.includes('WHATSAPP_STATUS')
                          ? 'text-zinc-300'
                          : 'text-zinc-400'
                      )}
                    >
                      {whatsappConnected ? 'Estado 24h' : 'Sin QR'}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-4 h-4 rounded flex items-center justify-center border shrink-0',
                    selectedChannels.includes('WHATSAPP_STATUS')
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                      : 'border-zinc-300'
                  )}
                >
                  {selectedChannels.includes('WHATSAPP_STATUS') && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* 3. Unified Template Preview (Media + Editable Caption) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Media Thumbnail Preview (4 cols) */}
            <div className="md:col-span-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block">
                2. Archivo Multimedia
              </span>
              <div className="aspect-[4/5] w-full rounded-xl border border-zinc-200 bg-zinc-100 overflow-hidden relative flex items-center justify-center">
                {mediaUrl ? (
                  mediaType === 'video' ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={product?.name || 'Post'}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-4 text-zinc-400 space-y-1">
                    <ImageIcon className="w-6 h-6 mx-auto" />
                    <p className="text-[10px] font-semibold">
                      Sin imagen o video seleccionado
                    </p>
                  </div>
                )}

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-950/85 text-white text-[9.5px] font-bold uppercase inline-flex items-center gap-1">
                  {mediaType === 'video' ? (
                    <>
                      <Video className="w-2.5 h-2.5" />
                      <span>Video / Reel</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-2.5 h-2.5" />
                      <span>Fotografía</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Unified Caption Template Editor (8 cols) */}
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                  3. Plantilla del Post (Se publicará en las redes elegidas)
                </label>
                <button
                  type="button"
                  onClick={() => setCaption(buildTemplateCaption(initialCaption))}
                  className="inline-flex items-center gap-1 text-[10.5px] font-bold text-zinc-600 hover:text-zinc-950 cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Restaurar plantilla IA</span>
                </button>
              </div>

              <textarea
                rows={9}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Escribe el texto, precio, link de tu tienda y hashtags..."
                className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 resize-y leading-relaxed"
              />

              <p className="text-[10.5px] text-zinc-400">
                Incluye automáticamente el precio oficial y el enlace directo a tu checkout ({storePublicUrl}).
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-semibold text-zinc-500">
            Destino:{' '}
            <strong className="text-zinc-950">
              {selectedChannels.length === 0
                ? 'Ninguno'
                : selectedChannels
                    .map(c =>
                      c === 'INSTAGRAM'
                        ? 'Instagram'
                        : c === 'FACEBOOK'
                          ? 'Facebook'
                          : 'WhatsApp'
                    )
                    .join(' + ')}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handlePublishNow}
              disabled={isPublishing || selectedChannels.length === 0}
              className="h-9 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publicando en redes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Publicar Ahora ({selectedChannels.length}{' '}
                    {selectedChannels.length === 1 ? 'red' : 'redes'})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
