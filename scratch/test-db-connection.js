const { Client } = require('pg');

const regions = ['sa-east-1', 'us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1'];
const password = 'lIbwNe9iU75WVF2M';
const projectRef = 'yumvbbhssylfwlypblxl';

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.${projectRef}:${password}@${host}:5432/postgres?sslmode=require`;
  
  console.log(`Testing region: ${region} (${host})...`);
  const client = new Client({ 
    connectionString, 
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log(`✅ SUCCESS: Connected to Supabase in region: ${region}`);
    await client.end();
    return connectionString;
  } catch (err) {
    console.log(`❌ FAILED for region: ${region} - ${err.message}`);
    return null;
  }
}

async function main() {
  for (const region of regions) {
    const successString = await testRegion(region);
    if (successString) {
      console.log('\nUse this connection string in your .env:');
      console.log(`DATABASE_URL="${successString}&sslmode=require"`);
      break;
    }
  }
}

main();
