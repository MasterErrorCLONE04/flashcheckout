require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const stores = await prisma.store.findMany({
    select: { id: true, name: true, userId: true, whatsappInstanceName: true, whatsappConnected: true }
  });
  console.log('Stores detail:', JSON.stringify(stores, null, 2));
}

main().finally(() => prisma.$disconnect());
