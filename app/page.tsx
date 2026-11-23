import type { Metadata } from 'next'
import HomePageContent from '@/components/pages/HomePageContent'

export const metadata: Metadata = {
  title: 'Flashcheckouts - Tienda Online, Pagos Bre-B y Agente Vendedor IA en WhatsApp',
  description:
    'Crea tu tienda online en minutos, recibe pagos inmediatos con Bre-B, Mercado Pago o Stripe y automatiza el cierre de tus ventas 24/7 con un Agente IA en WhatsApp.',
  alternates: {
    canonical: 'https://www.flashcheckouts.com/',
  },
}

export default function HomePage() {
  return <HomePageContent />
}
