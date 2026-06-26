import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import ReportButton from '@/components/ReportButton'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ orderId?: string }>
}

export default async function TiendaExitoPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { orderId } = await searchParams

  const store = await prisma.store.findUnique({
    where: { slug, active: true },
    select: { name: true, whatsapp: true },
  })

  if (!store) notFound()

  let initialReported = false
  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { reported: true }
    })
    initialReported = !!order?.reported
  }

  const wa = `https://wa.me/${store.whatsapp}`

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border p-8 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold">¡Pago recibido!</h1>
        <p className="text-sm text-muted-foreground">
          Gracias por tu compra en <span className="font-semibold text-foreground">{store.name}</span>.
          El vendedor fue notificado y preparará tu pedido.
        </p>
        <p className="text-sm text-muted-foreground">
          Si quieres coordinar envío por WhatsApp, puedes escribirle aquí:
        </p>
        <Link
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full justify-center rounded-xl bg-emerald-600 text-white font-semibold py-3 text-sm hover:bg-emerald-700 transition-colors"
        >
          Abrir WhatsApp
        </Link>
        <Link
          href={`/tienda/${slug}`}
          className="inline-flex w-full justify-center text-sm text-emerald-700 font-medium hover:underline mb-2"
        >
          Volver a la tienda
        </Link>
        
        {orderId && (
          <div className="pt-4 border-t border-zinc-150">
            <ReportButton orderId={orderId} initialReported={initialReported} />
          </div>
        )}
      </div>
    </div>
  )
}
