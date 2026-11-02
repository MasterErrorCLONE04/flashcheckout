import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'
import { cookies } from 'next/headers'
import { getErrorMessage } from '@/lib/api/route-utils'
import { getActiveStore } from '@/lib/store-context'
import { FREE_STORE_LIMIT, getStorePlanStatus } from '@/lib/subscription'
import { generateStorefrontPackage } from '@/lib/store-page-generator'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const storeIdParam = searchParams.get('storeId')

  const [store, planStatus] = await Promise.all([
    getActiveStore(
      userId,
      {
        _count: {
          select: { products: true, orders: true },
        },
      },
      storeIdParam
    ),
    getStorePlanStatus(userId),
  ])

  return NextResponse.json({ store, planStatus })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug, whatsapp, category, businessDescription } = body as {
      name?: string
      slug?: string
      whatsapp?: string
      category?: string
      businessDescription?: string
    }

    if (!name || !slug || !whatsapp) {
      return NextResponse.json(
        { error: 'Nombre, slug y WhatsApp son requeridos' },
        { status: 400 }
      )
    }

    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!cleanSlug) {
      return NextResponse.json(
        { error: 'Ingresa una dirección web (slug) válida' },
        { status: 400 }
      )
    }

    const existing = await prisma.store.findUnique({
      where: { slug: cleanSlug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Esa dirección web (slug) ya está en uso. Prueba con otra.' },
        { status: 409 }
      )
    }

    const planStatus = await getStorePlanStatus(userId)

    if (planStatus.currentStores >= planStatus.maxStores) {
      const errorMsg = !planStatus.isPro
        ? `En el plan Gratuito solo puedes crear ${FREE_STORE_LIMIT} negocio con su página. Actualiza a Plan Pro para crear múltiples negocios independientes.`
        : `Has alcanzado el límite de negocios incluidos en tu cuenta (${planStatus.maxStores}). Contacta a soporte Enterprise para ampliar tu capacidad.`
      return NextResponse.json(
        { error: errorMsg, code: 'STORE_LIMIT_REACHED' },
        { status: 403 }
      )
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '')
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const cookieStore = await cookies()
    const referredBySlug = cookieStore.get('referred_by_slug')?.value || null

    // Autogenerate storefront page design, copy, sections, and Nova profile based on business category & description
    const generated = await generateStorefrontPackage({
      name,
      category: category || 'Otros',
      description: businessDescription || '',
    })

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        whatsapp: cleanWhatsapp,
        userId,
        category: category || 'Otros',
        bio: generated.bio,
        welcomeMessage: generated.welcomeMessage,
        systemPrompt: generated.systemPrompt,
        aiSettings: generated.aiSettings as Prisma.InputJsonValue,
        settings: {
          businessProfile: generated.businessProfile,
        } as Prisma.InputJsonValue,
        otpCode,
        otpExpiresAt,
        whatsappVerified: false,
        referredBySlug,
      },
    })

    // Point active_store_id immediately to the newly created business so wizard steps 3-8 operate on it
    cookieStore.set('active_store_id', store.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })

    try {
      await waClient.sendText(
        cleanWhatsapp,
        `¡Hola! Tu código de verificación para Flashcheckouts es: *${otpCode}*. Ingrésalo en tu panel para verificar tu cuenta.`
      )
    } catch (err: unknown) {
      console.error('Error sending store OTP:', err)
      const errMsg = getErrorMessage(err, '')
      if (errMsg.includes('131030') || errMsg.includes('allowed list')) {
        console.warn(
          `[WhatsApp Sandbox Mode Alert] Recipient phone number (+${cleanWhatsapp}) not in allowed list. OTP code generated is: ${otpCode}`
        )
      }
    }

    return NextResponse.json({ store, generated }, { status: 201 })
  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { error: 'Error al crear el negocio y su página' },
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
    const {
      storeId,
      name,
      whatsapp,
      logoUrl,
      bio,
      category,
      businessDescription,
      regeneratePage,
      systemPrompt,
      welcomeMessage,
      aiActive,
      aiSettings,
      slug,
      active,
      settings,
    } = body

    const store = await getActiveStore(userId, undefined, storeId)

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    let cleanSlug: string | undefined = undefined
    if (slug) {
      cleanSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      if (cleanSlug !== store.slug) {
        const existing = await prisma.store.findUnique({
          where: { slug: cleanSlug },
        })
        if (existing) {
          return NextResponse.json(
            { error: 'El subdominio ya está siendo utilizado por otro comercio' },
            { status: 409 }
          )
        }
      }
    }

    let regenerated: Awaited<ReturnType<typeof generateStorefrontPackage>> | null = null
    if (regeneratePage) {
      regenerated = await generateStorefrontPackage({
        name: name || store.name,
        category: category || store.category || 'Otros',
        description: businessDescription ?? bio ?? store.bio ?? '',
      })
    }

    const existingAiSettings = (store.aiSettings as Record<string, unknown> | null) || {}
    const mergedAiSettings = regenerated
      ? {
          ...existingAiSettings,
          ...regenerated.aiSettings,
          ...(typeof aiSettings === 'object' && aiSettings !== null ? aiSettings : {}),
        }
      : aiSettings !== undefined
        ? {
            ...existingAiSettings,
            ...(typeof aiSettings === 'object' && aiSettings !== null ? aiSettings : {}),
          }
        : undefined

    const existingSettings = (store.settings as Record<string, unknown> | null) || {}
    const mergedSettings = regenerated
      ? {
          ...existingSettings,
          businessProfile: regenerated.businessProfile,
          ...(typeof settings === 'object' && settings !== null ? settings : {}),
        }
      : settings !== undefined
        ? {
            ...existingSettings,
            ...(typeof settings === 'object' && settings !== null ? settings : {}),
          }
        : undefined

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        ...(name && { name }),
        ...(whatsapp && { whatsapp: whatsapp.replace(/\D/g, '') }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(regenerated
          ? { bio: regenerated.bio }
          : bio !== undefined
            ? { bio }
            : {}),
        ...(category !== undefined && { category }),
        ...(systemPrompt !== undefined
          ? { systemPrompt }
          : regenerated
            ? { systemPrompt: regenerated.systemPrompt }
            : {}),
        ...(welcomeMessage !== undefined
          ? { welcomeMessage }
          : regenerated
            ? { welcomeMessage: regenerated.welcomeMessage }
            : {}),
        ...(aiActive !== undefined && { aiActive }),
        ...(mergedAiSettings !== undefined && {
          aiSettings: mergedAiSettings as Prisma.InputJsonValue,
        }),
        ...(cleanSlug && { slug: cleanSlug }),
        ...(active !== undefined && { active }),
        ...(mergedSettings !== undefined && {
          settings: mergedSettings as Prisma.InputJsonValue,
        }),
      },
    })

    return NextResponse.json({ store: updated, ...(regenerated && { generated: regenerated }) })
  } catch (error: unknown) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: `Error al actualizar: ${getErrorMessage(error)}` },
      { status: 500 }
    )
  }
}
