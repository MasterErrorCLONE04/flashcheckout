const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@db:5432/flashcheckout?schema=public";
const pool = new Pool({ connectionString });

async function main() {
  try {
    console.log('Querying WhatsApp sessions...');
    const sessionRes = await pool.query('SELECT * FROM "public"."WhatsAppSession"');
    console.log(`Found ${sessionRes.rows.length} session(s):`);
    sessionRes.rows.forEach(s => {
      console.log(`\n- ID: ${s.id}`);
      console.log(`  Phone: ${s.phoneNumber}`);
      console.log(`  Store ID: ${s.storeId}`);
      console.log(`  Step: ${s.step}`);
      console.log(`  Receiving Phone ID: ${s.receivingPhoneId}`);
      console.log(`  Messages Count: ${Array.isArray(s.messages) ? s.messages.length : 0}`);
      if (Array.isArray(s.messages)) {
        console.log('  Last 3 messages:');
        s.messages.slice(-3).forEach(m => console.log(`    [${m.sender}]: ${m.text}`));
      }
    });

    console.log('\nChecking all stores in DB:');
    const storeRes = await pool.query('SELECT id, slug, name, whatsapp, "whatsappConnected", "whatsappInstanceName", "aiActive" FROM "public"."Store"');
    console.log(storeRes.rows);

  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    await pool.end();
  }
}

main();
