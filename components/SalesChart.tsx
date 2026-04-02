'use client'

import {
  LineChart,
  Line,
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
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm border border-border bg-white rounded-2xl">
        Aún no hay suficientes datos para generar el gráfico.
      </div>
    )
  }

  // Personalización del tooltip cuando haces "hover" (Pasar el cursor por encima)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border text-sm border-border p-3 rounded-lg shadow-xl">
          <p className="font-semibold mb-1 text-foreground">{label}</p>
          <p className="text-emerald-600 font-bold">
            Ingresos: ${payload[0].value.toLocaleString('es-CO')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 sm:h-80 w-full bg-white border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        Ventas de los Últimos 7 Días
      </h3>
      <div className="h-[calc(100%-2.5rem)] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dy={10}
            />
            {/* Ocultamos YAxis en móviles para ahorrar espacio gráfico, pero mostramos el grid */}
            <YAxis 
              hide
              domain={['dataMin', 'dataMax + 10000']} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ stroke: '#059669', strokeWidth: 2, r: 4, fill: '#fff' }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
