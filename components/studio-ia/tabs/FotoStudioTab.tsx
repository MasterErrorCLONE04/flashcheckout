import React from 'react'
import {
  Camera,
  ShoppingBag,
  Wand2,
  Scissors,
  Sparkles,
  Layers,
  CheckCircle2,
  Download,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product, PhotoScene, PhotoActionType, formatCOP } from '../types'

interface FotoStudioTabProps {
  products: Product[]
  selectedProduct: Product | null
  onSelectProduct: (product: Product) => void
  enhancedPhotoUrl: string | null
  isProcessingPhoto: boolean
  photoActionType: PhotoActionType | null
  selectedScene: PhotoScene
  onSelectScene: (scene: PhotoScene) => void
  customScenePrompt: string
  onChangeCustomScenePrompt: (value: string) => void
  onEnhancePhoto: (action: PhotoActionType) => void
  onSetPrimaryPhoto: () => void
}

export function FotoStudioTab({
  products,
  selectedProduct,
  onSelectProduct,
  enhancedPhotoUrl,
  isProcessingPhoto,
  photoActionType,
  selectedScene,
  onSelectScene,
  customScenePrompt,
  onChangeCustomScenePrompt,
  onEnhancePhoto,
  onSetPrimaryPhoto
}: FotoStudioTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header de Foto Studio */}
      <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Estudio Fotográfico de Productos (AI Product Photography)
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Elimina fondos desordenados y coloca tu producto en escenarios hiperrealistas de estudio con luces y sombras 3D.
              </p>
            </div>
          </div>

          {selectedProduct && (
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
              <span className="text-[11px] font-medium text-zinc-500">Producto:</span>
              <span className="text-xs font-bold text-zinc-900 truncate max-w-[160px]">{selectedProduct.name}</span>
            </div>
          )}
        </div>

        {/* Selector de Producto en Carrusel */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {products.map(p => {
            const isSelected = selectedProduct?.id === p.id
            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={cn(
                  "shrink-0 flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer text-left",
                  isSelected
                    ? "border-zinc-900 bg-zinc-50/70 ring-1 ring-zinc-900 shadow-none"
                    : "border-zinc-200/80 bg-white hover:border-zinc-300"
                )}
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/60">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 m-3 text-zinc-400" />
                  )}
                </div>
                <div className="pr-2">
                  <span className="text-xs font-bold text-zinc-900 block truncate max-w-[140px]">
                    {p.name}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-500">
                    {formatCOP(p.price)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid de 2 Columnas: Panel de IA (5 cols) + Comparador Visual (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Panel de Herramientas IA */}
        <div className="lg:col-span-5 space-y-5">
          {/* Acciones de Edición Rápida */}
          <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <div className="w-6 h-6 rounded-md bg-zinc-50 text-zinc-700 border border-zinc-200 flex items-center justify-center">
                <Wand2 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Mejoras Rápidas con IA
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onEnhancePhoto('remove-bg')}
                disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                className="p-3.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-50 transition-all text-left space-y-1.5 cursor-pointer shadow-none active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-700 flex items-center justify-center border border-zinc-200">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 block">Quitar Fondo</span>
                <p className="text-[10px] text-zinc-500 font-medium">Recorte perfecto con Replicate RMBG</p>
              </button>

              <button
                onClick={() => onEnhancePhoto('upscale')}
                disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
                className="p-3.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-50 transition-all text-left space-y-1.5 cursor-pointer shadow-none active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-700 flex items-center justify-center border border-zinc-200">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 block">Upscaling 4K</span>
                <p className="text-[10px] text-zinc-500 font-medium">Elimina ruido y aumenta nitidez</p>
              </button>
            </div>
          </div>

          {/* Generador de Escenarios 3D con FLUX */}
          <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <div className="w-6 h-6 rounded-md bg-zinc-50 text-zinc-700 border border-zinc-200 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Escenarios de Estudio Hiperrealistas
              </h3>
            </div>

            <div className="space-y-2">
              {[
                { id: 'marble' as const, name: 'Mármol Blanco & Oro', desc: 'Cosméticos, perfumes y joyería de lujo', icon: '🏛️' },
                { id: 'neon-podium' as const, name: 'Podio Minimalista Neón', desc: 'Tecnología, gadgets y zapatillas', icon: '⚡' },
                { id: 'luxury-wood' as const, name: 'Madera Noble & Café Cálido', desc: 'Cuero, calzado y accesorios artesanales', icon: '🪵' },
                { id: 'sunlight-nature' as const, name: 'Naturaleza & Luz Solar', desc: 'Skincare, ropa orgánica y bienestar', icon: '🌿' },
                { id: 'urban-minimal' as const, name: 'Urbano Minimalista', desc: 'Moda streetwear y estilo contemporáneo', icon: '🏙️' }
              ].map(sc => {
                const isSel = selectedScene === sc.id
                return (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScene(sc.id)}
                    className={cn(
                      "w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between",
                      isSel
                        ? "border-zinc-900 bg-zinc-50/70 ring-1 ring-zinc-900 shadow-none"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{sc.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">{sc.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">{sc.desc}</span>
                      </div>
                    </div>
                    {isSel && <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Prompt personalizado opcional */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-zinc-700 block">
                Instrucción adicional para la IA (Opcional)
              </label>
              <input
                type="text"
                value={customScenePrompt}
                onChange={(e) => onChangeCustomScenePrompt(e.target.value)}
                placeholder="Ej: Iluminación cálida de atardecer, reflejos de agua..."
                className="w-full p-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <button
              onClick={() => onEnhancePhoto('generate-scene')}
              disabled={isProcessingPhoto || !selectedProduct?.imageUrl}
              className="w-full h-9 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className={cn("w-3.5 h-3.5", isProcessingPhoto && "animate-spin text-zinc-400")} />
              <span>
                {isProcessingPhoto 
                  ? 'Generando escenario con Replicate FLUX...' 
                  : 'Generar Escenario de Estudio con IA'}
              </span>
            </button>
          </div>
        </div>

        {/* Comparador Visual Before / After */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-zinc-500" />
              Visualizador de Catálogo Fotográfico
            </span>
            {enhancedPhotoUrl && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                Procesado por Replicate AI
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Foto Original */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-500 block text-center">
                Foto Original del Producto
              </span>
              <div className="relative aspect-square rounded-lg border border-dashed border-zinc-300 overflow-hidden bg-zinc-50 flex items-center justify-center">
                {selectedProduct?.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt="Original" className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-10 h-10 text-zinc-300" />
                )}
              </div>
            </div>

            {/* Foto Mejorada con IA */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-900 block text-center">
                Foto de Estudio Generada con IA
              </span>
              <div className="relative aspect-square rounded-lg border border-zinc-900 overflow-hidden bg-zinc-950 flex items-center justify-center shadow-xs">
                {enhancedPhotoUrl ? (
                  <img src={enhancedPhotoUrl} alt="Mejorada con IA" className="w-full h-full object-cover animate-in zoom-in-95 duration-300" />
                ) : isProcessingPhoto ? (
                  <div className="text-center p-4 space-y-2">
                    <div className="w-8 h-8 border-2 border-zinc-400 border-t-white rounded-full animate-spin mx-auto" />
                    <span className="text-xs font-bold text-white block">Creando fotografía de estudio...</span>
                    <span className="text-[10px] text-zinc-400 block">Aplicando iluminación y sombras 3D</span>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-1.5">
                    <Wand2 className="w-8 h-8 text-zinc-600 mx-auto" />
                    <span className="text-xs font-bold text-zinc-400 block">Sin procesar aún</span>
                    <p className="text-[10px] text-zinc-500">
                      Selecciona una acción (Quitar fondo o Escenario) para ver el resultado aquí.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción al tener foto mejorada */}
          {enhancedPhotoUrl && (
            <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <a
                href={enhancedPhotoUrl}
                download="producto_estudio_ia.png"
                target="_blank"
                rel="noreferrer"
                className="h-9 px-3.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Imagen HD</span>
              </a>

              <button
                onClick={onSetPrimaryPhoto}
                className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Establecer como Portada Oficial del Producto</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
