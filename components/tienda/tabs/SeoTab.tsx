import { TiendaFormState } from '../useTiendaForm'

interface SeoTabProps {
  form: TiendaFormState
}

export function SeoTab({ form }: SeoTabProps) {
  const { seo, setSeo } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-4 shadow-none">
      <div className="text-left space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Meta Tags SEO</h3>
        <p className="text-[11px] font-semibold text-zinc-400">Cómo se verá el catálogo al listarse en buscadores o chats.</p>
      </div>

      <div className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Título del sitio (Title)</label>
          <input 
            type="text"
            value={seo.title}
            onChange={e => setSeo(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Descripción (Meta Description)</label>
          <textarea 
            value={seo.desc}
            onChange={e => setSeo(prev => ({ ...prev, desc: e.target.value }))}
            rows={4}
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  )
}
