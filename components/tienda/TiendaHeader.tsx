import Link from 'next/link'
import { ExternalLink, Save } from 'lucide-react'
import { ActiveTab } from './types'

interface TiendaHeaderProps {
  subdomain: string
  isSaving: boolean
  onSaveChanges: () => void
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
}

const TABS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'estilo', label: '🎨 Estilos & Temas' },
  { id: 'encabezado', label: '🖼️ Encabezado & Hero' },
  { id: 'productos', label: '🛍️ Tarjetas & Catálogo' },
  { id: 'secciones', label: '🧩 Secciones & Bento' },
  { id: 'info', label: 'ℹ️ Información' },
  { id: 'dominios', label: '🌐 Dominios' },
  { id: 'seo', label: '🔍 SEO' },
  { id: 'redes', label: '📱 Redes' },
  { id: 'politicas', label: '📜 Políticas' }
]

export function TiendaHeader({
  subdomain,
  isSaving,
  onSaveChanges,
  activeTab,
  setActiveTab
}: TiendaHeaderProps) {
  return (
    <>
      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none pb-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Tienda
            </h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              Personaliza la apariencia de tu tienda online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/tienda/${subdomain}`} target="_blank">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none cursor-pointer select-none"
            >
              <span>Vista previa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
          
          <button
            type="button"
            onClick={onSaveChanges}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs xl:text-sm font-bold rounded-lg transition-all shadow-none active:scale-[0.98] cursor-pointer select-none"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      </header>

      {/* Tabs navigation bar */}
      <div className="flex items-center gap-6 border-b border-zinc-200 overflow-x-auto select-none mt-2 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-zinc-900 text-zinc-900' 
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  )
}
