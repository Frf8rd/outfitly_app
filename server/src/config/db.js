import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 cere un driver adapter. Folosim adaptorul `pg` cu Neon (TCP, merge bine pe un server Express obișnuit).
// Aici folosim URL-ul cu pooler (DATABASE_URL); pentru migrări, Prisma CLI citește DIRECT_URL din prisma.config.ts.
if (!process.env.DATABASE_URL) {
  throw new Error("Lipsește DATABASE_URL din server/.env");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// O singură instanță pentru tot serverul (și la `node --watch`, ca să nu deschidem conexiuni noi la fiecare repornire)
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.__prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;
