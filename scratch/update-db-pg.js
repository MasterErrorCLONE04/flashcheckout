const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  console.log('Running SQL update via PG on database...');
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE "WhatsAppSession" SET "storeId" = 'global' WHERE "storeId" IS NULL;
    `);
    console.log(`Success: updated ${res.rowCount} rows.`);
  } finally {
    client.release();
  }
}

main()
  .catch(console.error)
  .finally(() => pool.end());
