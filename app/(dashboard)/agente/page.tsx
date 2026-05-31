import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AgentSettingsManager from '@/components/AgentSettingsManager'
import StoreCreationWizard from '@/components/StoreCreationWizard'

export const dynamic = 'force-dynamic'

export default async function AgentePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const store = await prisma.store.findFirst({
    where: { userId },
  })

  if (!store) return <StoreCreationWizard />

  const defaultSettings = {
    systemPrompt: store.systemPrompt || `Eres el agente de IA oficial de ${store.name}. Atiende con amabilidad y educación. Tu objetivo es ayudar al usuario a ver el catálogo de la tienda y responder dudas de los productos disponibles. Mantén las respuestas muy cortas.`,
    welcomeMessage: store.welcomeMessage || `¡Hola! Bienvenido a ${store.name}. 🤖 Soy tu asistente virtual. ¿Qué te gustaría comprar hoy?`,
    active: store.aiActive,
  }

  return (
    <div className="space-y-4 pb-2 animate-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-955 font-display">Agente de WhatsApp</h1>
            <div className="text-[13px] font-medium text-zinc-500 mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Configuración de IA — <span className="text-zinc-950 font-bold">PROMPTS Y ENTRENAMIENTO</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-zinc-100" />
      </div>
      
      <AgentSettingsManager initialSettings={defaultSettings} storeName={store.name} />
    </div>
  )
}
