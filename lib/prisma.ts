import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined,
  pgPool: pg.Pool | undefined 
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.error("CRITICAL: DATABASE_URL is not set in production environment!");
}

// Use a singleton for the pool to avoid "MaxClientsInSessionMode" errors during dev
const pool = globalForPrisma.pgPool || new pg.Pool({ 
  connectionString: databaseUrl,
  max: process.env.NODE_ENV === "production" ? 10 : 2, // Increase pool size in production
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // 5 second timeout for connections
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool as any);

export const prisma = globalForPrisma.prisma || new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === "production" ? ['error'] : ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
}