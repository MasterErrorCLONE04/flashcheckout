'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Search, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/components/ExploreData'
import type { ExploreStore } from '@/components/ExploreTypes'

export default function ExploreStoreCardV2({ store }: { store: ExploreStore }) {
  const [isLiked, setIsLiked] = useState(false)
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0)

  // Safely extract store settings configured by the user/vendor
  const settings = (store.settings as Record<string, any>) || {}

  const location = settings.location || 'Zhejiang, CN'
  const yearsActive = settings.yearsActive || (store.verificationLevel > 0 ? `${store.verificationLevel + 5} años` : '8 años')
  const staffCount = settings.staffCount || '50+ personal'
  const factoryArea = settings.factoryArea || '11,000+ m²'
  const revenueStat = settings.revenueStat || 'COP67 M+'
  const rating = settings.rating || 5.0
  const reviewCount = settings.reviewCount || (store.products.length > 0 ? store.products.length * 2 : 6)
  
  const capabilities: string[] = Array.isArray(settings.capabilities) && settings.capabilities.length > 0
    ? settings.capabilities
    : ['Personalización completa', 'Servicio ODM disponible', 'Experiencia en exportación global']

  const certifications: string[] = Array.isArray(settings.certifications) && settings.certifications.length > 0
    ? settings.certifications
    : ['UK CA', 'CE']

  const defaultGallery = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  ]

  const factoryGallery: string[] = Array.isArray(settings.factoryGallery) && settings.factoryGallery.length > 0
    ? settings.factoryGallery
    : defaultGallery

  const isVerified = store.verificationLevel > 0 || store.whatsappVerified

  const handleNextGallery = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentGalleryIdx((prev) => (prev + 1) % factoryGallery.length)
  }

  const handlePrevGallery = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentGalleryIdx((prev) => (prev - 1 + factoryGallery.length) % factoryGallery.length)
  }

  // Fallback high-res Unsplash product placeholders if store has no products or broken image
  const fallbackProductImages = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
  ]

  // Showcase 3 products
  const showcaseProducts = Array.from({ length: 3 }).map((_, idx) => {
    const prod = store.products[idx]
    return {
      id: prod?.id || `demo-${idx}`,
      name: prod?.name || `Producto Destacado ${idx + 1}`,
      price: prod?.price || (25000 + idx * 4000),
      imageUrl: prod?.imageUrl || fallbackProductImages[idx % fallbackProductImages.length],
    }
  })

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
      
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-white/5">
        
        {/* Left: Logo & Store Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="size-12 rounded-lg border border-zinc-200/80 bg-white p-1 shadow-2xs shrink-0 overflow-hidden dark:border-white/10 dark:bg-zinc-800 flex items-center justify-center">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  // Fallback if logo URL fails
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="h-full w-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-200">
                {store.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/tienda/${store.slug}`}
                className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white hover:underline truncate"
              >
                {store.name}
              </Link>
              <span className="text-xs text-zinc-500 font-medium shrink-0 flex items-center gap-1">
                {location}
              </span>
            </div>

            {/* Verified & Stats Sub-line */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              {isVerified && (
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="size-3.5 fill-blue-600 text-white" /> Verified
                </span>
              )}
              <span>•</span>
              <span>{yearsActive}</span>
              <span>•</span>
              <span>{staffCount}</span>
              <span>•</span>
              <span>{factoryArea}</span>
              <span>•</span>
              <span>{revenueStat}</span>
            </div>
          </div>
        </div>

        {/* Right: Heart & Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className="size-8 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
            title="Guardar tienda"
          >
            <Heart className={`size-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          <Link
            href={`/tienda/${store.slug}?action=chat`}
            className="rounded-full border border-zinc-300 dark:border-white/20 px-4 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors"
          >
            Chatear ahora
          </Link>

          <Link
            href={`/tienda/${store.slug}?action=contact`}
            className="rounded-full border border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950 px-4 py-1.5 text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            Contáctanos
          </Link>
        </div>

      </div>

      {/* 2. Main Body: 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-stretch">
        
        {/* Column 1: Ratings & Factory Capabilities (3 Cols) */}
        <div className="lg:col-span-3 space-y-4 text-xs">
          {/* Ratings */}
          <div className="space-y-1">
            <h4 className="font-semibold text-zinc-500 dark:text-zinc-400">Calificaciones y opiniones</h4>
            <p className="font-bold text-zinc-900 dark:text-white text-sm">
              {Number(rating).toFixed(1)}/5{' '}
              <Link href={`/tienda/${store.slug}`} className="font-normal text-zinc-500 underline hover:text-black dark:hover:text-white">
                ({reviewCount} reseñas)
              </Link>
            </p>
          </div>

          {/* Capabilities */}
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-500 dark:text-zinc-400">Capacidades de la fábrica</h4>
            <ul className="space-y-1.5 font-bold text-zinc-800 dark:text-zinc-200">
              {capabilities.map((cap, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-zinc-400 font-bold">•</span> {cap}
                </li>
              ))}
              {certifications.length > 0 && (
                <li className="flex items-center gap-1 font-normal text-zinc-600 dark:text-zinc-400 pt-0.5">
                  <span className="text-zinc-400 font-bold">•</span> Certificaciones:{' '}
                  {certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center font-bold text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                    >
                      {cert}
                    </span>
                  ))}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Column 2: 3 Product Thumbnails Grid (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-3">
          {showcaseProducts.map((product, idx) => (
            <Link
              key={product.id}
              href={product.id.startsWith('demo') ? `/tienda/${store.slug}` : `/producto/${product.id}`}
              className="group/prod flex flex-col space-y-2"
            >
              {/* Product Image Box */}
              <div className="aspect-square rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-white/5 relative overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover/prod:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to Unsplash placeholder if product image breaks
                    e.currentTarget.src = fallbackProductImages[idx % fallbackProductImages.length]
                  }}
                />
                {/* Search by image button overlay */}
                <button
                  type="button"
                  className="absolute bottom-2 left-2 size-6 rounded-md bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 shadow-xs flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-white cursor-pointer"
                  title="Buscar productos similares"
                >
                  <Search className="size-3" />
                </button>
              </div>

              {/* Product Price & MOQ */}
              <div className="space-y-0.5">
                <p className="font-extrabold text-xs text-zinc-900 dark:text-white leading-tight">
                  {formatCurrency(product.price)} - {formatCurrency(product.price * 3)}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Pedido mínimo: 1 pieza: 1 unidad
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Column 3: Workshop / Gallery Banner (4 Cols) */}
        <div className="lg:col-span-4 rounded-xl overflow-hidden relative bg-zinc-900 group/gallery h-48 sm:h-auto min-h-[180px]">
          <img
            src={factoryGallery[currentGalleryIdx % factoryGallery.length]}
            alt="Fábrica y taller"
            className="h-full w-full object-cover transition-transform duration-500 group-hover/gallery:scale-105"
            onError={(e) => {
              e.currentTarget.src = defaultGallery[0]
            }}
          />

          {/* Left / Right Chevron Controls */}
          {factoryGallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevGallery}
                className="absolute left-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextGallery}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          {/* Bottom Count Badge */}
          <div className="absolute bottom-3 right-3 bg-blue-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <span>🖼</span>
            <span>{currentGalleryIdx + 1}/{factoryGallery.length || 40}</span>
          </div>
        </div>

      </div>

    </article>
  )
}
