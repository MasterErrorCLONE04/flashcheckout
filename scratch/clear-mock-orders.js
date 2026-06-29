const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing mock orders...');
  const orderRes = await prisma.order.deleteMany({
    where: {
      id: {
        startsWith: 'pay-cmq-'
      }
    }
  });
  console.log(`Deleted ${orderRes.count} mock orders.`);

  console.log('Clearing mock products...');
  const productRes = await prisma.product.deleteMany({
    where: {
      id: {
        startsWith: 'prod-'
      }
    }
  });
  console.log(`Deleted ${productRes.count} mock products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect().then(() => pool.end()));
