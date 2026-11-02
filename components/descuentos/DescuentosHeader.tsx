'use client'

import { Download, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'

interface DescuentosHeaderProps {
  onExport: () => void
  onOpenCreate: () => void
}

export function DescuentosHeader({ onExport, onOpenCreate }: DescuentosHeaderProps) {
  return (
    <PageHeader
      title="Descuentos"
      statusDot="emerald"
      subtitle="Crea y gestiona descuentos y cupones para tu negocio."
      actions={
        <>
          <Button variant="outline" onClick={onExport}>
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Exportar</span>
          </Button>
          <Button onClick={onOpenCreate}>
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo descuento</span>
          </Button>
        </>
      }
    />
  )
}
