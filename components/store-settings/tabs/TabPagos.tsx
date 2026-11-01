'use client'

import React from 'react'
import {
  CreditCard,
  Key,
  HelpCircle,
  Building2,
  ShieldCheck,
  Loader2,
  Save,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrebConfig } from '../types'
import { Toggle } from '../Toggle'

interface TabPagosProps {
  mpConnected: boolean
  disconnectingMp: boolean
  onConnectMercadoPago: () => void
  onDisconnectMercadoPago: () => void
  brebConfig: BrebConfig
  setBrebConfig: React.Dispatch<React.SetStateAction<BrebConfig>>
  loadingBreb: boolean
  savingBreb: boolean
  onSaveBrebConfig: () => void
  onApplyBrebPreset: (provider: 'NEQUI' | 'NU' | 'DAVIVIENDA' | 'BANCOLOMBIA') => void
  storeName: string
}

export function TabPagos({
  mpConnected,
  disconnectingMp,
  onConnectMercadoPago,
  onDisconnectMercadoPago,
  brebConfig,
  setBrebConfig,
  loadingBreb,
  savingBreb,
  onSaveBrebConfig,
  onApplyBrebPreset,
  storeName,
}: TabPagosProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-none overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100">
        <h3 className="text-sm font-bold text-zinc-900">Métodos de Pago</h3>
        <p className="text-xs text-zinc-500 mt-1">Conecta tus pasarelas para recaudar fondos directamente de las compras de tus clientes.</p>
      </div>
      <div className="p-6 space-y-4">
        {/* Mercado Pago */}
        <div className="flex items-start justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-lg gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00B1EA] text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Mercado Pago Connect</h4>
              <p className="text-[10px] text-zinc-400 font-semibold">Pasarela Local · PSE, Efecty y más</p>
            </div>
          </div>
          {mpConnected ? (
            <button
              onClick={onDisconnectMercadoPago}
              disabled={disconnectingMp}
              className="flex items-center gap-1.5 h-8 px-3.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] font-bold shadow-none transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {disconnectingMp ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              <span>Desconectar</span>
            </button>
          ) : (
            <button
              onClick={onConnectMercadoPago}
              className="flex items-center gap-1.5 h-8 px-3.5 bg-[#00B1EA] hover:bg-[#009ed2] text-white rounded-lg text-[11px] font-bold shadow-none transition-all cursor-pointer shrink-0"
            >
              <CreditCard className="w-3 h-3" />
              <span>Conectar</span>
            </button>
          )}
        </div>

        {/* Bre-B Direct */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-zinc-900">Bre-B directo</h4>
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                    brebConfig.enabled
                      ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                      : "bg-white text-zinc-400 border-zinc-200"
                  )}>
                    {brebConfig.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                  Cobra con QR Bre-B. El dinero llega directo a tu cuenta, Flashcheckouts no toca los fondos.
                </p>
                <div className="mt-2.5 flex items-start gap-2 bg-amber-50/50 border border-amber-200/50 rounded-lg p-2.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">Nota de Interoperabilidad</p>
                    <p className="text-[10px] font-medium text-amber-700 mt-0.5 leading-normal">
                      Asegúrate de que tu Llave Bre-B esté activa en la sección Bre-B de tu app bancaria para permitir recibir pagos desde cualquier banco.
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onApplyBrebPreset('NEQUI')}
                    className="h-6 px-2.5 rounded-full bg-white border border-zinc-200 text-[9px] font-bold text-zinc-700 hover:bg-zinc-50"
                  >
                    Usar Nequi 1507
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyBrebPreset('NU')}
                    className="h-6 px-2.5 rounded-full bg-white border border-zinc-200 text-[9px] font-bold text-zinc-700 hover:bg-zinc-50"
                  >
                    Usar Nu 3201
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyBrebPreset('DAVIVIENDA')}
                    className="h-6 px-2.5 rounded-full bg-white border border-zinc-200 text-[9px] font-bold text-zinc-700 hover:bg-zinc-50"
                  >
                    Usar Davivienda 0051
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyBrebPreset('BANCOLOMBIA')}
                    className="h-6 px-2.5 rounded-full bg-white border border-zinc-200 text-[9px] font-bold text-zinc-700 hover:bg-zinc-50"
                  >
                    Usar Bancolombia 0007
                  </button>
                </div>
              </div>
            </div>
            <Toggle
              checked={brebConfig.enabled}
              onChange={value => setBrebConfig(prev => ({ ...prev, enabled: value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Tipo de llave</label>
              <select
                value={brebConfig.keyType}
                onChange={e => setBrebConfig(prev => ({ ...prev, keyType: e.target.value }))}
                className="w-full h-9 bg-white border border-zinc-200 rounded-lg px-3 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-400"
              >
                <option value="PHONE">Celular</option>
                <option value="EMAIL">Correo</option>
                <option value="DOCUMENT">Cedula / NIT</option>
                <option value="ALPHANUMERIC">Llave alfanumerica</option>
                <option value="MERCHANT_CODE">Codigo de comercio</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Llave Bre-B</label>
              <input
                value={brebConfig.keyValue}
                onChange={e => setBrebConfig(prev => ({ ...prev, keyValue: e.target.value }))}
                placeholder="Ej. @3025382862 o @NYL279"
                className="w-full h-9 bg-white border border-zinc-200 rounded-lg px-3 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Banco o billetera</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-350" />
                <select
                  value={brebConfig.bankProvider}
                  onChange={e => {
                    const value = e.target.value
                    if (value === 'Nequi') onApplyBrebPreset('NEQUI')
                    else if (value === 'Nu Colombia') onApplyBrebPreset('NU')
                    else if (value === 'Davivienda') onApplyBrebPreset('DAVIVIENDA')
                    else if (value === 'Bancolombia') onApplyBrebPreset('BANCOLOMBIA')
                    else setBrebConfig(prev => ({ ...prev, bankProvider: value }))
                  }}
                  className="w-full h-9 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-400"
                >
                  <option value="">Selecciona tu banco</option>
                  <option value="Nequi">Nequi - 1507</option>
                  <option value="Nu Colombia">Nu Colombia - 3201</option>
                  <option value="Davivienda">Davivienda - 0051</option>
                  <option value="Bancolombia">Bancolombia - 0007</option>
                  <option value="Otro">Otro / manual</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Nombre visible en QR</label>
              <input
                value={brebConfig.merchantDisplayName}
                onChange={e => setBrebConfig(prev => ({ ...prev, merchantDisplayName: e.target.value }))}
                placeholder={storeName}
                className="w-full h-9 bg-white border border-zinc-200 rounded-lg px-3 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Codigo entidad Bre-B</label>
              <input
                value={brebConfig.participantId}
                onChange={e => setBrebConfig(prev => ({ ...prev, participantId: e.target.value.replace(/\D/g, '') }))}
                placeholder="Ej. 3201"
                className="w-full h-9 bg-white border border-zinc-200 rounded-lg px-3 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-400"
              />
              <p className="text-[9px] font-semibold text-zinc-400">Se completa al elegir banco. Ej: Nequi 1507, Nu 3201, Davivienda 0051.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">Codigo tipo de llave</label>
              <input
                value={brebConfig.keyTypeCode}
                onChange={e => setBrebConfig(prev => ({ ...prev, keyTypeCode: e.target.value.replace(/\D/g, '') }))}
                placeholder="Opcional. Ej. 01 para alias"
                className="w-full h-9 bg-white border border-zinc-200 rounded-lg px-3 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-400"
              />
              <p className="text-[9px] font-semibold text-zinc-400">Si esta vacio, usamos el mapeo observado para el tipo elegido.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-white/70 border border-zinc-200 p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-900 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-zinc-700">Validacion automatica por comprobante</p>
                <p className="text-[10px] font-semibold text-zinc-400 leading-relaxed">
                  El QR se generara con monto y referencia unica. El OCR antifraude queda preparado para revisar capturas.
                </p>
              </div>
            </div>
            <button
              onClick={onSaveBrebConfig}
              disabled={savingBreb || loadingBreb}
              className="flex items-center justify-center gap-1.5 h-8 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-bold shadow-none transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {savingBreb || loadingBreb ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              <span>{loadingBreb ? 'Cargando' : 'Guardar Bre-B'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
