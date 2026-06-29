const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const store = await prisma.store.findFirst({
    where: { slug: 'tienda-webs' }
  });

  if (!store) {
    console.error('Store not found.');
    return;
  }

  // Create demo products first
  console.log('Seeding products for store:', store.id);
  const products = [
    { id: 'prod-1', name: 'Suero Hidratante de Ácido Hialurónico', price: 45000, stock: 15, active: true, category: 'Skincare' },
    { id: 'prod-2', name: 'Crema Hidratante Facial de Noche', price: 65000, stock: 8, active: true, category: 'Skincare' },
    { id: 'prod-3', name: 'Protector Solar Gel SPF 50', price: 55000, stock: 20, active: true, category: 'Skincare' },
    { id: 'prod-4', name: 'Limpiador Facial Espumoso Espeso', price: 38000, stock: 12, active: true, category: 'Skincare' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        active: p.active,
        category: p.category,
        storeId: store.id,
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80'
      }
    });
  }

  // Create mock orders
  console.log('Seeding mock orders connected to the store...');
  const mockOrders = [
    {
      id: 'pay-cmq-001',
      customerName: 'María González',
      customerPhone: '573124567890',
      address: 'Calle 100 #15-30, Oficina 402',
      city: 'Bogotá',
      total: 245000,
      status: 'delivered',
      createdAt: new Date('2026-05-14T10:30:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Suero Hidratante de Ácido Hialurónico', qty: 2, price: 45000 },
        { name: 'Crema Hidratante Facial de Noche', qty: 1, price: 65000 },
        { name: 'Protector Solar Gel SPF 50', qty: 2, price: 55000 }
      ]
    },
    {
      id: 'pay-cmq-002',
      customerName: 'Carlos Ramírez',
      customerPhone: '573117894561',
      address: 'Carrera 7 #72-80, Apto 901',
      city: 'Bogotá',
      total: 189000,
      status: 'delivered',
      createdAt: new Date('2026-04-28T18:20:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Crema Hidratante Facial de Noche', qty: 2, price: 65000 },
        { name: 'Limpiador Facial Espumoso Espeso', qty: 1, price: 38000 },
        { name: 'Suero Hidratante de Ácido Hialurónico', qty: 1, price: 45000 }
      ]
    },
    {
      id: 'pay-cmq-003',
      customerName: 'Ana López',
      customerPhone: '573001234567',
      address: 'Avenida El Dorado #68b-85',
      city: 'Bogotá',
      total: 95000,
      status: 'delivered',
      createdAt: new Date('2026-05-13T14:15:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Protector Solar Gel SPF 50', qty: 1, price: 55000 },
        { name: 'Limpiador Facial Espumoso Espeso', qty: 1, price: 38000 }
      ]
    },
    {
      id: 'pay-cmq-004',
      customerName: 'Pedro Sánchez',
      customerPhone: '573156543210',
      address: 'Calle 26 #59-51',
      city: 'Bogotá',
      total: 560000,
      status: 'cancelled',
      createdAt: new Date('2026-05-12T11:05:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Crema Hidratante Facial de Noche', qty: 4, price: 65000 },
        { name: 'Protector Solar Gel SPF 50', qty: 4, price: 55000 },
        { name: 'Suero Hidratante de Ácido Hialurónico', qty: 2, price: 45000 }
      ]
    },
    {
      id: 'pay-cmq-005',
      customerName: 'Laura Torres',
      customerPhone: '573109876543',
      address: 'Calle 134 #9-45, Torre 2, Apto 502',
      city: 'Bogotá',
      total: 125000,
      status: 'delivered',
      createdAt: new Date('2026-05-10T16:45:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Limpiador Facial Espumoso Espeso', qty: 2, price: 38000 },
        { name: 'Suero Hidratante de Ácido Hialurónico', qty: 1, price: 45000 }
      ]
    },
    {
      id: 'pay-cmq-006',
      customerName: 'Javier Morales',
      customerPhone: '573165558899',
      address: 'Transversal 23 #97-73',
      city: 'Bogotá',
      total: 780000,
      status: 'pending',
      createdAt: new Date('2026-05-09T10:10:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Crema Hidratante Facial de Noche', qty: 5, price: 65000 },
        { name: 'Protector Solar Gel SPF 50', qty: 5, price: 55000 },
        { name: 'Limpiador Facial Espumoso Espeso', qty: 3, price: 38000 }
      ]
    },
    {
      id: 'pay-cmq-007',
      customerName: 'Sofia Herrera',
      customerPhone: '573012233344',
      address: 'Diagonal 45 #32a-10',
      city: 'Bogotá',
      total: 1120000,
      status: 'delivered',
      createdAt: new Date('2026-05-08T15:30:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Crema Hidratante Facial de Noche', qty: 8, price: 65000 },
        { name: 'Suero Hidratante de Ácido Hialurónico', qty: 8, price: 45000 },
        { name: 'Limpiador Facial Espumoso Espeso', qty: 6, price: 38000 }
      ]
    },
    {
      id: 'pay-cmq-008',
      customerName: 'Andrés Vega',
      customerPhone: '573174445566',
      address: 'Calle 80 #11-12',
      city: 'Bogotá',
      total: 320000,
      status: 'pending',
      createdAt: new Date('2026-05-06T09:20:00Z'),
      deliveryRequested: false,
      items: [
        { name: 'Suero Hidratante de Ácido Hialurónico', qty: 4, price: 45000 },
        { name: 'Limpiador Facial Espumoso Espeso', qty: 2, price: 38000 },
        { name: 'Protector Solar Gel SPF 50', qty: 1, price: 55000 }
      ]
    }
  ];

  for (const o of mockOrders) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        address: o.address,
        city: o.city,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        deliveryRequested: o.deliveryRequested,
        storeId: store.id,
        items: o.items,
        source: 'WEB'
      }
    });
  }

  console.log('Successfully seeded database with products and orders!');
}

main().catch(console.error).finally(() => prisma.$disconnect().then(() => pool.end()));
