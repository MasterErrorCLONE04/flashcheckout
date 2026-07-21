'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Upload,
  Camera,
  CheckCircle2,
  FileText,
  Radio,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react'

type ImageSearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function ImageSearchModal({ isOpen, onClose }: ImageSearchModalProps) {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [selectedSample, setSelectedSample] = useState<string | null>(null)

  if (!isOpen) return null

  const sampleImages = [
    { title: 'Tenis Blancos de Cuero', query: 'Tenis Blancos', category: 'Moda' },
    { title: 'Chaqueta Denim Oversize', query: 'Chaqueta Denim', category: 'Moda' },
    { title: 'Reloj Smartwatch Pro', query: 'Reloj Smartwatch', category: 'Tecnología' },
    { title: 'Audífonos Inalámbricos Noise Cancelling', query: 'Audífonos', category: 'Tecnología' },
  ]

  const handleSelectSample = (sample: typeof sampleImages[0]) => {
    setSelectedSample(sample.title)
    setTimeout(() => {
      onClose()
      router.push(`/explorar?q=${encodeURIComponent(sample.query)}`)
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Camera className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-950 dark:text-white leading-tight">
              Búsqueda Visual por Imagen
            </h3>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Sube una foto o selecciona un producto de demostración
            </p>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            handleSelectSample(sampleImages[0])
          }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]'
          }`}
        >
          <Upload className="size-8 text-emerald-600 dark:text-emerald-400 mb-2" />
          <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
            Arrastra tu imagen aquí o haz clic para examinar
          </span>
          <span className="text-[11px] font-medium text-zinc-400 mt-1">Soporta PNG, JPG, WEBP</span>
        </div>

        {/* Sample Images Grid */}
        <div className="mt-5">
          <span className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2.5">
            O prueba con estos productos:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {sampleImages.map((sample) => (
              <button
                key={sample.title}
                onClick={() => handleSelectSample(sample)}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  selectedSample === sample.title
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-400'
                    : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-emerald-500/50'
                }`}
              >
                <div>
                  <span className="block text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {sample.title}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {sample.category}
                  </span>
                </div>
                <ArrowRight className="size-3.5 text-zinc-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type QuoteRequestModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function QuoteRequestModal({ isOpen, onClose }: QuoteRequestModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    product: '',
    quantity: '10',
    city: 'Bogotá',
    whatsapp: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center animate-in zoom-in-95">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-black text-zinc-950 dark:text-white">
              ¡Solicitud Enviada!
            </h3>
            <p className="mt-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Las tiendas verificadas te enviarán sus mejores precios directamente a tu WhatsApp.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <FileText className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white leading-tight">
                  Solicitar Cotización Directa
                </h3>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Una sola solicitud enviada a múltiples tiendas
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  ¿Qué producto buscas?
                </label>
                <input
                  type="text"
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  placeholder="ej. 50 camisetas 100% algodón blanco"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ciudad de envío
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tu WhatsApp para recibir ofertas
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+57 300 000 0000"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-900 outline-none focus:border-emerald-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white shadow-md hover:bg-emerald-500 transition-colors"
              >
                <Send className="size-4" />
                <span>Enviar Solicitud a Tiendas</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

type LiveStreamsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function LiveStreamsModal({ isOpen, onClose }: LiveStreamsModalProps) {
  if (!isOpen) return null

  const streams = [
    { store: 'TechStore Colombia', title: 'Demo en Vivo: Accesorios & Gadgets 2026', viewers: 342, discount: '-25% EN VIVO' },
    { store: 'Moda Latina D2C', title: 'Showroom Colección Verano con COD', viewers: 189, discount: '-20% EN VIVO' },
    { store: 'Hogar & Confort', title: 'Lanzamiento de Artículos de Cocina Inteligentes', viewers: 512, discount: 'ENVÍO GRATIS' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <Radio className="size-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-950 dark:text-white leading-tight">
              Transmisiones en Vivo (Live Streams)
            </h3>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Interactúa con vendedores en tiempo real y aprovecha descuentos exclusivos
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {streams.map((stream) => (
            <div
              key={stream.store}
              className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 dark:border-white/10 dark:bg-white/5 hover:border-emerald-500/50 transition-colors"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-rose-600"></span>
                  </span>
                  <span className="text-xs font-black text-zinc-950 dark:text-white truncate">
                    {stream.store}
                  </span>
                  <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                    {stream.discount}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                  {stream.title}
                </p>
                <span className="text-[10px] font-bold text-zinc-400 mt-0.5 block">
                  👥 {stream.viewers} espectadores viéndolo ahora
                </span>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black text-white hover:bg-emerald-500 transition-colors shadow-sm"
              >
                Unirse
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type ProtectModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function FlashProtectModal({ isOpen, onClose }: ProtectModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-950 dark:text-white leading-tight">
              Garantía FlashProtect
            </h3>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Protección 100% en todas tus compras
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 p-3">
            <Zap className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-zinc-950 dark:text-white">Pago Contra Entrega Protegido</strong>
              Pagas solo cuando recibes el producto en tu puerta.
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 p-3">
            <Sparkles className="size-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-zinc-950 dark:text-white">Verificación Oficial de Tiendas</strong>
              Revisamos la identidad, ubicación y credenciales de cada comercio.
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-zinc-100/70 dark:bg-white/5 p-3">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black text-zinc-950 dark:text-white">Atención Directa por WhatsApp</strong>
              Comunicación inmediata sin intermediarios ni demoras.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
