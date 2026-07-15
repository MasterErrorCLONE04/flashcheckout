'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { Zap } from 'lucide-react'

type ChartTooltipEntry = {
  name?: string
  value?: number | string
}

type ChartTooltipProps = {
  active?: boolean
  payload?: ChartTooltipEntry[]
  label?: string | number
}

// 1. STACKED BAR CHART (Actividad Comercial)
type BarChartItem = {
  date: string
  webSales: number
  whatsappSales: number
  total: number
}

export function StackedBarChart({ data }: { data: BarChartItem[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-50/50 rounded-xl border border-zinc-100">
        Cargando gráfico de actividad...
      </div>
    )
  }

  const formatYAxis = (value: number) => {
    if (value === 0) return '$0'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      const whatsapp = Number(payload.find((p) => p.name === 'whatsappSales')?.value ?? 0)
      const web = Number(payload.find((p) => p.name === 'webSales')?.value ?? 0)
      const total = whatsapp + web

      return (
        <div className="bg-white/95 backdrop-blur-md border border-zinc-200 p-4 rounded-xl shadow-lg ring-1 ring-zinc-950/5 flex flex-col gap-2">
          <p className="font-bold text-xs text-zinc-400 uppercase tracking-widest">{label}</p>
          <div className="space-y-1.5 text-xs font-semibold text-zinc-800">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-[#10B981]" />
                <span>Ventas WhatsApp</span>
              </div>
              <span className="font-bold tabular-nums text-zinc-950">${whatsapp.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-[#18181B]" />
                <span>Ventas Web</span>
              </div>
              <span className="font-bold tabular-nums text-zinc-950">${web.toLocaleString('es-CO')}</span>
            </div>
            <div className="h-px bg-zinc-100 my-1 w-full" />
            <div className="flex items-center justify-between gap-8 text-[13px] font-extrabold text-zinc-950">
              <span>Total del Día</span>
              <span className="tabular-nums text-emerald-600">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A', fontWeight: '600' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: '#71717A', fontWeight: '600' }}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)', radius: 6 }} />
          <Bar 
            dataKey="webSales" 
            name="webSales" 
            stackId="a" 
            fill="#18181B" 
            radius={[0, 0, 4, 4]} 
            barSize={24}
          />
          <Bar 
            dataKey="whatsappSales" 
            name="whatsappSales" 
            stackId="a" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]} 
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 2. SALES CHANNEL DONUT (Canal de Ventas)
type DonutProps = {
  whatsappTotal: number
  webTotal: number
}

export function SalesChannelDonut({ whatsappTotal, webTotal }: DonutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const total = whatsappTotal + webTotal
  const data = [
    { name: 'WhatsApp', value: whatsappTotal || 1, color: '#10B981' },
    { name: 'Web', value: webTotal || 1, color: '#18181B' }
  ]

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-50/50 rounded-xl border border-zinc-100">
        Cargando distribución...
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none z-10">
        <span className="text-[9px] font-extrabold text-zinc-400 tracking-widest leading-none">Total</span>
        <span className="text-[15px] font-bold text-zinc-950 tracking-tight mt-1 leading-none">
          ${total.toLocaleString('es-CO')}
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={64}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number | string) => [
              `$${Number(value).toLocaleString('es-CO')}`,
              'Monto'
            ]}
            contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E4E4E7', fontSize: '11px', fontWeight: 'bold' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// 3. MINI SPARKLINE (Sparkline de tarjetas KPI)
type SparklineItem = {
  value: number
}

export function MiniSparkline({ data, strokeColor = '#10B981' }: { data: SparklineItem[], strokeColor?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !data || data.length === 0) {
    return <div className="h-full w-full" />
  }

  const gradientId = `sparkGradient-${strokeColor.replace('#', '')}`
  
  // Clean flat values logic (avoid line touching absolute bottom of the card)
  const firstVal = data[0]?.value ?? 0
  const isFlat = data.every(d => d.value === firstVal)
  const domain = isFlat ? [firstVal - 10, firstVal + 10] : ['dataMin', 'dataMax']

  return (
    <div className="w-full h-full opacity-85">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.00}/>
            </linearGradient>
          </defs>
          <YAxis hide domain={domain} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// 4. GENERAL SCORE CIRCLE (Estado General del Negocio)
export function GeneralScoreCircle({ score = 97 }: { score?: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-zinc-100"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-emerald-500 transition-all duration-1000 ease-out"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold text-zinc-950 tabular-nums tracking-tighter">{score}</span>
        <span className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-widest -mt-1">/100</span>
      </div>
    </div>
  )
}

// 5. BOT STATUS CIRCLE (Estado del Bot de WhatsApp)
export function BotStatusCircle({ isOnline = true }: { isOnline?: boolean }) {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {isOnline && (
        <div className="absolute inset-0 rounded-full bg-emerald-500/5 border border-emerald-500/15 animate-pulse" />
      )}
      
      <div className="relative w-14 h-14 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center z-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOnline ? 'bg-emerald-50/60 text-emerald-600' : 'bg-rose-50/60 text-rose-600'}`}>
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.42 9.86-9.864.001-2.636-1.02-5.11-2.871-6.963C16.6 1.926 14.12 1.002 11.48 1.002c-5.437 0-9.857 4.418-9.86 9.852 0 1.686.443 3.327 1.285 4.767l-.98 3.577 3.664-.961zm11.834-6.87c-.11-.18-.403-.288-.844-.508-.44-.22-2.61-1.287-3.013-1.433-.404-.147-.698-.22-.99.22-.294.44-1.138 1.432-1.395 1.727-.257.293-.513.33-.954.11-.44-.22-1.86-.687-3.546-2.19-1.31-1.17-2.195-2.613-2.452-3.053-.257-.44-.027-.678.194-.897.198-.197.44-.513.66-.77.22-.256.293-.44.44-.733.147-.293.073-.55-.036-.77-.11-.22-.99-2.383-1.356-3.264-.356-.856-.718-.74-.99-.753-.252-.012-.54-.015-.828-.015-.288 0-.757.108-1.15.538-.394.43-1.503 1.468-1.503 3.577 0 2.11 1.537 4.148 1.748 4.443.21.294 3.027 4.62 7.33 6.482 1.023.443 1.822.708 2.443.904 1.028.327 1.964.28 2.7.17.82-.122 2.61-1.066 2.978-2.09.367-1.023.367-1.9.257-2.083z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// 6. WEEKLY SALES AREA CHART (Ventas Últimos 7 Días)
type WeeklySalesItem = {
  date: string
  value: number
}

export function WeeklySalesAreaChart({ data }: { data: WeeklySalesItem[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-50/50 rounded-xl border border-zinc-100">
        Cargando gráfico...
      </div>
    )
  }

  const formatYAxis = (value: number) => {
    if (value === 0) return '$0'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#71717A', fontWeight: '600' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: '#71717A', fontWeight: '600' }}
            dx={-5}
          />
          <Tooltip 
            formatter={(value: number | string) => [
              `$${Number(value).toLocaleString('es-CO')}`,
              'Ingresos'
            ]}
            contentStyle={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E4E4E7', fontSize: '11px', fontWeight: 'bold' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10B981"
            strokeWidth={2}
            fill="none"
            dot={{ r: 3, stroke: '#10B981', strokeWidth: 1, fill: '#FFF' }}
            activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#FFF' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
