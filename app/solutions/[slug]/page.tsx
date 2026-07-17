import React from 'react'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Zap, 
  ShoppingBag, 
  GraduationCap, 
  Activity, 
  Plane, 
  Bot, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  ShieldCheck,
  CreditCard,
  History,
  PhoneCall,
  Globe,
  BookOpen
} from 'lucide-react'

// Solution Metadata Mapping
const SOLUTIONS_MAP: Record<string, {
  title: string
  category: string
  accentColor: string
  accentText: string
  glowColor: string
  icon: any
  headline: string
  subheadline: string
  statNumber: string
  statLabel: string
  chatDemo: {
    sender: 'user' | 'bot'
    text: string
    time: string
  }[]
  features: {
    title: string
    description: string
    icon: any
  }[]
}> = {
  'customer-support': {
    title: 'Customer Support AI Agent',
    category: 'Caso de Uso',
    accentColor: '#635BFF',
    accentText: 'text-[#635BFF]',
    glowColor: 'bg-[#635BFF]/[0.03]',
    icon: MessageCircle,
    headline: 'Automatiza tu soporte y aumenta la retenciÃ³n',
    subheadline: 'Responde de forma instantÃ¡nea a las preguntas frecuentes de tus clientes, reduce el volumen de tickets de soporte y escala a agentes humanos solo cuando sea necesario.',
    statNumber: '-65%',
    statLabel: 'ReducciÃ³n en tiempo de primera respuesta',
    chatDemo: [
      { sender: 'user', text: 'Hola, Â¿dÃ³nde estÃ¡ mi pedido? El nÃºmero es #1024', time: '10:00 AM' },
      { sender: 'bot', text: 'Â¡Hola! DÃ©jame verificarlo. ðŸ” Tu pedido #1024 ya fue despachado y estÃ¡ en camino mediante Servientrega. El nÃºmero de guÃ­a es 987654321 y la entrega estimada es maÃ±ana por la tarde.', time: '10:00 AM' },
      { sender: 'user', text: 'Genial, Â¿puedo cambiar la direcciÃ³n de entrega?', time: '10:01 AM' },
      { sender: 'bot', text: 'Â¡Claro! Por favor confÃ­rmame la nueva direcciÃ³n y te transferirÃ© con un agente de soporte de inmediato para realizar la actualizaciÃ³n.', time: '10:01 AM' }
    ],
    features: [
      { title: 'Respuestas en 2 segundos', description: 'AtenciÃ³n automÃ¡tica 24/7 sobre envÃ­os, stock y polÃ­ticas de devoluciÃ³n sin esperas.', icon: Clock },
      { title: 'Escalabilidad inteligente', description: 'Transfiere automÃ¡ticamente la conversaciÃ³n a un agente humano en WhatsApp cuando el caso sea complejo.', icon: Zap },
      { title: 'SincronizaciÃ³n en tiempo real', description: 'Consulta el estado de las Ã³rdenes en la base de datos de tu tienda de forma instantÃ¡nea.', icon: ShieldCheck }
    ]
  },
  'sales-agent': {
    title: 'Sales Agent AI',
    category: 'Caso de Uso',
    accentColor: '#10B981',
    accentText: 'text-[#10B981]',
    glowColor: 'bg-[#10B981]/[0.03]',
    icon: Zap,
    headline: 'Tu mejor vendedor activo 24/7 en WhatsApp',
    subheadline: 'Califica prospectos en tiempo real, responde dudas complejas sobre tus productos, persuade a los clientes dudosos y cierra ventas enviando enlaces de pago automÃ¡ticos.',
    statNumber: '+38%',
    statLabel: 'Aumento en conversiÃ³n de ventas por chat',
    chatDemo: [
      { sender: 'user', text: 'Hola, me interesan los tenis Jordan 1. Â¿Tienen en talla 40?', time: '02:30 PM' },
      { sender: 'bot', text: 'Â¡Hola! SÃ­, tenemos stock disponible de los Jordan 1 en talla 40 para envÃ­o inmediato. ðŸ‘Ÿ Â¿Te gustarÃ­a comprarlos ahora y asegurar el envÃ­o gratuito hoy mismo?', time: '02:30 PM' },
      { sender: 'user', text: 'SÃ­, Â¿cÃ³mo puedo pagar?', time: '02:31 PM' },
      { sender: 'bot', text: 'Perfecto. He preparado tu enlace de pago seguro vÃ­a Stripe para los Jordan 1 (Talla 40). Dale clic aquÃ­ para completar tu compra en 30 segundos: flashcheckout.co/pay/1039', time: '02:31 PM' }
    ],
    features: [
      { title: 'Checkout en un clic', description: 'EnvÃ­a links de pago optimizados para tarjetas de crÃ©dito, PSE y MercadoPago dentro del chat.', icon: CreditCard },
      { title: 'CalificaciÃ³n estratÃ©gica', description: 'Pregunta e identifica las preferencias y presupuesto del cliente antes de ofrecer opciones.', icon: Sparkles },
      { title: 'Cross-selling integrado', description: 'Recomienda de forma inteligente productos complementarios basados en el carrito actual.', icon: TrendingUp }
    ]
  },
  'ecommerce-retail': {
    title: 'Ecommerce & Retail Solution',
    category: 'Industria',
    accentColor: 'rgb(249, 115, 22)',
    accentText: 'text-orange-500',
    glowColor: 'bg-orange-500/[0.03]',
    icon: ShoppingBag,
    headline: 'Acelera el checkout de tu tienda virtual',
    subheadline: 'Transforma las consultas de Instagram, TikTok y WhatsApp en compras completadas. Elimina los carritos abandonados con un flujo de pago unificado en 30 segundos.',
    statNumber: '30s',
    statLabel: 'Tiempo promedio para completar la compra',
    chatDemo: [
      { sender: 'user', text: 'Vi un vestido rojo en Instagram, Â¿aÃºn estÃ¡ disponible?', time: '11:15 AM' },
      { sender: 'bot', text: 'Â¡SÃ­! Es nuestro Vestido Amapola. Tenemos tallas S, M y L en color rojo. Cuesta $120.000 COP. Â¿Quieres que te envÃ­e el link de compra para asegurar tu talla?', time: '11:15 AM' },
      { sender: 'user', text: 'SÃ­, por favor, envÃ­amelo.', time: '11:16 AM' },
      { sender: 'bot', text: 'Â¡Listo! AquÃ­ tienes tu enlace de Checkout rÃ¡pido: flashcheckout.co/tienda/vestido-amapola. Ingresa tus datos de envÃ­o y pago en un solo paso.', time: '11:16 AM' }
    ],
    features: [
      { title: 'CatÃ¡logo sincronizado', description: 'Muestra existencias reales y fotos de tus productos sin salir del canal de mensajerÃ­a.', icon: ShoppingBag },
      { title: 'RecuperaciÃ³n de carritos', description: 'EnvÃ­a recordatorios automÃ¡ticos y amigables por WhatsApp a los clientes que no finalizaron su compra.', icon: History },
      { title: 'Omnicanalidad real', description: 'Mismos productos, precios y flujos de pago en Instagram, Facebook y WhatsApp.', icon: Globe }
    ]
  },
  'education-training': {
    title: 'Education & Training Solutions',
    category: 'Industria',
    accentColor: '#3B82F6',
    accentText: 'text-[#3B82F6]',
    glowColor: 'bg-[#3B82F6]/[0.03]',
    icon: GraduationCap,
    headline: 'Inscripciones Ã¡giles para tus cursos y talleres',
    subheadline: 'Responde dudas sobre planes de estudio, horarios y precios de forma instantÃ¡nea. Permite a los estudiantes matricularse y pagar su matrÃ­cula en segundos.',
    statNumber: '4.8x',
    statLabel: 'Incremento en velocidad de matriculaciÃ³n',
    chatDemo: [
      { sender: 'user', text: 'Hola, Â¿cuÃ¡ndo inicia el diplomado en Marketing Digital?', time: '09:05 AM' },
      { sender: 'bot', text: 'Â¡Hola! Nuestro diplomado inicia este sÃ¡bado 6 de junio. Las clases son 100% virtuales y en vivo. El costo es de $450.000 COP. Â¿Te gustarÃ­a ver el pensum de estudios?', time: '09:05 AM' },
      { sender: 'user', text: 'SÃ­, y quiero inscribirme de una vez.', time: '09:06 AM' },
      { sender: 'bot', text: 'Â¡Excelente decisiÃ³n! AquÃ­ tienes el pensum completo en PDF ðŸ“„. Para formalizar tu cupo e inscripciÃ³n, completa tu pago seguro aquÃ­: flashcheckout.co/pay/mkt-digital', time: '09:06 AM' }
    ],
    features: [
      { title: 'ResoluciÃ³n de pensum', description: 'Proporciona informaciÃ³n estructurada sobre mÃ³dulos, horarios y docentes al instante.', icon: BookOpen },
      { title: 'Pagos de matrÃ­cula rÃ¡pidos', description: 'Permite pagar mensualidades o inscripciones de contado mediante PSE o tarjeta de crÃ©dito.', icon: CreditCard },
      { title: 'Recordatorios y accesos', description: 'EnvÃ­a alertas automÃ¡ticas de inicio de clase con links a Zoom o Teams directamente por WhatsApp.', icon: Clock }
    ]
  },
  'fitness-wellness': {
    title: 'Fitness & Wellness Systems',
    category: 'Industria',
    accentColor: '#06B6D4',
    accentText: 'text-cyan-500',
    glowColor: 'bg-cyan-500/[0.03]',
    icon: Activity,
    headline: 'Automatiza reservas y cobro de membresÃ­as',
    subheadline: 'Permite a tus alumnos reservar clases, cancelar citas y pagar sus mensualidades de gimnasio o centro de bienestar directamente desde un chat de WhatsApp.',
    statNumber: '92%',
    statLabel: 'De membresÃ­as cobradas automÃ¡ticamente',
    chatDemo: [
      { sender: 'user', text: 'Hola, quiero reservar una clase de CrossFit para hoy a las 6 PM', time: '08:12 AM' },
      { sender: 'bot', text: 'Â¡Hola! Para hoy a las 6:00 PM tenemos 3 cupos disponibles en la clase del Coach Mateo. Â¿Deseas confirmar tu asistencia?', time: '08:12 AM' },
      { sender: 'user', text: 'SÃ­, reserva mi cupo por favor.', time: '08:13 AM' },
      { sender: 'bot', text: 'Â¡Hecho! Cupo reservado para hoy a las 6:00 PM. ðŸ‹ï¸â€â™‚ï¸ Te enviamos un cÃ³digo QR de acceso a tu WhatsApp. Â¡Te esperamos!', time: '08:13 AM' }
    ],
    features: [
      { title: 'Agendamiento dinÃ¡mico', description: 'SincronizaciÃ³n en tiempo real con el software de turnos y clases de tu gimnasio.', icon: Zap },
      { title: 'Suscripciones recurrentes', description: 'Realiza dÃ©bitos automÃ¡ticos mensuales de forma segura para no interrumpir membresÃ­as.', icon: CreditCard },
      { title: 'Alertas de inasistencia', description: 'Notifica automÃ¡ticamente cancelaciones y reprogramaciones segÃºn tus polÃ­ticas.', icon: PhoneCall }
    ]
  },
  'travel-hospitality': {
    title: 'Travel & Hospitality Assistant',
    category: 'Industria',
    accentColor: '#EAB308',
    accentText: 'text-yellow-500',
    glowColor: 'bg-yellow-500/[0.03]',
    icon: Plane,
    headline: 'GestiÃ³n de reservas de viaje sin fricciones',
    subheadline: 'Automatiza la atenciÃ³n a viajeros. Gestiona reservas de hoteles, tours o transporte, resuelve dudas sobre itinerarios y procesa pagos seguros de forma Ã¡gil.',
    statNumber: '24/7',
    statLabel: 'AtenciÃ³n a viajeros en mÃºltiples idiomas',
    chatDemo: [
      { sender: 'user', text: 'Hola, Â¿a quÃ© hora sale mi vuelo de BogotÃ¡ a MedellÃ­n hoy?', time: '04:45 PM' },
      { sender: 'bot', text: 'Â¡Hola! Tu vuelo de Avianca AV8560 estÃ¡ programado para salir a las 7:30 PM de El Dorado. El abordaje inicia a las 6:45 PM en la puerta 12. Recuerda hacer tu Web Check-in.', time: '04:45 PM' },
      { sender: 'user', text: 'Â¿Puedo comprar una maleta adicional para este vuelo?', time: '04:46 PM' },
      { sender: 'bot', text: 'Â¡Claro! El costo del equipaje en bodega adicional es de $55.000 COP. Puedes pagarlo y registrarlo ahora en este enlace seguro: flashcheckout.co/pay/baggage-av8560', time: '04:46 PM' }
    ],
    features: [
      { title: 'Consulta de itinerario', description: 'Entrega de vouchers de hotel, boletos y guÃ­as turÃ­sticas en PDF en el chat.', icon: BookOpen },
      { title: 'Pagos turÃ­sticos seguros', description: 'Reserva de actividades y tours locales con pasarelas de cobro internacionales de alta velocidad.', icon: CreditCard },
      { title: 'GestiÃ³n de cambios', description: 'Flujos inteligentes para reprogramaciÃ³n de fechas o polÃ­ticas de reembolsos automatizadas.', icon: Clock }
    ]
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const solution = SOLUTIONS_MAP[slug]
  if (!solution) return {}
  
  return {
    title: `${solution.title} â€” Flashcheckouts`,
    description: solution.subheadline,
  }
}

export default async function SolutionPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const solution = SOLUTIONS_MAP[slug]

  if (!solution) {
    notFound()
  }

  const { userId } = await auth()
  const IconComponent = solution.icon

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans antialiased">
      {/* Shared Navbar */}
      <Navbar userId={userId ?? undefined} />

      {/* Hero Section */}
      <section className="w-full pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        {/* Glow Background Effect */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${solution.glowColor} blur-[120px] -mr-40 -mt-20 pointer-events-none rounded-full`} />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Solution Detail & Headline */}
            <div className="lg:col-span-7 flex flex-col gap-6 items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: solution.accentColor }} />
                <span className="uppercase tracking-wider text-[10px] font-bold text-zinc-500">{solution.category}</span>
                <span className="text-zinc-300">|</span>
                <span className="text-zinc-800">{solution.title}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-950 font-display leading-[1.1]">
                {solution.headline}
              </h1>
              
              <p className="text-lg text-zinc-500 leading-relaxed max-w-2xl font-normal">
                {solution.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto pt-2">
                <Button asChild className="bg-black hover:bg-zinc-900 text-white font-medium rounded-lg px-8 h-12 text-sm shadow-md transition-all active:scale-95">
                  <Link href="/sign-up">Crear Mi Agente Gratis</Link>
                </Button>
                <Link 
                  href="/#pricing" 
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 text-sm font-semibold text-zinc-700 hover:text-black transition-colors"
                >
                  Ver planes y precios <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Metric Callout */}
              <div className="flex items-center gap-6 pt-6 border-t border-zinc-200/60 w-full mt-4">
                <div>
                  <p className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 tabular-nums leading-none">
                    {solution.statNumber}
                  </p>
                  <p className="text-xs font-medium text-zinc-400 mt-2 tracking-tight">
                    {solution.statLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Chat Mockup Simulator */}
            <div className="lg:col-span-5 w-full">
              <div className="premium-card bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden aspect-[0.85] flex flex-col justify-between">
                {/* Header Mockup */}
                <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white relative">
                      <IconComponent className="w-4 h-4 text-white" />
                      <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full absolute bottom-0 right-0" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight uppercase">Agente Inteligente</h4>
                      <p className="text-[9px] font-medium text-emerald-400">En lÃ­nea Â· Flashcheckouts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scrollbar flex flex-col justify-end">
                  {solution.chatDemo.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div className={`rounded-xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-zinc-800 text-white rounded-br-none' 
                          : 'bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] font-bold text-zinc-600 mt-1 uppercase tracking-wider">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Input Footer Mockup */}
                <div className="bg-zinc-950 px-4 py-3 border-t border-zinc-800 flex items-center gap-3">
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-[11px] font-medium text-zinc-500">
                    Escribe tu respuesta aquÃ­...
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black shadow-md hover:bg-zinc-100 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full py-16 md:py-24 border-t border-zinc-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-4 items-start max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 font-display">
              CaracterÃ­sticas construidas para rendir
            </h2>
            <p className="text-base text-zinc-500 leading-relaxed font-normal">
              Flashcheckouts potencia las ventas conversacionales proporcionando herramientas de automatizaciÃ³n seguras y de alto impacto.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {solution.features.map((feat, i) => {
              const FeatIcon = feat.icon
              return (
                <div 
                  key={i} 
                  className="premium-card p-6 bg-zinc-50/30 hover:bg-white hover:shadow-xl hover:border-zinc-300 transition-all duration-300 rounded-2xl flex flex-col gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800 border border-zinc-200/50">
                    <FeatIcon className="w-5 h-5 text-zinc-950" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-955 tracking-tight mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Dynamic CTA Banner */}
      <section className="w-full py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] blur-[100px] -mr-40 -mt-20 pointer-events-none rounded-full" />
            
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-display">
                Â¿Listo para transformar tu negocio?
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                Comienza hoy mismo de forma gratuita. Instala tu agente en 5 minutos y automatiza tus cobros y soporte de inmediato.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto shrink-0">
              <Button asChild className="bg-white hover:bg-zinc-100 text-black font-semibold rounded-lg px-8 h-12 text-sm shadow-md transition-all active:scale-95">
                <Link href="/sign-up">Empezar Ahora Gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </div>
  )
}
