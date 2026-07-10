const { executeNovaTool } = require('../lib/ai/nova-tools')
const { prisma } = require('../lib/prisma')

async function run() {
  console.log('Testing Nova tools database resolution...')
  
  const store = await prisma.store.findFirst()
  if (!store) {
    console.error('No store found in database to test tools.')
    return
  }
  
  console.log(`Using Store: ${store.name} (${store.id})`)
  
  // 1. Test sales metrics
  console.log('\n--- 1. Testing sales metrics ---')
  const metricsResult = await executeNovaTool(store.id, 'get_sales_metrics', {})
  console.log('Sales Metrics Result:', JSON.stringify(metricsResult, null, 2))
  
  // 2. Test search products
  console.log('\n--- 2. Testing search products ---')
  const productsResult = await executeNovaTool(store.id, 'search_products', { query: '' })
  console.log('Products Search Result:', JSON.stringify(productsResult, null, 2))
  
  // 3. Test list orders
  console.log('\n--- 3. Testing list orders ---')
  const ordersResult = await executeNovaTool(store.id, 'list_orders', { take: 2 })
  console.log('Orders List Result:', JSON.stringify(ordersResult, null, 2))
}

run()
  .then(() => {
    console.log('\nTest run completed.')
    process.exit(0)
  })
  .catch(err => {
    console.error('\nTest failed:', err)
    process.exit(1)
  })
