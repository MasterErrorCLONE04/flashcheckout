import { TiendaFormState } from '../useTiendaForm'

interface PoliticasTabProps {
  form: TiendaFormState
}

export function PoliticasTab({ form }: PoliticasTabProps) {
  const { policies, setPolicies } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
      <div className="text-left space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Políticas de la tienda</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Términos y condiciones legales para tus clientes.</p>
      </div>

      <div className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Políticas de devolución</label>
          <textarea 
            value={policies.refunds}
            onChange={e => setPolicies(prev => ({ ...prev, refunds: e.target.value }))}
            rows={4}
            placeholder="Describe los términos para reembolsos o devoluciones de productos..."
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Términos de servicio</label>
          <textarea 
            value={policies.terms}
            onChange={e => setPolicies(prev => ({ ...prev, terms: e.target.value }))}
            rows={4}
            placeholder="Describe las condiciones de uso y términos de despacho..."
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  )
}
