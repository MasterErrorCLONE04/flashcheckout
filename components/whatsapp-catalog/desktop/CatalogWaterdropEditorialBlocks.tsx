'use client'

import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { CatalogProductCard } from '../common/CatalogProductCard'

export interface CatalogWaterdropEditorialBlocksProps {
  allProducts: Product[]
  settings: CatalogResolvedSettings
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  setSelectedProduct: (p: Product) => void
}

const FALLBACK_EDITORIAL_LIFESTYLE = [
  'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=85',
]

export function CatalogWaterdropEditorialBlocks({
  allProducts,
  settings,
  cart,
  changeQtyByKey,
  setSelectedProduct,
}: CatalogWaterdropEditorialBlocksProps) {
  const {
    colors,
    cardStyle,
    showVariantSwatches,
    radiusCard,
    radiusImage,
    radiusButton,
    cardBgStyle,
    shadowCard,
    cardAspectRatio,
    getBadgeStyle,
    sections,
    processTimeline,
    lifestyleGallery,
    visualCategories,
    pressLogos,
    ambassadors,
  } = settings

  const [ambassadorOffset, setAmbassadorOffset] = useState(0)

  // Build up to 2 category showcases for Waterdrop's 4x2 Mixed Editorial Checkerboard Grids
  const editorialShowcases = useMemo(() => {
    const categories = Array.from(
      new Set(allProducts.map(p => (p.category || '').trim()).filter(Boolean))
    )

    const rawPhotos = [
      ...lifestyleGallery,
      ...visualCategories.map(v => v.imageUrl),
      ...processTimeline.items.map(i => i.imageUrl || ''),
      ...FALLBACK_EDITORIAL_LIFESTYLE,
    ].filter(Boolean)

    const uniquePhotos = Array.from(new Set(rawPhotos))

    if (categories.length >= 2) {
      const splitAt = Math.ceil(categories.length / 2)
      const firstGroupCats = categories.slice(0, splitAt)
      const secondGroupCats = categories.slice(splitAt)
      return [
        {
          id: 'showcase-1',
          mainTitle: firstGroupCats[0],
          tabs: firstGroupCats,
          photos: uniquePhotos.slice(0, 4),
        },
        {
          id: 'showcase-2',
          mainTitle: secondGroupCats[0],
          tabs: secondGroupCats,
          photos:
            uniquePhotos.slice(2, 6).length >= 4
              ? uniquePhotos.slice(2, 6)
              : uniquePhotos.slice(0, 4).reverse(),
        },
      ]
    }

    return [
      {
        id: 'showcase-main',
        mainTitle: categories[0] || 'Colección Destacada',
        tabs: categories.length > 0 ? categories : ['Favoritos'],
        photos: uniquePhotos.slice(0, 4),
      },
    ]
  }, [allProducts, lifestyleGallery, visualCategories, processTimeline.items])

  const [activeShowcaseTabs, setActiveShowcaseTabs] = useState<Record<string, string>>({})

  const maxAmbassadorOffset = Math.max(0, ambassadors.items.length - 4)

  return (
    <div className="w-full space-y-24 pt-14">
      {/* 1. WATERDROP EDITORIAL VALUE STATEMENT + 3-PHOTO RITUAL ("Water · Drop · Enjoy") */}
      {sections.processTimeline && processTimeline.items.length > 0 && (
        <section
          data-maker-section="ritual"
          data-maker-title="Ritual Editorial (3 Pasos)"
          className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none cursor-pointer"
        >
          <div className="max-w-[820px] mb-10">
            <h2
              className="text-[26px] sm:text-[34px] xl:text-[40px] font-extrabold tracking-[-0.036em] leading-[1.12]"
              style={{ color: colors.texto }}
            >
              {processTimeline.headline || processTimeline.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {processTimeline.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="group flex flex-col space-y-4">
                <div className="relative aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-[#F6F6F4]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-5xl font-black opacity-15"
                      style={{ color: colors.primario }}
                    >
                      {item.step}
                    </div>
                  )}
                </div>
                <div className="space-y-1 pr-4">
                  <h3
                    className="font-extrabold text-[15.5px] tracking-[-0.02em]"
                    style={{ color: colors.texto }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[13px] font-normal text-zinc-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. WATERDROP 4x2 MIXED EDITORIAL CATEGORY GRIDS (Uniform aspect-[3/4] Plinth + Lifestyle Checkerboard) */}
      {sections.editorialCategories !== false &&
        allProducts.length > 0 &&
        editorialShowcases.map((showcase, sIdx) => {
          const selectedTab = activeShowcaseTabs[showcase.id] || 'Todos'
          const pool =
            selectedTab === 'Todos'
              ? allProducts.filter(p => showcase.tabs.includes((p.category || '').trim()))
              : allProducts.filter(p => (p.category || '').trim() === selectedTab)

          const sourcePool = pool.length > 0 ? pool : allProducts
          // Pad up to 4 products if store has fewer than 4 items in category so the 4x2 checkerboard stays symmetrical
          const productsToMix: Product[] = []
          for (let i = 0; i < Math.min(4, Math.max(sourcePool.length, 2)); i++) {
            productsToMix.push(sourcePool[i % sourcePool.length])
          }

          const photos = showcase.photos

          // Exact Waterdrop 8-slot architectural checkerboard:
          // Row 1: [Product 0, Photo 0, Product 1, Photo 1]
          // Row 2: [Photo 2, Product 2, Photo 3, Product 3]
          const mixedCells: Array<
            { type: 'product'; product: Product; idx: number } | { type: 'photo'; url: string }
          > = []

          if (productsToMix[0])
            mixedCells.push({ type: 'product', product: productsToMix[0], idx: 0 })
          if (photos[0]) mixedCells.push({ type: 'photo', url: photos[0] })
          if (productsToMix[1])
            mixedCells.push({ type: 'product', product: productsToMix[1], idx: 1 })
          if (photos[1] || photos[0])
            mixedCells.push({ type: 'photo', url: photos[1] || photos[0] })

          if (productsToMix.length >= 3) {
            mixedCells.push({ type: 'photo', url: photos[2] || photos[0] })
            mixedCells.push({ type: 'product', product: productsToMix[2], idx: 2 })
            mixedCells.push({ type: 'photo', url: photos[3] || photos[1] || photos[0] })
            if (productsToMix[3]) {
              mixedCells.push({ type: 'product', product: productsToMix[3], idx: 3 })
            }
          }

          return (
            <section
              key={showcase.id}
              data-maker-section="bestsellers"
              data-maker-title="Cuadrícula Mixta Editorial"
              className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none cursor-pointer"
            >
              {/* Seamless Baseline Sub-category Tabs */}
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mb-7">
                <button
                  type="button"
                  onClick={() =>
                    setActiveShowcaseTabs(prev => ({ ...prev, [showcase.id]: 'Todos' }))
                  }
                  className={cn(
                    'bg-transparent border-0 p-0 pb-1.5 cursor-pointer text-[19px] sm:text-[22px] tracking-[-0.025em] border-b-2 transition-all',
                    selectedTab === 'Todos'
                      ? 'font-extrabold opacity-100'
                      : 'font-normal opacity-42 hover:opacity-85 border-transparent'
                  )}
                  style={{
                    color: colors.texto,
                    borderColor: selectedTab === 'Todos' ? colors.texto : 'transparent',
                  }}
                >
                  {sIdx === 0 ? showcase.mainTitle : `Esenciales · ${showcase.mainTitle}`}
                </button>

                {showcase.tabs.length > 1 &&
                  showcase.tabs.map(t => {
                    const active = selectedTab === t
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setActiveShowcaseTabs(prev => ({ ...prev, [showcase.id]: t }))
                        }
                        className={cn(
                          'bg-transparent border-0 p-0 pb-1.5 text-[18px] sm:text-[20px] tracking-[-0.02em] cursor-pointer border-b-2 transition-all',
                          active
                            ? 'font-extrabold opacity-100'
                            : 'font-normal opacity-42 hover:opacity-85 border-transparent'
                        )}
                        style={{
                          color: colors.texto,
                          borderColor: active ? colors.texto : 'transparent',
                        }}
                      >
                        {t}
                      </button>
                    )
                  })}
              </div>

              {/* Laser-Aligned 4x2 Architectural Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                {mixedCells.map((cell, cIdx) => {
                  if (cell.type === 'product') {
                    return (
                      <CatalogProductCard
                        key={`${showcase.id}-p-${cell.product.id}-${cIdx}`}
                        product={cell.product}
                        index={cell.idx + 3}
                        variant="plinth"
                        cart={cart}
                        changeQtyByKey={changeQtyByKey}
                        setSelectedProduct={setSelectedProduct}
                        colors={colors}
                        cardStyle={cardStyle}
                        showVariantSwatches={showVariantSwatches}
                        radiusCard={radiusCard}
                        radiusImage={radiusImage}
                        radiusButton={radiusButton}
                        cardBgStyle={cardBgStyle}
                        shadowCard={shadowCard}
                        cardAspectRatio={cardAspectRatio}
                        getBadgeStyle={getBadgeStyle}
                        viewMode="grid"
                      />
                    )
                  }

                  return (
                    <div
                      key={`${showcase.id}-img-${cIdx}`}
                      className="relative aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-[#F6F6F4] group"
                    >
                      <img
                        src={cell.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

      {/* 3. MONOCHROME PRESS & OFFICIAL EMBLEM BAR */}
      {sections.pressLogos && pressLogos.length > 0 && (
        <section
          data-maker-section="ugc"
          data-maker-title="Mural de Prensa & Avales"
          className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 select-none cursor-pointer"
        >
          <div className="py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center justify-items-center">
            {pressLogos.slice(0, 5).map((logo, idx) => {
              // Varied typographic emblem styling so monochrome marks look like distinct editorial mastheads
              const mastheadClass =
                idx === 0
                  ? 'font-serif italic text-xl sm:text-2xl font-bold tracking-[0.04em]'
                  : idx === 1
                    ? 'font-black text-xl sm:text-2xl tracking-[-0.06em]'
                    : idx === 2
                      ? 'font-extrabold text-2xl sm:text-[26px] tracking-[-0.04em]'
                      : idx === 3
                        ? 'font-black italic text-lg sm:text-xl tracking-[0.14em]'
                        : 'font-extrabold text-base sm:text-lg tracking-[0.22em] border-[1.5px] border-current px-2.5 py-0.5 rounded-[2px]'

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center opacity-80 hover:opacity-100 transition-opacity"
                >
                  {logo.imageUrl ? (
                    <img
                      src={logo.imageUrl}
                      alt={logo.name}
                      className="h-8 object-contain grayscale"
                    />
                  ) : (
                    <span
                      className={cn('uppercase leading-none', mastheadClass)}
                      style={{ color: colors.texto }}
                    >
                      {logo.name}
                    </span>
                  )}
                  {logo.subtitle && (
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.18em] mt-1.5">
                      {logo.subtitle}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 4. RECOMMENDED BY TOP PERFORMERS / AMBASSADORS CAROUSEL */}
      {sections.ambassadors && ambassadors.items.length > 0 && (
        <section
          data-maker-section="ugc"
          data-maker-title="Embajadores & Atletas"
          className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none cursor-pointer"
        >
          <div className="mb-7 space-y-1">
            <h2
              className="text-[22px] sm:text-[28px] font-extrabold tracking-[-0.03em]"
              style={{ color: colors.texto }}
            >
              {ambassadors.title}
            </h2>
            {ambassadors.subtitle && (
              <p className="text-[13px] font-normal text-zinc-500">{ambassadors.subtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {ambassadors.items
              .slice(ambassadorOffset, ambassadorOffset + 4)
              .map((person, idx) => (
                <div key={idx} className="group space-y-3">
                  <div className="relative aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-[#F6F6F4]">
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span
                      className="text-[13.5px] font-bold block tracking-[-0.015em]"
                      style={{ color: colors.texto }}
                    >
                      {person.name}
                    </span>
                    {person.role && (
                      <span className="text-xs font-normal text-zinc-500 block">
                        {person.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 flex items-center gap-2.5">
            <button
              type="button"
              disabled={ambassadorOffset <= 0}
              onClick={() => setAmbassadorOffset(p => Math.max(0, p - 1))}
              className={cn(
                'w-10 h-10 rounded-full border flex items-center justify-center bg-transparent transition-all',
                ambassadorOffset <= 0
                  ? 'border-zinc-200 text-zinc-300 cursor-default'
                  : 'border-zinc-300 hover:border-zinc-950 text-zinc-900 cursor-pointer'
              )}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.7]" />
            </button>
            <button
              type="button"
              disabled={ambassadorOffset >= maxAmbassadorOffset}
              onClick={() =>
                setAmbassadorOffset(p => Math.min(maxAmbassadorOffset, p + 1))
              }
              className={cn(
                'w-10 h-10 rounded-full border flex items-center justify-center bg-transparent transition-all',
                ambassadorOffset >= maxAmbassadorOffset
                  ? 'border-zinc-200 text-zinc-300 cursor-default'
                  : 'border-zinc-300 hover:border-zinc-950 text-zinc-900 cursor-pointer'
              )}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.7]" />
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
