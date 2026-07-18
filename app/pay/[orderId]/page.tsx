import SmartPayPageContent from '@/components/pages/SmartPayPageContent'

export const dynamic = 'force-dynamic'

export default function SmartPayPage(props: Parameters<typeof SmartPayPageContent>[0]) {
  return <SmartPayPageContent {...props} />
}
