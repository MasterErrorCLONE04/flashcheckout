import type { Metadata } from 'next'
import TermsPageContent from '@/components/pages/TermsPageContent'

export const metadata: Metadata = {
  title: 'Términos y Condiciones Legales',
  description: 'Términos de servicio, política de privacidad y condiciones legales de uso de la plataforma Flashcheckouts.',
  alternates: {
    canonical: '/legal/terms',
  },
}

export default function Page() {
  return <TermsPageContent />
}
