import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CheckCircle2, FileText, ArrowLeft } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import ReportButton from '@/components/ReportButton'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ orderId?: string }>
}

type OrderItemRow = {
  name?: string
  qty?: number
  price?: number
}

export default async function TiendaExitoPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { orderId } = await searchParams

  const store = await prisma.store.findUnique({
    where: { slug, active: true },
    select: { name: true, whatsapp: true, logoUrl: true },
  })

  if (!store) notFound()

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          customerName: true,
          total: true,
          status: true,
          paymentStatus: true,
          items: true,
          reported: true,
        },
      })
    : null

  const initialReported = Boolean(order?.reported)
  const orderCode = order?.id ? order.id.slice(-6).toUpperCase() : null
  const items = Array.isArray(order?.items) ? (order?.items as OrderItemRow[]) : []
  const cleanPhone = (store.whatsapp || '').replace(/\D/g, '')
  const waMessage = encodeURIComponent(
    orderCode
      ? `¡Hola ${store.name}! Acabo de realizar el pedido #${orderCode} y quiero coordinar el envío.`
      : `¡Hola ${store.name}! Acabo de realizar un pedido en su tienda web.`
  )
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : '#'

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans text-left">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-zinc-200 px-5 sm:px-8 flex items-center justify-between">
        <Link
          href={`/tienda/${slug}`}
          className="flex items-center gap-2.5 text-zinc-950 no-underline"
        >
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-7 h-7 rounded-lg border border-zinc-200 object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-xs font-bold">
              {store.name[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-sm font-bold tracking-tight">{store.name}</span>
        </Link>

        {orderCode && (
          <span className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-mono font-bold text-zinc-800">
            #{orderCode}
          </span>
        )}
      </header>

      {/* Main Confirmation Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-lg font-bold text-zinc-950 tracking-tight pt-1">
              ¡Pedido confirmado!
            </h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Gracias por tu compra{order?.customerName ? `, ${order.customerName}` : ''} en{' '}
              <strong className="text-zinc-900">{store.name}</strong>. El comercio ya recibió tu orden para preparar el despacho.
            </p>
          </div>

          {order && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-zinc-200 pb-2.5">
                <span className="text-zinc-500 font-medium">Orden</span>
                <span className="font-mono font-bold text-zinc-950">#{orderCode}</span>
              </div>

              {items.length > 0 && (
                <div className="space-y-1.5 border-b border-zinc-200 pb-2.5">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-zinc-700 truncate pr-2">
                        <strong className="text-zinc-950">{it.qty || 1}×</strong>{' '}
                        {it.name || 'Producto'}
                      </span>
                      <span className="font-mono font-semibold text-zinc-900 shrink-0">
                        ${((Number(it.price) || 0) * (Number(it.qty) || 1)).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Total
                </span>
                <span className="text-base font-mono font-bold text-zinc-950 tabular-nums">
                  ${order.total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {cleanPhone && (
              <Link
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors no-underline shadow-2xs"
              >
                <SiWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Coordinar envío por WhatsApp</span>
              </Link>
            )}

            {orderId && (
              <a
                href={`/api/orders/invoice/${orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors no-underline"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span>Descargar Factura / Recibo PDF</span>
              </a>
            )}

            <Link
              href={`/tienda/${slug}`}
              className="w-full h-9 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-950 flex items-center justify-center gap-1.5 transition-colors no-underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la tienda</span>
            </Link>
          </div>

          {orderId && (
            <div className="pt-4 border-t border-zinc-100 text-center">
              <ReportButton orderId={orderId} initialReported={initialReported} />
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center">
        <span className="text-[11px] text-zinc-400">
          Procesado por <strong className="text-zinc-600">FlashCheckout</strong>
        </span>
      </footer>
    </div>
  )
}
