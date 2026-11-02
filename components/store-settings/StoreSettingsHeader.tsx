'use client'

import { Loader2, Save } from 'lucide-react'
import { PageHeader, PageTabs } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { TABS, TabId } from './constants'

interface StoreSettingsHeaderProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onSubmit: () => void
  loading: boolean
}

export function StoreSettingsHeader({
  activeTab,
  onTabChange,
  onSubmit,
  loading,
}: StoreSettingsHeaderProps) {
  return (
    <>
      <PageHeader
        title="Configuración"
        statusDot="zinc"
        subtitle="Administra los ajustes generales de tu negocio."
        actions={
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Guardar cambios</span>
          </Button>
        }
      />

      <PageTabs<TabId>
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabs={TABS.map((t) => ({ id: t.id as TabId, label: t.label }))}
      />
    </>
  )
}
