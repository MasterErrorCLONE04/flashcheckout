'use client'

import React from 'react'
import {
  ExternalLink,
  Download,
  QrCode,
  Loader2,
  Phone,
} from 'lucide-react'
import QrGenerator from '@/components/QrGenerator'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
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
      {/* Store QR Code Modal */}
      <Modal
        isOpen={showQrModal}
        onClose={onCloseQrModal}
        size="sm"
        hideHeader
      >
        <div className="flex flex-col items-center justify-center text-center pt-2">
          <div className="mb-4">
            <h3 className="font-semibold text-base text-zinc-900">Código QR de la Tienda</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[240px] leading-relaxed mx-auto">
              Escanea o descarga este código QR para colocar en tu tienda física y dirigir a tus compradores.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-zinc-200 mb-6 flex items-center justify-center">
            <QrGenerator url={storeUrl} storeName={storeName} inline={true} size={160} />
          </div>

          <div className="w-full flex flex-col gap-2">
            <Button variant="outline" size="md" className="w-full" asChild>
              <a href={storeUrl} target="_blank" rel="noreferrer">
                <span>Visitar Tienda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>

            <Button
              size="md"
              className="w-full"
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
            >
              <Download className="w-4 h-4" />
              <span>Descargar Imagen QR</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp QR Modal Popup (Vincular Celular) */}
      <Modal
        isOpen={showWhatsAppModal}
        onClose={onCloseWhatsAppModal}
        size="sm"
        hideHeader
      >
        <div className="flex flex-col items-center justify-center text-center pt-2">
          <div className="w-11 h-11 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 mb-3 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-base text-zinc-900 tracking-tight">Vincular Celular</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[280px] leading-relaxed mx-auto">
              Escanea el código QR desde tu WhatsApp para conectar el bot de IA.
            </p>
          </div>

          <div className="w-full flex items-center justify-center min-h-[190px] border border-zinc-200 bg-zinc-50/50 rounded-lg mb-4 p-4 relative overflow-hidden">
            {loadingQr ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                <span className="text-xs font-medium text-zinc-400 animate-pulse">Generando código QR...</span>
              </div>
            ) : qrCodeBase64 ? (
              <div className="flex flex-col items-center gap-3.5">
                <div className="p-3 bg-white border border-zinc-200 rounded-lg relative">
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-zinc-400 rounded-tl-sm pointer-events-none" />
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-zinc-400 rounded-tr-sm pointer-events-none" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-zinc-400 rounded-bl-sm pointer-events-none" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-zinc-400 rounded-br-sm pointer-events-none" />

                  <img src={qrCodeBase64} alt="Scan QR Code" className="w-36 h-36 object-contain" />
                </div>
                <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Esperando escaneo...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3.5 text-center p-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                  <Phone className="w-5 h-5" />
                </div>
                <Button onClick={onConnectWhatsApp}>
                  <span>Generar código QR</span>
                </Button>
              </div>
            )}
          </div>

          <div className="w-full bg-zinc-50 border border-zinc-200/80 p-4 rounded-lg text-left space-y-2.5">
            <h5 className="text-xs font-semibold text-zinc-800">Pasos en tu teléfono:</h5>
            <div className="space-y-2 text-xs text-zinc-500">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white border border-zinc-200 text-[10px] font-semibold text-zinc-600 flex items-center justify-center shrink-0">1</span>
                <span>Ve a <strong className="text-zinc-900 font-semibold">Dispositivos vinculados</strong> en WhatsApp.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white border border-zinc-200 text-[10px] font-semibold text-zinc-600 flex items-center justify-center shrink-0">2</span>
                <span>Presiona <strong className="text-zinc-900 font-semibold">Vincular dispositivo</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-white border border-zinc-200 text-[10px] font-semibold text-zinc-600 flex items-center justify-center shrink-0">3</span>
                <span>Escanea el código QR que se muestra arriba.</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

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
