import { cn } from "@/lib/utils"
import { TiendaFormState } from '../../useTiendaForm'

interface BrandStorySectionProps {
  form: TiendaFormState
}

export function BrandStorySection({ form }: BrandStorySectionProps) {
  const {
    sections,
    handleSectionToggle,
    brandStory,
    setBrandStory,
    brandStoryPage,
    setBrandStoryPage
  } = form

  return (
    <>
      {/* Brand Story Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Historia de Marca / Storytelling</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Franja de ancho completo para contar tu pasión al comprador.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('brandStory')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.brandStory ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.brandStory && (
          <div className="space-y-3.5 pt-1.5 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título del banner</label>
              <input 
                type="text"
                value={brandStory.title}
                onChange={e => setBrandStory(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Descripción narrativa</label>
              <textarea 
                value={brandStory.desc}
                onChange={e => setBrandStory(prev => ({ ...prev, desc: e.target.value }))}
                rows={3}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL imagen de fondo</label>
              <input 
                type="text"
                value={brandStory.bgUrl}
                onChange={e => setBrandStory(prev => ({ ...prev, bgUrl: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Texto botón</label>
                <input 
                  type="text"
                  value={brandStory.btnText}
                  onChange={e => setBrandStory(prev => ({ ...prev, btnText: e.target.value }))}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Enlace botón (Opcional)</label>
                <input 
                  type="text"
                  value={brandStory.btnLink}
                  onChange={e => setBrandStory(prev => ({ ...prev, btnLink: e.target.value }))}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Página de Historia Completa Editor Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Página de Historia Completa</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Personaliza la sección de &quot;Historia&quot; (Nuestra trayectoria, perfil, pilares, equipo y valores).</p>
        </div>

        <div className="space-y-4 pt-1.5 text-left">
          {/* Títulos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Etiqueta Superior</label>
              <input 
                type="text"
                value={brandStoryPage.headerTrayectoria}
                onChange={e => setBrandStoryPage(prev => ({ ...prev, headerTrayectoria: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título Principal</label>
              <input 
                type="text"
                value={brandStoryPage.headerPerfil}
                onChange={e => setBrandStoryPage(prev => ({ ...prev, headerPerfil: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          {/* Narrativas */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Párrafo Narrativo 1</label>
            <textarea 
              value={brandStoryPage.narrativeP1}
              onChange={e => setBrandStoryPage(prev => ({ ...prev, narrativeP1: e.target.value }))}
              rows={3}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Párrafo Narrativo 2</label>
            <textarea 
              value={brandStoryPage.narrativeP2}
              onChange={e => setBrandStoryPage(prev => ({ ...prev, narrativeP2: e.target.value }))}
              rows={3}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 resize-none font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Imagen de la Historia (URL)</label>
            <input 
              type="text"
              value={brandStoryPage.imageHeritage}
              onChange={e => setBrandStoryPage(prev => ({ ...prev, imageHeritage: e.target.value }))}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
            />
          </div>

          {/* Pilares */}
          <div className="space-y-3.5 border-t border-zinc-100 pt-3">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Pilares / Instalaciones</h4>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título de la sección</label>
              <input 
                type="text"
                value={brandStoryPage.pillarsTitle}
                onChange={e => setBrandStoryPage(prev => ({ ...prev, pillarsTitle: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            {/* Pilar 1 */}
            <div className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Pilar #1</span>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                  <input 
                    type="text"
                    value={brandStoryPage.pillar1Icon}
                    onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar1Icon: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="col-span-8 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                  <input 
                    type="text"
                    value={brandStoryPage.pillar1Title}
                    onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar1Title: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción</label>
                <textarea 
                  value={brandStoryPage.pillar1Desc}
                  onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar1Desc: e.target.value }))}
                  rows={2}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
                />
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Pilar #2</span>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                  <input 
                    type="text"
                    value={brandStoryPage.pillar2Icon}
                    onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar2Icon: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="col-span-8 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                  <input 
                    type="text"
                    value={brandStoryPage.pillar2Title}
                    onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar2Title: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción</label>
                <textarea 
                  value={brandStoryPage.pillar2Desc}
                  onChange={e => setBrandStoryPage(prev => ({ ...prev, pillar2Desc: e.target.value }))}
                  rows={2}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
                />
              </div>
            </div>
          </div>

          {/* Equipo de Liderazgo */}
          <div className="space-y-3.5 border-t border-zinc-100 pt-3">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Equipo de Liderazgo</h4>
            {brandStoryPage.leadership.map((member: any, idx: number) => (
              <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Miembro #{idx + 1}</span>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                    <input 
                      type="text"
                      value={member.icon}
                      onChange={e => {
                        const newLeader = [...brandStoryPage.leadership]
                        newLeader[idx] = { ...member, icon: e.target.value }
                        setBrandStoryPage(prev => ({ ...prev, leadership: newLeader }))
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-center text-xs font-bold text-zinc-800 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-9 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block">Nombre</label>
                    <input 
                      type="text"
                      value={member.name}
                      onChange={e => {
                        const newLeader = [...brandStoryPage.leadership]
                        newLeader[idx] = { ...member, name: e.target.value }
                        setBrandStoryPage(prev => ({ ...prev, leadership: newLeader }))
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Cargo / Rol</label>
                  <input 
                    type="text"
                    value={member.role}
                    onChange={e => {
                      const newLeader = [...brandStoryPage.leadership]
                      newLeader[idx] = { ...member, role: e.target.value }
                      setBrandStoryPage(prev => ({ ...prev, leadership: newLeader }))
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Valores Corporativos */}
          <div className="space-y-3.5 border-t border-zinc-100 pt-3">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Nuestros Valores</h4>
            {brandStoryPage.values.map((val: any, idx: number) => (
              <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Valor #{idx + 1}</span>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                  <input 
                    type="text"
                    value={val.title}
                    onChange={e => {
                      const newVals = [...brandStoryPage.values]
                      newVals[idx] = { ...val, title: e.target.value }
                      setBrandStoryPage(prev => ({ ...prev, values: newVals }))
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción</label>
                  <textarea 
                    value={val.desc}
                    onChange={e => {
                      const newVals = [...brandStoryPage.values]
                      newVals[idx] = { ...val, desc: e.target.value }
                      setBrandStoryPage(prev => ({ ...prev, values: newVals }))
                    }}
                    rows={2}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none resize-none font-sans"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
