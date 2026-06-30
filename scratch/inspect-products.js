const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@db:5432/flashcheckout?schema=public";
const pool = new Pool({ connectionString });

async function main() {
  try {
    console.log('Querying products for Tienda webs...');
    const res = await pool.query('SELECT id, name, price, stock, options, active FROM "public"."Product" WHERE "storeId" = $1', ['cmqv2rvh200002xrsm7idw4ib']);
    console.log(`Found ${res.rows.length} product(s):`);
    res.rows.forEach(p => {
      console.log(`\n- ID: ${p.id}`);
      console.log(`  Name: ${p.name}`);
      console.log(`  Price: ${p.price}`);
      console.log(`  Stock: ${p.stock}`);
      console.log(`  Active: ${p.active}`);
      console.log(`  Options (Type: ${typeof p.options}):`, p.options);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
