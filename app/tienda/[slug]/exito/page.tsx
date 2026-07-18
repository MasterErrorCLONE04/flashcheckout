import TiendaExitoPageContent from '@/components/pages/TiendaExitoPageContent'

export const dynamic = 'force-dynamic'

export default function TiendaExitoPage(props: Parameters<typeof TiendaExitoPageContent>[0]) {
  return <TiendaExitoPageContent {...props} />
}
