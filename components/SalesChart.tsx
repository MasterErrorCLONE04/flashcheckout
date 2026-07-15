'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type SalesChartTooltipProps = {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string | number
}

type SalesData = {
  date: string
  total: number
}

export default function SalesChart({ data }: { data: SalesData[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[13px] font-medium tracking-tight border border-gray-100 bg-zinc-50/50 rounded-lg">
        Sincronizando registros financieros...
      </div>
    )
  }

  // Personalización del tooltip: Estética Apple Glass
  const CustomTooltip = ({ active, payload, label }: SalesChartTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 p-5 rounded-lg ring-1 ring-zinc-950/5">
          <p className="font-medium text-[13px] tracking-tight text-zinc-400 mb-2">{label}</p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-zinc-950 font-medium text-2xl tracking-tighter tabular-nums font-display">
              ${Number(payload[0].value ?? 0).toLocaleString('es-CO')}
            </p>
          </div>
          <p className="text-[11px] font-medium text-zinc-300 tracking-tight mt-2">Sincronizado vía Flash</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full relative z-10 transition-all duration-700">
      <ResponsiveContainer width="100%" height="100%">
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
  )
}
