export interface ProductContext {
  id: string
  name: string
  price: number
  description?: string
  category?: string
  imageUrl?: string | null
}

export interface CouponContext {
  code: string
  desc: string
  valor: string
  tipoDesc?: string
}

export type CreativeMode = 'DYNAMIC_REEL' | 'GENERATIVE_I2V' | 'AVATAR_UGC'
export type CreativeTone = 'urgency' | 'luxury' | 'casual' | 'educational'

export function buildStudioSystemPrompt(mode: CreativeMode, tone: CreativeTone): string {
  const toneDescriptions: Record<CreativeTone, string> = {
    urgency: 'Enfócate en la escasez, oferta relámpago, tiempo limitado y llamado a la acción inmediato.',
    luxury: 'Enfócate en la exclusividad, elegancia, calidad superior y sensación de distinción.',
    casual: 'Tono amigable, fresco, de conversación cercana entre amigos con emojis y lenguaje cotidiano en español latinoamericano.',
    educational: 'Enfócate en resolver un problema concreto del cliente, explicando cómo el producto lo soluciona paso a paso.'
  }

  const modeDescriptions: Record<CreativeMode, string> = {
    DYNAMIC_REEL: `Estás creando un Reel de Venta Rápida de E-Commerce (15 a 20 segundos) diseñado para detener el scroll.
Debe tener un gancho visual impactante de 3 segundos, destacar el precio y el beneficio principal, y cerrar con un llamado de compra directo.`,
    GENERATIVE_I2V: `Estás creando un comercial cinemático de producto con ambientación visual de alto impacto (15 a 25 segundos).
El guión debe inspirar sensaciones visuales y emocionales mientras destaca las cualidades clave del producto.`,
    AVATAR_UGC: `Estás creando un video estilo UGC (User Generated Content) o testimonio espontáneo de un creador de contenido (20 a 30 segundos).
Debe sonar como una persona real recomendando su nueva compra favorita sin sonar a anuncio aburrido.`
  }

  return `Eres el Director Creativo y Copywriter de Alto Impacto para E-commerce en Flashcheckout.
${modeDescriptions[mode]}

Pautas de redacción:
- Tono: ${toneDescriptions[tone]}
- La moneda es pesos colombianos (COP). Muestra el precio formateado amigablemente.
- El texto debe atrapar la atención en los primeros 3 segundos.
- Devuelve SIEMPRE y ÚNICAMENTE una respuesta en formato JSON estrictamente válido, sin texto adicional ni bloques markdown externos.

El JSON debe tener la siguiente estructura exacta:
{
  "hook": "Texto corto y contundente para los primeros 3 segundos que aparecerá grande en pantalla (máx 10 palabras)",
  "script": "Guion completo de locución para la voz en off o avatar (aprox. 40-70 palabras)",
  "copyInstagram": "Copy persuasivo para el pie de foto de Instagram/TikTok con emojis, beneficios y llamados a la acción",
  "copyWhatsApp": "Mensaje optimizado para difusión o estado de WhatsApp con negritas (*texto*) y llamado a escribir o tocar el link",
  "hashtags": ["#Etiqueta1", "#Etiqueta2", "#Etiqueta3", "#Etiqueta4", "#Etiqueta5"],
  "callToAction": "Texto breve para el botón de compra (ej: 'Pedir con Envío Gratis Hoy')"
}`
}

export function buildStudioUserPrompt(
  product: ProductContext,
  storeName: string,
  storeSlug: string,
  coupon?: CouponContext | null
): string {
  const formattedPrice = `$${product.price.toLocaleString('es-CO')}`
  const checkoutUrl = `https://flashcheckout.co/tienda/${storeSlug}`
  
  let prompt = `Genera el contenido publicitario para el siguiente producto:
- Tienda: ${storeName}
- Producto: ${product.name}
- Precio: ${formattedPrice}
- Categoría: ${product.category || 'General'}
- Descripción: ${product.description || 'Producto destacado de alta calidad.'}
- Enlace de compra directo: ${checkoutUrl}`

  if (coupon) {
    prompt += `\n- PROMOCIÓN / CUPÓN ACTIVO: Usa el código '${coupon.code}' para obtener ${coupon.valor} (${coupon.desc}). ¡Destácalo con fuerza en el guión!`
  }

  return prompt
}
