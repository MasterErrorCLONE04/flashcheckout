'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  EyeOff,
  Boxes,
  Lock,
  ArrowUpDown,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ProductManagerProps,
  ProductStatusFilter,
  ProductSortBy,
  useProductManagerState,
  ProductCatalogGrid,
  ProductFormModal,
} from './products'

export type { Product } from './products'

export default function ProductManager({
  initialProducts,
  storeSlug,
  storeName = 'Mi Tienda',
  isPro,
}: ProductManagerProps) {
  const {
    products,
    filteredProducts,
    activeProduct,
    showForm,
    editingId,
    loading,
    updatingStockId,
    form,
    setForm,
    productImages,
    mounted,
    options,
    setOptions,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    categories,
    totalInventoryValue,
    totalUnitsInStock,
    activeCount,
    healthyStockCount,
    lowStockCount,
    outOfStockCount,
    hiddenCount,
    canAddProduct,
    openEditForm,
    openNewProductForm,
    duplicateProduct,
    closeForm,
    handleSubmit,
    handleImageSelect,
    removeImage,
    moveImage,
    toggleActive,
    quickAdjustStock,
    deleteProduct,
    exportToCSV,
  } = useProductManagerState(initialProducts, isPro, storeName)

  // Lock body scroll on desktop so /productos behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = orig
    }
  }, [])

  const STATUS_TABS: Array<{ id: ProductStatusFilter; label: string; count: number }> = [
    { id: 'all', label: 'Todos', count: products.length },
    { id: 'active', label: 'Publicados', count: activeCount },
    { id: 'low_stock', label: 'Stock Bajo', count: lowStockCount },
    { id: 'out_of_stock', label: 'Agotados', count: outOfStockCount },
    { id: 'hidden', label: 'Ocultos', count: hiddenCount },
  ]

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] lg:overflow-hidden bg-[#FAFAFA] flex flex-col">
      {/* 1. Top Studio Header Bar (53px) */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Productos
          </h1>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isPro && (
            <span className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-[11px] font-semibold text-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <span>{products.length} / 10 productos</span>
            </span>
          )}

          {/* View Mode Switcher */}
          <div className="hidden sm:flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {canAddProduct ? (
            <button
              type="button"
              onClick={openNewProductForm}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          ) : (
            <Link
              href="/configuracion"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Límite 10/10 · Subir a Pro</span>
            </Link>
          )}
        </div>
      </header>

      {/* 2. 5-Column Inventory & Valuation KPI Strip */}
      <section className="shrink-0 bg-white border-b border-zinc-200 grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        {/* KPI 1: Valoración Inventario */}
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className="px-5 py-3 text-left hover:bg-zinc-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Valoración Inventario
            </span>
            <Boxes className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            ${totalInventoryValue.toLocaleString('es-CO')}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {totalUnitsInStock} unidades totales en bodega
          </p>
        </button>

        {/* KPI 2: Publicados */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={cn(
            'px-5 py-3 text-left transition-colors cursor-pointer',
            statusFilter === 'active' ? 'bg-zinc-100/90' : 'hover:bg-zinc-50/70'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Catálogo Activo
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {activeCount}{' '}
            <span className="text-xs font-sans font-medium text-zinc-400">
              / {products.length}
            </span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Visibles en Web y Agente IA
          </p>
        </button>

        {/* KPI 3: Stock Saludable */}
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className="px-5 py-3 text-left hover:bg-zinc-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Stock Saludable (&gt;5)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-lg font-mono font-bold text-zinc-950 tabular-nums mt-0.5">
            {healthyStockCount}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Referencias con buena cobertura
          </p>
        </button>

        {/* KPI 4: Alerta Stock Bajo */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'low_stock' ? 'all' : 'low_stock')}
          className={cn(
            'px-5 py-3 text-left transition-colors cursor-pointer',
            statusFilter === 'low_stock' ? 'bg-amber-50/80' : 'hover:bg-zinc-50/70'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Stock Bajo (1–5 un.)
            </span>
            <AlertTriangle
              className={cn(
                'w-3.5 h-3.5',
                lowStockCount > 0 ? 'text-amber-500' : 'text-zinc-300'
              )}
            />
          </div>
          <p
            className={cn(
              'text-lg font-mono font-bold tabular-nums mt-0.5',
              lowStockCount > 0 ? 'text-amber-600' : 'text-zinc-950'
            )}
          >
            {lowStockCount}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {lowStockCount > 0 ? 'Requieren reabastecimiento pronto' : 'Sin alertas de escasez'}
          </p>
        </button>

        {/* KPI 5: Agotados / Ocultos */}
        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'out_of_stock' ? 'all' : 'out_of_stock')
          }
          className={cn(
            'px-5 py-3 text-left transition-colors cursor-pointer col-span-2 lg:col-span-1',
            statusFilter === 'out_of_stock' ? 'bg-rose-50/70' : 'hover:bg-zinc-50/70'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Agotados / Ocultos
            </span>
            <EyeOff
              className={cn(
                'w-3.5 h-3.5',
                outOfStockCount > 0 ? 'text-rose-500' : 'text-zinc-300'
              )}
            />
          </div>
          <p
            className={cn(
              'text-lg font-mono font-bold tabular-nums mt-0.5',
              outOfStockCount > 0 ? 'text-rose-600' : 'text-zinc-950'
            )}
          >
            {outOfStockCount} agotados{' '}
            <span className="text-xs font-sans font-medium text-zinc-400">
              · {hiddenCount} ocultos
            </span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Clic para filtrar referencias sin stock
          </p>
        </button>
      </section>

      {/* 3. Main Split-Pane Studio Workspace */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:divide-x divide-zinc-200 overflow-hidden">
        {/* Left Pane: Catalog Explorer & Quick Stock Control */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#FAFAFA] overflow-hidden">
          {/* Search, Status Tabs & Category Filter Bar */}
          <div className="bg-white border-b border-zinc-200 px-5 py-3 space-y-2.5 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, categoría, descripción o talla/color..."
                  className="w-full h-8 pl-8 pr-8 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {STATUS_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer border',
                      statusFilter === tab.id
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded text-[10px] font-mono',
                        statusFilter === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-100 text-zinc-600'
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="relative shrink-0">
                <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as ProductSortBy)}
                  className="h-8 pl-7 pr-6 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 cursor-pointer"
                >
                  <option value="recent">Más recientes</option>
                  <option value="stock_asc">Menor stock primero</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="name_asc">Nombre A–Z</option>
                </select>
              </div>
            </div>

            {/* Dynamic Category Filter Pills */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1 shrink-0">
                  Categorías:
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('ALL')}
                  className={cn(
                    'px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors shrink-0 cursor-pointer',
                    categoryFilter === 'ALL'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  )}
                >
                  Todas ({products.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() =>
                      setCategoryFilter(categoryFilter === cat.name ? 'ALL' : cat.name)
                    }
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors shrink-0 cursor-pointer',
                      categoryFilter === cat.name
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    )}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Catalog Grid / Table */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <ProductCatalogGrid
              products={filteredProducts}
              totalProductsCount={products.length}
              storeSlug={storeSlug}
              viewMode={viewMode}
              selectedId={editingId}
              updatingStockId={updatingStockId}
              onEdit={openEditForm}
              onDuplicate={duplicateProduct}
              onToggleActive={toggleActive}
              onQuickAdjustStock={quickAdjustStock}
              onDelete={deleteProduct}
              onResetFilters={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setCategoryFilter('ALL')
              }}
              onCreateNew={openNewProductForm}
            />
          </div>
        </div>

        {/* Right Pane: Persistent Product Inspector & Live Editor */}
        <ProductFormModal
          showForm={showForm}
          mounted={mounted}
          editingId={editingId}
          activeProduct={activeProduct}
          storeSlug={storeSlug}
          canAddProduct={canAddProduct}
          loading={loading}
          form={form}
          setForm={setForm}
          options={options}
          setOptions={setOptions}
          productImages={productImages}
          handleImageSelect={handleImageSelect}
          removeImage={removeImage}
          moveImage={moveImage}
          onSubmit={handleSubmit}
          onClose={closeForm}
          onNewProduct={openNewProductForm}
          onDuplicate={duplicateProduct}
          onDelete={deleteProduct}
        />
      </div>
    </div>
  )
}
