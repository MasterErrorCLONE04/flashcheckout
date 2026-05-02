const { Pool } = require('pg');

const connectionString = "postgresql://postgres:iZCib4UWHgYMGBDJ@db.yumvbbhssylfwlypblxl.supabase.co:5432/postgres?connection_limit=1";
const pool = new Pool({ connectionString });

async function main() {
  try {
    const res = await pool.query(`
      INSERT INTO "public"."Store" ("id", "slug", "name", "whatsapp", "userId", "active", "createdAt", "updatedAt", "category")
      VALUES ('test-store-id', 'test-store', 'Mi Tienda Test', '573025382862', 'user_test', true, NOW(), NOW(), 'General')
      ON CONFLICT ("slug") DO NOTHING;
    `);
    console.log('Test store created!', res.rowCount);

    const res2 = await pool.query(`
      INSERT INTO "public"."Product" ("id", "name", "price", "stock", "imageUrl", "active", "storeId", "createdAt", "category")
      VALUES ('test-prod-1', 'Producto Test 1', 10000, 10, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', true, 'test-store-id', NOW(), 'General')
      ON CONFLICT ("id") DO NOTHING;
    `);
    console.log('Test product created!', res2.rowCount);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

main();
