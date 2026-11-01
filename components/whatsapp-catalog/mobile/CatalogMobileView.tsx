'use client'

import React from 'react'
import { cn } from "@/lib/utils"
import { Store, Product } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { MobileHeader } from './MobileHeader'
import { MobileHero } from './MobileHero'
import { MobileProductFeed } from './MobileProductFeed'
import { MobileSections } from './MobileSections'
import { MobileFooter } from './MobileFooter'

export interface CatalogMobileViewProps {
  showMobile: boolean
  store: Store
  settings: CatalogResolvedSettings
  activeNavTab: string
  itemsInCart: number
  total: number
  setIsMobileMenuOpen: (open: boolean) => void
  handleMobileTabClick: (tab: string) => void
  currentBannerIdx: number
  setCurrentBannerIdx: React.Dispatch<React.SetStateAction<number>>
  handleBannerButtonClick: () => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>
  setIsFilterOpen: (open: boolean) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  filteredProducts: Product[]
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  setSelectedProduct: (p: Product) => void
  device?: string
  activeMobileTab: string
}

export function CatalogMobileView({
  showMobile,
  store,
  settings,
  activeNavTab,
  itemsInCart,
  total,
  setIsMobileMenuOpen,
  handleMobileTabClick,
  currentBannerIdx,
  setCurrentBannerIdx,
  handleBannerButtonClick,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  setIsFilterOpen,
  viewMode,
  setViewMode,
  filteredProducts,
  cart,
  changeQtyByKey,
  setSelectedProduct,
  device,
  activeMobileTab
}: CatalogMobileViewProps) {
  const {
    formattedStoreName,
    announcement,
    schedule,
    heroType,
    bannerUrls,
    heroVideoUrl,
    bannerTitle,
    bannerSubtitle,
    bannerButton,
    colors,
    heroBadge,
    sections,
    socialsShowInCatalog,
    aiSettings
  } = settings

  return (
    <div className={cn("flex flex-col min-h-screen pb-20 w-full", showMobile ? "flex" : "hidden")}>
      {/* Mobile Top Header & Announcement */}
      <MobileHeader
        store={store}
        formattedStoreName={formattedStoreName}
        announcement={announcement}
        schedule={schedule}
        itemsInCart={itemsInCart}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleMobileTabClick={handleMobileTabClick}
      />

      {/* Mobile Main Body */}
      <main className="flex-1 px-4 py-4 space-y-6">
        {/* Banner principal (Mobile) */}
        {activeNavTab === 'Inicio' && sections.banner !== false && (
          <MobileHero
            heroType={heroType}
            bannerUrls={bannerUrls}
            heroVideoUrl={heroVideoUrl}
            currentBannerIdx={currentBannerIdx}
            setCurrentBannerIdx={setCurrentBannerIdx}
            bannerTitle={bannerTitle}
            bannerSubtitle={bannerSubtitle}
            bannerButton={bannerButton}
            handleBannerButtonClick={handleBannerButtonClick}
            colors={colors}
            heroBadge={heroBadge}
            store={store}
          />
        )}

        {/* Mobile Product Feed with Search, Filter & Switcher */}
        <MobileProductFeed
          settings={settings}
          total={total}
          activeNavTab={activeNavTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
          setIsFilterOpen={setIsFilterOpen}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredProducts={filteredProducts}
          cart={cart}
          changeQtyByKey={changeQtyByKey}
          setSelectedProduct={setSelectedProduct}
        />

        {/* Extra sections on Inicio & Historia */}
        <MobileSections
          settings={settings}
          activeNavTab={activeNavTab}
        />

        {/* Footer */}
        <MobileFooter
          activeNavTab={activeNavTab}
          formattedStoreName={formattedStoreName}
          socialsShowInCatalog={socialsShowInCatalog}
          aiSettings={aiSettings}
          device={device}
          activeMobileTab={activeMobileTab}
          handleMobileTabClick={handleMobileTabClick}
          itemsInCart={itemsInCart}
        />
      </main>
    </div>
  )
}
