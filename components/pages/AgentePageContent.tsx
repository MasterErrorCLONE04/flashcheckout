import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AgentSettingsManager from '@/components/AgentSettingsManager'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

type ProductPreview = {
  id: string
  name: string
  price: number
  active: boolean
  aiRecommendation: boolean
  aiDescription: string
}

type FaqPreview = {
  id: string
  question: string
  answer: string
}

export default async function AgentePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { name: 'asc' }
  })

  const faqs = await prisma.faq.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' }
  })

  const defaultSettings = {
    systemPrompt: store.systemPrompt || `Eres el agente de IA oficial de ${store.name}. Atiende con amabilidad y educación. Tu objetivo es ayudar al usuario a ver el catálogo de la tienda y responder dudas de los productos disponibles. Mantén las respuestas muy cortas.`,
    welcomeMessage: store.welcomeMessage || `¡Hola! Bienvenido a ${store.name}. 🤖 Soy tu asistente virtual. ¿Qué te gustaría comprar hoy?`,
    active: store.aiActive,
    aiSettings: typeof store.aiSettings === 'string' ? JSON.parse(store.aiSettings) : (store.aiSettings || {}),
  }

  // Format popular products list for preview/edit
  const formattedProducts: ProductPreview[] = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    active: p.active,
    aiRecommendation: Boolean((p as { aiRecommendation?: boolean }).aiRecommendation),
    aiDescription: (p as { aiDescription?: string }).aiDescription || ''
  }))

  const formattedFaqs: FaqPreview[] = faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer
  }))

  return (
    <div className="pb-2 animate-in">
      <AgentSettingsManager 
        initialSettings={defaultSettings} 
        storeName={store.name}
        storeSlug={store.slug}
        storeId={store.id}
        initialProducts={formattedProducts}
        initialFaqs={formattedFaqs}
      />
    </div>
  )
}
