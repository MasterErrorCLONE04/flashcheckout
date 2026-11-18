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

export function RitualDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { colors, sections, processTimeline } = settings
  if (!sections.processTimeline || !processTimeline.items?.length) return null

  return (
    <section
      data-maker-section="ritual"
      data-maker-title="Ritual Editorial (3 Pasos)"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none pt-16"
    >
      <div className="max-w-[820px] mb-10">
        <h2
          data-maker-field="processTimeline.headline"
          data-maker-label="Titular Ritual (3 Pasos)"
          className="text-[26px] sm:text-[34px] xl:text-[40px] font-extrabold tracking-[-0.036em] leading-[1.12]"
          style={{ color: colors.texto }}
        >
          {processTimeline.headline || processTimeline.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {processTimeline.items.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            data-maker-field={`processTimeline.items.${idx}`}
            data-maker-label={`Paso #${idx + 1}: ${item.title}`}
            className="group flex flex-col space-y-4"
          >
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
  )
}

export function EditorialLifestyleGridSection({
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
    lifestyleGallery,
    visualCategories,
    processTimeline,
  } = settings

  const [activeShowcaseTabs, setActiveShowcaseTabs] = useState<Record<string, string>>({})

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
          groupName: firstGroupCats[0] || 'Colección Destacada',
          tabs: firstGroupCats,
          photos: [
            uniquePhotos[0] || FALLBACK_EDITORIAL_LIFESTYLE[0],
            uniquePhotos[1] || FALLBACK_EDITORIAL_LIFESTYLE[1],
          ],
        },
        {
          groupName: secondGroupCats[0] || 'Edición Especial',
          tabs: secondGroupCats,
          photos: [
            uniquePhotos[2] || FALLBACK_EDITORIAL_LIFESTYLE[2],
            uniquePhotos[3] || FALLBACK_EDITORIAL_LIFESTYLE[3],
          ],
        },
      ]
    }

    return [
      {
        groupName: categories[0] || 'Colección Principal',
        tabs: categories,
        photos: [
          uniquePhotos[0] || FALLBACK_EDITORIAL_LIFESTYLE[0],
          uniquePhotos[1] || FALLBACK_EDITORIAL_LIFESTYLE[1],
        ],
      },
    ]
  }, [allProducts, lifestyleGallery, visualCategories, processTimeline])

  if (sections.editorialCategories === false || editorialShowcases.length === 0) return null

  return (
    <div
      data-maker-section="lifestyleGallery"
      data-maker-title="Galería Lifestyle & Checkerboard"
      className="w-full space-y-20 pt-16"
    >
      {editorialShowcases.map((showcase, showcaseIdx) => {
        const activeTab = activeShowcaseTabs[showcase.groupName] || showcase.tabs[0] || ''
        const tabProducts = allProducts.filter(
          p => (p.category || '').trim().toLowerCase() === activeTab.toLowerCase()
        )
        const productsToDisplay = tabProducts.slice(0, 6)
        if (productsToDisplay.length === 0) return null

        return (
          <section
            key={showcaseIdx}
            className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <h2
                className="text-[22px] sm:text-[28px] xl:text-[32px] font-extrabold tracking-[-0.03em]"
                style={{ color: colors.texto }}
              >
                {activeTab}
              </h2>

              {showcase.tabs.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {showcase.tabs.map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() =>
                        setActiveShowcaseTabs(p => ({ ...p, [showcase.groupName]: tab }))
                      }
                      className={cn(
                        'h-9 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border',
                        activeTab === tab
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-[#F6F6F4] text-[#71717A] border-transparent hover:text-[#111111]'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {productsToDisplay.slice(0, 3).map(product => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
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
                  cart={cart}
                  changeQtyByKey={changeQtyByKey}
                  setSelectedProduct={setSelectedProduct}
                />
              ))}

              <div className="aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-[#F6F6F4] relative group">
                <img
                  src={showcase.photos[0]}
                  alt={showcase.groupName}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>

              <div className="aspect-[3/4] w-full rounded-[4px] overflow-hidden bg-[#F6F6F4] relative group">
                <img
                  src={showcase.photos[1]}
                  alt={showcase.groupName}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>

              {productsToDisplay.slice(3, 6).map(product => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
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
                  cart={cart}
                  changeQtyByKey={changeQtyByKey}
                  setSelectedProduct={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function PressLogosDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { colors, sections, pressLogos } = settings
  if (!sections.pressLogos || !pressLogos.length) return null

  return (
    <section
      data-maker-section="pressLogos"
      data-maker-title="Barra de Prensa & Sellos"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 select-none pt-16"
    >
      <div className="py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center justify-items-center">
        {pressLogos.slice(0, 5).map((logo, idx) => {
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
              data-maker-field={`pressLogos.${idx}`}
              data-maker-label={`Sello de Prensa: ${logo.name}`}
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
  )
}

export function AmbassadorsDesktopSection({ settings }: { settings: CatalogResolvedSettings }) {
  const { colors, sections, ambassadors } = settings
  const [ambassadorOffset, setAmbassadorOffset] = useState(0)

  if (!sections.ambassadors || !ambassadors.items?.length) return null
  const maxAmbassadorOffset = Math.max(0, ambassadors.items.length - 4)

  return (
    <section
      data-maker-section="ambassadors"
      data-maker-title="Embajadores & Atletas"
      className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 text-left select-none pt-16"
    >
      <div className="mb-7 space-y-1">
        <h2
          data-maker-field="ambassadors.title"
          data-maker-label="Título Embajadores"
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
            <div
              key={idx}
              data-maker-field={`ambassadors.items.${ambassadorOffset + idx}`}
              data-maker-label={`Embajador: ${person.name}`}
              className="group space-y-3"
            >
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
  )
}

export function CatalogWaterdropEditorialBlocks(props: CatalogWaterdropEditorialBlocksProps) {
  return (
    <div className="w-full space-y-16">
      <RitualDesktopSection settings={props.settings} />
      <EditorialLifestyleGridSection {...props} />
      <PressLogosDesktopSection settings={props.settings} />
      <AmbassadorsDesktopSection settings={props.settings} />
    </div>
  )
}
