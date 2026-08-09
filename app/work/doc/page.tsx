import type { Metadata } from 'next'
import DocPageContent from '@/components/pages/DocPageContent'

export const metadata: Metadata = {
  title: 'Documentación y Centro de Ayuda',
  description: 'Aprende cómo configurar tu tienda en Flashcheckouts, conectar pasarelas de pago como Stripe y Mercado Pago, automatizar chats por WhatsApp y configurar a Nova para aumentar tus ventas.',
  alternates: {
    canonical: 'https://www.flashcheckouts.com/work/doc',
  },
}

export default function Page() {
  return <DocPageContent />
}
