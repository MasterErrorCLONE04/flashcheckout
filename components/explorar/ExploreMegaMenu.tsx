'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Shirt,
  Headphones,
  Trophy,
  Footprints,
  Briefcase,
  Home,
  Dumbbell,
  Sparkle,
  Gem,
  Package,
  Baby,
  HeartPulse,
  Stethoscope,
  Gift,
  Dog,
  PencilRuler,
  Factory,
  Store,
  HardHat,
  Building2,
  Armchair,
  Lightbulb,
  Tv,
  Wrench,
  Car,
  Hammer,
  Sun,
  Plug,
  ShieldCheck,
  Boxes,
  Gauge,
  Activity,
  Cpu,
  Truck,
  Wheat,
  Layers,
  Cog,
  Server,
} from 'lucide-react'

type SubCategory = {
  name: string
  image: string
  badge?: 'new' | 'hot'
  href: string
}

type MainCategoryGroup = {
  id: string
  name: string
  icon: any
  subcategories: SubCategory[]
}

const MEGA_CATEGORIES: MainCategoryGroup[] = [
  {
    id: 'for-you',
    name: 'Categorías para ti',
    icon: Sparkles,
    subcategories: [
      { name: 'Cámara', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=80', badge: 'new', href: '/explorar?category=Camaras' },
      { name: 'Cámaras digitales', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&auto=format&fit=crop&q=80', badge: 'new', href: '/explorar?category=Camaras' },
      { name: 'Accesorios drones', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=150&auto=format&fit=crop&q=80', badge: 'new', href: '/explorar?category=Drones' },
      { name: 'Bicicleta', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=150&auto=format&fit=crop&q=80', badge: 'hot', href: '/explorar?category=Veh%C3%ADculos' },
      { name: 'Motos eléctricas', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150&auto=format&fit=crop&q=80', badge: 'hot', href: '/explorar?category=Veh%C3%ADculos' },
      { name: 'Carros', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
      { name: 'Teléfono 5G', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=80', badge: 'new', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Scooter', image: 'https://images.unsplash.com/photo-1597047084897-51e81819a499?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
      { name: 'Sandalias', image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
      { name: 'TV Inteligentes', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=150&auto=format&fit=crop&q=80', badge: 'new', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Bolsos', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80', badge: 'hot', href: '/explorar?category=Moda' },
      { name: 'Drones pro', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=150&auto=format&fit=crop&q=80', badge: 'hot', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Portátiles', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&auto=format&fit=crop&q=80', badge: 'hot', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Motocicleta', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
    ],
  },
  {
    id: 'clothing',
    name: 'Ropa y Accesorios',
    icon: Shirt,
    subcategories: [
      { name: 'Gorras de béisbol', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
      { name: 'Ropa de anime', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
      { name: 'Shorts baloncesto', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Deportes' },
      { name: 'Bata de baño', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
      { name: 'Camiseta de béisbol', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Deportes' },
      { name: 'Vestido de playa', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
      { name: 'Vestido africano', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
    ],
  },
  {
    id: 'electronics',
    name: 'Electrónicos',
    icon: Headphones,
    subcategories: [
      { name: 'Audífonos inalámbricos', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80', badge: 'hot', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Reloj inteligente', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80', badge: 'new', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Consolas de juego', image: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Parlantes Bluetooth', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
    ],
  },
  {
    id: 'sports',
    name: 'Deportes y Entretenimiento',
    icon: Trophy,
    subcategories: [
      { name: 'Balones de fútbol', image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Deportes' },
      { name: 'Equipamiento gimnasio', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Deportes' },
      { name: 'Patinetas', image: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Deportes' },
    ],
  },
  {
    id: 'shoes',
    name: 'Zapatos y Accesorios',
    icon: Footprints,
    subcategories: [
      { name: 'Zapatillas deportivas', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80', badge: 'hot', href: '/explorar?category=Moda' },
      { name: 'Botas de cuero', image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
    ],
  },
  {
    id: 'bags',
    name: 'Maletas, Bolsas y Fundas',
    icon: Briefcase,
    subcategories: [
      { name: 'Mochilas ejecutivas', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
      { name: 'Maletas de viaje', image: 'https://images.unsplash.com/photo-1565026057447-b88ae415b256?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
    ],
  },
  {
    id: 'home',
    name: 'Hogar y Jardín',
    icon: Home,
    subcategories: [
      { name: 'Lámparas LED decorativas', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
      { name: 'Humificadores aroma', image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'outdoor',
    name: 'Ropa deportiva y para el aire libre',
    icon: Dumbbell,
    subcategories: [
      { name: 'Chaquetas impermeables', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Deportes' },
      { name: 'Carpas para acampar', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Deportes' },
    ],
  },
  {
    id: 'beauty',
    name: 'Belleza',
    icon: Sparkle,
    subcategories: [
      { name: 'Kits de maquillaje', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Salud' },
      { name: 'Cuidado facial', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Salud' },
    ],
  },
  {
    id: 'jewelry',
    name: 'Joyas, lentes y relojes',
    icon: Gem,
    subcategories: [
      { name: 'Gafas de sol', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
      { name: 'Anillos de plata', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Moda' },
    ],
  },
  {
    id: 'packaging',
    name: 'Embalaje e Impresión',
    icon: Package,
    subcategories: [
      { name: 'Cajas personalizadas', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'kids',
    name: 'Padres, niños y juguetes',
    icon: Baby,
    subcategories: [
      { name: 'Coches para bebé', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
    ],
  },
  {
    id: 'personal-care',
    name: 'Cuidado personal y Cuidado del hogar',
    icon: HeartPulse,
    subcategories: [
      { name: 'Cepillos eléctricos', image: 'https://images.unsplash.com/photo-1559671980-b55822d28d88?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Salud' },
    ],
  },
  // --- Additional Categories Requested by User ---
  {
    id: 'health-medicine',
    name: 'Salud y Medicina',
    icon: Stethoscope,
    subcategories: [
      { name: 'Termómetros e higiene', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Salud' },
      { name: 'Monitores médicos', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Salud' },
    ],
  },
  {
    id: 'gifts-crafts',
    name: 'Regalos y Artesanías',
    icon: Gift,
    subcategories: [
      { name: 'Cajas de regalo', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
      { name: 'Velas aromáticas', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'pet-care',
    name: 'Cuidado de Mascotas',
    icon: Dog,
    subcategories: [
      { name: 'Juguetes para perro', image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
      { name: 'Camas para gato', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'school-office',
    name: 'Escuela y Oficina',
    icon: PencilRuler,
    subcategories: [
      { name: 'Cuadernos y organizadores', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
      { name: 'Escritorios ergonómicos', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'industrial-machinery',
    name: 'Maquinaria Industrial',
    icon: Factory,
    subcategories: [
      { name: 'Generadores eléctricos', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Compresores de aire', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'commercial-equipment',
    name: 'Equipamiento Comercial y Maquinaria',
    icon: Store,
    subcategories: [
      { name: 'Cajas registradoras POS', image: 'https://images.unsplash.com/photo-1556742049-0a670fc8078a?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Refrigeradores comerciales', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'construction-machinery',
    name: 'Maquinaria de construcción',
    icon: HardHat,
    subcategories: [
      { name: 'Excavadoras compactas', image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Mezcladoras de concreto', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'construction-real-estate',
    name: 'Construcción y Bienes Raíces',
    icon: Building2,
    subcategories: [
      { name: 'Pisos y azulejos', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
      { name: 'Paneles térmicos', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'furniture',
    name: 'Muebles',
    icon: Armchair,
    subcategories: [
      { name: 'Sofás de sala', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
      { name: 'Sillas modernas', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'lights-lighting',
    name: 'Luces e Iluminación',
    icon: Lightbulb,
    subcategories: [
      { name: 'Tiras LED RGB', image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
      { name: 'Lámparas de techo', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'appliances',
    name: 'Electrodomésticos',
    icon: Tv,
    subcategories: [
      { name: 'Licuadoras y procesadores', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
      { name: 'Freidoras de aire', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Hogar' },
    ],
  },
  {
    id: 'auto-tools',
    name: 'Suministros y herramientas para auto',
    icon: Wrench,
    subcategories: [
      { name: 'Kits de llaves y dados', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
      { name: 'Cargadores de batería', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
    ],
  },
  {
    id: 'auto-parts',
    name: 'Piezas y accesorios para vehículos',
    icon: Car,
    subcategories: [
      { name: 'Filtros de aceite', image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
      { name: 'Luces LED para auto', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
    ],
  },
  {
    id: 'tools',
    name: 'Herramientas',
    icon: Hammer,
    subcategories: [
      { name: 'Taladros inalámbricos', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Sierras circulares', image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'renewable-energy',
    name: 'Energía Renovable',
    icon: Sun,
    subcategories: [
      { name: 'Paneles solares', image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Inversores de voltaje', image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
    ],
  },
  {
    id: 'electrical-supplies',
    name: 'Equipos y suministros eléctricos',
    icon: Plug,
    subcategories: [
      { name: 'Interruptores inteligentes', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Cables de alta tensión', image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
    ],
  },
  {
    id: 'security-surveillance',
    name: 'Seguridad y Vigilancia',
    icon: ShieldCheck,
    subcategories: [
      { name: 'Cámaras de seguridad IP', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Sistemas de alarma', image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
    ],
  },
  {
    id: 'materials-handling',
    name: 'Manejo de Materiales',
    icon: Boxes,
    subcategories: [
      { name: 'Montacargas manuales', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Estanterías metálicas', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'testing-instruments',
    name: 'Instrumentos y equipos de prueba',
    icon: Gauge,
    subcategories: [
      { name: 'Multímetros digitales', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Osciloscopios', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
    ],
  },
  {
    id: 'power-transmission',
    name: 'Transmisión de Energía',
    icon: Activity,
    subcategories: [
      { name: 'Motores reductores', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Cadenas de transmisión', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'electronic-parts',
    name: 'Partes electrónicas',
    icon: Cpu,
    subcategories: [
      { name: 'Placas de circuito PCB', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
      { name: 'Microcontroladores Arduino', image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Tecnolog%C3%ADa' },
    ],
  },
  {
    id: 'vehicles-transportation',
    name: 'Vehículos y Transporte',
    icon: Truck,
    subcategories: [
      { name: 'Camiones ligeros', image: 'https://images.unsplash.com/photo-1501700493788-df1a6795090b?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
      { name: 'Remolques de carga', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Veh%C3%ADculos' },
    ],
  },
  {
    id: 'agriculture-food',
    name: 'Agricultura, Alimentos y Bebidas',
    icon: Wheat,
    subcategories: [
      { name: 'Sistemas de riego', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
      { name: 'Semillas orgánicas', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
    ],
  },
  {
    id: 'raw-materials',
    name: 'Materias primas',
    icon: Layers,
    subcategories: [
      { name: 'Resinas plásticas', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Lingotes de aluminio', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'fabrication-services',
    name: 'Servicios de Fabricación',
    icon: Cog,
    subcategories: [
      { name: 'Corte Láser CNC', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
      { name: 'Impresión 3D industrial', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Maquinaria' },
    ],
  },
  {
    id: 'services',
    name: 'Servicio',
    icon: Server,
    subcategories: [
      { name: 'Consultoría logística', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
      { name: 'Inspección de calidad', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80', href: '/explorar?category=Todos' },
    ],
  },
]

type ExploreMegaMenuProps = {
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ExploreMegaMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: ExploreMegaMenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('for-you')

  if (!isOpen) return null

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 pt-1 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-b-2xl rounded-t-lg border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 flex max-h-[560px]">
          {/* Left Vertical Category List Sidebar */}
          <div className="w-72 shrink-0 border-r border-zinc-200/80 bg-zinc-50/50 dark:border-white/10 dark:bg-zinc-950/40 p-2 overflow-y-auto no-scrollbar">
            <div className="space-y-0.5">
              {MEGA_CATEGORIES.map((group) => {
                const Icon = group.icon
                const isActive = activeCategoryId === group.id

                return (
                  <button
                    key={group.id}
                    onMouseEnter={() => setActiveCategoryId(group.id)}
                    onClick={() => setActiveCategoryId(group.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 dark:bg-white/10 dark:text-white dark:border-white/10 font-bold'
                        : 'text-zinc-700 hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 ${isActive ? 'text-black dark:text-white' : 'text-zinc-500'}`} />
                    <span className="truncate">{group.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Main Content Showcase Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-white dark:bg-zinc-900">
            {MEGA_CATEGORIES.map((group) => {
              return (
                <div key={group.id} id={`sec-${group.id}`} className="space-y-4">
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-white/5">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{group.name}</span>
                    </h3>

                    {group.id === 'clothing' && (
                      <Link
                        href="/explorar?category=Moda"
                        className="text-xs font-semibold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white underline underline-offset-4 flex items-center gap-1"
                      >
                        Explorar selecciones destacadas
                      </Link>
                    )}
                  </div>

                  {/* Circular Product Subcategories Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-4">
                    {group.subcategories.map((sub, idx) => (
                      <Link
                        key={idx}
                        href={sub.href}
                        className="group flex flex-col items-center text-center p-1"
                      >
                        {/* Circular Image Container with Badges */}
                        <div className="relative size-16 sm:size-20 rounded-full bg-zinc-100 dark:bg-zinc-800 p-0.5 mb-2 overflow-hidden shadow-xs group-hover:shadow-md transition-all">
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="h-full w-full rounded-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {sub.badge === 'new' && (
                            <span className="absolute top-0 right-0 size-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                              ↗
                            </span>
                          )}
                          {sub.badge === 'hot' && (
                            <span className="absolute top-0 right-0 size-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                              🔥
                            </span>
                          )}
                        </div>

                        {/* Title Label */}
                        <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight group-hover:text-black dark:group-hover:text-white group-hover:font-semibold">
                          {sub.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
