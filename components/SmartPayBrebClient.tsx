'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  QrCode,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { QRCodeCanvas } from 'qrcode.react'
import { cn } from '@/lib/utils'

type BrebConfig = {
  enabled: boolean
  keyValue: string
  bankProvider: string
  merchantDisplayName: string
  participantId: string
  keyTypeCode: string
} | null

type BrebPaymentIntent = {
  id: string
  orderId: string
  amount: number
  currency: string
  reference: string
  emvPayload: string
  status: string
  expiresAt: string
}

interface SmartPayBrebClientProps {
  order: {
    id: string
    customerName: string
    total: number
    paymentStatus: string
    status: string
    createdAt: string
  }
  store: {
    name: string
    logoUrl: string | null
    whatsapp: string | null
  }
  items: Array<{
    productId: string
    name: string
    qty: number
    price: number
  }>
  paymentUrl: string
  brebConfig?: BrebConfig
  initialTimeLeft?: number
}

export default function SmartPayBrebClient({
  order,
  store,
  items,
  paymentUrl,
  brebConfig = null,
  initialTimeLeft,
}: SmartPayBrebClientProps) {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft ?? 900)
  const [showQrOnMobile, setShowQrOnMobile] = useState(false)
  const [brebIntent, setBrebIntent] = useState<BrebPaymentIntent | null>(null)
  const [brebError, setBrebError] = useState<string | null>(null)
  const [isLoadingBreb, setIsLoadingBreb] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null)
  const [proofMessage, setProofMessage] = useState<string | null>(null)
  const [isUploadingProof, setIsUploadingProof] = useState(false)
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)

  const isBrebEnabled = Boolean(brebConfig?.enabled)
  const isPaid =
    paymentStatus === 'PAID' ||
    paymentStatus === 'CONFIRMED' ||
    paymentStatus === 'paid'
  const isUnderReview =
    paymentStatus === 'MANUAL_REVIEW' || paymentStatus === 'UPLOADED'
  const isRejected = paymentStatus === 'REJECTED'
  const isExpired = timeLeft <= 0 && !isPaid && !isUnderReview
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentUrl)}`
  const orderCode = order.id.slice(-6).toUpperCase()

  useEffect(() => {
    if (isPaid) return

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/status?orderId=${order.id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()

        if (typeof data.paymentStatus === 'string') {
          setPaymentStatus(data.paymentStatus)
        }

        if (
          data.paymentStatus === 'PAID' ||
          data.paymentStatus === 'CONFIRMED' ||
          data.paymentStatus === 'paid'
        ) {
          clearInterval(intervalId)
        }
      } catch (err) {
        console.error('Error polling order status:', err)
      }
    }, 3000)

    return () => clearInterval(intervalId)
  }, [order.id, isPaid])

  useEffect(() => {
    if (isPaid) return

    const timeStart =
      initialTimeLeft !== undefined
        ? initialTimeLeft
        : Math.max(
            0,
            900 -
              Math.floor(
                (Date.now() - new Date(order.createdAt).getTime()) / 1000
              )
          )

    setTimeLeft(timeStart)
    if (timeStart <= 0) return

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [order.createdAt, isPaid, initialTimeLeft])

  useEffect(() => {
    if (!isBrebEnabled || isPaid) return

    let cancelled = false
    setIsLoadingBreb(true)
    setBrebError(null)

    fetch('/api/breb/payment-intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    })
      .then(async res => {
        const data = await res.json().catch(() => null)
        if (!res.ok)
          throw new Error(data?.error || 'No pudimos generar el QR Bre-B.')
        return data.paymentIntent as BrebPaymentIntent
      })
      .then(intent => {
        if (!cancelled) setBrebIntent(intent)
      })
      .catch(error => {
        if (!cancelled)
          setBrebError(
            error instanceof Error ? error.message : 'Error generando Bre-B.'
          )
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBreb(false)
      })

    return () => {
      cancelled = true
    }
  }, [isBrebEnabled, isPaid, order.id])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedLabel(label)
    setTimeout(() => setCopiedLabel(null), 2000)
  }

  const handleFileSelect = (file: File | null) => {
    setProofFile(file)
    if (proofPreviewUrl) {
      URL.revokeObjectURL(proofPreviewUrl)
    }
    if (file) {
      setProofPreviewUrl(URL.createObjectURL(file))
    } else {
      setProofPreviewUrl(null)
    }
  }

  const uploadProof = async () => {
    if (!proofFile) {
      setProofMessage('Selecciona una captura del comprobante primero.')
      return
    }

    setIsUploadingProof(true)
    setProofMessage(null)

    const formData = new FormData()
    formData.append('orderId', order.id)
    formData.append('proof', proofFile)

    try {
      const res = await fetch('/api/breb/proofs', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok)
        throw new Error(data?.error || 'No pudimos procesar el comprobante.')

      if (typeof data.paymentStatus === 'string')
        setPaymentStatus(data.paymentStatus)
      setProofMessage(data.message || 'Comprobante recibido.')
    } catch (error) {
      setProofMessage(
        error instanceof Error ? error.message : 'Error subiendo comprobante.'
      )
    } finally {
      setIsUploadingProof(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans text-left pb-10">
      {/* Top Studio Checkout Bar */}
      <header className="h-14 w-full bg-white border-b border-zinc-200 px-5 sm:px-8 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-7 h-7 rounded-lg border border-zinc-200 object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs">
              {store.name[0]?.toUpperCase()}
            </div>
          )}
          <span className="font-bold text-sm text-zinc-950 tracking-tight">
            {store.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isPaid && !isUnderReview && !isExpired && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-mono font-bold text-zinc-900 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1">
            #{orderCode}
          </span>
        </div>
      </header>

      {/* Main Split-Pane Architectural Payment Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Order Summary & Instructions (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Status Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isPaid ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      Pago Confirmado
                    </span>
                  ) : isUnderReview ? (
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                      En Validación
                    </span>
                  ) : isExpired ? (
                    <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
                      Orden Expirada
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                      Checkout Seguro
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 font-medium">
                    Cliente: <strong className="text-zinc-700">{order.customerName}</strong>
                  </span>
                </div>

                <h1 className="text-xl font-bold tracking-tight text-zinc-950 pt-1">
                  {isPaid
                    ? '¡Tu pago fue aprobado!'
                    : isUnderReview
                      ? 'Comprobante recibido en revisión'
                      : isExpired
                        ? 'Tiempo de reserva finalizado'
                        : 'Completa el pago de tu pedido'}
                </h1>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {isPaid
                    ? 'La tienda ya fue notificada y está alistando tu despacho.'
                    : isUnderReview
                      ? 'Recibimos la imagen de tu transferencia. El comercio confirmará el pago en breve.'
                      : isExpired
                        ? 'Comunícate por WhatsApp con la tienda para reactivar tu orden.'
                        : 'Revisa el detalle de tus productos y realiza la transferencia por Bre-B o pasarela.'}
                </p>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Detalle de Productos ({items.length})
                  </span>
                  <a
                    href={`/api/orders/invoice/${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Descargar Recibo PDF ↗</span>
                  </a>
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
                  {items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="p-3.5 flex items-center justify-between text-xs bg-white"
                    >
                      <div className="min-w-0 pr-4">
                        <h5 className="font-bold text-zinc-950 truncate">
                          {item.name}
                        </h5>
                        <span className="text-[11px] text-zinc-400 font-mono block mt-0.5">
                          {item.qty} × ${item.price.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-zinc-950 shrink-0 tabular-nums">
                        ${(item.price * item.qty).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Box */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Total a Pagar
                  </span>
                  <span className="text-2xl font-mono font-bold text-zinc-950 mt-0.5 block leading-none tabular-nums">
                    ${order.total.toLocaleString('es-CO')} COP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Estado
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 inline-block border',
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isUnderReview
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isRejected || isExpired
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    )}
                  >
                    {isPaid
                      ? 'Pagado'
                      : isUnderReview
                        ? 'En revisión'
                        : isRejected
                          ? 'Rechazado'
                          : isExpired
                            ? 'Expirado'
                            : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>

            {isBrebEnabled && brebIntent && !isPaid && !isUnderReview && (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-xs text-zinc-700 space-y-2">
                <div className="font-bold text-zinc-950">
                  Instrucciones de pago inmediato Bre-B
                </div>
                <ol className="space-y-1 text-[11.5px] text-zinc-600 list-decimal list-inside">
                  <li>Abre Nequi, Bancolombia, Davivienda, Nu o tu banco.</li>
                  <li>Escanea el código QR o copia la Llave Bre-B del comercio.</li>
                  <li>
                    Transfiere exactamente{' '}
                    <strong className="font-mono text-zinc-950">
                      ${order.total.toLocaleString('es-CO')} COP
                    </strong>
                    .
                  </li>
                  <li>Adjunta la captura del comprobante en el panel derecho.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Right Column: Payment Execution / QR / Proof Uploader (5 cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-[#FAFAFA] flex flex-col justify-center items-center text-center">
            {isPaid ? (
              <ResultState
                orderId={order.id}
                icon={<CheckCircle2 className="w-8 h-8" />}
                tone="success"
                title="Pago verificado con éxito"
                description="Tu orden ya está pagada. Puedes descargar tu recibo PDF o escribirle al comercio por WhatsApp."
                whatsapp={store.whatsapp}
                orderCode={orderCode}
              />
            ) : isUnderReview ? (
              <ResultState
                orderId={order.id}
                icon={<ShieldCheck className="w-8 h-8" />}
                tone="warning"
                title="Comprobante en validación"
                description="El comercio recibió la captura de tu transferencia y actualizará el estado de tu pedido."
                whatsapp={store.whatsapp}
                orderCode={orderCode}
              />
            ) : isExpired ? (
              <ResultState
                orderId={order.id}
                icon={<Clock className="w-8 h-8" />}
                tone="neutral"
                title="Tiempo expirado"
                description="Comunícate con la tienda por WhatsApp para reactivar o confirmar tu pedido."
                whatsapp={store.whatsapp}
                orderCode={orderCode}
              />
            ) : isBrebEnabled && brebConfig ? (
              <div className="w-full space-y-4 flex flex-col items-center">
                {isLoadingBreb && (
                  <div className="h-64 w-full rounded-xl border border-zinc-200 bg-white flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
                    <p className="text-xs font-semibold text-zinc-500">
                      Generando QR Bre-B EMVCo...
                    </p>
                  </div>
                )}

                {brebError && (
                  <div className="w-full rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-left text-xs text-rose-700 font-semibold">
                    <AlertCircle className="w-4 h-4 mb-1.5" />
                    {brebError}
                  </div>
                )}

                {brebIntent && (
                  <>
                    <div className="p-3.5 bg-white border border-zinc-200 rounded-2xl shadow-2xs">
                      <QRCodeCanvas
                        value={brebIntent.emvPayload}
                        size={200}
                        level="M"
                        includeMargin
                        fgColor="#09090B"
                      />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(brebConfig.keyValue, 'Llave Bre-B')
                        }
                        className="rounded-xl border border-zinc-200 bg-white p-2.5 text-left hover:border-zinc-950 transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Llave Bre-B
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-1.5 text-xs font-mono font-bold text-zinc-950">
                          <span className="truncate">{brebConfig.keyValue}</span>
                          {copiedLabel === 'Llave Bre-B' ? (
                            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                          )}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(brebIntent.reference, 'Referencia')
                        }
                        className="rounded-xl border border-zinc-200 bg-white p-2.5 text-left hover:border-zinc-950 transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                          Referencia
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-1.5 text-xs font-mono font-bold text-zinc-950">
                          <span className="truncate">{brebIntent.reference}</span>
                          {copiedLabel === 'Referencia' ? (
                            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                          )}
                        </span>
                      </button>
                    </div>

                    <div className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-left flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Comercio Destino
                        </div>
                        <div className="text-xs font-bold text-zinc-950 mt-0.5">
                          {brebConfig.merchantDisplayName || store.name}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono font-bold text-zinc-700">
                        {brebConfig.bankProvider || 'Bre-B'}
                      </span>
                    </div>

                    {/* Proof Uploader with Image Preview */}
                    <div className="w-full space-y-2.5 pt-1">
                      <label className="w-full min-h-24 rounded-xl border border-dashed border-zinc-300 bg-white hover:border-zinc-950 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer p-3">
                        {proofPreviewUrl ? (
                          <div className="flex items-center gap-3 w-full text-left">
                            <img
                              src={proofPreviewUrl}
                              alt="Vista previa comprobante"
                              className="w-12 h-12 rounded-lg object-cover border border-zinc-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-zinc-950 truncate">
                                {proofFile?.name}
                              </p>
                              <p className="text-[10px] text-emerald-600 font-semibold">
                                Clic para cambiar imagen
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-5 h-5 text-zinc-500" />
                            <span className="text-xs font-bold text-zinc-900">
                              Subir captura del comprobante
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              JPG, PNG o WebP
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={event =>
                            handleFileSelect(event.target.files?.[0] || null)
                          }
                        />
                      </label>

                      <button
                        type="button"
                        onClick={uploadProof}
                        disabled={isUploadingProof}
                        className="w-full h-10 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                      >
                        {isUploadingProof ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>Enviar Comprobante de Pago</span>
                      </button>

                      {proofMessage && (
                        <p className="text-[11px] font-semibold text-zinc-600">
                          {proofMessage}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full space-y-5 flex flex-col items-center">
                <div className="block md:hidden w-full space-y-3">
                  <a
                    href={paymentUrl}
                    className="w-full h-10 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
                  >
                    <span>Pagar Ahora</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowQrOnMobile(!showQrOnMobile)}
                    className="w-full h-9 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 shrink-0" />
                    <span>
                      {showQrOnMobile ? 'Ocultar código QR' : 'Mostrar código QR'}
                    </span>
                  </button>

                  {showQrOnMobile && (
                    <div className="p-4 bg-white border border-zinc-200 rounded-xl inline-block mx-auto">
                      <img
                        src={qrCodeUrl}
                        alt="Código QR de pago"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="hidden md:flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white border border-zinc-200 rounded-2xl">
                    <img
                      src={qrCodeUrl}
                      alt="Código QR de pago"
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Escanea el QR
                    </span>
                    <p className="text-xs text-zinc-500 leading-normal max-w-[210px]">
                      Abre la cámara de tu celular o haz clic abajo para ir a la pasarela.
                    </p>
                  </div>

                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Ir a Pasarela de Pago</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center pt-2">
        <span className="text-[11px] font-medium text-zinc-400">
          Checkout cifrado y procesado por <strong className="text-zinc-600">FlashCheckout</strong>
        </span>
      </footer>
    </div>
  )
}

function ResultState({
  orderId,
  orderCode,
  icon,
  tone,
  title,
  description,
  whatsapp,
}: {
  orderId: string
  orderCode: string
  icon: React.ReactNode
  tone: 'success' | 'warning' | 'neutral'
  title: string
  description: string
  whatsapp: string | null
}) {
  const cleanPhone = (whatsapp || '').replace(/\D/g, '')
  const waText = encodeURIComponent(
    `Hola, escribo por mi pedido #${orderCode} en su tienda.`
  )

  return (
    <div className="space-y-4 animate-in zoom-in-95 duration-200 w-full max-w-xs">
      <div
        className={cn(
          'w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto',
          tone === 'success' &&
            'bg-emerald-50 border-emerald-200 text-emerald-600',
          tone === 'warning' &&
            'bg-amber-50 border-amber-200 text-amber-600',
          tone === 'neutral' && 'bg-zinc-100 border-zinc-200 text-zinc-500'
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-zinc-950 text-sm">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <a
          href={`/api/orders/invoice/${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-9 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Descargar Recibo PDF</span>
        </a>

        {cleanPhone && (
          <a
            href={`https://wa.me/${cleanPhone}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-9 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <SiWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Escribir por WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  )
}
