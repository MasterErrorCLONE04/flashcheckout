'use client'

import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium tracking-tight text-zinc-500 ml-1">
          Imágenes del producto ({productImages.length}/5)
        </label>
        <span className="text-[11px] text-zinc-400">La primera imagen será la principal</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {productImages.map((img, idx) => (
          <div 
            key={img.id}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-50 shadow-sm transition-all duration-300",
              idx === 0 && "ring-2 ring-zinc-950 ring-offset-2"
            )}
          >
            <img 
              src={img.preview} 
              alt={`Imagen ${idx + 1}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            
            {/* Principal Badge */}
            {idx === 0 && (
              <div className="absolute top-2 left-2 bg-zinc-950 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm tracking-wider z-20">
                Principal
              </div>
            )}

            {/* Hover Actions Panel */}
            <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
              {/* Top Row: Delete */}
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="w-8 h-8 rounded-lg bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Row: Reordering controls */}
              <div className="flex justify-between items-center gap-1.5 w-full mt-auto">
                {idx > 0 ? (
                  <button 
                    type="button"
                    onClick={() => moveImage(idx, 'left')}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                    title="Mover a la izquierda"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-8 h-8" />
                )}
                
                <span className="text-[10px] text-white/80 font-bold bg-black/35 px-2 py-1 rounded">
                  {idx + 1}
                </span>

                {idx < productImages.length - 1 ? (
                  <button 
                    type="button"
                    onClick={() => moveImage(idx, 'right')}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90"
                    title="Mover a la derecha"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-8 h-8" />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Upload Trigger card if images < 5 */}
        {productImages.length < 5 && (
          <label className="border-2 border-dashed border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50/50 aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative">
            <input 
              type="file" 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp" 
              multiple
              onChange={handleImageSelect} 
            />
            <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-zinc-100 group-hover:text-zinc-800 transition-all shadow-sm">
              <Plus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-800" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors text-center px-2">
              Añadir imagen
            </span>
          </label>
        )}
      </div>
    </div>
  )
}
