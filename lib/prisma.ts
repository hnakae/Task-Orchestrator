import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined,
  pgPool: pg.Pool | undefined 
};

// Use a singleton for the pool to avoid "MaxClientsInSessionMode" errors during dev
const pool = globalForPrisma.pgPool || new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 2, // Limit pool size for session mode compatibility
});

const adapter = new PrismaPg(pool as any);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
}