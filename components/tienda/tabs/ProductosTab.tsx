import { cn } from "@/lib/utils"
import { Layout } from 'lucide-react'
import { TiendaFormState } from '../useTiendaForm'

interface ProductosTabProps {
  form: TiendaFormState
}

export function ProductosTab({ form }: ProductosTabProps) {
  const {
    cardStyle,
    setCardStyle,
    cardAspectRatio,
    setCardAspectRatio,
    badgeStyle,
    setBadgeStyle,
    catalogColumns,
    setCatalogColumns
  } = form

  return (
    <div className="space-y-6">
      {/* Estilo de Tarjeta de Producto */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-zinc-900 leading-none">Estilo de Tarjeta de Producto</h3>
          </div>
          <p className="text-[11px] font-semibold text-zinc-400">Cómo se presentarán los productos en el grid del catálogo.</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'minimal-elevated' as const, label: 'Elevada', desc: 'Sombra suave & zoom' },
            { id: 'clean-border' as const, label: 'Editorial', desc: 'Bordes finos 1px' },
            { id: 'glass-card' as const, label: 'Glass', desc: 'Fondo translúcido' },
          ].map((cs) => (
            <button
              key={cs.id}
              type="button"
              onClick={() => setCardStyle(cs.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                cardStyle === cs.id
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
              )}
            >
              <span className="font-black text-xs leading-none">{cs.label}</span>
              <span className={cn("text-[9px] font-semibold", cardStyle === cs.id ? "text-zinc-300" : "text-zinc-400")}>
                {cs.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Proporción de Imagen de Producto */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Proporción de Foto (Aspect Ratio)</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Ajusta la forma del contenedor de imagen del producto.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {[
            { id: 'square' as const, label: 'Cuadrada (1:1)', desc: 'Ideal para café, tecnología y alimentos' },
            { id: 'portrait' as const, label: 'Retrato (4:5)', desc: 'Ideal para moda, ropa y accesorios' },
          ].map((ar) => (
            <button
              key={ar.id}
              type="button"
              onClick={() => setCardAspectRatio(ar.id)}
              className={cn(
                "p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1",
                cardAspectRatio === ar.id
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
              )}
            >
              <span className="font-black text-xs">{ar.label}</span>
              <span className={cn("text-[9.5px]", cardAspectRatio === ar.id ? "text-zinc-300" : "text-zinc-500")}>
                {ar.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Estilo de Badges de Categoría */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Estilo de Etiquetas (Badges)</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Diseño de las etiquetas flotantes sobre las fotos de producto.</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'pill' as const, label: 'Píldora Sutil', desc: 'Fondo suave' },
            { id: 'solid' as const, label: 'Sólido', desc: 'Contraste vivo' },
            { id: 'outline' as const, label: 'Outline', desc: 'Línea fina' },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBadgeStyle(b.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                badgeStyle === b.id
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
              )}
            >
              <span className="font-black text-xs leading-none">{b.label}</span>
              <span className={cn("text-[9px] font-semibold", badgeStyle === b.id ? "text-zinc-300" : "text-zinc-400")}>
                {b.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Columnas de Catálogo en Escritorio */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-none text-left">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-zinc-900 leading-none">Columnas en Pantalla Grande</h3>
          <p className="text-[11px] font-semibold text-zinc-400">Densidad de productos mostrados por fila en escritorio.</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: '3' as const, label: '3 Columnas', desc: 'Tarjetas grandes' },
            { id: '4' as const, label: '4 Columnas', desc: 'Balance óptimo' },
            { id: '5' as const, label: '5 Columnas', desc: 'Compacto' },
          ].map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setCatalogColumns(col.id)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                catalogColumns === col.id
                  ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                  : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
              )}
            >
              <span className="font-black text-xs leading-none">{col.label}</span>
              <span className={cn("text-[9px] font-semibold", catalogColumns === col.id ? "text-zinc-300" : "text-zinc-400")}>
                {col.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
