import { cn } from '@/lib/utils'
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
  { id: 'movil', icon: Smartphone, label: 'Móvil' },
]

function resolvePreviewFont(typography: string): string {
  switch (typography) {
    case 'Outfit':
      return "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    case 'Plus Jakarta Sans':
      return "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    case 'Playfair Display':
      return "'Playfair Display', Georgia, serif"
    case 'Space Grotesk':
      return "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
    case 'Inter':
    default:
      return "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  }
}

export function TiendaPreviewPanel({
  device,
  setDevice,
  typography,
  colors,
  previewStore,
}: TiendaPreviewPanelProps) {
  const hasDemoProducts = previewStore.products.some(p => p.id.startsWith('demo-'))

  return (
    <div className="lg:col-span-8 h-full flex flex-col overflow-hidden">
      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex-1 flex flex-col items-center shadow-none min-h-0 overflow-hidden">
        <div className="flex items-center justify-between w-full border-b border-zinc-100 pb-3 select-none shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xs xl:text-sm font-bold text-zinc-900 flex items-center gap-1.5 truncate">
              <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Vista previa en vivo</span>
            </h3>
            {hasDemoProducts && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                Productos de muestra
              </span>
            )}
          </div>

          <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50/50 shrink-0">
            {DEVICES.map(dev => {
              const Icon = dev.icon
              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => setDevice(dev.id)}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] xl:text-xs font-bold ${
                    device === dev.id
                      ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/60'
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

        <div
          className={cn(
            'w-full flex-1 flex justify-center overflow-hidden relative select-none min-h-0 bg-zinc-50 border border-zinc-200/80 rounded-lg mt-3',
            device === 'escritorio' ? 'bg-white p-0 items-stretch' : 'p-4 items-center'
          )}
        >
          <div
            className={cn(
              'bg-white flex flex-col text-left overflow-y-auto select-none relative transition-all duration-300',
              device === 'escritorio' ? 'w-full h-full' : 'border border-zinc-200 shadow-xl rounded-lg',
              device === 'tablet' ? 'w-[460px] h-[94%] max-h-[620px]' : '',
              device === 'movil'
                ? 'w-[310px] h-[95%] max-h-[580px] rounded-[32px] border-[7px] border-zinc-900 shadow-2xl relative pt-4'
                : ''
            )}
            style={{
              fontFamily: resolvePreviewFont(typography),
              backgroundColor: colors.fondo,
            }}
          >
            {device === 'movil' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 h-4 w-24 rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-2 h-2 bg-zinc-800 rounded-full" />
              </div>
            )}

            <WhatsAppCatalog store={previewStore} device={device} />
          </div>
        </div>
      </div>
    </div>
  )
}
