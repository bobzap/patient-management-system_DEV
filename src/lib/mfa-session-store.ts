// src/lib/mfa-session-store.ts - Stockage des sessions MFA vérifiées
// Système simple en mémoire pour le développement
// En production, utiliser Redis ou une base de données

interface MFASession {
  userId: string;
  verifiedAt: Date;
  expiresAt: Date;
}

// Stockage en mémoire des sessions MFA vérifiées
const verifiedSessions = new Map<string, MFASession>();

// Durée de validité d'une vérification MFA (30 minutes)
const MFA_VERIFICATION_DURATION = 30 * 60 * 1000; // 30 minutes en ms

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
  
  console.log(`🔐 MFA Session ${sessionId} marked as verified for user ${userId}`);
  
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
  console.log(`🔐 MFA Session ${sessionId} verification cleared`);
}

/**
 * Nettoie les sessions expirées
 */
function cleanupExpiredSessions(): void {
  const now = new Date();
  let cleaned = 0;
  
  for (const [sessionId, verification] of verifiedSessions.entries()) {
    if (now > verification.expiresAt) {
      verifiedSessions.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired MFA sessions`);
  }
}

/**
 * Supprime toutes les vérifications MFA d'un utilisateur
 */
export function clearUserMFAVerifications(userId: string): void {
  let cleared = 0;
  for (const [sessionId, verification] of verifiedSessions.entries()) {
    if (verification.userId === userId) {
      verifiedSessions.delete(sessionId);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    console.log(`🔐 Cleared ${cleared} MFA sessions for user ${userId}`);
  }
}

/**
 * Statistiques des sessions MFA
 */
export function getMFASessionStats(): {
  totalVerified: number;
  activeVerifications: number;
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
    activeVerifications
  };
}

// Nettoyage périodique des sessions expirées (toutes les 10 minutes)
setInterval(() => {
  cleanupExpiredSessions();
}, 10 * 60 * 1000);