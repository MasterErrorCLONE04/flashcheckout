import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Meta WhatsApp Flows Data Exchange Endpoint
 * Manages Flow life-cycle events: 'ping', 'INIT', and 'data_exchange'.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    // 1. Health check from Meta Flow builder
    if (body.action === 'ping') {
      return NextResponse.json({
        data: {
          status: 'active'
        }
      })
    }

    // 2. Initial Flow open (INIT): pre-populate catalog dynamically if flow_token includes storeId
    if (body.action === 'INIT') {
      const flowToken = body.flow_token || ''
      let storeId = ''
      
      // If token format is token_{storeId}_{sessionId}
      if (flowToken.startsWith('store_')) {
        storeId = flowToken.split('_')[1] || ''
      }

      const store = storeId 
        ? await prisma.store.findUnique({ where: { id: storeId } })
        : await prisma.store.findFirst({ where: { active: true } })

      const products = store
        ? await prisma.product.findMany({
            where: { storeId: store.id, active: true },
            take: 20,
            select: { id: true, name: true, price: true, description: true }
          })
        : []

      return NextResponse.json({
        screen: 'CATALOG',
        data: {
          store_name: (store?.name || 'Catálogo Oficial').slice(0, 30),
          products: products.map(p => ({
            id: p.id,
            title: p.name.slice(0, 30),
            description: `$${p.price.toLocaleString('es-CO')} COP${p.description ? ` • ${p.description.slice(0, 30)}` : ''}`
          }))
        }
      })
    }

    // 3. Fallback for unhandled flow action
    return NextResponse.json({
      data: {
        status: 'ok'
      }
    })
  } catch (err: any) {
    console.error('[Meta Flows Endpoint Error]', err)
    return NextResponse.json({ error: 'Failed to process Flow data' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Flashcheckouts WhatsApp Flows Data Endpoint',
    version: '3.1'
  })
}
