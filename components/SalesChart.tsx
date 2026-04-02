'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type SalesData = {
  date: string
  total: number
}

export default function SalesChart({ data }: { data: SalesData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400 text-xs font-bold tracking-widest border border-black/[0.03] bg-zinc-50/50 rounded-3xl uppercase">
        Sincronizando registros financieros...
      </div>
    )
  }

  // Personalización del tooltip: Estética Apple Glass
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-2xl border border-black/[0.03] p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.01] uppercase">
          <p className="font-bold text-[11px] tracking-widest text-zinc-400 mb-2">{label}</p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,102,204,0.4)]" />
            <p className="text-black font-bold text-2xl tracking-tighter tabular-nums font-display">
              ${payload[0].value.toLocaleString('es-CO')}
            </p>
          </div>
          <p className="text-[10px] font-bold text-zinc-300 tracking-widest mt-2">Sincronizado vía Stripe</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex flex-col pt-2 transition-all duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-50 border border-black/[0.03] px-4 py-2 rounded-2xl flex items-center gap-3 shadow-inner uppercase">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,102,204,0.4)]" />
            <span className="text-xs font-bold text-zinc-500 tracking-widest">En tiempo real</span>
          </div>
          <div className="h-4 w-px bg-black/[0.05]" />
          <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Protocolo: Activo</span>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.02)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: '700', letterSpacing: '0.15em' }}
              dy={15}
            />
            <YAxis hide domain={['dataMin - 1000', 'dataMax + 5000']} />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'rgba(0, 102, 204, 0.05)', strokeWidth: 40 }} 
            />
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066CC" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#0066CC" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0066CC" />
                <stop offset="100%" stopColor="#2997FF" />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="total"
              stroke="url(#lineColor)"
              strokeWidth={4}
              fill="url(#areaGradient)"
              fillOpacity={1}
              strokeLinecap="round"
              animationDuration={2500}
              activeDot={{ 
                r: 6, 
                stroke: '#ffffff', 
                strokeWidth: 3, 
                fill: '#0066CC',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
