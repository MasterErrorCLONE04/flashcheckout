'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Headphones,
  Loader2,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

const starterPrompts = [
  'Donde puedo comprar tecnologia?',
  'Quiero comprar ropa para hombre',
  'Tiendas para mascotas cerca de mi',
]

type AssistantStore = {
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

type AssistantMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  actionUrl?: string
  stores?: AssistantStore[]
  suggestions?: string[]
}

type AssistantResponse = {
  text?: string
  actionUrl?: string
  stores?: AssistantStore[]
  suggestions?: string[]
  error?: string
}

export default function ExploreAssistantPanelAI() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hola, soy tu Agente IA. Dime que quieres comprar y filtrare el directorio por categoria, productos y tiendas reales.',
      suggestions: starterPrompts,
    },
  ])

  const askAssistant = async (event?: FormEvent<HTMLFormElement>, promptOverride?: string) => {
    event?.preventDefault()

    const cleanQuestion = (promptOverride || question).trim()
    if (!cleanQuestion || isThinking) return

    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: cleanQuestion,
    }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setQuestion('')
    setIsThinking(true)

    try {
      const response = await fetch('/api/explore/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanQuestion,
          history: messages
            .filter((message) => message.id !== 'welcome')
            .slice(-6)
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
        }),
      })

      const data = (await response.json().catch(() => null)) as AssistantResponse | null
      if (!response.ok || !data) {
        throw new Error(data?.error || 'No pude consultar el agente.')
      }

      const assistantMessage: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text || 'Encontre algunas opciones en el directorio.',
        actionUrl: data.actionUrl,
        stores: data.stores || [],
        suggestions: data.suggestions || [],
      }

      setMessages([...nextMessages, assistantMessage])
    } catch (error) {
      const text = error instanceof Error ? error.message : 'No pude responder en este momento.'
      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `${text} Prueba con una busqueda mas corta, por ejemplo "tecnologia", "moda" o "mascotas".`,
          suggestions: starterPrompts,
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const applyAction = (actionUrl?: string) => {
    if (!actionUrl) return
    router.push(actionUrl)
  }

  return (
    <aside className="hidden min-h-[calc(100vh-80px)] bg-white/55 px-5 py-8 dark:bg-white/[0.02] xl:block">
      <section id="agente-ia" className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15">
            <Bot className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-[-0.04em] text-zinc-950 dark:text-white">Agente IA</h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Conectado al directorio real</p>
          </div>
        </div>

        <div className="max-h-[430px] space-y-4 overflow-y-auto pr-1">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              onApply={applyAction}
              onSuggestion={(suggestion) => void askAssistant(undefined, suggestion)}
            />
          ))}

          {isThinking && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Analizando tu busqueda y revisando tiendas reales...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(event) => void askAssistant(event)} className="mt-7 flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-zinc-950/70">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={isThinking}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-zinc-700 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed dark:text-white"
          />
          <button
            type="submit"
            disabled={isThinking || !question.trim()}
            className="flex size-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Buscar con IA"
          >
            {isThinking ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5 -rotate-45" />}
          </button>
        </form>
        <p className="mt-4 text-center text-xs font-medium text-zinc-400">La IA entiende tu necesidad; las tiendas se consultan localmente.</p>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="mb-6 text-xl font-black tracking-[-0.04em] text-zinc-950 dark:text-white">Compra con confianza</h2>
        <TrustItem icon={ShieldCheck} title="Tiendas verificadas" text="El badge aparece solo en tiendas verificadas" />
        <TrustItem icon={CircleDollarSign} title="Pagos seguros" text="Senalado cuando la tienda tiene pagos conectados" />
        <TrustItem icon={Headphones} title="Soporte al cliente" text="Entra a cada tienda para resolver dudas" />
      </section>
    </aside>
  )
}

function ChatBubble({
  message,
  onApply,
  onSuggestion,
}: {
  message: AssistantMessage
  onApply: (actionUrl?: string) => void
  onSuggestion: (suggestion: string) => void
}) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('space-y-3', isUser && 'flex flex-col items-end')}>
      <div
        className={cn(
          'max-w-full rounded-2xl border p-4 text-sm leading-6 shadow-sm',
          isUser
            ? 'border-zinc-900 bg-zinc-950 text-white dark:border-white/20'
            : 'border-zinc-200 bg-white text-zinc-650 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-200'
        )}
      >
        {!isUser && (
          <div className="mb-2 flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-300">
            <Sparkles className="size-3.5" />
            Agente IA
          </div>
        )}
        <p className="font-medium">{message.content}</p>
      </div>

      {!isUser && message.stores && message.stores.length > 0 && (
        <div className="space-y-2">
          {message.stores.map((store) => (
            <Link
              key={store.href}
              href={store.href}
              className="block rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-700 shadow-sm dark:bg-white/10 dark:text-white">
                  <Store className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-black text-zinc-950 dark:text-white">{store.name}</p>
                    {store.verified && <CheckCircle2 className="size-3.5 shrink-0 text-blue-500" />}
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-zinc-400">{store.category}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-zinc-500 dark:text-zinc-400">{store.reason}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isUser && message.actionUrl && (
        <button
          onClick={() => onApply(message.actionUrl)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:scale-[1.01] dark:bg-white dark:text-zinc-950"
        >
          Aplicar busqueda al directorio
          <ArrowRight className="size-4" />
        </button>
      )}

      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <div className="space-y-2">
          {message.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSuggestion(suggestion)}
              className="block w-full rounded-full bg-blue-50 px-4 py-2.5 text-left text-sm font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-400/10 dark:text-blue-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  text: string
}) {
  return (
    <div className="mb-6 flex gap-4 last:mb-0">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/15">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm font-black text-zinc-950 dark:text-white">{title}</p>
        <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">{text}</p>
      </div>
    </div>
  )
}
