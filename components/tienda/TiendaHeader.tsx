import Link from 'next/link'
import { ExternalLink, Loader2, Save } from 'lucide-react'
import { PageHeader, PageTabs } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { ActiveTab } from './types'

interface TiendaHeaderProps {
  subdomain: string
  isSaving: boolean
  hasUnsavedChanges?: boolean
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
  { id: 'politicas', label: '📜 Políticas' },
]

export function TiendaHeader({
  subdomain,
  isSaving,
  hasUnsavedChanges = false,
  onSaveChanges,
  activeTab,
  setActiveTab,
}: TiendaHeaderProps) {
  return (
    <>
      <PageHeader
        title="Tienda"
        statusDot="emerald"
        subtitle="Personaliza la apariencia de tu tienda online."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/tienda/${subdomain}`} target="_blank">
                <span>Vista previa</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </Button>

            <Button
              type="button"
              onClick={onSaveChanges}
              disabled={isSaving}
              className={hasUnsavedChanges ? 'bg-emerald-600 hover:bg-emerald-700 text-white relative' : ''}
              title="Presiona Ctrl+S para guardar en cualquier momento"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? 'Guardando...' : hasUnsavedChanges ? 'Guardar cambios *' : 'Guardar cambios'}</span>
              {hasUnsavedChanges && !isSaving && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-1" />
              )}
            </Button>
          </>
        }
      />

      <PageTabs<ActiveTab>
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={TABS}
        className="mt-2"
      />
    </>
  )
}
