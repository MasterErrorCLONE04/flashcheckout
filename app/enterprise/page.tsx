import type { Metadata } from 'next'
import EnterprisePage from '@/components/pages/EnterprisePage'

export const metadata: Metadata = {
  title: 'Soluciones Enterprise',
  description: 'Descubre cómo Flashcheckouts ayuda a corporaciones y grandes marcas a automatizar cobros, programar envíos y chatear con IA a gran escala.',
  alternates: {
    canonical: 'https://www.flashcheckouts.com/enterprise',
  },
}

export default function Page() {
  return <EnterprisePage />
}
