import React from 'react'
import {
  ShoppingBag,
  Search,
  Check,
  Film,
  Flame,
  Sparkles,
  UserCheck,
  RefreshCw,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Product,
  Coupon,
  CreativeMode,
  CreativeTone,
  MusicTrack,
  AvatarLayout,
  AiAvatar,
  GeneratedData,
  AI_AVATARS,
  formatCOP
} from '../types'
import { StudioPhoneMockup } from './StudioPhoneMockup'
import { VideoScriptTabs } from './VideoScriptTabs'

interface VideoStudioTabProps {
  filteredProducts: Product[]
  selectedProduct: Product | null
  searchQuery: string
  onSearchChange: (q: string) => void
  onSelectProduct: (p: Product) => void
  onGenerateContent: (p?: Product) => void
  mode: CreativeMode
  onModeChange: (m: CreativeMode) => void
  tone: CreativeTone
  onToneChange: (t: CreativeTone) => void
  selectedCouponId: string
  onCouponChange: (id: string) => void
  coupons: Coupon[]
  selectedCoupon?: Coupon
  musicTrack: MusicTrack
  onMusicTrackChange: (mt: MusicTrack) => void
  isGenerating: boolean
  isGeneratingI2V: boolean
  generatedVideoUrl: string | null
  onGenerateI2V: () => void
  avatarLayout: AvatarLayout
  onAvatarLayoutChange: (l: AvatarLayout) => void
  selectedAvatar: AiAvatar
  onSelectAvatar: (a: AiAvatar) => void
  contentTab: 'guion' | 'instagram' | 'whatsapp'
  onContentTabChange: (tab: 'guion' | 'instagram' | 'whatsapp') => void
  generatedData: GeneratedData | null
  copiedKey: string | null
  onCopyText: (text: string, key: string) => void
  store: {
    name: string
    slug: string
    whatsapp: string | null
    whatsappConnected: boolean
  }
  isPlaying: boolean
  onTogglePlay: () => void
  previewSecond: number
  maxSeconds: number
  isVoiceActive: boolean
  onToggleVoice: () => void
  isMuted: boolean
  onToggleMute: () => void
  isPublishing: boolean
  onPublishWhatsApp: (type: 'STATUS' | 'TEST') => void
  isRenderingVideo: boolean
  renderProgress: number
  onDownloadVideo: () => void
}

export function VideoStudioTab({
  filteredProducts,
  selectedProduct,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onGenerateContent,
  mode,
  onModeChange,
  tone,
  onToneChange,
  selectedCouponId,
  onCouponChange,
  coupons,
  selectedCoupon,
  musicTrack,
  onMusicTrackChange,
  isGenerating,
  isGeneratingI2V,
  generatedVideoUrl,
  onGenerateI2V,
  avatarLayout,
  onAvatarLayoutChange,
  selectedAvatar,
  onSelectAvatar,
  contentTab,
  onContentTabChange,
  generatedData,
  copiedKey,
  onCopyText,
  store,
  isPlaying,
  onTogglePlay,
  previewSecond,
  maxSeconds,
  isVoiceActive,
  onToggleVoice,
  isMuted,
  onToggleMute,
  isPublishing,
  onPublishWhatsApp,
  isRenderingVideo,
  renderProgress,
  onDownloadVideo
}: VideoStudioTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-in fade-in duration-300">
      
      {/* COLUMNA IZQUIERDA: CONTROLES, CATÁLOGO Y GUIONES (7/12) */}
      <div className="lg:col-span-7 space-y-5">

        {/* 1. SELECCIÓN DE PRODUCTO DEL CATÁLOGO REAL */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Paso 1: Selecciona el Producto a Promocionar
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  El contenido se basará en sus fotos, precio real y beneficios.
                </p>
              </div>
            </div>

            {/* Buscador Rápido */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filtrar por nombre..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-all font-medium"
              />
            </div>
          </div>

          {/* Carrusel de Productos con Tarjetas */}
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
              <p className="text-xs text-zinc-500 font-semibold">No se encontraron productos con esa búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredProducts.slice(0, 8).map((p) => {
                const isSelected = selectedProduct?.id === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (selectedProduct?.id !== p.id) {
                        onSelectProduct(p)
                        onGenerateContent(p)
                      }
                    }}
                    className={cn(
                      "group relative flex flex-col p-2.5 rounded-lg border transition-all cursor-pointer text-left overflow-hidden",
                      isSelected 
                        ? "border-zinc-900 bg-zinc-50/70 ring-1 ring-zinc-900 shadow-none" 
                        : "border-zinc-200/80 bg-white hover:border-zinc-300"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    <div className="w-full aspect-square bg-zinc-100 rounded-md overflow-hidden relative mb-2 flex items-center justify-center border border-zinc-200/50">
                      {p.imageUrl ? (
                        <img 
                          src={p.imageUrl} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-zinc-300" />
                      )}

                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 backdrop-blur-md text-white">
                        Stock: {p.stock}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-zinc-900 line-clamp-1 leading-tight group-hover:text-zinc-700 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-xs font-extrabold text-zinc-950 mt-0.5">
                      {formatCOP(p.price)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Ficha Spotlight del Producto Activo */}
          {selectedProduct && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-md bg-zinc-200 overflow-hidden shrink-0 border border-zinc-300/50">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 m-3 text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 truncate">
                      {selectedProduct.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200/80 rounded font-semibold text-zinc-700">
                      {selectedProduct.category || 'General'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {selectedProduct.description || 'Sin descripción detallada'}
                  </p>
                </div>
              </div>

              <span className="text-sm font-bold text-zinc-900 shrink-0 ml-3">
                {formatCOP(selectedProduct.price)}
              </span>
            </div>
          )}
        </div>

        {/* 2. FORMATOS CREATIVOS Y PERSONALIZACIÓN */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Paso 2: Formato Creativo & Estilo de Video
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Elige el estilo visual con el que la IA ensamblará la pieza.
              </p>
            </div>
          </div>

          {/* Selector de 3 Modos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'DYNAMIC_REEL' as CreativeMode,
                title: 'Reel de Oferta',
                badge: 'Recomendado',
                desc: 'Motion dinámico, foto recortada con zoom, sticker de precio y subtítulos grandes de alto impacto.',
                icon: Flame,
              },
              {
                id: 'GENERATIVE_I2V' as CreativeMode,
                title: 'Cinemático IA',
                badge: 'Calidad Estudio',
                desc: 'Animación tridimensional con iluminación cinematográfica de producto en movimiento.',
                icon: Sparkles,
              },
              {
                id: 'AVATAR_UGC' as CreativeMode,
                title: 'Avatar Vocero UGC',
                badge: 'Testimonial',
                desc: 'Un creador digital recomendando el producto y explicando por qué comprarlo hoy.',
                icon: UserCheck,
              }
            ].map(m => {
              const Icon = m.icon
              const isSelected = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  className={cn(
                    "p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group",
                    isSelected
                      ? "border-zinc-900 bg-zinc-50/70 ring-1 ring-zinc-900 shadow-none"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center transition-all border",
                        isSelected ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-zinc-600 border-zinc-200 group-hover:bg-zinc-100"
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide",
                        isSelected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                      )}>
                        {m.badge}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-zinc-900 block">
                      {m.title}
                    </span>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1">
                      {m.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Ajustes Avanzados: Tono, Cupones, Música */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Tono de Comunicación
              </label>
              <select
                value={tone}
                onChange={(e) => onToneChange(e.target.value as CreativeTone)}
                className="w-full h-9 text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900 transition-all cursor-pointer"
              >
                <option value="urgency">⚡ Urgencia & Oferta Flash</option>
                <option value="luxury">💎 Elegante & Calidad Superior</option>
                <option value="casual">👋 Cercano & Amigable</option>
                <option value="educational">💡 Problema / Solución</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Descuento o Cupón
              </label>
              <select
                value={selectedCouponId}
                onChange={(e) => onCouponChange(e.target.value)}
                className="w-full h-9 text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900 transition-all cursor-pointer"
              >
                <option value="">Precio normal (Sin cupón)</option>
                {coupons.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} ({c.valor} {c.desc})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                Música de Fondo
              </label>
              <select
                value={musicTrack}
                onChange={(e) => onMusicTrackChange(e.target.value as MusicTrack)}
                className="w-full h-9 text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900 transition-all cursor-pointer"
              >
                <option value="viral">🔥 Beat Viral de TikTok</option>
                <option value="upbeat">⚡ Electrónica Enérgica</option>
                <option value="lofi">☕ Lo-Fi Chill E-Commerce</option>
                <option value="luxury">✨ Ambient Lounge Sofisticado</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => onGenerateContent()}
            disabled={isGenerating || !selectedProduct}
            className="w-full h-9 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin text-zinc-400")} />
            <span>{isGenerating ? 'Generando guión y adaptando video...' : 'Regenerar Contenido y Guion con IA'}</span>
          </button>
        </div>

        {/* GENERACIÓN IMAGE-TO-VIDEO (I2V) CON REPLICATE */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 flex items-center justify-center shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Animación 3D Image-to-Video (I2V) con Replicate
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Anima la foto de tu producto con movimiento de cámara 360°, paneo cinemático y luces de estudio.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              Minimax Video-01
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onGenerateI2V}
              disabled={isGeneratingI2V || !selectedProduct?.imageUrl}
              className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className={cn("w-3.5 h-3.5", isGeneratingI2V && "animate-spin")} />
              <span>{isGeneratingI2V ? 'Generando Video Cinemático...' : 'Generar Animación 3D del Producto (I2V)'}</span>
            </button>

            {generatedVideoUrl && (
              <a
                href={generatedVideoUrl}
                target="_blank"
                rel="noreferrer"
                download="animacion_producto_ia.mp4"
                className="h-9 px-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Descargar Video I2V</span>
              </a>
            )}
          </div>

          {generatedVideoUrl && (
            <div className="rounded-lg overflow-hidden border border-zinc-200 bg-black aspect-video max-h-56 flex items-center justify-center mt-2">
              <video src={generatedVideoUrl} controls autoPlay loop className="h-full w-full object-contain" />
            </div>
          )}
        </div>

        {/* 3. AVATARES DE IA & CREADORES UGC */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Paso 3: Avatar de IA & Creador UGC
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Elige el rostro virtual que presentará y venderá tu producto.
                </p>
              </div>
            </div>

            {/* Selector de Modo de Layout del Avatar */}
            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              {[
                { id: 'BUBBLE_PIP' as AvatarLayout, label: 'Burbuja PIP' },
                { id: 'SPLIT_UGC' as AvatarLayout, label: 'Split 50/50' },
                { id: 'NONE' as AvatarLayout, label: 'Sin Avatar' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => onAvatarLayoutChange(l.id)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                    avatarLayout === l.id
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {avatarLayout !== 'NONE' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AI_AVATARS.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id
                return (
                  <button
                    key={avatar.id}
                    onClick={() => onSelectAvatar(avatar)}
                    className={cn(
                      "relative p-2.5 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between overflow-hidden",
                      isSelected
                        ? "border-zinc-900 bg-zinc-50/70 ring-1 ring-zinc-900 shadow-none"
                        : "border-zinc-200/80 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className="relative w-full aspect-square rounded-md overflow-hidden mb-2 bg-zinc-100 border border-zinc-200/50">
                      <img
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/70 backdrop-blur-md text-white">
                        {avatar.badge}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {avatar.name}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-500">
                          IA
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                        {avatar.niche}
                      </p>
                      <span className="text-[9px] text-zinc-400 font-medium block mt-1">
                        {avatar.tone}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 4. GUIONES Y COPYS ADAPTABLES */}
        <VideoScriptTabs
          contentTab={contentTab}
          onContentTabChange={onContentTabChange}
          isGenerating={isGenerating}
          productName={selectedProduct?.name}
          generatedData={generatedData}
          copiedKey={copiedKey}
          onCopyText={onCopyText}
        />

      </div>

      {/* COLUMNA DERECHA: SMARTPHONE 9:16 PREVIEWER & PUBLICACIÓN (5/12) */}
      <StudioPhoneMockup
        selectedProduct={selectedProduct}
        selectedAvatar={selectedAvatar}
        avatarLayout={avatarLayout}
        mode={mode}
        store={store}
        selectedCoupon={selectedCoupon}
        generatedData={generatedData}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        previewSecond={previewSecond}
        maxSeconds={maxSeconds}
        isVoiceActive={isVoiceActive}
        onToggleVoice={onToggleVoice}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        isPublishing={isPublishing}
        onPublishWhatsApp={onPublishWhatsApp}
        isRenderingVideo={isRenderingVideo}
        renderProgress={renderProgress}
        onDownloadVideo={onDownloadVideo}
      />

    </div>
  )
}
