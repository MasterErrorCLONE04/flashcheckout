import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TiendaFormState } from '../../useTiendaForm'

interface WaterdropCommunityModulesProps {
  form: TiendaFormState
}

export function WaterdropCommunityModules({ form }: WaterdropCommunityModulesProps) {
  const {
    sections,
    handleSectionToggle,
    pressLogos,
    setPressLogos,
    ambassadors,
    setAmbassadors,
    ugcGallery,
    setUgcGallery,
    retailers,
    setRetailers,
  } = form

  return (
    <>
      {/* 1. Cuadrícula Mixta Editorial 4x2 (Productos + Fotos) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-2 shadow-none text-left">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">
              Cuadrículas Mixtas 4×2 por Categoría
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400">
              Intercala tarjetas de producto con fotos editoriales de la Galería de Estilo de Vida.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('editorialCategories')}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              sections.editorialCategories ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* 2. Barra Monocromática de Prensa & Aliados */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">
              Barra de Prensa & Sellos Oficiales
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400">
              Franja monocromática minimalista de medios, premios o respaldos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('pressLogos')}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              sections.pressLogos ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.pressLogos && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-300">
            {pressLogos.map((logo, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={logo.name}
                  onChange={e => {
                    const next = [...pressLogos]
                    next[idx] = { ...logo, name: e.target.value }
                    setPressLogos(next)
                  }}
                  placeholder="Marca / Medio"
                  className="col-span-5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-black text-zinc-900 focus:outline-none"
                />
                <input
                  type="text"
                  value={logo.subtitle || ''}
                  onChange={e => {
                    const next = [...pressLogos]
                    next[idx] = { ...logo, subtitle: e.target.value }
                    setPressLogos(next)
                  }}
                  placeholder="Subtítulo opcional"
                  className="col-span-6 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPressLogos(prev => prev.filter((_, i) => i !== idx))}
                  className="col-span-1 text-zinc-400 hover:text-red-500 p-1 bg-transparent border-0 cursor-pointer flex justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {pressLogos.length < 6 && (
              <button
                type="button"
                onClick={() => setPressLogos(prev => [...prev, { name: 'NUEVO SELLO', subtitle: 'Verificado' }])}
                className="w-full py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-700 cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir sello
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Recomendado por Comunidad / Embajadores */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">
              Recomendado por Top Performers / Comunidad
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400">
              Carrusel de 4 retratos editoriales 3:4 de embajadores o clientes reales.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('ambassadors')}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              sections.ambassadors ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.ambassadors && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-300">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                Título de la sección
              </label>
              <input
                type="text"
                value={ambassadors.title}
                onChange={e => setAmbassadors(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>

            {ambassadors.items.map((person, idx) => (
              <div
                key={idx}
                className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-lg space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={person.name}
                    onChange={e => {
                      const next = [...ambassadors.items]
                      next[idx] = { ...person, name: e.target.value }
                      setAmbassadors(prev => ({ ...prev, items: next }))
                    }}
                    placeholder="Nombre"
                    className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={person.role}
                    onChange={e => {
                      const next = [...ambassadors.items]
                      next[idx] = { ...person, role: e.target.value }
                      setAmbassadors(prev => ({ ...prev, items: next }))
                    }}
                    placeholder="Rol / Ciudad"
                    className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-600 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={person.imageUrl}
                  onChange={e => {
                    const next = [...ambassadors.items]
                    next[idx] = { ...person, imageUrl: e.target.value }
                    setAmbassadors(prev => ({ ...prev, items: next }))
                  }}
                  placeholder="URL de foto retrato (3:4)"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Mural Fotográfico UGC (6 Columnas escalonadas) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">
              Mural Social UGC (6 Columnas)
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400">
              Collage escalonado de fotos reales bajo el bloque de 5 estrellas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('ugcGallery')}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              sections.ugcGallery ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.ugcGallery && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-300">
            {ugcGallery.map((url, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={url}
                  onChange={e => {
                    const next = [...ugcGallery]
                    next[idx] = e.target.value
                    setUgcGallery(next)
                  }}
                  placeholder={`Foto UGC #${idx + 1} (URL)`}
                  className="flex-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-none"
                />
                {ugcGallery.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setUgcGallery(prev => prev.filter((_, i) => i !== idx))}
                    className="p-1 text-zinc-400 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {ugcGallery.length < 12 && (
              <button
                type="button"
                onClick={() => setUgcGallery(prev => [...prev, ''])}
                className="w-full py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-700 cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir foto al mural
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. Cobertura & Puntos Oficiales (Our Retailers) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">
              Puntos de Venta & Cobertura (Retailers)
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400">
              Muestra tus sedes físicas, distribuidores aliados o ciudades express.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('retailers')}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              sections.retailers ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.retailers && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-300">
            <input
              type="text"
              value={retailers.title}
              onChange={e => setRetailers(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título (Ej: Nuestros Aliados & Cobertura)"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
            />
            <input
              type="text"
              value={retailers.subtitle}
              onChange={e => setRetailers(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Subtítulo descriptivo"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none"
            />
            <div className="space-y-2">
              {retailers.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => {
                      const next = [...retailers.items]
                      next[idx] = { ...item, name: e.target.value }
                      setRetailers(prev => ({ ...prev, items: next }))
                    }}
                    placeholder="Ciudad o tienda"
                    className="col-span-6 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.badge || ''}
                    onChange={e => {
                      const next = [...retailers.items]
                      next[idx] = { ...item, badge: e.target.value }
                      setRetailers(prev => ({ ...prev, items: next }))
                    }}
                    placeholder="Etiqueta (Ej: 24h)"
                    className="col-span-5 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRetailers(prev => ({
                        ...prev,
                        items: prev.items.filter((_, i) => i !== idx),
                      }))
                    }
                    className="col-span-1 text-zinc-400 hover:text-red-500 p-1 bg-transparent border-0 cursor-pointer flex justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

