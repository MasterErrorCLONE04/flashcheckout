import { prisma } from '@/lib/prisma';

export async function getDruoAccessToken(): Promise<string> {
  const clientId = process.env.DRUO_CLIENT_ID || '';
  const clientSecret = process.env.DRUO_CLIENT_SECRET || '';
  const apiUrl = process.env.DRUO_API_URL || 'https://api.sandbox.druo.com';

  if (!clientId || !clientSecret) {
    console.warn('[DRUO] Client ID or Secret missing, returning mock token');
    return 'mock_druo_token_123';
  }

  try {
    const response = await fetch(`${apiUrl}/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('[DRUO getDruoAccessToken error]', error);
    return 'mock_druo_token_123'; // fallback for sandbox/testing if it fails
  }
}

export async function createDruoPayment({
  amount,
  orderId,
  payerKey,
  sellerKey,
}: {
  amount: number;
  orderId: string;
  payerKey: string;
  sellerKey: string;
}) {
  const token = await getDruoAccessToken();
  const apiUrl = process.env.DRUO_API_URL || 'https://api.sandbox.druo.com';

  const response = await fetch(`${apiUrl}/v1/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
      currency: 'COP',
      reference: orderId,
      description: `Orden #${orderId.slice(-6).toUpperCase()} en Flashcheckout`,
      payer: {
        type: 'BRE_B_KEY',
        value: payerKey,
        country_code: 'CO',
      },
      destination: {
        type: 'BRE_B_KEY',
        value: sellerKey,
        country_code: 'CO',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[DRUO API Error] Status: ${response.status}, Details: ${errorText}`);
    throw new Error(`Error en API DRUO: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}
