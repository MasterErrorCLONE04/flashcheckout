import { NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/bot/chatbot-logic';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'flashcheckout_secret';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified successfully.');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Estructura de Meta: entry -> changes -> value -> messages
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from; // Número de teléfono que envió el mensaje
      let text = '';

      // Podría ser un mensaje de texto simple
      if (message.type === 'text') {
        text = message.text.body;
      } 
      // O una respuesta interactiva (Botón/Lista)
      else if (message.type === 'interactive') {
        const interactive = message.interactive;
        if (interactive.type === 'button_reply') {
          text = interactive.button_reply.id;
        } else if (interactive.type === 'list_reply') {
          text = interactive.list_reply.id;
        }
      }

      console.log(`[WhatsApp Webhook] Incoming from ${from}: ${text}`);

      if (text) {
        // Ejecutar lógica del bot
        await handleWhatsAppMessage(from, text);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
