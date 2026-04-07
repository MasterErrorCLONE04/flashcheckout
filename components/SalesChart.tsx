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
      <div className="h-64 flex items-center justify-center text-zinc-400 text-[13px] font-medium tracking-tight border border-gray-200 bg-white rounded-lg">
        Sincronizando registros financieros...
      </div>
    )
  }

  // Personalización del tooltip: Estética Apple Glass
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 p-5 rounded-lg ring-1 ring-zinc-950/5">
          <p className="font-medium text-[13px] tracking-tight text-zinc-400 mb-2">{label}</p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-zinc-950 font-medium text-2xl tracking-tighter tabular-nums font-display">
              ${payload[0].value.toLocaleString('es-CO')}
            </p>
          </div>
          <p className="text-[11px] font-medium text-zinc-300 tracking-tight mt-2">Sincronizado vía Flash</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex flex-col pt-2 transition-all duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-zinc-500 tracking-tight">Tiempo real</span>
          </div>
          <div className="h-4 w-px bg-zinc-100" />
          <span className="text-[11px] font-medium text-zinc-400 tracking-tight">Protocolo: Activo</span>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.02)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: '#A1A1AA', fontWeight: '400', letterSpacing: '-0.02em' }}
              dy={15}
            />
            <YAxis hide domain={['dataMin - 1000', 'dataMax + 5000']} />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'rgba(0, 102, 204, 0.05)', strokeWidth: 40 }} 
            />
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.08}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.00}/>
              </linearGradient>
              <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
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
                r: 5, 
                stroke: '#ffffff', 
                strokeWidth: 3, 
                fill: '#10B981',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
