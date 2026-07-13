require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const storeSlug = 'tienda-webs';
  console.log(`Checking store with slug: ${storeSlug}...`);

  // 1. Chocodate Style aiSettings
  const aiSettings = {
    colors: {
      primario: '#4A2E1B', // Dark warm chocolate brown
      secundario: '#C5A880', // Gold/Bronze accent
      acento: '#C5A880',
      fondo: '#FCFAF7', // Warm luxury cream background
      texto: '#2A1C12' // Dark chocolate text
    },
    typography: 'Inter',
    bannerUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=1200&auto=format&fit=crop',
    bannerTitle: 'Simply Delicious. Dates, Almonds & Belgian Chocolate.',
    bannerSubtitle: 'Handmade gourmet dates filled with crunchy golden almonds and covered in the finest selection of Belgian milk, dark, and white chocolate.',
    bannerButton: {
      text: 'Ver Catálogo',
      action: 'scroll',
      link: ''
    },
    announcement: {
      enabled: true,
      text: '✨ ¡Descubre la magia del auténtico chocolate belga y dátiles de Arabia! Checkout rápido por WhatsApp.',
      bgColor: '#C5A880',
      textColor: '#FFFFFF'
    },
    freeShipping: {
      enabled: true,
      threshold: 100000
    },
    heroType: 'video',
    heroVideoUrl: 'https://www.chocodate.com/assets/video/hero.mp4',
    sections: {
      banner: true,
      destacados: true,
      categorias: true,
      beneficios: true,
      bentoHighlights: true,
      accordionSpecs: true,
      brandStory: true,
      visualCategories: true,
      processTimeline: true,
      lifestyleGallery: true,
      newsletterWidget: true,
      ingredientsSection: true
    },
    bentoHighlights: {
      title: 'La Esencia de Chocodate',
      items: [
        { emoji: '🌴', title: 'Dátiles de Arabia', desc: 'Dulces, carnosos, ricos en fibra y seleccionados en su punto óptimo de madurez.' },
        { emoji: '🥜', title: 'Almendra Tostada', desc: 'Almendras doradas seleccionadas y tostadas artesanalmente para un contraste crujiente ideal.' },
        { emoji: '🍫', title: 'Cacao Belga Fino', desc: 'Una capa sedosa de chocolate belga de alta pureza con notas florales y de frutos secos.' }
      ]
    },
    ingredientsSection: {
      title: 'Nuestros Ingredientes Gourmet',
      leftTitle: 'Dátiles de Arabia',
      leftDesc: 'Una joya natural del desierto, jugosa y suave, que aporta el dulzor y fibra perfecta sin azúcares añadidos.',
      centerImageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=400&auto=format&fit=crop',
      rightTitle: 'Chocolate Belga',
      rightDesc: 'Exquisita cobertura aterciopelada y densa, elaborada por maestros chocolateros bajo estándares premium europeos.'
    },
    brandStory: {
      title: 'Nuestra Tradición desde 1992',
      desc: 'Chocodate nació con la visión pionera de unir dos mundos de sabor: el dátil tradicional de Oriente Medio y el chocolate de alta repostería de Europa. Hoy, cada bocado celebra esa herencia de pasión y excelencia.',
      bgUrl: 'https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=800&auto=format&fit=crop',
      btnText: 'Conoce más',
      btnLink: ''
    },
    visualCategories: [
      { category: 'Core Range', imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=300&auto=format&fit=crop' },
      { category: 'Special Edition', imageUrl: 'https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=300&auto=format&fit=crop' },
      { category: 'Matcha Series', imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop' }
    ],
    processTimeline: {
      title: 'Pide en WhatsApp en 3 Simples Pasos',
      items: [
        { step: '1', title: 'Elige tu Variedad', desc: 'Explora nuestros chocolates y agrégalos en tus empaques y tamaños preferidos.' },
        { step: '2', title: 'Datos de Entrega', desc: 'Indica a dónde enviarlo y confírmalo en el mapa interactivo.' },
        { step: '3', title: 'Envía tu Mensaje', desc: 'El checkout te llevará a WhatsApp para que envíes el pedido y el vendedor coordine tu entrega.' }
      ]
    },
    lifestyleGallery: [
      'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop'
    ],
    newsletterWidget: {
      title: 'Únete al Club Chocodate Gourmet',
      subtitle: 'Regístrate para recibir novedades exclusivas, promociones por temporadas de Ramadán y recetas especiales.',
      placeholder: 'Escribe tu correo aquí',
      btnText: 'Unirme',
      bgColor: '#4A2E1B',
      textColor: '#FFFFFF'
    },
    navbarLinks: [
      { label: 'Inicio', action: 'scroll-banner', link: '' },
      { label: 'Productos', action: 'scroll-products', link: '' },
      { label: 'Historia', action: 'scroll-story', link: '' },
      { label: 'Contacto', action: 'whatsapp', link: '' }
    ],
    benefits: {
      items: [
        { icon: 'Truck', label: 'Envíos Rápidos', desc: 'A todo el país en 24h-48h' },
        { icon: 'ShieldCheck', label: 'Garantía Total', desc: 'Dátiles frescos 100% garantizados' },
        { icon: 'Award', label: 'Ingredientes Premium', desc: 'Calidad de repostería belga' },
        { icon: 'Clock', label: 'Atención Directa', desc: 'Asistencia inmediata en WhatsApp' }
      ]
    },
    schedule: {
      enabled: true,
      text: 'Lunes a Domingo: 8:00 AM - 9:00 PM',
      alwaysOpen: true
    },
    whatsappTemplate: 'Hola! Vengo de tu catálogo Chocodate Gourmet y quiero realizar el siguiente pedido:\n\n*Productos:*\n{lista_productos}\n\n*Total:* {monto_total}\n\n*Datos de entrega:*\nNombre: {cliente_nombre}\nDirección: {direccion}\nCiudad: {ciudad}',
    accordionSpecs: {
      tabs: [
        { title: 'Ingredientes & Alérgenos', content: 'Dátil de Arabia, almendra, manteca de cacao, azúcar, leche entera en polvo, emulsionante (lecitina de soja), sabor natural de vainilla. Contiene frutos de cáscara y leche.' },
        { title: 'Información Nutricional', content: 'Porción 20g (aprox. 2 unidades):\nCalorías: 90 kcal\nGrasas totales: 3.5g (Saturadas: 1.5g)\nCarbohidratos: 12g (Azúcares naturales del dátil: 9g)\nProteínas: 1.8g' },
        { title: 'Método de Envío Térmico', content: 'Para asegurar la frescura del chocolate, todos nuestros pedidos se envían en empaques térmicos refrigerados durante temporadas cálidas.' }
      ]
    }
  };

  console.log(`Upserting store slug: ${storeSlug}...`);
  const store = await prisma.store.upsert({
    where: { slug: storeSlug },
    update: {
      name: 'Chocodate Gourmet',
      bio: 'Exquisitos dátiles de Arabia rellenos de almendra tostada y cubiertos con la más fina selección de chocolate belga.',
      aiSettings: aiSettings,
      logoUrl: null
    },
    create: {
      slug: storeSlug,
      name: 'Chocodate Gourmet',
      whatsapp: '573123456789',
      userId: 'test-user-id',
      bio: 'Exquisitos dátiles de Arabia rellenos de almendra tostada y cubiertos con la más fina selección de chocolate belga.',
      aiSettings: aiSettings,
      logoUrl: null
    }
  });

  console.log(`Upsert completed for store: ${store.name} (ID: ${store.id})`);

  // 2. Clear old products and seed new ones
  console.log('Clearing old products for this store...');
  await prisma.product.deleteMany({
    where: { storeId: store.id }
  });

  console.log('Seeding gourmet Chocodate products...');
  const products = [
    {
      name: 'Matcha Chocodate',
      price: 17500,
      stock: 35,
      category: 'Matcha Series',
      description: 'Deliciosa almendra crujiente dentro de un dátil premium de Arabia, cubierto con chocolate blanco belga infusionado con té verde Matcha japonés de grado ceremonial. El equilibrio perfecto entre Oriente y Occidente.',
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=400&auto=format&fit=crop',
      options: [
        { name: 'Tamaño', values: ['90g', '230g'] }
      ]
    },
    {
      name: 'Biscoff Cookie Chocodate',
      price: 18500,
      stock: 25,
      category: 'Special Edition',
      description: 'Dátil gourmet con almendra tostada, envuelto en una capa de crema de galletas Lotus Biscoff y bañado en chocolate belga con leche. Una combinación moderna y crujiente de sabores acaramelados.',
      imageUrl: 'https://images.unsplash.com/photo-1606312440799-b4f0c4013a21?q=80&w=400&auto=format&fit=crop',
      options: [
        { name: 'Tamaño', values: ['90g', '230g'] }
      ]
    },
    {
      name: 'Dark Chocolate Cube Box',
      price: 25000,
      stock: 40,
      category: 'Core Range',
      description: 'Caja cúbica de lujo conteniendo dátiles rellenos de almendra y bañados en chocolate negro belga premium con un 70% de cacao puro. Ideal para los amantes del chocolate intenso y los sabores sofisticados.',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=400&auto=format&fit=crop',
      options: [
        { name: 'Tamaño', values: ['150g', '200g'] }
      ]
    },
    {
      name: 'Milk Chocolate Cube Box',
      price: 25000,
      stock: 50,
      category: 'Core Range',
      description: 'Nuestra receta clásica. Una armoniosa y tradicional combinación de dátil de primera calidad, almendra dorada entera y una sedosa y cremosa capa de chocolate con leche belga tradicional.',
      imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=400&auto=format&fit=crop',
      options: [
        { name: 'Tamaño', values: ['150g', '200g'] }
      ]
    },
    {
      name: 'Assorted Chocolate Box (Mix)',
      price: 28000,
      stock: 45,
      category: 'Core Range',
      description: 'Caja de regalo surtida con la mejor mezcla seleccionada de nuestros dátiles con almendra en chocolate negro, chocolate con leche y chocolate blanco belga. Perfecta para compartir.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop',
      options: [
        { name: 'Tamaño', values: ['150g', '230g'] }
      ]
    },
    {
      name: 'Pistachio Kunafa Chocodate',
      price: 29000,
      stock: 20,
      category: 'Special Edition',
      description: 'Exclusiva edición inspirada en el famoso postre viral de Dubái. Dátil relleno de almendra y crujiente pasta de kunafa tostada mezclada con crema de pistacho puro, todo recubierto con chocolate belga con leche.',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca71450a?q=80&w=400&auto=format&fit=crop',
      options: [
        { name: 'Tamaño', values: ['80g', '150g'] }
      ]
    }
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        options: p.options,
        storeId: store.id
      }
    });
  }

  console.log('Store seeded successfully with Chocodate settings & products!');
}

main()
  .catch(err => {
    console.error('Error seeding store:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
