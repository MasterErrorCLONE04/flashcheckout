import { cn } from "@/lib/utils"
import { Trash2 } from 'lucide-react'
import { TiendaFormState } from '../../useTiendaForm'

interface VisualCategoriesTimelineGalleryProps {
  form: TiendaFormState
}

export function VisualCategoriesTimelineGallery({ form }: VisualCategoriesTimelineGalleryProps) {
  const {
    sections,
    handleSectionToggle,
    visualCategories,
    setVisualCategories,
    processTimeline,
    setProcessTimeline,
    lifestyleGallery,
    setLifestyleGallery,
    newsletterWidget,
    setNewsletterWidget,
    navbarLinks,
    setNavbarLinks
  } = form

  return (
    <>
      {/* Categorías Visuales Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Categorías Visuales (PDP Grid)</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Muestra una cuadrícula de imágenes para navegar categorías.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('visualCategories')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.visualCategories ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.visualCategories && (
          <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
            {visualCategories.map((catItem, idx) => (
              <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2 relative">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Categoría #{idx + 1}</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block">Nombre</label>
                    <input 
                      type="text"
                      value={catItem.category}
                      onChange={e => {
                        const newCats = [...visualCategories]
                        newCats[idx] = { ...catItem, category: e.target.value }
                        setVisualCategories(newCats)
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block">URL Imagen</label>
                    <input 
                      type="text"
                      value={catItem.imageUrl}
                      onChange={e => {
                        const newCats = [...visualCategories]
                        newCats[idx] = { ...catItem, imageUrl: e.target.value }
                        setVisualCategories(newCats)
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proceso Timeline Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Línea de Proceso (Paso a Paso)</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Muestra los pasos de compra o elaboración de tu producto.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('processTimeline')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.processTimeline ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.processTimeline && (
          <div className="space-y-4 pt-1 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título de la sección</label>
              <input 
                type="text"
                value={processTimeline.title}
                onChange={e => setProcessTimeline(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>

            <div className="space-y-3.5 border-t border-zinc-100 pt-3">
              {processTimeline.items.map((stepItem: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Paso #{idx + 1}</span>
                  
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block">Número</label>
                      <input 
                        type="text"
                        value={stepItem.step}
                        onChange={e => {
                          const newItems = [...processTimeline.items]
                          newItems[idx] = { ...stepItem, step: e.target.value }
                          setProcessTimeline(prev => ({ ...prev, items: newItems }))
                        }}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-9 space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título del Paso</label>
                      <input 
                        type="text"
                        value={stepItem.title}
                        onChange={e => {
                          const newItems = [...processTimeline.items]
                          newItems[idx] = { ...stepItem, title: e.target.value }
                          setProcessTimeline(prev => ({ ...prev, items: newItems }))
                        }}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción del Paso</label>
                    <input 
                      type="text"
                      value={stepItem.desc}
                      onChange={e => {
                        const newItems = [...processTimeline.items]
                        newItems[idx] = { ...stepItem, desc: e.target.value }
                        setProcessTimeline(prev => ({ ...prev, items: newItems }))
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lifestyle Gallery Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Galería de Estilo de Vida</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Muestra hasta 4 fotos reales (estilo Instagram) de tu marca.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('lifestyleGallery')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.lifestyleGallery ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.lifestyleGallery && (
          <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
            {lifestyleGallery.map((imgUrl, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block select-none">Imagen #{idx + 1} (URL)</label>
                <input 
                  type="text"
                  value={imgUrl}
                  onChange={e => {
                    const newG = [...lifestyleGallery]
                    newG[idx] = e.target.value
                    setLifestyleGallery(newG)
                  }}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Widget Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Newsletter Banner (Club)</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Atrae suscriptores ofreciendo ofertas o novedades.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('newsletterWidget')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.newsletterWidget ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.newsletterWidget && (
          <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título del newsletter</label>
              <input 
                type="text"
                value={newsletterWidget.title}
                onChange={e => setNewsletterWidget(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Subtítulo descriptivo</label>
              <textarea 
                value={newsletterWidget.subtitle}
                onChange={e => setNewsletterWidget(prev => ({ ...prev, subtitle: e.target.value }))}
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 flex flex-col items-center select-none">
                <input 
                  type="color" 
                  value={newsletterWidget.bgColor}
                  onChange={e => setNewsletterWidget(prev => ({ ...prev, bgColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                />
                <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Fondo</span>
              </div>

              <div className="space-y-1.5 flex flex-col items-center select-none">
                <input 
                  type="color" 
                  value={newsletterWidget.textColor}
                  onChange={e => setNewsletterWidget(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
                />
                <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Texto</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menú de Navegación del Encabezado Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Menú de Navegación de Cabecera</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Personaliza hasta 5 enlaces rápidos en la barra superior de tu catálogo.</p>
        </div>

        <div className="space-y-4 pt-1 text-left">
          {navbarLinks.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5 relative">
              <button
                type="button"
                onClick={() => {
                  setNavbarLinks(prev => prev.filter((_, i) => i !== idx))
                }}
                className="absolute right-2 top-2 text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-200/50 transition-colors cursor-pointer border-0 bg-transparent"
                title="Eliminar enlace"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Enlace #{idx + 1}</span>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Etiqueta</label>
                  <input 
                    type="text"
                    value={item.label}
                    onChange={e => {
                      const newLinks = [...navbarLinks]
                      newLinks[idx] = { ...item, label: e.target.value }
                      setNavbarLinks(newLinks)
                    }}
                    placeholder="Ej: Tienda"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Acción</label>
                  <select 
                    value={item.action}
                    onChange={e => {
                      const newLinks = [...navbarLinks]
                      newLinks[idx] = { ...item, action: e.target.value as 'scroll-banner' | 'scroll-products' | 'scroll-story' | 'whatsapp' | 'link' }
                      setNavbarLinks(newLinks)
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                  >
                    <option value="scroll-banner">Scroll a Portada</option>
                    <option value="scroll-products">Scroll a Catálogo</option>
                    <option value="scroll-story">Scroll a Historia</option>
                    <option value="whatsapp">Abrir WhatsApp</option>
                    <option value="link">Enlace Externo</option>
                  </select>
                </div>
              </div>

              {item.action === 'link' && (
                <div className="space-y-1 animate-in fade-in duration-300">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">URL Enlace Externo</label>
                  <input 
                    type="text"
                    value={item.link}
                    onChange={e => {
                      const newLinks = [...navbarLinks]
                      newLinks[idx] = { ...item, link: e.target.value }
                      setNavbarLinks(newLinks)
                    }}
                    placeholder="Ej: https://instagram.com/mi-tienda"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>
              )}
            </div>
          ))}

          {navbarLinks.length < 5 && (
            <button
              type="button"
              onClick={() => setNavbarLinks(prev => [...prev, { label: 'Nuevo Enlace', action: 'scroll-products', link: '' }])}
              className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
            >
              <span>+ Añadir Enlace</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
