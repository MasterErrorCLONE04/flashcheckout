import type { BusinessCategoryId, IndustryTemplate } from './types'

export const SPECIALIZED_TEMPLATES: Pick<
  Record<BusinessCategoryId, IndustryTemplate>,
  'Tecnología' | 'Deportes' | 'Mascotas' | 'Otros'
> = {
  Tecnología: {
    presetId: 'midnight',
    heroBadge: '⚡ TECNOLOGÍA CON GARANTÍA REAL',
    bannerUrl:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Innovación y rendimiento en ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Dispositivos, accesorios y gadgets de última generación con garantía directa, soporte técnico y despacho asegurado.',
    announcementText: '🛡️ Garantía directa en todos los equipos · Envíos asegurados a nivel nacional',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: tecnología, equipos y accesorios con respaldo real y asesoría técnica por WhatsApp.`,
    brandTone: 'Profesional y directo',
    targetAudience: 'Usuarios y profesionales que buscan tecnología confiable, especificaciones claras y respaldo posventa',
    nicheFallback: 'Tecnología, electrónica, gadgets y accesorios',
    bentoTitle: 'Compra Tecnología con Respaldo Total',
    bentoItems: [
      { emoji: '🛡️', title: 'Garantía Directa', desc: 'Respaldo real contra defectos de fábrica sin trámites eternos' },
      { emoji: '📦', title: 'Sellado y Verificado', desc: 'Equipos revisados y empacados con máxima protección' },
      { emoji: '⚙️', title: 'Soporte Experto', desc: 'Te ayudamos a elegir compatibilidad y especificaciones por chat' },
    ],
    benefits: [
      { icon: 'ShieldCheck', label: 'Garantía real', desc: 'Soporte posventa directo' },
      { icon: 'Truck', label: 'Envío asegurado', desc: 'Rastreo en tiempo real' },
      { icon: 'Award', label: 'Equipos originales', desc: 'Calidad certificada' },
      { icon: 'Clock', label: 'Despacho el mismo día', desc: 'En compras antes de 2 PM' },
    ],
    visualCategories: [
      { category: 'Audio & Wearables', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop' },
      { category: 'Productividad', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop' },
      { category: 'Carga & Accesorios', imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Cobertura de Garantía', content: 'Todos nuestros productos incluyen factura digital y garantía directa por defectos de fabricación.' },
      { title: 'Envío Asegurado', content: 'Despachamos mediante transportadoras aliadas con seguro sobre el 100% del valor declarado.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `Por qué elegir ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Conectamos a nuestros clientes con tecnología funcional y duradera, ofreciendo asesoría honesta antes y después de cada compra.',
    heritageImg: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '🔬', title: 'Selección Probada', desc: 'Solo incorporamos referencias que superan pruebas reales de desempeño y durabilidad.' },
    pillar2: { icon: '⚡', title: 'Atención Ágil', desc: 'Cotizaciones, videos reales del producto y soporte inmediato desde nuestro WhatsApp oficial.' },
    values: [
      { title: 'Transparencia Técnica', desc: 'Especificaciones claras para que inviertas con certeza.' },
      { title: 'Respaldo Posventa', desc: 'Seguimos contigo después de entregar tu pedido.' },
      { title: 'Seguridad en Pagos', desc: 'Múltiples pasarelas verificadas para tu tranquilidad.' },
    ],
    newsletterTitle: name => `Ofertas Tech de ${name}`,
    newsletterSubtitle: 'Entérate primero de nuevos lanzamientos, unidades en promoción y combos exclusivos.',
    faqs: [
      { q: '¿Qué garantía tienen los productos?', a: 'Cuentas con garantía directa con nosotros conservando el empaque y número de pedido.' },
      { q: '¿Cómo sé si un accesorio es compatible con mi equipo?', a: 'Escríbenos el modelo exacto de tu dispositivo en WhatsApp y verificamos compatibilidad al instante.' },
      { q: '¿El envío va asegurado?', a: 'Sí, todos los despachos viajan asegurados por el 100% de su valor hasta la entrega en tu dirección.' },
    ],
    testimonials: [
      { name: 'Carlos Mendoza', city: 'Bogotá', stars: 5, comment: 'Excelente asesoría técnica, el equipo llegó sellado al día siguiente y funcionando perfecto.' },
      { name: 'David Salazar', city: 'Cali', stars: 5, comment: 'Muy confiables. Me enviaron guía el mismo día que hice el pago por PSE.' },
      { name: 'Esteban Rojas', city: 'Medellín', stars: 5, comment: 'Calidad brutal y precios justos. Súper recomendado.' },
    ],
  },

  Deportes: {
    presetId: 'streetwear',
    heroBadge: '🔥 SUPERA TUS LÍMITES CADA DÍA',
    bannerUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Potencia tu entrenamiento con ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Indumentaria deportiva, suplementación e implementos de alto rendimiento para entrenar con máxima energía.',
    announcementText: '⚡ Despachos express · Asesoría para tus objetivos en WhatsApp',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: equipamiento, ropa deportiva y bienestar fitness con entrega rápida.`,
    brandTone: 'Profesional y directo',
    targetAudience: 'Deportistas y personas activas que buscan desempeño, comodidad y resultados reales',
    nicheFallback: 'Fitness, deporte, ropa deportiva y suplementación',
    bentoTitle: 'Diseñado para el Alto Rendimiento',
    bentoItems: [
      { emoji: '💪', title: 'Máximo Desempeño', desc: 'Materiales transpirables y productos de calidad comprobada' },
      { emoji: '🎯', title: 'Asesoría según tu Meta', desc: 'Te orientamos según tu disciplina o nivel actual' },
      { emoji: '🚀', title: 'Entrega Rápida', desc: 'No detengas tu rutina: despachamos de inmediato' },
    ],
    benefits: [
      { icon: 'Award', label: 'Alto rendimiento', desc: 'Calidad deportiva real' },
      { icon: 'Truck', label: 'Envíos rápidos', desc: 'A nivel nacional' },
      { icon: 'ShieldCheck', label: '100% garantizado', desc: 'Compra con respaldo' },
      { icon: 'Clock', label: 'Soporte directo', desc: 'Asesoría por chat' },
    ],
    visualCategories: [
      { category: 'Entrenamiento', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' },
      { category: 'Ropa Deportiva', imageUrl: 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?q=80&w=400&auto=format&fit=crop' },
      { category: 'Accesorios & Combos', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Especificaciones de Rendimiento', content: 'Productos seleccionados para soportar rutinas exigentes en gimnasio o exterior.' },
      { title: 'Envíos y Cambios', content: 'Despachos ágiles a todo el país y respaldo garantizado en tu pedido.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `El ADN deportivo de ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Acompañamos a quienes entrenan con disciplina cada día, entregando productos confiables que impulsan cada repetición y cada kilómetro.',
    heritageImg: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '🏆', title: 'Calidad Comprobada', desc: 'Referencias testeadas por atletas y entrenadores.' },
    pillar2: { icon: '⚡', title: 'Compra Sin Fricción', desc: 'Pide en segundos desde tu móvil y recibe rápido en casa.' },
    values: [
      { title: 'Disciplina', desc: 'Constancia en la calidad de todo lo que ofrecemos.' },
      { title: 'Energía', desc: 'Impulsamos tu estilo de vida activo.' },
      { title: 'Confianza', desc: 'Originalidad y cumplimiento en cada entrega.' },
    ],
    newsletterTitle: name => `Comunidad Fitness de ${name}`,
    newsletterSubtitle: 'Recibe promociones exclusivas, combos de temporada y lanzamientos.',
    faqs: [
      { q: '¿Me asesoran según mi objetivo de entrenamiento?', a: 'Sí, escríbenos por WhatsApp y te recomendamos las mejores opciones para tu rutina.' },
      { q: '¿En cuánto tiempo despachan los pedidos?', a: 'Alistamos y enviamos en 24 horas hábiles con guía de seguimiento.' },
      { q: '¿Qué métodos de pago manejan?', a: 'Aceptamos transferencias, PSE, tarjetas y pago contra entrega según tu ciudad.' },
    ],
    testimonials: [
      { name: 'Mateo Rivera', city: 'Medellín', stars: 5, comment: 'Excelente calidad para entrenar pesado, llegó rapidísimo.' },
      { name: 'Sara Morales', city: 'Bogotá', stars: 5, comment: 'Súper cómodos y la atención por WhatsApp fue inmediata.' },
      { name: 'Nicolás Peña', city: 'Cali', stars: 5, comment: 'Todo original y a muy buen precio.' },
    ],
  },

  Mascotas: {
    presetId: 'artisan',
    heroBadge: '🐾 BIENESTAR Y AMOR PARA TU MASCOTA',
    bannerUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Todo lo que hace feliz a tu peludo en ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Nutrición, accesorios, juguetes y bienestar para perros y gatos con entrega rápida a domicilio.',
    announcementText: '🐶 Envíos rápidos a casa · Consiente a tu mascota hoy mismo',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: alimentos, snacks y accesorios pensados para la salud y felicidad de tus mascotas.`,
    brandTone: 'Amigable y cercano',
    targetAudience: 'Familias multiespecie que buscan lo mejor en nutrición, juego y cuidado para sus perros y gatos',
    nicheFallback: 'Mascotas, accesorios pet, nutrición y cuidado animal',
    bentoTitle: 'Cuidado Confiable para Ellos',
    bentoItems: [
      { emoji: '🦴', title: 'Nutrición Segura', desc: 'Alimentos y snacks frescos de marcas confiables' },
      { emoji: '🎾', title: 'Diversión & Confort', desc: 'Camas, juguetes y paseos resistentes y ergonómicos' },
      { emoji: '🏠', title: 'Directo a Casa', desc: 'Olvídate de cargar bultos pesados: te lo llevamos' },
    ],
    benefits: [
      { icon: 'Truck', label: 'Domicilio rápido', desc: 'Sin cargar peso' },
      { icon: 'ShieldCheck', label: 'Marcas seguras', desc: 'Calidad garantizada' },
      { icon: 'Star', label: 'Asesoría de talla/edad', desc: 'Para cachorro o adulto' },
      { icon: 'Gift', label: 'Amor por los peludos', desc: 'Atención dedicada' },
    ],
    visualCategories: [
      { category: 'Alimento & Snacks', imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=400&auto=format&fit=crop' },
      { category: 'Paseo & Descanso', imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=400&auto=format&fit=crop' },
      { category: 'Juguetes & Higiene', imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Guía por Tamaño y Edad', content: 'Consúltanos la raza y peso de tu mascota en WhatsApp para elegir la referencia exacta.' },
      { title: 'Entregas Programadas', content: 'Pide tu recompra mensual en dos clics y recíbela puntual en casa.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `Nuestro amor por los animales en ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Sabemos que son parte de tu familia; por eso elegimos productos seguros y duraderos que cuidan su salud y alegría.',
    heritageImg: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '🐾', title: 'Bienestar Animal', desc: 'Productos libres de materiales tóxicos y con respaldo nutricional.' },
    pillar2: { icon: '💚', title: 'Servicio Cercano', desc: 'Te atendemos con el mismo cariño con el que consientes a tu mascota.' },
    values: [
      { title: 'Empatía', desc: 'Cada mascota tiene necesidades únicas.' },
      { title: 'Calidad', desc: 'Artículos resistentes al juego diario.' },
      { title: 'Puntualidad', desc: 'Su alimento y favoritos siempre a tiempo.' },
    ],
    newsletterTitle: name => `Club Pet Lover de ${name}`,
    newsletterSubtitle: 'Recibe descuentos especiales y consejos de bienestar para tu perro o gato.',
    faqs: [
      { q: '¿Cómo elijo la talla de arnés, collar o cama?', a: 'Envíanos raza o peso de tu peludo al WhatsApp y te indicamos la talla exacta.' },
      { q: '¿Qué tan rápido entregan el alimento?', a: 'Despachamos prioritariamente para que tu mascota nunca se quede sin su concentrado o snacks.' },
      { q: '¿Qué formas de pago aceptan?', a: 'Nequi, Bancolombia, PSE, tarjetas y pago contra entrega según cobertura.' },
    ],
    testimonials: [
      { name: 'Catalina Ruiz', city: 'Bogotá', stars: 5, comment: 'Mi perrito amó su cama nueva y el pedido llegó el mismo día.' },
      { name: 'Alejandro Toro', city: 'Medellín', stars: 5, comment: 'Súper práctico pedir el concentrado por WhatsApp sin salir de casa.' },
      { name: 'Diana Ospina', city: 'Envigado', stars: 5, comment: 'Excelente atención, me ayudaron con la talla perfecta del arnés.' },
    ],
  },

  Otros: {
    presetId: 'luxe',
    heroBadge: '✨ CATÁLOGO OFICIAL EN LÍNEA',
    bannerUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Bienvenido a ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Explora nuestro catálogo actualizado, recibe atención personalizada inmediata y confirma tu solicitud en segundos por WhatsApp.',
    announcementText: '⚡ Atención personalizada inmediata por WhatsApp · Compra 100% segura',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: catálogo digital oficial con atención rápida y pedidos directos por WhatsApp.`,
    brandTone: 'Profesional y directo',
    targetAudience: 'Clientes que valoran rapidez, claridad de precios y atención directa sin intermediarios',
    nicheFallback: 'Comercio y servicios especializados',
    bentoTitle: 'Por Qué Elegirnos',
    bentoItems: [
      { emoji: '✅', title: 'Calidad Garantizada', desc: 'Cada producto o servicio cumple altos estándares de entrega' },
      { emoji: '💬', title: 'Atención Directa', desc: 'Resolvemos tus inquietudes en tiempo real por WhatsApp' },
      { emoji: '🔒', title: 'Pago Flexible y Seguro', desc: 'Múltiples opciones confiables para completar tu orden' },
    ],
    benefits: [
      { icon: 'ShieldCheck', label: 'Respaldo real', desc: 'Compra con confianza' },
      { icon: 'Clock', label: 'Respuesta ágil', desc: 'Atención directa' },
      { icon: 'Award', label: 'Calidad superior', desc: 'Selección cuidada' },
      { icon: 'Truck', label: 'Cobertura amplia', desc: 'Entregas cumplidas' },
    ],
    visualCategories: [
      { category: 'Destacados', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop' },
      { category: 'Novedades', imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=400&auto=format&fit=crop' },
      { category: 'Paquetes Especiales', imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Proceso de Solicitud', content: 'Selecciona tus opciones en el catálogo y confirma en un clic hacia nuestro WhatsApp oficial.' },
      { title: 'Garantía y Soporte', content: 'Acompañamiento completo antes, durante y después de tu compra.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `Conoce más sobre ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Trabajamos con compromiso y excelencia para brindar soluciones confiables y una experiencia ágil a cada cliente.',
    heritageImg: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '🌟', title: 'Compromiso de Calidad', desc: 'Cuidamos cada detalle para superar tus expectativas en cada entrega.' },
    pillar2: { icon: '📲', title: 'Experiencia Digital Simple', desc: 'Cotiza, resuelve dudas y paga en segundos desde cualquier dispositivo.' },
    values: [
      { title: 'Cumplimiento', desc: 'Honramos tiempos y acuerdos en cada orden.' },
      { title: 'Cercanía', desc: 'Trato humano apoyado en tecnología ágil.' },
      { title: 'Transparencia', desc: 'Precios claros y comunicación directa.' },
    ],
    newsletterTitle: name => `Novedades de ${name}`,
    newsletterSubtitle: 'Déjanos tu correo para enterarte de lanzamientos y beneficios exclusivos.',
    faqs: [
      { q: '¿Cómo realizo mi pedido?', a: 'Agrega lo que necesitas al carrito, completa tus datos básicos y confirma directo en nuestro WhatsApp.' },
      { q: '¿Qué métodos de pago aceptan?', a: 'Recibimos Nequi, Bancolombia, Bre-B, PSE, tarjetas y pago acordado con asesor.' },
      { q: '¿Puedo recibir asesoría antes de pagar?', a: 'Sí, pulsa el botón flotante de WhatsApp en cualquier momento para hablar con nosotros.' },
    ],
    testimonials: [
      { name: 'Andrés Felipe Mora', city: 'Bogotá', stars: 5, comment: 'Proceso súper claro y rápido, me atendieron al instante.' },
      { name: 'Claudia Patricia Gil', city: 'Medellín', stars: 5, comment: 'Excelente servicio y cumplimiento de principio a fin.' },
      { name: 'Ricardo Gómez', city: 'Cali', stars: 5, comment: 'Muy fácil hacer el pedido desde el celular.' },
    ],
  },
}

