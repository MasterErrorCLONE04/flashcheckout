import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

function makePrismaClient() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

  // Create a pg connection pool
  const pool = new Pool({ 
    connectionString,
    ssl: connectionString?.includes('supabase.com') || connectionString?.includes('140.216') 
      ? { rejectUnauthorized: false } 
      : undefined
  })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

// Use a getter to defer instantiation to runtime (avoids build-time connection)
export const prisma = globalForPrisma.prisma ?? makePrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
