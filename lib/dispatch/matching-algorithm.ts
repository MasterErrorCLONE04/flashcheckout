import { prisma } from '@/lib/prisma'

export interface DriverScoreResult {
  driverId: string
  driverName: string
  phoneNumber: string
  distanceKm: number
  score: number
  breakdown: {
    distanceScore: number
    idleScore: number
    ratingScore: number
    workloadScore: number
  }
}

/**
 * Formula Haversine para calcular distancia entre 2 puntos geográficos en KM
 */
export function calculateDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radio de la Tierra en KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 100) / 100 // Redondear a 2 decimales
}

/**
 * Genera un PIN aleatorio de 4 dígitos para confirmación de entrega
 */
export function generateDeliveryPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Calcula el Dispatch Score (0 a 100 pts) para un repartidor
 */
export function computeDriverScore(params: {
  distanceKm: number
  lastActivityAt: Date | null
  rating: number
  activeOrdersCount: number
}): { score: number; breakdown: DriverScoreResult['breakdown'] } {
  const { distanceKm, lastActivityAt, rating, activeOrdersCount } = params

  // 1. Proximidad (40% peso) - Max 100 si está a 0km, decae 15 pts por km
  const distanceScore = Math.max(0, 100 - distanceKm * 15)

  // 2. Tiempo de espera (25% peso) - 5 pts por minuto transcurrido desde última actividad, max 100
  const minutesWaiting = lastActivityAt
    ? Math.max(0, (Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60))
    : 60 // Por defecto 60 min si no hay actividad previa
  const idleScore = Math.min(100, minutesWaiting * 5)

  // 3. Rating y reputación (20% peso)
  const ratingScore = Math.min(100, Math.max(0, (rating / 5.0) * 100))

  // 4. Carga de trabajo actual (15% peso)
  let workloadScore = 100
  if (activeOrdersCount === 1) workloadScore = 40
  else if (activeOrdersCount >= 2) workloadScore = 0

  // Ponderación Final
  const totalScore =
    distanceScore * 0.4 +
    idleScore * 0.25 +
    ratingScore * 0.2 +
    workloadScore * 0.15

  return {
    score: Math.round(totalScore * 10) / 10,
    breakdown: {
      distanceScore: Math.round(distanceScore),
      idleScore: Math.round(idleScore),
      ratingScore: Math.round(ratingScore),
      workloadScore: Math.round(workloadScore),
    },
  }
}

/**
 * Encuentra y clasifica todos los repartidores activos en el radio especificado
 */
export async function rankDriversForOrder(
  pickupLat: number,
  pickupLng: number,
  maxRadiusKm = 10
): Promise<DriverScoreResult[]> {
  // Obtener repartidores activos y disponibles con coordenadas válidas
  const availableDrivers = await prisma.driver.findMany({
    where: {
      active: true,
      available: true,
      currentLat: { not: null },
      currentLng: { not: null },
      consecutiveMissedOffers: { lt: 5 }, // Filtrar repartidores inactivos/bloqueados por timeout
    },
    include: {
      orders: {
        where: {
          status: { in: ['in_transit', 'ready_for_pickup'] },
        },
      },
    },
  })

  const scoredDrivers: DriverScoreResult[] = []

  for (const driver of availableDrivers) {
    if (driver.currentLat === null || driver.currentLng === null) continue

    const distanceKm = calculateDistanceInKm(
      pickupLat,
      pickupLng,
      driver.currentLat,
      driver.currentLng
    )

    if (distanceKm > maxRadiusKm) continue

    const lastActivity = driver.lastOrderCompletedAt || driver.lastLocationAt

    const { score, breakdown } = computeDriverScore({
      distanceKm,
      lastActivityAt: lastActivity,
      rating: driver.rating,
      activeOrdersCount: driver.orders.length,
    })

    scoredDrivers.push({
      driverId: driver.id,
      driverName: driver.name,
      phoneNumber: driver.phoneNumber,
      distanceKm,
      score,
      breakdown,
    })
  }

  // Ordenar descendentemente por puntaje
  return scoredDrivers.sort((a, b) => b.score - a.score)
}

/**
 * Inicia la cascada de oferta de despacho para una orden
 */
export async function initiateDispatchOffer(
  orderId: string,
  pickupLat: number,
  pickupLng: number
) {
  const rankedDrivers = await rankDriversForOrder(pickupLat, pickupLng)

  if (rankedDrivers.length === 0) {
    return {
      success: false,
      message: 'No hay repartidores disponibles en un radio de 10 km',
      rankedDrivers: [],
    }
  }

  const bestDriver = rankedDrivers[0]
  const offerDurationMs = 45 * 1000 // 45 segundos por oferta
  const expiresAt = new Date(Date.now() + offerDurationMs)

  // Crear la primera oferta en la cascada
  const offer = await prisma.driverOffer.create({
    data: {
      orderId,
      driverId: bestDriver.driverId,
      status: 'OFFERED',
      score: bestDriver.score,
      expiresAt,
    },
  })

  // Generar PIN de confirmación si no existe
  const deliveryPin = generateDeliveryPin()
  await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryRequested: true,
      deliveryType: 'INTERNAL',
      deliveryPin,
    },
  })

  return {
    success: true,
    offerId: offer.id,
    assignedDriver: bestDriver,
    rankedCount: rankedDrivers.length,
    rankedDrivers,
  }
}
