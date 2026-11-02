'use client'

import { Plus } from 'lucide-react'
import { PageHeader, PageTabs } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import type { AutomationFilterTab } from './types'

interface AutomatizacionesHeaderProps {
  filterTab: AutomationFilterTab
  onSelectTab: (tab: AutomationFilterTab) => void
  totalCount: number
  activeCount: number
  inactiveCount: number
  onOpenCreate: () => void
}

export function AutomatizacionesHeader({
  filterTab,
  onSelectTab,
  totalCount,
  activeCount,
  inactiveCount,
  onOpenCreate,
}: AutomatizacionesHeaderProps) {
  return (
    <>
      <PageHeader
        title="Automatizaciones"
        statusDot="emerald"
        subtitle="Activa y gestiona las automatizaciones de tu negocio."
        actions={
          <Button onClick={onOpenCreate}>
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva automatización</span>
          </Button>
        }
      />

      <PageTabs<AutomationFilterTab>
        activeTab={filterTab}
        onTabChange={onSelectTab}
        tabs={[
          { id: 'all', label: 'Todas', count: totalCount },
          { id: 'active', label: 'Activas', count: activeCount },
          { id: 'inactive', label: 'Inactivas', count: inactiveCount },
        ]}
      />
    </>
  )
}
