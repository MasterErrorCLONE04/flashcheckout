import { cn } from '@/lib/utils'
import { TiendaFormState } from '../useTiendaForm'

interface RedesTabProps {
  form: TiendaFormState
}

export function RedesTab({ form }: RedesTabProps) {
  const { socialsShowInCatalog, setSocialsShowInCatalog, socials, setSocials } = form

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none">
      <div className="text-left space-y-0.5">
        <h3 className="text-sm font-black text-zinc-900 leading-none">Redes Sociales</h3>
        <p className="text-[11px] font-semibold text-zinc-400">
          Se muestran centradas bajo el logotipo principal del pie de página.
        </p>
      </div>

      <div className="space-y-4 text-left">
        <div className="flex justify-between items-center text-left pb-3.5 border-b border-zinc-100 select-none">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-800 block leading-tight">
              Mostrar iconos en la tienda
            </span>
            <p className="text-[10px] font-semibold text-zinc-400">
              Activa los accesos directos a tus perfiles oficiales.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSocialsShowInCatalog(!socialsShowInCatalog)}
            className={cn(
              'w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer flex items-center border-0 shrink-0',
              socialsShowInCatalog ? 'bg-zinc-900 justify-end' : 'bg-zinc-200 justify-start'
            )}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Instagram</label>
          <input
            type="text"
            value={socials.instagram}
            onChange={e => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
            placeholder="https://instagram.com/tu_marca"
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">TikTok</label>
          <input
            type="text"
            value={socials.tiktok}
            onChange={e => setSocials(prev => ({ ...prev, tiktok: e.target.value }))}
            placeholder="https://tiktok.com/@tu_marca"
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">Facebook</label>
          <input
            type="text"
            value={socials.facebook}
            onChange={e => setSocials(prev => ({ ...prev, facebook: e.target.value }))}
            placeholder="https://facebook.com/tu_marca"
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-800 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-zinc-500 block">X / Twitter</label>
          <input
            type="text"
            value={socials.twitter}
            onChange={e => setSocials(prev => ({ ...prev, twitter: e.target.value }))}
            placeholder="https://x.com/tu_marca"
            className="w-full bg-white border border-zinc-200 focus:border-zinc-950 rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-800 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
