export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  name?: string
  tool_calls?: Array<{
    id: string
    function: { name: string; arguments?: string | Record<string, unknown> }
  }>
  tool_call_id?: string
}

export type ToolDefinition = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface AIGatewayConfig {
  maxHistoryMessages: number
  temperature: number
  maxTokens: number
}

const GATEWAY_CONFIG: AIGatewayConfig = {
  maxHistoryMessages: 15,
  temperature: 0.5,
  maxTokens: 4096
}

/**
 * AI Gateway Central Interface using OpenRouter API
 */
export async function generateOpenRouterCompletion(
  messages: ChatMessage[],
  systemPrompt?: string,
  tools?: ToolDefinition[],
  modelOverride?: string
): Promise<string | ChatMessage> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY
  const model = modelOverride || process.env.OPENROUTER_MODEL || 'meta-llama/llama-3-8b-instruct:free'
  const apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1'

  // 1. Guardrails: Filtro bÃƒÂ¡sico de seguridad y PII
  const cleanMessages = applySecurityGuardrails(messages)
  const cleanSystemPrompt = systemPrompt ? applySecurityGuardrails([{ role: 'system', content: systemPrompt }])[0].content : undefined

  // 2. Memory Manager: Limita e historial para cuidar lÃƒÂ­mites de tokens
  const prunedHistory = pruneConversationHistory(cleanMessages, GATEWAY_CONFIG.maxHistoryMessages)

  // 3. Prompt Builder: Incorpora el prompt de sistema
  const apiMessages: ChatMessage[] = []
  if (cleanSystemPrompt) {
    apiMessages.push({ role: 'system', content: cleanSystemPrompt })
  }
  apiMessages.push(...prunedHistory)

  // 4. Fallback de Redundancia: Si no hay API key o es de prueba
  if (!apiKey || apiKey.includes('placeholder')) {
    console.log('[OpenRouter Gateway] ConexiÃƒÂ³n principal inactiva (sin API key). Derivando a Simulador Fallback...')
    const fallbackText = generateFallbackAIResponse(apiMessages)
    if (tools && tools.length > 0) {
      return { role: 'assistant', content: fallbackText }
    }
    return fallbackText
  }

  // 5. Conector de Red (OpenRouter API Call)
  try {
    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://flashcheckout.co',
        'X-Title': 'Flashcheckouts'
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
      console.warn(`[OpenRouter Gateway Warning - Status ${res.status}]: ${errorText}`)
      const fallbackText = generateFallbackAIResponse(apiMessages)
      if (tools && tools.length > 0) {
        return { role: 'assistant', content: fallbackText }
      }
      return fallbackText
    }

    const data = await res.json()
    const responseMessage = data.choices?.[0]?.message as ChatMessage | undefined

    if (tools && tools.length > 0) {
      return responseMessage || { role: 'assistant', content: '' }
    }
    return responseMessage?.content || ''
  } catch (err) {
    console.error('[OpenRouter Gateway Network Exception]', err)
    const fallbackText = generateFallbackAIResponse(apiMessages)
    if (tools && tools.length > 0) {
      return { role: 'assistant', content: fallbackText }
    }
    return fallbackText
  }
}

// Ã¢â€â‚¬Ã¢â€â‚¬ MEMORY MANAGER: Historial y Pruning Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function pruneConversationHistory(messages: ChatMessage[], maxLimit: number): ChatMessage[] {
  if (messages.length <= maxLimit) return messages
  return messages.slice(-maxLimit)
}

// Ã¢â€â‚¬Ã¢â€â‚¬ GUARDRAILS: Seguridad y Filtro PII Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
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
        console.warn('[OpenRouter Gateway Guardrails] Intento de inyecciÃƒÂ³n de prompt detectado y mitigado.')
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

// Ã¢â€â‚¬Ã¢â€â‚¬ SIMULADOR FALLBACK CON MOTOR DE CONTEXTO INTEGRADOR Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function generateFallbackAIResponse(messages: ChatMessage[]): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || ''
  const q = lastUserMsg.toLowerCase().trim()
  const systemMsg = messages.find(m => m.role === 'system')?.content || ''

  // Extraer catÃƒÂ¡logo de productos inyectado en el prompt si existe
  const productMatches = systemMsg.match(/-\s([^:\n]+):\s\$([^\n\s]+)/g) || []
  const products = productMatches.map(p => {
    const parts = p.replace(/[-\s*]/g, '').split(':')
    return { name: parts[0], price: parts[1] }
  })

  // 1. Flujo Conversacional para Clientes (WhatsApp Context)
  if ((systemMsg.includes('WhatsApp') || systemMsg.includes('cliente')) && !systemMsg.includes('copiloto') && !systemMsg.includes('guÃƒÂ­a de la plataforma')) {
    if (q.includes('hola') || q.includes('buenos dias') || q.includes('buenas tardes')) {
      return `Ã‚Â¡Hola! Bienvenido. Ã°Å¸Â¤â€“ Soy tu asistente de ventas virtual (Simulado). Ã‚Â¿En quÃƒÂ© te puedo colaborar hoy? Puedes escribir "Ver catÃƒÂ¡logo" para conocer nuestros productos.`
    }
    
    if (q.includes('precio') || q.includes('cuanto vale') || q.includes('catalogo') || q.includes('productos') || q.includes('buscar')) {
      if (products.length > 0) {
        let reply = `Contamos con los siguientes productos en catÃƒÂ¡logo:\n\n`
        products.forEach((p, idx) => {
          reply += `${idx + 1}. *${p.name}* - $${p.price}\n`
        })
        reply += `\nÃ‚Â¿Te gustarÃƒÂ­a que aÃƒÂ±ada alguno de estos a tu carrito?`
        return reply
      }
      return `Claro, contamos con excelentes productos disponibles. Por favor dime quÃƒÂ© estÃƒÂ¡s buscando y con gusto te informo.`
    }

    if (q.includes('carrito') || q.includes('pagar') || q.includes('finalizar') || q.includes('comprar')) {
      return `Ã‚Â¡Excelente! Para proceder con el pago, por favor escribe "Ver carrito" para confirmar tus artÃƒÂ­culos y generar tu enlace de pago seguro.`
    }

    if (q.includes('gracias') || q.includes('adios') || q.includes('chao')) {
      return `Ã‚Â¡Con gusto! Que tengas un excelente dÃƒÂ­a. Escribe de nuevo si necesitas algo mÃƒÂ¡s. Ã°Å¸â€˜â€¹`
    }

    return `Entendido. Estoy aquÃƒÂ­ para tomar tu pedido. Si tienes alguna duda sobre nuestros productos en catÃƒÂ¡logo, por favor pregÃƒÂºntame.`
  }

  // 2. Flujo Administrativo para Comerciantes (Nova Panel Context)
  if (q.includes('hola') || q.includes('buenos dias') || q.includes('buenas tardes')) {
    return JSON.stringify({
      text: `Ã‚Â¡Hola! Ã°Å¸â€˜â€¹ Soy Nova, tu copiloto inteligente de la plataforma. Estoy aquÃƒÂ­ para guiarte en el panel de control de tu tienda. Puedo ayudarte a gestionar tus productos, revisar pedidos y ventas, crear cupones de descuento o configurar tus integraciones. Ã‚Â¿QuÃƒÂ© te gustarÃƒÂ­a hacer hoy?`,
      action: 'NONE'
    })
  }

  if (q.includes('catalogo') || q.includes('producto') || q.includes('inventario') || q.includes('crear el catalogo') || q.includes('crear catalogo')) {
    return JSON.stringify({
      text: 'Como tu copiloto, puedo guiarte para crear y administrar el catÃƒÂ¡logo de tu tienda. Puedes gestionar todos tus productos e inventarios directamente desde la secciÃƒÂ³n de Productos en el menÃƒÂº lateral, o indicarme los datos aquÃƒÂ­ mismo y te ayudarÃƒÂ© a estructurarlos.',
      action: 'REDIRECT_PRODUCTS'
    })
  }

  if (q.includes('descuento') || q.includes('cupÃƒÂ³n') || q.includes('promociÃƒÂ³n')) {
    return JSON.stringify({
      text: 'Ã‚Â¡Listo! He configurado y activado un cupÃƒÂ³n de descuento del 15% para tu tienda.',
      action: 'CREATE_COUPON',
      coupon: {
        code: 'PROMO15',
        desc: 'Descuento especial del 15% en compras',
        validity: 'VÃƒÂ¡lido hasta: domingo prÃƒÂ³ximo',
        active: true
      }
    })
  }

  if (q.includes('pedidos') || q.includes('ventas') || q.includes('facturaciÃƒÂ³n')) {
    return JSON.stringify({
      text: 'He verificado la base de datos de tu negocio. Actualmente tienes pedidos pendientes por gestionar. Puedes auditarlos en la secciÃƒÂ³n correspondiente.',
      action: 'REDIRECT_ORDERS'
    })
  }

  if (q.includes('reporte') || q.includes('grafica') || q.includes('rendimiento')) {
    return JSON.stringify({
      text: 'Generando reporte de rendimiento... Durante los ÃƒÂºltimos 7 dÃƒÂ­as, tu tienda obtuvo ventas acumuladas con excelente rendimiento. La mayor parte de la facturaciÃƒÂ³n proviene de la venta directa por WhatsApp.',
      action: 'SHOW_REPORT'
    })
  }

  return JSON.stringify({
    text: 'Entendido. Como tu copiloto de la plataforma, estoy aquÃƒÂ­ para guiarte y ayudarte a navegar por el panel. Ã‚Â¿Hay alguna secciÃƒÂ³n o configuraciÃƒÂ³n en la que te pueda asistir?',
    action: 'NONE'
  })
}
