import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { waClient as officialWaClient } from '@/lib/whatsapp/cloud-api';
import {
  buildCartState,
  cartStateToLines,
  emptyCartState,
  normalizeChatMessages,
  type CartLine,
  type CartState,
  type WhatsAppChatMessage,
} from '@/lib/whatsapp/session-state';
import { parseIntent } from './intent-engine';
import { searchGlobalProducts } from './search-service';
import { mpPreference } from '@/lib/mercadopago';
import { uploadProofImage } from '@/lib/supabase';
import { buildBrebEmvcoPayload, DEFAULT_BREB_EMVCO_GUI, type BrebKeyType } from '@/lib/payments/breb/emvco';
import { buildBrebPaymentReference } from '@/lib/payments/breb/references';
import QRCode from 'qrcode';

type SessionRecord = NonNullable<Awaited<ReturnType<typeof prisma.whatsAppSession.findUnique>>>;
type StoreRecord = NonNullable<Awaited<ReturnType<typeof prisma.store.findUnique>>>;
type BotClient = {
  sendText: (to: string, msg: string) => Promise<unknown>;
  sendButtons: (to: string, msg: string, btns: { id: string; title: string }[]) => Promise<unknown>;
  sendList: (to: string, hdr: string, bdy: string, btnText: string, secs: { title: string; rows: { id: string; title: string; description?: string }[] }[]) => Promise<unknown>;
  sendImage: (to: string, img: string, cap: string) => Promise<unknown>;
  sendDocument: (to: string, doc: string, fn: string) => Promise<unknown>;
  sendUrlButton: (to: string, bdy: string, btnText: string, url: string) => Promise<unknown>;
  sendFlow?: (to: string, flowId: string, buttonText: string, flowToken: string, screen: string, data: Record<string, unknown>, header?: string, body?: string) => Promise<unknown>;
  sendLocationRequest?: (to: string, msg: string) => Promise<unknown>;
};

type ChatMessage = WhatsAppChatMessage
type CartItem = CartLine

function toChatMessages(value: unknown): ChatMessage[] {
  return normalizeChatMessages(value);
}

type DownloadableWhatsAppClient = {
  sendText: (to: string, msg: string) => Promise<unknown>
  downloadMedia: (id: string | Record<string, unknown>) => Promise<{ buffer: Buffer }>
}

function extractMediaId(mediaIdOrKey: string | Record<string, unknown>): string {
  if (typeof mediaIdOrKey === 'string') {
    return mediaIdOrKey
  }

  const candidate = mediaIdOrKey.id
  return typeof candidate === 'string' ? candidate : ''
}

function createDownloadableClient(
  instanceName?: string,
  messagePayload?: Record<string, unknown>
): DownloadableWhatsAppClient {
  if (instanceName && instanceName !== 'global') {
    return {
      sendText: async (to: string, msg: string) => {
        const { evolutionClient } = await import('@/lib/whatsapp/evolution')
        return evolutionClient.sendText(instanceName, to, msg)
      },
      downloadMedia: async (id: string | Record<string, unknown>) => {
        const { evolutionClient } = await import('@/lib/whatsapp/evolution')
        const buffer = await evolutionClient.downloadMedia(
          instanceName,
          typeof id === 'string' ? { id } : id,
          messagePayload || {}
        )
        return { buffer }
      },
    }
  }

  return {
    sendText: (to: string, msg: string) => officialWaClient.sendText(to, msg),
    downloadMedia: async (id: string | Record<string, unknown>) => {
      const mediaId = extractMediaId(id)
      if (!mediaId) {
        throw new Error('Media id missing for WhatsApp download')
      }
      return officialWaClient.downloadMedia(mediaId)
    },
  }
}

async function getCartItemsForSession(session: SessionRecord): Promise<CartItem[]> {
  const items = cartStateToLines(session.cart);

  if (items.length > 0) {
    return items;
  }

  if (session.cart && typeof session.cart === 'object' && !Array.isArray(session.cart)) {
    const legacyCart = session.cart as { productId?: string; storeId?: string }
    if (typeof legacyCart.productId === 'string') {
      const product = await prisma.product.findUnique({
        where: { id: legacyCart.productId },
      })

      if (product) {
        return [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            storeId: legacyCart.storeId || product.storeId,
          },
        ]
      }
    }
  }

  return []
}

async function findWhatsAppSession(phoneNumber: string, storeId: string): Promise<SessionRecord | null> {
  return prisma.whatsAppSession.findUnique({
    where: {
      phoneNumber_storeId: {
        phoneNumber,
        storeId,
      },
    },
  });
}

async function createWhatsAppSession(phoneNumber: string, storeId: string, receivingPhoneId: string): Promise<SessionRecord> {
  return prisma.whatsAppSession.create({
    data: {
      phoneNumber,
      storeId,
      receivingPhoneId,
      step: 'START',
    },
  });
}

async function ensureWhatsAppSession(phoneNumber: string, storeId: string, receivingPhoneId: string): Promise<SessionRecord> {
  return (await findWhatsAppSession(phoneNumber, storeId)) ?? createWhatsAppSession(phoneNumber, storeId, receivingPhoneId);
}

async function updateWhatsAppSession(id: string, data: Prisma.WhatsAppSessionUpdateInput): Promise<SessionRecord> {
  return prisma.whatsAppSession.update({
    where: { id },
    data,
  });
}

export async function handleWhatsAppMessage(from: string, text: string, sessionOrStoreId: SessionRecord | string = 'global') {
  // 1. Obtener o crear sesión usando el índice compuesto
  let session: SessionRecord;
  if (typeof sessionOrStoreId === 'object' && sessionOrStoreId !== null) {
    session = sessionOrStoreId;
  } else {
    const storeId = sessionOrStoreId || 'global';
    session = await ensureWhatsAppSession(from, storeId, storeId === 'global' ? 'global' : `store_${storeId}`);
  }

  // 1.5 Resolver el cliente de envío dinámico (Meta Cloud API o Evolution API)
  const isGlobal = !session.storeId || session.storeId === 'global';
  let client: BotClient = officialWaClient;
  let store: StoreRecord | null = null;

  if (!isGlobal) {
    store = await prisma.store.findUnique({
      where: { id: session.storeId }
    });
    if (store && store.whatsappInstanceName && store.whatsappConnected) {
      const activeStore = store;
      const { evolutionClient } = await import('@/lib/whatsapp/evolution');
      client = {
        sendText: (to: string, msg: string) => evolutionClient.sendText(activeStore.whatsappInstanceName!, to, msg),
        sendButtons: (to: string, msg: string, btns: { id: string; title: string }[]) => evolutionClient.sendButtons(activeStore.whatsappInstanceName!, to, msg, btns),
        sendList: (to: string, hdr: string, bdy: string, btnText: string, secs: { title: string; rows: { id: string; title: string; description?: string }[] }[]) => evolutionClient.sendList(activeStore.whatsappInstanceName!, to, hdr, bdy, btnText, secs),
        sendImage: (to: string, img: string, cap: string) => evolutionClient.sendImage(activeStore.whatsappInstanceName!, to, img, cap),
        sendDocument: (to: string, doc: string, fn: string) => evolutionClient.sendDocument(activeStore.whatsappInstanceName!, to, doc, fn),
        sendUrlButton: (to: string, bdy: string, btnText: string, url: string) => evolutionClient.sendUrlButton(activeStore.whatsappInstanceName!, to, bdy, btnText, url),
        sendLocationRequest: (to: string, msg: string) => evolutionClient.sendLocationRequest(activeStore.whatsappInstanceName!, to, msg)
      };
    }
  }

  // Helper to log bot outgoing messages in database
  const logBotOutgoing = async (text: string) => {
    try {
      const currentSession = await prisma.whatsAppSession.findUnique({
        where: { id: session.id }
      });
      if (!currentSession) return;
      const messages = toChatMessages(currentSession.messages);

      // Prevent duplication of bot messages
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === 'bot' && lastMsg.text === text) {
        return;
      }

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      messages.push({
        sender: 'bot',
        text,
        time: timeString,
        timestamp: Date.now()
      });

      await prisma.whatsAppSession.update({
        where: { id: currentSession.id },
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
    sendButtons: async (to: string, msg: string, btns: { id: string; title: string }[]) => {
      const res = await client.sendButtons(to, msg, btns);
      await logBotOutgoing(msg);
      return res;
    },
    sendList: async (to: string, hdr: string, bdy: string, btnText: string, secs: { title: string; rows: { id: string; title: string; description?: string }[] }[]) => {
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
    sendFlow: async (to: string, flowId: string, buttonText: string, flowToken: string, screen: string, data: unknown, header?: string, body?: string) => {
      if (typeof client.sendFlow === 'function') {
        const res = await client.sendFlow(to, flowId, buttonText, flowToken, screen, data, header, body);
        await logBotOutgoing(body || `[Flujo: ${buttonText}]`);
        return res;
      }
      throw new Error('sendFlow is not supported on this client configuration.');
    },
    sendLocationRequest: async (to: string, msg: string) => {
      if (typeof client.sendLocationRequest === 'function') {
        const res = await client.sendLocationRequest(to, msg);
        await logBotOutgoing(msg);
        return res;
      } else {
        const res = await client.sendText(to, msg);
        await logBotOutgoing(msg);
        return res;
      }
    }
  };

  // --- FILTRO DE SEGURIDAD PARA CUENTAS PERSONALES / HEURÍSTICA DE NEGOCIO ---
  const isSystemAction = 
    text.startsWith('store_') || 
    text.startsWith('view_list_') || 
    text.startsWith('select_') || 
    text.startsWith('confirm_') || 
    text === 'cancel' || 
    text === 'view_stores' || 
    text === 'search_now' ||
    text === 'clear_cart' ||
    text === 'view_cart_summary' ||
    text === 'final_summary' ||
    text.startsWith('flow_response_') ||
    text.startsWith('accept_delivery_')

  const isInProgress = session.step !== 'START' && session.step !== 'IDLE'

  if (!isSystemAction && !isInProgress && session.storeId && session.storeId !== 'global') {
    // 1. Verificar si tiene pedidos anteriores en esta tienda
    const hasPastOrder = await prisma.order.findFirst({
      where: {
        storeId: session.storeId,
        OR: [
          { customerPhone: from },
          { customerWhatsAppId: from }
        ]
      }
    })

    if (!hasPastOrder) {
      // 2. Verificar si contiene palabras clave comerciales o de negocio
      const businessKeywords = [
        'precio', 'valor', 'costo', 'cuesta', 'comprar', 'pedido', 'compra', 
        'catalogo', 'catálogo', 'menú', 'menu', 'productos', 'tienda', 'venden', 
        'disponible', 'quiero', 'pagar', 'carrito', 'orden', 'factura', 'domicilio', 
        'envio', 'envío', 'delivery', 'comprobante', 'pago', 'cuenta', 'nequi', 'daviplata',
        'info', 'informacion', 'información', 'servicio', 'contacto'
      ]
      
      const lowerText = text.toLowerCase().trim()
      const matchesKeyword = businessKeywords.some(kw => lowerText.includes(kw))

      if (!matchesKeyword) {
        // 3. Verificar si contiene el nombre de algún producto de la tienda
        const storeProducts = await prisma.product.findMany({
          where: { storeId: session.storeId, active: true },
          select: { name: true }
        })

        const matchesProduct = storeProducts.some(p => 
          lowerText.includes(p.name.toLowerCase().trim())
        )

        if (!matchesProduct) {
          console.log(`[Bot Filter] Ignorando mensaje de contacto personal (${from}): "${text}"`);
          return; // Detener flujo completamente para no responder ni disparar llamadas de IA
        }
      }
    }
  }

  const intent = await parseIntent(text);

  // Verificar si la tienda de la sesión está activa
  if (session.storeId && session.storeId !== 'global') {
    const activeStore = await prisma.store.findUnique({
      where: { id: session.storeId }
    });
    if (activeStore && !activeStore.active) {
      const resetStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId;
      session = await updateWhatsAppSession(session.id, {
        storeId: resetStoreId,
        cart: emptyCartState(),
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
      await updateWhatsAppSession(session.id, { step: 'AWAITING_STORE_SELECTION' });
      return;
    }
  }

  if (text.toLowerCase().includes('inicio') || text.toLowerCase().includes('hola') || text === 'search_now') {
    const resetStoreId = session.receivingPhoneId === 'global' ? 'global' : session.storeId;
    await updateWhatsAppSession(session.id, { step: 'IDLE', storeId: resetStoreId });
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
      await updateWhatsAppSession(session.id, {
        step: 'START',
        storeId: exitStoreId,
        cart: emptyCartState(),
        customerName: null,
        address: null
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
        let currentCart: CartState = buildCartState(cartStateToLines(session.cart));

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

        session = await updateWhatsAppSession(session.id, { cart: currentCart, step: 'IDLE' });

        // Trigger summary
        await handleWhatsAppMessage(from, 'view_cart_summary', session);
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
          
          await updateWhatsAppSession(session.id, { step: 'IDLE', storeId: store.id });
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

      await updateWhatsAppSession(session.id, { step: 'IDLE', storeId: store.id });
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
      const drivers = await prisma.driver.findMany({
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
      const driver = await prisma.driver.findUnique({
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
      await updateWhatsAppSession(session.id, { step: 'AWAITING_QUANTITY' });
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
      let currentCart: CartState = buildCartState(cartStateToLines(session.cart));
      
      currentCart.items[p.id] = {
        id: p.id,
        name: p.name,
        price: p.price,
        qty: (currentCart.items[p.id]?.qty || 0) + qty
      };

      session = await updateWhatsAppSession(session.id, { cart: currentCart, step: 'IDLE' });

      // MODO JELOU: Trigger Summary centralizado
      return await handleWhatsAppMessage(from, 'view_cart_summary', session);
    }
    return;
  }

  // Manejo de VER CARRITO
  // Manejo de RESUMEN DE CARRITO CENTRALIZADO (Modo Jelou Pro)
  if (text === 'view_cart_summary' || isViewCart) {
    const items = await getCartItemsForSession(session);

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
    const cartItems = await getCartItemsForSession(session);
    if (cartItems.length === 0) {
      await waClient.sendText(from, 'Tu carrito está vacío. 🛒 Agrega productos a tu carrito antes de solicitar el pago.');
      await updateWhatsAppSession(session.id, { step: 'IDLE' });
      return;
    }

    if (!session.customerName) {
      await updateWhatsAppSession(session.id, { step: 'AWAITING_NAME' });
      await waClient.sendText(from, '¡Excelente elección! 🛍️\n\nPara agilizar tu despacho, ¿a nombre de quién anotamos el pedido? 👤');
      return;
    }
    
    if (!session.address) {
      await updateWhatsAppSession(session.id, { step: 'AWAITING_ADDRESS' });
      const addressPrompt = `Perfecto, *${session.customerName}*. 📍\n\n¿A qué dirección debemos enviar tu pedido? Puedes escribir tu dirección o compartir tu ubicación actual de WhatsApp en el botón de abajo:`;
      await waClient.sendLocationRequest(from, addressPrompt);
      return;
    }

    // Si tiene todo, saltamos a la confirmación final
    const updatedSession = await updateWhatsAppSession(session.id, { step: 'AWAITING_CONFIRMATION' });
    // Forzamos el disparo de la confirmación
    await handleWhatsAppMessage(from, 'final_summary', updatedSession);
    return;
  }

  if (text === 'clear_cart') {
      await updateWhatsAppSession(session.id, { cart: emptyCartState() });
      await waClient.sendText(from, 'Carrito vaciado. 🗑️ ¿En qué puedo ayudarte?');
      return;
  }
  // ---------------------------------------------------------

  const nativeCapturingStates = ['AWAITING_NAME', 'AWAITING_ADDRESS', 'AWAITING_CONFIRMATION', 'AWAITING_STORE_SELECTION'];
  const isNativeState = nativeCapturingStates.includes(session.step || '');

  // ─────────────────────────────────────────────────────────────────────────
  // FIX A: Interceptar intenciones de PAGO/CHECKOUT antes de cualquier llamada
  // al LLM. El flujo nativo (confirm_checkout) genera el link real de pago.
  // Sin este interceptor, el LLM inventa links falsos al no tener contexto.
  // ─────────────────────────────────────────────────────────────────────────
  if (!isSystemAction && !isNativeState) {
    const checkoutTriggerPattern = /\b(pagar|quiero pagar|ir a pagar|finalizar|continuar.{0,15}pago|proceder|checkout|link de pago|enlace de pago|genera.{0,10}link|genera.{0,10}enlace|si.*pago|dale.*pago|procesa.{0,10}pedido|cobrar|cobrame|sigamos.*pedido|continuar.*pedido|confirmar.*pedido|procesar.*pedido|hacer.*pedido|ir.*pago)\b/i
    if (checkoutTriggerPattern.test(text)) {
      console.log(`[Bot] Checkout intent interceptado antes de LLM: "${text}" → dispatch confirm_checkout`)
      await handleWhatsAppMessage(from, 'confirm_checkout', session)
      return
    }
  }

  const aiStates = ['SEARCHING', 'COMPARING', 'CHECKOUT', 'SUPPORT'];
  if (!isSystemAction && !isNativeState && (aiStates.includes(session.step || '') || (session.storeId && session.storeId !== 'global' && store && store.aiActive))) {
    try {
      const { AgentRouter } = await import('@/lib/ai/pipeline/agent-router')
      const result = await AgentRouter.processMessage(from, text, 'WHATSAPP', session.storeId || 'global')
      
      // Recargar la sesión después de que la IA procesó la solicitud (puede haber cambiado el step nativo)
      session = await prisma.whatsAppSession.findUnique({ where: { id: session.id } }) || session;

      // Si el AgentRouter señala que debe dispararse el checkout nativo, redirigir
      if ((result as any).triggerNativeCheckout) {
        await handleWhatsAppMessage(from, 'confirm_checkout', session)
        return
      }

      // Solo enviar si hay una respuesta real; si el fallback retornó vacío, la IA no pudo responder
      if (result.response && result.response.trim()) {
        if (result.requiresLocationRequest) {
          await waClient.sendLocationRequest(from, result.response)
        } else {
          await waClient.sendText(from, result.response)
        }
      }
      return;
    } catch (agentErr) {
      console.error('Error in AgentRouter delegation:', agentErr)
    }
  }

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
      await updateWhatsAppSession(session.id, { step: 'IDLE' });
      break;

    case 'IDLE':
      // El resto de la búsqueda se mantiene igual
      if (intent.intent === 'QUERY' && intent.query) {
        // Si hay una tienda seleccionada, buscamos solo ahí
        const products = await searchGlobalProducts(intent.query, session.storeId);

        if (products.length === 0) {
          try {
            const { AgentRouter } = await import('@/lib/ai/pipeline/agent-router')
            const result = await AgentRouter.processMessage(from, text, 'WHATSAPP', session.storeId || 'global')
            await waClient.sendText(from, result.response)
          } catch (agentErr) {
            console.error('Error in agent router fallback:', agentErr)
            const storeMsg = session.storeId ? ' en esta tienda' : '';
            await waClient.sendText(from, `Lo siento, no encontré "${intent.query}"${storeMsg}. 😕 ¿Quieres intentar con otra cosa?`);
          }
        } else if (products.length === 1) {
          const p = products[0];
          await waClient.sendButtons(from, `¡Encontré esto! 🧐\n\n*${p.name}*\nTienda: ${p.storeName}\nPrecio: $${p.price.toLocaleString()}\n\n¿Deseas confirmar este pedido?`, [
            { id: `confirm_${p.id}`, title: '✅ Sí, confirmar' },
            { id: 'cancel', title: '❌ No, buscar otro' },
          ]);
          await updateWhatsAppSession(session.id, {
            step: 'AWAITING_CONFIRMATION',
            cart: {
              items: {
                [p.id]: {
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  qty: 1,
                  storeId: p.storeId,
                },
              },
            },
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
          await updateWhatsAppSession(session.id, { step: 'AWAITING_SELECTION' });
        }
      } else {
        // AI Chatbot fallback using DeepSeek
        let answeredByAI = false;
        if (session.storeId === 'global') {
          try {
            const { AgentRouter } = await import('@/lib/ai/pipeline/agent-router');
            const result = await AgentRouter.processMessage(from, text, 'WHATSAPP', 'global');
            await waClient.sendText(from, result.response);
            answeredByAI = true;
          } catch (agentErr) {
            console.error('Error invoking global agent router:', agentErr);
          }
        } else if (session.storeId && session.storeId !== 'global' && store && store.aiActive) {
          try {
            // 1. Fetch store products
            const storeProducts = await prisma.product.findMany({
              where: { storeId: store.id, active: true },
              take: 30
            });
            const productsListText = storeProducts.map(p => `- ${p.name}: $${p.price.toLocaleString('es-CO')}`).join('\n');

            // 2. Format chat history
            const history = toChatMessages(session.messages);
            const chatMessages = history.slice(-10).map(m => ({
              role: (m.sender === 'bot' ? 'assistant' : 'user') as 'system' | 'user' | 'assistant',
              content: m.text
            })).filter(m => {
              if (!m.content || m.content.trim() === '') return false;
              const trimmed = m.content.trim();
              if (m.role === 'assistant' && trimmed.startsWith('{') && trimmed.endsWith('}')) {
                return false;
              }
              return true;
            });
            
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
- NUNCA inventes, sugieras o propongas descuentos, paquetes promocionales o precios diferentes al catálogo. Los precios son fijos.
- ⚠️ PROHIBIDO ABSOLUTO: NUNCA inventes, construyas, simules ni menciones ningún enlace o URL de pago (ej: NO inventes pay.lcdavid.com, smartpay/12345, checkout/xxx, ni NINGÚN link). Si el cliente quiere pagar, dile ÚNICAMENTE que escriba "pagar" y el sistema le generará el link real automáticamente.
- Si el cliente pregunta por productos o precios, usa el catálogo arriba mencionado.
- Si el cliente desea comprar o ver el catálogo, indícales que escriban "Ver catálogo" o "Inicio" para listar las tiendas.
- Si el cliente quiere pagar o ver sus artículos seleccionados, dile solo: "Escribe *pagar* para generar tu link de pago real 🔗".
- Mantén las respuestas amigables, cortas y concisas (máximo 2 a 3 oraciones), ideales para leer en pantallas móviles de WhatsApp.
- NUNCA respondas con código JSON o formato estructurado de herramientas. Responde siempre en texto plano conversacional directo al usuario.
- No uses Markdown complejo. Usa negrita de WhatsApp (*texto*) si es necesario.`;


            // 4. Call OpenRouter (Free Model with optional SalesBot model override)
            const { generateOpenRouterCompletion } = await import('@/lib/ai/openrouter');
            const salesModel = process.env.SALES_BOT_MODEL || 'openrouter/free';
            const aiReply = await generateOpenRouterCompletion(chatMessages, systemPrompt, undefined, salesModel);

            if (aiReply) {
              const replyText = typeof aiReply === 'string' ? aiReply : (aiReply.content || '');
              if (replyText) {
                await waClient.sendText(from, replyText);
                answeredByAI = true;
              }
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
              const match = faqs.find((f) => text.toLowerCase().includes(f.question.toLowerCase()));
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
              await updateWhatsAppSession(session.id, { step: 'START', storeId: 'global' });
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

              await updateWhatsAppSession(session.id, { step: 'IDLE', storeId: store.id });
            }
          }
        }
      } else {
        // Si el usuario escribe algo en lugar de seleccionar, volvemos a IDLE
        await updateWhatsAppSession(session.id, { step: 'IDLE' });
        await handleWhatsAppMessage(from, text, session);
      }
      break;

    case 'AWAITING_SELECTION':
      // Ahora manejado globalmente
      break;

    case 'AWAITING_NAME': {
      const updatedSession = await updateWhatsAppSession(session.id, { customerName: text, step: 'IDLE' });
      // Re-disparar el flujo de checkout con la sesión actualizada
      await handleWhatsAppMessage(from, 'confirm_checkout', updatedSession);
      break;
    }

    case 'AWAITING_ADDRESS': {
      const updatedSession = await updateWhatsAppSession(session.id, { address: text, step: 'IDLE' });
      // Re-disparar el flujo de checkout con la sesión actualizada
      await handleWhatsAppMessage(from, 'confirm_checkout', updatedSession);
      break;
    }

    case 'AWAITING_CONFIRMATION':
      if (text === 'final_summary' || text === 'confirm_checkout' || intent.intent === 'CONFIRM') {
        const items = await getCartItemsForSession(session);
        
        if (items.length > 0) {
            const storeId = session.storeId || items[0]?.storeId || 'global';
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

            const order = await prisma.order.create({
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
              const store = await prisma.store.findUnique({
                where: { id: storeId },
                include: { brebConfig: true },
              });
              const bankDetails = store?.whatsapp ? `Nequi o Daviplata al celular ${store.whatsapp}` : '[Datos Cuenta]';
              const brebConfig = getBrebPaymentConfig(store?.brebConfig, store?.settings);
              const shouldUseBreb = Boolean(brebConfig?.enabled && brebConfig.keyValue && brebConfig.participantId);
              
              let mpPreferenceId: string | null = null;

              // Check if Mercado Pago is active and connected
              if (store && store.mpConnected && !shouldUseBreb) {
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

                    const preferenceData: {
                      body: {
                        items: Array<{ id: string; title: string; quantity: number; unit_price: number; currency_id: string }>;
                        external_reference: string;
                        back_urls: { success: string; failure: string; pending: string };
                        metadata: { orderId: string; storeId: string };
                        notification_url?: string;
                        auto_return?: 'approved';
                      }
                    } = {
                      body: {
                        items: items.map(line => ({
                          id: line.id,
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

              // Send the link / QR!
              if (shouldUseBreb) {
                const keyType = (brebConfig?.keyType || 'PHONE') as BrebKeyType;
                const reference = buildBrebPaymentReference(order.id);
                const gui = process.env.BREB_EMVCO_GUI?.trim() || DEFAULT_BREB_EMVCO_GUI;
                const emvPayload = buildBrebEmvcoPayload({
                  merchantName: brebConfig?.merchantDisplayName || store?.name || 'Tienda',
                  amount: total,
                  reference,
                  merchantAccount: {
                    gui,
                    participantId: brebConfig!.participantId!,
                    keyType,
                    keyValue: brebConfig!.keyValue!,
                    keyTypeCode: brebConfig?.keyTypeCode || undefined,
                  },
                });

                let qrImageToSend: string;
                try {
                  qrImageToSend = await QRCode.toDataURL(emvPayload, {
                    width: 400,
                    margin: 2,
                    color: {
                      dark: '#050505',
                      light: '#FFFFFF'
                    }
                  });
                } catch (qrErr) {
                  console.error('[chatbot-logic] Error generando QR en base64:', qrErr);
                  qrImageToSend = `${baseAppUrl}/api/qr?text=${encodeURIComponent(emvPayload)}`;
                }

                const brebCaption = `${orderSummary}\n\n` +
                  `🏦 *PAGO MEDIANTE BRE-B / INTEROPERABLE*\n` +
                  `1️⃣ Escanea este código QR desde tu app bancaria (Nequi, Daviplata, Bancolombia, etc.) o usa los datos:\n` +
                  `   • *Llave:* ${brebConfig?.keyValue}\n` +
                  `   • *Referencia:* ${reference}\n` +
                  `   • *Valor exacto:* $${total.toLocaleString('es-CO')} COP\n\n` +
                  `2️⃣ Transfiere y *envía la captura del comprobante por este chat* 📸.\n\n` +
                  `🔗 Portal web alternativo:\n${smartPayUrl}`;

                try {
                  await waClient.sendImage(from, qrImageToSend, brebCaption);
                } catch (imgErr) {
                  console.error('[chatbot-logic] Error enviando imagen QR Bre-B, fallback a botón:', imgErr);
                  await waClient.sendUrlButton(
                    from,
                    brebCaption,
                    'Pagar por Bre-B',
                    smartPayUrl
                  );
                }
              } else if (store && store.mpConnected && mpPreferenceId) {
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

              await updateWhatsAppSession(session.id, {
                step: 'AWAITING_CONFIRMATION',
                cart: emptyCartState(),
                customerName: null,
                address: null
              });
            } catch (err) {
               console.error('[Chatbot checkout finalize error]', err);
               await waClient.sendText(from, 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
            }
        } else {
          await waClient.sendText(from, 'Tu carrito está vacío. 🛒 Agrega productos a tu carrito antes de solicitar el pago.');
          await updateWhatsAppSession(session.id, {
            step: 'IDLE',
            customerName: null,
            address: null
          });
        }
      } else if (intent.intent === 'CANCEL' || text === 'cancel') {
        await waClient.sendText(from, 'Pedido cancelado. Carrito mantenido.');
        await updateWhatsAppSession(session.id, {
          step: 'IDLE',
          customerName: null,
          address: null
        });
      }
      break;
  }
}

function getBrebPaymentConfig(tableConfig: { enabled?: boolean; keyValue?: string; participantId?: string | null } | null | undefined, settings: unknown) {
  if (tableConfig) return tableConfig;
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return null;
  const config = (settings as Record<string, unknown>).brebConfig;
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null;
  return config as { enabled?: boolean; keyValue?: string; participantId?: string | null };
}

export async function handleWhatsAppImage(
  from: string,
  mediaIdOrKey: string | Record<string, unknown>,
  mimeType: string,
  storeId: string = 'global',
  instanceName?: string,
  messagePayload?: Record<string, unknown>
) {
  const waClient = createDownloadableClient(instanceName, messagePayload);

  // 1. Obtener sesión del bot usando compound key
  const session = await prisma.whatsAppSession.findUnique({
    where: {
      phoneNumber_storeId: {
        phoneNumber: from,
        storeId: storeId
      }
    },
  });

  if (!session || session.step !== 'AWAITING_CONFIRMATION') {
    console.log(`[Bot Filter] Ignorando imagen no relacionada con comprobante de pago de (${from})`);
    return;
  }

  // 2. Buscar la orden PENDING más reciente para este cliente
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { customerPhone: from },
        { customerWhatsAppId: from },
      ],
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
    await prisma.whatsAppSession.update({
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

