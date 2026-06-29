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

async function logIncoming(from: string, text: string) {
  try {
    let session = await (prisma as any).whatsAppSession.findUnique({
      where: {
        phoneNumber_storeId: {
          phoneNumber: from,
          storeId: 'global'
        }
      }
    });
    if (!session) {
      session = await (prisma as any).whatsAppSession.create({
        data: {
          phoneNumber: from,
          storeId: 'global',
          receivingPhoneId: 'global',
          step: 'START'
        }
      });
    }
    const messages = Array.isArray(session.messages) ? (session.messages as any[]) : [];
    messages.push({
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });
    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { messages }
    });
  } catch (err) {
    console.error('[logIncoming Error]', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Detect if it's an Evolution API webhook event
    if (body.event && body.instance) {
      return handleEvolutionWebhook(body);
    }

    // 2. Otherwise handle Meta WhatsApp Business webhook event
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from; // Customer's phone number
      
      if (message.type === 'image') {
        const mediaId = message.image.id;
        const mimeType = message.image.mime_type;
        console.log(`[WhatsApp Webhook] Incoming image from ${from}: mediaId=${mediaId}, mimeType=${mimeType}`);
        await logIncoming(from, '[Imagen comprobante de pago]');
        await handleWhatsAppImage(from, mediaId, mimeType);
      } else if (message.type === 'location') {
        const session = await (prisma as any).whatsAppSession.findUnique({
          where: {
            phoneNumber_storeId: {
              phoneNumber: from,
              storeId: 'global'
            }
          },
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
          await logIncoming(from, `[Ubicación] ${addressText}`);
          await handleWhatsAppMessage(from, addressText, 'global');
        } else {
          await waClient.sendText(from, 'Lo siento, no estoy esperando una ubicación en este momento. Si quieres hacer un pedido, escribe "Hola".');
        }
      } else {
        let text = '';

        if (message.type === 'text') {
          text = message.text.body;
        } 
        else if (message.type === 'interactive') {
          const interactive = message.interactive;
          if (interactive.type === 'button_reply') {
            text = interactive.button_reply.id;
          } else if (interactive.type === 'list_reply') {
            text = interactive.list_reply.id;
          } else if (interactive.type === 'nfm_reply') {
            text = `flow_response_${interactive.nfm_reply.response_json}`;
          }
        }

        console.log(`[WhatsApp Webhook] Incoming from ${from}: ${text}`);

        if (text) {
          await logIncoming(from, text);
          await handleWhatsAppMessage(from, text, 'global');
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handleEvolutionWebhook(body: any) {
  try {
    const instanceName = body.instance; // store_storeId
    const data = body.data;
    const key = data?.key;

    if (body.event !== 'messages.upsert' || !key) {
      return NextResponse.json({ status: 'ignored' });
    }

    const fromMe = key.fromMe;
    const remoteJid = key.remoteJid;
    if (!remoteJid) return NextResponse.json({ status: 'ignored' });
    
    const from = remoteJid.split('@')[0];

    const message = data.message;
    if (!message) return NextResponse.json({ status: 'ignored' });

    let text = '';
    const messageType = data.messageType || 'conversation';
    if (messageType === 'conversation') {
      text = message.conversation || '';
    } else if (messageType === 'extendedTextMessage') {
      text = message.extendedTextMessage?.text || '';
    } else if (messageType === 'imageMessage') {
      text = '[Imagen comprobante de pago]';
    } else if (messageType === 'documentMessage') {
      text = `[Documento] ${message.documentMessage?.fileName || ''}`;
    }

    // Resolve store by instance name
    const store = await prisma.store.findUnique({
      where: { whatsappInstanceName: instanceName }
    });

    if (!store) {
      console.warn(`[Evolution Webhook] Store not found for instance: ${instanceName}`);
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get or create session
    let session = await (prisma as any).whatsAppSession.findUnique({
      where: {
        phoneNumber_storeId: {
          phoneNumber: from,
          storeId: store.id
        }
      }
    });

    if (!session) {
      session = await (prisma as any).whatsAppSession.create({
        data: {
          phoneNumber: from,
          storeId: store.id,
          receivingPhoneId: instanceName,
          step: 'START'
        }
      });
    }

    // Ensure receivingPhoneId is updated
    if (session.receivingPhoneId !== instanceName) {
      session = await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { receivingPhoneId: instanceName }
      });
    }

    const messages = Array.isArray(session.messages) ? (session.messages as any[]) : [];
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (fromMe) {
      // Outgoing message sent by merchant phone or our own dashboard.
      // Deduplicate if already saved
      const lastMsg = messages[messages.length - 1];
      const isDuplicate = lastMsg && lastMsg.text === text && lastMsg.sender === 'bot';

      if (!isDuplicate && text) {
        messages.push({
          sender: text.startsWith('[Asesor Humano]:') ? 'bot' : 'bot',
          text,
          time: timeString,
          timestamp: Date.now()
        });
        await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { messages }
        });
      }
    } else {
      // Incoming message from customer
      if (messageType === 'imageMessage') {
        messages.push({
          sender: 'user',
          text: '[Imagen comprobante de pago]',
          time: timeString,
          timestamp: Date.now()
        });
        const updatedSession = await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { messages }
        });

        const mimeType = message.imageMessage?.mimetype || 'image/jpeg';
        const { handleWhatsAppImage } = await import('@/lib/bot/chatbot-logic');
        await handleWhatsAppImage(from, key, mimeType, store.id, instanceName, message);
      } else if (text) {
        messages.push({
          sender: 'user',
          text,
          time: timeString,
          timestamp: Date.now()
        });
        const updatedSession = await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { messages }
        });

        // Trigger bot logic with this session!
        await handleWhatsAppMessage(from, text, updatedSession);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[handleEvolutionWebhook Error]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
