'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type ExploreVerifiedStoresMenuProps = {
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ExploreVerifiedStoresMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: ExploreVerifiedStoresMenuProps) {
  if (!isOpen) return null

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 pt-1 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-b-2xl rounded-t-lg border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 p-4 sm:p-5 flex flex-col md:flex-row gap-4">
          
          {/* Left Main Grid Area (Fábricas Verificadas) */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Banner 1: Blue Stats Hero */}
            <div className="relative rounded-xl bg-gradient-to-br from-sky-100 via-sky-200 to-blue-300 dark:from-sky-950 dark:via-blue-900 dark:to-indigo-950 p-5 flex flex-col justify-between overflow-hidden group border border-sky-200/60 dark:border-sky-800/30">
              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight text-blue-950 dark:text-sky-100 leading-snug">
                  Tu acceso directo a fábricas verificadas
                </h3>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div>
                    <p className="text-base sm:text-lg font-black text-blue-950 dark:text-white leading-tight">+34 mil</p>
                    <p className="text-[10px] font-medium text-blue-900/80 dark:text-sky-200/80">Fabricantes verificados</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-black text-blue-950 dark:text-white leading-tight">+5M</p>
                    <p className="text-[10px] font-medium text-blue-900/80 dark:text-sky-200/80">Industrias presentes</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-black text-blue-950 dark:text-white leading-tight">78</p>
                    <p className="text-[10px] font-medium text-blue-900/80 dark:text-sky-200/80">Servicios especializados</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/explorar?category=Tiendas"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#0d2a4a] hover:bg-[#081c33] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg"
                >
                  Explorar ahora
                </Link>
              </div>
            </div>

            {/* Banner 2: Búsqueda inteligente */}
            <Link
              href="/explorar?category=Tiendas"
              className="relative rounded-xl overflow-hidden group h-56 sm:h-auto min-h-[220px] flex flex-col justify-end p-4 border border-zinc-200/80 dark:border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80"
                alt="Búsqueda de fábricas inteligente"
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 flex items-end justify-between gap-2 w-full">
                <span className="text-sm font-bold text-white leading-tight">
                  Búsqueda de fábricas inteligente
                </span>
                <div className="size-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </Link>

            {/* Banner 3: Mejores fabricantes */}
            <Link
              href="/explorar?category=Tiendas"
              className="relative rounded-xl overflow-hidden group h-56 sm:h-auto min-h-[220px] flex flex-col justify-end p-4 border border-zinc-200/80 dark:border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80"
                alt="Mejores fabricantes"
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 flex items-end justify-between gap-2 w-full">
                <span className="text-sm font-bold text-white leading-tight">
                  Mejores fabricantes
                </span>
                <div className="size-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </Link>

            {/* Banner 4: Muestras directo de la fábrica */}
            <Link
              href="/explorar?category=Tiendas"
              className="relative rounded-xl overflow-hidden group h-56 sm:h-auto min-h-[220px] flex flex-col justify-end p-4 border border-zinc-200/80 dark:border-white/10"
            >
              <img
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80"
                alt="Muestras directo de la fábrica"
                className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 flex items-end justify-between gap-2 w-full">
                <span className="text-sm font-bold text-white leading-tight">
                  Muestras directo de la fábrica
                </span>
                <div className="size-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </Link>

          </div>

          {/* Right Side Column (Otras selecciones destacadas) */}
          <div className="w-full md:w-64 shrink-0 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 p-5 flex flex-col justify-start space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Otras selecciones destacadas
            </h4>

            <div className="flex flex-col space-y-3 text-xs font-normal text-zinc-700 dark:text-zinc-300">
              <Link
                href="/explorar?action=dropshipping"
                className="hover:text-black dark:hover:text-white hover:font-medium transition-all"
              >
                Centro de dropshipping
              </Link>
              <Link
                href="/explorar?action=samples"
                className="hover:text-black dark:hover:text-white hover:font-medium transition-all"
              >
                Centro de muestras
              </Link>
              <Link
                href="/explorar?action=customization"
                className="hover:text-black dark:hover:text-white hover:font-medium transition-all"
              >
                Personalización rápida
              </Link>
              <Link
                href="/explorar?action=exhibitions"
                className="hover:text-black dark:hover:text-white hover:font-medium transition-all"
              >
                Exposiciones comerciales
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
