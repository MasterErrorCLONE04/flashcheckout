'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare, ChevronRight, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { AUTOMATION_TEMPLATES } from './types'

interface AutomatizacionesSidebarProps {
  totalSentToday: number
  averageRate: number
  onUseTemplate: (name: string, desc: string, icon: string, channels: string[]) => void
}

export function AutomatizacionesSidebar({
  totalSentToday,
  averageRate,
  onUseTemplate,
}: AutomatizacionesSidebarProps) {
  const router = useRouter()

  return (
    <div className="lg:col-span-4 space-y-5">
      {/* Card 1: Plantillas disponibles */}
      <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
        <h4 className="text-xs font-bold text-zinc-950 tracking-wider select-none">
          Plantillas disponibles
        </h4>

        <div className="space-y-3">
          {AUTOMATION_TEMPLATES.map((temp, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-zinc-50 last:border-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7.5 h-7.5 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-sm shrink-0 select-none">
                  {temp.icon}
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-zinc-900 truncate leading-tight text-[11px]">
                    {temp.name}
                  </h5>
                  <span className="text-[9px] font-semibold text-zinc-400 block leading-tight truncate">
                    {temp.desc}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onUseTemplate(temp.name, temp.desc, temp.icon, temp.channels)}
                className="h-7.5 px-3 border border-zinc-200 hover:bg-zinc-50 text-[10px] font-bold text-zinc-800 rounded-lg shrink-0 cursor-pointer select-none transition-all active:scale-95"
              >
                Usar
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => toast.info('Todas las plantillas cargadas')}
          className="w-full text-center py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-0.5"
        >
          <span>Ver todas las plantillas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card 2: Resumen de automatizaciones */}
      <div className="bg-white border border-zinc-200 p-5 rounded-lg space-y-4">
        <div className="flex justify-between items-baseline select-none">
          <h4 className="text-xs font-bold text-zinc-950 tracking-wider">
            Resumen de automatizaciones
          </h4>
          <select className="bg-transparent border-none text-[9px] font-bold text-zinc-500 cursor-pointer focus:outline-none hover:text-zinc-950 transition-colors p-0">
            <option>Este mes</option>
            <option>Esta semana</option>
            <option>Hoy</option>
          </select>
        </div>

        <div className="space-y-4">
          {/* Stat 1 */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 block select-none">
              Mensajes enviados
            </span>
            <span className="text-2xl font-bold text-zinc-950 block leading-none tabular-nums">
              {totalSentToday + 28}
            </span>
            <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 select-none">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                18% <span className="text-zinc-400 font-semibold">vs mes anterior</span>
              </span>
            </div>
          </div>

          {/* Stat grid (1x2) */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-50">
            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-zinc-400 block select-none">
                Tasa prom. apertura
              </span>
              <span className="text-lg font-bold text-zinc-950 block leading-none tabular-nums">
                {averageRate > 0 ? `${averageRate}%` : '94%'}
              </span>
              <div className="flex items-center gap-0.5 text-[8px] font-bold text-zinc-500 select-none">
                <TrendingUp className="w-3 h-3" />
                <span>
                  6% <span className="text-zinc-400 font-semibold">vs mes</span>
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-semibold text-zinc-400 block select-none">
                Tasa prom. conversión
              </span>
              <span className="text-lg font-bold text-zinc-950 block leading-none tabular-nums">
                23%
              </span>
              <div className="flex items-center gap-0.5 text-[8px] font-bold text-zinc-500 select-none">
                <TrendingUp className="w-3 h-3" />
                <span>
                  4% <span className="text-zinc-400 font-semibold">vs mes</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: ¿Necesitas ayuda? */}
      <div className="bg-white border border-zinc-200 p-5 rounded-lg flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-950 tracking-wider select-none">
            ¿Necesitas ayuda?
          </h4>
          <p className="text-[10px] text-zinc-400 font-semibold leading-normal max-w-[150px]">
            Nova puede ayudarte a crear y configurar tus automatizaciones.
          </p>
          <button
            onClick={() => router.push('/hablar-con-nova')}
            className="h-8.5 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
            <span>Hablar con Nova</span>
          </button>
        </div>
        {/* Robot mascot avatar */}
        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 select-none text-2xl border border-zinc-100">
          🤖
        </div>
      </div>
    </div>
  )
}

