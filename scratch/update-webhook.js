const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@db:5432/flashcheckout?schema=public";
const pool = new Pool({ connectionString });

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://host.docker.internal:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "45d55ad587d55fbc";
const WHATSAPP_WEBHOOK_URL = process.env.WHATSAPP_WEBHOOK_URL || "http://host.docker.internal:3000/api/whatsapp/webhook";

async function main() {
  try {
    console.log('Fetching active store with WhatsApp connected...');
    const storeRes = await pool.query('SELECT id, name, "whatsappInstanceName" FROM "public"."Store" WHERE "whatsappConnected" = true');
    
    if (storeRes.rows.length === 0) {
      console.log('No active store with connected WhatsApp found.');
      return;
    }

    const store = storeRes.rows[0];
    const instanceName = store.whatsappInstanceName;
    console.log(`Found store: ${store.name} (Instance: ${instanceName})`);

    const url = `${EVOLUTION_API_URL}/webhook/set/${instanceName}`;
    console.log(`Calling Evolution API to set webhook at: ${url}`);
    console.log(`Setting webhook URL to: ${WHATSAPP_WEBHOOK_URL}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        webhook: {
          enabled: true,
          url: WHATSAPP_WEBHOOK_URL,
          headers: {
            'apikey': EVOLUTION_API_KEY
          },
          byEvents: false,
          events: ['MESSAGES_UPSERT']
        }
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Webhook updated successfully:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error updating webhook:', error);
  } finally {
    await pool.end();
  }
}

main();
