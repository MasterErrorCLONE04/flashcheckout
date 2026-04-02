/** COP es moneda sin decimales en Stripe (zero-decimal). */
export function copPlatformFeeFromTotal(totalCop: number): number {
  const raw = process.env.STRIPE_PLATFORM_FEE_PERCENT
  const pct = raw ? Number.parseFloat(raw) : 0
  if (!Number.isFinite(pct) || pct <= 0) return 0
  return Math.floor((totalCop * pct) / 100)
}
