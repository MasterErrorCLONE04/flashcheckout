'use client'

import { User } from 'lucide-react'

type ExploreUserProfileCardProps = {
  userName?: string | null
  onOpenQuoteModal?: () => void
  onOpenFavorites?: () => void
  onOpenConfigModal?: () => void
}

export default function ExploreUserProfileCard({
  userName,
  onOpenQuoteModal,
  onOpenFavorites,
  onOpenConfigModal,
}: ExploreUserProfileCardProps) {
  const name = userName || 'David Velasquez'

  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 h-full flex flex-col justify-between">
      <div>
        {/* User Greeting Box */}
        <div className="flex items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-white/10 dark:text-white font-bold text-base shrink-0">
              <User className="size-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Bienvenido de vuelta
              </span>
              <h4 className="truncate text-sm font-bold text-[#111827] dark:text-white leading-tight">
                {name}
              </h4>
            </div>
          </div>
        </div>

        {/* Favorite Stats Split Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#f8f9fa] dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-center">
          <button
            onClick={onOpenFavorites}
            className="hover:opacity-80 transition-opacity"
          >
            <span className="block text-xl font-bold text-[#111827] dark:text-white leading-tight">13</span>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight block mt-0.5">
              Productos favoritos
            </span>
          </button>

          <button className="hover:opacity-80 transition-opacity border-l border-zinc-200 dark:border-white/10 pl-2">
            <span className="block text-xl font-bold text-[#111827] dark:text-white leading-tight">2</span>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight block mt-0.5">
              Proveedores favoritos
            </span>
          </button>
        </div>

        {/* Navigation History & B2B Profile Button */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <span className="block text-xs font-bold text-[#111827] dark:text-white mb-2">
              Tu historial
            </span>
            <div className="size-14 rounded-xl bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80"
                alt="Historial de navegación"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenConfigModal}
            className="rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 p-2.5 text-center transition-colors space-y-1 shrink-0"
          >
            <span className="block text-[10px] font-extrabold uppercase tracking-wider">Perfil B2B</span>
            <span className="block text-xs font-bold underline">Editar Fábrica</span>
          </button>
        </div>
      </div>

      {/* Quote Banner Box */}
      <div className="mt-5 pt-3 text-center border-t border-zinc-100 dark:border-white/5">
        <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-2.5">
          Una solicitud, varias cotizaciones
        </p>
        <button
          onClick={onOpenQuoteModal}
          className="w-full rounded-full bg-[#111827] hover:bg-black text-white py-2.5 px-4 text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
        >
          Solicitud de Cotización
        </button>
      </div>
    </div>
  )
}
