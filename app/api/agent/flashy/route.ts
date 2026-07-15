import { NextResponse } from 'next/server'
import { generateOpenRouterCompletion, ChatMessage } from '@/lib/ai/openrouter'
import { parseJsonBody } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

const FLASHY_SYSTEM_PROMPT = `Eres Flashy, el agente inteligente y consultor de ventas oficial de FlashCheckout. Tu rol es atender a los visitantes de la landing page pública.
Tu personalidad es entusiasta, persuasiva, veloz, muy amable y profesional.
Tu meta es explicar qué es FlashCheckout, resolver dudas de clientes potenciales (precios, integraciones de pago, funcionamiento técnico) y convencerlos de registrarse gratis en la plataforma.

REGLAS CRÍTICAS:
1. Responde SIEMPRE en español.
2. Sé estructurado, conciso y directo en tus respuestas. Usa viñetas para listar información.
3. Formatea con negritas las palabras clave y secciones importantes para mejorar la legibilidad.
4. Escribe de manera persuasiva e invita al usuario a probar gratis la plataforma con frases atractivas al final de tus respuestas.

Información clave de FlashCheckout para responder:
- ¿Qué es?: Una plataforma SaaS que automatiza ventas de e-commerce por WhatsApp. Ofrece un catálogo digital interactivo y un agente de IA que atiende clientes, responde preguntas de inventario, arma carritos y envía links de pago automáticos 24/7.
- Integraciones de pago: Stripe y MercadoPago integrados de forma nativa para recibir tarjetas de crédito/débito y transferencias bancarias locales.
- Planes y Precios:
  * Plan Gratis (Free Terminal): $0/mes. Permite subir hasta 10 productos activos, pasarelas de pago y checkout rápido.
  * Plan Pro: $10/mes (o $8/mes facturado anualmente). Desbloquea productos ilimitados, tu propio Agente de IA para WhatsApp personalizado y campañas de recuperación de carritos abandonados de forma automática.
- Cómo probarlo: No requiere agendar videollamadas. El usuario puede registrarse gratis en menos de 2 minutos visitando /sign-up y vinculando su teléfono escaneando un código QR.`

const getSpanishFallbackResponse = (input: string): string => {
  const text = input.toLowerCase()
  
  if (text.includes('hola') || text.includes('buen') || text.includes('saludo') || text.includes('hi') || text.includes('hello')) {
    return "👋 ¡Hola! Soy **Flashy**, tu asistente inteligente de FlashCheckout. ¿En qué puedo ayudarte hoy?\n\nPregúntame sobre:\n* ¿Qué es FlashCheckout y cómo funciona?\n* Métodos de pago e integraciones (Stripe / MercadoPago).\n* Planes y precios (Plan Gratis vs Pro).\n* Cómo probarlo gratis hoy mismo.";
  }
  
  if (text.includes('precio') || text.includes('plan') || text.includes('cost') || text.includes('gratis') || text.includes('free') || text.includes('suscrip') || text.includes('cobro')) {
    return "🎁 **FlashCheckout tiene planes adaptados a tu negocio:**\n\n* **Plan Gratis (Free Terminal):** Es 100% gratuito. Te permite vender hasta 10 productos activos con un checkout rápido y profesional.\n* **Plan Pro ($10/mes o $8/mes anual):** Desbloquea productos ilimitados, tu propio **Agente de IA para responder por WhatsApp**, y campañas automáticas para recuperar carritos abandonados.\n\n👉 Puedes iniciar gratis sin ingresar tarjetas [registrándote aquí](/sign-up).";
  }

  if (text.includes('integrac') || text.includes('pago') || text.includes('stripe') || text.includes('mercadopago') || text.includes('tarjeta') || text.includes('banco') || text.includes('recibir')) {
    return "🔌 **FlashCheckout se integra directamente con las principales pasarelas de pago:**\n\n* **Stripe:** Para cobros con tarjetas de crédito y débito a nivel global de forma segura.\n* **MercadoPago:** Para recibir tarjetas y pagos locales según tu país.\n\nAmbas opciones se conectan en un par de clics desde tu panel de configuración.";
  }

  if (text.includes('demo') || text.includes('probar') || text.includes('registro') || text.includes('cuenta') || text.includes('probarlo') || text.includes('empezar') || text.includes('crear')) {
    return "⚡ **¿Quieres ver cómo funciona en tu WhatsApp?**\n\nNo necesitas agendar una videollamada ni esperar días. Puedes probarlo tú mismo ahora mismo:\n\n1. [**Crea tu tienda gratis en 2 minutos**](/sign-up).\n2. Sube un producto de prueba.\n3. Vincula tu WhatsApp escaneando el código QR.\n4. ¡Listo! Escribe a tu WhatsApp para ver a la IA responder y enviar links de pago de inmediato.";
  }

  if (text.includes('whatsapp') || text.includes('como funciona') || text.includes('que es') || text.includes('ayuda') || text.includes('que hace') || text.includes('ai') || text.includes('agente')) {
    return "⚡ **FlashCheckout** convierte tu WhatsApp en un canal de ventas automatizado:\n\n1. **Catálogo Digital:** Te generamos una tienda web ligera y optimizada.\n2. **Agente de IA:** Un chatbot avanzado (Nova) atiende tus chats de WhatsApp, responde sobre inventarios, arma carritos y envía links de pago para finalizar la compra automáticamente.\n3. **Cierre de Ventas:** El cliente paga de forma segura a través de Stripe o MercadoPago y el pedido se registra al instante.";
  }

  return "💡 **FlashCheckout** te ayuda a automatizar tus ventas por WhatsApp.\n\nPrueba preguntándome algo como:\n* *¿Qué planes y precios tienen?*\n* *¿Cómo se integra con Stripe o MercadoPago?*\n* *¿Cómo puedo probarlo gratis?*\n* *¿Qué es y cómo funciona el agente de WhatsApp?*";
}

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody<{ message?: string; history?: Array<{ role: string; content: string }> }>(req)
    const userMessage = body?.message?.trim() || ''

    if (!userMessage) {
      return NextResponse.json({ text: 'Por favor, escribe un mensaje válido.' }, { status: 400 })
    }

    const history = Array.isArray(body?.history) ? body.history : []
    const messages: ChatMessage[] = history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content || ''
    }))

    // Add current user query
    messages.push({ role: 'user', content: userMessage })

    // Call central AI OpenRouter Gateway
    const response = await generateOpenRouterCompletion(
      messages,
      FLASHY_SYSTEM_PROMPT,
      undefined,
      undefined
    )

    let finalResponse = ''
    if (typeof response === 'string') {
      finalResponse = response.trim()
    } else if (response && typeof response === 'object' && response.content) {
      finalResponse = response.content.trim()
    }

    // Check if OpenRouter failed and returned generic simulated response
    if (!finalResponse || finalResponse.includes('[OpenRouter Gateway]') || finalResponse.includes('🤖 Soy tu asistente de ventas virtual')) {
      console.log('[Flashy API] Using custom detailed Spanish fallback response.')
      finalResponse = getSpanishFallbackResponse(userMessage)
    }

    return NextResponse.json({ text: finalResponse })
  } catch (error) {
    console.error('Flashy Chatbot API Error:', error)
    // Absolute fallback so the user always gets a correct Spanish response
    const query = (await req.clone().json().catch(() => ({}))).message || ''
    return NextResponse.json({ text: getSpanishFallbackResponse(query) })
  }
}
