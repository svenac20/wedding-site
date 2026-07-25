import { PrismaClient } from '@/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
  }
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL!
  const config = parseDatabaseUrl(dbUrl)

  const isProduction = process.env.NODE_ENV === 'production'

  const adapter = new PrismaMariaDb({
    ...config,
    // Azure MySQL Flexible Server requires SSL
    ssl: isProduction ? { rejectUnauthorized: true } : undefined,
    // Local dev connects without TLS, so MySQL 8's caching_sha2_password auth
    // needs explicit permission to fetch the server's RSA public key.
    allowPublicKeyRetrieval: !isProduction,
    connectTimeout: 15000,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
