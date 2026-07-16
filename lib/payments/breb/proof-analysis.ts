export type BrebProofExtraction = {
  bank_origin: string | null
  destination_key: string | null
  amount: number | null
  transaction_id: string | null
  datetime: string | null
  is_success_screen: boolean
}

export type BrebProofDecision = {
  decision: 'AUTO_APPROVED' | 'MANUAL_REVIEW' | 'REJECTED'
  confidence: number
  reasons: string[]
}

export const BREB_PROOF_EXTRACTION_PROMPT = `Analiza la siguiente captura de pantalla de un comprobante de pago bancario en Colombia (Nequi, Bancolombia, Daviplata, Dale, Movii, Lulo, etc.).
Extrae y devuelve estrictamente un objeto JSON con la siguiente estructura. Si un dato no es visible, ponlo como null. No agregues texto markdown adicional.

{
  "bank_origin": "string (ej. Nequi, Bancolombia)",
  "destination_key": "string (el numero, correo o id al que se envio)",
  "amount": "number (solo el valor numerico, ej. 45000)",
  "transaction_id": "string (ID de transaccion, numero de aprobacion o referencia)",
  "datetime": "string (ISO 8601 o fecha y hora visible)",
  "is_success_screen": "boolean (true si la transaccion fue exitosa, false si esta pendiente, rechazada o es solo el resumen de preparacion)"
}`

export function evaluateBrebProof({
  extraction,
  expectedAmount,
  expectedDestinationKey,
  createdAt,
  freshnessWindowMs,
}: {
  extraction: BrebProofExtraction
  expectedAmount: number
  expectedDestinationKey: string
  createdAt: Date
  freshnessWindowMs: number
}): BrebProofDecision {
  const reasons: string[] = []

  if (!extraction.is_success_screen) reasons.push('El comprobante no parece una transaccion exitosa.')
  if (!extraction.transaction_id) reasons.push('No se detecto un ID de transaccion.')
  if (extraction.amount !== expectedAmount) reasons.push('El monto detectado no coincide con la orden.')

  const destination = normalizeProofText(extraction.destination_key || '')
  const expectedDestination = normalizeProofText(expectedDestinationKey)
  if (!destination || !destination.includes(expectedDestination)) {
    reasons.push('La cuenta o llave destino no coincide con la tienda.')
  }

  const detectedDate = extraction.datetime ? new Date(extraction.datetime) : null
  if (!detectedDate || Number.isNaN(detectedDate.getTime())) {
    reasons.push('No se pudo validar la fecha del comprobante.')
  } else {
    const diff = Math.abs(detectedDate.getTime() - createdAt.getTime())
    if (diff > freshnessWindowMs) {
      reasons.push('El comprobante esta fuera de la ventana de tiempo permitida.')
    }
  }

  if (reasons.length === 0) {
    return { decision: 'AUTO_APPROVED', confidence: 0.95, reasons: [] }
  }

  return {
    decision: reasons.length <= 2 ? 'MANUAL_REVIEW' : 'REJECTED',
    confidence: Math.max(0.2, 0.9 - reasons.length * 0.2),
    reasons,
  }
}

function normalizeProofText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9@._-]/g, '')
}
