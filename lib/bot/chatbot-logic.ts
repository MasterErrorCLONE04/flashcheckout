import { prisma } from '@/lib/prisma';
import { waClient } from '@/lib/whatsapp/cloud-api';
import { parseIntent } from './intent-engine';
import { searchGlobalProducts } from './search-service';
import { mpPreference } from '@/lib/mercadopago';

export async function handleWhatsAppMessage(from: string, text: string) {
  // 1. Obtener o crear sesión
  let session = await (prisma as any).whatsAppSession.findUnique({
    where: { phoneNumber: from },
  });

  if (!session) {
    session = await (prisma as any).whatsAppSession.create({
      data: { phoneNumber: from, step: 'START' },
    });
  }

  const intent = await parseIntent(text);

  // 2. Manejo de estados (Monolito logic)
  switch (session.step) {
    case 'START':
      await waClient.sendText(from, '¡Hola! Bienvenido a *StoreFCheckout*. 🚀\n\n¿Qué necesitas hoy? Puedes pedir algo como "Quiero una pizza de pepperoni" o "Busco un taxi".');
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'IDLE' },
      });
      break;

    case 'IDLE':
      if (intent.intent === 'QUERY' && intent.query) {
        const products = await searchGlobalProducts(intent.query);

        if (products.length === 0) {
          await waClient.sendText(from, 'Lo siento, no encontré productos que coincidan con tu búsqueda. 😕 ¿Quieres intentar con otra cosa?');
        } else if (products.length === 1) {
          const p = products[0];
          await waClient.sendButtons(from, `¡Encontré esto! 🧐\n\n*${p.name}*\nTienda: ${p.storeName}\nPrecio: $${p.price.toLocaleString()}\n\n¿Deseas confirmar este pedido?`, [
            { id: `confirm_${p.id}`, title: '✅ Sí, confirmar' },
            { id: 'cancel', title: '❌ No, buscar otro' },
          ]);
          await (prisma as any).whatsAppSession.update({
            where: { id: session.id },
            data: { step: 'AWAITING_CONFIRMATION', cart: { productId: p.id, storeId: p.storeId } },
          });
        } else {
          // Lista de opciones
          await waClient.sendList(
            from,
            'Opciones encontradas',
            'Encontré varios resultados. Selecciona el que más te guste:',
            'Ver opciones',
            [
              {
                title: 'Resultados',
                rows: products.map(p => ({
                  id: `select_${p.id}`,
                  title: p.name,
                  description: `${p.storeName} - $${p.price.toLocaleString()}`,
                })),
              },
            ]
          );
          await (prisma as any).whatsAppSession.update({
            where: { id: session.id },
            data: { step: 'AWAITING_SELECTION' },
          });
        }
      } else {
        await waClient.sendText(from, 'No logré entender tu pedido. Intenta decir algo como "Quiero una hamburguesa".');
      }
      break;

    case 'AWAITING_SELECTION':
      // El usuario seleccionó de la lista (esto vendrá como un ID de mensaje interactivo en el webhook REAL)
      // Por simplicidad en la lógica, asumimos que si el texto contiene select_...
      if (text.startsWith('select_')) {
        const productId = text.replace('select_', '');
        const p = await prisma.product.findUnique({ where: { id: productId }, include: { store: true } });
        if (p) {
          await waClient.sendButtons(from, `Excelente elección. 🌟\n\n*${p.name}*\nTienda: ${p.store.name}\nPrecio: $${p.price.toLocaleString()}\n\n¿Confirmas tu pedido?`, [
            { id: `confirm_${p.id}`, title: '✅ Confirmar' },
            { id: 'cancel', title: '❌ Cancelar' },
          ]);
          await (prisma as any).whatsAppSession.update({
            where: { id: session.id },
            data: { step: 'AWAITING_CONFIRMATION', cart: { productId: p.id, storeId: p.storeId } },
          });
        }
      }
      break;

    case 'AWAITING_CONFIRMATION':
      if (text.startsWith('confirm_') || intent.intent === 'CONFIRM') {
        const cart = session.cart as any;
        if (cart?.productId) {
          const product = await prisma.product.findUnique({ where: { id: cart.productId }, include: { store: true } });
          if (product) {
            // Crear Orden REAL en el sistema
            const order = await (prisma.order as any).create({
              data: {
                customerName: 'Cliente WhatsApp',
                customerPhone: from,
                customerWhatsAppId: from,
                address: 'Consultar por chat', // Simplificación: el bot luego pedirá esto
                city: 'WhatsApp',
                items: [{ id: product.id, name: product.name, price: product.price, qty: 1 }],
                total: product.price,
                storeId: product.storeId,
                source: 'WHATSAPP',
              },
            });

            // Generar Link de Mercado Pago
            const preference = await mpPreference.create({
              body: {
                items: [{ 
                  id: product.id,
                  title: product.name, 
                  unit_price: product.price, 
                  quantity: 1, 
                  currency_id: 'COP' 
                }],
                external_reference: order.id,
                back_urls: { success: `${process.env.NEXT_PUBLIC_APP_URL}/tienda/${product.store.slug}/exito` },
                auto_return: 'approved',
              },
            });

            await waClient.sendText(from, `¡Perfecto! Todo listo. 💳\n\nHaz clic en el siguiente enlace para realizar tu pago de forma segura:\n\n${preference.init_point}`);
            
            await (prisma as any).whatsAppSession.update({
              where: { id: session.id },
              data: { step: 'IDLE', cart: null },
            });
          }
        }
      } else if (intent.intent === 'CANCEL' || text === 'cancel') {
        await waClient.sendText(from, 'Pedido cancelado. ¿En qué más puedo ayudarte?');
        await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { step: 'IDLE', cart: null },
        });
      }
      break;
  }
}
