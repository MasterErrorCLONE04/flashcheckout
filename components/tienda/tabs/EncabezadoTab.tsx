import { cn } from "@/lib/utils"
import { Upload, Trash2 } from 'lucide-react'
import { TiendaFormState } from '../useTiendaForm'

interface EncabezadoTabProps {
  form: TiendaFormState
}

function isImageUrl(url: string) {
  return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))
}

export function EncabezadoTab({ form }: EncabezadoTabProps) {
  const {
    headerStyle,
    setHeaderStyle,
    handleImageUpload,
    logoUrl,
    setLogoUrl,
    heroStyle,
    setHeroStyle,
    heroBadge,
    setHeroBadge,
    heroType,
    setHeroType,
    heroVideoUrl,
    setHeroVideoUrl,
    bannerUrl,
    setBannerUrl,
    bannerTitle,
    setBannerTitle,
    bannerSubtitle,
    setBannerSubtitle,
    bannerButton,
    setBannerButton,
    announcement,
    setAnnouncement
  } = form

  return (
    <div className="space-y-6">
      {/* Estilo del Navbar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Estilo del Encabezado (Navbar)</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Elige la disposición visual de la barra de navegación superior.</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'floating-glass' as const, label: 'Cápsula Glass', desc: 'Flotante con blur' },
            { id: 'clean-border' as const, label: 'Borde Fino', desc: 'Línea continua' },
            { id: 'editorial-centered' as const, label: 'Editorial', desc: 'Logo centrado' },
          ].map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHeaderStyle(h.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                headerStyle === h.id
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
              )}
            >
              <span className="font-black text-xs leading-none">{h.label}</span>
              <span className={cn("text-[9px] font-semibold", headerStyle === h.id ? "text-zinc-300" : "text-zinc-400")}>
                {h.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <input 
          type="file" 
          id="logo-upload" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleImageUpload(e, 'logo')} 
        />
        <input 
          type="file" 
          id="banner-upload" 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleImageUpload(e, 'banner')} 
        />

        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Logo de la tienda</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Este logo se mostrará en tu tienda online y enlaces de pago.</p>
        </div>

        <div className="border border-zinc-150 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-50/30 min-h-[96px]">
          {logoUrl ? (
            isImageUrl(logoUrl) ? (
              <img src={logoUrl} className="max-h-16 max-w-full object-contain" alt="Logo" />
            ) : (
              <div className="text-sm font-black text-zinc-900 border border-zinc-200 px-4 py-2 rounded-lg bg-white tracking-wider flex items-center gap-1.5">
                <span>☕</span>
                <span>{logoUrl.toUpperCase()}</span>
              </div>
            )
          ) : (
            <span className="text-xs font-semibold text-zinc-400">Sin logotipo configurado</span>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => document.getElementById('logo-upload')?.click()}
            className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Cambiar logo</span>
          </button>
          <button 
            type="button"
            onClick={() => setLogoUrl('')}
            className="py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
            title="Eliminar logo"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Hero Banner Principal</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Portada de entrada con alta retención visual.</p>
        </div>

        {/* Hero Layout Style */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Disposición del Hero</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cinematic-overlay' as const, label: 'Cinemático', desc: 'Overlay degradado' },
              { id: 'split-hero' as const, label: 'Split 50/50', desc: 'Dos columnas' },
              { id: 'minimal-banner' as const, label: 'Compacto', desc: 'Altura contenida' },
            ].map((hs) => (
              <button
                key={hs.id}
                type="button"
                onClick={() => setHeroStyle(hs.id)}
                className={cn(
                  "p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                  heroStyle === hs.id
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                    : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
                )}
              >
                <span className="font-bold text-xs">{hs.label}</span>
                <span className={cn("text-[8.5px]", heroStyle === hs.id ? "text-zinc-300" : "text-zinc-400")}>{hs.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Badge input */}
        <div className="space-y-1.5 text-left pt-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Badge Destacado (Tag Superior)</label>
          <input 
            type="text"
            value={heroBadge}
            onChange={e => setHeroBadge(e.target.value)}
            placeholder="Ej: ✨ NUEVA COLECCIÓN 2026"
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
          />
        </div>

        {/* Banner Media Type Selection */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setHeroType('image')}
            className={cn(
              "py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer",
              heroType === 'image' 
                ? "bg-zinc-950 border-zinc-950 text-white" 
                : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
            )}
          >
            Imagen de Fondo
          </button>
          <button
            type="button"
            onClick={() => setHeroType('video')}
            className={cn(
              "py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer",
              heroType === 'video' 
                ? "bg-zinc-950 border-zinc-950 text-white" 
                : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
            )}
          >
            Video Loop (MP4)
          </button>
        </div>

        {heroType === 'video' ? (
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL de Video (MP4)</label>
            <input 
              type="text"
              value={heroVideoUrl}
              onChange={e => setHeroVideoUrl(e.target.value)}
              placeholder="Ej: https://mi-servidor.com/mi-video.mp4"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="border border-zinc-150 rounded-xl overflow-hidden h-28 relative bg-zinc-100 flex items-center justify-center">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-zinc-400">Sin banner principal</span>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => document.getElementById('banner-upload')?.click()}
                className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-500" />
                <span>Subir imagen</span>
              </button>
              <button 
                type="button"
                onClick={() => setBannerUrl('')}
                className="py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                title="Eliminar banner"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner Texts Inputs */}
        <div className="space-y-3 pt-2 border-t border-zinc-100 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título del hero</label>
            <input 
              type="text"
              value={bannerTitle}
              onChange={e => setBannerTitle(e.target.value)}
              placeholder="Ej: El mejor café, directo a tu puerta"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Descripción del hero</label>
            <textarea 
              value={bannerSubtitle}
              onChange={e => setBannerSubtitle(e.target.value)}
              placeholder="Ej: Descubre nuestros productos de especialidad cultivados con amor."
              rows={2}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none"
            />
          </div>

          {/* Banner Button Customization */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Texto del botón CTA</label>
              <input 
                type="text"
                value={bannerButton.text}
                onChange={e => setBannerButton(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Ej: Ver productos"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Acción del botón</label>
              <select 
                value={bannerButton.action}
                onChange={e => setBannerButton(prev => ({ ...prev, action: e.target.value as 'scroll' | 'whatsapp' | 'link' }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              >
                <option value="scroll">Hacer scroll a los productos</option>
                <option value="whatsapp">Abrir chat de WhatsApp</option>
                <option value="link">Redirigir a enlace externo</option>
              </select>
            </div>

            {bannerButton.action === 'link' && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Enlace externo (URL)</label>
                <input 
                  type="text"
                  value={bannerButton.link}
                  onChange={e => setBannerButton(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="Ej: https://instagram.com/mi-tienda"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcement Bar Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Barra de anuncios</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Franja llamativa sobre el encabezado de tu tienda.</p>
          </div>
          <button
            type="button"
            onClick={() => setAnnouncement(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              announcement.enabled ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {announcement.enabled && (
          <div className="space-y-3.5 pt-1.5 animate-in fade-in duration-300">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Texto del anuncio</label>
              <input 
                type="text"
                value={announcement.text}
                onChange={e => setAnnouncement(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Ej: ¡Envíos gratis por compras superiores a $100.000!"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-tight select-none pt-1">
              <div className="space-y-1.5 flex flex-col items-center">
                <input 
                  type="color" 
                  value={announcement.bgColor}
                  onChange={e => setAnnouncement(prev => ({ ...prev, bgColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0 shadow-xs"
                />
                <span>Fondo</span>
              </div>

              <div className="space-y-1.5 flex flex-col items-center">
                <input 
                  type="color" 
                  value={announcement.textColor}
                  onChange={e => setAnnouncement(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0 shadow-xs"
                />
                <span>Texto</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
