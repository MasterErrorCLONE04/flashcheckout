import { cn } from "@/lib/utils"
import { ExternalLink, Copy, Check, Power } from 'lucide-react'
import { TiendaFormState } from './useTiendaForm'

interface GeneralStoreWidgetsProps {
  form: TiendaFormState
}

export function GeneralStoreWidgets({ form }: GeneralStoreWidgetsProps) {
  const {
    sections,
    handleSectionToggle,
    domains,
    copyStoreUrl,
    copied,
    storeActive,
    toggleStoreStatus
  } = form

  return (
    <>
      <div className="h-px bg-zinc-200/60 my-6" />

      {/* Card 1: Switch Toggles (Secciones visibles) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left">
        <div className="text-left space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Secciones visibles</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Activa o desactiva las secciones que deseas mostrar en tu tienda.</p>
        </div>

        <div className="space-y-3.5 select-none font-semibold text-xs text-zinc-700">
          {[
            { id: 'banner', label: 'Banner principal' },
            { id: 'destacados', label: 'Productos destacados' },
            { id: 'categorias', label: 'Categorías' },
            { id: 'beneficios', label: 'Beneficios' },
            { id: 'testimonios', label: 'Testimonios' },
            { id: 'newsletter', label: 'Newsletter' }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between py-1 border-b border-zinc-100 last:border-0 pb-2 last:pb-0">
              <span>{item.label}</span>
              
              <button
                type="button"
                onClick={() => handleSectionToggle(item.id as keyof typeof sections)}
                className={cn(
                  "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0",
                  sections[item.id as keyof typeof sections] ? "bg-zinc-900 justify-end" : "bg-zinc-200 justify-start"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Enlace de tu tienda */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left flex flex-col justify-start">
        <div>
          <h3 className="text-sm font-black text-zinc-900 leading-none">Enlace de tu tienda</h3>
          <p className="text-[11px] font-semibold text-zinc-400 mt-1.5">Comparte este enlace con tus clientes.</p>
        </div>

        <div className="relative w-full">
          <input 
            type="text" 
            readOnly
            value={`https://${domains.subdomain}.flashcheckout.co`}
            className="w-full bg-zinc-50/70 border border-zinc-200 rounded-lg pl-4 pr-10 py-2.5 text-xs font-semibold text-zinc-650 focus:outline-none cursor-default select-all"
          />
          <ExternalLink className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>

        <button 
          type="button"
          onClick={copyStoreUrl}
          className="self-start flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-all shadow-none cursor-pointer select-none"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-zinc-900" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copiar enlace</span>
        </button>
      </div>

      {/* Card 3: Estado de la tienda */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none text-left flex flex-col justify-start">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Estado de la tienda</h3>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold tracking-tight",
            storeActive ? "bg-zinc-100 text-zinc-800" : "bg-red-50 text-red-650"
          )}>
            {storeActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        <p className="text-[11px] font-semibold text-zinc-400">
          {storeActive ? 'Tu tienda está visible para todos los clientes.' : 'Tu tienda está pausada. Los clientes no podrán crear pedidos.'}
        </p>

        <button
          type="button"
          onClick={toggleStoreStatus}
          className={cn(
            "self-start flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-lg transition-all cursor-pointer shadow-none",
            storeActive 
              ? "bg-red-50/50 border-red-200 hover:bg-red-50 text-red-600"
              : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700"
          )}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{storeActive ? 'Desactivar tienda' : 'Activar tienda'}</span>
        </button>
      </div>
    </>
  )
}
