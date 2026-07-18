import ExplorePageContent from '@/components/pages/ExplorePageContent'

export const dynamic = 'force-dynamic'

export default function ExplorePage(props: Parameters<typeof ExplorePageContent>[0]) {
  return <ExplorePageContent {...props} />
}
