const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@db:5432/flashcheckout?schema=public";
const pool = new Pool({ connectionString });

async function main() {
  try {
    console.log('Querying messages for session...');
    const res = await pool.query('SELECT messages FROM "public"."WhatsAppSession" WHERE "phoneNumber" = $1', ['573115076293']);
    if (res.rows.length > 0) {
      console.log(JSON.stringify(res.rows[0].messages, null, 2));
    } else {
      console.log('Session not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
