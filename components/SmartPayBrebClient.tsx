'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquare,
  QrCode,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
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
}

export default function SmartPayBrebClient({
  order,
  store,
  items,
  paymentUrl,
  brebConfig = null,
}: SmartPayBrebClientProps) {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [timeLeft, setTimeLeft] = useState(900)
  const [showQrOnMobile, setShowQrOnMobile] = useState(false)
  const [brebIntent, setBrebIntent] = useState<BrebPaymentIntent | null>(null)
  const [brebError, setBrebError] = useState<string | null>(null)
  const [isLoadingBreb, setIsLoadingBreb] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofMessage, setProofMessage] = useState<string | null>(null)
  const [isUploadingProof, setIsUploadingProof] = useState(false)

  const isBrebEnabled = Boolean(brebConfig?.enabled)
  const isPaid = paymentStatus === 'PAID' || paymentStatus === 'paid'
  const isUnderReview = paymentStatus === 'MANUAL_REVIEW' || paymentStatus === 'UPLOADED'
  const isRejected = paymentStatus === 'REJECTED'
  const isExpired = timeLeft <= 0 && !isPaid && !isUnderReview
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentUrl)}`

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

        if (data.paymentStatus === 'PAID' || data.paymentStatus === 'paid') {
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

    const createdTime = new Date(order.createdAt).getTime()
    const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000)
    const initialTimeLeft = Math.max(0, 900 - elapsedSeconds)

    setTimeLeft(initialTimeLeft)
    if (initialTimeLeft <= 0) return

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
  }, [order.createdAt, isPaid])

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
        if (!res.ok) throw new Error(data?.error || 'No pudimos generar el QR Bre-B.')
        return data.paymentIntent as BrebPaymentIntent
      })
      .then(intent => {
        if (!cancelled) setBrebIntent(intent)
      })
      .catch(error => {
        if (!cancelled) setBrebError(error instanceof Error ? error.message : 'Error generando Bre-B.')
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
    setProofMessage(`${label} copiada.`)
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
      const res = await fetch('/api/breb/proofs', { method: 'POST', body: formData })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'No pudimos procesar el comprobante.')

      if (typeof data.paymentStatus === 'string') setPaymentStatus(data.paymentStatus)
      setProofMessage(data.message || 'Comprobante recibido.')
    } catch (error) {
      setProofMessage(error instanceof Error ? error.message : 'Error subiendo comprobante.')
    } finally {
      setIsUploadingProof(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eefcf5_0%,#fafafa_38%,#f4f4f5_100%)] flex flex-col justify-between font-sans text-left pb-12">
      <header className="w-full bg-white/85 backdrop-blur border-b border-zinc-200 py-4 px-6 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="w-8 h-8 rounded-full border border-zinc-100 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-600">
              {store.name[0]}
            </div>
          )}
          <span className="font-extrabold text-sm text-zinc-950 tracking-tight">{store.name}</span>
        </div>

        <span className="text-[10px] font-bold text-zinc-400 border border-zinc-200 rounded px-2 py-0.5">
          Pedido #{order.id.slice(-6).toUpperCase()}
        </span>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.08)] grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-7 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-zinc-200 space-y-6">
            <OrderStatusHeader isPaid={isPaid} isUnderReview={isUnderReview} isExpired={isExpired} />
            <OrderItems items={items} />
            <OrderTotal total={order.total} isPaid={isPaid} isUnderReview={isUnderReview} isRejected={isRejected} isExpired={isExpired} />

            {isBrebEnabled && brebIntent && !isPaid && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950">
                <div className="font-black mb-2">CÃƒÂ³mo pagar por Bre-B</div>
                <ol className="space-y-1 font-semibold list-decimal list-inside">
                  <li>Abre tu app bancaria o billetera favorita.</li>
                  <li>Escanea el QR o usa la llave de la tienda.</li>
                  <li>Verifica que el valor sea ${order.total.toLocaleString('es-CO')} COP.</li>
                  <li>Sube la captura del comprobante exitoso aquÃƒÂ­ mismo.</li>
                </ol>
              </div>
            )}
          </div>

          <div className="md:col-span-5 p-6 sm:p-8 bg-zinc-50/70 flex flex-col justify-center items-center text-center space-y-6">
            {isPaid ? (
              <ResultState icon={<CheckCircle2 className="w-9 h-9" />} tone="success" title="Pedido confirmado" description="Tu pago quedÃƒÂ³ registrado. La tienda validarÃƒÂ¡ el despacho de tu orden." whatsapp={store.whatsapp} />
            ) : isUnderReview ? (
              <ResultState icon={<ShieldCheck className="w-9 h-9" />} tone="warning" title="Estamos revisando" description="Si el comprobante coincide, la orden se marcarÃƒÂ¡ como pagada automÃƒÂ¡ticamente o quedarÃƒÂ¡ para revisiÃƒÂ³n del vendedor." whatsapp={store.whatsapp} />
            ) : isExpired ? (
              <ResultState icon={<Clock className="w-8 h-8" />} tone="neutral" title="Tiempo expirado" description="ComunÃƒÂ­cate con el vendedor para renovar esta orden." whatsapp={store.whatsapp} />
            ) : isBrebEnabled && brebConfig ? (
              <BrebPaymentPanel
                config={brebConfig}
                intent={brebIntent}
                isLoading={isLoadingBreb}
                error={brebError}
                proofFile={proofFile}
                proofMessage={proofMessage}
                isUploadingProof={isUploadingProof}
                timeLeft={timeLeft}
                onCopy={copyToClipboard}
                onFileChange={setProofFile}
                onUploadProof={uploadProof}
                formatTime={formatTime}
              />
            ) : (
              <LegacyPaymentPanel
                paymentUrl={paymentUrl}
                qrCodeUrl={qrCodeUrl}
                showQrOnMobile={showQrOnMobile}
                setShowQrOnMobile={setShowQrOnMobile}
                timeLeft={timeLeft}
                formatTime={formatTime}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="text-center">
        <span className="text-[10px] font-semibold text-zinc-400">Procesado de forma segura por Flashcheckouts.</span>
      </footer>
    </div>
  )
}

function OrderStatusHeader({ isPaid, isUnderReview, isExpired }: { isPaid: boolean; isUnderReview: boolean; isExpired: boolean }) {
  return (
    <div className="space-y-1">
      {isPaid ? (
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
          <h1 className="text-xl font-black tracking-tight text-zinc-950">Pago aprobado</h1>
        </div>
      ) : isUnderReview ? (
        <div className="flex items-center gap-2 text-amber-600">
          <ShieldCheck className="w-6 h-6" />
          <h1 className="text-xl font-black tracking-tight text-zinc-950">Comprobante en revisiÃƒÂ³n</h1>
        </div>
      ) : isExpired ? (
        <h1 className="text-xl font-black tracking-tight text-red-600">Pedido expirado</h1>
      ) : (
        <h1 className="text-xl font-black tracking-tight text-zinc-950">Completa tu pago</h1>
      )}
      <p className="text-xs font-semibold text-zinc-500">
        {isPaid
          ? 'Recibimos tu pago. La tienda ya puede preparar tu pedido.'
          : isUnderReview
            ? 'Recibimos tu captura y la estamos validando para proteger a comprador y vendedor.'
            : isExpired
              ? 'El tiempo lÃƒÂ­mite terminÃƒÂ³. EscrÃƒÂ­bele al vendedor para renovar la orden.'
              : 'Revisa tu pedido y paga con el mÃƒÂ©todo disponible de la tienda.'}
      </p>
    </div>
  )
}

function OrderItems({ items }: { items: SmartPayBrebClientProps['items'] }) {
  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Resumen del pedido</span>
      <div className="border border-zinc-150 rounded-xl overflow-hidden divide-y divide-zinc-150">
        {items.map((item, idx) => (
          <div key={`${item.productId}-${idx}`} className="p-3.5 flex items-center justify-between text-xs font-semibold bg-white">
            <div className="min-w-0 pr-4">
              <h5 className="font-bold text-zinc-900 truncate">{item.name}</h5>
              <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">
                Cant: {item.qty} x ${item.price.toLocaleString('es-CO')}
              </span>
            </div>
            <span className="font-bold text-zinc-950 shrink-0">${(item.price * item.qty).toLocaleString('es-CO')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderTotal({ total, isPaid, isUnderReview, isRejected, isExpired }: { total: number; isPaid: boolean; isUnderReview: boolean; isRejected: boolean; isExpired: boolean }) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4.5 flex justify-between items-center">
      <div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total a pagar</span>
        <span className="text-2xl font-black text-zinc-950 mt-1 block leading-none">${total.toLocaleString('es-CO')} COP</span>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Estado</span>
        <span className={cn(
          'px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider leading-none mt-1.5 inline-block border',
          isPaid
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
            : isUnderReview
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : isRejected || isExpired
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
        )}>
          {isPaid ? 'Pagado' : isUnderReview ? 'RevisiÃƒÂ³n' : isRejected ? 'Rechazado' : isExpired ? 'Expirado' : 'Pendiente'}
        </span>
      </div>
    </div>
  )
}

function BrebPaymentPanel({
  config,
  intent,
  isLoading,
  error,
  proofFile,
  proofMessage,
  isUploadingProof,
  timeLeft,
  onCopy,
  onFileChange,
  onUploadProof,
  formatTime,
}: {
  config: NonNullable<BrebConfig>
  intent: BrebPaymentIntent | null
  isLoading: boolean
  error: string | null
  proofFile: File | null
  proofMessage: string | null
  isUploadingProof: boolean
  timeLeft: number
  onCopy: (value: string, label: string) => void
  onFileChange: (file: File | null) => void
  onUploadProof: () => void
  formatTime: (seconds: number) => string
}) {
  return (
    <div className="w-full space-y-5 flex flex-col items-center">
      <TimerPill timeLeft={timeLeft} formatTime={formatTime} />

      {isLoading && (
        <div className="h-72 w-full rounded-3xl border border-zinc-200 bg-white flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-zinc-500">Generando QR Bre-B seguro...</p>
        </div>
      )}

      {error && (
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-xs text-red-700 font-semibold">
          <AlertCircle className="w-4 h-4 mb-2" />
          {error}
        </div>
      )}

      {intent && (
        <>
          <div className="p-4 bg-white border border-zinc-200 rounded-3xl shadow-sm">
            <QRCodeCanvas value={intent.emvPayload} size={220} level="M" includeMargin fgColor="#050505" />
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-left">
            <CopyBox label="Llave Bre-B" value={config.keyValue} onCopy={onCopy} />
            <CopyBox label="Referencia" value={intent.reference} onCopy={onCopy} />
          </div>

          <div className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Destino</div>
            <div className="mt-1 text-sm font-black text-zinc-950">{config.merchantDisplayName || 'Tienda'}</div>
            <div className="text-xs font-semibold text-zinc-500">{config.bankProvider || 'Bre-B'} Ã‚Â· {config.participantId}</div>
          </div>

          <div className="w-full space-y-3">
            <label className="w-full min-h-24 rounded-2xl border border-dashed border-zinc-300 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer px-4">
              <UploadCloud className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-black text-zinc-900">{proofFile ? proofFile.name : 'Sube la captura del comprobante'}</span>
              <span className="text-[10px] font-semibold text-zinc-400">PNG, JPG o WEBP</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => onFileChange(event.target.files?.[0] || null)} />
            </label>

            <button
              type="button"
              onClick={onUploadProof}
              disabled={isUploadingProof}
              className="w-full h-11 rounded-xl bg-zinc-950 text-white font-black text-sm hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploadingProof ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Validar comprobante
            </button>

            {proofMessage && <p className="text-[11px] font-semibold text-zinc-500 leading-relaxed">{proofMessage}</p>}
          </div>
        </>
      )}
    </div>
  )
}

function TimerPill({ timeLeft, formatTime }: { timeLeft: number; formatTime: (seconds: number) => string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 rounded-full">
      <Clock className="w-3.5 h-3.5 text-amber-500" />
      <span className="text-xs font-bold text-zinc-700">Paga dentro de:</span>
      <span className="text-xs font-black text-amber-600 font-mono tabular-nums">{formatTime(timeLeft)}</span>
    </div>
  )
}

function CopyBox({ label, value, onCopy }: { label: string; value: string; onCopy: (value: string, label: string) => void }) {
  return (
    <button type="button" onClick={() => onCopy(value, label)} className="rounded-2xl border border-zinc-200 bg-white p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">{label}</span>
      <span className="mt-1 flex items-center justify-between gap-2 text-xs font-black text-zinc-950">
        <span className="truncate">{value}</span>
        <Copy className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
      </span>
    </button>
  )
}

function LegacyPaymentPanel({
  paymentUrl,
  qrCodeUrl,
  showQrOnMobile,
  setShowQrOnMobile,
  timeLeft,
  formatTime,
}: {
  paymentUrl: string
  qrCodeUrl: string
  showQrOnMobile: boolean
  setShowQrOnMobile: (show: boolean) => void
  timeLeft: number
  formatTime: (seconds: number) => string
}) {
  return (
    <div className="w-full space-y-6 flex flex-col items-center">
      <TimerPill timeLeft={timeLeft} formatTime={formatTime} />

      <div className="block md:hidden w-full space-y-4">
        <a href={paymentUrl} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all text-sm">
          <span>Pagar ahora</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        <button onClick={() => setShowQrOnMobile(!showQrOnMobile)} className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
          <QrCode className="w-4.5 h-4.5 shrink-0" />
          <span>{showQrOnMobile ? 'Ocultar cÃƒÂ³digo QR' : 'Mostrar cÃƒÂ³digo QR'}</span>
        </button>

        {showQrOnMobile && (
          <div className="p-4 bg-white border border-zinc-200 rounded-xl inline-block mx-auto">
            <img src={qrCodeUrl} alt="CÃƒÂ³digo QR de pago" className="w-44 h-44 object-contain" />
            <span className="text-[9px] font-semibold text-zinc-400 block mt-2">Escanea para pagar desde otro dispositivo</span>
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-col items-center space-y-4">
        <div className="p-4 bg-white border border-zinc-200 rounded-xl">
          <img src={qrCodeUrl} alt="CÃƒÂ³digo QR de pago" className="w-48 h-48 object-contain" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Escanea el QR</span>
          <p className="text-xs text-zinc-500 font-semibold leading-normal max-w-[200px]">
            Abre la cÃƒÂ¡mara de tu celular o tu app bancaria para pagar.
          </p>
        </div>

        <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group">
          <span>Ir a pasarela de pagos</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  )
}

function ResultState({ icon, tone, title, description, whatsapp }: { icon: ReactNode; tone: 'success' | 'warning' | 'neutral'; title: string; description: string; whatsapp: string | null }) {
  return (
    <div className="space-y-4 animate-in zoom-in duration-300">
      <div className={cn(
        'w-16 h-16 rounded-full border flex items-center justify-center mx-auto',
        tone === 'success' && 'bg-emerald-100 border-emerald-200 text-emerald-600',
        tone === 'warning' && 'bg-amber-100 border-amber-200 text-amber-700',
        tone === 'neutral' && 'bg-zinc-100 border-zinc-200 text-zinc-400'
      )}>
        {icon}
      </div>
      <div>
        <h3 className="font-extrabold text-zinc-950 text-sm">{title}</h3>
        <p className="text-xs text-zinc-500 font-semibold mt-1 leading-normal max-w-[220px] mx-auto">{description}</p>
      </div>

      {whatsapp && (
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4.5 py-2 border border-zinc-250 hover:bg-white text-zinc-800 text-xs font-bold rounded-lg transition-all">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Contactar comercio</span>
        </a>
      )}
    </div>
  )
}
