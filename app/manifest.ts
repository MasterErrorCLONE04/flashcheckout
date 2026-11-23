import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flashcheckouts — Comercio Conversacional & Tiendas Online',
    short_name: 'Flashcheckouts',
    description:
      'Crea tu tienda online, recibe pagos con Bre-B y vende 24/7 con Agente IA en WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#09090B',
    icons: [
      {
        src: '/Flashcheckout logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/Flashcheckout logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
