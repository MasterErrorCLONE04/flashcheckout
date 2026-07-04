'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  QrCode, 
  ArrowRight,
  Smartphone,
  ChevronRight,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SmartPayClientProps {
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
}

export default function SmartPayClient({
  order,
  store,
  items,
  paymentUrl
}: SmartPayClientProps) {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [showQrOnMobile, setShowQrOnMobile] = useState(false)

  // 1. Polling for payment status updates
  useEffect(() => {
    if (paymentStatus === 'PAID' || paymentStatus === 'paid') return

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/status?orderId=${order.id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        
        if (data.paymentStatus === 'PAID' || data.paymentStatus === 'paid') {
          setPaymentStatus('PAID')
          clearInterval(intervalId)
        }
      } catch (err) {
        console.error('Error polling order status:', err)
      }
    }, 3000)

    return () => clearInterval(intervalId)
  }, [order.id, paymentStatus])

  // 2. Countdown timer calculation
  useEffect(() => {
    if (paymentStatus === 'PAID' || paymentStatus === 'paid') return

    // Calculate time elapsed since creation
    const createdTime = new Date(order.createdAt).getTime()
    const now = new Date().getTime()
    const elapsedSeconds = Math.floor((now - createdTime) / 1000)
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
  }, [order.createdAt, paymentStatus])

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // QR Code Image source
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentUrl)}`

  const isPaid = paymentStatus === 'PAID' || paymentStatus === 'paid'
  const isExpired = timeLeft <= 0 && !isPaid

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans text-left pb-12 select-none">
      
      {/* Header bar */}
      <header className="w-full bg-white border-b border-zinc-150 py-4 px-6 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {store.logoUrl ? (
            <img 
              src={store.logoUrl} 
              alt={store.name} 
              className="w-8 h-8 rounded-full border border-zinc-100 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-650">
              {store.name[0]}
            </div>
          )}
          <span className="font-extrabold text-sm text-zinc-950 tracking-tight">{store.name}</span>
        </div>

        <span className="text-[10px] font-bold text-zinc-400 border border-zinc-200 rounded px-2 py-0.5 select-none">
          Pedido #{order.id.slice(-6).toUpperCase()}
        </span>
      </header>

      {/* Main content grid */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-none grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT SIDE: Order Details (7/12) */}
          <div className="md:col-span-7 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-zinc-200 space-y-6">
            
            {/* Status title */}
            <div className="space-y-1">
              {isPaid ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300 fill-current text-emerald-500 text-white" />
                  <h1 className="text-xl font-black tracking-tight text-zinc-950">¡Pago Aprobado! 🎉</h1>
                </div>
              ) : isExpired ? (
                <h1 className="text-xl font-black tracking-tight text-red-650">Pedido Expirado ⏰</h1>
              ) : (
                <h1 className="text-xl font-black tracking-tight text-zinc-950">Completa tu pago</h1>
              )}
              <p className="text-xs font-semibold text-zinc-400">
                {isPaid 
                  ? 'Hemos recibido tu pago con éxito. Tu pedido ya está en preparación.'
                  : isExpired 
                    ? 'El tiempo límite para realizar el pago de este pedido ha expirado. Por favor, crea uno nuevo.'
                    : 'Verifica los artículos de tu pedido y realiza el pago de forma segura.'}
              </p>
            </div>

            {/* Items itemization breakdown */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block select-none">Resumen del pedido</span>
              <div className="border border-zinc-150 rounded-xl overflow-hidden divide-y divide-zinc-150">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs font-semibold bg-white">
                    <div className="min-w-0 pr-4">
                      <h5 className="font-bold text-zinc-900 truncate">{item.name}</h5>
                      <span className="text-[10px] text-zinc-400 font-semibold block mt-0.5">Cant: {item.qty} × ${item.price.toLocaleString('es-CO')}</span>
                    </div>
                    <span className="font-bold text-zinc-950 shrink-0">${(item.price * item.qty).toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total value container */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4.5 flex justify-between items-center select-none">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total a pagar</span>
                <span className="text-2xl font-black text-zinc-950 mt-1 block leading-none">${order.total.toLocaleString('es-CO')} COP</span>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Estado</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider leading-none mt-1.5 inline-block border",
                  isPaid 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-250 animate-pulse" 
                    : isExpired 
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-amber-50 text-amber-600 border-amber-250 animate-pulse"
                )}>
                  {isPaid ? 'Pagado' : isExpired ? 'Expirado' : 'Pendiente'}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Device-Aware Payment Action (5/12) */}
          <div className="md:col-span-5 p-6 sm:p-8 bg-zinc-50/50 flex flex-col justify-center items-center text-center space-y-6">
            
            {isPaid ? (
              <div className="space-y-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-sm">Pedido Confirmado</h3>
                  <p className="text-xs text-zinc-405 font-semibold mt-1 leading-normal max-w-[200px] mx-auto">
                    Tu comprobante ha sido registrado. El comercio validará y despachará tu orden en breve.
                  </p>
                </div>

                {store.whatsapp && (
                  <a 
                    href={`https://wa.me/${store.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 border border-zinc-250 hover:bg-white text-zinc-800 text-xs font-bold rounded-lg transition-all shadow-none cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contactar Comercio</span>
                  </a>
                )}
              </div>
            ) : isExpired ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 mx-auto select-none">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm">Tiempo Expirado</h3>
                  <p className="text-xs text-zinc-400 font-semibold leading-normal max-w-[180px] mx-auto mt-1">
                    El tiempo para pagar expiró. Comunícate con el vendedor para renovar la orden.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-6 flex flex-col items-center">
                
                {/* 1. Countdown Widget */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 rounded-full select-none shrink-0 shadow-none">
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin [animation-duration:12s]" />
                  <span className="text-[10px] xl:text-xs font-bold text-zinc-700">Paga dentro de:</span>
                  <span className="text-[10px] xl:text-xs font-black text-amber-600 font-mono tracking-tight tabular-nums">{formatTime(timeLeft)}</span>
                </div>

                {/* 2. Mobile Layout View (Collapsible) */}
                <div className="block md:hidden w-full space-y-4">
                  <a 
                    href={paymentUrl}
                    className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-none text-sm select-none cursor-pointer active:scale-[0.98]"
                  >
                    <span>Pagar ahora</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setShowQrOnMobile(!showQrOnMobile)}
                    className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none active:scale-[0.97]"
                  >
                    <QrCode className="w-4.5 h-4.5 shrink-0" />
                    <span>{showQrOnMobile ? 'Ocultar Código QR' : 'Mostrar Código QR'}</span>
                  </button>

                  {showQrOnMobile && (
                    <div className="p-4 bg-white border border-zinc-200 rounded-xl inline-block mx-auto animate-in zoom-in duration-200">
                      <img 
                        src={qrCodeUrl} 
                        alt="Código QR de Pago" 
                        className="w-44 h-44 object-contain select-none"
                      />
                      <span className="text-[9px] font-semibold text-zinc-400 block mt-2">Escanea para pagar desde otro dispositivo</span>
                    </div>
                  )}
                </div>

                {/* 3. Desktop Layout View (Always visible) */}
                <div className="hidden md:flex flex-col items-center space-y-4">
                  <div className="p-4 bg-white border border-zinc-200 rounded-xl select-none">
                    <img 
                      src={qrCodeUrl} 
                      alt="Código QR de Pago" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Escanea el QR</span>
                    <p className="text-xs text-zinc-405 font-semibold leading-normal max-w-[200px]">
                      Abre la cámara de tu celular o tu app bancaria para pagar inmediatamente.
                    </p>
                  </div>

                  <div className="h-px w-24 bg-zinc-200 pt-1" />

                  <a 
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#6F42C1] hover:text-purple-700 inline-flex items-center gap-1 group cursor-pointer"
                  >
                    <span>Ir a pasarela de pagos</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer disclaimer */}
      <footer className="text-center select-none">
        <span className="text-[10px] font-semibold text-zinc-400">
          Procesado de forma segura por ⚡ FlashCheckout. Todos los derechos reservados.
        </span>
      </footer>

    </div>
  )
}
