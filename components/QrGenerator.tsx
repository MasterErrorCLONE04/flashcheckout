'use client'

import { useState, useRef } from 'react'
import { QrCode, Download, X } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

export default function QrGenerator({ url, storeName }: { url: string; storeName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadQR = () => {
    // Buscar directamente el documento de la gráfica creada por la librería
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    // Transformar a imagen pura
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')

    // Disparar click en link invisible
    let downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    // Nombre que recibirá el cliente al bajarlo a su explorador de archivos
    downloadLink.download = `QR-${storeName.replace(/\s+/g, '-')}-FlashCheckout.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <>
      {/* Botón Accionador (Se verá en el Dashboard) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all w-fit mt-3 sm:mt-0"
      >
        <QrCode className="w-4 h-4" />
        Generar QR
      </button>

      {/* Modal / Dialogo de Descarga */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative z-10 animate-scale-in">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6 mt-2">
              <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">Tu Código QR</h3>
              <p className="text-sm text-muted-foreground leading-relaxed px-4">
                Entrégale esto a tu diseñador o imprímelo para que tus clientes escaneen y abran <b>{storeName}</b> directamente.
              </p>
            </div>

            {/* Contenedor Ref que engloba el Canvas para poder descargarlo */}
            <div 
              className="bg-[#F9FAFB] border border-border rounded-2xl p-6 flex justify-center mb-6"
              ref={qrRef}
            >
              <QRCodeCanvas 
                value={url} 
                size={220}
                level="H" // El nivel más alto de rectificación de error para tolerar logos en él o manchas
                includeMargin={true}
                fgColor="#052e16" // Very Dark Emerald
              />
            </div>

            <button
              onClick={downloadQR}
              className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-[15px]"
            >
              <Download className="w-5 h-5" />
              Descargar Imagen Alta Calidad
            </button>
          </div>
        </div>
      )}
    </>
  )
}
