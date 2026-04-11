export interface IntentResult {
  intent: 'QUERY' | 'CONFIRM' | 'CANCEL' | 'UNKNOWN';
  query?: string;
  metadata?: any;
}

/**
 * Procesa el mensaje del usuario para extraer la intención.
 * En un entorno real, esto llamaría a un LLM (Gemini/OpenAI).
 */
export async function parseIntent(text: string): Promise<IntentResult> {
  const normalized = text.toLowerCase().trim();

  // 1. Detección por Keywords (Rápida y Determinista)
  if (normalized.includes('quiero') || normalized.includes('necesito') || normalized.includes('busco')) {
    // Extraer lo que sigue después del verbo (ej: "quiero una pizza" -> "pizza")
    const query = normalized
      .replace(/quiero|necesito|busco|un|una|servicios|servicio|de/g, '')
      .trim();
    
    return { intent: 'QUERY', query };
  }

  if (['si', 'confirmar', 'dale', 'comprar', 'pagar'].some(k => normalized.includes(k))) {
    return { intent: 'CONFIRM' };
  }

  if (['no', 'cancelar', 'quitar'].some(k => normalized.includes(k))) {
    return { intent: 'CANCEL' };
  }

  // 2. IA Placeholder (Aquí se podría integrar callGemini())
  // Por ahora devolvemos QUERY si hay texto descriptivo
  if (normalized.length > 3) {
    return { intent: 'QUERY', query: normalized };
  }

  return { intent: 'UNKNOWN' };
}

/**
 * Ejemplo de cómo se integraría con un LLM en el futuro
 */
async function callAI(text: string) {
  // const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GOOGLE_AI_KEY, { ... });
}
