import StorePageContent, { generateMetadata } from '@/components/pages/StorePageContent'

export { generateMetadata }

export const dynamic = 'force-dynamic'

export default function StorePage(props: Parameters<typeof StorePageContent>[0]) {
  return <StorePageContent {...props} />
}
