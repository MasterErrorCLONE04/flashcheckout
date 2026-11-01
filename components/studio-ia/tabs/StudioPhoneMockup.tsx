import React from 'react'
import {
  ShoppingBag,
  Sparkles,
  Download,
  MessageCircle,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Music,
  Clock,
  Send,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Product,
  Coupon,
  CreativeMode,
  AvatarLayout,
  AiAvatar,
  GeneratedData,
  formatCOP
} from '../types'

interface StudioPhoneMockupProps {
  selectedProduct: Product | null
  selectedAvatar: AiAvatar
  avatarLayout: AvatarLayout
  mode: CreativeMode
  store: {
    name: string
    slug: string
    whatsapp: string | null
  }
  selectedCoupon?: Coupon
  generatedData: GeneratedData | null
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

export function StudioPhoneMockup({
  selectedProduct,
  selectedAvatar,
  avatarLayout,
  mode,
  store,
  selectedCoupon,
  generatedData,
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
}: StudioPhoneMockupProps) {
  return (
    <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-4">
      {/* MARCO SMARTPHONE */}
      <div className="relative mx-auto max-w-[320px] bg-zinc-950 p-3 rounded-[36px] shadow-xl border-4 border-zinc-800 ring-1 ring-zinc-700/60 text-white space-y-2.5">
        
        {/* Dynamic Island / Header del teléfono */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-3 pt-1 font-mono">
          <span className="font-bold text-white text-[12px]">9:41</span>
          
          <div className="flex items-center gap-1.5 bg-black px-2.5 py-0.5 rounded-full border border-zinc-850">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map(bar => (
                <div 
                  key={bar} 
                  className={cn(
                    "w-0.5 bg-zinc-300 rounded-full transition-all duration-300",
                    isPlaying ? "h-2.5 animate-pulse" : "h-1"
                  )} 
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            <span>5G</span>
            <div className="w-4 h-2.5 border border-zinc-400 rounded-xs flex items-center justify-end p-0.5">
              <div className="w-2 h-1.5 bg-white rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Pantalla 9:16 Dinámica */}
        <div className="relative w-full aspect-[9/16] bg-zinc-900 rounded-[26px] overflow-hidden flex flex-col justify-between p-3.5 shadow-inner border border-white/5">
          
          {/* Fondo cinemático */}
          {avatarLayout === 'SPLIT_UGC' ? (
            <div className="absolute inset-0 flex flex-col">
              <div className="relative h-1/2 w-full overflow-hidden bg-zinc-950">
                <img 
                  src={selectedAvatar.imageUrl} 
                  alt={selectedAvatar.name} 
                  className={cn("w-full h-full object-cover transition-transform duration-1000", isPlaying ? "scale-105" : "scale-100")} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[9px] font-bold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{selectedAvatar.name} • Creador UGC</span>
                </div>
              </div>
              <div className="relative h-1/2 w-full overflow-hidden bg-zinc-900">
                {selectedProduct?.imageUrl ? (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt="" 
                    className={cn("w-full h-full object-cover transition-transform duration-1000", isPlaying ? "scale-110" : "scale-100")} 
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              </div>
            </div>
          ) : selectedProduct?.imageUrl ? (
            <div 
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out",
                isPlaying ? "scale-110" : "scale-100"
              )}
              style={{ backgroundImage: `url(${selectedProduct.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
              <ShoppingBag className="w-14 h-14 text-zinc-700" />
            </div>
          )}

          {/* Burbuja Flotante PIP del Avatar */}
          {avatarLayout === 'BUBBLE_PIP' && (
            <div className="absolute bottom-24 left-3 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 pr-2.5 rounded-full border border-white/20 shadow-xl">
              <div className="relative">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white ring-1 ring-zinc-700 shadow-sm">
                  <img src={selectedAvatar.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-ping" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-tight">
                {selectedAvatar.name} (IA)
              </span>
            </div>
          )}

          {/* Capa Superior: Perfil Tienda + Badge de Modo */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
                {store.name.charAt(0)}
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">
                {store.name}
              </span>
              <CheckCircle2 className="w-3 h-3 text-sky-400 fill-sky-400/20" />
            </div>

            <div className="bg-zinc-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white border border-white/10 shadow-sm">
              {mode === 'DYNAMIC_REEL' ? 'REEL' : mode === 'GENERATIVE_I2V' ? 'CINEMA IA' : 'UGC'}
            </div>
          </div>

          {/* Capa Central: Hook de 3s o Subtítulos Karaoke */}
          <div className="relative z-10 text-center space-y-2 my-auto px-2">
            {previewSecond <= 3 ? (
              <div className="animate-in zoom-in duration-300">
                <span className="inline-block bg-amber-400 text-zinc-950 px-3 py-1.5 rounded-lg font-extrabold text-xs uppercase tracking-tight shadow-lg border border-amber-300">
                  {generatedData?.hook || '¡OFERTA IMPERDIBLE! 🔥'}
                </span>
              </div>
            ) : (
              <div className="bg-black/80 backdrop-blur-md py-2 px-3 rounded-xl border border-white/15 animate-in fade-in duration-200 shadow-xl">
                {(() => {
                  const fullText = (generatedData?.script || selectedProduct?.name || '').replace(/[*#_~`]/g, '')
                  const words = fullText.split(/\s+/).filter(Boolean)
                  const activeWordIdx = Math.min(
                    Math.floor(((previewSecond - 3) / (maxSeconds - 3)) * words.length),
                    Math.max(0, words.length - 1)
                  )
                  const windowSize = 4
                  const chunkIdx = Math.floor(activeWordIdx / windowSize)
                  const start = chunkIdx * windowSize
                  const visible = words.slice(start, start + windowSize)

                  return (
                    <div>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 font-bold text-xs leading-tight">
                        {visible.map((w, idx) => {
                          const isCur = (start + idx) === activeWordIdx
                          return (
                            <span
                              key={idx}
                              className={cn(
                                "transition-all duration-150 uppercase tracking-tight",
                                isCur 
                                  ? "text-yellow-400 scale-105 drop-shadow-[0_2px_8px_rgba(250,204,21,0.8)] font-black underline decoration-yellow-400 decoration-2" 
                                  : "text-white font-bold"
                              )}
                            >
                              {w}
                            </span>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5 text-[9px] text-zinc-400 font-medium">
                        <Music className="w-2.5 h-2.5 text-zinc-400 animate-spin" />
                        <span>Subtítulos IA • {selectedAvatar.name}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Capa Inferior: Precio en COP, Cupón y Botón CTA */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-medium text-zinc-300 uppercase block tracking-wider">
                  Precio Especial
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white drop-shadow-md">
                    {selectedProduct ? formatCOP(selectedProduct.price) : '$0'}
                  </span>
                  {selectedCoupon && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500 text-white rounded shadow-xs">
                      -{selectedCoupon.valor}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-[10px] font-semibold text-white border border-white/10">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>Envío Rápido</span>
              </div>
            </div>

            {/* Botón CTA Animado */}
            <div className="w-full py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer">
              <ShoppingBag className="w-3.5 h-3.5 fill-current" />
              <span>{generatedData?.callToAction || 'Comprar Ahora en 1 Clic'}</span>
            </div>

            <div className="text-center">
              <span className="text-[9px] text-zinc-400 font-medium tracking-wide">
                flashcheckout.co/tienda/{store.slug}
              </span>
            </div>
          </div>

        </div>

        {/* Scrubber y Controles de Medios */}
        <div className="pt-1 px-1 space-y-2">
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-zinc-200 h-full transition-all duration-300"
              style={{ width: `${(previewSecond / maxSeconds) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onTogglePlay}
                className="h-7 px-2.5 rounded-md bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 font-semibold text-xs border border-zinc-700/50"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pausar' : 'Play'}</span>
              </button>

              <button
                onClick={onToggleVoice}
                className={cn(
                  "h-7 px-2.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-semibold text-xs border",
                  isVoiceActive 
                    ? "bg-zinc-100 text-zinc-950 border-white shadow-xs" 
                    : "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-700/50"
                )}
                title="Activar o pausar locución con voz de IA"
              >
                <Volume2 className={cn("w-3.5 h-3.5", isVoiceActive && "animate-pulse")} />
                <span>{isVoiceActive ? 'Voz ON' : 'Voz IA'}</span>
              </button>
            </div>

            <div className="text-[10px] font-mono text-zinc-400">
              00:{previewSecond.toString().padStart(2, '0')} / 00:{maxSeconds}
            </div>

            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-md bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-700/50"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

      {/* CENTRO DE ACCIONES Y PUBLICACIÓN ONE-CLICK */}
      <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-2.5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <h3 className="text-xs font-bold uppercase text-zinc-900 tracking-wider">
            Publicación y Difusión
          </h3>
          <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">1-Clic</span>
        </div>

        {/* Botón WhatsApp Estado */}
        <button
          onClick={() => onPublishWhatsApp('STATUS')}
          disabled={isPublishing || !generatedData}
          className="w-full h-9 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {isPublishing ? 'Publicando en WhatsApp...' : 'Publicar en Estado de WhatsApp'}
          </span>
        </button>

        {/* Botón Prueba a mi Teléfono */}
        <button
          onClick={() => onPublishWhatsApp('TEST')}
          disabled={isPublishing || !generatedData}
          className="w-full h-9 px-4 bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 text-zinc-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5 text-zinc-500" />
          <span>Enviar prueba a mi WhatsApp {store.whatsapp ? `(${store.whatsapp})` : ''}</span>
        </button>

        {/* Botón Descargar Video Real */}
        <button
          onClick={onDownloadVideo}
          disabled={isRenderingVideo || !generatedData}
          className="w-full h-9 px-4 bg-zinc-900 hover:bg-zinc-800 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Download className={cn("w-3.5 h-3.5", isRenderingVideo ? "animate-bounce text-zinc-400" : "text-zinc-300")} />
          <span>
            {isRenderingVideo ? `Renderizando MP4 (${renderProgress}%)...` : 'Descargar Video MP4 HD (1080x1920)'}
          </span>
        </button>

        {/* Modal de Progreso de Renderizado */}
        {isRenderingVideo && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-700 animate-spin" />
                Componiendo capas de video...
              </span>
              <span>{renderProgress}%</span>
            </div>
            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-zinc-900 h-full transition-all duration-200 rounded-full"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-medium text-center">
              Ensamblando fotogramas en alta resolución. La descarga comenzará automáticamente.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
