const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const stores = await prisma.store.findMany();
  console.log(`Total stores in DB: ${stores.length}`);
  stores.forEach(s => {
    console.log(`- Store: ${s.id} | Slug: ${s.slug} | Name: ${s.name} | User: ${s.userId}`);
  });

  const orders = await prisma.order.findMany();
  console.log(`\nTotal orders in DB: ${orders.length}`);
  orders.forEach(o => {
    console.log(`- Order: ${o.id} | StoreId: ${o.storeId} | Name: ${o.customerName} | Phone: ${o.customerPhone} | Status: ${o.status} | Total: ${o.total}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect().then(() => pool.end()));
