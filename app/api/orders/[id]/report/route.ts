import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (order.reported) {
      return NextResponse.json({ success: true, message: 'El pedido ya fue reportado previamente' })
    }

    // 1. Marcar pedido como reportado
    await prisma.order.update({
      where: { id: orderId },
      data: { reported: true }
    })

    // 2. Incrementar strikes de la tienda
    const updatedStore = await prisma.store.update({
      where: { id: order.storeId },
      data: {
        strikes: { increment: 1 }
      }
    })

    // 3. Si la tienda es Nivel 0 y recibe al menos 1 strike, pausar automáticamente
    if (updatedStore.verificationLevel === 0 && updatedStore.strikes >= 1) {
      await prisma.store.update({
        where: { id: order.storeId },
        data: {
          active: false,
          pausedReason: 'dispute'
        }
      })

      // 4. Enviar alerta por WhatsApp al dueño del negocio
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        await waClient.sendText(
          updatedStore.whatsapp,
          `⚠️ *TIENDA PAUSADA POR DISPUTA* ⚠️\n\nTu tienda *${updatedStore.name}* ha sido pausada automáticamente tras recibir un reporte de fraude por parte de un comprador para el pedido *#${order.id.slice(-6).toUpperCase()}*.\n\nPara reactivar tu tienda y bot de ventas de inmediato, debes verificar tu identidad en el panel: ${appUrl}/verificaciones`
        )
      } catch (waErr) {
        console.error('Failed to send dispute alert message:', waErr)
      }
    }

    return NextResponse.json({ success: true, message: 'Pedido reportado correctamente.' })
  } catch (error: any) {
    console.error('REPORT_ORDER_ERROR:', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
