const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function clearOrders() {
  try {
    console.log('Counting orders...');
    const countBefore = await prisma.order.count();
    console.log(`Current order count: ${countBefore}`);

    if (countBefore === 0) {
      console.log('No orders found to delete.');
      return;
    }

    console.log('Deleting all orders...');
    const result = await prisma.order.deleteMany({});
    console.log(`Successfully deleted ${result.count} orders.`);

    // Also clean up order embeddings if any exist
    try {
      const embeddingResult = await prisma.embedding.deleteMany({
        where: { entityType: 'ORDER' }
      });
      console.log(`Cleaned up ${embeddingResult.count} order embeddings.`);
    } catch (e) {
      console.log('No embedding table cleanup needed or skipped:', e.message);
    }
  } catch (err) {
    console.error('Error clearing orders:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

clearOrders();
