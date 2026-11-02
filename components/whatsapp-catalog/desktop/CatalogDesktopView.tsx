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
} from './CatalogDesktopHomeSections'
import { CatalogDesktopHomeProducts } from './CatalogDesktopHomeProducts'
import { CatalogWaterdropEditorialBlocks } from './CatalogWaterdropEditorialBlocks'
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

      {/* WATERDROP EDITORIAL LANDING FLOW (INICIO) */}
      {!selectedProduct && activeNavTab === 'Inicio' && (
        <>
          {sections.banner !== false && (
            <CatalogDesktopHero
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
          )}

          {/* Section 1: Explore our Bestsellers Tabbed Carousel */}
          <CatalogDesktopHomeProducts
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

          {/* Optional extra modules (Visual Categories, Bento, Ingredients) */}
          <CatalogDesktopHomeSections
            settings={settings}
            selectedCategory={selectedCategory}
            setSelectedCategory={cat => {
              setSelectedCategory(cat)
              setActiveNavTab('Productos')
            }}
          />

          {/* Sections 2, 3, 4, 5: 3-Photo Ritual + 4x2 Mixed Editorial Grids + Press Logos + Ambassadors */}
          <CatalogWaterdropEditorialBlocks
            allProducts={store.products}
            settings={settings}
            cart={cart}
            changeQtyByKey={changeQtyByKey}
            setSelectedProduct={setSelectedProduct}
          />

          {/* Sections 6, 7, 8, 9: Centered Stars & Staggered UGC Wall + Retailers + FAQ + 3-Col Pre-Footer Strip */}
          <CatalogDesktopHomeBottomSections settings={settings} store={store} />
        </>
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
