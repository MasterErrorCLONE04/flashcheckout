import React from 'react'
import {
  FileText,
  ShoppingBag,
  RefreshCw,
  Flame,
  Check,
  Copy,
  Volume2,
  Sparkles,
  MessageCircle,
  Send,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Product, Coupon, GeneratedData, CreativeTone, formatCOP } from '../types'

interface ContenidoTabProps {
  products: Product[]
  selectedProduct: Product | null
  onSelectProduct: (p: Product) => void
  tone: CreativeTone
  onChangeTone: (t: CreativeTone) => void
  selectedCouponId: string
  onChangeCouponId: (id: string) => void
  coupons: Coupon[]
  isGenerating: boolean
  onGenerateContent: (customProduct?: Product) => void
  generatedData: GeneratedData | null
  copyFramework: 'aida' | 'pas'
  onChangeCopyFramework: (f: 'aida' | 'pas') => void
  copiedKey: string | null
  onCopyText: (text: string, key: string) => void
  isPublishing: boolean
  onPublishWhatsApp: (type: 'STATUS' | 'TEST') => void
  storeWhatsapp: string | null
}

export function ContenidoTab({
  products,
  selectedProduct,
  onSelectProduct,
  tone,
  onChangeTone,
  selectedCouponId,
  onChangeCouponId,
  coupons,
  isGenerating,
  onGenerateContent,
  generatedData,
  copyFramework,
  onChangeCopyFramework,
  copiedKey,
  onCopyText,
  isPublishing,
  onPublishWhatsApp,
  storeWhatsapp
}: ContenidoTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header & Product Selector */}
      <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Redactor Publicitario de Alto Impacto (AI Content & Growth Engine)
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                Genera guiones virales para Reels/TikTok, descripciones AIDA/PAS para la tienda y copys de WhatsApp en 1 clic.
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

        {/* Carrusel de Selección Rápida de Productos */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {products.map(p => {
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

        {/* Configuración Rápida: Tono, Cupón y Botón Generador */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 items-end">
          <div>
            <label className="text-[11px] font-bold text-zinc-700 block mb-1">Tono de Comunicación</label>
            <select
              value={tone}
              onChange={(e) => onChangeTone(e.target.value as CreativeTone)}
              className="w-full h-9 text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value="urgency">⚡ Urgencia & Oferta Flash</option>
              <option value="luxury">💎 Elegante & Calidad Superior</option>
              <option value="casual">👋 Cercano & Amigable</option>
              <option value="educational">💡 Problema / Solución</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-700 block mb-1">Cupón Asociado</label>
            <select
              value={selectedCouponId}
              onChange={(e) => onChangeCouponId(e.target.value)}
              className="w-full h-9 text-xs font-medium bg-white border border-zinc-200 rounded-lg px-2.5 text-zinc-800 focus:outline-none focus:border-zinc-900"
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
            <button
              onClick={() => onGenerateContent()}
              disabled={isGenerating || !selectedProduct}
              className="w-full h-9 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin text-zinc-400")} />
              <span>{isGenerating ? 'Generando Estrategia...' : 'Regenerar con IA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas de Contenido de Alto Impacto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Columna Izquierda (7 cols): Guión Viral + Metodologías AIDA & PAS */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. Guión para Reels & TikTok */}
          <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-zinc-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Guion Viral para Reels / TikTok
                </h3>
              </div>
              {generatedData && (
                <button
                  onClick={() => onCopyText(`Gancho:\n${generatedData.hook}\n\nGuion:\n${generatedData.script}`, 'guion-full')}
                  className="text-[11px] text-zinc-700 hover:text-zinc-900 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'guion-full' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Guion Completo</span>
                </button>
              )}
            </div>

            {isGenerating ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin mx-auto" />
                <p className="text-xs text-zinc-500 font-medium">Redactando gancho de 3s y guión publicitario...</p>
              </div>
            ) : generatedData ? (
              <div className="space-y-3">
                {/* Gancho de 3 segundos */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider flex items-center gap-1">
                      ⚡ Gancho de los Primeros 3 Segundos (Detén el Scroll)
                    </span>
                    <button
                      onClick={() => onCopyText(generatedData.hook, 'hook')}
                      className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1 hover:text-zinc-900 cursor-pointer"
                    >
                      {copiedKey === 'hook' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <p className="text-xs font-bold text-zinc-900">
                    "{generatedData.hook}"
                  </p>
                </div>

                {/* Guion de Locución / Storytelling */}
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                      Argumento de Valor & Manejo de Objeciones
                    </span>
                    <button
                      onClick={() => onCopyText(generatedData.script, 'script')}
                      className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1 hover:text-zinc-900 cursor-pointer"
                    >
                      {copiedKey === 'script' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line">
                    {generatedData.script}
                  </p>
                </div>

                {/* Llamada a la Acción CTA */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[11px] font-medium text-zinc-500">CTA sugerido:</span>
                    <span className="text-xs font-bold text-zinc-900">{generatedData.callToAction}</span>
                  </div>
                  <button
                    onClick={() => onCopyText(generatedData.callToAction, 'cta')}
                    className="text-[10px] text-zinc-600 font-semibold hover:text-zinc-900 cursor-pointer"
                  >
                    {copiedKey === 'cta' ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* 2. Descripciones Persuasivas para Tienda Online (AIDA & PAS) */}
          <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Descripciones Persuasivas para Tienda Online
                </h3>
              </div>

              {/* Selector AIDA vs PAS */}
              <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                <button
                  onClick={() => onChangeCopyFramework('aida')}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                    copyFramework === 'aida' ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  Fórmula AIDA
                </button>
                <button
                  onClick={() => onChangeCopyFramework('pas')}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                    copyFramework === 'pas' ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  Fórmula PAS
                </button>
              </div>
            </div>

            {isGenerating ? (
              <div className="py-6 text-center text-xs text-zinc-400">Generando descripción con copywriting probado...</div>
            ) : generatedData ? (
              copyFramework === 'aida' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">A - ATENCIÓN</span>
                      <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.attention}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">I - INTERÉS</span>
                      <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.interest}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">D - DESEO</span>
                      <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.desire}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">A - ACCIÓN</span>
                      <p className="text-xs text-zinc-800 font-medium">{generatedData.copyAida?.action}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const aidaText = `${generatedData.copyAida?.attention}\n\n${generatedData.copyAida?.interest}\n\n${generatedData.copyAida?.desire}\n\n${generatedData.copyAida?.action}`
                      onCopyText(aidaText, 'aida')
                    }}
                    className="w-full h-9 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {copiedKey === 'aida' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Descripción AIDA Completa</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">P - PROBLEMA</span>
                      <p className="text-xs text-zinc-800 font-medium">{generatedData.copyPas?.problem}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">A - AGITACIÓN</span>
                      <p className="text-xs text-zinc-800 font-medium">{generatedData.copyPas?.agitation}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">S - SOLUCIÓN</span>
                      <p className="text-xs text-zinc-800 font-medium">{generatedData.copyPas?.solution}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const pasText = `${generatedData.copyPas?.problem}\n\n${generatedData.copyPas?.agitation}\n\n${generatedData.copyPas?.solution}`
                      onCopyText(pasText, 'pas')
                    }}
                    className="w-full h-9 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {copiedKey === 'pas' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Descripción PAS Completa</span>
                  </button>
                </div>
              )
            ) : null}
          </div>

        </div>

        {/* Columna Derecha (5 cols): WhatsApp + Cupones Flash */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 3. Copys para WhatsApp con formato enriquecido */}
          <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Difusión para WhatsApp (1 Clic)
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                Formato Negritas
              </span>
            </div>

            {generatedData && (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-lg space-y-2 relative">
                  <p className="text-xs text-zinc-900 leading-relaxed whitespace-pre-line font-sans">
                    {generatedData.copyWhatsApp}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 font-mono">
                    <span>12:00</span>
                    <Check className="w-3 h-3 text-sky-500 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onCopyText(generatedData.copyWhatsApp, 'wpp')}
                    className="w-full h-9 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-700 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    {copiedKey === 'wpp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Mensaje para WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onPublishWhatsApp('TEST')}
                    disabled={isPublishing}
                    className="w-full h-9 bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 text-zinc-800 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Enviar Prueba a mi WhatsApp {storeWhatsapp ? `(${storeWhatsapp})` : ''}</span>
                  </button>

                  <button
                    onClick={() => onPublishWhatsApp('STATUS')}
                    disabled={isPublishing}
                    className="w-full h-9 bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Publicar en Estado de WhatsApp</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Estrategia de Oferta & Cupón Flash */}
          <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Tag className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Estrategia de Oferta & Cupones Flash
              </h3>
            </div>

            {generatedData && (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-700 text-[10px] font-bold uppercase">
                    <Sparkles className="w-3 h-3 text-zinc-500" />
                    <span>Recomendación Inteligente de Oferta</span>
                  </div>
                  <p className="text-xs font-medium text-zinc-900">
                    {generatedData.couponRecommendation}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Caption para Instagram / TikTok</span>
                    <button
                      onClick={() => onCopyText(`${generatedData.copyInstagram}\n\n${generatedData.hashtags.join(' ')}`, 'insta')}
                      className="text-[10px] text-zinc-600 font-semibold hover:text-zinc-900 cursor-pointer"
                    >
                      {copiedKey === 'insta' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-3 font-medium">
                    {generatedData.copyInstagram}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {generatedData.hashtags.map((h, i) => (
                      <span key={i} className="text-[9px] font-semibold text-zinc-600 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
