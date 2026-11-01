import { cn } from "@/lib/utils"
import { Trash2 } from 'lucide-react'
import { TiendaFormState } from '../../useTiendaForm'

interface BeneficiosBentoSpecsProps {
  form: TiendaFormState
}

export function BeneficiosBentoSpecs({ form }: BeneficiosBentoSpecsProps) {
  const {
    benefits,
    setBenefits,
    sections,
    handleSectionToggle,
    bentoHighlights,
    setBentoHighlights,
    accordionSpecs,
    setAccordionSpecs
  } = form

  return (
    <>
      {/* Benefits Editor Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Beneficios Flotantes</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Personaliza los 4 cuadros de beneficios que flotan en tu catálogo.</p>
        </div>

        <div className="space-y-4 pt-1 text-left">
          {benefits.items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Beneficio #{idx + 1}</span>
              
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Icono</label>
                  <select
                    value={item.icon}
                    onChange={e => {
                      const newItems = [...benefits.items]
                      newItems[idx] = { ...item, icon: e.target.value as any }
                      setBenefits({ items: newItems })
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-1.5 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                  >
                    <option value="Truck">Camión</option>
                    <option value="ShieldCheck">Escudo</option>
                    <option value="Award">Medalla</option>
                    <option value="Clock">Reloj</option>
                    <option value="Gift">Regalo</option>
                    <option value="Star">Estrella</option>
                  </select>
                </div>

                <div className="col-span-8 space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                  <input 
                    type="text"
                    value={item.label}
                    onChange={e => {
                      const newItems = [...benefits.items]
                      newItems[idx] = { ...item, label: e.target.value }
                      setBenefits({ items: newItems })
                    }}
                    placeholder="Ej: Envíos rápidos"
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block">Subtítulo / Bajada</label>
                <input 
                  type="text"
                  value={item.desc}
                  onChange={e => {
                    const newItems = [...benefits.items]
                    newItems[idx] = { ...item, desc: e.target.value }
                    setBenefits({ items: newItems })
                  }}
                  placeholder="Ej: A todo el país"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-zinc-800 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bento Grid Highlights Config */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Bento Grid de Destacados</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Destaca características o ingredientes clave con tarjetas.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('bentoHighlights')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.bentoHighlights ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.bentoHighlights && (
          <div className="space-y-4 pt-1 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título de la sección</label>
              <input 
                type="text"
                value={bentoHighlights.title}
                onChange={e => setBentoHighlights(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Ingredientes de Especialidad"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="space-y-3.5 border-t border-zinc-100 pt-3">
              {bentoHighlights.items.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Elemento #{idx + 1}</span>
                  
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3 space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block">Emoji</label>
                      <input 
                        type="text"
                        value={item.emoji}
                        onChange={e => {
                          const newItems = [...bentoHighlights.items]
                          newItems[idx] = { ...item, emoji: e.target.value }
                          setBentoHighlights(prev => ({ ...prev, items: newItems }))
                        }}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-center text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                    <div className="col-span-9 space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                      <input 
                        type="text"
                        value={item.title}
                        onChange={e => {
                          const newItems = [...bentoHighlights.items]
                          newItems[idx] = { ...item, title: e.target.value }
                          setBentoHighlights(prev => ({ ...prev, items: newItems }))
                        }}
                        className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción corta</label>
                    <input 
                      type="text"
                      value={item.desc}
                      onChange={e => {
                        const newItems = [...bentoHighlights.items]
                        newItems[idx] = { ...item, desc: e.target.value }
                        setBentoHighlights(prev => ({ ...prev, items: newItems }))
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accordion Specs Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Acordeones de Ficha / Specs</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Pestañas desplegables para alérgenos, envíos o garantías.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('accordionSpecs')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.accordionSpecs ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.accordionSpecs && (
          <div className="space-y-4 pt-1 text-left animate-in fade-in duration-300">
            {accordionSpecs.map((tab, idx) => (
              <div key={idx} className="p-3.5 bg-zinc-50/50 border border-zinc-150 rounded-lg space-y-2.5 relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccordionSpecs(prev => prev.filter((_, i) => i !== idx))
                  }}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-zinc-200/50 transition-colors cursor-pointer border-0 bg-transparent"
                  title="Eliminar pestaña"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider block select-none">Pestaña #{idx + 1}</span>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                  <input 
                    type="text"
                    value={tab.title}
                    onChange={e => {
                      const newTabs = [...accordionSpecs]
                      newTabs[idx] = { ...tab, title: e.target.value }
                      setAccordionSpecs(newTabs)
                    }}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950 pr-8"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Contenido</label>
                  <textarea 
                    value={tab.content}
                    onChange={e => {
                      const newTabs = [...accordionSpecs]
                      newTabs[idx] = { ...tab, content: e.target.value }
                      setAccordionSpecs(newTabs)
                    }}
                    rows={3}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-950 resize-none font-sans"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setAccordionSpecs(prev => [...prev, { title: 'Nueva Pestaña', content: 'Detalles...' }])}
              className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
            >
              <span>+ Añadir Pestaña</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
