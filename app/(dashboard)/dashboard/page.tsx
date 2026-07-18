import DashboardPageContent from '@/components/pages/DashboardPageContent'

export const dynamic = 'force-dynamic'

export default function DashboardPage(props: {
  searchParams: Promise<{ days?: string }>
}) {
  return <DashboardPageContent {...props} />
}
