import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const store = await prisma.store.findFirst({
    where: { userId },
    include: {
      _count: {
        select: { products: true, orders: true },
      },
    },
  })

  return NextResponse.json({ store })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug, whatsapp, category } = body

    if (!name || !slug || !whatsapp) {
      return NextResponse.json(
        { error: 'Nombre, slug y WhatsApp son requeridos' },
        { status: 400 }
      )
    }

    // Validate slug format
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if slug exists
    const existing = await prisma.store.findUnique({
      where: { slug: cleanSlug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ese slug ya está en uso' },
        { status: 409 }
      )
    }

    // Check if user already has a store
    const userStore = await prisma.store.findFirst({
      where: { userId },
    })

    if (userStore) {
      return NextResponse.json(
        { error: 'Ya tienes una tienda. Edítala en vez de crear otra.' },
        { status: 409 }
      )
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '')
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const store = await prisma.store.create({
      data: {
        name,
        slug: cleanSlug,
        whatsapp: cleanWhatsapp,
        userId,
        category: category || 'Otros',
        otpCode,
        otpExpiresAt,
        whatsappVerified: false,
      },
    })

    try {
      await waClient.sendText(
        cleanWhatsapp,
        `¡Hola! Tu código de verificación para FlashCheckout es: *${otpCode}*. Ingrésalo en tu panel para verificar tu cuenta.`
      )
    } catch (err: any) {
      console.error('Error sending store OTP:', err)
      const errMsg = err?.message || ''
      if (errMsg.includes('131030') || errMsg.includes('allowed list')) {
        console.warn(`[WhatsApp Sandbox Mode Alert] Recipient phone number (+${cleanWhatsapp}) not in allowed list. OTP code generated is: ${otpCode}`)
      }
    }

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { error: 'Error al crear la tienda' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, whatsapp, logoUrl, bio, category, systemPrompt, welcomeMessage, aiActive, aiSettings } = body

    const store = await prisma.store.findFirst({
      where: { userId },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        ...(name && { name }),
        ...(whatsapp && { whatsapp: whatsapp.replace(/\D/g, '') }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bio !== undefined && { bio }),
        ...(category !== undefined && { category }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(aiActive !== undefined && { aiActive }),
        ...(aiSettings !== undefined && { aiSettings }),
      },
    })

    return NextResponse.json({ store: updated })
  } catch (error: any) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: `Error al actualizar: ${error?.message || String(error)}` },
      { status: 500 }
    )
  }
}
