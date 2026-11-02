import { Plus } from 'lucide-react'
import { LayoutItem } from './types'

interface OfficeSidebarFurnitureProps {
  onAddItem: (type: LayoutItem['type']) => void
}

export function OfficeSidebarFurniture({ onAddItem }: OfficeSidebarFurnitureProps) {
  return (
    <div className="w-full xl:w-64 bg-zinc-950 border border-zinc-800 rounded-3xl p-4 flex flex-col shrink-0 text-left select-none shadow-xl animate-in slide-in-from-right duration-250">
      <h3 className="text-white font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <Plus className="w-4 h-4 text-emerald-500" />
        <span>Agregar puesto</span>
      </h3>
      <p className="text-[10px] text-zinc-500 font-semibold mb-4 leading-normal">
        Haz clic en uno de los puestos de abajo para agregarlo a la oficina:
      </p>
      
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => onAddItem('desk')}
          className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-lg">🖥️</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-none">Escritorio</span>
              <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 3x3</span>
            </div>
          </div>
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
        </button>

        <button
          type="button"
          onClick={() => onAddItem('meeting')}
          className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-none">Mesa grande</span>
              <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 3x2</span>
            </div>
          </div>
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
        </button>

        <button
          type="button"
          onClick={() => onAddItem('lounge')}
          className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-lg">🛋️</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-none">Lounge</span>
              <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 4x2</span>
            </div>
          </div>
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
        </button>

        <button
          type="button"
          onClick={() => onAddItem('plant')}
          className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-lg">🪴</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-none">Planta</span>
              <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 1x1</span>
            </div>
          </div>
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
        </button>

        <button
          type="button"
          onClick={() => onAddItem('shelf')}
          className="w-full bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800/60 p-3 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-lg">📚</span>
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-none">Estantería</span>
              <span className="text-[9px] text-zinc-500 mt-1 block">Tamaño: 2x2</span>
            </div>
          </div>
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </div>

      <div className="mt-6 bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-xl text-[10px] text-zinc-400 font-semibold leading-relaxed">
        <span className="text-[8px] uppercase tracking-wider font-black text-amber-500 block mb-1">💡 Consejo</span>
        <span>Cada puesto ocupa un espacio determinado. Planifica tu oficina estratégicamente.</span>
      </div>
    </div>
  )
}
