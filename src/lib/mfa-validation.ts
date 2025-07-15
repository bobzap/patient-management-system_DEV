// src/lib/mfa-validation.ts - Validation et sécurité MFA
import { z } from 'zod';

// Schémas de validation Zod
export const totpCodeSchema = z.string()
  .regex(/^\d{6}$/, 'Le code TOTP doit contenir exactement 6 chiffres')
  .transform(code => code.trim());

export const backupCodeSchema = z.string()
  .regex(/^[A-F0-9]{8}$/i, 'Le code de récupération doit contenir 8 caractères hexadécimaux')
  .transform(code => code.toUpperCase().trim());

export const mfaSetupSchema = z.object({
  code: totpCodeSchema
});

export const mfaVerifySchema = z.object({
  code: z.string().min(1, 'Code requis'),
  isBackupCode: z.boolean().optional().default(false)
}).refine(
  (data) => {
    if (data.isBackupCode) {
      return backupCodeSchema.safeParse(data.code).success;
    } else {
      return totpCodeSchema.safeParse(data.code).success;
    }
  },
  {
    message: 'Format de code invalide',
    path: ['code']
  }
);

export const mfaDisableSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
  mfaCode: totpCodeSchema
});

export const backupCodesRegenerateSchema = z.object({
  mfaCode: totpCodeSchema
});

// Fonctions de validation sécurisée
export class MFAValidator {
  
  /**
   * Valide et sanitise un code TOTP
   */
  static validateTOTPCode(code: string): { isValid: boolean; cleanCode?: string; error?: string } {
    try {
      const cleanCode = totpCodeSchema.parse(code);
      return { isValid: true, cleanCode };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0].message };
      }
      return { isValid: false, error: 'Code invalide' };
    }
  }
  
  /**
   * Valide et sanitise un code de récupération
   */
  static validateBackupCode(code: string): { isValid: boolean; cleanCode?: string; error?: string } {
    try {
      const cleanCode = backupCodeSchema.parse(code);
      return { isValid: true, cleanCode };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0].message };
      }
      return { isValid: false, error: 'Code de récupération invalide' };
    }
  }
  
  /**
   * Valide une requête de vérification MFA
   */
  static validateMFARequest(data: any): { 
    isValid: boolean; 
    data?: { code: string; isBackupCode: boolean }; 
    error?: string 
  } {
    try {
      const validData = mfaVerifySchema.parse(data);
      return { isValid: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0].message };
      }
      return { isValid: false, error: 'Données invalides' };
    }
  }
  
  /**
   * Vérifie la force d'un mot de passe pour la désactivation MFA
   */
  static validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
    if (!password || password.length < 8) {
      return { isValid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    
    // Vérifications basiques de sécurité
    if (password.toLowerCase().includes('password')) {
      return { isValid: false, error: 'Le mot de passe ne peut pas contenir "password"' };
    }
    
    if (/^(.)\1+$/.test(password)) {
      return { isValid: false, error: 'Le mot de passe ne peut pas être composé d\'un seul caractère répété' };
    }
    
    return { isValid: true };
  }
}

// Constantes de sécurité
export const MFA_CONSTANTS = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  TOTP_WINDOW: 1, // ±30 secondes
  BACKUP_CODES_COUNT: 10,
  SECRET_LENGTH: 32,
  
  // Timeouts
  VERIFICATION_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  SETUP_TIMEOUT_MS: 10 * 60 * 1000, // 10 minutes
  
  // Rate limiting
  MAX_SETUP_ATTEMPTS_PER_HOUR: 3,
  MAX_VERIFY_ATTEMPTS_PER_HOUR: 10,
} as const;

/**
 * Détection d'anomalies de sécurité
 */
export class MFASecurityMonitor {
  
  /**
   * Vérifie si un pattern d'utilisation est suspect
   */
  static detectSuspiciousActivity(attempts: {
    userId: string;
    timestamp: Date;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
  }[]): {
    isSuspicious: boolean;
    reasons: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    const recentAttempts = attempts.filter(
      a => Date.now() - a.timestamp.getTime() < 60 * 60 * 1000 // dernière heure
    );
    
    // Trop de tentatives échouées
    const failedAttempts = recentAttempts.filter(a => !a.success);
    if (failedAttempts.length > 10) {
      reasons.push('Nombre élevé de tentatives échouées');
      riskLevel = 'high';
    } else if (failedAttempts.length > 5) {
      reasons.push('Tentatives échouées multiples');
      riskLevel = 'medium';
    }
    
    // IPs multiples
    const uniqueIPs = new Set(recentAttempts.map(a => a.ipAddress).filter(Boolean));
    if (uniqueIPs.size > 3) {
      reasons.push('Connexions depuis plusieurs IP');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }
    
    // User agents multiples (possible bot)
    const uniqueUAs = new Set(recentAttempts.map(a => a.userAgent).filter(Boolean));
    if (uniqueUAs.size > 2) {
      reasons.push('Navigateurs multiples détectés');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }
    
    // Tentatives très rapprochées (possible bruteforce)
    const timestamps = recentAttempts.map(a => a.timestamp.getTime()).sort();
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i-1] < 1000) { // moins d'1 seconde
        reasons.push('Tentatives anormalement rapides');
        riskLevel = 'high';
        break;
      }
    }
    
    return {
      isSuspicious: reasons.length > 0,
      reasons,
      riskLevel
    };
  }
  
  /**
   * Génère un rapport de sécurité
   */
  static generateSecurityReport(userId: string, attempts: any[]): {
    summary: string;
    recommendations: string[];
    shouldAlert: boolean;
  } {
    const analysis = this.detectSuspiciousActivity(attempts);
    
    const recommendations: string[] = [];
    
    if (analysis.isSuspicious) {
      recommendations.push('Vérifier l\'activité récente du compte');
      
      if (analysis.riskLevel === 'high') {
        recommendations.push('Envisager une suspension temporaire');
        recommendations.push('Contacter l\'utilisateur pour vérification');
      }
      
      if (analysis.reasons.includes('Tentatives anormalement rapides')) {
        recommendations.push('Renforcer le rate limiting');
      }
      
      if (analysis.reasons.includes('Connexions depuis plusieurs IP')) {
        recommendations.push('Vérifier la géolocalisation des connexions');
      }
    }
    
    return {
      summary: analysis.isSuspicious 
        ? `Activité suspecte détectée (niveau ${analysis.riskLevel}): ${analysis.reasons.join(', ')}`
        : 'Activité normale',
      recommendations,
      shouldAlert: analysis.riskLevel === 'high'
    };
  }
}

/**
 * Utilitaires de sécurité
 */
export class MFASecurityUtils {
  
  /**
   * Génère un délai aléatoire pour éviter les timing attacks
   */
  static async addRandomDelay(baseMs: number = 100): Promise<void> {
    const delay = baseMs + Math.random() * baseMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Hash sécurisé d'un identifiant pour les logs
   */
  static hashIdentifier(identifier: string): string {
    // Utilisation d'un hash simple pour masquer les données sensibles dans les logs
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Validation de l'origine de la requête
   */
  static validateOrigin(request: Request, allowedOrigins: string[]): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return false;
    
    return allowedOrigins.some(allowed => 
      origin === allowed || origin.endsWith('.' + allowed)
    );
  }
}