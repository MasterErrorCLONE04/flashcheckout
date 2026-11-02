import { cn } from '@/lib/utils'
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
    storeInfo,
    heroStyle,
    setHeroStyle,
    heroBadge,
    setHeroBadge,
    heroPanels,
    setHeroPanels,
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
    setAnnouncement,
  } = form

  const updateHeroPanel = (idx: number, value: string) => {
    setHeroPanels(prev => {
      const next = [...prev]
      while (next.length <= idx) next.push('')
      next[idx] = value
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Estilo del Navbar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">
            Estilo del Encabezado (Navbar)
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Elige la disposición visual de la barra de navegación superior.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'clean-border' as const, label: 'Waterdrop', desc: 'Full-width limpio' },
            { id: 'editorial-centered' as const, label: 'Editorial', desc: 'Logo centrado' },
            { id: 'floating-glass' as const, label: 'Cápsula Glass', desc: 'Flotante con blur' },
          ].map(h => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHeaderStyle(h.id)}
              className={cn(
                'p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1',
                headerStyle === h.id
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                  : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
              )}
            >
              <span className="font-black text-xs leading-none">{h.label}</span>
              <span
                className={cn(
                  'text-[9px] font-semibold',
                  headerStyle === h.id ? 'text-zinc-300' : 'text-zinc-400'
                )}
              >
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
          onChange={e => handleImageUpload(e, 'logo')}
        />
        <input
          type="file"
          id="banner-upload"
          className="hidden"
          accept="image/*"
          onChange={e => handleImageUpload(e, 'banner')}
        />

        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Logo o Wordmark</h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Si lo dejas vacío, se mostrará el logotipo tipográfico estilo{' '}
            <span className="font-bold text-zinc-700">
              {(storeInfo.name || 'marca').toLowerCase()}®
            </span>
            .
          </p>
        </div>

        <div className="border border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-50/40 min-h-[90px]">
          {logoUrl ? (
            isImageUrl(logoUrl) ? (
              <img src={logoUrl} className="max-h-14 max-w-full object-contain" alt="Logo" />
            ) : (
              <span className="text-xl font-black text-zinc-950 tracking-[-0.04em] lowercase">
                {logoUrl.toLowerCase()}®
              </span>
            )
          ) : (
            <span className="text-xl font-black text-zinc-950 tracking-[-0.04em] lowercase">
              {(storeInfo.name || 'waterdrop').toLowerCase()}
              <sup className="text-[10px] font-bold ml-0.5">®</sup>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => document.getElementById('logo-upload')?.click()}
            className="flex-1 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-500" />
            <span>Subir imagen de logo</span>
          </button>
          {logoUrl && (
            <button
              type="button"
              onClick={() => setLogoUrl('')}
              className="py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
              title="Usar wordmark tipográfico"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Usar texto®</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Hero Banner Principal</h3>
          <p className="text-[11px] font-semibold text-zinc-400">
            Portada editorial de alto impacto visual.
          </p>
        </div>

        {/* Hero Layout Style */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Disposición del Hero
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: 'waterdrop-collage' as const,
                label: 'Collage 4 Paneles',
                desc: 'Editorial estilo Waterdrop®',
              },
              {
                id: 'cinematic-overlay' as const,
                label: 'Cinemático',
                desc: 'Foto completa + overlay',
              },
              {
                id: 'split-hero' as const,
                label: 'Split 50/50',
                desc: 'Texto izq. + foto der.',
              },
              {
                id: 'minimal-banner' as const,
                label: 'Compacto',
                desc: 'Portada baja minimalista',
              },
            ].map(hs => (
              <button
                key={hs.id}
                type="button"
                onClick={() => setHeroStyle(hs.id)}
                className={cn(
                  'p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-0.5',
                  heroStyle === hs.id
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                )}
              >
                <span className="font-bold text-xs">{hs.label}</span>
                <span
                  className={cn(
                    'text-[9px]',
                    heroStyle === hs.id ? 'text-zinc-300' : 'text-zinc-400'
                  )}
                >
                  {hs.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Badge input */}
        <div className="space-y-1.5 text-left pt-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Píldora Superior (Tag)
          </label>
          <input
            type="text"
            value={heroBadge}
            onChange={e => setHeroBadge(e.target.value)}
            placeholder="Ej: EDICIÓN LIMITADA"
            className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
          />
        </div>

        {/* Banner Media Type Selection */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setHeroType('image')}
            className={cn(
              'py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer',
              heroType === 'image'
                ? 'bg-zinc-950 border-zinc-950 text-white'
                : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800'
            )}
          >
            Fotografía Editorial
          </button>
          <button
            type="button"
            onClick={() => setHeroType('video')}
            className={cn(
              'py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer',
              heroType === 'video'
                ? 'bg-zinc-950 border-zinc-950 text-white'
                : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800'
            )}
          >
            Video Loop (MP4)
          </button>
        </div>

        {heroType === 'video' ? (
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              URL de Video (MP4)
            </label>
            <input
              type="text"
              value={heroVideoUrl}
              onChange={e => setHeroVideoUrl(e.target.value)}
              placeholder="Ej: https://mi-servidor.com/video-portada.mp4"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
            />
          </div>
        ) : heroStyle === 'waterdrop-collage' ? (
          <div className="space-y-3 text-left pt-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              4 Paneles Fotográficos Verticales (Collage Waterdrop)
            </label>
            <div className="grid grid-cols-4 gap-1.5 h-24 rounded-lg overflow-hidden bg-zinc-100 p-1 border border-zinc-200">
              {[0, 1, 2, 3].map(idx => {
                const previewSrc = heroPanels[idx] || (idx === 0 ? bannerUrl : '')
                return (
                  <div
                    key={idx}
                    className="relative rounded overflow-hidden bg-white flex items-center justify-center"
                  >
                    {previewSrc ? (
                      <img src={previewSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-zinc-300">#{idx + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="space-y-2">
              {[0, 1, 2, 3].map(idx => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="file"
                    id={`hero-panel-upload-${idx}`}
                    className="hidden"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'banner', idx)}
                  />
                  <input
                    type="text"
                    value={heroPanels[idx] || ''}
                    onChange={e => updateHeroPanel(idx, e.target.value)}
                    placeholder={`Panel ${idx + 1} (URL o subir foto)`}
                    className="flex-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-zinc-800 focus:outline-none focus:border-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById(`hero-panel-upload-${idx}`)?.click()}
                    className="px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-700 cursor-pointer shrink-0"
                    title="Subir foto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="border border-zinc-200 rounded-xl overflow-hidden h-28 relative bg-zinc-100 flex items-center justify-center">
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
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner Texts Inputs */}
        <div className="space-y-3 pt-2 border-t border-zinc-100 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Título del hero
            </label>
            <input
              type="text"
              value={bannerTitle}
              onChange={e => setBannerTitle(e.target.value)}
              placeholder="Ej: Sabor Real. Cero Excesos."
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Subtítulo del hero
            </label>
            <textarea
              value={bannerSubtitle}
              onChange={e => setBannerSubtitle(e.target.value)}
              rows={2}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Texto Botón CTA
              </label>
              <input
                type="text"
                value={bannerButton.text}
                onChange={e => setBannerButton(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Ej: Explorar"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Acción CTA
              </label>
              <select
                value={bannerButton.action}
                onChange={e =>
                  setBannerButton(prev => ({
                    ...prev,
                    action: e.target.value as 'scroll' | 'whatsapp' | 'link',
                  }))
                }
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              >
                <option value="scroll">Ir a productos</option>
                <option value="whatsapp">Abrir WhatsApp</option>
                <option value="link">Enlace externo</option>
              </select>
            </div>
          </div>

          {bannerButton.action === 'link' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Enlace externo (URL)
              </label>
              <input
                type="text"
                value={bannerButton.link}
                onChange={e => setBannerButton(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>
          )}
        </div>
      </div>

      {/* Announcement Bar Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">
              Barra Superior Rotativa
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400">
              Separa mensajes con <code className="text-zinc-700">|</code> para rotarlos con flechas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAnnouncement(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              announcement.enabled ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {announcement.enabled && (
          <div className="space-y-3.5 pt-1.5 animate-in fade-in duration-300">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Mensajes de la barra
              </label>
              <input
                type="text"
                value={announcement.text}
                onChange={e => setAnnouncement(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Envíos gratis desde $120.000 | Regalo sorpresa en tu primer pedido"
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
