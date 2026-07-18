'use client'

import { useState, useRef } from 'react'
import { QrCode, Download, X, Share2, CornerRightUp } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { cn } from '@/lib/utils'

export default function QrGenerator({ 
  url, 
  storeName,
  inline = false,
  size = 200
}: { 
  url: string; 
  storeName: string;
  inline?: boolean;
  size?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')

    let downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `QR-${storeName.replace(/\s+/g, '-')}-Flashcheckouts.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  if (inline) {
    return (
      <div ref={qrRef} className="flex items-center justify-center">
        <QRCodeCanvas 
          value={url} 
          size={size}
          level="H"
          includeMargin={false}
          fgColor="#18181B"
        />
      </div>
    )
  }

  return (
    <>
      {/* Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 bg-white border border-black/[0.05] hover:bg-zinc-50 text-black text-[10px] font-bold tracking-widest px-5 py-3 rounded-full transition-all active:scale-95 group"
      >
        <QrCode className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
        Generar QR de tienda
      </button>

      {/* Modal / Download Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-white/60 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-white rounded-[3rem] border border-black/[0.05] p-10 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-8 top-8 text-zinc-300 w-10 h-10 rounded-full hover:bg-zinc-50 hover:text-black flex items-center justify-center transition-all active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-10 mt-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-black tracking-tight mb-3">Código QR de acceso</h3>
              <p className="text-[11px] text-zinc-400 font-bold tracking-widest leading-relaxed px-6">
                Descarga este código para tus impresiones o material publicitario. Abre <b>{storeName}</b> instantáneamente.
              </p>
            </div>

            {/* QR Container */}
            <div 
              className="bg-zinc-50 border border-black/[0.02] rounded-[2.5rem] p-10 flex justify-center mb-10 group/qr"
              ref={qrRef}
            >
              <div className="relative p-4 bg-white rounded-3xl group-hover/qr:scale-105 transition-transform duration-700 border border-gray-100">
                <QRCodeCanvas 
                  value={url} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="#0066CC"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/qr:opacity-100 transition-opacity">
                   <div className="bg-white p-2 rounded-xl border border-primary/20">
                     <CornerRightUp className="w-6 h-6 text-primary" />
                   </div>
                </div>
              </div>
            </div>

            <button
              onClick={downloadQR}
              className="w-full h-14 flex justify-center items-center gap-4 bg-primary text-white font-bold tracking-widest rounded-full transition-all hover:bg-primary-hover active:scale-98 text-xs uppercase"
            >
              <Download className="w-5 h-5" />
              Descargar imagen (HD)
            </button>
          </div>
        </div>
      )}
    </>
  )
}
