import { PRESETS } from '@/components/tienda/types'
import {
  buildIndustryStoreBlueprint,
  type GeneratedStorePackage,
} from './store-blueprints'

interface AiStoreCopyPayload {
  presetId?: string
  bio?: string
  heroBadge?: string
  bannerTitle?: string
  bannerSubtitle?: string
  announcementText?: string
  bentoTitle?: string
  bentoItems?: Array<{ emoji?: string; title?: string; desc?: string }>
  brandStoryTitle?: string
  brandStoryDesc?: string
  narrativeP1?: string
  narrativeP2?: string
  pillar1Icon?: string
  pillar1Title?: string
  pillar1Desc?: string
  pillar2Icon?: string
  pillar2Title?: string
  pillar2Desc?: string
  faqs?: Array<{ q?: string; a?: string }>
  welcomeMessage?: string
  niche?: string
  targetAudience?: string
  brandTone?: string
}

function extractJsonObject(raw: string): AiStoreCopyPayload | null {
  try {
    const cleaned = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null
    }

    const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
    return parsed && typeof parsed === 'object' ? (parsed as AiStoreCopyPayload) : null
  } catch {
    return null
  }
}

export async function generateStorefrontPackage(params: {
  name: string
  category?: string | null
  description?: string | null
}): Promise<GeneratedStorePackage> {
  const base = buildIndustryStoreBlueprint(params)

  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  const hasRealKey = Boolean(apiKey && !apiKey.includes('placeholder'))
  const hasRichInput = Boolean(params.description?.trim() || params.name.trim())

  if (!hasRealKey || !hasRichInput) {
    return base
  }

  const apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1'
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free'

  const systemPrompt = [
    'Eres un director creativo de e-commerce en Latinoamérica.',
    'Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional, todo en español neutro/colombiano.',
    'Presets permitidos para presetId: "luxe" | "midnight" | "artisan" | "streetwear" | "pastel".',
    'brandTone debe ser uno de: "Sofisticado y elegante" | "Amigable y cercano" | "Profesional y directo" | "Divertido e informal".',
  ].join(' ')

  const userPrompt = `Genera los textos y estilo para la tienda online:
- Nombre comercial: "${params.name.trim()}"
- Categoría: "${params.category || 'Otros'}"
- Descripción del negocio: "${params.description?.trim() || 'Tienda online con ventas por WhatsApp'}"

Devuelve exactamente este esquema JSON:
{
  "presetId": "luxe",
  "bio": "Resumen atractivo de 1 frase (máx 140 caracteres)",
  "heroBadge": "INSIGNIA CORTA CON 1 EMOJI EN MAYÚSCULAS",
  "bannerTitle": "Titular principal persuasivo (máx 65 caracteres)",
  "bannerSubtitle": "Subtítulo claro con propuesta de valor (máx 160 caracteres)",
  "announcementText": "Barra superior corta con 1 emoji",
  "bentoTitle": "Título corto de diferenciales",
  "bentoItems": [
    { "emoji": "✨", "title": "Diferencial 1", "desc": "Descripción breve" },
    { "emoji": "🚀", "title": "Diferencial 2", "desc": "Descripción breve" },
    { "emoji": "🛡️", "title": "Diferencial 3", "desc": "Descripción breve" }
  ],
  "brandStoryTitle": "Título de la sección historia",
  "brandStoryDesc": "Párrafo corto sobre la esencia del negocio",
  "narrativeP1": "Primer párrafo de historia de la marca",
  "narrativeP2": "Segundo párrafo de compromiso con el cliente",
  "pillar1Icon": "🌟",
  "pillar1Title": "Pilar 1",
  "pillar1Desc": "Detalle del pilar 1",
  "pillar2Icon": "🤝",
  "pillar2Title": "Pilar 2",
  "pillar2Desc": "Detalle del pilar 2",
  "faqs": [
    { "q": "Pregunta frecuente 1 del giro", "a": "Respuesta clara" },
    { "q": "Pregunta frecuente 2 del giro", "a": "Respuesta clara" },
    { "q": "Pregunta frecuente 3 del giro", "a": "Respuesta clara" }
  ],
  "welcomeMessage": "Saludo cálido de WhatsApp para recibir clientes",
  "niche": "Giro específico resumido",
  "targetAudience": "Público ideal en 1 frase",
  "brandTone": "Sofisticado y elegante"
}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6500)

  try {
    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://flashcheckout.co',
        'X-Title': 'Flashcheckouts',
      },
      body: JSON.stringify({
        model,
        temperature: 0.55,
        max_tokens: 1200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!res.ok) return base

    const data = await res.json()
    const rawContent = data?.choices?.[0]?.message?.content
    if (typeof rawContent !== 'string') return base

    const ai = extractJsonObject(rawContent)
    if (!ai) return base

    const chosenPreset =
      ai.presetId && PRESETS.some(p => p.id === ai.presetId)
        ? PRESETS.find(p => p.id === ai.presetId)!
        : null

    const validBento =
      Array.isArray(ai.bentoItems) && ai.bentoItems.length >= 3
        ? ai.bentoItems.slice(0, 3).map((item, idx) => ({
            emoji: item.emoji?.trim() || base.aiSettings.bentoHighlights?.items?.[idx]?.emoji || '✨',
            title: item.title?.trim() || base.aiSettings.bentoHighlights?.items?.[idx]?.title || 'Calidad',
            desc: item.desc?.trim() || base.aiSettings.bentoHighlights?.items?.[idx]?.desc || '',
          }))
        : base.aiSettings.bentoHighlights?.items

    const validFaqs =
      Array.isArray(ai.faqs) && ai.faqs.length >= 2
        ? ai.faqs
            .filter(f => f?.q?.trim() && f?.a?.trim())
            .slice(0, 4)
            .map(f => ({ q: f.q!.trim(), a: f.a!.trim() }))
        : base.aiSettings.faqs?.items

    const finalBio = ai.bio?.trim() || base.bio
    const validTones = [
      'Sofisticado y elegante',
      'Amigable y cercano',
      'Profesional y directo',
      'Divertido e informal',
    ]
    const finalTone =
      ai.brandTone && validTones.includes(ai.brandTone)
        ? ai.brandTone
        : base.businessProfile.brandTone
    const finalNiche = ai.niche?.trim() || base.businessProfile.niche

    return {
      bio: finalBio,
      welcomeMessage: ai.welcomeMessage?.trim() || base.welcomeMessage,
      systemPrompt: `Eres Nova, el asesor comercial oficial de ${params.name.trim()} (${finalNiche}). Tu tono de marca es "${finalTone}". Ayuda al cliente a resolver dudas sobre el catálogo, recomienda opciones ideales según lo que busca y guíalo de forma amable y concisa a completar su pedido.`,
      businessProfile: {
        niche: finalNiche,
        targetAudience: ai.targetAudience?.trim() || base.businessProfile.targetAudience,
        brandTone: finalTone,
        coreProposition: finalBio,
      },
      aiSettings: {
        ...base.aiSettings,
        ...(chosenPreset
          ? {
              themePreset: chosenPreset.id,
              colors: { ...chosenPreset.colors },
              typography: chosenPreset.typography,
              borderRadius: chosenPreset.borderRadius,
              shadowStyle: chosenPreset.shadowStyle,
              headerStyle: chosenPreset.headerStyle,
              heroStyle: chosenPreset.heroStyle,
              cardStyle: chosenPreset.cardStyle,
              cardAspectRatio: chosenPreset.cardAspectRatio,
              badgeStyle: chosenPreset.badgeStyle,
            }
          : {}),
        heroBadge: ai.heroBadge?.trim() || base.aiSettings.heroBadge,
        bannerTitle: ai.bannerTitle?.trim() || base.aiSettings.bannerTitle,
        bannerSubtitle: ai.bannerSubtitle?.trim() || base.aiSettings.bannerSubtitle,
        announcement: {
          ...base.aiSettings.announcement,
          enabled: true,
          text: ai.announcementText?.trim() || base.aiSettings.announcement?.text,
          bgColor: chosenPreset?.colors.primario || base.aiSettings.colors?.primario || '#18181B',
          textColor: '#FFFFFF',
        },
        bentoHighlights: {
          title: ai.bentoTitle?.trim() || base.aiSettings.bentoHighlights?.title,
          items: validBento,
        },
        brandStory: {
          ...base.aiSettings.brandStory,
          title: ai.brandStoryTitle?.trim() || base.aiSettings.brandStory?.title,
          desc: ai.brandStoryDesc?.trim() || base.aiSettings.brandStory?.desc,
        },
        brandStoryPage: {
          ...base.aiSettings.brandStoryPage,
          narrativeP1: ai.narrativeP1?.trim() || base.aiSettings.brandStoryPage?.narrativeP1,
          narrativeP2: ai.narrativeP2?.trim() || base.aiSettings.brandStoryPage?.narrativeP2,
          pillar1Icon: ai.pillar1Icon?.trim() || base.aiSettings.brandStoryPage?.pillar1Icon,
          pillar1Title: ai.pillar1Title?.trim() || base.aiSettings.brandStoryPage?.pillar1Title,
          pillar1Desc: ai.pillar1Desc?.trim() || base.aiSettings.brandStoryPage?.pillar1Desc,
          pillar2Icon: ai.pillar2Icon?.trim() || base.aiSettings.brandStoryPage?.pillar2Icon,
          pillar2Title: ai.pillar2Title?.trim() || base.aiSettings.brandStoryPage?.pillar2Title,
          pillar2Desc: ai.pillar2Desc?.trim() || base.aiSettings.brandStoryPage?.pillar2Desc,
        },
        faqs: {
          enabled: true,
          title: 'Preguntas Frecuentes',
          items: validFaqs,
        },
        seo: {
          title: `${params.name.trim()} | Tienda Oficial Online`,
          desc: finalBio,
        },
      },
    }
  } catch {
    return base
  } finally {
    clearTimeout(timeout)
  }
}

