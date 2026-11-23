'use client'

import Link from 'next/link'
import { Plus, Trash2, ChevronLeft, ChevronRight, Sparkles, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductImageItem } from './types'

interface ProductImageGalleryFieldProps {
  productImages: ProductImageItem[]
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
  moveImage: (index: number, direction: 'left' | 'right') => void
}

export function ProductImageGalleryField({
  productImages,
  handleImageSelect,
  removeImage,
  moveImage,
}: ProductImageGalleryFieldProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
            Galería Multimedia ({productImages.length}/5)
          </label>
        </div>
        <Link
          href="/studio-ia"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Mejorar con Studio IA ↗</span>
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {productImages.map((img, idx) => (
          <div
            key={img.id}
            className={cn(
              'relative aspect-square rounded-lg overflow-hidden border bg-zinc-50 group transition-all',
              idx === 0
                ? 'border-zinc-950 ring-1 ring-zinc-950'
                : 'border-zinc-200 hover:border-zinc-300'
            )}
          >
            <img
              src={img.preview}
              alt={`Imagen ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            {idx === 0 && (
              <div className="absolute top-1 left-1 bg-zinc-950 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider z-20">
                Portada
              </div>
            )}

            <div className="absolute inset-0 bg-zinc-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-10">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="w-6 h-6 rounded bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex justify-between items-center gap-1 w-full">
                {idx > 0 ? (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'left')}
                    className="w-5 h-5 rounded bg-white/25 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
                    title="Mover a la izquierda"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="w-5 h-5" />
                )}

                {idx < productImages.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'right')}
                    className="w-5 h-5 rounded bg-white/25 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
                    title="Mover a la derecha"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        ))}

        {productImages.length < 5 && (
          <label
            className={cn(
              'border border-dashed border-zinc-300 hover:border-zinc-950 bg-zinc-50/60 hover:bg-zinc-100/70 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group',
              productImages.length === 0 ? 'col-span-5 py-6' : 'aspect-square'
            )}
          >
            <input
              type="file"
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
              multiple
              onChange={handleImageSelect}
            />
            <div className="w-7 h-7 rounded-md bg-white border border-zinc-200 flex items-center justify-center mb-1 group-hover:border-zinc-950 transition-colors shadow-2xs">
              <Plus className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-950" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-600 group-hover:text-zinc-950 text-center px-1">
              {productImages.length === 0 ? 'Subir fotos del producto (máx. 5)' : 'Añadir'}
            </span>
            {productImages.length === 0 && (
              <span className="text-[10px] text-zinc-400 mt-0.5">
                JPG, PNG o WebP · La primera foto será la portada
              </span>
            )}
          </label>
        )}
      </div>
    </div>
  )
}
