import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { CreativeMode, CreativeTone } from '../types'

interface FormatosTabProps {
  onSelectFormat: (mode: CreativeMode, tone: CreativeTone) => void
}

export function FormatosTab({ onSelectFormat }: FormatosTabProps) {
  const formats = [
    {
      title: '⚡ Oferta Flash 24 Horas',
      tag: 'Urgencia Extrema',
      desc: 'Gancho directo al precio con descuento y cuenta regresiva psicológica. Ideal para liquidar stock de productos.',
      mode: 'DYNAMIC_REEL' as CreativeMode,
      tone: 'urgency' as CreativeTone
    },
    {
      title: '💎 Unboxing & Lujo Visual',
      tag: 'Alta Gama',
      desc: 'Transiciones lentas, iluminación de estudio y foco en texturas y materiales para justificar un ticket alto.',
      mode: 'GENERATIVE_I2V' as CreativeMode,
      tone: 'luxury' as CreativeTone
    },
    {
      title: '🤝 Testimonio Cliente Satisfecho',
      tag: 'Confianza & Prueba Social',
      desc: 'Un vocero digital cuenta su experiencia real utilizando el producto para derribar objeciones de compra.',
      mode: 'AVATAR_UGC' as CreativeMode,
      tone: 'casual' as CreativeTone
    }
  ]

  return (
    <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-5 animate-in fade-in duration-300">
      <div className="border-b border-zinc-100 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Catálogo de Formatos Virales para E-Commerce</h2>
        <p className="text-[11px] text-zinc-500 font-medium">Estructuras probadas para maximizar ventas en TikTok, Instagram y WhatsApp.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {formats.map((p, idx) => (
          <div key={idx} className="border border-zinc-200/80 rounded-lg p-4 bg-white flex flex-col justify-between space-y-3 hover:border-zinc-300 transition-all">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                {p.tag}
              </span>
              <h3 className="text-xs font-bold text-zinc-900 mt-1">{p.title}</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{p.desc}</p>
            </div>

            <button
              onClick={() => onSelectFormat(p.mode, p.tone)}
              className="w-full h-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Usar esta plantilla</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
