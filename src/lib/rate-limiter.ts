// src/lib/rate-limiter.ts - Rate limiting pour la sécurité MFA
import { NextRequest } from 'next/server';

// Interface pour le stockage des tentatives
interface RateLimitAttempt {
  count: number;
  resetTime: number;
  windowStart: number;
}

// Stockage en mémoire des tentatives (en production, utiliser Redis)
const attempts = new Map<string, RateLimitAttempt>();

// Configuration du rate limiting
const RATE_LIMIT_CONFIG = {
  // Connexion générale
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 15 * 60 * 1000 // 15 minutes de blocage
  },
  
  // Vérification MFA (plus strict)
  mfa: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 3,
    blockDurationMs: 30 * 60 * 1000 // 30 minutes de blocage
  },
  
  // Setup MFA (modéré)
  setup: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 3,
    blockDurationMs: 10 * 60 * 1000 // 10 minutes de blocage
  }
};

/**
 * Génère une clé unique pour identifier l'utilisateur/IP
 */
function generateKey(identifier: string, type: keyof typeof RATE_LIMIT_CONFIG): string {
  return `${type}:${identifier}`;
}

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
 * Nettoie les anciennes entrées expirées
 */
function cleanup() {
  const now = Date.now();
  for (const [key, attempt] of attempts.entries()) {
    if (now > attempt.resetTime) {
      attempts.delete(key);
    }
  }
}

/**
 * Vérifie si une requête est autorisée selon le rate limiting
 */
export function checkRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIG,
  userId?: string
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  cleanup(); // Nettoyer les anciennes entrées
  
  const identifier = getIdentifier(request, userId);
  const key = generateKey(identifier, type);
  const config = RATE_LIMIT_CONFIG[type];
  const now = Date.now();
  
  const attempt = attempts.get(key);
  
  if (!attempt) {
    // Première tentative
    attempts.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      windowStart: now
    });
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs
    };
  }
  
  // Vérifier si la fenêtre a expiré
  if (now > attempt.resetTime) {
    attempts.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      windowStart: now
    });
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs
    };
  }
  
  // Incrémenter le compteur
  attempt.count++;
  
  if (attempt.count > config.maxAttempts) {
    // Limite dépassée - bloquer plus longtemps
    const blockUntil = now + config.blockDurationMs;
    attempt.resetTime = blockUntil;
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: blockUntil,
      retryAfter: Math.ceil(config.blockDurationMs / 1000)
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxAttempts - attempt.count,
    resetTime: attempt.resetTime
  };
}

/**
 * Enregistre une tentative échouée (pour ajuster le rate limiting)
 */
export function recordFailedAttempt(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIG,
  userId?: string
): void {
  const identifier = getIdentifier(request, userId);
  const key = generateKey(identifier, type);
  const config = RATE_LIMIT_CONFIG[type];
  const now = Date.now();
  
  const attempt = attempts.get(key);
  
  if (attempt) {
    // Réduire la fenêtre pour les échecs répétés
    attempt.count += 1;
    
    // Si trop d'échecs, augmenter drastiquement le temps de blocage
    if (attempt.count > config.maxAttempts + 2) {
      attempt.resetTime = now + (config.blockDurationMs * 2);
    }
  }
}

/**
 * Réinitialise les tentatives pour un utilisateur (succès)
 */
export function resetAttempts(
  request: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIG,
  userId?: string
): void {
  const identifier = getIdentifier(request, userId);
  const key = generateKey(identifier, type);
  attempts.delete(key);
}

/**
 * Middleware de rate limiting pour les routes API
 */
export function withRateLimit(
  type: keyof typeof RATE_LIMIT_CONFIG,
  handler: (request: NextRequest, context: any) => Promise<Response>
) {
  return async (request: NextRequest, context: any) => {
    // Vérifier le rate limiting
    const result = checkRateLimit(request, type);
    
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
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
          }
        }
      );
    }
    
    // Ajouter les headers de rate limiting
    const response = await handler(request, context);
    
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG[type].maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return response;
  };
}

/**
 * Obtient les statistiques de rate limiting pour monitoring
 */
export function getRateLimitStats(): {
  totalKeys: number;
  byType: Record<string, number>;
  oldestEntry: number | null;
} {
  cleanup();
  
  const byType: Record<string, number> = {};
  let oldestEntry: number | null = null;
  
  for (const [key, attempt] of attempts.entries()) {
    const type = key.split(':')[0];
    byType[type] = (byType[type] || 0) + 1;
    
    if (!oldestEntry || attempt.windowStart < oldestEntry) {
      oldestEntry = attempt.windowStart;
    }
  }
  
  return {
    totalKeys: attempts.size,
    byType,
    oldestEntry
  };
}

// Export des constantes pour les tests
export { RATE_LIMIT_CONFIG };