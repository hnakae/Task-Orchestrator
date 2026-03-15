import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Using a type assertion because of potential version mismatches in @types/pg between 
// different dependencies. Runtime functionality remains correct.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }) as any;
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;