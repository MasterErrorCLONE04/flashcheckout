import type { Metadata } from 'next'
import ExplorePageContent from '@/components/pages/ExplorePageContent'
import type { ExploreSearchParams } from '@/components/ExploreTypes'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams & { action?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const hasFilterParams = Boolean(
    params?.q ||
      params?.category ||
      params?.minPrice ||
      params?.maxPrice ||
      params?.sort ||
      params?.theme ||
      params?.action
  )

  return {
    title: 'Explorar Tiendas Verificadas y Catálogos Online',
    description:
      'Descubre las mejores tiendas del ecosistema de Flashcheckouts. Compra de forma segura con Bre-B y experimenta el checkout conversacional en 30 segundos.',
    alternates: {
      canonical: 'https://www.flashcheckouts.com/explorar',
    },
    robots: hasFilterParams
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
  }
}

export default function ExplorePage(props: Parameters<typeof ExplorePageContent>[0]) {
  return <ExplorePageContent {...props} />
}
