import SolutionPageContent, { generateMetadata } from '@/components/pages/SolutionPageContent'

export { generateMetadata }

export const dynamic = 'force-dynamic'

export default function Page(props: { params: Promise<{ slug: string }> }) {
  return <SolutionPageContent {...props} />
}
