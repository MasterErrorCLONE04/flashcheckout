async function main() {
  const webhookUrl = "http://localhost:3000/api/whatsapp/webhook";
  const payload = {
    event: "messages.upsert",
    instance: "store_cmqv2rvh200002xrsm7idw4ib",
    data: {
      key: {
        remoteJid: "573115076293@s.whatsapp.net",
        fromMe: false,
        id: "MOCK_" + Date.now()
      },
      messageType: "conversation",
      message: {
        conversation: "Hola"
      }
    }
  };

  try {
    console.log('Sending mock message "Hola" to webhook...');
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Response Status:', res.status);
    const data = await res.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
}

main();
