import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === Symbol.toStringTag) return "PrismaClient";
        throw new Error(
          "DATABASE_URL is not set. Add it to .env.local or Vercel env vars.",
        );
      },
    });
  }
  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 5_000,
    query_timeout: 5_000,
    idleTimeoutMillis: 15_000,
    max: 5,
  });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
