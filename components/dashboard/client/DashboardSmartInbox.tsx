'use client'

import React from 'react'
import Link from 'next/link'
import {
  Bell,
  Check,
  AlertTriangle,
  MessageSquare,
  Truck,
  Package,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SmartInboxAlert } from './types'

interface DashboardSmartInboxProps {
  activeAlerts: SmartInboxAlert[]
  onOpenWhatsAppModal: () => void
  onShowAllAlerts: () => void
}

export function AlertItem({
  alert,
  onOpenWhatsAppModal,
}: {
  alert: SmartInboxAlert
  onOpenWhatsAppModal: () => void
}) {
  const isCritical = alert.type === 'whatsapp_disconnected'

  return (
    <div
      key={alert.id}
      className={cn(
        'flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all',
        isCritical
          ? 'border-amber-200 bg-amber-50/40'
          : 'border-zinc-200 bg-zinc-50/40 hover:bg-zinc-50'
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
            isCritical
              ? 'bg-amber-100/80 border-amber-200 text-amber-800'
              : 'bg-white border-zinc-200 text-zinc-700'
          )}
        >
          {alert.type === 'payment_approval' && <AlertTriangle className="w-4 h-4" />}
          {alert.type === 'waiting_response' && <MessageSquare className="w-4 h-4" />}
          {alert.type === 'ready_to_ship' && <Truck className="w-4 h-4" />}
          {alert.type === 'low_stock' && <Package className="w-4 h-4" />}
          {alert.type === 'whatsapp_disconnected' && (
            <img src="/whatsapp.svg" className="w-4 h-4" alt="WhatsApp" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-zinc-950 truncate">{alert.title}</p>
            <span className="text-[9.5px] font-semibold text-zinc-400 shrink-0">
              · {alert.timeText}
            </span>
          </div>
          <p className="text-[10.5px] font-medium text-zinc-500 truncate mt-0.5">
            {alert.subtitle}
          </p>
        </div>
      </div>

      {isCritical ? (
        <button
          type="button"
          onClick={onOpenWhatsAppModal}
          className="h-7 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
        >
          {alert.actionText || 'Conectar'}
        </button>
      ) : (
        <Link
          href={alert.href === '/historial-chats' ? '/conversaciones' : alert.href || '#'}
          className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-950 hover:text-white hover:border-zinc-950 text-zinc-800 text-[10px] font-bold inline-flex items-center gap-1 shrink-0 transition-all"
        >
          <span>{alert.actionText || 'Ver'}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

export function DashboardSmartInbox({
  activeAlerts,
  onOpenWhatsAppModal,
  onShowAllAlerts,
}: DashboardSmartInboxProps) {
  return (
    <div className="p-5 bg-white border border-zinc-200 rounded-2xl flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
              Bandeja Operativa
            </h4>
            <p className="text-[10px] text-zinc-400 font-medium">
              Acciones prioritarias de tu tienda
            </p>
          </div>
        </div>
        {activeAlerts.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-zinc-950 text-white font-bold text-[10px] tabular-nums">
            {activeAlerts.length}
          </span>
        )}
      </div>

      {activeAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/40">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-2">
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-zinc-950">Operación al día</p>
          <p className="text-[10.5px] text-zinc-400 mt-0.5 max-w-[200px] leading-relaxed">
            No tienes pagos ni despachos pendientes por revisar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeAlerts.slice(0, 4).map(alert => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onOpenWhatsAppModal={onOpenWhatsAppModal}
            />
          ))}

          {activeAlerts.length > 4 && (
            <button
              type="button"
              onClick={onShowAllAlerts}
              className="w-full mt-1 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all text-center select-none cursor-pointer"
            >
              Ver todas ({activeAlerts.length})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
