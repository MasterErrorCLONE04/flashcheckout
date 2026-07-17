import { NextResponse } from 'next/server'
import { generateOpenRouterCompletion, ChatMessage } from '@/lib/ai/openrouter'
import { parseJsonBody } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

const FLASHY_SYSTEM_PROMPT = `Eres Flashy, el agente inteligente y consultor de ventas oficial de Flashcheckouts. Tu rol es atender a los visitantes de la landing page pÃƒÂºblica.
Tu personalidad es entusiasta, persuasiva, veloz, muy amable y profesional.
Tu meta es explicar quÃƒÂ© es Flashcheckouts, resolver dudas de clientes potenciales (precios, integraciones de pago, funcionamiento tÃƒÂ©cnico) y convencerlos de registrarse gratis en la plataforma.

REGLAS CRÃƒÂTICAS:
1. Responde SIEMPRE en espaÃƒÂ±ol.
2. SÃƒÂ© estructurado, conciso y directo en tus respuestas. Usa viÃƒÂ±etas para listar informaciÃƒÂ³n.
3. Formatea con negritas las palabras clave y secciones importantes para mejorar la legibilidad.
4. Escribe de manera persuasiva e invita al usuario a probar gratis la plataforma con frases atractivas al final de tus respuestas.

InformaciÃƒÂ³n clave de Flashcheckouts para responder:
- Ã‚Â¿QuÃƒÂ© es?: Una plataforma SaaS que automatiza ventas de e-commerce por WhatsApp. Ofrece un catÃƒÂ¡logo digital interactivo y un agente de IA que atiende clientes, responde preguntas de inventario, arma carritos y envÃƒÂ­a links de pago automÃƒÂ¡ticos 24/7.
- Integraciones de pago: Stripe y MercadoPago integrados de forma nativa para recibir tarjetas de crÃƒÂ©dito/dÃƒÂ©bito y transferencias bancarias locales.
- Planes y Precios:
  * Plan Gratis (Free Terminal): $0/mes. Permite subir hasta 10 productos activos, pasarelas de pago y checkout rÃƒÂ¡pido.
  * Plan Pro: $10/mes (o $8/mes facturado anualmente). Desbloquea productos ilimitados, tu propio Agente de IA para WhatsApp personalizado y campaÃƒÂ±as de recuperaciÃƒÂ³n de carritos abandonados de forma automÃƒÂ¡tica.
- CÃƒÂ³mo probarlo: No requiere agendar videollamadas. El usuario puede registrarse gratis en menos de 2 minutos visitando /sign-up y vinculando su telÃƒÂ©fono escaneando un cÃƒÂ³digo QR.`

const getSpanishFallbackResponse = (input: string): string => {
  const text = input.toLowerCase()
  
  if (text.includes('hola') || text.includes('buen') || text.includes('saludo') || text.includes('hi') || text.includes('hello')) {
    return "Ã°Å¸â€˜â€¹ Ã‚Â¡Hola! Soy **Flashy**, tu asistente inteligente de Flashcheckouts. Ã‚Â¿En quÃƒÂ© puedo ayudarte hoy?\n\nPregÃƒÂºntame sobre:\n* Ã‚Â¿QuÃƒÂ© es Flashcheckouts y cÃƒÂ³mo funciona?\n* MÃƒÂ©todos de pago e integraciones (Stripe / MercadoPago).\n* Planes y precios (Plan Gratis vs Pro).\n* CÃƒÂ³mo probarlo gratis hoy mismo.";
  }
  
  if (text.includes('precio') || text.includes('plan') || text.includes('cost') || text.includes('gratis') || text.includes('free') || text.includes('suscrip') || text.includes('cobro')) {
    return "Ã°Å¸Å½Â **Flashcheckouts tiene planes adaptados a tu negocio:**\n\n* **Plan Gratis (Free Terminal):** Es 100% gratuito. Te permite vender hasta 10 productos activos con un checkout rÃƒÂ¡pido y profesional.\n* **Plan Pro ($10/mes o $8/mes anual):** Desbloquea productos ilimitados, tu propio **Agente de IA para responder por WhatsApp**, y campaÃƒÂ±as automÃƒÂ¡ticas para recuperar carritos abandonados.\n\nÃ°Å¸â€˜â€° Puedes iniciar gratis sin ingresar tarjetas [registrÃƒÂ¡ndote aquÃƒÂ­](/sign-up).";
  }

  if (text.includes('integrac') || text.includes('pago') || text.includes('stripe') || text.includes('mercadopago') || text.includes('tarjeta') || text.includes('banco') || text.includes('recibir')) {
    return "Ã°Å¸â€Å’ **Flashcheckouts se integra directamente con las principales pasarelas de pago:**\n\n* **Stripe:** Para cobros con tarjetas de crÃƒÂ©dito y dÃƒÂ©bito a nivel global de forma segura.\n* **MercadoPago:** Para recibir tarjetas y pagos locales segÃƒÂºn tu paÃƒÂ­s.\n\nAmbas opciones se conectan en un par de clics desde tu panel de configuraciÃƒÂ³n.";
  }

  if (text.includes('demo') || text.includes('probar') || text.includes('registro') || text.includes('cuenta') || text.includes('probarlo') || text.includes('empezar') || text.includes('crear')) {
    return "Ã¢Å¡Â¡ **Ã‚Â¿Quieres ver cÃƒÂ³mo funciona en tu WhatsApp?**\n\nNo necesitas agendar una videollamada ni esperar dÃƒÂ­as. Puedes probarlo tÃƒÂº mismo ahora mismo:\n\n1. [**Crea tu tienda gratis en 2 minutos**](/sign-up).\n2. Sube un producto de prueba.\n3. Vincula tu WhatsApp escaneando el cÃƒÂ³digo QR.\n4. Ã‚Â¡Listo! Escribe a tu WhatsApp para ver a la IA responder y enviar links de pago de inmediato.";
  }

  if (text.includes('whatsapp') || text.includes('como funciona') || text.includes('que es') || text.includes('ayuda') || text.includes('que hace') || text.includes('ai') || text.includes('agente')) {
    return "Ã¢Å¡Â¡ **Flashcheckouts** convierte tu WhatsApp en un canal de ventas automatizado:\n\n1. **CatÃƒÂ¡logo Digital:** Te generamos una tienda web ligera y optimizada.\n2. **Agente de IA:** Un chatbot avanzado (Nova) atiende tus chats de WhatsApp, responde sobre inventarios, arma carritos y envÃƒÂ­a links de pago para finalizar la compra automÃƒÂ¡ticamente.\n3. **Cierre de Ventas:** El cliente paga de forma segura a travÃƒÂ©s de Stripe o MercadoPago y el pedido se registra al instante.";
  }

  return "Ã°Å¸â€™Â¡ **Flashcheckouts** te ayuda a automatizar tus ventas por WhatsApp.\n\nPrueba preguntÃƒÂ¡ndome algo como:\n* *Ã‚Â¿QuÃƒÂ© planes y precios tienen?*\n* *Ã‚Â¿CÃƒÂ³mo se integra con Stripe o MercadoPago?*\n* *Ã‚Â¿CÃƒÂ³mo puedo probarlo gratis?*\n* *Ã‚Â¿QuÃƒÂ© es y cÃƒÂ³mo funciona el agente de WhatsApp?*";
}

export async function POST(req: Request) {
  try {
    const body = await parseJsonBody<{ message?: string; history?: Array<{ role: string; content: string }> }>(req)
    const userMessage = body?.message?.trim() || ''

    if (!userMessage) {
      return NextResponse.json({ text: 'Por favor, escribe un mensaje vÃƒÂ¡lido.' }, { status: 400 })
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
    if (!finalResponse || finalResponse.includes('[OpenRouter Gateway]') || finalResponse.includes('Ã°Å¸Â¤â€“ Soy tu asistente de ventas virtual')) {
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
