// src/lib/rate-limiter-db.ts - Rate limiting persistant en base de données
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

// Interface pour le stockage des tentatives en base
interface RateLimitRecord {
  id: string;
  identifier: string;
  type: string;
  count: number;
  windowStart: Date;
  resetTime: Date;
  isBlocked: boolean;
  blockUntil?: Date;
}

// Configuration du rate limiting (même que l'ancienne version)
const RATE_LIMIT_CONFIG = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 15 * 60 * 1000 // 15 minutes de blocage
  },
  mfa: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 3,
    blockDurationMs: 30 * 60 * 1000 // 30 minutes de blocage
  },
  setup: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 3,
    blockDurationMs: 10 * 60 * 1000 // 10 minutes de blocage
  }
};

/**
 * Obtient l'identifiant de l'utilisateur (IP + User ID si disponible)
 */
function getIdentifier(request: NextRequest, userId?: string): string {
  const ip = request.ip || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return userId ? `${ip}:${userId}` : ip;
}

/**
 * Nettoie les anciennes entrées expirées (appelé périodiquement)
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  try {
    const now = new Date();
    
    // Supprimer les entrées expirées et non bloquées
    await prisma.$executeRaw`
      DELETE FROM "RateLimit" 
      WHERE "resetTime" < ${now} AND "isBlocked" = false
    `;
    
    // Débloquer les entrées dont le blocage a expiré
    await prisma.$executeRaw`
      UPDATE "RateLimit" 
      SET "isBlocked" = false, "blockUntil" = NULL 
      WHERE "blockUntil" < ${now} AND "isBlocked" = true
    `;
    
  } catch (error) {
    console.error('Erreur nettoyage rate limits:', error);
  }
}

/**
 * Vérifie si une requête est autorisée selon le rate limiting persistant
 */
export async function checkRateLimitDB(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIG,
  userId?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}> {
  const identifier = getIdentifier(request, userId);
  const config = RATE_LIMIT_CONFIG[type];
  const now = new Date();
  
  try {
    // Nettoyage automatique (optimisé pour ne pas le faire à chaque requête)
    if (Math.random() < 0.1) { // 10% de chance de nettoyer
      await cleanupExpiredRateLimits();
    }
    
    // Rechercher un enregistrement existant
    let rateLimit = await prisma.rateLimit.findUnique({
      where: {
        identifier_type: {
          identifier,
          type
        }
      }
    });
    
    // Si pas d'enregistrement, en créer un
    if (!rateLimit) {
      const resetTime = new Date(now.getTime() + config.windowMs);
      
      rateLimit = await prisma.rateLimit.create({
        data: {
          identifier,
          type,
          count: 1,
          windowStart: now,
          resetTime,
          isBlocked: false
        }
      });
      
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetTime
      };
    }
    
    // Vérifier si la fenêtre a expiré
    if (now > rateLimit.resetTime && !rateLimit.isBlocked) {
      const newResetTime = new Date(now.getTime() + config.windowMs);
      
      rateLimit = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          windowStart: now,
          resetTime: newResetTime,
          isBlocked: false,
          blockUntil: null
        }
      });
      
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetTime: newResetTime
      };
    }
    
    // Vérifier si bloqué
    if (rateLimit.isBlocked && rateLimit.blockUntil && now < rateLimit.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimit.blockUntil,
        retryAfter: Math.ceil((rateLimit.blockUntil.getTime() - now.getTime()) / 1000)
      };
    }
    
    // Incrémenter le compteur
    const newCount = rateLimit.count + 1;
    
    if (newCount > config.maxAttempts) {
      // Limite dépassée - bloquer
      const blockUntil = new Date(now.getTime() + config.blockDurationMs);
      
      rateLimit = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: newCount,
          isBlocked: true,
          blockUntil
        }
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockUntil,
        retryAfter: Math.ceil(config.blockDurationMs / 1000)
      };
    }
    
    // Incrémenter le compteur
    rateLimit = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: { count: newCount }
    });
    
    return {
      allowed: true,
      remaining: config.maxAttempts - newCount,
      resetTime: rateLimit.resetTime
    };
    
  } catch (error) {
    console.error('Erreur rate limiting DB:', error);
    
    // En cas d'erreur DB, utiliser le rate limiting en mémoire comme fallback
    const { checkRateLimit } = await import('./rate-limiter');
    return checkRateLimit(request, type, userId);
  }
}

/**
 * Enregistre une tentative échouée
 */
export async function recordFailedAttemptDB(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIG,
  userId?: string
): Promise<void> {
  const identifier = getIdentifier(request, userId);
  const config = RATE_LIMIT_CONFIG[type];
  const now = new Date();
  
  try {
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        identifier_type: {
          identifier,
          type
        }
      }
    });
    
    if (rateLimit) {
      const newCount = rateLimit.count + 1;
      
      // Si beaucoup d'échecs, augmenter le temps de blocage
      let blockUntil = rateLimit.blockUntil;
      if (newCount > config.maxAttempts + 2) {
        blockUntil = new Date(now.getTime() + (config.blockDurationMs * 2));
      }
      
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: newCount,
          isBlocked: newCount > config.maxAttempts,
          blockUntil
        }
      });
    }
  } catch (error) {
    console.error('Erreur enregistrement échec:', error);
  }
}

/**
 * Réinitialise les tentatives pour un utilisateur (succès)
 */
export async function resetAttemptsDB(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIG,
  userId?: string
): Promise<void> {
  const identifier = getIdentifier(request, userId);
  
  try {
    await prisma.rateLimit.deleteMany({
      where: {
        identifier,
        type
      }
    });
  } catch (error) {
    console.error('Erreur reset attempts:', error);
  }
}

/**
 * Middleware de rate limiting avec persistance DB
 */
export function withRateLimitDB(
  type: keyof typeof RATE_LIMIT_CONFIG,
  handler: (request: NextRequest, context: any) => Promise<Response>
) {
  return async (request: NextRequest, context: any) => {
    // Vérifier le rate limiting
    const result = await checkRateLimitDB(request, type);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Trop de tentatives',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter?.toString() || '300',
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG[type].maxAttempts.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toISOString()
          }
        }
      );
    }
    
    // Ajouter les headers de rate limiting
    const response = await handler(request, context);
    
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG[type].maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString());
    
    return response;
  };
}

/**
 * Obtient les statistiques de rate limiting
 */
export async function getRateLimitStatsDB(): Promise<{
  totalRecords: number;
  byType: Record<string, number>;
  blocked: number;
  oldestRecord: Date | null;
}> {
  try {
    const stats = await prisma.rateLimit.groupBy({
      by: ['type'],
      _count: { id: true }
    });
    
    const blocked = await prisma.rateLimit.count({
      where: { isBlocked: true }
    });
    
    const oldest = await prisma.rateLimit.findFirst({
      orderBy: { windowStart: 'asc' },
      select: { windowStart: true }
    });
    
    const byType: Record<string, number> = {};
    let total = 0;
    
    for (const stat of stats) {
      byType[stat.type] = stat._count.id;
      total += stat._count.id;
    }
    
    return {
      totalRecords: total,
      byType,
      blocked,
      oldestRecord: oldest?.windowStart || null
    };
  } catch (error) {
    console.error('Erreur stats rate limiting:', error);
    return {
      totalRecords: 0,
      byType: {},
      blocked: 0,
      oldestRecord: null
    };
  }
}

// Export de la configuration pour les tests
export { RATE_LIMIT_CONFIG };