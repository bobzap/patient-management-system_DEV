// src/lib/mfa-session.ts - Gestion des sessions MFA vérifiées
import { NextRequest } from 'next/server';

// Stockage en mémoire des sessions MFA vérifiées
// En production, utiliser Redis ou une base de données
const verifiedSessions = new Map<string, {
  userId: string;
  verifiedAt: Date;
  expiresAt: Date;
}>();

// Durée de validité d'une vérification MFA (4 heures)
const MFA_VERIFICATION_DURATION = 4 * 60 * 60 * 1000; // 4 heures en ms

/**
 * Marque une session comme ayant réussi la vérification MFA
 */
export function markMFAVerified(sessionId: string, userId: string): void {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MFA_VERIFICATION_DURATION);
  
  verifiedSessions.set(sessionId, {
    userId,
    verifiedAt: now,
    expiresAt
  });
  
  // Nettoyage automatique des sessions expirées
  cleanupExpiredSessions();
}

/**
 * Vérifie si une session a été vérifiée par MFA
 */
export function isMFAVerified(sessionId: string, userId: string): boolean {
  const verification = verifiedSessions.get(sessionId);
  
  if (!verification) {
    return false;
  }
  
  // Vérifier que c'est le bon utilisateur
  if (verification.userId !== userId) {
    return false;
  }
  
  // Vérifier que la vérification n'a pas expiré
  if (new Date() > verification.expiresAt) {
    verifiedSessions.delete(sessionId);
    return false;
  }
  
  return true;
}

/**
 * Supprime la vérification MFA d'une session
 */
export function clearMFAVerification(sessionId: string): void {
  verifiedSessions.delete(sessionId);
}

/**
 * Nettoie les sessions expirées
 */
function cleanupExpiredSessions(): void {
  const now = new Date();
  
  for (const [sessionId, verification] of verifiedSessions.entries()) {
    if (now > verification.expiresAt) {
      verifiedSessions.delete(sessionId);
    }
  }
}

/**
 * Obtient l'ID de session depuis la requête
 */
export function getSessionId(request: NextRequest): string | null {
  // Essayer de récupérer l'ID de session depuis les cookies NextAuth
  const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  // Utiliser le token comme ID de session
  return sessionToken;
}

/**
 * Statistiques des sessions MFA
 */
export function getMFASessionStats(): {
  totalVerified: number;
  activeVerifications: number;
  expiredCleaned: number;
} {
  cleanupExpiredSessions();
  
  const now = new Date();
  let activeVerifications = 0;
  
  for (const verification of verifiedSessions.values()) {
    if (now <= verification.expiresAt) {
      activeVerifications++;
    }
  }
  
  return {
    totalVerified: verifiedSessions.size,
    activeVerifications,
    expiredCleaned: verifiedSessions.size - activeVerifications
  };
}

/**
 * Supprime toutes les vérifications MFA d'un utilisateur
 */
export function clearUserMFAVerifications(userId: string): void {
  for (const [sessionId, verification] of verifiedSessions.entries()) {
    if (verification.userId === userId) {
      verifiedSessions.delete(sessionId);
    }
  }
}

// Nettoyage périodique des sessions expirées (toutes les 30 minutes)
setInterval(() => {
  cleanupExpiredSessions();
}, 30 * 60 * 1000);