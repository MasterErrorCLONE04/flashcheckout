const { Client } = require('pg');
const fetch = require('node-fetch');

const dbUrl = "postgresql://postgres:iZCib4UWHgYMGBDJ@db.yumvbbhssylfwlypblxl.supabase.co:5432/postgres?connection_limit=1";
const WHATSAPP_ACCESS_TOKEN = "EAAVCL1qK6QYBRV3hy8YoHaNY5EooFsqyqs8FoyIfvlXhLluq7JaR0gLWe7jzYlAaP1FTRhZCuYUriN0eYdNOwdcv982zyxhZCYpSc0GNFnEAobCZAULRq04kdjZCN93YxczDpnmJxJIAkwCFRrJHqwc0jPLbHFCe3vHzxyOHWsDdiGry0hpgnzRkUe3OmgjVbEOwhynra73w7g6O81ShqPsjGzynImhnyYEE1ALnmHB9GZAX8ZCfE3iJUwbacje8QMLJyrV6rUKzUnQzD4P3YDgj8eRmPGwnwziDJ4mtYZD";
const WHATSAPP_PHONE_NUMBER_ID = "1103997416126880";

const sellerWa = "573223232017";
const buyerWa = "573025382862";

const waUrl = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

async function sendText(to, text) {
  const response = await fetch(waUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: { body: text },
    }),
  });
  if (response.ok) {
    console.log(`[WhatsApp Text Success] to ${to}`);
  } else {
    console.error(`[WhatsApp API Error for ${to}]`, await response.json());
  }
}

async function sendDocument(to, documentUrl, filename) {
  const response = await fetch(waUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'document',
      document: {
        link: documentUrl,
        filename: filename
      },
    }),
  });
  if (response.ok) {
    console.log(`[WhatsApp Document Success] to ${to}`);
  } else {
    console.error(`[WhatsApp API Error for ${to}]`, await response.json());
  }
}

async function sendButtons(to, text, buttons) {
  const response = await fetch(waUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    }),
  });
  if (response.ok) {
    console.log(`[WhatsApp Buttons Success] to ${to}`);
  } else {
    console.error(`[WhatsApp Buttons Error for ${to}]`, await response.json());
  }
}


async function run() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log('Fetching store ID for slug: lcdavid...');
  const storeRes = await client.query(`SELECT id FROM "Store" WHERE slug = 'lcdavid' LIMIT 1`);
  if (storeRes.rows.length === 0) {
    console.error('Store not found!');
    await client.end();
    return;
  }
  const storeId = storeRes.rows[0].id;

  const orderId = 'test_' + Date.now().toString().slice(-8);

  const itemsJson = JSON.stringify([
    { productId: 'test-p1', name: 'Zapatillas Pro Max', qty: 2, price: 52500 }
  ]);

  console.log(`Inserting test order ${orderId} into database...`);
  await client.query(
    `INSERT INTO "Order" (id, "customerName", "customerPhone", address, city, items, total, status, "storeId", "paymentStatus", "customerWhatsAppId", source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [orderId, 'Comprador de Prueba', '3025382862', 'Calle 100 #15-30', 'Bogotá', itemsJson, 105000, 'paid', storeId, 'PAID', buyerWa, 'WHATSAPP']
  );

  console.log('Order successfully inserted into Prisma DB.');
  await client.end();

  // Send WhatsApp notification to seller
  await sendText(
    sellerWa,
    `📦 *¡Nuevo pedido recibido!* 🎉\n\nHola, tienes una nueva venta en tu tienda *LCDAVID*:\n\n*Detalles del pedido:*\n• *ID:* #${orderId.slice(-6)}\n• *Cliente:* Comprador de Prueba\n• *Teléfono:* 3025382862\n• *Dirección de Entrega:* Calle 100 #15-30, Bogotá\n• *Total:* $105.000`
  );

  await sendButtons(
    sellerWa,
    `🚚 *¿Te gustaría solicitar nuestro Servicio de Domicilio?*\n\nPodemos enviar a un repartidor oficial de la plataforma a recoger el producto por una pequeña cuota de *$5.000 COP* (se descontará del pago final de la orden).`,
    [
      { id: `delivery_yes_${orderId}`, title: 'SÍ' },
      { id: `delivery_no_${orderId}`, title: 'NO' }
    ]
  );


  // Use the invoice URL. Let's make sure it's accessible.
  // Note: Since this is just a test, if the trycloudflare link isn't running, Meta will fail to download the real PDF.
  // BUT wait, let's use a public PDF URL for this specific test too, or let's use the actual URL and inform the user that their trycloudflare/vercel server must be running.
  // Let's create an invoice URL using the trycloudflare URL from their .env
  const appUrl = "https://flashcheckout.vercel.app";
  const invoiceUrl = `${appUrl}/api/orders/invoice/${orderId}`;
  
  console.log(`Sending real PDF invoice URL to buyer at ${buyerWa}: ${invoiceUrl}`);
  await sendDocument(
    buyerWa,
    invoiceUrl,
    `factura-${orderId.slice(-6).toUpperCase()}.pdf`
  );
}

run().catch(console.error);
