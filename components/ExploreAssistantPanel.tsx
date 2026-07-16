'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Bot, CircleDollarSign, Headphones, ShieldCheck } from 'lucide-react'
import type { ComponentType } from 'react'

const prompts = [
  '¿Dónde puedo comprar tecnología?',
  'Quiero comprar ropa para hombre',
  'Tiendas para mascotas cerca de mí',
]

export default function ExploreAssistantPanel() {
  const [question, setQuestion] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const askAssistant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanQuestion = question.trim()
    if (!cleanQuestion) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('q', cleanQuestion)
    router.push(`${pathname}?${params.toString()}#resultados`)
  }

  return (
    <aside className="hidden min-h-[calc(100vh-80px)] bg-white/55 px-5 py-8 dark:bg-white/[0.02] xl:block">
      <section id="agente-ia" className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15">
            <Bot className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-[-0.04em] text-zinc-950 dark:text-white">Agente IA</h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Siempre disponible para ayudarte</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/50">
          <p className="text-sm font-black text-zinc-950 dark:text-white">¡Hola! Soy tu Agente IA</p>
          <p className="mt-3 text-sm font-medium leading-6 text-zinc-600 dark:text-zinc-300">Cuéntame qué estás buscando y filtraré el directorio por las mejores coincidencias.</p>
        </div>

        <div className="mt-6 space-y-3">
          {prompts.map((prompt) => (
            <Link key={prompt} href={`/explorar?q=${encodeURIComponent(prompt)}`} className="block rounded-full bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-400/10 dark:text-blue-200">
              {prompt}
            </Link>
          ))}
        </div>

        <form onSubmit={askAssistant} className="mt-7 flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-zinc-950/70">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Escribe tu pregunta..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-white"
          />
          <button type="submit" className="flex size-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition hover:scale-105" aria-label="Buscar con IA">
            <ArrowRight className="size-5 -rotate-45" />
          </button>
        </form>
        <p className="mt-4 text-center text-xs font-medium text-zinc-400">La IA usa el buscador real del directorio</p>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <h2 className="mb-6 text-xl font-black tracking-[-0.04em] text-zinc-950 dark:text-white">Compra con confianza</h2>
        <TrustItem icon={ShieldCheck} title="Tiendas verificadas" text="El badge aparece solo en tiendas verificadas" />
        <TrustItem icon={CircleDollarSign} title="Pagos seguros" text="Señalado cuando la tienda tiene pagos conectados" />
        <TrustItem icon={Headphones} title="Soporte al cliente" text="Entra a cada tienda para resolver dudas" />
      </section>
    </aside>
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
