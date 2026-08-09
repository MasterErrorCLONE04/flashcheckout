import type { Metadata } from 'next'
import ExplorePageContent from '@/components/pages/ExplorePageContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Explorar Tiendas',
  description: 'Descubre las mejores tiendas del ecosistema de Flashcheckouts. Compra de forma segura y experimenta el checkout en 30 segundos.',
  alternates: {
    canonical: 'https://www.flashcheckouts.com/explorar',
  },
}

export default function ExplorePage(props: Parameters<typeof ExplorePageContent>[0]) {
  return <ExplorePageContent {...props} />
}
