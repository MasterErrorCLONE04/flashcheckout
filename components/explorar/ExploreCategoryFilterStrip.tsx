'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

const TABS = [
  { name: 'Todas las categorías', slug: 'Todos' },
  { name: 'Vehículos y transporte', slug: 'Vehículos' },
  { name: 'Deportes y entretenimiento', slug: 'Deportes' },
  { name: 'Energía renovable', slug: 'Energía' },
  { name: 'Electrónica de consumo', slug: 'Tecnología' },
  { name: 'Maquinaria industrial', slug: 'Maquinaria' },
  { name: 'Ropa y accesorios', slug: 'Moda' },
]

const TAG_PILLS = [
  { label: 'Productos populares disponibles para envío', sortKey: 'recent' },
  { label: 'Personalización basada en muestras', sortKey: 'samples' },
  { label: 'Gestión de calidad certificada', sortKey: 'quality' },
  { label: 'Personalización menor', sortKey: 'custom_light' },
  { label: 'Personalización completa', sortKey: 'custom_full' },
  { label: 'Capacidad de I+D', sortKey: 'rd' },
  { label: 'Proveedores de empresas Fortune 500', sortKey: 'fortune500' },
  { label: 'País/Región ∨', sortKey: 'country' },
]

const EXPANDED_CATEGORIES_COLUMNS = [
  [
    { name: 'Todas las categorías', slug: 'Todos', isHeader: true },
    { name: 'Electrónica de consumo', slug: 'Tecnología' },
    { name: 'Zapatos y accesorios', slug: 'Moda' },
    { name: 'Alimentos y bebidas', slug: 'Todos' },
    { name: 'Productos químicos', slug: 'Todos' },
    { name: 'Dispositivos y suministros médicos', slug: 'Salud' },
    { name: 'Madre, niños y juguetes', slug: 'Todos' },
    { name: 'Luces e iluminación', slug: 'Hogar' },
    { name: 'Componentes electrónicos, accesorios y telecomunicaciones', slug: 'Tecnología' },
    { name: 'Manejo de materiales', slug: 'Maquinaria' },
    { name: 'Maquinaria de construcción y edificación', slug: 'Maquinaria' },
  ],
  [
    { name: 'Vehículos y transporte', slug: 'Vehículos' },
    { name: 'Maquinaria industrial', slug: 'Maquinaria' },
    { name: 'Muebles', slug: 'Hogar' },
    { name: 'Materia prima de telas y textiles', slug: 'Moda' },
    { name: 'Metales y aleaciones', slug: 'Maquinaria' },
    { name: 'Regalos y artesanía', slug: 'Todos' },
    { name: 'Seguridad', slug: 'Tecnología' },
    { name: 'Servicios de fabricación', slug: 'Maquinaria' },
    { name: 'Herramientas y ferretería', slug: 'Maquinaria' },
    { name: 'Artículos para mascotas', slug: 'Todos' },
  ],
  [
    { name: 'Deportes y entretenimiento', slug: 'Deportes' },
    { name: 'Ropa y accesorios', slug: 'Moda' },
    { name: 'Equipos y maquinaria comerciales', slug: 'Maquinaria' },
    { name: 'Equipos y suministros eléctricos', slug: 'Tecnología' },
    { name: 'Medio ambiente', slug: 'Todos' },
    { name: 'Material escolar y de oficina', slug: 'Todos' },
    { name: 'Piezas y accesorios para vehículos', slug: 'Vehículos' },
    { name: 'Belleza', slug: 'Salud' },
    { name: 'Equipaje, bolsos y estuches', slug: 'Moda' },
    { name: 'Instrumentos y equipos de prueba', slug: 'Tecnología' },
    { name: 'Ropa deportiva y de exterior', slug: 'Deportes' },
  ],
  [
    { name: 'Energía renovable', slug: 'Energía' },
    { name: 'Hogar y jardín', slug: 'Hogar' },
    { name: 'Agricultura', slug: 'Todos' },
    { name: 'Electrodomésticos', slug: 'Hogar' },
    { name: 'Construcción e inmobiliaria', slug: 'Hogar' },
    { name: 'Embalaje e impresión', slug: 'Maquinaria' },
    { name: 'Joyas, gafas, relojes y accesorios', slug: 'Moda' },
    { name: 'Caucho y plásticos', slug: 'Maquinaria' },
    { name: 'Transmisión de potencia', slug: 'Maquinaria' },
    { name: 'Cuidado personal y limpieza del hogar', slug: 'Salud' },
  ],
]

export default function ExploreCategoryFilterStrip({
  selectedCategory,
  currentSort,
}: {
  selectedCategory: string
  currentSort: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const pillsContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateScrollState = () => {
    if (pillsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pillsContainerRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const container = pillsContainerRef.current
    if (!container) return
    updateScrollState()
    container.addEventListener('scroll', updateScrollState)
    window.addEventListener('resize', updateScrollState)
    return () => {
      container.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'Todos') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`/explorar?${params.toString()}`)
  }

  const handleSortSelect = (sortKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sortKey)
    router.push(`/explorar?${params.toString()}`)
  }

  const handleScrollLeft = () => {
    pillsContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  }

  const handleScrollRight = () => {
    pillsContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })
  }

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-zinc-900 transition-colors">
      <div className="space-y-3.5 max-w-[1560px] mx-auto">
        {/* Top Category Tabs Strip */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-200/70 dark:border-white/10 text-xs sm:text-sm">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pt-1">
            {TABS.map((tab) => {
              const isActive =
                (tab.slug === 'Todos' && selectedCategory === 'Todos') ||
                selectedCategory.toLowerCase() === tab.slug.toLowerCase()

              return (
                <button
                  key={tab.name}
                  onClick={() => handleCategorySelect(tab.slug)}
                  className={`bg-transparent whitespace-nowrap transition-all relative pb-2 -mb-2 ${
                    isActive
                      ? 'font-bold text-zinc-900 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-black dark:after:bg-white after:rounded-full'
                      : 'font-semibold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {tab.name}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-zinc-300 dark:border-white/20 px-3.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors"
          >
            <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
            {isExpanded ? (
              <ChevronUp className="size-3.5 text-zinc-500" />
            ) : (
              <ChevronDown className="size-3.5 text-zinc-500" />
            )}
          </button>
        </div>

        {/* Bottom Section: Either 4-Column Category Grid OR Tag Pills Row */}
        {isExpanded ? (
          <div className="pt-2 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 max-h-[380px] overflow-y-auto pr-3 text-xs leading-relaxed">
              {EXPANDED_CATEGORIES_COLUMNS.map((column, colIdx) => (
                <div key={colIdx} className="space-y-3">
                  {column.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleCategorySelect(cat.slug)
                        setIsExpanded(false)
                      }}
                      className={`block text-left w-full truncate transition-colors ${
                        cat.isHeader
                          ? 'font-bold text-zinc-900 dark:text-white text-xs'
                          : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white font-normal'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative flex items-center pt-0.5">
            {canScrollLeft && (
              <button
                type="button"
                onClick={handleScrollLeft}
                className="absolute left-0 z-10 flex size-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 shrink-0 shadow-md transition-all cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}

            <div
              ref={pillsContainerRef}
              className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth w-full"
            >
              {TAG_PILLS.map((pill) => {
                const isSelected = currentSort === pill.sortKey

                return (
                  <button
                    key={pill.label}
                    onClick={() => handleSortSelect(pill.sortKey)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs transition-all ${
                      isSelected
                        ? 'bg-white text-zinc-900 border border-zinc-900 dark:bg-zinc-900 dark:text-white dark:border-white font-bold shadow-2xs'
                        : 'bg-[#f3f4f6] text-zinc-700 hover:bg-zinc-200/80 border border-transparent dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20 font-medium'
                    }`}
                  >
                    {pill.label}
                  </button>
                )
              })}
            </div>

            {canScrollRight && (
              <button
                type="button"
                onClick={handleScrollRight}
                className="absolute right-0 z-10 flex size-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 shrink-0 shadow-md transition-all cursor-pointer"
                title="Siguiente"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
