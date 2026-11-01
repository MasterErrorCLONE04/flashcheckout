'use client'

import React from 'react'
import {
  X,
  ExternalLink,
  Download,
  QrCode,
  Loader2,
  Phone,
} from 'lucide-react'
import QrGenerator from '@/components/QrGenerator'
import Modal from '@/components/ui/Modal'
import { SmartInboxAlert } from './types'
import { AlertItem } from './DashboardSmartInbox'

interface DashboardModalsProps {
  showQrModal: boolean
  onCloseQrModal: () => void
  storeUrl: string
  storeName: string
  showWhatsAppModal: boolean
  onCloseWhatsAppModal: () => void
  loadingQr: boolean
  qrCodeBase64: string | null
  onConnectWhatsApp: () => void
  showAllAlertsModal: boolean
  onCloseAllAlertsModal: () => void
  activeAlerts: SmartInboxAlert[]
}

export function DashboardModals({
  showQrModal,
  onCloseQrModal,
  storeUrl,
  storeName,
  showWhatsAppModal,
  onCloseWhatsAppModal,
  loadingQr,
  qrCodeBase64,
  onConnectWhatsApp,
  showAllAlertsModal,
  onCloseAllAlertsModal,
  activeAlerts,
}: DashboardModalsProps) {
  return (
    <>
      {/* Store QR Code Modal (Visits & Counter) */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-lg max-w-sm w-full p-6 border border-zinc-100 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={onCloseQrModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-955 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 mt-2">
              <h3 className="font-bold text-base text-zinc-900">Código QR de la Tienda</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px] leading-relaxed">
                Escanea o descarga este código QR para colocar en tu tienda física y dirigir a los compradores directos.
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-lg border border-zinc-200 mb-6 flex items-center justify-center">
              <QrGenerator url={storeUrl} storeName={storeName} inline={true} size={160} />
            </div>

            <div className="w-full flex flex-col gap-2">
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 h-11 w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg transition-colors"
              >
                <span>Visitar Tienda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  const canvas = document.querySelector('canvas')
                  if (canvas) {
                    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
                    const downloadLink = document.createElement('a')
                    downloadLink.href = pngUrl
                    downloadLink.download = `QR_${storeName.replace(/\s+/g, '_')}.png`
                    document.body.appendChild(downloadLink)
                    downloadLink.click()
                    document.body.removeChild(downloadLink)
                  }
                }}
                className="flex items-center justify-center gap-1.5 h-11 w-full bg-zinc-950 text-white hover:bg-zinc-900 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Descargar Imagen QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp QR Modal Popup (Vincular Celular) */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl border border-zinc-200 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={onCloseWhatsAppModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon */}
            <div className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 mb-3 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-lg text-zinc-900 tracking-tight">Vincular Celular</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                Escanea el código QR desde tu WhatsApp para conectar el bot de IA.
              </p>
            </div>

            <div className="w-full flex items-center justify-center min-h-[190px] border border-zinc-200/80 bg-zinc-50/50 rounded-lg mb-4 p-4 relative overflow-hidden">
              {loadingQr ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-zinc-450 animate-spin" />
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider animate-pulse">Generando código QR...</span>
                </div>
              ) : qrCodeBase64 ? (
                <div className="flex flex-col items-center gap-3.5">
                  <div className="p-3 bg-white border border-zinc-200 rounded-lg relative">
                    {/* Decorative QR Corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-zinc-400 rounded-tl-sm pointer-events-none" />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-zinc-400 rounded-tr-sm pointer-events-none" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-zinc-400 rounded-bl-sm pointer-events-none" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-zinc-400 rounded-br-sm pointer-events-none" />

                    <img src={qrCodeBase64} alt="Scan QR Code" className="w-36 h-36 object-contain" />
                  </div>
                  <span className="text-[9px] font-extrabold text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Esperando escaneo...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3.5 text-center p-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-455">
                    <Phone className="w-5 h-5" />
                  </div>
                  <button
                    onClick={onConnectWhatsApp}
                    className="h-9 px-4 bg-zinc-900 text-white hover:bg-zinc-950 border border-transparent rounded-lg text-[10px] font-bold tracking-wider transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Generar código QR
                  </button>
                </div>
              )}
            </div>

            <div className="w-full bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-lg text-left space-y-3">
              <h5 className="text-[10px] font-bold text-zinc-800 tracking-wider">Pasos en tu teléfono:</h5>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-[10px] font-semibold text-zinc-500 leading-normal">
                  <div className="w-4.5 h-4.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-500 flex items-center justify-center shrink-0">1</div>
                  <span>Ve a <strong className="text-zinc-900 font-bold">Dispositivos vinculados</strong> en WhatsApp.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[10px] font-semibold text-zinc-500 leading-normal">
                  <div className="w-4.5 h-4.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-500 flex items-center justify-center shrink-0">2</div>
                  <span>Presiona <strong className="text-zinc-900 font-bold">Vincular dispositivo</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 text-[10px] font-semibold text-zinc-500 leading-normal">
                  <div className="w-4.5 h-4.5 rounded-full bg-zinc-100 border border-zinc-200 text-[9px] font-bold text-zinc-500 flex items-center justify-center shrink-0">3</div>
                  <span>Escanea el código QR que se muestra arriba.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Modal for Bandeja Inteligente */}
      <Modal
        isOpen={showAllAlertsModal}
        onClose={onCloseAllAlertsModal}
        title={`Bandeja Inteligente (${activeAlerts.length})`}
      >
        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {activeAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onOpenWhatsAppModal={() => {
                onCloseAllAlertsModal()
                onConnectWhatsApp()
              }}
            />
          ))}
        </div>
      </Modal>
    </>
  )
}
