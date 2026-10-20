import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { waClient } from '@/lib/whatsapp/cloud-api';
import crypto from 'crypto';

function verifyDruoSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const calculated = hmac.update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signature));
  } catch (err) {
    console.error('[DRUO Signature Verification Error]', err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-druo-signature');
    const webhookSecret = process.env.DRUO_WEBHOOK_SECRET;

    // 1. Validar firma del webhook en producción si el secreto está configurado
    if (webhookSecret) {
      if (!verifyDruoSignature(rawBody, signatureHeader, webhookSecret)) {
        console.warn('[DRUO Webhook] Signature verification failed');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    } else {
      console.warn('[DRUO Webhook] DRUO_WEBHOOK_SECRET is not configured. Skipping signature check.');
    }

    const event = JSON.parse(rawBody);
    console.log('[DRUO Webhook Received]', JSON.stringify(event, null, 2));

    if (event.type === 'payment.succeeded' || event.type === 'payment.completed') {
      const orderId = event.data?.reference;
      if (!orderId) {
        return NextResponse.json({ error: 'Missing reference/orderId' }, { status: 400 });
      }

      // 2. Buscar el pedido
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true }
      });

      if (!order) {
        console.warn(`[DRUO Webhook] Order with ID ${orderId} not found`);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Idempotencia: Si el pedido ya está pagado (PAID), responder de inmediato sin duplicar
      if (order.paymentStatus === 'PAID') {
        console.log(`[DRUO Webhook] Order ${orderId} has already been processed as PAID`);
        return NextResponse.json({ received: true, message: 'Order already processed' }, { status: 200 });
      }

      // 3. Actualizar el pedido en base de datos
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'processing' // Cambiar estado del pedido
        }
      });

      // 4. Notificar al comprador vía WhatsApp
      const recipientPhone = order.customerPhone || order.customerWhatsAppId;
      if (recipientPhone) {
        try {
          // Resolver cliente de envío de la tienda (Meta o Evolution API)
          let storeClient = waClient;
          if (order.store?.whatsappInstanceName && order.store?.whatsappConnected) {
            const { evolutionClient } = await import('@/lib/whatsapp/evolution');
            storeClient = {
              sendText: (to: string, msg: string) => evolutionClient.sendText(order.store.whatsappInstanceName!, to, msg),
              sendButtons: (to: string, msg: string, btns: any[]) => evolutionClient.sendButtons(order.store.whatsappInstanceName!, to, msg, btns)
            } as any;
          }

          await storeClient.sendText(
            recipientPhone,
            `🎉 *¡Pago Confirmado con Éxito!*\n\n` +
            `Hemos recibido correctamente tu pago de *$${order.total.toLocaleString('es-CO')} COP* para la orden *#${orderId.slice(-6).toUpperCase()}*.\n\n` +
            `El vendedor ya está preparando tu despacho a:\n📍 *${order.address}*\n\n¡Muchas gracias por tu compra!`
          );

          // Enviar factura PDF si está disponible
          const { sendInvoiceToWhatsApp } = await import('@/lib/whatsapp/send-invoice');
          await sendInvoiceToWhatsApp(orderId).catch(err => console.error('[DRUO Webhook Invoice Error]', err));

          console.log(`[DRUO Webhook] Notified customer ${recipientPhone} for order ${orderId}`);
        } catch (waErr) {
          console.error('[DRUO Webhook] Error sending WhatsApp notification:', waErr);
        }
      }

      // 5. Notificar al vendedor con opción de solicitar repartidor
      if (order.store?.whatsapp) {
        try {
          let storeClient = waClient;
          if (order.store?.whatsappInstanceName && order.store?.whatsappConnected) {
            const { evolutionClient } = await import('@/lib/whatsapp/evolution');
            storeClient = {
              sendText: (to: string, msg: string) => evolutionClient.sendText(order.store.whatsappInstanceName!, to, msg),
              sendButtons: (to: string, msg: string, btns: any[]) => evolutionClient.sendButtons(order.store.whatsappInstanceName!, to, msg, btns)
            } as any;
          }

          const merchantMsg = 
            `💰 *¡Nuevo Pago por Bre-B Confirmado!* 🚀\n\n` +
            `• *Pedido:* #${order.id.slice(-6).toUpperCase()}\n` +
            `• *Cliente:* ${order.customerName} (${recipientPhone || 'N/A'})\n` +
            `• *Dirección:* ${order.address}\n` +
            `• *Total cobrado:* $${order.total.toLocaleString('es-CO')} COP\n\n` +
            `¿Deseas solicitar un repartidor de la red para despachar este pedido?`;

          if (typeof storeClient.sendButtons === 'function') {
            await storeClient.sendButtons(order.store.whatsapp, merchantMsg, [
              { id: `delivery_yes_${order.id}`, title: '🏍️ Solicitar Domicilio' },
              { id: `delivery_no_${order.id}`, title: '📦 Enviar por mi cuenta' }
            ]);
          } else {
            await storeClient.sendText(order.store.whatsapp, merchantMsg);
          }
        } catch (storeWaErr) {
          console.error('[DRUO Webhook] Error notifying merchant:', storeWaErr);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing DRUO Webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
