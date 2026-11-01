import {
  CreditCard,
  Layout,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  Phone,
  LifeBuoy,
  Zap,
  Activity,
  MessageCircle,
  Sparkles,
  BarChart3,
  Globe,
  Box,
  GitCompare,
  Users,
  Timer,
  Heart,
  Split,
  Eye,
} from 'lucide-react'

export const INTEGRATIONS_ROW_1 = [
  { name: 'Make', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/make.png' },
  { name: 'Soporte', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/zendesk.png' },
  { name: 'CRM', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/notion.png' },
  { name: 'Equipo', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/slack.png' },
  { name: 'Bre-B', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/stripe.png' },
  { name: 'Clientes', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/salesforce.png' },
  { name: 'Cloud', type: 'image' as const, logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/yellow-cloud.png' },
]

export const INTEGRATIONS_ROW_2 = [
  { name: 'Cloud', type: 'image' as const, logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/green-cloud.png' },
  { name: 'Cal.com', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/cal.png' },
  { name: 'Calendly', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/calendly.png' },
  { name: 'WhatsApp', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/whatsapp.png' },
  { name: 'Zapier', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/zapier.png' },
  { name: 'Chat', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/messenger.png' },
]

export const FEATURE_CARDS = [
  {
    title: 'Pedidos y clientes en tiempo real',
    description: 'Conecta conversaciones, ordenes, clientes, productos y pagos para que Nova responda con contexto real del negocio.',
    image: '/feature_sync_data.png',
    size: 'large'
  },
  {
    title: 'Automatiza acciones comerciales',
    description: 'Nova puede recomendar productos, crear pedidos, enviar checkout y derivar al vendedor cuando la conversacion lo necesita.',
    image: '/feature_automate_actions.png',
    size: 'large'
  },
  {
    title: 'Agente IA para vender',
    description: 'Ajusta el comportamiento de Nova para responder como tu tienda, con foco en convertir preguntas en pedidos.',
    image: '/feature_ai_sales_agent.png',
    size: 'small'
  },
  {
    title: 'Desvio a humano',
    description: 'Permite que el cliente pida ayuda humana cuando hay dudas complejas, reclamos o negociaciones especiales.',
    image: '/feature_human_handoff.png',
    size: 'small'
  },
  {
    title: 'Reportes comerciales',
    description: 'Mide pedidos, ventas, clientes activos y resultados para saber que funciona y que debes mejorar.',
    image: '/feature_sales_reports.png',
    size: 'small'
  }
]

export const INTEGRATIONS = [
  { name: 'Bre-B', icon: CreditCard },
  { name: 'Catalogo', icon: Layout },
  { name: 'Equipo', icon: MessageSquare },
  { name: 'CRM', icon: BookOpen },
  { name: 'Clientes', icon: ShieldCheck },
  { name: 'WhatsApp', icon: Phone },
  { name: 'Soporte', icon: LifeBuoy },
  { name: 'Zapier', icon: Zap },
  { name: 'Make', icon: Activity },
  { name: 'Chat', icon: MessageCircle }
]

export const EXPLORE_TABS = [
  { id: 'playground', label: 'Agente IA', icon: Sparkles, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/playground.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/playground-mobile.png' },
  { id: 'analytics', label: 'Metricas', icon: BarChart3, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/analytics.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/analytics-mobile.png' },
  { id: 'activity', label: 'Pedidos', icon: Globe, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/activity.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/activity-mobile.png' },
  { id: 'sources', label: 'Catalogo', icon: Box, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/sources.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/sources-mobile.png' },
  { id: 'actions', label: 'Pagos', icon: GitCompare, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/actions.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/actions-mobile.png' }
]

export const HIGHLIGHT_CARDS = [
  {
    alt: "Cobros con QR Bre-B y enlace seguro",
    src: "/feature_breb_qr_pay.png",
    title: "Cobros con QR Bre-B y enlace seguro",
    desc: "Genera ordenes con valor exacto, referencia unica y una pantalla de pago lista para que el cliente pague sin errores.",
    delay: 0
  },
  {
    alt: "Catalogo y carrito desde la conversacion",
    src: "/feature_automate_actions.png",
    title: "Catalogo y carrito desde la conversacion",
    desc: "El cliente pregunta por un producto, Nova confirma datos, arma el pedido y envia el checkout sin friccion.",
    delay: 0.1
  },
  {
    alt: "Bank-Grade Infrastructure",
    src: "/feature_sync_data.png",
    title: "Pedidos, clientes y pagos trazables",
    desc: "Cada venta queda registrada con cliente, productos, estado, comprobante y contexto para gestionar entrega o seguimiento.",
    delay: 0.2
  },
  {
    alt: "Agente de Ventas Conversacional Nova",
    src: "/nova_ai_whatsapp.png",
    title: "Agente de Ventas Conversacional (Nova)",
    desc: "Nova chatea directamente con tus clientes en WhatsApp, resuelve dudas sobre tus productos y envía enlaces de pago al instante.",
    delay: 0
  },
  {
    alt: "Panel de Analíticas y Control",
    src: "/analytics_dashboard_card.png",
    title: "Panel de Analíticas y Control",
    desc: "Monitorea tus ingresos totales, tasa de conversión y el rendimiento general de tus canales digitales en tiempo real.",
    delay: 0.1
  },
  {
    alt: "Gestor de Envíos y Logística",
    src: "/shipping_logistics_card.png",
    title: "Gestor de Envíos y Logística",
    desc: "Genera guías de despacho y rastrea el estado de entrega de cada paquete de manera automatizada y sin fricciones.",
    delay: 0.2
  }
]

export const BENEFITS_DATA = [
  {
    id: 'personalized',
    title: 'Atencion personalizada',
    description: 'Responde con contexto del cliente, historial de compra y productos disponibles.',
    icon: Users,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/personalization.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'instant',
    title: 'Acciones instantaneas',
    description: 'Crea pedidos, envia enlaces de pago y acelera el cierre desde WhatsApp.',
    icon: Timer,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/automation.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'empathetic',
    title: 'Tono de marca',
    description: 'Nova puede hablar como tu negocio y mantener una experiencia cercana.',
    icon: Heart,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/empathy.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'escalations',
    title: 'Desvio a humanos',
    description: 'Cuando el caso necesita criterio humano, el flujo deja contexto para continuar.',
    icon: Split,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/escalation.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'observability',
    title: 'Visibilidad operativa',
    description: 'Revisa conversaciones, pedidos, pagos y actividad para operar sin puntos ciegos.',
    icon: Eye,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/observability.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  }
]

export const heroItemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14
    }
  }
}

export const bentoContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
}

export const bentoCardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 70,
      damping: 15
    }
  }
}
