// c:\Users\Usuario\flashcheckout\scratch\test-webhook.js
const http = require('http');

function sendMockWebhook() {
  const orderId = process.argv[2];
  if (!orderId) {
    console.error('Error: Debes proporcionar un ID de orden real de la base de datos.');
    console.log('Ejemplo: node scratch/test-webhook.js cl_123456');
    process.exit(1);
  }

  const payload = JSON.stringify({
    type: 'payment.succeeded',
    data: {
      reference: orderId,
      amount: 15000,
      currency: 'COP',
      payer: {
        type: 'BRE_B_KEY',
        value: '3001234567',
        country_code: 'CO'
      }
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhooks/druo',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Respuesta del Webhook (Status: ${res.statusCode}):`);
      try {
        console.log(JSON.parse(data));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Error al conectar con el servidor: ${e.message}`);
  });

  req.write(payload);
  req.end();
}

sendMockWebhook();
