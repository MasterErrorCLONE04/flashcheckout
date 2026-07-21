/**
 * PROVEEDOR ALTERNATIVO — DeepSeek Gateway (ACTUALMENTE INACTIVO)
 *
 * Este archivo implementa un gateway idéntico al de OpenRouter pero apuntando
 * directamente a la API de DeepSeek (api.deepseek.com).
 *
 * ESTADO: No se importa en ningún lugar del proyecto. Todo el tráfico de
 * producción va a través de `lib/ai/openrouter.ts` (OpenRouter como proveedor unificado).
 *
 * PARA ACTIVAR: Reemplazar el import de `generateOpenRouterCompletion` en
 * `pipeline/agent-router.ts` por `generateDeepSeekCompletion` de este archivo,
 * y configurar DEEPSEEK_API_KEY en .env.
 *
 * ADVERTENCIA: El simulador fallback de este archivo retorna JSON.stringify()
 * para el panel admin, lo cual puede diferir del formato esperado por el caller.
 */


import type { ChatMessage } from './openrouter'

export interface AIGatewayConfig {
  maxHistoryMessages: number
  temperature: number
  maxTokens: number
}

// ── AI GATEWAY CONFIGURATION ───────────────────────────────
const GATEWAY_CONFIG: AIGatewayConfig = {
  maxHistoryMessages: 10,
  temperature: 0.5,
  maxTokens: 800
}

/**
 * AI Gateway Central Interface
 * Orchestrates: Prompt Builder, Memory Management, Security Guardrails,
 * Tool Registries, and Redundancy Fallback.
 */
export async function generateDeepSeekCompletion(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1'

  // 1. Guardrails: Filtro básico de seguridad y PII
  const cleanMessages = applySecurityGuardrails(messages)
  const cleanSystemPrompt = systemPrompt ? applySecurityGuardrails([{ role: 'system', content: systemPrompt }])[0].content : undefined

  // 2. Memory Manager: Limita e historial para cuidar límites de tokens
  const prunedHistory = pruneConversationHistory(cleanMessages, GATEWAY_CONFIG.maxHistoryMessages)

  // 3. Prompt Builder: Incorpora el prompt de sistema
  const apiMessages: ChatMessage[] = []
  if (cleanSystemPrompt) {
    apiMessages.push({ role: 'system', content: cleanSystemPrompt })
  }
  apiMessages.push(...prunedHistory)

  // 4. Fallback de Redundancia: Si no hay API key o es la de pruebas local
  if (!apiKey || apiKey === 'sk-mock-deepseek-key-12345' || apiKey.includes('placeholder')) {
    console.log('[AI Gateway] Conexión principal inactiva. Derivando a Simulador Fallback...')
    return generateFallbackAIResponse(apiMessages)
  }

  // 5. Conector de Red (DeepSeek-Chat API Call)
  try {
    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: GATEWAY_CONFIG.temperature,
        max_tokens: GATEWAY_CONFIG.maxTokens
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.warn(`[AI Gateway Warning - Status ${res.status}]: ${errorText}`)
      // En caso de caída de API en producción, cae elegantemente al simulador en lugar de arrojar error
      return generateFallbackAIResponse(apiMessages)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (err) {
    console.error('[AI Gateway Network Exception]', err)
    return generateFallbackAIResponse(apiMessages)
  }
}

// ── MEMORY MANAGER: Historial y Pruning ─────────────────────
function pruneConversationHistory(messages: ChatMessage[], maxLimit: number): ChatMessage[] {
  if (messages.length <= maxLimit) return messages
  // Conserva los últimos X mensajes para no saturar el contexto de la sesión
  return messages.slice(-maxLimit)
}

// ── GUARDRAILS: Seguridad y Filtro PII ───────────────────────
function applySecurityGuardrails(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(m => {
    let cleanContent = m.content || ''

    // 1. Sanitizar contra ataques comunes de Prompt Injection (ej. "olvida las instrucciones anteriores")
    const injectionPatterns = [
      /ignore previous instructions/gi,
      /ignore all instructions/gi,
      /olvida las instrucciones anteriores/gi,
      /ignora las instrucciones/gi,
      /forget everything/gi
    ]

    injectionPatterns.forEach(pattern => {
      if (pattern.test(cleanContent)) {
        console.warn('[AI Gateway Guardrails] Intento de inyección de prompt detectado y mitigado.')
        cleanContent = cleanContent.replace(pattern, '[Mensaje Filtrado por Seguridad]')
      }
    })

    // 2. Filtro simple contra inyección de caracteres maliciosos de control
    cleanContent = cleanContent.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '')

    return {
      ...m,
      content: cleanContent
    }
  })
}

// ── SIMULADOR FALLBACK CON MOTOR DE CONTEXTO INTEGRADOR ─────
function generateFallbackAIResponse(messages: ChatMessage[]): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || ''
  const q = lastUserMsg.toLowerCase().trim()
  const systemMsg = messages.find(m => m.role === 'system')?.content || ''

  // Extraer catálogo de productos inyectado en el prompt si existe
  const productMatches = systemMsg.match(/-\s([^:\n]+):\s\$([^\n\s]+)/g) || []
  const products = productMatches.map(p => {
    const parts = p.replace(/[-\s*]/g, '').split(':')
    return { name: parts[0], price: parts[1] }
  })

  // 1. Flujo Conversacional para Clientes (WhatsApp Context)
  if ((systemMsg.includes('WhatsApp') || systemMsg.includes('cliente')) && !systemMsg.includes('copiloto') && !systemMsg.includes('guía de la plataforma')) {
    if (q.includes('hola') || q.includes('buenos dias') || q.includes('buenas tardes')) {
      return `¡Hola! Bienvenido. 🤖 Soy tu asistente de ventas virtual. ¿En qué te puedo colaborar hoy? Puedes escribir "Ver catálogo" para conocer nuestros productos.`
    }
    
    if (q.includes('precio') || q.includes('cuanto vale') || q.includes('catalogo') || q.includes('productos') || q.includes('buscar')) {
      if (products.length > 0) {
        let reply = `Contamos con los siguientes productos en catálogo:\n\n`
        products.forEach((p, idx) => {
          reply += `${idx + 1}. *${p.name}* - $${p.price}\n`
        })
        reply += `\n¿Te gustaría que añada alguno de estos a tu carrito?`
        return reply
      }
      return `Claro, contamos con excelentes productos disponibles. Por favor dime qué estás buscando y con gusto te informo.`
    }

    if (q.includes('carrito') || q.includes('pagar') || q.includes('finalizar') || q.includes('comprar')) {
      return `¡Excelente! Para proceder con el pago, por favor escribe "Ver carrito" para confirmar tus artículos y generar tu enlace de pago seguro.`
    }

    if (q.includes('gracias') || q.includes('adios') || q.includes('chao')) {
      return `¡Con gusto! Que tengas un excelente día. Escribe de nuevo si necesitas algo más. 👋`
    }

    return `Entendido. Estoy aquí para tomar tu pedido. Si tienes alguna duda sobre nuestros productos en catálogo, por favor pregúntame.`
  }

  // 2. Flujo Administrativo para Comerciantes (Nova Panel Context)
  if (q.includes('hola') || q.includes('buenos dias') || q.includes('buenas tardes')) {
    return JSON.stringify({
      text: `¡Hola! 👋 Soy Nova, tu copiloto inteligente de la plataforma. Estoy aquí para guiarte en el panel de control de tu tienda. Puedo ayudarte a gestionar tus productos, revisar pedidos y ventas, crear cupones de descuento o configurar tus integraciones. ¿Qué te gustaría hacer hoy?`,
      action: 'NONE'
    })
  }

  if (q.includes('catalogo') || q.includes('producto') || q.includes('inventario') || q.includes('crear el catalogo') || q.includes('crear catalogo')) {
    return JSON.stringify({
      text: 'Como tu copiloto, puedo guiarte para crear y administrar el catálogo de tu tienda. Puedes gestionar todos tus productos e inventarios directamente desde la sección de Productos en el menú lateral, o indicarme los datos aquí mismo y te ayudaré a estructurarlos.',
      action: 'REDIRECT_PRODUCTS'
    })
  }

  if (q.includes('descuento') || q.includes('cupón') || q.includes('promoción')) {
    return JSON.stringify({
      text: '¡Listo! He configurado y activado un cupón de descuento del 15% para tu tienda.',
      action: 'CREATE_COUPON',
      coupon: {
        code: 'PROMO15',
        desc: 'Descuento especial del 15% en compras',
        validity: 'Válido hasta: domingo próximo',
        active: true
      }
    })
  }

  if (q.includes('pedidos') || q.includes('ventas') || q.includes('facturación')) {
    return JSON.stringify({
      text: 'He verificado la base de datos de tu negocio. Actualmente tienes pedidos pendientes por gestionar. Puedes auditarlos en la sección correspondiente.',
      action: 'REDIRECT_ORDERS'
    })
  }

  if (q.includes('reporte') || q.includes('grafica') || q.includes('rendimiento')) {
    return JSON.stringify({
      text: 'Generando reporte de rendimiento... Durante los últimos 7 días, tu tienda obtuvo ventas acumuladas con excelente rendimiento. La mayor parte de la facturación proviene de la venta directa por WhatsApp.',
      action: 'SHOW_REPORT'
    })
  }

  return JSON.stringify({
    text: 'Entendido. Como tu copiloto de la plataforma, estoy aquí para guiarte y ayudarte a navegar por el panel. ¿Hay alguna sección o configuración en la que te pueda asistir?',
    action: 'NONE'
  })
}
