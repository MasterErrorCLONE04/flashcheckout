'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import {
  Store,
  Product,
  CatalogSort,
  NavLink,
  getCartKey,
  normalizeProductOptions,
  useCatalogCart,
  useCatalogSettings,
  CatalogDesktopView,
  CatalogMobileView,
  CartCheckoutDrawer,
  ProductDetailDrawer,
  MobileMenuDrawer,
  MobileFilterDrawer,
  FloatingWhatsAppButton
} from './whatsapp-catalog'

export interface WhatsAppCatalogProps {
  store: Store
  initialPhone?: string
  initialCart?: Record<string, number>
  initialName?: string
  initialAddress?: string
  device?: 'escritorio' | 'tablet' | 'movil'
}

export default function WhatsAppCatalog({
  store,
  initialPhone,
  initialCart = {},
  initialName = '',
  initialAddress = '',
  device
}: WhatsAppCatalogProps) {
  // Config & Styles Hook
  const settings = useCatalogSettings(store)
  const {
    colors,
    resolvedFontFamily,
    bannerUrls,
    bannerButton,
    navbarLinks,
    formattedStoreName,
    sections,
    floatingWhatsApp
  } = settings

  // Cart & Order Hook
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    form,
    setForm,
    itemsInCart,
    total,
    cartProducts,
    changeQtyByKey,
    loadingAction,
    isSuccess,
    handleWhatsAppOrder,
    handleCardPayment
  } = useCatalogCart({
    store,
    initialCart,
    initialPhone,
    initialName,
    initialAddress
  })

  // Catalog State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [activeMobileTab, setActiveMobileTab] = useState('inicio')
  const [activeNavTab, setActiveNavTab] = useState('Inicio')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<CatalogSort>('default')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobile, setIsMobile] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // Responsive device view check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const showMobile = device ? (device === 'movil' || device === 'tablet') : isMobile

  // Auto slide banner
  useEffect(() => {
    if (bannerUrls.length <= 1) return
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % bannerUrls.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [bannerUrls.length])

  // Reset image and options on product selection
  useEffect(() => {
    setActiveImageIdx(0)
    if (selectedProduct) {
      const parsedOpts = normalizeProductOptions(selectedProduct.options)
      const defaults: Record<string, string> = {}
      parsedOpts.forEach(opt => {
        if (opt.values.length > 0) {
          defaults[opt.name] = opt.values[0]
        }
      })
      setSelectedOptions(defaults)
    } else {
      setSelectedOptions({})
    }
  }, [selectedProduct])

  // Synchronize cart modal status with active navigation tab in mobile
  useEffect(() => {
    if (isCartOpen) {
      setActiveMobileTab('carrito')
    } else if (activeMobileTab === 'carrito') {
      setActiveMobileTab('inicio')
    }
  }, [isCartOpen, activeMobileTab])

  // Handle browser back button
  useEffect(() => {
    window.history.pushState({ page: 'catalog' }, '')

    const handlePopState = () => {
      if (isCartOpen) {
        setIsCartOpen(false)
        window.history.pushState({ page: 'catalog' }, '')
      } else {
        const link = document.createElement('a')
        link.href = 'whatsapp://'
        link.click()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isCartOpen, setIsCartOpen])

  // Categories
  const categories = ['Todos', ...Array.from(new Set(store.products.map(p => p.category || 'Varios')))]

  // Dynamic product count per category
  const categoryCounts = store.products.reduce((acc, p) => {
    const cat = p.category || 'Varios'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Product filtering & sorting
  const filteredProducts = store.products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'Todos' || (p.category || 'Varios') === selectedCategory
      const matchesStock = !onlyInStock || p.stock > 0
      return matchesSearch && matchesCategory && matchesStock
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      return 0
    })

  // Navigation handlers
  const handleNavbarLinkClick = (item: NavLink) => {
    setSelectedProduct(null)
    if (item.action === 'scroll-banner') {
      setActiveNavTab('Inicio')
      setTimeout(() => {
        const el = document.getElementById('catalog-banner') || document.getElementById('catalog-banner-mobile')
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (item.action === 'scroll-products') {
      setActiveNavTab('Productos')
      setTimeout(() => {
        const el = document.getElementById('catalog-products')
        el?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (item.action === 'scroll-story') {
      setActiveNavTab('Historia')
    } else if (item.action === 'whatsapp') {
      window.open(`https://wa.me/${(store.whatsapp || '').replace(/\D/g, '')}?text=Hola! Me gustaría hacer una consulta.`, '_blank')
    } else if (item.action === 'link' && item.link) {
      window.open(item.link, '_blank')
    } else {
      setActiveNavTab(item.label)
    }
  }

  const handleBannerButtonClick = () => {
    const action = bannerButton.action || 'scroll'
    if (action === 'scroll') {
      const el = document.getElementById('catalog-products')
      el?.scrollIntoView({ behavior: 'smooth' })
    } else if (action === 'whatsapp') {
      window.open(`https://wa.me/${(store.whatsapp || '').replace(/\D/g, '')}?text=Hola! Vengo desde tu banner principal.`, '_blank')
    } else if (action === 'link' && bannerButton.link) {
      window.open(bannerButton.link, '_blank')
    }
  }

  const handleMobileTabClick = (tab: string) => {
    setActiveMobileTab(tab)
    if (tab === 'carrito') {
      setIsCartOpen(true)
    } else if (tab === 'buscar') {
      setActiveNavTab('Productos')
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else if (tab === 'categorias') {
      setActiveNavTab('Productos')
      setTimeout(() => {
        document.getElementById('mobile-categories-row')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else if (tab === 'inicio') {
      setActiveNavTab('Inicio')
    }
  }

  // Selected Product details
  const productSku = selectedProduct ? `MOD-${selectedProduct.id.slice(-3).toUpperCase()}` : ''
  const productImages = selectedProduct ? (selectedProduct.imageUrl ? selectedProduct.imageUrl.split(',').filter(Boolean) : []) : []
  const currentDetailImg = selectedProduct && productImages.length > 0 ? productImages[activeImageIdx] : null
  const selectedCartKey = selectedProduct ? getCartKey(selectedProduct.id, selectedOptions) : ''
  const qtyInCart = selectedCartKey ? (cart[selectedCartKey] ?? 0) : 0

  // Success view
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-50 rounded-lg flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-[#25D366] rounded-lg flex items-center justify-center animate-bounce">
            <MessageCircle className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">¡Pedido Recibido!</h1>
        <p className="text-zinc-500 mb-10 leading-relaxed text-lg">
          Hemos enviado un mensaje de confirmación a tu WhatsApp. <br/>
          <span className="font-bold text-zinc-800">Cierra esta ventana y vuelve al chat</span> para continuar.
        </p>
        <a 
          href="whatsapp://"
          className="w-full h-15 bg-zinc-900 text-white rounded-lg font-bold text-lg shadow-xl shadow-zinc-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer no-underline"
        >
          Regresar a WhatsApp
        </a>
      </div>
    )
  }

  return (
    <div 
      className="flex flex-col min-h-screen text-zinc-900 selection:bg-zinc-100 transition-colors duration-300"
      style={{ 
        fontFamily: resolvedFontFamily,
        backgroundColor: colors.fondo,
        color: colors.texto,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

        /* Overrides para emular la paleta elegida del comercio */
        .bg-emerald-600, .bg-emerald-700 {
          background-color: ${colors.primario} !important;
        }
        .bg-emerald-600:hover, .bg-emerald-700:hover {
          opacity: 0.9 !important;
          background-color: ${colors.primario} !important;
        }
        .bg-emerald-50, .bg-emerald-100 {
          background-color: ${colors.acento}15 !important;
        }
        .text-emerald-600, .text-emerald-700, .text-emerald-800 {
          color: ${colors.primario} !important;
        }
        .border-emerald-100, .border-emerald-200, .border-emerald-500, .border-emerald-600 {
          border-color: ${colors.primario} !important;
        }
        .border-emerald-600:hover {
          border-color: ${colors.primario} !important;
        }
        .focus\\:border-emerald-500:focus {
          border-color: ${colors.primario} !important;
        }
        .focus\\:ring-emerald-500\\/10:focus {
          box-shadow: 0 0 0 4px ${colors.primario}20 !important;
        }
      `}} />

      {/* 🖥️ VISTA DESKTOP */}
      <CatalogDesktopView
        showMobile={showMobile}
        store={store}
        settings={settings}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        handleNavbarLinkClick={handleNavbarLinkClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsCartOpen={setIsCartOpen}
        itemsInCart={itemsInCart}
        total={total}
        currentBannerIdx={currentBannerIdx}
        setCurrentBannerIdx={setCurrentBannerIdx}
        handleBannerButtonClick={handleBannerButtonClick}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filteredProducts={filteredProducts}
        viewMode={viewMode}
        setViewMode={setViewMode}
        cart={cart}
        changeQtyByKey={changeQtyByKey}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        productSku={productSku}
        productImages={productImages}
        currentDetailImg={currentDetailImg}
        activeImageIdx={activeImageIdx}
        setActiveImageIdx={setActiveImageIdx}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        qtyInCart={qtyInCart}
        selectedCartKey={selectedCartKey}
        categories={categories}
        categoryCounts={categoryCounts}
        onlyInStock={onlyInStock}
        setOnlyInStock={setOnlyInStock}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* 📱 VISTA MÓVIL */}
      <CatalogMobileView
        showMobile={showMobile}
        store={store}
        settings={settings}
        activeNavTab={activeNavTab}
        itemsInCart={itemsInCart}
        total={total}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleMobileTabClick={handleMobileTabClick}
        currentBannerIdx={currentBannerIdx}
        setCurrentBannerIdx={setCurrentBannerIdx}
        handleBannerButtonClick={handleBannerButtonClick}
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
        device={device}
        activeMobileTab={activeMobileTab}
      />

      {/* 🛒 DRAWER DE CARRITO & CHECKOUT */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        device={device}
        itemsInCart={itemsInCart}
        freeShipping={settings.freeShipping}
        cartProducts={cartProducts}
        total={total}
        changeQtyByKey={changeQtyByKey}
        form={form}
        setForm={setForm}
        handleWhatsAppOrder={handleWhatsAppOrder}
        handleCardPayment={handleCardPayment}
        loadingAction={loadingAction}
        cardPaymentsEnabled={store.cardPaymentsEnabled}
      />

      {/* 📱 DRAWER PARA DETALLE EN MÓVILES */}
      <ProductDetailDrawer
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        device={device}
        productSku={productSku}
        currentDetailImg={currentDetailImg}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        qtyInCart={qtyInCart}
        selectedCartKey={selectedCartKey}
        changeQtyByKey={changeQtyByKey}
      />

      {/* 📋 MENÚ LATERAL MÓVIL */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        device={device}
        store={store}
        formattedStoreName={formattedStoreName}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        navbarLinks={navbarLinks}
        handleNavbarLinkClick={handleNavbarLinkClick}
        initialPhone={initialPhone}
        schedule={settings.schedule}
        socialsShowInCatalog={settings.socialsShowInCatalog}
        aiSettings={settings.aiSettings}
      />

      {/* 🔍 FILTROS / ORDENACIÓN MÓVIL */}
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        device={device}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onlyInStock={onlyInStock}
        setOnlyInStock={setOnlyInStock}
      />

      {/* 💬 BURBUJA FLOTANTE DE ASESORÍA EN WHATSAPP */}
      <FloatingWhatsAppButton
        enabled={floatingWhatsApp.enabled}
        whatsapp={store.whatsapp}
        storeName={store.name}
        showSection={sections.floatingWhatsApp !== false}
      />
    </div>
  )
}
