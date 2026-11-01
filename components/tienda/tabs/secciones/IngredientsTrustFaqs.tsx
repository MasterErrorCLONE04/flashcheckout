import { cn } from "@/lib/utils"
import { TiendaFormState } from '../../useTiendaForm'

interface IngredientsTrustFaqsProps {
  form: TiendaFormState
}

export function IngredientsTrustFaqs({ form }: IngredientsTrustFaqsProps) {
  const {
    sections,
    handleSectionToggle,
    ingredientsSection,
    setIngredientsSection,
    freeShipping,
    setFreeShipping,
    paymentMethods,
    setPaymentMethods,
    testimonials,
    setTestimonials,
    faqs,
    setFaqs,
    floatingWhatsApp,
    setFloatingWhatsApp
  } = form

  return (
    <>
      {/* 3-Column Ingredients storytelling Section (Chocodate Style) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Ingredientes Premium (3 Columnas)</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Layout simétrico con imagen en medio y características explicativas a los lados.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSectionToggle('ingredientsSection')}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              sections.ingredientsSection ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {sections.ingredientsSection && (
          <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título de Sección</label>
              <input 
                type="text"
                value={ingredientsSection.title}
                onChange={e => setIngredientsSection(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <div className="space-y-1.5 p-3 bg-zinc-50 rounded-lg">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Columna Izquierda</span>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                  <input 
                    type="text"
                    value={ingredientsSection.leftTitle}
                    onChange={e => setIngredientsSection(prev => ({ ...prev, leftTitle: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción</label>
                  <textarea 
                    value={ingredientsSection.leftDesc}
                    onChange={e => setIngredientsSection(prev => ({ ...prev, leftDesc: e.target.value }))}
                    rows={2}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-zinc-50 rounded-lg">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider block">Columna Derecha</span>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Título</label>
                  <input 
                    type="text"
                    value={ingredientsSection.rightTitle}
                    onChange={e => setIngredientsSection(prev => ({ ...prev, rightTitle: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase block">Descripción</label>
                  <textarea 
                    value={ingredientsSection.rightDesc}
                    onChange={e => setIngredientsSection(prev => ({ ...prev, rightDesc: e.target.value }))}
                    rows={2}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">URL Imagen Central</label>
              <input 
                type="text"
                value={ingredientsSection.centerImageUrl}
                onChange={e => setIngredientsSection(prev => ({ ...prev, centerImageUrl: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Free Shipping Progress bar Config */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Progreso de Envío Gratis</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Muestra una barra dinámica en el carrito incentivando más compras.</p>
          </div>
          <button
            type="button"
            onClick={() => setFreeShipping(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              freeShipping.enabled ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {freeShipping.enabled && (
          <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Monto mínimo para Envío Gratis</label>
              <input 
                type="number"
                value={freeShipping.threshold}
                onChange={e => setFreeShipping(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods and Trust Module */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Métodos de Pago & Seguridad</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Genera confianza mostrando insignias de pago (Nequi, Bancolombia, Contra Entrega).</p>
          </div>
          <button
            type="button"
            onClick={() => setPaymentMethods(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              paymentMethods.enabled ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {paymentMethods.enabled && (
          <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Métodos activos</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 bg-zinc-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.nequi}
                    onChange={e => setPaymentMethods(prev => ({ ...prev, nequi: e.target.checked }))}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                  />
                  <span className="font-bold text-zinc-800 text-[11px]">Nequi</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 bg-zinc-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.bancolombia}
                    onChange={e => setPaymentMethods(prev => ({ ...prev, bancolombia: e.target.checked }))}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                  />
                  <span className="font-bold text-zinc-800 text-[11px]">Bancolombia</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 bg-zinc-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.contraEntrega}
                    onChange={e => setPaymentMethods(prev => ({ ...prev, contraEntrega: e.target.checked }))}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                  />
                  <span className="font-bold text-zinc-800 text-[11px]">Contra Entrega</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 bg-zinc-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.pse}
                    onChange={e => setPaymentMethods(prev => ({ ...prev, pse: e.target.checked }))}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                  />
                  <span className="font-bold text-zinc-800 text-[11px]">PSE</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 bg-zinc-50/50 cursor-pointer col-span-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.tarjetas}
                    onChange={e => setPaymentMethods(prev => ({ ...prev, tarjetas: e.target.checked }))}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-0"
                  />
                  <span className="font-bold text-zinc-800 text-[11px]">Tarjetas de Crédito / Débito</span>
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Nota de confianza</label>
              <input
                type="text"
                value={paymentMethods.customNote}
                onChange={e => setPaymentMethods(prev => ({ ...prev, customNote: e.target.value }))}
                placeholder="Ej: Aceptamos transferencias y pago contra entrega en Colombia."
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Customer Testimonials Social Proof Module */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Testimonios de Clientes</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Aumenta las conversiones mostrando opiniones de compradores verificados.</p>
          </div>
          <button
            type="button"
            onClick={() => setTestimonials(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              testimonials.enabled ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {testimonials.enabled && (
          <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título</label>
                <input
                  type="text"
                  value={testimonials.title}
                  onChange={e => setTestimonials(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Subtítulo</label>
                <input
                  type="text"
                  value={testimonials.subtitle}
                  onChange={e => setTestimonials(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {testimonials.items.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => {
                        const newItems = [...testimonials.items]
                        newItems[idx] = { ...item, name: e.target.value }
                        setTestimonials(prev => ({ ...prev, items: newItems }))
                      }}
                      placeholder="Nombre cliente"
                      className="w-1/2 bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.city}
                      onChange={e => {
                        const newItems = [...testimonials.items]
                        newItems[idx] = { ...item, city: e.target.value }
                        setTestimonials(prev => ({ ...prev, items: newItems }))
                      }}
                      placeholder="Ciudad"
                      className="w-1/2 bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={item.comment}
                    onChange={e => {
                      const newItems = [...testimonials.items]
                      newItems[idx] = { ...item, comment: e.target.value }
                      setTestimonials(prev => ({ ...prev, items: newItems }))
                    }}
                    placeholder="Comentario u opinión..."
                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQs Accordion Module */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Preguntas Frecuentes (FAQ)</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Resuelve dudas sobre envíos, medios de pago y garantías para cerrar ventas.</p>
          </div>
          <button
            type="button"
            onClick={() => setFaqs(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              faqs.enabled ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {faqs.enabled && (
          <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Título de la sección</label>
              <input
                type="text"
                value={faqs.title}
                onChange={e => setFaqs(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              {faqs.items.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={item.q}
                    onChange={e => {
                      const newItems = [...faqs.items]
                      newItems[idx] = { ...item, q: e.target.value }
                      setFaqs(prev => ({ ...prev, items: newItems }))
                    }}
                    placeholder="¿Pregunta frecuente?"
                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs font-bold text-zinc-800 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={item.a}
                    onChange={e => {
                      const newItems = [...faqs.items]
                      newItems[idx] = { ...item, a: e.target.value }
                      setFaqs(prev => ({ ...prev, items: newItems }))
                    }}
                    placeholder="Respuesta detallada..."
                    className="w-full bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-700 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating WhatsApp Sales Bubble Module */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Burbuja Asesor WhatsApp</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Botón flotante con aviso pulsante para que el comprador pida ayuda inmediata.</p>
          </div>
          <button
            type="button"
            onClick={() => setFloatingWhatsApp(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              floatingWhatsApp.enabled ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {floatingWhatsApp.enabled && (
          <div className="space-y-3.5 pt-1 text-left animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Nombre de Asesor</label>
              <input
                type="text"
                value={floatingWhatsApp.agentName}
                onChange={e => setFloatingWhatsApp(prev => ({ ...prev, agentName: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Mensaje de bienvenida</label>
              <input
                type="text"
                value={floatingWhatsApp.message}
                onChange={e => setFloatingWhatsApp(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
