import { Building, Sliders, Terminal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { OfficeState } from './useOfficeState'
import { BASE_AGENTS } from './types'

interface OfficeHeaderProps {
  office: OfficeState
  storeName: string
  productsCount: number
  ordersCount: number
}

export function OfficeHeader({
  office,
  storeName,
  productsCount,
  ordersCount,
}: OfficeHeaderProps) {
  const {
    isEditingLayout,
    setIsEditingLayout,
    setSelectedItemId,
    setLogsModalOpen,
    setHiringModalOpen,
    customAgents,
  } = office

  return (
    <PageHeader
      title="The Office"
      icon={<Building className="w-5 h-5" />}
      statusDot="emerald"
      subtitle={`Centro agéntico de operaciones de ${storeName}`}
      actions={
        <>
          <Button
            type="button"
            variant={isEditingLayout ? 'default' : 'outline'}
            onClick={() => {
              setIsEditingLayout(!isEditingLayout)
              setSelectedItemId(null)
              toast.info(
                isEditingLayout
                  ? 'Personalización cerrada.'
                  : '¡Modo de maquetación activo! Utiliza la cuadrícula para reordenar tu oficina.'
              )
            }}
            className={cn(
              isEditingLayout && 'bg-purple-600 border-purple-600 hover:bg-purple-700 text-white'
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditingLayout ? 'Salir de edición' : 'Personalizar oficina'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setLogsModalOpen(true)}
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span>Ver Logs</span>
          </Button>

          <Button
            type="button"
            onClick={() => setHiringModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Contratar Agente</span>
          </Button>

          <div className="flex items-center gap-5 bg-white border border-zinc-200 px-3.5 h-9 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-medium">Productos</span>
              <span className="font-semibold text-zinc-900 tabular-nums">{productsCount}</span>
            </div>
            <div className="w-px h-4 bg-zinc-200" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-medium">Pedidos</span>
              <span className="font-semibold text-zinc-900 tabular-nums">{ordersCount}</span>
            </div>
            <div className="w-px h-4 bg-zinc-200" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400 font-medium">Agentes</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                {BASE_AGENTS.length + customAgents.length}/8
              </span>
            </div>
          </div>
        </>
      }
    />
  )
}
