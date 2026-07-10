import { prisma } from '@/lib/prisma';
import { waClient as officialWaClient } from '@/lib/whatsapp/cloud-api';
import { parseIntent } from './intent-engine';
import { searchGlobalProducts } from './search-service';
import { mpPreference } from '@/lib/mercadopago';
import { uploadProofImage } from '@/lib/supabase';

export async function handleWhatsAppMessage(from: string, text: string, sessionOrStoreId: any = 'global') {
  // 1. Obtener o crear sesión usando el índice compuesto
  let session: any;
  if (typeof sessionOrStoreId === 'object' && sessionOrStoreId !== null) {
    session = sessionOrStoreId;
  } else {
    const storeId = sessionOrStoreId || 'global';
    session = await (prisma as any).whatsAppSession.findUnique({
      where: {
        phoneNumber_storeId: {
          phoneNumber: from,
          storeId: storeId
        }
      },
    });

    if (!session) {
      session = await (prisma as any).whatsAppSession.create({
        data: {
          phoneNumber: from,
          storeId: storeId,
          receivingPhoneId: storeId === 'global' ? 'global' : `store_${storeId}`,
          step: 'START'
        },
      });
    }
  }

  // 1.5 Resolver el cliente de envío dinámico (Meta Cloud API o Evolution API)
  const isGlobal = !session.storeId || session.storeId === 'global';
  let client: any = officialWaClient; // Default to official Meta waClient
  let isEvolution = false;
  let store: any = null;

  if (!isGlobal) {
    store = await prisma.store.findUnique({
      where: { id: session.storeId }
    });
    if (store && store.whatsappInstanceName && store.whatsappConnected) {
      isEvolution = true;
      const { evolutionClient } = await import('@/lib/whatsapp/evolution');
      client = {
        sendText: (to: string, msg: string) => evolutionClient.sendText(store.whatsappInstanceName, to, msg),
        sendButtons: (to: string, msg: string, btns: any[]) => evolutionClient.sendButtons(store.whatsappInstanceName, to, msg, btns),
        sendList: (to: string, hdr: string, bdy: string, btnText: string, secs: any[]) => evolutionClient.sendList(store.whatsappInstanceName, to, hdr, bdy, btnText, secs),
        sendImage: (to: string, img: string, cap: string) => evolutionClient.sendImage(store.whatsappInstanceName, to, img, cap),
        sendDocument: (to: string, doc: string, fn: string) => evolutionClient.sendDocument(store.whatsappInstanceName, to, doc, fn),
        sendUrlButton: (to: string, bdy: string, btnText: string, url: string) => evolutionClient.sendUrlButton(store.whatsappInstanceName, to, bdy, btnText, url)
      };
    }
  }

  // Helper to log bot outgoing messages in database
  const logBotOutgoing = async (text: string) => {
    try {
      const currentSession = await (prisma as any).whatsAppSession.findUnique({
        where: { id: session.id }
      });
      if (!currentSession) return;
      const messages = Array.isArray(currentSession.messages) ? (currentSession.messages as any[]) : [];
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messages.push({
        sender: 'bot',
        text,
        time: timeString,
        timestamp: Date.now()
      });

      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { messages }
      });
    } catch (err) {
      console.error('[logBotOutgoing Error]', err);
    }
  };

  // Wrapped client to intercept and log all messages sent by the bot
  const waClient = {
    sendText: async (to: string, msg: string) => {
      const res = await client.sendText(to, msg);
      await logBotOutgoing(msg);
      return res;
    },
    sendButtons: async (to: string, msg: string, btns: any[]) => {
      const res = await client.sendButtons(to, msg, btns);
      await logBotOutgoing(msg);
      return res;
    },
    sendList: async (to: string, hdr: string, bdy: string, btnText: string, secs: any[]) => {
      const res = await client.sendList(to, hdr, bdy, btnText, secs);
      await logBotOutgoing(`${hdr}\n${bdy}`);
      return res;
    },
    sendImage: async (to: string, img: string, cap: string) => {
      const res = await client.sendImage(to, img, cap);
      await logBotOutgoing(cap ? `[Imagen] ${cap}` : '[Imagen]');
      return res;
    },
    sendDocument: async (to: string, doc: string, fn: string) => {
      const res = await client.sendDocument(to, doc, fn);
      await logBotOutgoing(`[Documento] ${fn}`);
      return res;
    },
    sendUrlButton: async (to: string, bdy: string, btnText: string, url: string) => {
      const res = await client.sendUrlButton(to, bdy, btnText, url);
      await logBotOutgoing(bdy);
      return res;
    },
    sendFlow: async (to: string, flowId: string, buttonText: string, flowToken: string, screen: string, data: any, header?: string, body?: string) => {
      if (typeof client.sendFlow === 'function') {
        const res = await client.sendFlow(to, flowId, buttonText, flowToken, screen, data, header, body);
        await logBotOutgoing(body || `[Flujo: ${buttonText}]`);
        return res;
      }
      throw new Error('sendFlow is not supported on this client configuration.');
    }
  };

  const intent = await parseIntent(text);

  // Verificar si la tienda de la sesión está activa
  if (session.storeId && session.storeId !== 'global') {
    const activeStore = await prisma.store.findUnique({
      where: { id: session.storeId }
    });
    if (activeStore && !activeStore.active) {
      const resetStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId;
      session = await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { storeId: resetStoreId, cart: null }
      });
      await waClient.sendText(from, 'Lo siento, esta tienda se encuentra temporalmente inactiva o fuera de servicio. 😕');
      return;
    }
  }

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
    const resetStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId;
    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { step: 'IDLE', storeId: resetStoreId },
    });
    if (text === 'search_now') {
        await waClient.sendText(from, '¡Claro! Dime qué buscas (ej: "Pizza", "Zapatos").');
    } else {
        await handleWhatsAppMessage(from, 'reset_welcome', session); // Disparar bienvenida
    }
    return;
  }
  
  if (text === 'reset_welcome') {
      session.step = 'START'; // Forzar paso START en el switch de abajo
  }

  // Protocolo de Finalización (EXIT)
  if (intent.intent === 'EXIT') {
    await waClient.sendText(from, '¡De nada! Ha sido un placer ayudarte. 😊\n\nSi necesitas algo más en el futuro, solo escribe "Hola". ¡Que tengas un gran día! 👋');
    const exitStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId;
    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { 
        step: 'START', 
        storeId: exitStoreId, 
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
      where: { id: storeId, active: true },
      include: { products: { where: { active: true }, take: 20 } }
    });

    if (store) {
      const flowId = process.env.WHATSAPP_CATALOG_FLOW_ID;
      
      // Intentar enviar Flow solo si el ID está configurado y no es un placeholder obvio
      if (flowId && flowId !== '789456123') {
        const flowData = {
          products: store.products.map(p => ({
            id: p.id,
            title: p.name,
            description: `$${p.price.toLocaleString('es-CO')}`,
            image_url: p.imageUrl ? p.imageUrl.split(',')[0] : 'https://via.placeholder.com/300'
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
            store.systemPrompt || 'Selecciona todos los productos que desees pedir:'
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
      await waClient.sendList(from, store.name, store.systemPrompt || 'Selecciona los productos:', 'Ver Productos', [
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

  // Manejo de SOLICITUD DE DOMICILIO POR PARTE DEL VENDEDOR
  if (text.startsWith('delivery_yes_')) {
    const orderId = text.replace('delivery_yes_', '');
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true }
      });

      if (!order) {
        await waClient.sendText(from, 'Lo siento, no encontramos este pedido. 😕');
        return;
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryRequested: true }
      });

      // 1. Buscar repartidores activos y disponibles
      const drivers = await (prisma as any).driver.findMany({
        where: { active: true, available: true }
      });

      if (drivers.length > 0) {
        // 2. Notificar a cada repartidor vía WhatsApp
        for (const driver of drivers) {
          try {
            await waClient.sendButtons(
              driver.phoneNumber,
              `🚚 *NUEVO DOMICILIO DISPONIBLE* 📦\n\n• *Tienda:* ${order.store.name}\n• *Dirección entrega:* ${order.address}, ${order.city}\n• *Valor envío:* $5.000 COP\n• *Valor pedido:* $${order.total.toLocaleString('es-CO')}\n• *Contacto Tienda:* wa.me/${order.store.whatsapp}\n\n¿Deseas tomar este domicilio?`,
              [
                { id: `accept_delivery_${order.id}`, title: '🏍️ Aceptar Domicilio' }
              ]
            );
          } catch (driverErr) {
            console.error(`Error al notificar al repartidor ${driver.phoneNumber}:`, driverErr);
          }
        }
        await waClient.sendText(from, `¡Excelente! Has solicitado nuestro servicio de domicilio para el pedido *#${orderId.slice(-6).toUpperCase()}*. 🚚\n\nHemos notificado a los repartidores disponibles. Te avisaremos inmediatamente cuando uno de ellos lo acepte.`);
      } else {
        await waClient.sendText(from, `¡Excelente! Has solicitado nuestro servicio de domicilio para el pedido *#${orderId.slice(-6).toUpperCase()}*. 🚚\n\nEn este momento no tenemos repartidores disponibles en la zona. Intentaremos buscar uno en los próximos minutos o te sugerimos gestionar el despacho por tu cuenta.`);
      }
    } catch (err) {
      console.error('[Delivery Yes Error]', err);
    }
    return;
  }

  if (text.startsWith('delivery_no_')) {
    const orderId = text.replace('delivery_no_', '');
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { deliveryRequested: false }
      });
      await waClient.sendText(from, `Entendido. Te encargarás del envío por tu cuenta para el pedido *#${orderId.slice(-6).toUpperCase()}*. No se te descontará nada de la orden.`);
    } catch (err) {
      console.error('[Delivery No Error]', err);
    }
    return;
  }

  // Manejo de ACEPTAR DOMICILIO POR PARTE DEL REPARTIDOR
  if (text.startsWith('accept_delivery_')) {
    const orderId = text.replace('accept_delivery_', '');
    
    try {
      // 1. Verificar si es un repartidor activo
      const driver = await (prisma as any).driver.findUnique({
        where: { phoneNumber: from, active: true }
      });

      if (!driver) {
        await waClient.sendText(from, 'Lo siento, no estás registrado como un repartidor oficial activo. 🚫');
        return;
      }

      // 2. Transacción para asegurar la asignación libre de condiciones de carrera
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { store: true }
        });

        if (!order) {
          throw new Error('ORDER_NOT_FOUND');
        }

        if (order.driverId) {
          return { success: false, reason: 'TAKEN', driverId: order.driverId };
        }

        // Asignar repartidor y cambiar estado de la orden
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            driverId: driver.id,
            status: 'shipped' // Estado "En camino"
          },
          include: { store: true }
        });

        return { success: true, order: updatedOrder };
      });

      if (result.success) {
        const order = result.order!;
        // Confirmar al repartidor
        await waClient.sendText(
          from,
          `¡Confirmado! 🏍️ Se te ha asignado el domicilio del pedido *#${orderId.slice(-6).toUpperCase()}*.\n\n• *Tienda:* ${order.store.name} (wa.me/${order.store.whatsapp})\n• *Cliente:* ${order.customerName}\n• *Dirección:* ${order.address}, ${order.city}\n• *Total pedido:* $${order.total.toLocaleString('es-CO')}\n\nPor favor, dirígete a la tienda a recoger el producto.`
        );

        // Notificar al dueño de la tienda
        if (order.store.whatsapp) {
          await waClient.sendText(
            order.store.whatsapp,
            `🏍️ *Domicilio Asignado:* El repartidor *${driver.name}* (${driver.phoneNumber}) ha aceptado tu solicitud de entrega para el pedido *#${orderId.slice(-6).toUpperCase()}* y va en camino a tu local.`
          );
        }
      } else {
        if (result.reason === 'TAKEN') {
          await waClient.sendText(from, 'Lo siento, este domicilio ya fue tomado por otro repartidor. 🏁');
        }
      }
    } catch (err) {
      console.error('[Accept Delivery Error]', err);
      await waClient.sendText(from, 'Hubo un error al procesar la aceptación. Inténtalo de nuevo.');
    }
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
    // Filter out items that are not objects or lack required fields to avoid NaN/undefined issues
    const items = Object.values(cart.items || {}).filter(
      (item: any) => item && typeof item === 'object' && 'price' in item && 'qty' in item
    ) as any[];

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
      await waClient.sendText(from, `Perfecto, *${session.customerName}*. 📍\n\n¿A qué dirección debemos enviar tu pedido? Puedes escribir tu dirección (Ej: Calle 10 #20-30, Bogotá) o compartir tu ubicación actual de WhatsApp directamente en este chat. 🗺️`);
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
      if (session.storeId && session.storeId !== 'global' && store) {
        const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tienda/${store.slug}?wa=${from}&layout=native`;
        const defaultMsg = `¡Hola! Bienvenido a *${store.name}*. 🏬\n\nHe preparado una experiencia visual increíble para ti. Pulsa el botón de abajo para explorar el catálogo completo:`;
        const welcomeText = store.welcomeMessage || defaultMsg;

        await waClient.sendUrlButton(
          from, 
          welcomeText,
          '📱 Abrir Catálogo Pro',
          storeUrl
        );

        await waClient.sendButtons(from, '¿Prefieres comprar enviando mensajes directamente aquí?', [
          { id: `view_list_${store.id}`, title: '📜 Usar Chat' }
        ]);
      } else {
        await waClient.sendButtons(from, '¡Hola! Bienvenido a *StoreFCheckout*. 🚀\n\n¿Cómo prefieres empezar hoy?', [
          { id: 'view_stores', title: '🏬 Ver tiendas' },
          { id: 'search_now', title: '🔍 Buscar algo' },
        ]);
      }
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
        // AI Chatbot fallback using DeepSeek
        let answeredByAI = false;
        if (session.storeId && session.storeId !== 'global' && store && store.aiActive) {
          try {
            // 1. Fetch store products
            const storeProducts = await prisma.product.findMany({
              where: { storeId: store.id, active: true },
              take: 30
            });
            const productsListText = storeProducts.map(p => `- ${p.name}: $${p.price.toLocaleString('es-CO')}`).join('\n');

            // 2. Format chat history
            const history = Array.isArray(session.messages) ? (session.messages as any[]) : [];
            const chatMessages = history.slice(-10).map(m => ({
              role: (m.sender === 'bot' ? 'assistant' : 'user') as 'system' | 'user' | 'assistant',
              content: m.text
            }));
            
            // Append current message if not present
            if (chatMessages.length === 0 || chatMessages[chatMessages.length - 1].content !== text) {
              chatMessages.push({ role: 'user', content: text });
            }

            // 3. Build prompts
            const storePrompt = store.systemPrompt || `Eres el agente de IA oficial de ${store.name}. Atiende con amabilidad y educación.`;
            const systemPrompt = `${storePrompt}

Catálogo de productos de la tienda:
${productsListText}

Instrucciones clave para interactuar con el CLIENTE en WhatsApp:
- Estás hablando DIRECTAMENTE con el cliente comprador. Sé servicial, educado y enfocado en ventas.
- Si el cliente pregunta por productos o precios, usa el catálogo arriba mencionado.
- Si el cliente desea comprar o ver el catálogo, indícales que presionen el botón de "📱 Abrir Catálogo Pro" o escriban "Ver catálogo" o "Inicio" para listar las tiendas.
- Si el cliente quiere pagar o ver sus artículos seleccionados, indícales que escriban "Ver carrito" para ver su resumen y proceder al pago.
- Mantén las respuestas amigables, cortas y concisas (máximo 2 a 3 oraciones), ideales para leer en pantallas móviles de WhatsApp.
- No uses Markdown complejo. Usa negrita de WhatsApp (*texto*) si es necesario.`;

            // 4. Call OpenRouter (Free Model)
            const { generateOpenRouterCompletion } = await import('@/lib/ai/openrouter');
            const aiReply = await generateOpenRouterCompletion(chatMessages, systemPrompt);

            if (aiReply) {
              await waClient.sendText(from, aiReply);
              answeredByAI = true;
            }
          } catch (aiErr) {
            console.error('Error in chatbot AI response generation:', aiErr);
          }
        }

        if (!answeredByAI) {
          let faqResponse = null;
          if (session.storeId && session.storeId !== 'global') {
            try {
              const faqs = await prisma.faq.findMany({
                where: { storeId: session.storeId }
              });
              const match = faqs.find((f: any) => text.toLowerCase().includes(f.question.toLowerCase()));
              if (match) {
                faqResponse = match.answer;
              }
            } catch (faqErr) {
              console.error('Error fetching FAQs in chatbot fallback:', faqErr);
            }
          }

          if (faqResponse) {
            await waClient.sendText(from, faqResponse);
          } else {
            await waClient.sendText(from, 'No logré entender tu pedido. Puedes decir algo como "Busco Pizza" o escribir "Ver productos" para abrir nuestro catálogo.');
          }
        }
      }
      break;

    case 'AWAITING_STORE_SELECTION':
      if (text.startsWith('store_')) {
        const storeId = text.replace('store_', '');
        const store = await prisma.store.findUnique({ 
          where: { id: storeId, active: true },
          include: { products: { where: { active: true }, take: 5 } }
        });
  
        if (store) {
          console.log(`[Bot Debug] Encontrada tienda: ${store.name} con ${store.products.length} productos.`);
          
          if (store.products.length === 0) {
            await waClient.sendText(from, `Esta tienda aún no tiene productos registrados o activos. 😕\n\nPuedes escribir "Tiendas" para ver otro comercio.`);
          } else {
            // Handoff redirection link if WhatsApp QR connection is active
            if (store.whatsappConnected && store.whatsapp) {
              const waUrl = `https://wa.me/${store.whatsapp}?text=¡Hola!%20Quiero%20hacer%20un%20pedido%20en%20*${encodeURIComponent(store.name)}*`;
              await waClient.sendUrlButton(
                from,
                `¡Excelente elección! Para comprar en *${store.name}*, pulsa el botón de abajo para abrir el chat oficial de la tienda e iniciar tu pedido:`,
                '💬 Chatear con Tienda',
                waUrl
              );
              // Clean up corporate session
              await (prisma as any).whatsAppSession.update({
                where: { id: session.id },
                data: { step: 'START', storeId: 'global' },
              });
            } else {
              // Fallback: stay on global line
              const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tienda/${store.slug}?wa=${from}&layout=native`;
              const defaultMsg = `¡Genial! Estás en *${store.name}*. 🏬\n\nHe preparado una experiencia visual increíble para ti. Pulsa el botón de abajo para explorar el catálogo completo:`;
              const welcomeText = store.welcomeMessage || defaultMsg;

              await waClient.sendUrlButton(
                from, 
                welcomeText,
                '📱 Abrir Catálogo Pro',
                storeUrl
              );

              await waClient.sendButtons(from, '¿Prefieres comprar enviando mensajes directamente aquí?', [
                { id: `view_list_${store.id}`, title: '📜 Usar Chat' }
              ]);

              await (prisma as any).whatsAppSession.update({
                where: { id: session.id },
                data: { step: 'IDLE', storeId: store.id },
              });
            }
          }
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
        // Filter out items that are not objects or lack required fields to avoid NaN/undefined issues
        const items = Object.values(cart.items || {}).filter(
          (item: any) => item && typeof item === 'object' && 'price' in item && 'qty' in item
        ) as any[];
        
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
              const store = await prisma.store.findUnique({ where: { id: storeId } });
              const bankDetails = store?.whatsapp ? `Nequi o Daviplata al celular ${store.whatsapp}` : '[Datos Cuenta]';
              
              let mpPreferenceId: string | null = null;

              // Check if Mercado Pago is active and connected
              if (store && store.mpConnected) {
                const tokenToUse = store.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
                if (tokenToUse) {
                  try {
                    const { MercadoPagoConfig, Preference } = await import('mercadopago');
                    const dynamicMpClient = new MercadoPagoConfig({
                      accessToken: tokenToUse,
                      options: { timeout: 10000 },
                    });
                    const dynamicMpPreference = new Preference(dynamicMpClient);
                    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';

                    const preferenceData: any = {
                      body: {
                        items: items.map(line => ({
                          id: line.productId,
                          title: `${line.name} (x${line.qty})`,
                          quantity: line.qty,
                          unit_price: line.price,
                          currency_id: 'COP',
                        })),
                        external_reference: order.id,
                        back_urls: {
                          success: `${base}/tienda/${store.slug}/exito`,
                          failure: `${base}/tienda/${store.slug}`,
                          pending: `${base}/tienda/${store.slug}`,
                        },
                        metadata: {
                          orderId: order.id,
                          storeId: store.id,
                        },
                      },
                    };

                    if (base.startsWith('https')) {
                      preferenceData.body.notification_url = `${base}/api/webhook/mp`;
                      preferenceData.body.auto_return = 'approved';
                    }

                    const preference = await dynamicMpPreference.create(preferenceData);
                    if (preference.id) {
                      mpPreferenceId = preference.id;
                      
                      // Update order in database
                      await prisma.order.update({
                        where: { id: order.id },
                        data: { mpPreferenceId: preference.id }
                      });
                    }
                  } catch (mpErr) {
                    console.error('[chatbot-logic] Failed to create Mercado Pago preference:', mpErr);
                  }
                }
              }

              // Build Smart Pay URL
              const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';
              const smartPayUrl = `${baseAppUrl}/pay/${order.id}`;

              // Send the link!
              if (store && store.mpConnected && mpPreferenceId) {
                // If Mercado Pago is active, send the Smart Pay Link directly as a Payment Redirection
                await waClient.sendUrlButton(
                  from,
                  `${orderSummary}\n\nHe generado tu orden de cobro de forma segura. Presiona el botón de abajo para pagar en línea desde tu celular o escanear el código QR:`,
                  '💳 Pagar Seguro',
                  smartPayUrl
                );
              } else {
                // If it is a manual bank transfer, we can still send the Smart Pay portal where they can check their items and details!
                await waClient.sendText(
                  from,
                  `${orderSummary}\n\nPor favor, realiza la transferencia a los datos de la tienda:\n• *${bankDetails}*\n\nUna vez realizada la transferencia, envía la foto o captura del comprobante por este chat.`
                );
                
                await waClient.sendUrlButton(
                  from,
                  `También puedes ver el desglose de tu pedido y subir tu captura en nuestro portal de cobros:`,
                  '📋 Ver Pedido',
                  smartPayUrl
                );
              }

              await (prisma as any).whatsAppSession.update({
                where: { id: session.id },
                data: { step: 'AWAITING_CONFIRMATION', cart: null },
              });
            } catch (err) {
               console.error('[Chatbot checkout finalize error]', err);
               await waClient.sendText(from, 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
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

export async function handleWhatsAppImage(
  from: string,
  mediaIdOrKey: any,
  mimeType: string,
  storeId: string = 'global',
  instanceName?: string,
  messagePayload?: any
) {
  // Shadow client
  let waClientInstance: any = officialWaClient;
  if (instanceName && instanceName !== 'global') {
    const { evolutionClient } = await import('@/lib/whatsapp/evolution');
    waClientInstance = {
      sendText: (to: string, msg: string) => evolutionClient.sendText(instanceName, to, msg),
      downloadMedia: async (id: any) => {
        const buffer = await evolutionClient.downloadMedia(instanceName, id, messagePayload);
        return { buffer };
      }
    };
  }
  const waClient = waClientInstance;

  // 1. Obtener sesión del bot usando compound key
  const session = await (prisma as any).whatsAppSession.findUnique({
    where: {
      phoneNumber_storeId: {
        phoneNumber: from,
        storeId: storeId
      }
    },
  });

  if (!session || session.step !== 'AWAITING_CONFIRMATION') {
    await waClient.sendText(from, 'Lo siento, no estoy esperando un comprobante de pago en este momento. Si deseas realizar un pedido, escribe "Ver tiendas".');
    return;
  }

  // 2. Buscar la orden PENDING más reciente para este cliente
  const order = await prisma.order.findFirst({
    where: {
      customerPhone: from,
      storeId: storeId,
      paymentStatus: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!order) {
    await waClient.sendText(from, 'No encontré ningún pedido pendiente de pago para tu número.');
    return;
  }

  try {
    await waClient.sendText(from, 'Procesando tu comprobante de pago... ⏳');

    // 3. Descargar comprobante de WhatsApp
    const { buffer } = await waClient.downloadMedia(mediaIdOrKey);

    // 4. Subir a Supabase Storage
    const ext = mimeType.split('/')[1] || 'png';
    const filename = `proof_${order.id}.${ext}`;
    const proofImageUrl = await uploadProofImage(buffer, filename);

    // 5. Actualizar la orden
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'UPLOADED',
        proofImageUrl,
      },
    });

    // 6. Cambiar estado de la sesión a IDLE
    await (prisma as any).whatsAppSession.update({
      where: { id: session.id },
      data: { step: 'IDLE' },
    });

    await waClient.sendText(
      from,
      `¡Comprobante recibido correctamente! 📄\n\nEl vendedor validará tu transferencia en breve. Te notificaremos por este medio una vez sea confirmada. ¡Muchas gracias!`
    );

  } catch (error) {
    console.error('[handleWhatsAppImage error]', error);
    await waClient.sendText(
      from,
      'Hubo un problema al procesar tu comprobante de pago. Por favor, asegúrate de que sea una imagen válida e intenta nuevamente.'
    );
  }
}

