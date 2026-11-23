'use client'

import { useState, useEffect, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import {
  Product,
  ProductImageItem,
  ProductOption,
  ProductFormData,
  ProductStatusFilter,
  ProductSortBy,
  ProductViewMode,
} from './types'

export function parseProductOptions(rawOptions: any): Array<{ name: string; values: string[] }> {
  if (!rawOptions) return []
  try {
    const parsed = typeof rawOptions === 'string' ? JSON.parse(rawOptions) : rawOptions
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((opt: any) => ({
        name: String(opt?.name || '').trim(),
        values: Array.isArray(opt?.values)
          ? opt.values.map((v: any) => String(v).trim()).filter(Boolean)
          : typeof opt?.values === 'string'
            ? opt.values.split(',').map((v: string) => v.trim()).filter(Boolean)
            : [],
      }))
      .filter(opt => opt.name && opt.values.length > 0)
  } catch {
    return []
  }
}

export function useProductManagerState(initialProducts: Product[], isPro: boolean, storeName = 'tienda') {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showForm, setShowForm] = useState(false) // Controls mobile sheet visibility & creation mode
  const [editingId, setEditingId] = useState<string | null>(() => initialProducts[0]?.id ?? null)
  const [loading, setLoading] = useState(false)
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null)

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<ProductSortBy>('recent')
  const [viewMode, setViewMode] = useState<ProductViewMode>('grid')

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    price: '',
    stock: '10',
    category: 'General',
    description: '',
    active: true,
    aiRecommendation: true,
    aiDescription: '',
  })
  const [productImages, setProductImages] = useState<ProductImageItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [options, setOptions] = useState<ProductOption[]>([])

  useEffect(() => {
    setMounted(true)
    if (initialProducts.length > 0) {
      populateFormFromProduct(initialProducts[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function populateFormFromProduct(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category || 'General',
      description: product.description || '',
      active: product.active,
      aiRecommendation: product.aiRecommendation ?? true,
      aiDescription: product.aiDescription || '',
    })

    const parsedOptions = parseProductOptions(product.options)
    setOptions(
      parsedOptions.map(opt => ({
        name: opt.name,
        values: opt.values.join(', '),
      }))
    )

    const urls = product.imageUrl ? product.imageUrl.split(',').filter(Boolean) : []
    const items: ProductImageItem[] = urls.map((url, index) => ({
      id: `url-${index}-${Date.now()}`,
      url,
      preview: url,
    }))
    setProductImages(items)
  }

  function openEditForm(product: Product) {
    populateFormFromProduct(product)
    setShowForm(true)
  }

  function openNewProductForm() {
    setEditingId(null)
    setForm({
      name: '',
      price: '',
      stock: '10',
      category: categoryFilter !== 'ALL' ? categoryFilter : 'General',
      description: '',
      active: true,
      aiRecommendation: true,
      aiDescription: '',
    })
    setOptions([])
    productImages.forEach(img => {
      if (img.file && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setProductImages([])
    setShowForm(true)
  }

  function duplicateProduct(product: Product) {
    setEditingId(null)
    setForm({
      name: `${product.name} (Copia)`,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category || 'General',
      description: product.description || '',
      active: true,
      aiRecommendation: product.aiRecommendation ?? true,
      aiDescription: product.aiDescription || '',
    })
    const parsedOptions = parseProductOptions(product.options)
    setOptions(
      parsedOptions.map(opt => ({
        name: opt.name,
        values: opt.values.join(', '),
      }))
    )
    const urls = product.imageUrl ? product.imageUrl.split(',').filter(Boolean) : []
    setProductImages(
      urls.map((url, index) => ({
        id: `dup-${index}-${Date.now()}`,
        url,
        preview: url,
      }))
    )
    setShowForm(true)
    toast.info('Copia cargada en el editor. Ajusta y guarda para publicar.')
  }

  function closeForm() {
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Ingresa el nombre del producto')
      return
    }
    setLoading(true)

    try {
      const uploadedUrls: string[] = []

      for (const item of productImages) {
        if (item.url) {
          uploadedUrls.push(item.url)
        } else if (item.file) {
          const formData = new FormData()
          formData.append('file', item.file)

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) throw new Error('Falló al subir una de las imágenes')
          const uploadData = await uploadRes.json()
          uploadedUrls.push(uploadData.url)
        }
      }

      const imageUrl = uploadedUrls.length > 0 ? uploadedUrls.join(',') : null
      const method = editingId ? 'PUT' : 'POST'
      const serializedOptions = options
        .map(opt => ({
          name: opt.name.trim(),
          values: opt.values
            .split(',')
            .map(v => v.trim())
            .filter(Boolean),
        }))
        .filter(opt => opt.name && opt.values.length > 0)

      const payload: any = {
        id: editingId,
        name: form.name.trim(),
        price: Math.max(0, parseInt(form.price) || 0),
        stock: Math.max(0, parseInt(form.stock) || 0),
        category: form.category.trim() || 'General',
        description: form.description.trim() || null,
        options: serializedOptions.length > 0 ? serializedOptions : null,
        imageUrl,
        active: form.active,
        aiRecommendation: form.aiRecommendation,
        aiDescription: form.aiDescription.trim() || null,
      }

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        if (editingId) {
          setProducts(prev => prev.map(p => (p.id === editingId ? data.product : p)))
          populateFormFromProduct(data.product)
          toast.success('Producto actualizado correctamente')
        } else {
          setProducts(prev => [data.product, ...prev])
          populateFormFromProduct(data.product)
          toast.success('Producto publicado en el catálogo')
        }
        setShowForm(false)
      } else {
        toast.error(data.error || 'Datos inválidos', {
          description: 'Revisa los campos del producto e intenta de nuevo.',
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Error de guardado', {
        description: 'No pudimos procesar el producto. Verifica tu conexión.',
      })
    }

    setLoading(false)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const spaceLeft = 5 - productImages.length
      const filesToAdd = files.slice(0, spaceLeft)

      if (filesToAdd.length === 0) {
        if (productImages.length >= 5) {
          toast.error('Límite de imágenes alcanzado', {
            description: 'Puedes subir un máximo de 5 imágenes por producto.',
          })
        }
        return
      }

      const newItems: ProductImageItem[] = filesToAdd.map((file, index) => {
        const preview = URL.createObjectURL(file)
        return {
          id: `file-${index}-${Date.now()}-${Math.random()}`,
          file,
          preview,
        }
      })

      setProductImages(prev => [...prev, ...newItems].slice(0, 5))

      if (files.length > spaceLeft) {
        toast.warning('Límite excedido', {
          description: `Solo se agregaron las primeras ${spaceLeft} imágenes.`,
        })
      }
    }
  }

  function removeImage(index: number) {
    setProductImages(prev => {
      const target = prev[index]
      if (target.file && target.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  function moveImage(index: number, direction: 'left' | 'right') {
    setProductImages(prev => {
      const newImages = [...prev]
      const targetIndex = direction === 'left' ? index - 1 : index + 1
      if (targetIndex >= 0 && targetIndex < newImages.length) {
        const temp = newImages[index]
        newImages[index] = newImages[targetIndex]
        newImages[targetIndex] = temp
      }
      return newImages
    })
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      })
      if (!res.ok) throw new Error('Error updating status')

      setProducts(prev => prev.map(p => (p.id === id ? { ...p, active: !active } : p)))
      if (editingId === id) {
        setForm(prev => ({ ...prev, active: !active }))
      }

      toast(active ? 'Producto ocultado de la tienda' : 'Producto visible en tienda', {
        icon: active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
      })
    } catch (err) {
      console.error(err)
      toast.error('No se pudo cambiar la visibilidad')
    }
  }

  async function quickAdjustStock(id: string, nextStock: number) {
    const clamped = Math.max(0, nextStock)
    setUpdatingStockId(id)
    const previous = products.find(p => p.id === id)?.stock ?? 0

    // Optimistic update
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, stock: clamped } : p)))
    if (editingId === id) {
      setForm(prev => ({ ...prev, stock: String(clamped) }))
    }

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: clamped }),
      })
      if (!res.ok) throw new Error('Failed to update stock')
    } catch (err) {
      console.error(err)
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, stock: previous } : p)))
      if (editingId === id) {
        setForm(prev => ({ ...prev, stock: String(previous) }))
      }
      toast.error('No se pudo actualizar el stock')
    } finally {
      setUpdatingStockId(null)
    }
  }

  async function deleteProduct(id: string) {
    toast('¿Eliminar producto del catálogo?', {
      description: 'Esta acción es permanente y no se puede deshacer.',
      action: {
        label: 'Confirmar',
        onClick: async () => {
          try {
            const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Error deleting product')
            const remaining = products.filter(p => p.id !== id)
            setProducts(remaining)
            if (editingId === id) {
              if (remaining[0]) {
                populateFormFromProduct(remaining[0])
              } else {
                openNewProductForm()
              }
            }
            toast.success('Producto eliminado permanentemente')
          } catch (err) {
            console.error(err)
            toast.error('Error al eliminar el producto')
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    })
  }

  function exportToCSV() {
    if (products.length === 0) {
      toast.error('No hay productos para exportar')
      return
    }
    const headers = [
      'ID',
      'Nombre',
      'Categoria',
      'Precio Unitario (COP)',
      'Stock Disponible',
      'Valor Total Stock (COP)',
      'Estado',
      'Variantes',
      'Recomendado por IA',
    ]
    const escapeCSV = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""'
      return `"${String(val).replace(/"/g, '""')}"`
    }
    const rows = products.map(p => {
      const opts = parseProductOptions(p.options)
        .map(o => `${o.name}: ${o.values.join('/')}`)
        .join(' | ')
      return [
        escapeCSV(p.id),
        escapeCSV(p.name),
        escapeCSV(p.category || 'General'),
        p.price,
        p.stock,
        p.price * p.stock,
        escapeCSV(p.active ? 'ACTIVO' : 'OCULTO'),
        escapeCSV(opts || 'Sin variantes'),
        escapeCSV(p.aiRecommendation !== false ? 'SI' : 'NO'),
      ]
    })

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `inventario_${storeName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Inventario exportado a CSV')
  }

  // Real-time Inventory KPIs
  const totalInventoryValue = useMemo(
    () => products.reduce((acc, p) => acc + (p.active ? p.price * Math.max(0, p.stock) : 0), 0),
    [products]
  )
  const totalUnitsInStock = useMemo(
    () => products.reduce((acc, p) => acc + Math.max(0, p.stock), 0),
    [products]
  )
  const activeCount = useMemo(() => products.filter(p => p.active).length, [products])
  const healthyStockCount = useMemo(
    () => products.filter(p => p.active && p.stock > 5).length,
    [products]
  )
  const lowStockCount = useMemo(
    () => products.filter(p => p.stock > 0 && p.stock <= 5).length,
    [products]
  )
  const outOfStockCount = useMemo(
    () => products.filter(p => p.stock <= 0).length,
    [products]
  )
  const hiddenCount = useMemo(() => products.filter(p => !p.active).length, [products])

  // Categories list with count
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      const cat = (p.category || 'General').trim()
      counts.set(cat, (counts.get(cat) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (statusFilter === 'active' && !p.active) return false
        if (statusFilter === 'low_stock' && !(p.stock > 0 && p.stock <= 5)) return false
        if (statusFilter === 'out_of_stock' && p.stock > 0) return false
        if (statusFilter === 'hidden' && p.active) return false

        if (categoryFilter !== 'ALL' && (p.category || 'General') !== categoryFilter) {
          return false
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const nameMatch = p.name.toLowerCase().includes(q)
          const catMatch = (p.category || '').toLowerCase().includes(q)
          const descMatch = (p.description || '').toLowerCase().includes(q)
          const optsMatch = JSON.stringify(p.options || '').toLowerCase().includes(q)
          return nameMatch || catMatch || descMatch || optsMatch
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price_desc') return b.price - a.price
        if (sortBy === 'price_asc') return a.price - b.price
        if (sortBy === 'stock_asc') return a.stock - b.stock
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
        return 0 // 'recent' preserves default createdAt desc order
      })
  }, [products, statusFilter, categoryFilter, searchQuery, sortBy])

  const canAddProduct = isPro || products.length < 10
  const activeProduct = useMemo(
    () => (editingId ? products.find(p => p.id === editingId) || null : null),
    [products, editingId]
  )

  return {
    products,
    filteredProducts,
    activeProduct,
    showForm,
    setShowForm,
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
  }
}
