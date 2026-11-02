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
  return (
    <div
      key={alert.id}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border bg-zinc-50/20 text-left",
        alert.type === 'whatsapp_disconnected' ? "border-rose-200 bg-rose-50/15" : "border-zinc-200"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border bg-zinc-50 border-zinc-200 text-zinc-500">
          {alert.type === 'payment_approval' && <AlertTriangle className="w-4 h-4" />}
          {alert.type === 'waiting_response' && <MessageSquare className="w-4 h-4" />}
          {alert.type === 'ready_to_ship' && <Truck className="w-4 h-4" />}
          {alert.type === 'low_stock' && <Package className="w-4 h-4" />}
          {alert.type === 'whatsapp_disconnected' && <img src="/whatsapp.svg" className="w-4 h-4" alt="WhatsApp" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-zinc-900 leading-snug">{alert.title}</p>
          <p className="text-[10px] font-medium text-zinc-500 truncate mt-0.5 leading-none">
            {alert.subtitle} {alert.type === 'whatsapp_disconnected' && <span className="text-rose-500 font-bold uppercase text-[9px] ml-1">Crítico</span>}
          </p>
          <span className={cn(
            "text-[9px] font-semibold block mt-1",
            alert.type === 'whatsapp_disconnected' ? "text-rose-500" : "text-zinc-400"
          )}>{alert.timeText}</span>
        </div>
      </div>
      {alert.type === 'whatsapp_disconnected' ? (
        <button
          onClick={onOpenWhatsAppModal}
          className="w-full h-7 border border-rose-200 hover:bg-rose-50 rounded-md text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center justify-center bg-white shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          {alert.actionText || 'Reconectar'}
        </button>
      ) : (
        <Link 
          href={alert.href || '#'} 
          className="w-full h-7 border border-zinc-200 hover:bg-zinc-50 rounded-md text-[10px] font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-center bg-white shadow-sm active:scale-[0.98] transition-all"
        >
          {alert.actionText || 'Ver'}
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
    <div className="p-5 bg-white border border-zinc-200 rounded-lg flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-zinc-400" />
          <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">Bandeja Inteligente</h4>
        </div>
        {activeAlerts.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-sm">
            {activeAlerts.length}
          </span>
        )}
      </div>

      {activeAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 py-8 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/20 my-1">
          <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mb-2.5">
            <Check className="w-5 h-5 animate-bounce" />
          </div>
          <p className="text-xs font-bold text-zinc-900">¡Bandeja al día!</p>
          <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] leading-relaxed">No tienes tareas pendientes que requieran tu atención inmediata.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="space-y-3.5">
            {activeAlerts.slice(0, 3).map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onOpenWhatsAppModal={onOpenWhatsAppModal}
              />
            ))}
          </div>
          {activeAlerts.length > 3 && (
            <button
              onClick={onShowAllAlerts}
              className="w-full mt-2 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-all text-center select-none cursor-pointer"
            >
              Mostrar más
            </button>
          )}
        </div>
      )}
    </div>
  )
}
