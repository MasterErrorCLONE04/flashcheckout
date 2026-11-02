'use client'

import { Zap, ChevronRight, HelpCircle, Mail, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Automation } from './types'

interface AutomatizacionesListProps {
  loading: boolean
  automations: Automation[]
  onToggle: (automationId: string, currentActive: boolean) => void
  onConfigure: (automation: Automation) => void
}

export function AutomatizacionesList({
  loading,
  automations,
  onToggle,
  onConfigure,
}: AutomatizacionesListProps) {
  return (
    <div className="lg:col-span-8 space-y-4">
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-16 flex flex-col items-center justify-center text-zinc-400 select-none">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mb-2" />
          <span className="text-xs font-semibold">Cargando automatizaciones del negocio...</span>
        </div>
      ) : automations.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-16 flex flex-col items-center justify-center text-center text-zinc-400 select-none">
          <Zap className="w-10 h-10 text-zinc-200 mb-2" />
          <h4 className="text-sm font-bold text-zinc-800">No hay automatizaciones</h4>
          <p className="text-xs text-zinc-400 font-semibold max-w-sm mt-1">
            Configura o selecciona una plantilla para automatizar tus envíos.
          </p>
        </div>
      ) : (
        automations.map(item => (
          <div
            key={item.id}
            className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
          >
            {/* Left Card info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-xl shrink-0 select-none">
                {item.icon}
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-bold text-zinc-950 text-sm leading-none">{item.name}</h3>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide leading-none border scale-95',
                      item.active
                        ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                    )}
                  >
                    {item.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  {item.description}
                </p>

                {/* Channel capsules list */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {item.channels.map((chan, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border leading-none select-none',
                        chan === 'WhatsApp'
                          ? 'bg-emerald-50/50 text-emerald-600 border-emerald-200/50'
                          : 'bg-blue-50/50 text-blue-600 border-blue-200/50'
                      )}
                    >
                      {chan === 'WhatsApp' ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3 h-3 fill-current text-[#25D366] shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      ) : (
                        <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                      )}
                      <span>{chan}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Card actions / toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-6 xl:gap-8 w-full sm:w-auto border-t sm:border-t-0 border-zinc-50 pt-3 sm:pt-0 shrink-0">
              {/* Toggle Switch */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(item.id, item.active)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-0',
                    item.active ? 'bg-zinc-900' : 'bg-zinc-200'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
                      item.active ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Stats columns */}
              <div className="flex items-center gap-6 text-left shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block select-none">
                    Enviados hoy
                  </span>
                  <span className="text-sm font-bold text-zinc-950 tabular-nums">
                    {item.sentToday}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block select-none">
                    {item.rateLabel}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-bold tabular-nums',
                      item.active && parseInt(item.rate) > 0 ? 'text-zinc-900' : 'text-zinc-600'
                    )}
                  >
                    {item.rate}
                  </span>
                </div>
              </div>

              {/* Action Menu: Configurar */}
              <button
                onClick={() => onConfigure(item)}
                className="h-8 px-2.5 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950 text-[10px] font-bold text-zinc-600 rounded-lg shrink-0 cursor-pointer select-none transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                <span>Configurar</span>
              </button>
            </div>
          </div>
        ))
      )}

      {/* Bottom disclaimer banner */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 flex items-start gap-2.5 px-4.5 select-none">
        <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
          Las automatizaciones se ejecutan según las reglas configuradas y la disponibilidad de los canales conectados.{' '}
          <a href="#" className="text-zinc-700 hover:underline inline-flex items-center gap-0.5 font-bold">
            Ver documentación <ChevronRight className="w-3 h-3 inline-block" />
          </a>
        </p>
      </div>
    </div>
  )
}

