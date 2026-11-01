'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Product, ProductImageItem, ProductOption, ProductFormData } from './types'

export function useProductManagerState(initialProducts: Product[], isPro: boolean) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    price: '',
    stock: '',
    category: 'General',
    description: '',
  })
  const [productImages, setProductImages] = useState<ProductImageItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [options, setOptions] = useState<ProductOption[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showForm])

  function openEditForm(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category || 'General',
      description: product.description || '',
    })

    const parsedOptions = product.options
      ? (typeof product.options === 'string' ? JSON.parse(product.options) : product.options)
      : []
    const mappedOptions = Array.isArray(parsedOptions)
      ? parsedOptions.map((opt: any) => ({
          name: opt.name || '',
          values: Array.isArray(opt.values) ? opt.values.join(', ') : ''
        }))
      : []
    setOptions(mappedOptions)
    
    // Parse existing image URLs
    const urls = product.imageUrl ? product.imageUrl.split(',').filter(Boolean) : []
    const items: ProductImageItem[] = urls.map((url, index) => ({
      id: `url-${index}-${Date.now()}`,
      url,
      preview: url
    }))
    setProductImages(items)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openNewProductForm() {
    setEditingId(null)
    setForm({ name: '', price: '', stock: '', category: 'General', description: '' })
    setOptions([])
    setProductImages([])
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: '', price: '', stock: '', category: 'General', description: '' })
    setOptions([])
    productImages.forEach(img => {
      if (img.file && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setProductImages([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
            body: formData
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
            .filter(Boolean)
        }))
        .filter(opt => opt.name && opt.values.length > 0)

      const payload: any = {
        id: editingId,
        name: form.name,
        price: parseInt(form.price),
        stock: Math.min(parseInt(form.stock) || 0, 99),
        category: form.category,
        description: form.description,
        options: serializedOptions.length > 0 ? serializedOptions : null,
        imageUrl,
      }

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        if (editingId) {
          setProducts(prev => prev.map(p => p.id === editingId ? data.product : p))
          toast.success("Producto actualizado")
        } else {
          setProducts(prev => [data.product, ...prev])
          toast.success("Producto añadido al catálogo")
        }
        closeForm()
      } else {
        toast.error(data.error || "Datos inválidos", {
          description: "Revisa los campos del producto e intenta de nuevo."
        })
      }
    } catch (err) {
      console.error(err)
      toast.error("Error de guardado", {
        description: "No pudimos procesar el producto. Verifica tu conexión."
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
          toast.error("Límite de imágenes alcanzado", {
            description: "Puedes subir un máximo de 5 imágenes."
          })
        }
        return
      }

      const newItems: ProductImageItem[] = filesToAdd.map((file, index) => {
        const preview = URL.createObjectURL(file)
        return {
          id: `file-${index}-${Date.now()}-${Math.random()}`,
          file,
          preview
        }
      })

      setProductImages(prev => [...prev, ...newItems].slice(0, 5))
      
      if (files.length > spaceLeft) {
        toast.warning("Límite excedido", {
          description: `Solo se agregaron las primeras ${spaceLeft} imágenes.`
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
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      })

      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, active: !active } : p))
      )
      
      toast(active ? "Producto ocultado" : "Producto visible", {
        icon: active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
      })
    } catch (err) {
      console.error(err)
      toast.error("No se pudo cambiar el estado")
    }
  }

  async function deleteProduct(id: string) {
    toast("¿Eliminar producto?", {
      description: "Esta acción es permanente y no se puede deshacer.",
      action: {
        label: "Confirmar",
        onClick: async () => {
          try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
            setProducts(prev => prev.filter(p => p.id !== id))
            toast.success("Producto eliminado permanentemente")
          } catch (err) {
            console.error(err)
            toast.error("Error al eliminar")
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    })
  }

  const canAddProduct = isPro || products.length < 10

  return {
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
  }
}
