// Load .env from project root so Prisma CLI uses DATABASE_URL (Supabase)
import path from "node:path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env") });

import { defineConfig } from "prisma/config";

// Use placeholder when DATABASE_URL is missing so `prisma generate` can run
// (e.g. on Vercel build where DB env may be runtime-only). Runtime always uses real env.
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
