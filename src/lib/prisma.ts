import { PrismaClient } from '@prisma/client'
import { setupEncryption } from './prisma-encryption'

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  encryptionConfigured: boolean;
}

export const prisma = globalForPrisma.prisma || new PrismaClient()

// Configuration du chiffrement automatique SEULEMENT si pas déjà configuré
if (!globalForPrisma.encryptionConfigured) {
  setupEncryption(prisma);
  globalForPrisma.encryptionConfigured = true;
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}