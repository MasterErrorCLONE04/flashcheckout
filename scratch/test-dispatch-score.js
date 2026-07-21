const { calculateDistanceInKm, computeDriverScore, generateDeliveryPin } = require('../lib/dispatch/matching-algorithm')

function runTests() {
  console.log('--- TEST 1: Haversine Distance ---')
  // Bogotá Plaza de Bolívar a Parque de la 93 (~7.8 km)
  const dist = calculateDistanceInKm(4.5981, -74.0760, 4.6766, -74.0483)
  console.log(`Distancia calculada: ${dist} km`)
  if (dist > 7 && dist < 11) {
    console.log('✅ TEST 1 PASSED: Distancia dentro del rango esperado.')
  } else {
    console.error('❌ TEST 1 FAILED: Distancia fuera de rango.')
  }

  console.log('\n--- TEST 2: Scoring Algorithm ---')
  const driver1 = computeDriverScore({ distanceKm: 0.5, lastActivityAt: new Date(Date.now() - 30*60*1000), rating: 4.9, activeOrdersCount: 0 })
  const driver2 = computeDriverScore({ distanceKm: 4.0, lastActivityAt: new Date(Date.now() - 5*60*1000), rating: 4.2, activeOrdersCount: 1 })

  console.log(`Driver 1 Score: ${driver1.score} (Dist Score: ${driver1.breakdown.distanceScore}, Idle: ${driver1.breakdown.idleScore})`)
  console.log(`Driver 2 Score: ${driver2.score} (Dist Score: ${driver2.breakdown.distanceScore}, Idle: ${driver2.breakdown.idleScore})`)

  if (driver1.score > driver2.score) {
    console.log('✅ TEST 2 PASSED: El repartidor más cercano y con mayor tiempo de espera obtuvo mayor puntaje.')
  } else {
    console.error('❌ TEST 2 FAILED: Ranking de puntajes incorrecto.')
  }

  console.log('\n--- TEST 3: PIN Generation ---')
  const pin = generateDeliveryPin()
  console.log(`PIN generado: ${pin}`)
  if (/^\d{4}$/.test(pin)) {
    console.log('✅ TEST 3 PASSED: PIN de 4 dígitos válido.')
  } else {
    console.error('❌ TEST 3 FAILED: Formato de PIN inválido.')
  }
}

runTests()
