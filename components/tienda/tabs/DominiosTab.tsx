import { TiendaFormState } from '../useTiendaForm'

interface DominiosTabProps {
  form: TiendaFormState
}

export function DominiosTab({ form }: DominiosTabProps) {
  const { domains, setDomains } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
      <div className="text-left space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Dominios públicos</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Configura el slug o vincula un dominio propio.</p>
      </div>

      <div className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Subdominio local</label>
          <div className="flex items-stretch">
            <input 
              type="text"
              value={domains.subdomain}
              onChange={e => setDomains(prev => ({ ...prev, subdomain: e.target.value }))}
              className="flex-1 bg-white border border-zinc-200 focus:border-zinc-950 rounded-l-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
            />
            <span className="bg-zinc-50 border border-l-0 border-zinc-200 rounded-r-lg px-4 flex items-center text-xs font-bold text-zinc-500">
              .flashcheckout.co
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Dominio personalizado (Pro)</label>
          <input 
            type="text"
            value={domains.customDomain}
            onChange={e => setDomains(prev => ({ ...prev, customDomain: e.target.value }))}
            placeholder="ej: www.minegocio.com"
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
