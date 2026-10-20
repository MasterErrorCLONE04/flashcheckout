/**
 * Cliente de Replicate para Studio IA
 * Permite ejecutar modelos de visión por computador, remoción de fondo,
 * generación de escenarios fotográficos con FLUX y video generativo.
 */

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output: any
  error?: string | null
}

const REPLICATE_API_BASE = 'https://api.replicate.com/v1'

/**
 * Ejecuta una predicción en Replicate esperando el resultado
 */
export async function runReplicateModel(
  modelPath: string, // ej: "briaai/rmbg-1.4" o "black-forest-labs/flux-schnell"
  input: Record<string, any>,
  maxWaitSeconds: number = 55
): Promise<{ success: boolean; output: any; error?: string }> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return {
      success: false,
      output: null,
      error: 'REPLICATE_API_TOKEN no está configurado en las variables de entorno.'
    }
  }

  try {
    // 1. Iniciar predicción con header 'Prefer: wait' para resolución instantánea
    const startRes = await fetch(`${REPLICATE_API_BASE}/models/${modelPath}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: `wait=${Math.min(maxWaitSeconds, 60)}`
      },
      body: JSON.stringify({ input })
    })

    const initialData: ReplicatePrediction = await startRes.json()

    if (!startRes.ok) {
      const errMsg = (initialData as any)?.detail || (initialData as any)?.title || 'Error al invocar modelo de Replicate'
      return { success: false, output: null, error: errMsg }
    }

    // Si ya terminó de inmediato gracias a 'Prefer: wait'
    if (initialData.status === 'succeeded') {
      return { success: true, output: initialData.output }
    }

    if (initialData.status === 'failed' || initialData.status === 'canceled') {
      return { success: false, output: null, error: initialData.error || 'La generación fue cancelada o falló.' }
    }

    // 2. Si aún está procesando, hacer polling breve
    const predictionId = initialData.id
    const pollInterval = 2000
    const maxPolls = Math.ceil((maxWaitSeconds * 1000) / pollInterval)

    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, pollInterval))

      const pollRes = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (pollRes.ok) {
        const pollData: ReplicatePrediction = await pollRes.json()
        if (pollData.status === 'succeeded') {
          return { success: true, output: pollData.output }
        }
        if (pollData.status === 'failed' || pollData.status === 'canceled') {
          return { success: false, output: null, error: pollData.error || 'Generación fallida.' }
        }
      }
    }

    return {
      success: false,
      output: null,
      error: 'Tiempo de espera agotado al generar la imagen. Intenta de nuevo.'
    }
  } catch (err: any) {
    console.error('[Replicate Client Error]:', err)
    return {
      success: false,
      output: null,
      error: err.message || 'Error de conexión con el motor de IA.'
    }
  }
}
