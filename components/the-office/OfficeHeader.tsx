import { Building, Sliders, Terminal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
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
  ordersCount
}: OfficeHeaderProps) {
  const {
    isEditingLayout,
    setIsEditingLayout,
    setSelectedItemId,
    setLogsModalOpen,
    setHiringModalOpen,
    customAgents
  } = office

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
            <Building className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-950">The Office</h1>
            <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">
              Centro Agéntico de Operaciones de {storeName}
            </p>
          </div>
        </div>
      </div>
      
      {/* Header Actions & Stats */}
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => {
            setIsEditingLayout(!isEditingLayout)
            setSelectedItemId(null)
            toast.info(isEditingLayout ? 'Personalización cerrada.' : '¡Modo de maquetación activo! Utiliza la cuadrícula para reordenar tu oficina.')
          }}
          className={cn(
            "text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-sm active:scale-98 transition-all select-none cursor-pointer border",
            isEditingLayout
              ? "border-purple-700 hover:bg-purple-700 text-white"
              : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800"
          )}
          style={isEditingLayout ? { backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#6d28d9' } : {}}
        >
          <Sliders className="w-4 h-4" />
          <span>{isEditingLayout ? 'Salir de Edición' : 'Personalizar oficina'}</span>
        </button>

        <button 
          type="button"
          onClick={() => setLogsModalOpen(true)}
          className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-sm active:scale-98 transition-all select-none cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-zinc-650" />
          <span>Ver Logs</span>
        </button>

        <button 
          type="button"
          onClick={() => setHiringModalOpen(true)}
          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-200/20 text-white text-xs font-bold rounded-xl px-4 py-2.5 flex items-center gap-1.5 shadow-md active:scale-98 transition-all select-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Contratar Agente</span>
        </button>

        <div className="flex items-center gap-6 bg-white border border-zinc-200/80 px-4 py-2 rounded-xl shadow-sm">
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block leading-none">Productos</span>
            <span className="text-base font-black text-zinc-900 mt-1 block leading-none">{productsCount}</span>
          </div>
          <div className="w-px h-6 bg-zinc-200" />
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block leading-none">Pedidos</span>
            <span className="text-base font-black text-zinc-900 mt-1 block leading-none">{ordersCount}</span>
          </div>
          <div className="w-px h-6 bg-zinc-200" />
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block leading-none">Agentes Activos</span>
            <span className="text-base font-black text-emerald-600 mt-1 block leading-none animate-pulse">
              {BASE_AGENTS.length + customAgents.length} / 8
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
