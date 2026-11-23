'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Store, Product, NavLink, CatalogSort } from '../types'
import type { CatalogResolvedSettings } from '../hooks/useCatalogSettings'
import { CatalogDesktopHeader } from './CatalogDesktopHeader'
import { CatalogDesktopHero } from './CatalogDesktopHero'
import {
  CatalogDesktopHomeSections,
  CatalogDesktopHomeBottomSections,
  VisualCategoriesDesktopSection,
  BentoDesktopSection,
  IngredientsDesktopSection,
  UgcDesktopSection,
  RetailersDesktopSection,
  StoryDesktopSection,
  FaqsDesktopSection,
  GarantiasDesktopSection,
} from './CatalogDesktopHomeSections'
import { CatalogDesktopHomeProducts } from './CatalogDesktopHomeProducts'
import {
  CatalogWaterdropEditorialBlocks,
  RitualDesktopSection,
  EditorialLifestyleGridSection,
  PressLogosDesktopSection,
  AmbassadorsDesktopSection,
} from './CatalogWaterdropEditorialBlocks'
import { CatalogDesktopShop } from './CatalogDesktopShop'
import { CatalogDesktopAbout } from './CatalogDesktopAbout'
import { CatalogDesktopProductDetail } from './CatalogDesktopProductDetail'
import { CatalogDesktopFooter } from './CatalogDesktopFooter'

export interface CatalogDesktopViewProps {
  showMobile: boolean
  store: Store
  settings: CatalogResolvedSettings
  activeNavTab: string
  setActiveNavTab: (tab: string) => void
  handleNavbarLinkClick: (link: NavLink) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  setIsCartOpen: (open: boolean) => void
  itemsInCart: number
  total: number
  currentBannerIdx: number
  setCurrentBannerIdx: React.Dispatch<React.SetStateAction<number>>
  handleBannerButtonClick: () => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  filteredProducts: Product[]
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
  cart: Record<string, number>
  changeQtyByKey: (key: string, delta: number) => void
  selectedProduct: Product | null
  setSelectedProduct: (p: Product | null) => void
  productSku: string
  productImages: string[]
  currentDetailImg: string | null
  activeImageIdx: number
  setActiveImageIdx: React.Dispatch<React.SetStateAction<number>>
  selectedOptions: Record<string, string>
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>
  qtyInCart: number
  selectedCartKey: string
  categories: string[]
  categoryCounts: Record<string, number>
  onlyInStock: boolean
  setOnlyInStock: React.Dispatch<React.SetStateAction<boolean>>
  sortBy: CatalogSort
  setSortBy: (sort: CatalogSort) => void
}

export function CatalogDesktopView({
  showMobile,
  store,
  settings,
  activeNavTab,
  setActiveNavTab,
  handleNavbarLinkClick,
  searchQuery,
  setSearchQuery,
  setIsCartOpen,
  itemsInCart,
  total,
  currentBannerIdx,
  setCurrentBannerIdx,
  handleBannerButtonClick,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  viewMode,
  setViewMode,
  cart,
  changeQtyByKey,
  selectedProduct,
  setSelectedProduct,
  productSku,
  productImages,
  currentDetailImg,
  activeImageIdx,
  setActiveImageIdx,
  selectedOptions,
  setSelectedOptions,
  qtyInCart,
  selectedCartKey,
  categories,
  categoryCounts,
  onlyInStock,
  setOnlyInStock,
  sortBy,
  setSortBy,
}: CatalogDesktopViewProps) {
  const {
    colors,
    headerStyle,
    radiusBadge,
    schedule,
    announcement,
    navbarLinks,
    socialsShowInCatalog,
    aiSettings,
    formattedStoreName,
    heroType,
    bannerUrls,
    heroPanels,
    heroStyle,
    radiusCard,
    radiusButton,
    shadowCard,
    heroBadge,
    bannerTitle,
    bannerSubtitle,
    bannerButton,
    heroVideoUrl,
    sections,
    brandStoryPage,
  } = settings

  return (
    <div className={cn('flex flex-col min-h-screen w-full', showMobile ? 'hidden' : 'flex')}>
      {/* Header and rotating promo bar */}
      <CatalogDesktopHeader
        store={store}
        formattedStoreName={formattedStoreName}
        colors={colors}
        headerStyle={headerStyle}
        radiusBadge={radiusBadge}
        schedule={schedule}
        announcement={announcement}
        navbarLinks={navbarLinks}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        handleNavbarLinkClick={handleNavbarLinkClick}
        socialsShowInCatalog={socialsShowInCatalog}
        aiSettings={aiSettings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsCartOpen={setIsCartOpen}
        itemsInCart={itemsInCart}
        total={total}
      />

      {/* SINGLE PRODUCT DETAIL VIEW */}
      {selectedProduct && (
        <CatalogDesktopProductDetail
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          setActiveNavTab={setActiveNavTab}
          productSku={productSku}
          productImages={productImages}
          currentDetailImg={currentDetailImg}
          activeImageIdx={activeImageIdx}
          setActiveImageIdx={setActiveImageIdx}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          qtyInCart={qtyInCart}
          selectedCartKey={selectedCartKey}
          changeQtyByKey={changeQtyByKey}
          cart={cart}
          settings={settings}
          store={store}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* WATERDROP EDITORIAL LANDING FLOW (INICIO) - RENDERED BY DYNAMIC SECTION ORDER */}
      {!selectedProduct && activeNavTab === 'Inicio' && (
        <div className="w-full space-y-4">
          {settings.sectionOrder.map((sectionId: string) => {
            switch (sectionId) {
              case 'hero':
                return sections.banner !== false ? (
                  <CatalogDesktopHero
                    key="hero"
                    heroType={heroType}
                    bannerUrls={bannerUrls}
                    heroPanels={heroPanels}
                    heroStyle={heroStyle}
                    radiusCard={radiusCard}
                    radiusBadge={radiusBadge}
                    radiusButton={radiusButton}
                    shadowCard={shadowCard}
                    colors={colors}
                    heroBadge={heroBadge}
                    bannerTitle={bannerTitle}
                    bannerSubtitle={bannerSubtitle}
                    bannerButton={bannerButton}
                    handleBannerButtonClick={handleBannerButtonClick}
                    heroVideoUrl={heroVideoUrl}
                    currentBannerIdx={currentBannerIdx}
                    setCurrentBannerIdx={setCurrentBannerIdx}
                    store={store}
                  />
                ) : null

              case 'bestsellers':
                return sections.destacados !== false ? (
                  <CatalogDesktopHomeProducts
                    key="bestsellers"
                    allProducts={store.products}
                    settings={settings}
                    cart={cart}
                    changeQtyByKey={changeQtyByKey}
                    setSelectedProduct={setSelectedProduct}
                    onViewAllProducts={cat => {
                      if (cat) setSelectedCategory(cat)
                      setActiveNavTab('Productos')
                    }}
                  />
                ) : null

              case 'visualCategories':
                return (
                  <VisualCategoriesDesktopSection
                    key="visualCategories"
                    settings={settings}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={cat => {
                      setSelectedCategory(cat)
                      setActiveNavTab('Productos')
                    }}
                  />
                )

              case 'bentoHighlights':
                return <BentoDesktopSection key="bentoHighlights" settings={settings} />

              case 'ritual':
                return <RitualDesktopSection key="ritual" settings={settings} />

              case 'lifestyleGallery':
                return (
                  <EditorialLifestyleGridSection
                    key="lifestyleGallery"
                    allProducts={store.products}
                    settings={settings}
                    cart={cart}
                    changeQtyByKey={changeQtyByKey}
                    setSelectedProduct={setSelectedProduct}
                  />
                )

              case 'ingredientsSection':
                return <IngredientsDesktopSection key="ingredientsSection" settings={settings} />

              case 'ugc':
                return <UgcDesktopSection key="ugc" settings={settings} />

              case 'pressLogos':
                return <PressLogosDesktopSection key="pressLogos" settings={settings} />

              case 'ambassadors':
                return <AmbassadorsDesktopSection key="ambassadors" settings={settings} />

              case 'retailers':
                return <RetailersDesktopSection key="retailers" settings={settings} store={store} />

              case 'faqs':
                return <FaqsDesktopSection key="faqs" settings={settings} />

              case 'garantias':
                return <GarantiasDesktopSection key="garantias" settings={settings} />

              case 'story':
                return <StoryDesktopSection key="story" settings={settings} />

              default:
                return null
            }
          })}
        </div>
      )}

      {/* FULL SHOP CATALOG VIEW */}
      {!selectedProduct && activeNavTab === 'Productos' && (
        <CatalogDesktopShop
          store={store}
          settings={settings}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          onlyInStock={onlyInStock}
          setOnlyInStock={setOnlyInStock}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filteredProducts={filteredProducts}
          viewMode={viewMode}
          setViewMode={setViewMode}
          cart={cart}
          changeQtyByKey={changeQtyByKey}
          setSelectedProduct={setSelectedProduct}
        />
      )}

      {/* BRAND STORY ABOUT VIEW */}
      {!selectedProduct && activeNavTab === 'Historia' && (
        <CatalogDesktopAbout brandStoryPage={brandStoryPage} />
      )}

      {/* WATERDROP CLEAN WHITE EDITORIAL FOOTER */}
      <CatalogDesktopFooter
        store={store}
        settings={settings}
        setSelectedProduct={setSelectedProduct}
        setActiveNavTab={setActiveNavTab}
      />
    </div>
  )
}
