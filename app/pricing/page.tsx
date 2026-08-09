import type { Metadata } from 'next'
import PricingPage from '@/components/pages/PricingPage'

export const metadata: Metadata = {
  title: 'Planes y Precios',
  description: 'Comienza gratis con Flashcheckouts. Conoce nuestros planes y automatiza el cierre de tus ventas en WhatsApp sin comisiones abusivas.',
  alternates: {
    canonical: 'https://www.flashcheckouts.com/pricing',
  },
}

export default function Page() {
  return <PricingPage />
}
