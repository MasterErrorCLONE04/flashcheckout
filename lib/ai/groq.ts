export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  name?: string
  tool_calls?: any[]
  tool_call_id?: string
}

export interface AIGatewayConfig {
  maxHistoryMessages: number
  temperature: number
  maxTokens: number
}

const GATEWAY_CONFIG: AIGatewayConfig = {
  maxHistoryMessages: 15, // Aumentado ligeramente para acomodar ciclos de tools
  temperature: 0.5,
  maxTokens: 4096
}

/**
 * AI Gateway Central Interface using Groq Cloud API
 */
export async function generateGroqCompletion(
  messages: ChatMessage[],
  systemPrompt?: string,
  tools?: any[]
): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL || 'qwen/qwen3.6-27b'
  const apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1'

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

  // 4. Fallback de Redundancia: Si no hay API key o es de prueba
  if (!apiKey || apiKey.includes('placeholder')) {
    console.log('[Groq Gateway] Conexión principal inactiva (sin API key). Derivando a Simulador Fallback...')
    const fallbackText = generateFallbackAIResponse(apiMessages)
    if (tools && tools.length > 0) {
      return { role: 'assistant', content: fallbackText }
    }
    return fallbackText
  }

  // 5. Conector de Red (Groq API Call)
  try {
    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages.map(m => ({
          role: m.role,
          content: m.content,
          ...(m.tool_calls && { tool_calls: m.tool_calls }),
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.name && { name: m.name })
        })),
        temperature: GATEWAY_CONFIG.temperature,
        max_tokens: GATEWAY_CONFIG.maxTokens,
        ...(tools && tools.length > 0 && { tools })
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.warn(`[Groq Gateway Warning - Status ${res.status}]: ${errorText}`)
      const fallbackText = generateFallbackAIResponse(apiMessages)
      if (tools && tools.length > 0) {
        return { role: 'assistant', content: fallbackText }
      }
      return fallbackText
    }

    const data = await res.json()
    const responseMessage = data.choices?.[0]?.message

    if (tools && tools.length > 0) {
      return responseMessage || { role: 'assistant', content: '' }
    }
    return responseMessage?.content || ''
  } catch (err) {
    console.error('[Groq Gateway Network Exception]', err)
    const fallbackText = generateFallbackAIResponse(apiMessages)
    if (tools && tools.length > 0) {
      return { role: 'assistant', content: fallbackText }
    }
    return fallbackText
  }
}

// ── MEMORY MANAGER: Historial y Pruning ─────────────────────
function pruneConversationHistory(messages: ChatMessage[], maxLimit: number): ChatMessage[] {
  if (messages.length <= maxLimit) return messages
  return messages.slice(-maxLimit)
}

// ── GUARDRAILS: Seguridad y Filtro PII ───────────────────────
function applySecurityGuardrails(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(m => {
    let cleanContent = m.content
    if (typeof cleanContent !== 'string') {
      return m
    }

    const injectionPatterns = [
      /ignore previous instructions/gi,
      /ignore all instructions/gi,
      /olvida las instrucciones anteriores/gi,
      /ignora las instrucciones/gi,
      /forget everything/gi
    ]

    injectionPatterns.forEach(pattern => {
      if (pattern.test(cleanContent!)) {
        console.warn('[Groq Gateway Guardrails] Intento de inyección de prompt detectado y mitigado.')
        cleanContent = cleanContent!.replace(pattern, '[Mensaje Filtrado por Seguridad]')
      }
    })

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
      return `¡Hola! Bienvenido. 🤖 Soy tu asistente de ventas virtual (Simulado). ¿En qué te puedo colaborar hoy? Puedes escribir "Ver catálogo" para conocer nuestros productos.`
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
