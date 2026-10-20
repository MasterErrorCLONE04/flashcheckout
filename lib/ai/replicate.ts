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

const MODEL_VERSIONS: Record<string, string> = {
  'rembg': 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  'cjwbw/rembg': 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  'briaai/rmbg-1.4': 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
  'black-forest-labs/flux-schnell': 'c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e',
  'nightmareai/real-esrgan': 'b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
  'minimax/video-01': '5aa835260ff7f40f4069c41185f72036accf99e29957bb4a3b3a911f3b6c1912'
}

/**
 * Ejecuta una predicción en Replicate esperando el resultado
 */
export async function runReplicateModel(
  modelPath: string, // ej: "cjwbw/rembg" o "black-forest-labs/flux-schnell"
  input: Record<string, any>,
  maxWaitSeconds: number = 55
): Promise<{ success: boolean; output: any; error?: string; isBillingError?: boolean }> {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) {
    return {
      success: false,
      output: null,
      error: 'REPLICATE_API_TOKEN no está configurado en las variables de entorno.'
    }
  }

  try {
    const version = MODEL_VERSIONS[modelPath]
    const url = version 
      ? `${REPLICATE_API_BASE}/predictions` 
      : `${REPLICATE_API_BASE}/models/${modelPath}/predictions`

    const payload = version 
      ? { version, input } 
      : { input }

    // 1. Iniciar predicción con header 'Prefer: wait' para resolución instantánea
    const startRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: `wait=${Math.min(maxWaitSeconds, 60)}`
      },
      body: JSON.stringify(payload)
    })

    const initialData: ReplicatePrediction = await startRes.json()

    if (!startRes.ok) {
      if (startRes.status === 402 || (initialData as any)?.title === 'Insufficient credit') {
        return {
          success: false,
          output: null,
          isBillingError: true,
          error: 'Tu cuenta de Replicate no tiene saldo disponible ($0 USD). Replicate requiere recargar al menos $5 USD en replicate.com/account/billing para ejecutar modelos de IA.'
        }
      }
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
