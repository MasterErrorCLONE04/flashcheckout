'use client'

import { Download } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'

interface PagosHeaderProps {
  onExport: () => void
}

export function PagosHeader({ onExport }: PagosHeaderProps) {
  return (
    <PageHeader
      title="Pagos"
      statusDot="emerald"
      subtitle="Gestiona y supervisa todos los pagos de tu negocio."
      actions={
        <Button variant="outline" onClick={onExport}>
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Exportar</span>
        </Button>
      }
    />
  )
}
