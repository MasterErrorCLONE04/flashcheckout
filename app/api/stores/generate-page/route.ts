import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { generateStorefrontPackage } from '@/lib/store-page-generator'
import { getDemoPreviewProducts } from '@/lib/store-blueprints/demo-products'
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
      prompt?: string
      scope?: 'all' | 'copy' | 'style'
    }

    const store = await getActiveStore(userId, undefined, body.storeId)
    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    const storeName = body.name?.trim() || store.name
    const storeCategory = body.category?.trim() || store.category || 'Otros'
    const storeDescription = body.description?.trim() ?? store.bio ?? ''
    const userPrompt = body.prompt?.trim() || ''
    const scope = body.scope || 'all'

    const generated = await generateStorefrontPackage({
      name: storeName,
      category: storeCategory,
      description: storeDescription,
      prompt: userPrompt,
      scope,
    })

    const existingAiSettings =
      store.aiSettings && typeof store.aiSettings === 'object' && !Array.isArray(store.aiSettings)
        ? (store.aiSettings as Record<string, unknown>)
        : {}

    const existingSettings =
      store.settings && typeof store.settings === 'object' && !Array.isArray(store.settings)
        ? (store.settings as Record<string, unknown>)
        : {}

    // Smart merge based on user selected scope
    let mergedAiSettings: Record<string, unknown> = {}

    if (scope === 'style') {
      // Keep existing copies, only merge design tokens
      mergedAiSettings = {
        ...existingAiSettings,
        themePreset: generated.aiSettings.themePreset,
        colors: generated.aiSettings.colors,
        typography: generated.aiSettings.typography,
        borderRadius: generated.aiSettings.borderRadius,
        shadowStyle: generated.aiSettings.shadowStyle,
        headerStyle: generated.aiSettings.headerStyle,
        heroStyle: generated.aiSettings.heroStyle,
        heroPanels: generated.aiSettings.heroPanels,
        bannerUrl: generated.aiSettings.bannerUrl,
        cardStyle: generated.aiSettings.cardStyle,
        cardAspectRatio: generated.aiSettings.cardAspectRatio,
        badgeStyle: generated.aiSettings.badgeStyle,
      }
    } else if (scope === 'copy') {
      // Keep existing design, only merge persuasive texts & storytelling
      mergedAiSettings = {
        ...existingAiSettings,
        heroBadge: generated.aiSettings.heroBadge,
        bannerTitle: generated.aiSettings.bannerTitle,
        bannerSubtitle: generated.aiSettings.bannerSubtitle,
        announcement: {
          ...(existingAiSettings.announcement as Record<string, unknown> || {}),
          text: generated.aiSettings.announcement?.text,
        },
        bentoHighlights: generated.aiSettings.bentoHighlights,
        brandStory: generated.aiSettings.brandStory,
        brandStoryPage: generated.aiSettings.brandStoryPage,
        faqs: generated.aiSettings.faqs,
        benefits: generated.aiSettings.benefits,
        processTimeline: generated.aiSettings.processTimeline,
        testimonials: generated.aiSettings.testimonials,
        ambassadors: generated.aiSettings.ambassadors,
      }
    } else {
      // Full generation: overwrite all components with cohesive niche package
      mergedAiSettings = {
        ...existingAiSettings,
        ...generated.aiSettings,
        ...(existingAiSettings.socials ? { socials: existingAiSettings.socials } : {}),
        ...(existingAiSettings.domains ? { domains: existingAiSettings.domains } : {}),
        ...(existingAiSettings.policies ? { policies: existingAiSettings.policies } : {}),
      }
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        category: storeCategory,
        bio: scope !== 'style' ? generated.bio : store.bio,
        welcomeMessage: scope !== 'style' ? generated.welcomeMessage : store.welcomeMessage,
        systemPrompt: scope !== 'style' ? generated.systemPrompt : store.systemPrompt,
        aiSettings: mergedAiSettings as Prisma.InputJsonValue,
        settings: {
          ...existingSettings,
          businessProfile: generated.businessProfile,
        } as Prisma.InputJsonValue,
      },
    })

    const previewProducts = getDemoPreviewProducts(storeCategory, generated.bio)

    return NextResponse.json({
      store: updated,
      generated: {
        ...generated,
        aiSettings: mergedAiSettings,
        previewProducts,
      },
      scope,
    })
  } catch (error) {
    console.error('GENERATE_STORE_PAGE_ERROR:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Error al autogenerar la página del negocio') },
      { status: 500 }
    )
  }
}
