'use client'

import { Plus, Lock } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProductManagerHeaderProps {
  productsCount: number
  isPro: boolean
  canAddProduct: boolean
  onAddProduct: () => void
}

export function ProductManagerHeader({
  productsCount,
  isPro,
  canAddProduct,
  onAddProduct,
}: ProductManagerHeaderProps) {
  return (
    <PageHeader
      title="Suministros y Activos"
      statusDot="emerald"
      subtitle={
        <>
          Inventario operativo —{' '}
          <span className="text-zinc-900 font-semibold">{productsCount} módulos activos</span>
        </>
      }
      actions={
        <>
          {!isPro && (
            <Badge variant="neutral" className="h-9 px-3 text-xs font-medium rounded-lg gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>{productsCount} / 10 espacios usados</span>
            </Badge>
          )}

          {canAddProduct ? (
            <Button onClick={onAddProduct}>
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Producto</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-1.5 text-xs font-medium text-amber-800">
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-amber-900 leading-none">Límite alcanzado</span>
                <Link
                  href="/configuracion"
                  className="text-amber-700 hover:text-amber-800 underline underline-offset-2 text-[11px] font-semibold mt-1"
                >
                  Actualizar a Pro
                </Link>
              </div>
            </div>
          )}
        </>
      }
    />
  )
}
