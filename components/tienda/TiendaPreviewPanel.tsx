import { cn } from "@/lib/utils"
import { Globe, Monitor, Tablet, Smartphone } from 'lucide-react'
import WhatsAppCatalog from '@/components/WhatsAppCatalog'
import type { PublicCheckoutStore } from '@/lib/checkout/types'
import { DeviceType } from './types'

interface TiendaPreviewPanelProps {
  device: DeviceType
  setDevice: (device: DeviceType) => void
  typography: string
  colors: {
    primario: string
    secundario: string
    acento: string
    fondo: string
    texto: string
  }
  previewStore: PublicCheckoutStore
}

const DEVICES: Array<{ id: DeviceType; icon: typeof Monitor; label: string }> = [
  { id: 'escritorio', icon: Monitor, label: 'Escritorio' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'movil', icon: Smartphone, label: 'Móvil' }
]

export function TiendaPreviewPanel({
  device,
  setDevice,
  typography,
  colors,
  previewStore
}: TiendaPreviewPanelProps) {
  return (
    <div className="lg:col-span-8 h-full flex flex-col overflow-hidden">
      {/* Live Preview Website Container */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5 flex-1 flex flex-col items-center shadow-none min-h-0 overflow-hidden">
        <div className="flex items-center justify-between w-full border-b border-zinc-100 pb-3 select-none shrink-0">
          <h3 className="text-xs xl:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-zinc-400" />
            Vista previa de tu tienda
          </h3>
          
          {/* Device switches */}
          <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50/50">
            {DEVICES.map(dev => {
              const Icon = dev.icon
              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => setDevice(dev.id)}
                  className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] xl:text-xs font-bold ${
                    device === dev.id 
                      ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/40' 
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                  title={dev.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{dev.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* LIVE CANVAS WEB PREVIEW */}
        <div className={cn(
          "w-full flex-1 flex justify-center overflow-hidden relative select-none min-h-0 bg-zinc-50 border border-zinc-150 border-dashed rounded-lg p-4 mt-4",
          device === 'escritorio' ? "bg-white p-0 border-0 mt-4 items-stretch" : "items-center"
        )}>
          <div 
            className={cn(
              "bg-white flex flex-col text-left overflow-y-auto select-none relative transition-all duration-300",
              device === 'escritorio' ? 'w-full h-full' : 'border border-zinc-200 shadow-xl rounded-lg',
              device === 'tablet' ? 'w-[440px] h-[92%] max-h-[580px]' : '',
              device === 'movil' ? 'w-[280px] h-[95%] max-h-[540px] rounded-[32px] border-8 border-zinc-900 shadow-2xl relative pt-4' : ''
            )}
            style={{ 
              fontFamily: typography === 'Inter' ? 'Inter, sans-serif' : typography === 'Georgia' ? 'Georgia, serif' : 'monospace', 
              backgroundColor: colors.fondo 
            }}
          >
            {/* Phone Header notch for Mobile view */}
            {device === 'movil' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 h-4 w-28 rounded-b-xl z-20 flex items-center justify-center">
                <div className="w-2 h-2 bg-zinc-800 rounded-full" />
              </div>
            )}

            <WhatsAppCatalog 
              store={previewStore}
              device={device}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
