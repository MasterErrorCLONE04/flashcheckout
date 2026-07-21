import crypto from 'crypto'
import { generateOpenRouterCompletion, type ChatMessage } from '@/lib/ai/openrouter'
import { SessionManager, type SessionContext, type ConversationState } from './session-manager'
import { prisma } from '@/lib/prisma'
import { ToolRegistry, type MCPTool } from './tool-registry'
import './tools'

// Máximo de mensajes a persistir en BD por sesión (evita JSON gigantes en sesiones largas)
const MAX_PERSISTED_MESSAGES = 40

// Schema del resultado de la clasificación+extracción unificada
interface ClassificationResult {
  intent: 'search_products' | 'add_to_cart' | 'checkout' | 'faq' | 'chat'
  query?: string        // Para search_products y faq
  productName?: string  // Para add_to_cart
  quantity?: number     // Para add_to_cart
}

export class AgentRouter {
  /**
   * Enruta y ejecuta la lógica conversacional del agente utilizando Intent Detection y MCP Tools.
   *
   * OPTIMIZACIÓN v2: Se reemplazaron las 4 LLM calls en cascada por una arquitectura de 2 calls:
   *   Call 1: Clasificación + Extracción de parámetros en un único prompt JSON estructurado.
   *   Call 2: Síntesis final de respuesta (se mantiene igual).
   * El matching de productId contra lastRetrievedIds se realiza en código (sin LLM).
   */
  public static async processMessage(
    sessionKey: string,
    messageContent: string,
    channel: 'WHATSAPP' | 'WEB',
    storeId: string = 'global',
    parentTraceId?: string
  ): Promise<{ response: string; traceId: string; requiresLocationRequest?: boolean; triggerNativeCheckout?: boolean }> {
    // Fix #5: usar crypto.randomUUID() para eliminar riesgo de colisiones
    const traceId = parentTraceId || `tr_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
    const startTime = Date.now()

    // 1. Cargar estado y memoria conversacional
    const session = await SessionManager.getSession(channel, sessionKey, storeId)

    const lastMsg = session.memory.messages[session.memory.messages.length - 1]
    const alreadyAppended = lastMsg &&
      (channel === 'WHATSAPP'
        ? ((lastMsg as any).sender === 'user' && (lastMsg as any).text === messageContent)
        : ((lastMsg as any).role === 'user' && (lastMsg as any).content === messageContent))

    if (!alreadyAppended) {
      if (channel === 'WHATSAPP') {
        session.memory.messages.push({
          sender: 'user',
          text: messageContent,
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now()
        } as any)
      } else {
        session.memory.messages.push({ role: 'user', content: messageContent } as any)
      }
    }

    let selectedToolName = 'chat'
    let toolResult: any = null
    let responseText = ''
    let llmLatencyMs = 0
    let promptTokens = 0
    let completionTokens = 0
    let providerRequestId = ''

    try {
      // ─────────────────────────────────────────────────────────────────
      // 2. CLASIFICACIÓN + EXTRACCIÓN UNIFICADA (1 sola LLM call)
      //    Antes eran 2-3 calls separadas (clasificador → extractor → matcher).
      //    Ahora un único prompt JSON retorna intención + parámetros de herramienta.
      // ─────────────────────────────────────────────────────────────────
      const classificationResult = await AgentRouter.classifyAndExtract(messageContent)
      const { intent, query, productName, quantity } = classificationResult

      console.log(`[AgentRouter] Trace: ${traceId} - Intención: ${intent} | query: "${query}" | product: "${productName}"`)

      // 3. Selección y Ejecución de Herramientas (con los parámetros ya extraídos)
      if (intent === 'search_products') {
        selectedToolName = 'search_products'
        const tool = ToolRegistry.get('search_products')
        if (tool) {
          session.state = 'SEARCHING'
          const searchQuery = query || messageContent
          toolResult = await tool.execute(
            { query: searchQuery },
            { storeId, traceId, session, sessionKey, channel }
          )
        }

      } else if (intent === 'add_to_cart') {
        selectedToolName = 'add_to_cart'
        const tool = ToolRegistry.get('add_to_cart')
        if (tool) {
          session.state = 'SEARCHING'

          // Matching en código puro (sin LLM) usando lastRetrievedProducts para correlación
          // Si el usuario dijo "ese", "el primero", etc. se intenta resolver desde memoria
          const lastProducts = session.memory.lastRetrievedProducts || []
          let selectedProductId: string = 'NONE'

          if (lastProducts.length > 0 && productName) {
            const normalizedSearch = productName.toLowerCase().trim()
            const matched = lastProducts.find((p: { id: string; name: string }) => {
              const normalizedName = p.name.toLowerCase()
              return normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName)
            })
            if (matched) {
              selectedProductId = matched.id
              console.log(`[AgentRouter] Match en código: "${productName}" → ID ${selectedProductId}`)
            }
          }

          toolResult = await tool.execute(
            { productId: selectedProductId, productName: productName || '', quantity: quantity || 1 },
            { storeId, traceId, session, sessionKey, channel }
          )
        }

      } else if (intent === 'checkout') {
        // Fix C: En WhatsApp, el checkout DEBE pasar por el flujo nativo de chatbot-logic.ts
        // que captura nombre, dirección con botón de ubicación y genera el link real de pago.
        // El AgentRouter no tiene contexto de sesión nativa para hacer esto correctamente.
        if (channel === 'WHATSAPP') {
          console.log(`[AgentRouter] Checkout en WHATSAPP → delegando al flujo nativo`)
          return { response: '', traceId, triggerNativeCheckout: true }
        }
        selectedToolName = 'checkout'
        const tool = ToolRegistry.get('checkout')
        if (tool) {
          session.state = 'CHECKOUT'
          toolResult = await tool.execute({}, { storeId, traceId, session, sessionKey, channel })
        }

      } else if (intent === 'faq') {
        selectedToolName = 'faq'
        const tool = ToolRegistry.get('faq')
        if (tool) {
          session.state = 'SUPPORT'
          toolResult = await tool.execute(
            { query: query || messageContent },
            { storeId, traceId, session, sessionKey, channel }
          )
        }

      } else {
        selectedToolName = 'chat'
        session.state = 'IDLE'
      }

      // Sincronizar estado de captura nativa (evita que saveSession sobreescriba estados como AWAITING_*)
      if (toolResult && typeof toolResult === 'object') {
        if (toolResult.requires_input === 'NAME') {
          session.state = 'AWAITING_NAME'
        } else if (toolResult.requires_input === 'ADDRESS') {
          session.state = 'AWAITING_ADDRESS'
        }
      }

      // ─────────────────────────────────────────────────────────────────
      // 4. Síntesis Final (única LLM call restante)
      // ─────────────────────────────────────────────────────────────────
      let contextString = 'No se requirió consulta de base de datos.'
      if (toolResult) {
        if (selectedToolName === 'add_to_cart') {
          contextString = `El producto "${toolResult.producto || 'desconocido'}" fue agregado al carrito. Cantidad: ${toolResult.cantidad || 1}. Total de este artículo: $${toolResult.total_item || 0} COP. Mensaje de estado: ${toolResult.message || ''}`
        } else if (selectedToolName === 'checkout') {
          contextString = toolResult.success
            ? `El pedido fue creado con éxito. Enlace de pago (Smart Pay URL): ${toolResult.paymentUrl || toolResult.enlace_de_pago || ''}. Mensaje de estado: ${toolResult.instrucciones || toolResult.message || ''}`
            : `El checkout no se pudo completar porque falta información. Mensaje de estado: ${toolResult.message || ''}`
        } else if (selectedToolName === 'search_products') {
          contextString = `Resultados de búsqueda de productos:\n${Array.isArray(toolResult) ? toolResult.map((p: any) => `- ${p.nombre}: $${p.precio} COP (ID: ${p.id}, Tienda: ${p.tienda})`).join('\n') : 'No se encontraron productos.'}`
        } else if (selectedToolName === 'faq') {
          contextString = `Información de soporte / FAQ encontrada:\n${Array.isArray(toolResult) ? toolResult.map((f: any) => `- Pregunta: ${f.pregunta}\n  Respuesta: ${f.respuesta}`).join('\n') : 'No se encontró información relevante.'}`
        } else {
          contextString = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
        }
      }

      let storePrompt = 'Eres un asistente virtual de ventas para FlashCheckouts. Ayudas al cliente de forma amable, persuasiva y concisa.'
      if (storeId && storeId !== 'global') {
        const storeObj = await prisma.store.findUnique({ where: { id: storeId } })
        if (storeObj) {
          const storeName = storeObj.name
          const welcome = storeObj.welcomeMessage || ''
          const bio = storeObj.bio || ''
          storePrompt = `Eres el asistente virtual de ventas oficial de la tienda "${storeName}".
Información de la tienda: ${bio || 'Comercio asociado'}.
${welcome ? `Mensaje de bienvenida: "${welcome}"` : ''}
Atiende al cliente con amabilidad, educación y enfocado en vender sus productos de manera persuasiva y concisa. Al recomendar productos, sé corto y amigable (ideal para leer en pantallas móviles de WhatsApp). NO incluyas enlaces o links de catálogo al recomendar o listar productos individuales.`
        }
      }

      const systemPrompt = `${storePrompt}
Utiliza la información del contexto para responder.

⚠️ REGLAS ESTRICTAS DE PRECIOS Y ENLACES (MANDATORIO - VIOLACIÓN = RESPUESTA INVÁLIDA):
- NUNCA inventes, sugieras, ofrezcas o acuerdes descuentos, ofertas especiales, rebajas o paquetes promocionales.
- Los precios de los productos son fijos y se limitan estrictamente a lo que está en el catálogo. No tienes autorización para alterar o negociar ningún precio.
- Si el contexto tiene un enlace de pago real (Smart Pay URL), inclúyelo textualmente de forma amigable al final para que el cliente pueda realizar su pago.
- 🚫 PROHIBICIÓN ABSOLUTA: Si el contexto NO tiene un enlace de pago (como en la búsqueda de productos o agregar al carrito), está TERMINANTEMENTE PROHIBIDO inventar, deducir, construir o simular CUALQUIER enlace o URL de pago. Ejemplos de lo que NO debes hacer: NO escribas pay.tutienda.com/algo, NO escribas smartpay/12345, NO escribas checkout/xxx, NO escribas NINGUNA URL. Si el cliente pregunta por el link de pago, díle SOLO: "Escribe *pagar* para generar tu enlace real 🔗".

⚠️ INSTRUCCIÓN CRÍTICA:
- Responde al cliente de manera 100% natural, conversacional y amigable en español.
- NUNCA respondas con formato JSON, bloques de código ni sintaxis estructurada de herramientas.
- El cliente verá tu mensaje directamente en su chat de WhatsApp, por lo que debes hablarle como un vendedor humano real.

${contextString}`

      // Convertir historial a ChatMessage normalizado y filtrar mensajes JSON corruptos
      const chatMessages: ChatMessage[] = session.memory.messages.map((m: any) => {
        const role = m.role || (m.sender === 'user' ? 'user' : 'assistant')
        const content = m.content || m.text || ''
        return { role: role as 'user' | 'assistant', content }
      }).filter(m => {
        if (!m.content || m.content.trim() === '') return false
        const trimmed = m.content.trim()
        if (m.role === 'assistant' && trimmed.startsWith('{') && trimmed.endsWith('}')) {
          return false
        }
        return true
      })

      const llmStart = Date.now()
      const llmResponse = await generateOpenRouterCompletion(chatMessages, systemPrompt)
      llmLatencyMs = Date.now() - llmStart

      responseText = typeof llmResponse === 'string' ? llmResponse : llmResponse.content || ''

      // Fix D: Post-procesado de seguridad — detectar y eliminar URLs inventadas.
      // Si el toolResult no contiene un link de pago real (checkout exitoso), remover
      // cualquier URL que el LLM haya fabricado para evitar mostrar links rotos al usuario.
      const hasRealPaymentUrl = (
        selectedToolName === 'checkout' &&
        toolResult &&
        toolResult.success &&
        (toolResult.paymentUrl || toolResult.enlace_de_pago)
      )
      if (!hasRealPaymentUrl && channel === 'WHATSAPP') {
        // Detectar patrones de URL que no deberían aparecer (links inventados por el LLM)
        const inventedUrlPattern = /https?:\/\/[^\s]+\/(?:pay|smartpay|checkout|pago|order|pedido)[\w\/-]*/gi
        if (inventedUrlPattern.test(responseText)) {
          console.warn(`[AgentRouter] URL inventada detectada en respuesta LLM. Eliminando.`)
          responseText = responseText
            .replace(inventedUrlPattern, '')
            .replace(/\n{3,}/g, '\n\n') // Limpiar espacios extra
            .trim()
          // Si quedó vacío o muy corto después de la limpieza, añadir indicación
          if (responseText.length < 20) {
            responseText = 'Para generar tu enlace de pago real, escribe *pagar*. 🔗'
          }
        }
      }

      if (channel === 'WHATSAPP') {
        session.memory.messages.push({
          sender: 'bot',
          text: responseText,
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now()
        } as any)
      } else {
        session.memory.messages.push({ role: 'assistant', content: responseText })
      }

      // Estimación de tokens (aproximada)
      promptTokens = Math.floor(messageContent.length / 4) + 100
      completionTokens = Math.floor(responseText.length / 4)
      providerRequestId = `op-${Date.now()}`

      // Fix #13: Podar historial ANTES de guardar en BD para evitar JSON gigantes
      if (session.memory.messages.length > MAX_PERSISTED_MESSAGES) {
        session.memory.messages = session.memory.messages.slice(-MAX_PERSISTED_MESSAGES)
      }

      // 5. Guardar la sesión conversacional
      await SessionManager.saveSession(channel, sessionKey, session, storeId)

      // 6. Registrar auditoría e instrumentación
      const vectorLatency = selectedToolName === 'search_products'
        ? Math.floor(Date.now() - startTime - llmLatencyMs)
        : 0

      if (prisma.agentExecution) {
        await prisma.agentExecution.create({
          data: {
            id: `ex_${crypto.randomUUID().replace(/-/g, '').slice(0, 13)}`,
            traceId,
            providerRequestId,
            agentName: `agent_4_wa_${channel.toLowerCase()}`,
            selectedTool: selectedToolName,
            model: 'openrouter/free',
            promptVersion: 'v3',
            vectorLatencyMs: vectorLatency,
            llmLatencyMs,
            promptTokens,
            completionTokens,
            estimatedCost: ((promptTokens * 0.00015) + (completionTokens * 0.0006)) / 1000,
            status: 'success'
          }
        }).catch((e) => console.warn('[AgentRouter] No se pudo guardar agentExecution audit record:', e))
      }

    } catch (error: any) {
      console.error(`[AgentRouter Error] Fallo en procesamiento de mensaje:`, error)
      responseText = 'Lo siento, tuve un problema al procesar tu solicitud. Por favor, reintenta en un momento.'

      if (prisma.agentExecution) {
        await prisma.agentExecution.create({
          data: {
            id: `ex_${crypto.randomUUID().replace(/-/g, '').slice(0, 13)}`,
            traceId,
            agentName: `agent_4_wa_${channel.toLowerCase()}`,
            model: 'openrouter/free',
            status: 'error',
            errorMessage: error.message || String(error)
          }
        }).catch((e) => console.warn('[AgentRouter] No se pudo guardar agentExecution error record:', e))
      }
    }

    const requiresLocationRequest = toolResult && toolResult.requires_input === 'ADDRESS'
    return { response: responseText, traceId, requiresLocationRequest: Boolean(requiresLocationRequest) }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MÉTODO PRIVADO: Clasificación + Extracción en una sola LLM call
  // Retorna un objeto tipado con intención y parámetros de herramienta.
  // Reemplaza 2-3 llamadas LLM separadas del flujo anterior (v2 → v3).
  // ─────────────────────────────────────────────────────────────────────────
  private static async classifyAndExtract(messageContent: string): Promise<ClassificationResult> {
    const unifiedPrompt = `Analiza el mensaje del usuario y responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "intent": "<intención>",
  "query": "<término de búsqueda si aplica, si no null>",
  "productName": "<nombre base del producto si aplica, si no null>",
  "quantity": <número entero, por defecto 1>
}

Valores válidos para "intent":
- "search_products": buscar comida, platos, productos, ver catálogo (Ej: "tengo hambre", "qué tienes", "recomiéndame algo")
- "add_to_cart": agregar un producto específico al carrito (Ej: "quiero una gelatina", "agrega ese", "ponme dos pizzas")
- "checkout": pagar, finalizar compra, procesar pedido, respuesta afirmativa a propuesta de pago (Ej: "quiero pagar", "sí", "dale", "ir a pagar", "finalizar")
- "faq": preguntas de soporte, horarios, cobertura, políticas (Ej: "¿tienen domicilio?", "¿están abiertos?")
- "chat": saludos, despedidas, agradecimientos (Ej: "hola", "gracias", "adiós")

Para "query": extrae el término semántico de búsqueda (Ej: "pizza", "comida rápida", "dulces"). Solo si intent es "search_products" o "faq".
Para "productName": extrae el nombre base del producto sin palabras como "un", "paquete de", "quiero" (Ej: de "un paquete de gelatinas" → "gelatina"). Solo si intent es "add_to_cart".
Para "quantity": número de unidades. Por defecto 1.

Mensaje: "${messageContent.replace(/"/g, '\\"')}"
JSON:`

    // 0. Pre-clasificación heurística determinista para comandos estándar
    const heuristic = parseIntentHeuristic(messageContent)
    if (heuristic) {
      console.log(`[AgentRouter] Pre-clasificación heurística activada:`, heuristic)
      return heuristic
    }

    try {
      const result = await generateOpenRouterCompletion(
        [{ role: 'user', content: unifiedPrompt }],
        'Eres un clasificador preciso de intenciones. Responde exclusivamente con JSON válido.'
      )
      const rawText = typeof result === 'string' ? result.trim() : result.content?.trim() || '{}'
      // Extraer la estructura JSON incluso si el modelo incluye preámbulos como "User Safety: safe" o bloques markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      const cleanJson = jsonMatch ? jsonMatch[0] : rawText.replace(/```json|```/gi, '').trim()
      const parsed = JSON.parse(cleanJson) as ClassificationResult

      // Validar que intent sea un valor conocido
      const validIntents = ['search_products', 'add_to_cart', 'checkout', 'faq', 'chat']
      if (!validIntents.includes(parsed.intent)) {
        parsed.intent = 'chat'
      }

      return parsed
    } catch (err) {
      console.error('[AgentRouter] Error parsing classification JSON, falling back to chat:', err)
      return { intent: 'chat' }
    }
  }
}

function parseIntentHeuristic(message: string): ClassificationResult | null {
  const text = message.toLowerCase().trim()

  // 0. Intent: cancel / abort (e.g., "cancelar", "abortar", "reiniciar", "ya no quiero")
  if (/^(cancelar|cancel|abortar|reiniciar|olvidalo|olvídalo|ya no quiero|no quiero nada|cancelar pedido)$/i.test(text)) {
    return { intent: 'chat' }
  }

  // 1. Intent: search_products (Catalog exploration checked FIRST before add_to_cart)
  // e.g., "quiero ver los productos", "ver catálogo", "mostrar productos", "qué productos tienes", "ver todos los que tengas"
  const isCatalogQuery = /\b(catalogo|catálogo|menú|menu|ver productos|ver todos|mis productos|nuestros productos|productos|qué tienen|que tienen|mostrar productos|enseñame los productos|ver los productos|ver todo|mostrar catálogo|mostrar catalogo)\b/i.test(text) ||
    /^(quiero ver|ver|mostrar|enseñame|dame ver)/i.test(text)

  if (isCatalogQuery) {
    const cleanQuery = text.replace(/\b(quiero|ver|mostrar|enseñame|el|los|las|de|un|una|todos|los|que|tengas|productos|catalogo|catálogo)\b/gi, '').trim()
    return {
      intent: 'search_products',
      query: cleanQuery.length >= 2 ? cleanQuery : 'productos'
    }
  }

  // 2. Intent: checkout
  if (/\b(pagar|quiero pagar|ir a pagar|finalizar|checkout|link de pago|enlace de pago)\b/i.test(text)) {
    return { intent: 'checkout' }
  }

  // 3. Intent: add_to_cart (ej: "quiero 1 gelatina", "quiero gelatina", "agrega 2 pizzas")
  const addToCartMatch = text.match(/\b(?:quiero|agrega|agregar|añadir|añade|ponme|dame)\s+(\d+)?\s*(?:un|una|unos|unas)?\s*([a-záéíóúñ0-9\s]{2,30})/i)
  if (addToCartMatch) {
    const qtyStr = addToCartMatch[1]
    const rawProd = addToCartMatch[2]?.replace(/\b(por favor|gracias|al carrito)\b/gi, '').trim()
    const forbiddenWords = ['pagar', 'comprar', 'ver', 'ayuda', 'catalogo', 'catálogo', 'menu', 'menú', 'productos', 'tiendas', 'tienda', 'todos', 'que tengas', 'cancelar']
    const containsForbidden = forbiddenWords.some(w => rawProd?.toLowerCase().includes(w))
    
    if (rawProd && rawProd.length >= 2 && !containsForbidden) {
      return {
        intent: 'add_to_cart',
        productName: rawProd,
        quantity: qtyStr ? Math.max(1, parseInt(qtyStr, 10)) : 1
      }
    }
  }

  return null
}
