import { cn } from "@/lib/utils"
import { TiendaFormState } from '../useTiendaForm'

interface InfoTabProps {
  form: TiendaFormState
}

export function InfoTab({ form }: InfoTabProps) {
  const {
    storeInfo,
    setStoreInfo,
    schedule,
    setSchedule,
    whatsappTemplate,
    setWhatsappTemplate
  } = form

  return (
    <div className="space-y-6">
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Datos del comercio</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Edita la descripción, contacto y localización de la tienda.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-zinc-500 block">Nombre de la tienda</label>
            <input 
              type="text"
              value={storeInfo.name}
              onChange={e => setStoreInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-zinc-500 block">Teléfono / WhatsApp</label>
            <input 
              type="text"
              value={storeInfo.whatsapp}
              onChange={e => setStoreInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-zinc-500 block">Dirección física</label>
            <input 
              type="text"
              value={storeInfo.address}
              onChange={e => setStoreInfo(prev => ({ ...prev, address: e.target.value }))}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
              placeholder="ej: Calle 10 # 43 - 21, Medellín, Colombia"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-zinc-500 block">Biografía / Presentación</label>
            <textarea 
              value={storeInfo.desc}
              onChange={e => setStoreInfo(prev => ({ ...prev, desc: e.target.value }))}
              rows={4}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Horario de atención Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="flex justify-between items-center text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-900 leading-none">Horario de atención</h3>
            <p className="text-[11px] font-semibold text-zinc-400">Configura cuándo está abierta tu tienda.</p>
          </div>
          <button
            type="button"
            onClick={() => setSchedule(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={cn(
              "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
              schedule.enabled ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {schedule.enabled && (
          <div className="space-y-3.5 pt-1.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between py-1 select-none text-left">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-800 block">Abierto 24/7 (Siempre abierto)</span>
                <p className="text-[10px] font-semibold text-zinc-400">Tu comercio no cierra en ningún horario.</p>
              </div>
              <button
                type="button"
                onClick={() => setSchedule(prev => ({ ...prev, alwaysOpen: !prev.alwaysOpen }))}
                className={cn(
                  "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0",
                  schedule.alwaysOpen ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {!schedule.alwaysOpen && (
              <div className="space-y-1.5 text-left animate-in fade-in duration-300">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Horario detallado</label>
                <input 
                  type="text"
                  value={schedule.text}
                  onChange={e => setSchedule(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Ej: Lunes a Viernes 8:00 AM - 6:00 PM"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-zinc-950"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Plantilla de pedido por WhatsApp Card */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Plantilla de WhatsApp</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Personaliza el formato del mensaje que te envían tus clientes.</p>
        </div>

        <div className="space-y-3.5 text-left">
          <div className="space-y-1.5">
            <textarea 
              value={whatsappTemplate}
              onChange={e => setWhatsappTemplate(e.target.value)}
              rows={6}
              className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none resize-none font-mono"
              placeholder="Escribe la plantilla del mensaje..."
            />
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Variables soportadas:</span>
            <div className="grid grid-cols-2 gap-1.5 mt-2 text-[9px] font-semibold text-zinc-500">
              <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{cliente_nombre}'}</code> - Nombre</div>
              <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{lista_productos}'}</code> - Productos</div>
              <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{monto_total}'}</code> - Total compra</div>
              <div><code className="bg-zinc-200 px-1 rounded text-zinc-700 font-bold">{'{direccion}'}</code> - Dirección</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
