import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function ExploreHero() {
  return (
    <section className="relative mb-12 overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 px-7 py-8 shadow-[0_22px_55px_rgba(16,185,129,0.12)] dark:border-emerald-400/20 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-zinc-900 md:px-9">
      <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_20%_30%,rgba(16,185,129,.18),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(20,184,166,.16),transparent_22%)]" />
      <div className="relative z-10 grid gap-8 md:grid-cols-[1fr_330px] md:items-center">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.055em] text-zinc-950 dark:text-white">Conversa antes de comprar</h2>
          <p className="mt-3 max-w-md text-base font-medium leading-7 text-zinc-600 dark:text-zinc-300">Nuestros Agentes IA te ayudan a encontrar exactamente lo que necesitas.</p>
          <Link href="#agente-ia" className="mt-5 inline-flex items-center gap-3 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950">
            <Sparkles className="size-4" />
            Hablar con un Agente IA
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="relative hidden h-40 md:block">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/70 blur-2xl dark:bg-emerald-300/10" />
          <Image
            src="/nova_robot_mascot.png"
            alt="Agente IA"
            width={240}
            height={240}
            className="absolute bottom-[-56px] right-10 h-56 w-56 object-contain drop-shadow-2xl"
            priority
          />
          <div className="absolute right-0 top-4 rounded-full bg-zinc-950 px-5 py-3 shadow-xl dark:bg-white">
            <span className="flex gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="size-2 rounded-full bg-emerald-400" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
