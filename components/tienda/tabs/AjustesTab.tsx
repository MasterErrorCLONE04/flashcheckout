'use client'

import React, { useState } from 'react'
import {
  Store,
  Globe,
  Search,
  Share2,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TiendaFormState } from '../useTiendaForm'
import { InfoTab } from './InfoTab'
import { DominiosTab } from './DominiosTab'
import { SeoTab } from './SeoTab'
import { RedesTab } from './RedesTab'
import { PoliticasTab } from './PoliticasTab'
import { GeneralStoreWidgets } from '../GeneralStoreWidgets'

type SettingsSubTab = 'info' | 'dominios' | 'seo' | 'redes' | 'politicas'

interface AjustesTabProps {
  form: TiendaFormState
  initialSubTab?: SettingsSubTab
}

export function AjustesTab({ form, initialSubTab = 'info' }: AjustesTabProps) {
  const [subTab, setSubTab] = useState<SettingsSubTab>(initialSubTab)

  const SUB_TABS: Array<{
    id: SettingsSubTab
    label: string
    icon: React.ElementType
  }> = [
    { id: 'info', label: 'Tienda', icon: Store },
    { id: 'dominios', label: 'Dominio', icon: Globe },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'redes', label: 'Redes', icon: Share2 },
    { id: 'politicas', label: 'Políticas', icon: FileText },
  ]

  return (
    <div className="space-y-5 text-left">
      {/* Sub-tabs segment bar */}
      <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1 border border-zinc-200/70 select-none overflow-x-auto">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon
          const isActive = subTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 whitespace-nowrap',
                isActive
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Sub-tab content */}
      <div className="space-y-6">
        {subTab === 'info' && (
          <>
            <InfoTab form={form} />
            <GeneralStoreWidgets form={form} />
          </>
        )}
        {subTab === 'dominios' && <DominiosTab form={form} />}
        {subTab === 'seo' && <SeoTab form={form} />}
        {subTab === 'redes' && <RedesTab form={form} />}
        {subTab === 'politicas' && <PoliticasTab form={form} />}
      </div>
    </div>
  )
}

