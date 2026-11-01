import React from 'react'
import { Video } from 'lucide-react'

interface CreacionesTabProps {
  savedCreations: any[]
  onNewCreation: () => void
  onCopyText: (text: string, key: string) => void
  onRepublish: (item: any) => void
}

export function CreacionesTab({
  savedCreations,
  onNewCreation,
  onCopyText,
  onRepublish
}: CreacionesTabProps) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Biblioteca de Creaciones Multimedia</h2>
          <p className="text-[11px] text-zinc-500 font-medium">Revisa y republica las piezas generadas previamente por Studio IA.</p>
        </div>
        <button
          onClick={onNewCreation}
          className="h-9 px-3.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          + Crear Nueva Pieza
        </button>
      </div>

      {savedCreations.length === 0 ? (
        <div className="py-14 text-center space-y-3 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400 border border-zinc-200">
            <Video className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-zinc-900">Aún no tienes creaciones guardadas</h3>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto font-medium">
              Selecciona un producto en el Estudio Creativo y genera tu primer video publicitario o reel para WhatsApp.
            </p>
          </div>
          <button
            onClick={onNewCreation}
            className="h-9 px-4 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            Comenzar ahora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {savedCreations.map((item: any) => (
            <div key={item.id} className="border border-zinc-200/80 rounded-lg p-3.5 bg-white hover:border-zinc-300 flex flex-col justify-between space-y-3 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-100 rounded-md overflow-hidden shrink-0 border border-zinc-200/60">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-5 h-5 m-3.5 text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-zinc-900 block truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={() => onCopyText(item.copyCaption || '', 'saved')}
                  className="flex-1 h-8 text-[11px] font-semibold bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-700 cursor-pointer text-center transition-all active:scale-95"
                >
                  Copiar Copy
                </button>
                <button
                  onClick={() => onRepublish(item)}
                  className="h-8 px-3 text-[11px] font-bold bg-[#25D366] text-white rounded-lg hover:bg-[#20ba59] cursor-pointer shadow-xs transition-all active:scale-95"
                >
                  Re-publicar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
