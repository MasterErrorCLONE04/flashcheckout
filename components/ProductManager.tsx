'use client'

import {
  ProductManagerProps,
  useProductManagerState,
  ProductManagerHeader,
  ProductCatalogGrid,
  ProductFormModal,
} from './products'

export type { Product } from './products'

export default function ProductManager({
  initialProducts,
  storeId,
  storeSlug,
  isPro,
}: ProductManagerProps) {
  const {
    products,
    showForm,
    editingId,
    loading,
    form,
    setForm,
    productImages,
    mounted,
    options,
    setOptions,
    canAddProduct,
    openEditForm,
    openNewProductForm,
    closeForm,
    handleSubmit,
    handleImageSelect,
    removeImage,
    moveImage,
    toggleActive,
    deleteProduct,
  } = useProductManagerState(initialProducts, isPro)

  return (
    <div className="space-y-4 pb-20 animate-in">
      {/* Unified Reactive Header */}
      {!showForm && (
        <ProductManagerHeader
          productsCount={products.length}
          isPro={isPro}
          canAddProduct={canAddProduct}
          onAddProduct={openNewProductForm}
        />
      )}

      {/* Modern Creation Engine (Modal via Portal) */}
      <ProductFormModal
        showForm={showForm}
        mounted={mounted}
        editingId={editingId}
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
      />

      {/* Product Display Grid */}
      <ProductCatalogGrid
        products={products}
        storeSlug={storeSlug}
        onEdit={openEditForm}
        onToggleActive={toggleActive}
        onDelete={deleteProduct}
      />
    </div>
  )
}
