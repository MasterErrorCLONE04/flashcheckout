require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const stores = await prisma.store.findMany({
    select: { id: true, name: true, slug: true }
  });
  console.log('Stores in database:', JSON.stringify(stores, null, 2));
}

main()
  .catch(err => {
    console.error('Error listing stores:', err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
