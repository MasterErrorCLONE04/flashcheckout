import { AgentItem, ChatSessionItem } from './types'

export const formatSessionTime = (dateStr: string) => {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  
  const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  
  if (d.toDateString() === today.toDateString()) {
    return `Hoy, ${timeStr}`
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Ayer, ${timeStr}`
  } else {
    const day = d.getDate()
    const month = d.toLocaleString('es-ES', { month: 'short' })
    return `${day} ${month}, ${timeStr}`
  }
}

export const DEMO_SESSIONS: ChatSessionItem[] = [
  {
    id: 'demo-session-1',
    title: 'Ayúdame a crear un nuevo...',
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'demo-msg-1',
        sender: 'user',
        text: 'Ayúdame a crear un nuevo producto',
        time: '10:24 AM',
        type: 'text'
      },
      {
        id: 'demo-msg-2',
        sender: 'bot',
        text: "¡Excelente iniciativa! Para agregar un nuevo producto a tu catálogo de 'Tienda webs', necesito que me compartas los siguientes detalles: **Nombre del producto**, **Precio**, **Stock disponible** y una **breve descripción**. Una vez que me proporciones esta información, podré registrarlo de inmediato en tu panel. Mientras tanto, he preparado una estructura base para que veas cómo se procesará la creación.",
        time: '10:24 AM',
        type: 'products_list',
        products: [
          { name: 'Nuevo Producto', sales: 'Stock: 0', price: '$0' }
        ]
      },
      {
        id: 'demo-msg-3',
        sender: 'user',
        text: 'PC Gamer, 2000000, 99, crea tu la descripcion y colocale la categoria de tecnologia',
        time: '10:25 AM',
        type: 'text'
      },
      {
        id: 'demo-msg-4',
        sender: 'bot',
        text: "¡Listo! He creado el producto 'PC Gamer' en tu catálogo con un precio de $2.000.000 y un stock de 99 unidades. Le he asignado la categoría de Tecnología y una descripción atractiva para resaltar sus características. Ya está disponible para que tus clientes lo adquieran a través de tu link de checkout y el chatbot de WhatsApp.",
        time: '10:25 AM',
        type: 'product_created_card',
        productDetail: {
          name: 'PC Gamer',
          status: 'Creado',
          category: 'Tecnología',
          description: 'PC de alto rendimiento ideal para gaming, diseño y tareas exigentes. Procesador potente, gráficos dedicados y excelente refrigeración.',
          price: '$2.000.000',
          stock: 'Stock: 99',
          image: '/images/pc-gamer.png'
        }
      }
    ]
  },
  {
    id: 'demo-session-2',
    title: 'Muéstrame mis últimos pedi...',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages: []
  }
]

export const AGENTS: AgentItem[] = [
  {
    id: 'nova',
    name: 'Nova',
    role: 'Copiloto de la plataforma',
    description: 'Ayuda a gestionar productos, ver métricas, configurar integraciones y responder preguntas generales sobre tu negocio.',
    colorClass: 'bg-zinc-100 border-zinc-200 text-zinc-700',
    avatarBg: 'bg-zinc-800',
    iconColor: 'text-zinc-500'
  },
  {
    id: 'stella',
    name: 'Stella',
    role: 'Especialista en Marketing',
    description: 'Te ayuda a crear cupones de descuento, diseñar ofertas atractivas, analizar comportamiento de clientes y proponer estrategias de venta.',
    colorClass: 'bg-pink-50 border-pink-100 text-pink-650',
    avatarBg: 'bg-pink-500',
    iconColor: 'text-pink-505'
  },
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Analista de Operaciones',
    description: 'Monitorea tus pedidos, despachos, conductores y stock. Genera reportes de inventario y te alerta sobre productos agotados o críticos.',
    colorClass: 'bg-blue-50 border-blue-100 text-blue-650',
    avatarBg: 'bg-blue-500',
    iconColor: 'text-blue-505'
  },
  {
    id: 'orion',
    name: 'Orion',
    role: 'Ingeniero de Integraciones',
    description: 'Te ayuda con la conexión de tu bot de WhatsApp, pasarelas de pago (Mercado Pago, Stripe), dominios y configuraciones técnicas.',
    colorClass: 'bg-purple-50 border-purple-100 text-purple-650',
    avatarBg: 'bg-purple-500',
    iconColor: 'text-purple-505'
  }
]
