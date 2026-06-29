const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running direct SQL update on production DB...');
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "WhatsAppSession" SET "storeId" = 'global' WHERE "storeId" IS NULL
  `);
  console.log(`Updated ${result} rows.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
