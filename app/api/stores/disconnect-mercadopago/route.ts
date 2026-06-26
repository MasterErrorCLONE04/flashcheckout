import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    await prisma.store.update({
      where: { id: store.id },
      data: {
        mpAccessToken: null,
        mpPublicKey: null,
        mpUserId: null,
        mpConnected: false
      }
    })

    console.log(`[Mercado Pago Disconnect] Store ${store.slug} disconnected successfully.`)
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Mercado Pago Disconnect Error]:', error)
    return NextResponse.json(
      { error: `Error al desconectar: ${error?.message || String(error)}` },
      { status: 500 }
    )
  }
}
