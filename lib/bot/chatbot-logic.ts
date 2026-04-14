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

  // --- COMANDOS GLOBALES (Funcionan en cualquier estado) ---
  const isViewStores = text === 'view_stores' || 
                       text.toLowerCase().includes('ver tiendas') || 
                       text.toLowerCase().includes('tiendas');

  const isViewCart = text.toLowerCase().includes('ver carrito') || text === 'view_cart';

  if (isViewStores) {
    const stores = await prisma.store.findMany({ where: { active: true }, take: 10 });
    if (stores.length > 0) {
      await waClient.sendList(
        from,
        'Tiendas Cercanas',
        'Selecciona una tienda para ver sus productos:',
        'Ver tiendas',
        [
          {
            title: 'Negocios Disponibles',
            rows: stores.map(s => ({
              id: `store_${s.id}`,
              title: s.name,
              description: s.category || 'Tienda asociada'
            })),
          },
        ]
      );
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'AWAITING_STORE_SELECTION' },
      });
      return;
    }
  }

  if (text.toLowerCase().includes('inicio') || text.toLowerCase().includes('hola') || text === 'search_now') {
    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { step: 'IDLE', storeId: null },
    });
    if (text === 'search_now') {
        await waClient.sendText(from, '¡Claro! Dime qué buscas (ej: "Pizza", "Zapatos").');
    } else {
        await handleWhatsAppMessage(from, 'reset_welcome'); // Disparar bienvenida
    }
    return;
  }
  
  if (text === 'reset_welcome') {
      session.step = 'START'; // Forzar paso START en el switch de abajo
  }

  // Protocolo de Finalización (EXIT)
  if (intent.intent === 'EXIT') {
    await waClient.sendText(from, '¡De nada! Ha sido un placer ayudarte. 😊\n\nSi necesitas algo más en el futuro, solo escribe "Hola". ¡Que tengas un gran día! 👋');
    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { 
        step: 'START', 
        storeId: null, 
        cart: null 
      },
    });
    return;
  }

  // --- MODO JELOU PRO: MANEJO DE RESPUESTAS DE FLOWS ---
  if (text.startsWith('flow_response_')) {
    const jsonStr = text.replace('flow_response_', '');
    try {
      const response = JSON.parse(jsonStr);
      // Estructura esperada del Flow de Catálogo: { selections: ["prod_1", "prod_2"] }
      // Nota: Para cantidades más complejas, el Flow devolvería un array de objetos.
      if (response.selections && Array.isArray(response.selections)) {
        let currentCart = (session.cart as any) || { items: {} };
        if (!currentCart.items) currentCart.items = {};

        for (const prodId of response.selections) {
          const product = await prisma.product.findUnique({ where: { id: prodId } });
          if (product) {
            currentCart.items[product.id] = {
              id: product.id,
              name: product.name,
              price: product.price,
              qty: (currentCart.items[product.id]?.qty || 0) + 1 // Por ahora asumo +1 si no hay stepper
            };
          }
        }

        await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { cart: currentCart, step: 'IDLE' },
        });

        // Trigger summary
        await handleWhatsAppMessage(from, 'view_cart_summary');
      }
    } catch (e) {
      console.error('[Flow Response Error]', e);
    }
    return;
  }

  // Manejo de SELECCIÓN DE TIENDA (Nativo 100% estilo Jelou)
  if (text.startsWith('view_list_')) {
    const storeId = text.replace('view_list_', '');
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { products: { where: { active: true }, take: 20 } }
    });

    if (store) {
      const flowId = process.env.WHATSAPP_CATALOG_FLOW_ID;
      
      // Intentar enviar Flow solo si el ID está configurado y no es un placeholder obvio
      if (flowId && flowId !== '789456123') {
        const flowData = {
          products: store.products.map(p => ({
            id: p.id,
            name: p.name,
            price: `$${p.price.toLocaleString('es-CO')}`,
            image_url: p.imageUrl || 'https://via.placeholder.com/300'
          }))
        };

        try {
          await waClient.sendFlow(
            from,
            flowId,
            'Abrir Menú Visual 🎨',
            `flow_catalog_${store.id}`,
            'CATALOG_SCREEN',
            flowData,
            store.name,
            'Selecciona todos los productos que desees pedir:'
          );
          
          await (prisma as any).whatsAppSession.update({
            where: { id: session.id },
            data: { step: 'IDLE', storeId: store.id },
          });
          return;
        } catch (err) {
          console.warn('[WhatsApp Flow] Failed to send, falling back to List:', err);
        }
      }

      // Fallback a lista de texto (Chat Menu)
      await waClient.sendText(from, 'He preparado el menú aquí abajo para ti:');
      await waClient.sendList(from, store.name, 'Selecciona los productos:', 'Ver Productos', [
        {
          title: 'Productos Disponibles',
          rows: store.products.map(p => ({
            id: `select_${p.id}`,
            title: p.name,
            description: `$${p.price.toLocaleString()}`
          }))
        }
      ]);

      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'IDLE', storeId: store.id },
      });
    }
    return;
  }

  // Manejo de CLICK en CATÁLOGO PRO
  if (text.startsWith('cta_link_')) {
    await waClient.sendText(from, '¡Excelente elección! 📱\n\nHaz clic en el enlace de arriba ☝️ para abrir el catálogo visual y gestionar tu carrito de forma más rápida.');
    return;
  }

  // Manejo de CONFIRMACIÓN DE PAGO (Desde el Sync Architecture)
  if (text.startsWith('confirm_pay_')) {
    const orderId = text.replace('confirm_pay_', '');
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order) {
       await waClient.sendText(from, `¡Excelente! He recibido tu confirmación para el pedido *#${orderId.slice(-5)}*. 💳\n\nEn breve te contactará un asesor para finalizar el despacho.`);
    }
    return;
  }

  // Manejo de CANCELACIÓN DE PEDIDO
  if (text.startsWith('cancel_order_')) {
    const orderId = text.replace('cancel_order_', '');
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED' }
    });
    await waClient.sendText(from, 'Entendido. He cancelado el pedido. 🗑️\n\nSi necesitas algo más, solo dime.');
    return;
  }

  // Manejo de SELECCIÓN de producto (Global)
  if (text.startsWith('select_')) {
    const productId = text.replace('select_', '');
    const p = await prisma.product.findUnique({ 
      where: { id: productId, active: true }, 
    });

    if (p) {
      // Preguntar CANTIDAD
      await waClient.sendList(
        from,
        'Selecciona Cantidad',
        `¿Cuántas unidades de *${p.name}* deseas añadir al carrito?`,
        'Elegir cantidad',
        [
          {
            title: 'Cantidades',
            rows: [1, 2, 3, 4, 5].map(n => ({
              id: `qty_${p.id}_${n}`,
              title: `${n} unidad${n > 1 ? 'es' : ''}`,
            })),
          },
        ]
      );
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'AWAITING_QUANTITY' },
      });
    } else {
      await waClient.sendText(from, 'Lo siento, este producto ya no está disponible. 😕');
    }
    return;
  }

  // Manejo de ASIGNACIÓN DE CANTIDAD (Global)
  if (text.startsWith('qty_')) {
    const parts = text.split('_'); // qty_ID_NUM
    const productId = parts[1];
    const qty = parseInt(parts[2]);
    const p = await prisma.product.findUnique({ where: { id: productId } });

    if (p) {
      let currentCart = (session.cart as any) || { items: {} };
      if (!currentCart.items) currentCart.items = {};
      
      currentCart.items[p.id] = {
        id: p.id,
        name: p.name,
        price: p.price,
        qty: (currentCart.items[p.id]?.qty || 0) + qty
      };

      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { cart: currentCart, step: 'IDLE' },
      });

      // MODO JELOU: Trigger Summary centralizado
      return await handleWhatsAppMessage(from, 'view_cart_summary');
    }
    return;
  }

  // Manejo de VER CARRITO
  // Manejo de RESUMEN DE CARRITO CENTRALIZADO (Modo Jelou Pro)
  if (text === 'view_cart_summary' || isViewCart) {
    const cart = (session.cart as any) || { items: {} };
    const items = Object.values(cart.items || {}) as any[];

    if (items.length === 0) {
      await waClient.sendText(from, 'Tu carrito está vacío. 🛒\n\nPuedes buscar productos o "Ver tiendas" para empezar.');
      return;
    }

    let summary = '*TU CARRITO ACTUAL:* 🛒\n\n';
    let total = 0;
    items.forEach(item => {
      const subtotal = item.price * item.qty;
      summary += `• ${item.name} x${item.qty}: *$${subtotal.toLocaleString()}*\n`;
      total += subtotal;
    });
    summary += `\n*TOTAL A PAGAR: $${total.toLocaleString('es-CO')}*`;

    await waClient.sendButtons(from, summary, [
      { id: 'confirm_checkout', title: '💳 Finalizar Pedido' },
      { id: 'view_stores', title: '🏬 Añadir más' },
      { id: 'clear_cart', title: '🗑️ Vaciar Carrito' }
    ]);
    return;
  }

  // --- MODO JELOU: FLUJO DE CHECKOUT CONVERSACIONAL ---
  if (text === 'confirm_checkout') {
    if (!session.customerName) {
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'AWAITING_NAME' },
      });
      await waClient.sendText(from, '¡Excelente elección! 🛍️\n\nPara agilizar tu despacho, ¿a nombre de quién anotamos el pedido? 👤');
      return;
    }
    
    if (!session.address) {
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'AWAITING_ADDRESS' },
      });
      await waClient.sendText(from, `Perfecto, *${session.customerName}*. 📍\n\n¿A qué dirección debemos enviar tu pedido? (Ej: Calle 10 #20-30, Bogotá)`);
      return;
    }

    // Si tiene todo, saltamos a la confirmación final
    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { step: 'AWAITING_CONFIRMATION' },
    });
    // Forzamos el disparo de la confirmación
    await handleWhatsAppMessage(from, 'final_summary');
    return;
  }

  if (text === 'clear_cart') {
      await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { cart: null }
      });
      await waClient.sendText(from, 'Carrito vaciado. 🗑️ ¿En qué puedo ayudarte?');
      return;
  }
  // ---------------------------------------------------------

  switch (session.step) {
    case 'START':
      await waClient.sendButtons(from, '¡Hola! Bienvenido a *StoreFCheckout*. 🚀\n\n¿Cómo prefieres empezar hoy?', [
        { id: 'view_stores', title: '🏬 Ver tiendas' },
        { id: 'search_now', title: '🔍 Buscar algo' },
      ]);
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { step: 'IDLE' },
      });
      break;

    case 'IDLE':
      // El resto de la búsqueda se mantiene igual
      if (intent.intent === 'QUERY' && intent.query) {
        // Si hay una tienda seleccionada, buscamos solo ahí
        const products = await searchGlobalProducts(intent.query, session.storeId);

        if (products.length === 0) {
          const storeMsg = session.storeId ? ' en esta tienda' : '';
          await waClient.sendText(from, `Lo siento, no encontré "${intent.query}"${storeMsg}. 😕 ¿Quieres intentar con otra cosa?`);
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
          await waClient.sendList(
            from,
            'Opciones encontradas',
            'Encontré estos resultados:',
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
        await waClient.sendText(from, 'No logré entender tu pedido. Puedes decir algo como "Busco Pizza" o escribir "Cambiar tienda" para elegir otro comercio.');
      }
      break;

    case 'AWAITING_STORE_SELECTION':
      if (text.startsWith('store_')) {
        const storeId = text.replace('store_', '');
        const store = await prisma.store.findUnique({ 
          where: { id: storeId },
          include: { products: { where: { active: true }, take: 5 } }
        });
  
        if (store) {
          console.log(`[Bot Debug] Encontrada tienda: ${store.name} con ${store.products.length} productos.`);
          
          if (store.products.length === 0) {
            await waClient.sendText(from, `Esta tienda aún no tiene productos registrados o activos. 😕\n\nPuedes escribir "Tiendas" para ver otro comercio.`);
          } else {
            const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tienda/${store.slug}?wa=${from}&layout=native`;

            await waClient.sendUrlButton(
              from, 
              `¡Genial! Estás en *${store.name}*. 🏬\n\nHe preparado una experiencia visual increíble para ti. Pulsa el botón de abajo para explorar el catálogo completo:`,
              '📱 Abrir Catálogo Pro',
              storeUrl
            );

            await waClient.sendButtons(from, '¿Prefieres comprar enviando mensajes directamente aquí?', [
              { id: `view_list_${store.id}`, title: '📜 Usar Chat' }
            ]);
          }

          await (prisma as any).whatsAppSession.update({
            where: { id: session.id },
            data: { step: 'IDLE', storeId: store.id },
          });
        }
      } else {
        // Si el usuario escribe algo en lugar de seleccionar, volvemos a IDLE
        await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { step: 'IDLE' },
        });
        await handleWhatsAppMessage(from, text);
      }
      break;

    case 'AWAITING_SELECTION':
      // Ahora manejado globalmente
      break;

    case 'AWAITING_NAME':
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { customerName: text, step: 'IDLE' },
      });
      // Re-disparar el flujo de checkout
      await handleWhatsAppMessage(from, 'confirm_checkout');
      break;

    case 'AWAITING_ADDRESS':
      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { address: text, step: 'IDLE' },
      });
      // Re-disparar el flujo de checkout
      await handleWhatsAppMessage(from, 'confirm_checkout');
      break;

    case 'AWAITING_CONFIRMATION':
      if (text === 'final_summary' || text === 'confirm_checkout' || intent.intent === 'CONFIRM') {
        const cart = (session.cart as any) || { items: {} };
        const items = Object.values(cart.items || {}) as any[];
        
        if (items.length > 0) {
            const storeId = session.storeId || (items[0] as any).storeId;
            const total = items.reduce((s, i) => s + (i.price * i.qty), 0);
            
            // MODO JELOU: Resumen de Pedido Nativo
            let orderSummary = `*REVISIÓN DE TU PEDIDO* 📋\n\n`;
            orderSummary += `👤 *Cliente:* ${session.customerName}\n`;
            orderSummary += `📍 *Dirección:* ${session.address}\n\n`;
            orderSummary += `*Artículos:*\n`;
            items.forEach(i => {
              orderSummary += `- ${i.name} x${i.qty} ($${(i.price * i.qty).toLocaleString()})\n`;
            });
            orderSummary += `\n*TOTAL A PAGAR: $${total.toLocaleString('es-CO')}*`;

            const order = await (prisma.order as any).create({
              data: {
                customerName: session.customerName || 'Cliente WhatsApp',
                customerPhone: from,
                customerWhatsAppId: from,
                address: session.address || 'WhatsApp',
                city: 'Colombia',
                items: items,
                total: total,
                storeId: storeId,
                source: 'WHATSAPP',
              },
            });

            try {
              const preference = await mpPreference.create({
                body: {
                  items: items.map(i => ({ 
                    id: i.id,
                    title: i.name, 
                    unit_price: i.price, 
                    quantity: i.qty, 
                    currency_id: 'COP'
                  })),
                  external_reference: order.id,
                  auto_return: 'approved',
                  back_urls: { 
                    success: `${process.env.NEXT_PUBLIC_APP_URL}/exito`,
                    failure: `${process.env.NEXT_PUBLIC_APP_URL}/error`,
                    pending: `${process.env.NEXT_PUBLIC_APP_URL}/error`,
                  },
                },
              });

              await waClient.sendUrlButton(
                from, 
                `${orderSummary}\n\nHaz clic abajo para realizar tu pago seguro:`,
                '💳 Pagar con Tarjeta',
                preference.init_point!
              );
              
              await (prisma as any).whatsAppSession.update({
                where: { id: session.id },
                data: { step: 'IDLE', cart: null },
              });
            } catch (err) {
               await waClient.sendText(from, 'Hubo un error al procesar tu pago. Inténtalo de nuevo.');
            }
        }
      } else if (intent.intent === 'CANCEL' || text === 'cancel') {
        await waClient.sendText(from, 'Pedido cancelado. Carrito mantenido.');
        await (prisma as any).whatsAppSession.update({
          where: { id: session.id },
          data: { step: 'IDLE' },
        });
      }
      break;
  }
}
