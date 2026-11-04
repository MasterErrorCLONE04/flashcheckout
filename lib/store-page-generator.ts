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
  typography?: string
  colors?: {
    primario?: string
    secundario?: string
    acento?: string
    fondo?: string
    texto?: string
  }
}

const ALLOWED_FONTS = [
  'Plus Jakarta Sans',
  'Outfit',
  'Inter',
  'Sora',
  'DM Sans',
  'Manrope',
  'Space Grotesk',
  'Syne',
  'Playfair Display',
  'Cormorant Garamond',
  'Cinzel',
  'Montserrat',
]

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
  prompt?: string | null
  scope?: 'all' | 'copy' | 'style'
}): Promise<GeneratedStorePackage> {
  // Combine description with specific prompt for base blueprint determination
  const combinedDesc = [params.description?.trim(), params.prompt?.trim()]
    .filter(Boolean)
    .join('. ')

  const base = buildIndustryStoreBlueprint({
    name: params.name,
    category: params.category,
    description: combinedDesc,
  })

  const apiKey = (process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY)?.trim()
  const hasRealKey = Boolean(apiKey && !apiKey.includes('placeholder'))
  const hasRichInput = Boolean(params.prompt?.trim() || params.description?.trim() || params.name.trim())

  if (!hasRealKey || !hasRichInput) {
    return base
  }

  const isDeepSeek = !process.env.OPENROUTER_API_KEY && Boolean(process.env.DEEPSEEK_API_KEY)
  const apiUrl = isDeepSeek
    ? 'https://api.deepseek.com/v1'
    : process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1'
  const model = isDeepSeek
    ? 'deepseek-chat'
    : 'nvidia/nemotron-3.5-lightning:free'

  const systemPrompt = [
    'Eres un director de arte y estratega de e-commerce de ultra lujo en Latinoamérica.',
    'Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni explicaciones, todo en español persuasivo.',
    'Presets válidos: "waterdrop-editorial" | "minimalist-luxe" | "artisan-warm" | "botanical-beauty" | "street-bold" | "midnight-monochrome" | "coastal-breeze" | "terracotta-earth" | "emerald-fine" | "cyber-tech".',
    `Tipografías válidas: ${ALLOWED_FONTS.map(f => `"${f}"`).join(', ')}.`,
  ].join(' ')

  const userPrompt = `Diseña y redacta la tienda online siguiendo estas especificaciones exactas:
- Nombre comercial: "${params.name.trim()}"
- Giro / Categoría: "${params.category || 'Otros'}"
${params.prompt?.trim() ? `- DESEOS ESPECÍFICOS DEL USUARIO: "${params.prompt.trim()}"` : ''}
${params.description?.trim() ? `- Descripción base: "${params.description.trim()}"` : ''}
- Alcance solicitado: "${params.scope || 'all'}"

Devuelve exactamente este esquema JSON (colores en formato hex válido #RRGGBB):
{
  "presetId": "waterdrop-editorial",
  "typography": "Plus Jakarta Sans",
  "colors": {
    "primario": "#111111",
    "secundario": "#27272A",
    "acento": "#8CE5A7",
    "fondo": "#FFFFFF",
    "texto": "#111111"
  },
  "bio": "Propuesta de valor en 1 frase memorable (máx 140 caracteres)",
  "heroBadge": "INSIGNIA PERSUASIVA EN MAYÚSCULAS",
  "bannerTitle": "Titular principal de alto impacto para portada (máx 60 caracteres)",
  "bannerSubtitle": "Subtítulo claro con diferencial y beneficios (máx 150 caracteres)",
  "announcementText": "Texto para la barra superior de promociones y envíos",
  "bentoTitle": "Título de diferenciales clave",
  "bentoItems": [
    { "emoji": "✨", "title": "Diferencial 1", "desc": "Detalle breve" },
    { "emoji": "🚀", "title": "Diferencial 2", "desc": "Detalle breve" },
    { "emoji": "🛡️", "title": "Diferencial 3", "desc": "Detalle breve" }
  ],
  "brandStoryTitle": "Título de historia de marca",
  "brandStoryDesc": "Párrafo emotivo sobre la pasión o misión del negocio",
  "narrativeP1": "Párrafo 1 de historia",
  "narrativeP2": "Párrafo 2 de compromiso",
  "pillar1Icon": "🌿",
  "pillar1Title": "Pilar 1",
  "pillar1Desc": "Detalle del pilar 1",
  "pillar2Icon": "🤝",
  "pillar2Title": "Pilar 2",
  "pillar2Desc": "Detalle del pilar 2",
  "faqs": [
    { "q": "Pregunta frecuente 1 del giro", "a": "Respuesta clara sobre despacho o garantía" },
    { "q": "Pregunta frecuente 2 del giro", "a": "Respuesta clara sobre medios de pago y seguridad" },
    { "q": "Pregunta frecuente 3 del giro", "a": "Respuesta clara sobre envíos o cambios" }
  ],
  "welcomeMessage": "Saludo cálido por WhatsApp para recibir clientes que compran",
  "niche": "Giro específico",
  "targetAudience": "Público objetivo",
  "brandTone": "Sofisticado y elegante"
}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://flashcheckout.co',
        'X-Title': 'Flashcheckout Store Studio',
      },
      body: JSON.stringify({
        model,
        temperature: 0.65,
        max_tokens: 1500,
        reasoning: { max_tokens: 0 },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!res.ok) return base

    const data = await res.json()
    const msg = data?.choices?.[0]?.message
    const rawContent =
      (typeof msg?.content === 'string' ? msg.content : '') ||
      (typeof msg?.reasoning === 'string' ? msg.reasoning : '')

    if (!rawContent) return base

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
    const finalNiche = ai.niche?.trim() || base.businessProfile.niche
    const finalTone = ai.brandTone || base.businessProfile.brandTone

    // Colors: Use custom AI colors if provided and valid, otherwise fallback to preset
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const customColors = {
      primario: hexRegex.test(ai.colors?.primario || '')
        ? ai.colors!.primario!
        : chosenPreset?.colors.primario || base.aiSettings.colors?.primario || '#111111',
      secundario: hexRegex.test(ai.colors?.secundario || '')
        ? ai.colors!.secundario!
        : chosenPreset?.colors.secundario || base.aiSettings.colors?.secundario || '#27272A',
      acento: hexRegex.test(ai.colors?.acento || '')
        ? ai.colors!.acento!
        : chosenPreset?.colors.acento || base.aiSettings.colors?.acento || '#8CE5A7',
      fondo: hexRegex.test(ai.colors?.fondo || '')
        ? ai.colors!.fondo!
        : chosenPreset?.colors.fondo || base.aiSettings.colors?.fondo || '#FFFFFF',
      texto: hexRegex.test(ai.colors?.texto || '')
        ? ai.colors!.texto!
        : chosenPreset?.colors.texto || base.aiSettings.colors?.texto || '#111111',
    }

    const finalTypography =
      ai.typography && ALLOWED_FONTS.includes(ai.typography)
        ? ai.typography
        : chosenPreset?.typography || base.aiSettings.typography || 'Plus Jakarta Sans'

    return {
      bio: finalBio,
      welcomeMessage: ai.welcomeMessage?.trim() || base.welcomeMessage,
      systemPrompt: `Eres Nova, asesor comercial oficial de ${params.name.trim()} (${finalNiche}). Tu tono es "${finalTone}". Ayuda a los compradores con recomendaciones directas y catálogo en línea.`,
      businessProfile: {
        niche: finalNiche,
        targetAudience: ai.targetAudience?.trim() || base.businessProfile.targetAudience,
        brandTone: finalTone,
        coreProposition: finalBio,
      },
      aiSettings: {
        ...base.aiSettings,
        heroPanels: base.aiSettings.heroPanels,
        bannerUrl: base.aiSettings.bannerUrl,
        themePreset: chosenPreset?.id || base.aiSettings.themePreset || 'waterdrop-editorial',
        colors: customColors,
        typography: finalTypography,
        borderRadius: chosenPreset?.borderRadius || base.aiSettings.borderRadius || 'smooth',
        shadowStyle: chosenPreset?.shadowStyle || base.aiSettings.shadowStyle || 'flat',
        headerStyle: chosenPreset?.headerStyle || base.aiSettings.headerStyle || 'clean-border',
        heroStyle: chosenPreset?.heroStyle || base.aiSettings.heroStyle || 'waterdrop-collage',
        cardStyle: chosenPreset?.cardStyle || base.aiSettings.cardStyle || 'waterdrop-studio',
        heroBadge: ai.heroBadge?.trim() || base.aiSettings.heroBadge,
        bannerTitle: ai.bannerTitle?.trim() || base.aiSettings.bannerTitle,
        bannerSubtitle: ai.bannerSubtitle?.trim() || base.aiSettings.bannerSubtitle,
        announcement: {
          ...base.aiSettings.announcement,
          enabled: true,
          text: ai.announcementText?.trim() || base.aiSettings.announcement?.text,
          bgColor: customColors.primario,
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
          title: `${params.name.trim()} | Tienda Oficial`,
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
