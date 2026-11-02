import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { generateStorefrontPackage } from '@/lib/store-page-generator'
import { getErrorMessage } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as {
      storeId?: string
      name?: string
      category?: string
      description?: string
    }

    const store = await getActiveStore(userId, undefined, body.storeId)
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const storeName = body.name?.trim() || store.name
    const storeCategory = body.category?.trim() || store.category || 'Otros'
    const storeDescription = body.description?.trim() ?? store.bio ?? ''

    const generated = await generateStorefrontPackage({
      name: storeName,
      category: storeCategory,
      description: storeDescription,
    })

    const existingAiSettings =
      store.aiSettings && typeof store.aiSettings === 'object' && !Array.isArray(store.aiSettings)
        ? (store.aiSettings as Record<string, unknown>)
        : {}

    const existingSettings =
      store.settings && typeof store.settings === 'object' && !Array.isArray(store.settings)
        ? (store.settings as Record<string, unknown>)
        : {}

    const mergedAiSettings = {
      ...existingAiSettings,
      ...generated.aiSettings,
      // Preserve custom socials/domains/policies if the merchant already configured them
      ...(existingAiSettings.socials ? { socials: existingAiSettings.socials } : {}),
      ...(existingAiSettings.domains ? { domains: existingAiSettings.domains } : {}),
      ...(existingAiSettings.policies ? { policies: existingAiSettings.policies } : {}),
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        category: storeCategory,
        bio: generated.bio,
        welcomeMessage: store.welcomeMessage || generated.welcomeMessage,
        systemPrompt: store.systemPrompt || generated.systemPrompt,
        aiSettings: mergedAiSettings as Prisma.InputJsonValue,
        settings: {
          ...existingSettings,
          businessProfile: generated.businessProfile,
        } as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({
      store: updated,
      generated,
    })
  } catch (error) {
    console.error('GENERATE_STORE_PAGE_ERROR:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Error al autogenerar la página del negocio') },
      { status: 500 }
    )
  }
}

