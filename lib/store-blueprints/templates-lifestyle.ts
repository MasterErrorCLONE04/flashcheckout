import type { BusinessCategoryId, IndustryTemplate } from './types'

export const LIFESTYLE_TEMPLATES: Pick<
  Record<BusinessCategoryId, IndustryTemplate>,
  'Moda' | 'Comida' | 'Belleza' | 'Hogar' | 'Joyería'
> = {
  Moda: {
    presetId: 'luxe',
    heroBadge: '✨ NUEVA COLECCIÓN DE TEMPORADA',
    bannerUrl:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Viste tu mejor versión con ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Prendas seleccionadas con cortes modernos, telas de alta durabilidad y asesoría de tallas en vivo por WhatsApp.',
    announcementText: '🚚 Envíos a todo el país · Cambios fáciles de talla garantizados',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: moda contemporánea con envíos rápidos y atención personalizada por WhatsApp.`,
    brandTone: 'Sofisticado y elegante',
    targetAudience: 'Personas que buscan estilo actual, calidad textil y compra ágil desde su celular',
    nicheFallback: 'Moda, prendas de vestir y tendencias',
    bentoTitle: 'El Sello de Nuestra Colección',
    bentoItems: [
      { emoji: '🧵', title: 'Confección Cuidada', desc: 'Textiles suaves, resistentes y con horma favorecedora' },
      { emoji: '📏', title: 'Asesoría de Talla', desc: 'Te guiamos por WhatsApp para elegir tu medida exacta' },
      { emoji: '⚡', title: 'Despacho Ágil', desc: 'Empaque impecable listo para enviar a tu puerta' },
    ],
    benefits: [
      { icon: 'Truck', label: 'Envíos nacionales', desc: 'Entrega rápida con guía' },
      { icon: 'ShieldCheck', label: 'Cambios fáciles', desc: 'Garantía en tu talla' },
      { icon: 'Award', label: 'Calidad textil', desc: 'Acabados seleccionados' },
      { icon: 'Clock', label: 'Asesoría en vivo', desc: 'Atención por WhatsApp' },
    ],
    visualCategories: [
      { category: 'Nuevos Ingresos', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop' },
      { category: 'Básicos Esenciales', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=400&auto=format&fit=crop' },
      { category: 'Edición Limitada', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Guía de Tallas y Cuidado', content: 'Consulta nuestra tabla de medidas con un asesor en WhatsApp. Recomendamos lavado delicado en agua fría para preservar color y textura.' },
      { title: 'Política de Cambios', content: 'Tienes hasta 15 días calendario para solicitar cambio de talla conservando etiquetas originales.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `La esencia detrás de ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Nacimos para acercar prendas versátiles y atemporales a quienes valoran el buen diseño y una experiencia de compra humana y sin fricciones.',
    heritageImg: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '✂️', title: 'Curaduría de Diseño', desc: 'Seleccionamos cada referencia priorizando siluetas cómodas, versatilidad y materiales que perduran temporada tras temporada.' },
    pillar2: { icon: '🤝', title: 'Cercanía Personalizada', desc: 'Combinamos catálogo digital interactivo con asesoría directa por WhatsApp para que compres siempre con total seguridad.' },
    values: [
      { title: 'Estilo Funcional', desc: 'Piezas pensadas para acompañarte del día a la noche.' },
      { title: 'Calidad Honesta', desc: 'Materiales verificados y confección de alto estándar.' },
      { title: 'Compra Confiable', desc: 'Seguimiento transparente desde el pedido hasta tu puerta.' },
    ],
    newsletterTitle: name => `Únete al Club VIP de ${name}`,
    newsletterSubtitle: 'Recibe acceso anticipado a lanzamientos, preventas exclusivas y beneficios de temporada.',
    faqs: [
      { q: '¿Cómo sé cuál es mi talla ideal?', a: 'Escríbenos al botón de WhatsApp con tu estatura o medidas habituales y nuestro asesor te confirma la horma exacta antes de pagar.' },
      { q: '¿Hacen cambios si no me queda?', a: 'Sí, gestionamos cambios de talla de forma ágil presentando la prenda sin uso y con sus etiquetas originales.' },
      { q: '¿Qué medios de pago aceptan?', a: 'Aceptamos Nequi, Bancolombia, Bre-B, PSE, tarjetas y pago contra entrega según cobertura.' },
    ],
    testimonials: [
      { name: 'Valentina Restrepo', city: 'Medellín', stars: 5, comment: 'La tela superó mis expectativas y me ayudaron a elegir la talla perfecta por WhatsApp.' },
      { name: 'Camila Osorio', city: 'Bogotá', stars: 5, comment: 'Pedí el martes y el miércoles ya lo tenía puesto. Empaque hermoso y súper cumplidos.' },
      { name: 'Daniela Mejía', city: 'Barranquilla', stars: 5, comment: 'Me encanta lo rápido que se arma el pedido en el catálogo sin tener que preguntar precio por precio.' },
    ],
  },

  Comida: {
    presetId: 'artisan',
    heroBadge: '🍽️ PREPARADO FRESCO CADA DÍA',
    bannerUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Sabor auténtico en ${name}, directo a tu mesa`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Ingredientes frescos seleccionados a diario, preparación artesanal y entrega rápida conservando toda la frescura.',
    announcementText: '🛵 Domicilios rápidos · Haz tu pedido en segundos por WhatsApp',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: gastronomía fresca e ingredientes seleccionados con pedidos ágiles a domicilio por WhatsApp.`,
    brandTone: 'Amigable y cercano',
    targetAudience: 'Amantes del buen sabor que buscan frescura, porciones generosas y domicilios puntuales',
    nicheFallback: 'Gastronomía, alimentos y bebidas artesanales',
    bentoTitle: 'Lo Que Hace Único Nuestro Menú',
    bentoItems: [
      { emoji: '🌿', title: 'Ingredientes Frescos', desc: 'Insumos seleccionados cada mañana para garantizar sabor real' },
      { emoji: '👨‍🍳', title: 'Receta de Autor', desc: 'Preparación cuidada al detalle en cada orden que sale de cocina' },
      { emoji: '🛵', title: 'Entrega en su Punto', desc: 'Empaque térmico y seguro para que disfrutes como recién hecho' },
    ],
    benefits: [
      { icon: 'Clock', label: 'Preparación al día', desc: 'Frescura garantizada' },
      { icon: 'Truck', label: 'Domicilio ágil', desc: 'Empaque protegido' },
      { icon: 'Award', label: 'Calidad artesanal', desc: 'Insumos seleccionados' },
      { icon: 'ShieldCheck', label: 'Pago flexible', desc: 'Transferencia o efectivo' },
    ],
    visualCategories: [
      { category: 'Favoritos de la Casa', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' },
      { category: 'Combos & Para Compartir', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop' },
      { category: 'Bebidas & Postres', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Frescura y Conservación', content: 'Preparamos cada pedido bajo demanda con estándares estrictos de higiene e inocuidad.' },
      { title: 'Cobertura de Domicilios', content: 'Entregamos en toda nuestra zona de cobertura y también puedes programar recogida en punto.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `Nuestra pasión por el sabor en ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Cocinamos con dedicación y respeto por cada ingrediente para llevar experiencias memorables a tu mesa todos los días.',
    heritageImg: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '🥘', title: 'Cocina Honesta', desc: 'Trabajamos con proveedores locales y materias primas frescas sin atajos industriales.' },
    pillar2: { icon: '⚡', title: 'Pedidos sin Espera', desc: 'Tu orden entra directo a preparación apenas confirmas por WhatsApp.' },
    values: [
      { title: 'Sabor Casero y Gourmet', desc: 'Equilibrio entre tradición culinaria y presentación impecable.' },
      { title: 'Puntualidad', desc: 'Respetamos tu tiempo en cada despacho a domicilio.' },
      { title: 'Atención Cálida', desc: 'Personalizamos tu orden según tus gustos o notas especiales.' },
    ],
    newsletterTitle: name => `Antojos y Promos de ${name}`,
    newsletterSubtitle: 'Suscríbete para recibir promociones especiales de fin de semana y nuevos platos del menú.',
    faqs: [
      { q: '¿Cuánto tarda en llegar mi domicilio?', a: 'El tiempo promedio de preparación y entrega es de 30 a 45 minutos dependiendo de tu ubicación.' },
      { q: '¿Puedo agregar notas o personalizar mi pedido?', a: '¡Claro! Al confirmar tu carrito hacia WhatsApp puedes indicarnos adiciones, términos o preferencias.' },
      { q: '¿Puedo programar un pedido para una hora específica?', a: 'Sí, armando tu pedido con anticipación por WhatsApp lo agendamos para la hora exacta que necesites.' },
    ],
    testimonials: [
      { name: 'Sebastián Pardo', city: 'Bogotá', stars: 5, comment: 'Llegó calientico, súper bien empacado y el sabor es increíble. Pedir por el link fue rapidísimo.' },
      { name: 'Laura Quintero', city: 'Medellín', stars: 5, comment: 'Se nota la frescura de los ingredientes. Ya es nuestro fijo cada viernes en casa.' },
      { name: 'Felipe Arango', city: 'Cali', stars: 5, comment: 'Excelente atención en WhatsApp y muy puntuales con el domicilio.' },
    ],
  },

  Belleza: {
    presetId: 'pastel',
    heroBadge: '✨ CUIDADO PERSONAL & BELLEZA AUTÉNTICA',
    bannerUrl:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Realza tu brillo natural con ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Fórmulas originales de skincare, cuidado capilar y maquillaje con asesoría personalizada para tu tipo de piel.',
    announcementText: '💖 Productos 100% originales · Asesoría gratuita de rutina por WhatsApp',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: belleza, skincare y cuidado personal 100% original con asesoría experta por WhatsApp.`,
    brandTone: 'Amigable y cercano',
    targetAudience: 'Personas que cuidan su piel, cabello y bienestar con productos confiables y efectivos',
    nicheFallback: 'Belleza, skincare, cosmética y cuidado personal',
    bentoTitle: 'Por Qué Amarás Nuestra Selección',
    bentoItems: [
      { emoji: '🌸', title: '100% Originales', desc: 'Marcas verificadas y lotes frescos garantizados' },
      { emoji: '💧', title: 'Rutina a tu Medida', desc: 'Te recomendamos según tu tipo de piel o necesidad' },
      { emoji: '🎁', title: 'Empaque Especial', desc: 'Cada pedido llega protegido y listo para disfrutar' },
    ],
    benefits: [
      { icon: 'ShieldCheck', label: 'Originalidad total', desc: 'Productos garantizados' },
      { icon: 'Star', label: 'Asesoría de rutina', desc: 'Según tu tipo de piel' },
      { icon: 'Truck', label: 'Envíos seguros', desc: 'Empaque anti-derrames' },
      { icon: 'Gift', label: 'Detalles únicos', desc: 'Experiencia boutique' },
    ],
    visualCategories: [
      { category: 'Skincare Facial', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400&auto=format&fit=crop' },
      { category: 'Maquillaje', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop' },
      { category: 'Kits & Rutinas', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Autenticidad Garantizada', content: 'Todos nuestros productos provienen de distribuidores autorizados con registro vigente.' },
      { title: 'Modo de Uso', content: 'Recibe tu guía paso a paso por WhatsApp después de tu compra para aprovechar cada activo al máximo.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `El ritual de bienestar de ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Creemos en rutinas sencillas, efectivas y honestas que transforman el cuidado diario en tu momento favorito del día.',
    heritageImg: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '✨', title: 'Curaduría Experta', desc: 'Probamos y filtramos fórmulas con ingredientes respaldados y resultados visibles.' },
    pillar2: { icon: '💬', title: 'Acompañamiento Cercano', desc: 'No compras a ciegas: resolvemos tus dudas de tonos, texturas y compatibilidad por chat.' },
    values: [
      { title: 'Confianza', desc: 'Cero imitaciones; transparencia total en ingredientes y origen.' },
      { title: 'Bienestar Real', desc: 'Recomendamos solo lo que tu piel o cabello realmente necesita.' },
      { title: 'Experiencia Cuidada', desc: 'Desde el clic en el catálogo hasta que abres tu caja.' },
    ],
    newsletterTitle: name => `Tips y Lanzamientos de ${name}`,
    newsletterSubtitle: 'Aprende rutinas de cuidado y recibe descuentos exclusivos en reposiciones.',
    faqs: [
      { q: '¿Los productos son 100% originales?', a: 'Sí, garantizamos autenticidad absoluta y fechas de vencimiento amplias en todo nuestro catálogo.' },
      { q: '¿Me ayudan a armar mi rutina desde cero?', a: '¡Por supuesto! Escríbenos por WhatsApp tu tipo de piel y objetivos y te armamos las opciones ideales.' },
      { q: '¿Cómo empacan los envíos delicados?', a: 'Usamos protección acolchada sellada para que envases de vidrio y cremas lleguen intactos a cualquier ciudad.' },
    ],
    testimonials: [
      { name: 'Natalia Vargas', city: 'Bogotá', stars: 5, comment: 'Me asesoraron increíble para mi piel mixta y todo llegó original y súper bien protegido.' },
      { name: 'Juliana Castro', city: 'Bucaramanga', stars: 5, comment: 'Amo comprar aquí, siempre tienen los productos virales disponibles para entrega inmediata.' },
      { name: 'Paola Henao', city: 'Pereira', stars: 5, comment: 'El empaque es divino y la compra por WhatsApp tardó menos de un minuto.' },
    ],
  },

  Hogar: {
    presetId: 'luxe',
    heroBadge: '🏡 DISEÑO Y ARMONÍA PARA TU ESPACIO',
    bannerUrl:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Transforma cada rincón con ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Artículos de decoración, organización y bienestar para el hogar con diseño funcional y envíos protegidos.',
    announcementText: '✨ Renueva tu hogar · Envíos seguros a todas las ciudades',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: decoración, mobiliario y detalles funcionales para elevar tus espacios.`,
    brandTone: 'Sofisticado y elegante',
    targetAudience: 'Personas y familias que disfrutan crear espacios acogedores, ordenados y con estilo propio',
    nicheFallback: 'Hogar, decoración, organización y bienestar',
    bentoTitle: 'Detalles Pensados para Durar',
    bentoItems: [
      { emoji: '🪴', title: 'Diseño Atemporal', desc: 'Piezas que armonizan fácilmente con cualquier ambiente' },
      { emoji: '🪵', title: 'Materiales Nobles', desc: 'Acabados resistentes, fáciles de limpiar y mantener' },
      { emoji: '📦', title: 'Embalaje Reforzado', desc: 'Protección multicapa para piezas delicadas en ruta' },
    ],
    benefits: [
      { icon: 'Truck', label: 'Embalaje seguro', desc: 'Cuidado en transporte' },
      { icon: 'Award', label: 'Acabados premium', desc: 'Materiales duraderos' },
      { icon: 'ShieldCheck', label: 'Compra protegida', desc: 'Garantía de llegada' },
      { icon: 'Clock', label: 'Asesoría de espacios', desc: 'Medidas por WhatsApp' },
    ],
    visualCategories: [
      { category: 'Sala & Decoración', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop' },
      { category: 'Cocina & Mesa', imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=400&auto=format&fit=crop' },
      { category: 'Descanso & Orden', imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Dimensiones y Materiales', content: 'Cada ficha incluye medidas reales; solicita fotos o videos adicionales en nuestro chat.' },
      { title: 'Garantía de Transporte', content: 'Si alguna pieza sufre novedad durante el traslado, respondemos de inmediato con reposición.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `Inspiración para vivir mejor con ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Seleccionamos objetos que combinan calidez estética y practicidad cotidiana para que disfrutes más tu casa cada día.',
    heritageImg: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '🏛️', title: 'Estética Funcional', desc: 'Creemos que el orden y la belleza transforman el bienestar diario en casa.' },
    pillar2: { icon: '🚚', title: 'Logística Cuidadosa', desc: 'Cada envío es revisado manualmente antes de salir hacia tu ciudad.' },
    values: [
      { title: 'Calidez', desc: 'Ambientes que invitan a compartir y descansar.' },
      { title: 'Durabilidad', desc: 'Objetos hechos para acompañarte por años.' },
      { title: 'Confianza', desc: 'Atención cercana desde la elección hasta la entrega.' },
    ],
    newsletterTitle: name => `Ideas & Novedades de ${name}`,
    newsletterSubtitle: 'Recibe inspiración de decoración y descuentos exclusivos de temporada.',
    faqs: [
      { q: '¿Puedo confirmar medidas exactas antes de comprar?', a: 'Sí, escríbenos por WhatsApp y te compartimos medidas detalladas y fotos reales de la referencia.' },
      { q: '¿Qué pasa si un artículo delicado llega averiado?', a: 'Tu compra cuenta con garantía total de transporte; gestionamos reposición sin costo adicional.' },
      { q: '¿Hacen envíos a todo el país?', a: 'Sí, despachamos a ciudades principales e intermedias con número de guía.' },
    ],
    testimonials: [
      { name: 'Marcela Vélez', city: 'Medellín', stars: 5, comment: 'Quedó precioso en nuestra sala. Venía súper bien protegido con burbuja y caja doble.' },
      { name: 'Jorge Lozano', city: 'Bogotá', stars: 5, comment: 'Excelente calidad y cumplimiento en los tiempos de entrega.' },
      { name: 'Adriana Solano', city: 'Manizales', stars: 5, comment: 'Me ayudaron a combinar varios tonos por WhatsApp, atención impecable.' },
    ],
  },

  Joyería: {
    presetId: 'luxe',
    heroBadge: '💎 DETALLES QUE BRILLAN CONTIGO',
    bannerUrl:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: name => `Piezas con significado en ${name}`,
    bannerSubtitle: (_name, desc) =>
      desc?.trim() ||
      'Joyería y accesorios con acabados finos, estuche de regalo incluido y atención personalizada para cada ocasión especial.',
    announcementText: '🎁 Estuche de regalo incluido en tus compras · Envíos asegurados',
    bio: (name, desc) =>
      desc?.trim() ||
      `${name}: joyería y accesorios seleccionados con empaque de regalo y compra directa por WhatsApp.`,
    brandTone: 'Sofisticado y elegante',
    targetAudience: 'Quienes buscan accesorios delicados para uso diario o regalos memorables con presentación impecable',
    nicheFallback: 'Joyería, accesorios y regalos especiales',
    bentoTitle: 'El Arte en Cada Detalle',
    bentoItems: [
      { emoji: '✨', title: 'Acabados Finos', desc: 'Materiales nobles resistentes al uso cotidiano' },
      { emoji: '🎀', title: 'Listo para Regalar', desc: 'Incluye estuche de presentación y tarjeta opcional' },
      { emoji: '💌', title: 'Asesoría de Regalo', desc: 'Te ayudamos a elegir la pieza ideal por WhatsApp' },
    ],
    benefits: [
      { icon: 'Gift', label: 'Empaque regalo', desc: 'Incluido sin costo extra' },
      { icon: 'Award', label: 'Brillo duradero', desc: 'Materiales garantizados' },
      { icon: 'Truck', label: 'Envío rápido', desc: 'A todo el país' },
      { icon: 'ShieldCheck', label: 'Compra segura', desc: 'Atención personalizada' },
    ],
    visualCategories: [
      { category: 'Collares & Cadenas', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop' },
      { category: 'Anillos & Pulseras', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop' },
      { category: 'Sets de Regalo', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop' },
    ],
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=500&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500&auto=format&fit=crop',
    ],
    accordionTabs: [
      { title: 'Cuidado de tus Piezas', content: 'Guarda tus accesorios en su estuche individual y evita contacto directo con perfumes para conservar su brillo.' },
      { title: 'Notas de Regalo', content: 'Podemos incluir un mensaje escrito a mano sin costo adicional al confirmar tu pedido.' },
    ],
    brandStoryBg: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=900&auto=format&fit=crop',
    brandStoryTitle: name => `El brillo detrás de ${name}`,
    brandStoryDesc: (_name, desc) =>
      desc?.trim() ||
      'Creamos y seleccionamos piezas atemporales que celebran momentos importantes y elevan tu estilo todos los días.',
    heritageImg: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=900&auto=format&fit=crop',
    pillar1: { icon: '💎', title: 'Selección Delicada', desc: 'Cada referencia pasa por control de calidad en cierres, engastes y baño.' },
    pillar2: { icon: '🎁', title: 'Experiencia Boutique', desc: 'Cuidamos el unboxing tanto como la joya misma.' },
    values: [
      { title: 'Elegancia Sutil', desc: 'Diseños versátiles para combinar o llevar solos.' },
      { title: 'Detalle Humano', desc: 'Acompañamos tus sorpresas y fechas especiales.' },
      { title: 'Calidad Respaldada', desc: 'Garantía directa sobre materiales y acabados.' },
    ],
    newsletterTitle: name => `Colecciones Privadas de ${name}`,
    newsletterSubtitle: 'Sé la primera persona en conocer ediciones limitadas y beneficios especiales.',
    faqs: [
      { q: '¿Puedo enviarlo directo como regalo a otra persona?', a: 'Sí, despachamos sin factura de precios visible y con tarjeta personalizada a la dirección que nos indiques.' },
      { q: '¿Qué materiales manejan?', a: 'Cada producto detalla su material exacto; escríbenos por WhatsApp si deseas ver video de cerca.' },
      { q: '¿Cuánto demora la entrega?', a: 'Entre 24 y 48 horas hábiles en ciudades principales.' },
    ],
    testimonials: [
      { name: 'Sofía Londoño', city: 'Medellín', stars: 5, comment: 'Lo pedí para el cumpleaños de mi mamá con nota personalizada y quedó feliz con el estuche.' },
      { name: 'Isabella Duque', city: 'Bogotá', stars: 5, comment: 'Delicado, brillante y exactamente igual a las fotos del catálogo.' },
      { name: 'Luisa Fernanda Gil', city: 'Cartagena', stars: 5, comment: 'Súper cumplidos y muy amables por WhatsApp.' },
    ],
  },
}

