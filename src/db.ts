import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL не задан в .env');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}