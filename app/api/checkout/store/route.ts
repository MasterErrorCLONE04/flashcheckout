import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export const dynamic = 'force-dynamic'

type LineInput = {
  productId: string
  qty: number
  nameSuffix?: string
}

type PreferenceBody = {
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    currency_id: string
  }>
  external_reference: string
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  metadata: {
    orderId: string
    storeId: string
  }
  notification_url?: string
  auto_return?: 'approved'
}

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
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const productIds = Array.from(new Set(items.map(line => line.productId)))
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id,
        active: true,
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Hay productos invalidos o no disponibles' },
        { status: 400 }
      )
    }

    const byId = new Map(products.map(p => [p.id, p]))
    const normalized: { productId: string; name: string; qty: number; price: number }[] = []
    let total = 0

    const productTotalQty = new Map<string, number>()
    for (const line of items) {
      const q = Math.max(0, Math.floor(Number(line.qty)))
      if (q <= 0) continue
      productTotalQty.set(line.productId, (productTotalQty.get(line.productId) ?? 0) + q)
    }

    for (const [prodId, q] of productTotalQty) {
      const p = byId.get(prodId)
      if (!p) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 400 })
      }
      if (q > p.stock) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${p.name}". Disponible: ${p.stock}.` },
          { status: 400 }
        )
      }
    }

    for (const line of items) {
      const q = Math.max(0, Math.floor(Number(line.qty)))
      if (q <= 0) continue
      const p = byId.get(line.productId)!
      normalized.push({
        productId: p.id,
        name: line.nameSuffix ? `${p.name}${line.nameSuffix}` : p.name,
        qty: q,
        price: p.price,
      })
      total += p.price * q
    }

    if (!normalized.length || total <= 0) {
      return NextResponse.json(
        { error: 'El carrito esta vacio o el total no es valido' },
        { status: 400 }
      )
    }

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

    const preferenceData: PreferenceBody = {
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
    }

    if (base.startsWith('https')) {
      preferenceData.notification_url = `${base}/api/webhook/mp`
      preferenceData.auto_return = 'approved'
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

    const preference = await dynamicMpPreference.create({ body: preferenceData })

    if (!preference.id) {
      return NextResponse.json(
        { error: 'Mercado Pago no devolvio ID de preferencia' },
        { status: 500 }
      )
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    })

    return NextResponse.json({
      url: preference.init_point,
      orderId: order.id,
    })
  } catch (error: unknown) {
    const err = error as {
      message?: string
      stack?: string
      cause?: unknown
      response?: { data?: { message?: string } }
      errors?: unknown
    }

    console.error('CHECKOUT_STORE_MP_ERROR:', {
      message: err.message,
      stack: err.stack,
      cause: err.cause,
      details: err.response?.data || err.errors || err,
    })

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Error al iniciar el pago con Mercado Pago'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
