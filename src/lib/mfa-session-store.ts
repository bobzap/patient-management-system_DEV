// src/lib/mfa-session-store.ts - Stockage des sessions MFA vérifiées
// Système persistant en fichier pour le développement
// En production, utiliser Redis ou une base de données

import fs from 'fs';
import path from 'path';

interface MFASession {
  userId: string;
  verifiedAt: Date;
  expiresAt: Date;
}

// Chemin du fichier de persistance
const STORE_FILE_PATH = path.join(process.cwd(), '.tmp-mfa-sessions.json');

// Cache en mémoire pour performance
let verifiedSessions = new Map<string, MFASession>();
let isLoaded = false;

// Charger les sessions depuis le fichier
function loadSessions(): void {
  if (isLoaded) return;
  
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const data = fs.readFileSync(STORE_FILE_PATH, 'utf8');
      const sessions = JSON.parse(data);
      
      verifiedSessions.clear();
      for (const [sessionId, session] of Object.entries(sessions as Record<string, any>)) {
        verifiedSessions.set(sessionId, {
          ...session,
          verifiedAt: new Date(session.verifiedAt),
          expiresAt: new Date(session.expiresAt)
        });
      }
      
      console.log(`🔐 Chargé ${verifiedSessions.size} sessions MFA depuis fichier`);
    }
  } catch (error) {
    console.log('🔐 Nouveau fichier store MFA créé');
  }
  
  isLoaded = true;
}

// Sauvegarder les sessions dans le fichier
function saveSessions(): void {
  try {
    const sessions: Record<string, MFASession> = {};
    for (const [sessionId, session] of verifiedSessions.entries()) {
      sessions[sessionId] = session;
    }
    
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error('🔐 Erreur sauvegarde sessions MFA:', error);
  }
}

// Durée de validité d'une vérification MFA (8 heures)
const MFA_VERIFICATION_DURATION = 8 * 60 * 60 * 1000; // 8 heures en ms

/**
 * Marque une session comme ayant réussi la vérification MFA
 */
export function markMFAVerified(sessionId: string, userId: string): void {
  loadSessions(); // S'assurer que les sessions sont chargées
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MFA_VERIFICATION_DURATION);
  
  verifiedSessions.set(sessionId, {
    userId,
    verifiedAt: now,
    expiresAt
  });
  
  console.log(`🔐 MFA Session ${sessionId} verified`);
  
  // Sauvegarder dans le fichier
  saveSessions();
  
  // Nettoyage automatique des sessions expirées
  cleanupExpiredSessions();
}

/**
 * Vérifie si une session a été vérifiée par MFA
 */
export function isMFAVerified(sessionId: string, userId: string): boolean {
  loadSessions(); // S'assurer que les sessions sont chargées
  
  const verification = verifiedSessions.get(sessionId);
  
  // Vérification silencieuse pour éviter le spam de logs
  
  if (!verification) {
    return false;
  }
  
  // Vérifier que c'est le bon utilisateur
  if (verification.userId !== userId) {
    console.log('🔐 UserId ne correspond pas:', verification.userId, 'vs', userId);
    return false;
  }
  
  // Vérifier que la vérification n'a pas expiré
  if (new Date() > verification.expiresAt) {
    console.log('🔐 Session MFA expirée');
    verifiedSessions.delete(sessionId);
    saveSessions(); // Sauvegarder la suppression
    return false;
  }
  
  console.log('🔐 MFA vérifié avec succès');
  return true;
}

/**
 * Supprime la vérification MFA d'une session
 */
export function clearMFAVerification(sessionId: string): void {
  loadSessions();
  verifiedSessions.delete(sessionId);
  saveSessions();
  console.log(`🔐 MFA Session ${sessionId} verification cleared`);
}

/**
 * Nettoie les sessions expirées
 */
function cleanupExpiredSessions(): void {
  loadSessions();
  const now = new Date();
  let cleaned = 0;
  
  for (const [sessionId, verification] of verifiedSessions.entries()) {
    if (now > verification.expiresAt) {
      verifiedSessions.delete(sessionId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    saveSessions();
    console.log(`🧹 Cleaned ${cleaned} expired MFA sessions`);
  }
}

/**
 * Supprime toutes les vérifications MFA d'un utilisateur
 */
export function clearUserMFAVerifications(userId: string): void {
  loadSessions();
  let cleared = 0;
  for (const [sessionId, verification] of verifiedSessions.entries()) {
    if (verification.userId === userId) {
      verifiedSessions.delete(sessionId);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    saveSessions();
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
  loadSessions();
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