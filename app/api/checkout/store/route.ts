import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export const dynamic = 'force-dynamic'

type LineInput = { productId: string; qty: number }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      storeId,
      customerName,
      address,
      city,
      items,
    }: {
      storeId?: string
      customerName?: string
      address?: string
      city?: string
      items?: LineInput[]
    } = body

    if (
      !storeId ||
      !customerName?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !items?.length
    ) {
      return NextResponse.json(
        { error: 'Faltan datos del pedido' },
        { status: 400 }
      )
    }

    const store = await prisma.store.findFirst({
      where: { id: storeId, active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        mpAccessToken: true,
        mpPublicKey: true,
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const mergedQty = new Map<string, number>()
    for (const line of items) {
      const q = Math.max(0, Math.floor(Number(line.qty)))
      if (q <= 0) continue
      mergedQty.set(line.productId, (mergedQty.get(line.productId) ?? 0) + q)
    }

    const productIds = [...mergedQty.keys()]
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id,
        active: true,
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Hay productos inválidos o no disponibles' },
        { status: 400 }
      )
    }

    const byId = new Map(products.map(p => [p.id, p]))
    const normalized: { productId: string; name: string; qty: number; price: number }[] =
      []
    let total = 0

    for (const [productId, q] of mergedQty) {
      const p = byId.get(productId)
      if (!p) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 400 }
        )
      }
      if (q > p.stock) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para «${p.name}». Disponible: ${p.stock}.`,
          },
          { status: 400 }
        )
      }
      normalized.push({
        productId: p.id,
        name: p.name,
        qty: q,
        price: p.price,
      })
      total += p.price * q
    }

    if (!normalized.length || total <= 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío o el total no es válido' },
        { status: 400 }
      )
    }

    // Guardar el pedido en la base de datos
    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        customerName: customerName.trim(),
        address: address.trim(),
        city: city.trim(),
        items: normalized,
        total,
        paymentStatus: 'PENDING',
      },
    })

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      'http://localhost:3000'

    // Crear la preferencia en Mercado Pago
    const preferenceData: any = {
      body: {
        items: normalized.map(line => ({
          id: line.productId,
          title: `${line.name} (x${line.qty})`,
          quantity: line.qty,
          unit_price: line.price,
          currency_id: 'COP',
        })),
        external_reference: order.id,
        back_urls: {
          success: `${base}/tienda/${store.slug}/exito`,
          failure: `${base}/tienda/${store.slug}`,
          pending: `${base}/tienda/${store.slug}`,
        },
        metadata: {
          orderId: order.id,
          storeId: store.id,
        },
      },
    }

    // Mercado Pago requiere HTTPS para notification_url y auto_return en producción
    if (base.startsWith('https')) {
      preferenceData.body.notification_url = `${base}/api/webhook/mp`
      preferenceData.body.auto_return = 'approved'
    }

    const tokenToUse = store.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!tokenToUse) {
      return NextResponse.json(
        { error: 'Esta tienda no tiene configurado Mercado Pago para procesar transacciones.' },
        { status: 400 }
      )
    }

    const dynamicMpClient = new MercadoPagoConfig({
      accessToken: tokenToUse,
      options: { timeout: 10000 },
    })
    const dynamicMpPreference = new Preference(dynamicMpClient)

    const preference = await dynamicMpPreference.create(preferenceData)

    if (!preference.id) {
      return NextResponse.json(
        { error: 'Mercado Pago no devolvió ID de preferencia' },
        { status: 500 }
      )
    }

    // Actualizar el pedido con el ID de la preferencia
    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    })

    // Devolver el init_point para redirección
    return NextResponse.json({ 
      url: preference.init_point, 
      orderId: order.id 
    })
  } catch (e: any) {
    console.error('CHECKOUT_STORE_MP_ERROR:', {
      message: e.message,
      stack: e.stack,
      cause: e.cause,
      // El SDK de Mercado Pago a veces pone el error detallado en e.response o e.errors
      details: e.response?.data || e.errors || e
    })
    
    const errorMessage = e.response?.data?.message || e.message || 'Error al iniciar el pago con Mercado Pago'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
