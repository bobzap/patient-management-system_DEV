// src/lib/crypto-timing.ts - Protection contre les timing attacks
import { timingSafeEqual } from 'crypto';

/**
 * Comparaison sécurisée en temps constant
 */
export function constantTimeCompare(a: string, b: string): boolean {
  // Normaliser les longueurs pour éviter les fuites de timing
  const maxLength = Math.max(a.length, b.length);
  const normalizedA = a.padEnd(maxLength, '\0');
  const normalizedB = b.padEnd(maxLength, '\0');
  
  try {
    const bufferA = Buffer.from(normalizedA, 'utf8');
    const bufferB = Buffer.from(normalizedB, 'utf8');
    
    // Utiliser la fonction native de Node.js pour comparaison sécurisée
    return timingSafeEqual(bufferA, bufferB);
  } catch {
    // En cas d'erreur, retourner false de manière sécurisée
    return false;
  }
}

/**
 * Ajoute un délai aléatoire pour masquer les temps de traitement
 */
export async function addTimingNoise(baseMs: number = 100): Promise<void> {
  const randomDelay = baseMs + Math.random() * baseMs;
  await new Promise(resolve => setTimeout(resolve, randomDelay));
}

/**
 * Exécute une fonction avec un temps de réponse constant
 */
export async function withConstantTime<T>(
  operation: () => Promise<T> | T,
  minTimeMs: number = 200
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    // Calculer le temps restant pour atteindre le minimum
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minTimeMs - elapsed);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    return result;
  } catch (error) {
    // Même en cas d'erreur, respecter le temps minimum
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minTimeMs - elapsed);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    throw error;
  }
}

/**
 * Hash sécurisé pour comparaison sans révéler la vraie valeur
 */
export function secureHash(input: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Générateur de réponses dummy pour masquer les opérations réelles
 */
export function generateDummyResponse(): {
  encrypted: string;
  iv: string;
  tag: string;
  version: string;
} {
  const crypto = require('crypto');
  return {
    encrypted: crypto.randomBytes(32).toString('hex'),
    iv: crypto.randomBytes(16).toString('hex'),
    tag: crypto.randomBytes(16).toString('hex'),
    version: '1.0'
  };
}