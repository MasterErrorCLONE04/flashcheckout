export function buildBrebPaymentReference(orderId: string) {
  const suffix = orderId.replace(/[^a-zA-Z0-9]/g, '').slice(-10).toUpperCase()
  return `FC${suffix}`.slice(0, 25)
}

export function getBrebProofFreshnessWindowMs() {
  const minutes = Number.parseInt(process.env.BREB_PROOF_WINDOW_MINUTES || '10', 10)
  const safeMinutes = Number.isFinite(minutes) ? Math.max(1, Math.min(minutes, 60)) : 10
  return safeMinutes * 60 * 1000
}
