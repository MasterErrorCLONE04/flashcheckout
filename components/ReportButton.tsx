'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ReportButton({ 
  orderId, 
  initialReported = false 
}: { 
  orderId: string
  initialReported?: boolean
}) {
  const [reported, setReported] = useState(initialReported)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleReport() {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setReported(true)
        setShowConfirm(false)
        toast.success('Pedido reportado con éxito')
      } else {
        toast.error(data.error || 'Error al reportar el pedido')
      }
    } catch {
      toast.error('Error de red al reportar')
    } finally {
      setLoading(false)
    }
  }

  if (reported) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold select-none">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span>Pedido Reportado</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="inline-flex w-full justify-center text-sm text-red-600 font-semibold hover:underline items-center gap-1.5 py-2 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          Reportar Problema con el Pedido
        </button>
      ) : (
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 text-center space-y-3 animate-in fade-in duration-200">
          <p className="text-xs text-red-800 font-medium">
            ¿Confirmas que tuviste un problema/fraude con este pedido? Esto registrará un reporte contra el comercio.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleReport}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-650 rounded-lg cursor-pointer hover:bg-red-700 flex items-center gap-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Reportando...
                </>
              ) : (
                'Sí, Reportar'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
