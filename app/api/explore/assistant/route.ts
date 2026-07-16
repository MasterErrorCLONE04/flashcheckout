import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOpenRouterCompletion, type ChatMessage } from '@/lib/ai/openrouter'
import { parseJsonBody } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

type AssistantHistoryItem = {
  role?: string
  content?: string
}

type AssistantBody = {
  message?: string
  history?: AssistantHistoryItem[]
}

type AssistantIntent = {
  query: string
  category: string
  minPrice?: number
  maxPrice?: number
}

type StoreMatch = {
  name: string
  href: string
  category: string
  verified: boolean
  paymentsReady: boolean
  reason: string
  products: Array<{
    name: string
    price: number
  }>
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Tecnologia: ['tecnologia', 'tech', 'celular', 'computador', 'pc', 'laptop', 'audifonos', 'iphone', 'android', 'gamer'],
  Moda: ['moda', 'ropa', 'camisa', 'pantalon', 'zapatos', 'tenis', 'hombre', 'mujer', 'vestido', 'chaqueta'],
  Hogar: ['hogar', 'casa', 'mueble', 'sala', 'cocina', 'decoracion', 'colchon', 'lampara'],
  Mascotas: ['mascota', 'mascotas', 'perro', 'gato', 'pet', 'veterinaria'],
  Alimentos: ['alimento', 'comida', 'restaurante', 'bebida', 'cafe', 'postre', 'mercado'],
  Belleza: ['belleza', 'maquillaje', 'cosmetico', 'spa', 'piel', 'cabello', 'manicure'],
  Servicios: ['servicio', 'servicios', 'asesoria', 'soporte', 'reparacion', 'consultoria'],
}

const STOP_WORDS = new Set([
  'quiero',
  'comprar',
  'buscar',
  'busco',
  'donde',
  'puedo',
  'para',
  'cerca',
  'como',
  'una',
  'uno',
  'unas',
  'unos',
  'por',
  'favor',
  'tienda',
  'tiendas',
  'marca',
  'marcas',
  'necesito',
  'recomienda',
  'recomiendame',
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'mi',
]

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody<AssistantBody>(req)
    const userMessage = body?.message?.trim() || ''

    if (!userMessage) {
      return NextResponse.json({ error: 'Escribe una pregunta para que pueda ayudarte.' }, { status: 400 })
    }

    const fallbackIntent = inferLocalIntent(userMessage)
    const aiIntent = await askAIForIntent(userMessage, body?.history || [])
    const intent = normalizeIntent(aiIntent, fallbackIntent)
    const tokens = getMeaningfulTokens(`${userMessage} ${intent.query}`)
    const categoryFilter = buildCategoryFilter(intent.category)

    const stores = await prisma.store.findMany({
      where: {
        active: true,
        products: {
          some: {
            active: true,
            price: {
              gte: intent.minPrice ?? 0,
              lte: intent.maxPrice ?? 5000000,
            },
          },
        },
        ...categoryFilter,
      },
      include: {
        products: {
          where: {
            active: true,
            price: {
              gte: intent.minPrice ?? 0,
              lte: intent.maxPrice ?? 5000000,
            },
          },
          select: { name: true, price: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const matches = stores
      .map((store) => {
        const searchableText = normalizeText([
          store.name,
          store.category || '',
          store.bio || '',
          ...store.products.map((product) => product.name),
        ].join(' '))

        const tokenScore = tokens.reduce((score, token) => score + (searchableText.includes(token) ? 4 : 0), 0)
        const categoryScore = intent.category !== 'Todos' ? 10 : 0
        const trustScore = (store.verificationLevel > 0 || store.whatsappVerified ? 2 : 0) + (store.stripeConnectChargesEnabled || store.mpConnected ? 2 : 0)

        return {
          store,
          score: tokenScore + categoryScore + trustScore,
        }
      })
      .sort((a, b) => b.score - a.score || b.store._count.products - a.store._count.products)
      .slice(0, 4)

    const storeMatches: StoreMatch[] = matches.map(({ store }) => ({
      name: store.name,
      href: `/tienda/${store.slug}`,
      category: store.category || 'General',
      verified: store.verificationLevel > 0 || store.whatsappVerified,
      paymentsReady: store.stripeConnectChargesEnabled || store.mpConnected,
      reason: buildReason(store.category || 'General', store.products, tokens, intent.category),
      products: store.products.slice(0, 3),
    }))

    const text = buildAssistantText(userMessage, intent, storeMatches)
    const suggestions = buildSuggestions(intent.category)
    const actionUrl = buildExploreUrl(intent)

    return NextResponse.json({
      text,
      query: intent.query,
      category: intent.category,
      minPrice: intent.minPrice,
      maxPrice: intent.maxPrice,
      suggestions,
      stores: storeMatches,
      actionUrl,
    })
  } catch (error) {
    console.error('[Explore Assistant API Error]', error)
    return NextResponse.json(
      { error: 'No pude consultar el directorio en este momento. Intentalo de nuevo.' },
      { status: 500 }
    )
  }
}

function buildCategoryFilter(category: string) {
  if (category === 'Todos') return {}

  if (category === 'Tecnologia') {
    return {
      OR: [
        { category: { equals: 'Tecnologia', mode: 'insensitive' as const } },
        { category: { equals: 'Tecnolog\u00eda', mode: 'insensitive' as const } },
      ],
    }
  }

  return {
    category: { equals: category, mode: 'insensitive' as const },
  }
}

async function askAIForIntent(message: string, history: AssistantHistoryItem[]) {
  const systemPrompt = `Eres un clasificador de intencion para un directorio de tiendas.
No tienes acceso a datos de tiendas. No inventes nombres de tiendas.
Tu unica tarea es convertir la solicitud del comprador en filtros de busqueda.

Devuelve exclusivamente JSON valido con esta forma:
{"query":"termino corto opcional","category":"Todos|Tecnologia|Moda|Hogar|Mascotas|Alimentos|Belleza|Servicios","minPrice":0,"maxPrice":5000000}

Reglas:
- Si la frase indica una categoria clara, usa esa categoria y deja query vacio si el termino es muy generico.
- Para "ropa para hombre", category debe ser "Moda" y query puede ser "".
- Para "tecnologia", category debe ser "Tecnologia".
- Para "mascotas cerca de mi", category debe ser "Mascotas".
- Si hay un producto especifico como "iphone", "audifonos", "sofa" o "maquillaje", ponlo en query.
- No incluyas explicaciones fuera del JSON.`

  const messages: ChatMessage[] = history.slice(-4).map((item) => ({
    role: item.role === 'assistant' ? 'assistant' : 'user',
    content: item.content || '',
  }))
  messages.push({ role: 'user', content: message })

  const response = await generateOpenRouterCompletion(messages, systemPrompt)
  const rawText = typeof response === 'string' ? response : response.content || ''
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0]) as Partial<AssistantIntent>
  } catch {
    return null
  }
}

function normalizeIntent(aiIntent: Partial<AssistantIntent> | null, fallback: AssistantIntent): AssistantIntent {
  const category = isValidCategory(aiIntent?.category) ? aiIntent.category : fallback.category
  const query = typeof aiIntent?.query === 'string' ? aiIntent.query.trim().slice(0, 80) : fallback.query
  const minPrice = normalizePrice(aiIntent?.minPrice, fallback.minPrice)
  const maxPrice = normalizePrice(aiIntent?.maxPrice, fallback.maxPrice)

  return {
    query,
    category,
    minPrice,
    maxPrice: Math.max(minPrice ?? 0, maxPrice ?? 5000000),
  }
}

function inferLocalIntent(input: string): AssistantIntent {
  const category = inferCategory(input)
  const tokens = getMeaningfulTokens(input)
  const query = category === 'Todos' ? tokens.slice(0, 3).join(' ') : inferSpecificQuery(tokens)

  return {
    query,
    category,
    minPrice: 0,
    maxPrice: 5000000,
  }
}

function inferCategory(input: string) {
  const normalizedInput = normalizeText(input)

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedInput.includes(keyword))) {
      return category
    }
  }

  return 'Todos'
}

function inferSpecificQuery(tokens: string[]) {
  const genericCategoryWords = new Set(Object.values(CATEGORY_KEYWORDS).flat())
  const specificTokens = tokens.filter((token) => !genericCategoryWords.has(token))
  return specificTokens.slice(0, 2).join(' ')
}

function getMeaningfulTokens(input: string) {
  return normalizeText(input)
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .slice(0, 8)
}

function buildAssistantText(input: string, intent: AssistantIntent, stores: StoreMatch[]) {
  if (stores.length === 0) {
    return `No encontre coincidencias exactas para "${input}". Puedo ampliar la busqueda o probar otra categoria para encontrar mejores opciones.`
  }

  const storeNames = stores.slice(0, 3).map((store) => store.name).join(', ')
  const filterText = intent.category !== 'Todos' ? ` en ${intent.category}` : ''

  return `Encontre ${stores.length} opcion${stores.length === 1 ? '' : 'es'}${filterText}: ${storeNames}. Te deje las mejores coincidencias del directorio real y puedes aplicar la busqueda para ver mas resultados.`
}

function buildReason(
  category: string,
  products: Array<{ name: string; price: number }>,
  tokens: string[],
  intentCategory: string
) {
  if (intentCategory !== 'Todos' && normalizeText(category).includes(normalizeText(intentCategory))) {
    return `Coincide con la categoria ${category}.`
  }

  const productMatch = products.find((product) =>
    tokens.some((token) => normalizeText(product.name).includes(token))
  )

  if (productMatch) return `Tiene productos relacionados como ${productMatch.name}.`
  return 'Coincide con tu busqueda dentro del directorio.'
}

function buildSuggestions(category: string) {
  if (category === 'Tecnologia') return ['Celulares disponibles', 'Computadores y accesorios', 'Tiendas con pagos seguros']
  if (category === 'Moda') return ['Ropa para hombre', 'Zapatos y accesorios', 'Moda con envio rapido']
  if (category === 'Mascotas') return ['Alimento para mascotas', 'Accesorios para perros', 'Tiendas verificadas para mascotas']
  if (category === 'Hogar') return ['Decoracion para el hogar', 'Muebles disponibles', 'Productos para cocina']

  return ['Tiendas verificadas', 'Productos con pago seguro', 'Recomiendame opciones economicas']
}

function buildExploreUrl(intent: AssistantIntent) {
  const params = new URLSearchParams()
  if (intent.query) params.set('q', intent.query)
  if (intent.category !== 'Todos') params.set('category', intent.category)
  if (typeof intent.minPrice === 'number') params.set('minPrice', String(intent.minPrice))
  if (typeof intent.maxPrice === 'number') params.set('maxPrice', String(intent.maxPrice))

  const queryString = params.toString()
  return `/explorar${queryString ? `?${queryString}` : ''}#resultados`
}

function normalizePrice(value: unknown, fallback?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.max(0, Math.min(Math.round(value), 5000000))
}

function isValidCategory(category: unknown): category is AssistantIntent['category'] {
  return typeof category === 'string' && ['Todos', ...Object.keys(CATEGORY_KEYWORDS)].includes(category)
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
