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

  // Pool sizing.
  // The mariadb driver defaults to connectionLimit=10 per pool; with
  // multiple Azure Container Apps replicas (and autoscaling) this can
  // quickly exhaust Azure MySQL Flexible Server's connection budget.
  // Allow override via env, but keep the default small.
  const connectionLimit = Number(process.env.DB_POOL_SIZE ?? 5)
  const idleTimeout = Number(process.env.DB_POOL_IDLE_TIMEOUT ?? 30) // seconds

  const adapter = new PrismaMariaDb({
    ...config,
    // Azure MySQL Flexible Server requires SSL
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
    connectTimeout: 15000,
    connectionLimit,
    // Close connections that have been idle for this many seconds so we
    // don't hold sockets open against Azure indefinitely.
    idleTimeout,
    // Don't keep a minimum of idle connections around; let the pool
    // shrink to 0 when the app is quiet.
    minimumIdle: 0,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Cache the client on globalThis in *all* environments. In dev this
// prevents HMR from leaking new pools; in production it guards against
// accidental re-imports creating duplicate pools within a single replica.
globalForPrisma.prisma = prisma
