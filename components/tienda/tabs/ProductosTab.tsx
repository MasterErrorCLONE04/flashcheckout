import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Layout, Package, Pencil, Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { TiendaFormState } from '../useTiendaForm'

interface ProductosTabProps {
  form: TiendaFormState
}

export function ProductosTab({ form }: ProductosTabProps) {
  const {
    cardStyle,
    setCardStyle,
    cardAspectRatio,
    setCardAspectRatio,
    badgeStyle,
    setBadgeStyle,
    catalogColumns,
    setCatalogColumns,
    showVariantSwatches,
    setShowVariantSwatches,
    previewStore,
    setEditingProductId,
    addProductToStore,
  } = form

  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newStock, setNewStock] = useState('15')
  const [newCategory, setNewCategory] = useState('')
  const [isSavingNew, setIsSavingNew] = useState(false)

  const handleCreateQuickProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newPrice) {
      toast.error('Ingresa el nombre y precio del producto')
      return
    }
    setIsSavingNew(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          price: Number(newPrice),
          stock: Number(newStock) || 10,
          category: newCategory.trim() || 'General',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el producto')
      addProductToStore({
        id: data.product.id,
        name: data.product.name,
        price: Number(data.product.price),
        stock: Number(data.product.stock),
        category: data.product.category,
        description: data.product.description,
        imageUrl: data.product.imageUrl,
        options: data.product.options,
      })
      toast.success(`"${data.product.name}" añadido al catálogo y sincronizado con la IA`)
      setNewName('')
      setNewPrice('')
      setNewStock('15')
      setNewCategory('')
      setIsCreatingProduct(false)
    } catch (err: any) {
      toast.error(err.message || 'Error al crear producto')
    } finally {
      setIsSavingNew(false)
    }
  }

  const activeProducts = previewStore.products || []

  return (
    <div className="space-y-6">
      {/* Gestión Rápida de Productos en el Lienzo */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3.5 shadow-none text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-zinc-900" />
              <h3 className="text-sm font-black text-zinc-900 leading-none">
                Productos en Stock ({activeProducts.length})
              </h3>
            </div>
            <p className="text-[10.5px] font-semibold text-zinc-400">
              Haz clic en un producto aquí o en el lienzo para editarlo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatingProduct(v => !v)}
            className="h-7 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer border-0 shrink-0"
          >
            {isCreatingProduct ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>{isCreatingProduct ? 'Cerrar' : 'Nuevo'}</span>
          </button>
        </div>

        {isCreatingProduct && (
          <form
            onSubmit={handleCreateQuickProduct}
            className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 animate-in fade-in duration-150"
          >
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre del producto..."
              className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-900"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder="Precio $"
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-900"
              />
              <input
                type="number"
                value={newStock}
                onChange={e => setNewStock(e.target.value)}
                placeholder="Stock"
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-900"
              />
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Categoría"
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-900 outline-none focus:border-zinc-900"
              />
            </div>
            <button
              type="submit"
              disabled={isSavingNew}
              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer border-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingNew ? 'Creando...' : 'Crear y Sincronizar con IA'}</span>
            </button>
          </form>
        )}

        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
          {activeProducts.slice(0, 20).map((prod: any) => {
            const thumb = (prod.imageUrl || '').split(',')[0]?.trim()
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => setEditingProductId(prod.id)}
                className="w-full flex items-center justify-between gap-2.5 p-2 rounded-lg border border-zinc-100 hover:border-zinc-300 bg-zinc-50/70 hover:bg-white transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-zinc-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-900 block truncate">
                      {prod.name}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 block">
                      ${Number(prod.price || 0).toLocaleString('es-CO')} · {prod.stock ?? 0} en stock
                    </span>
                  </div>
                </div>
                <span className="w-6 h-6 rounded-md bg-white border border-zinc-200 group-hover:border-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-zinc-950 shrink-0">
                  <Pencil className="w-3 h-3" />
                </span>
              </button>
            )
          })}
        </div>
      </div>
      {/* Estilo de Tarjeta de Producto */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-zinc-900" />
            <h3 className="text-sm font-black text-zinc-900 leading-none">
              Estilo de Tarjeta de Producto
            </h3>
          </div>
          <p className="text-[11px] font-semibold text-zinc-400">
            Cómo se presentan los productos en el carrusel y cuadrículas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {[
            {
              id: 'waterdrop-studio' as const,
              label: 'Studio Waterdrop®',
              desc: 'Fondo #F6F6F5 limpio sin bordes',
            },
            {
              id: 'clean-border' as const,
              label: 'Editorial Borde',
              desc: 'Línea fina minimalista 1px',
            },
            {
              id: 'minimal-elevated' as const,
              label: 'Elevada',
              desc: 'Tarjeta blanca con sombra suave',
            },
            {
              id: 'glass-card' as const,
              label: 'Glass',
              desc: 'Superficie translúcida moderna',
            },
          ].map(cs => (
            <button
              key={cs.id}
              type="button"
              onClick={() => setCardStyle(cs.id)}
              className={cn(
                'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                cardStyle === cs.id
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
              )}
            >
              <span className="font-black text-xs leading-none">{cs.label}</span>
              <span
                className={cn(
                  'text-[9px] font-semibold',
                  cardStyle === cs.id ? 'text-zinc-300' : 'text-zinc-400'
                )}
              >
                {cs.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive Swatches Toggle */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-900 block">
              Swatches interactivos de variante / color
            </span>
            <p className="text-[10px] font-medium text-zinc-400">
              Muestra círculos de color o pastillas de talla debajo de cada foto.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVariantSwatches(!showVariantSwatches)}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              showVariantSwatches ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* Proporción de Imagen de Producto */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Proporción de Foto (Aspect Ratio)
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Ajusta la forma del contenedor de imagen del producto.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            {
              id: 'portrait' as const,
              label: 'Retrato (4:5)',
              desc: 'Estilo editorial Waterdrop®',
            },
            {
              id: 'square' as const,
              label: 'Cuadrada (1:1)',
              desc: 'Formato simétrico clásico',
            },
          ].map(ar => (
            <button
              key={ar.id}
              type="button"
              onClick={() => setCardAspectRatio(ar.id)}
              className={cn(
                'p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1',
                cardAspectRatio === ar.id
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
              )}
            >
              <span className="font-black text-xs">{ar.label}</span>
              <span
                className={cn(
                  'text-[9.5px]',
                  cardAspectRatio === ar.id ? 'text-zinc-300' : 'text-zinc-500'
                )}
              >
                {ar.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Estilo de Badges de Categoría */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Estilo de Etiquetas (NEW / OFERTA)
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Diseño de las etiquetas superiores en las tarjetas de producto.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'pill' as const, label: 'Píldora Menta', desc: 'Suave editorial' },
            { id: 'solid' as const, label: 'Sólido', desc: 'Alto contraste' },
            { id: 'outline' as const, label: 'Outline', desc: 'Línea fina' },
          ].map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBadgeStyle(b.id)}
              className={cn(
                'p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                badgeStyle === b.id
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
              )}
            >
              <span className="font-black text-xs leading-none">{b.label}</span>
              <span
                className={cn(
                  'text-[9px] font-semibold',
                  badgeStyle === b.id ? 'text-zinc-300' : 'text-zinc-400'
                )}
              >
                {b.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Columnas de Catálogo en Escritorio */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Columnas en Pantalla Grande
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Densidad de productos mostrados por fila en escritorio.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: '3' as const, label: '3 Columnas', desc: 'Tarjetas amplias' },
            { id: '4' as const, label: '4 Columnas', desc: 'Estándar Waterdrop®' },
            { id: '5' as const, label: '5 Columnas', desc: 'Alta densidad' },
          ].map(col => (
            <button
              key={col.id}
              type="button"
              onClick={() => setCatalogColumns(col.id)}
              className={cn(
                'p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                catalogColumns === col.id
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
              )}
            >
              <span className="font-black text-xs leading-none">{col.label}</span>
              <span
                className={cn(
                  'text-[9px] font-semibold',
                  catalogColumns === col.id ? 'text-zinc-300' : 'text-zinc-400'
                )}
              >
                {col.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
