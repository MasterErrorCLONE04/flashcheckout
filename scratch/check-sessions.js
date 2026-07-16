require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const sessions = await prisma.whatsAppSession.findMany({
    where: { storeId: 'cmqv2rvh200002xrsm7idw4ib' }
  });
  console.log('Sessions in database:', JSON.stringify(sessions, null, 2));
}

main().finally(() => prisma.$disconnect());
