import { NextResponse } from 'next/server';
import { handleWhatsAppMessage, handleWhatsAppImage } from '@/lib/bot/chatbot-logic';
import { prisma } from '@/lib/prisma';
import { waClient } from '@/lib/whatsapp/cloud-api';

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
      
      if (message.type === 'image') {
        const mediaId = message.image.id;
        const mimeType = message.image.mime_type;
        console.log(`[WhatsApp Webhook] Incoming image from ${from}: mediaId=${mediaId}, mimeType=${mimeType}`);
        await handleWhatsAppImage(from, mediaId, mimeType);
      } else if (message.type === 'location') {
        const session = await (prisma as any).whatsAppSession.findUnique({
          where: { phoneNumber: from },
        });

        if (session && session.step === 'AWAITING_ADDRESS') {
          const location = message.location;
          let addressText = '';
          if (location.address) {
            addressText = `${location.address} (${location.latitude}, ${location.longitude})`;
          } else if (location.name) {
            addressText = `${location.name} (${location.latitude}, ${location.longitude})`;
          } else {
            addressText = `${location.latitude},${location.longitude}`;
          }

          console.log(`[WhatsApp Webhook] Incoming location from ${from}: ${addressText}`);
          await handleWhatsAppMessage(from, addressText);
        } else {
          await waClient.sendText(from, 'Lo siento, no estoy esperando una ubicación en este momento. Si quieres hacer un pedido, escribe "Hola".');
        }
      } else {
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
          } else if (interactive.type === 'nfm_reply') {
            // Capturar respuesta de WhatsApp Flow
            text = `flow_response_${interactive.nfm_reply.response_json}`;
          }
        }

        console.log(`[WhatsApp Webhook] Incoming from ${from}: ${text}`);

        if (text) {
          // Ejecutar lógica del bot
          await handleWhatsAppMessage(from, text);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
