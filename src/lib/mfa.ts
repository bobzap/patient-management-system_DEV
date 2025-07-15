// src/lib/mfa.ts - Système de double authentification TOTP
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { encryptString, decryptString, isEncrypted } from './encryption';

// Configuration MFA
const MFA_CONFIG = {
  issuer: 'Vital Sync',
  window: 2, // Tolérance ±30 secondes
  step: 30, // Durée d'un code en secondes
  digits: 6, // Nombre de chiffres du code
  encoding: 'base32' as const,
  maxFailedAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes en ms
};

// Interface pour les données MFA chiffrées
export interface EncryptedMFAData {
  secret: any; // EncryptedData
  backupCodes: any[]; // EncryptedData[]
}

// Interface pour les codes de récupération
export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

/**
 * Génère un secret TOTP et le chiffre
 */
export function generateMFASecret(userEmail: string): {
  secret: any;
  qrCodeUrl: string;
  manualEntryKey: string;
} {
  // Génération du secret TOTP
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: MFA_CONFIG.issuer,
    length: 32,
  });

  if (!secret.base32) {
    throw new Error('Échec de la génération du secret TOTP');
  }

  // Chiffrement du secret
  const encryptedSecret = encryptString(secret.base32);

  // Construction manuelle de l'URL TOTP pour garantir le bon format
  const qrCodeUrl = `otpauth://totp/${encodeURIComponent(MFA_CONFIG.issuer)}:${encodeURIComponent(userEmail)}?secret=${secret.base32}&issuer=${encodeURIComponent(MFA_CONFIG.issuer)}&algorithm=SHA1&digits=${MFA_CONFIG.digits}&period=${MFA_CONFIG.step}`;

  return {
    secret: encryptedSecret,
    qrCodeUrl,
    manualEntryKey: secret.base32,
  };
}

/**
 * Génère un QR code pour l'application d'authentification
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('Erreur génération QR code:', error);
    throw new Error('Impossible de générer le QR code');
  }
}

/**
 * Vérifie un code TOTP avec protection contre les timing attacks
 */
export async function verifyTOTPCode(
  encryptedSecret: any,
  userCode: string
): Promise<boolean> {
  const { withConstantTime, constantTimeCompare } = await import('./crypto-timing');
  
  return withConstantTime(async () => {
    try {
      // Validation format avec temps constant
      if (!userCode || userCode.length !== MFA_CONFIG.digits) {
        // Générer un code dummy pour maintenir le timing
        const dummyCode = '123456';
        constantTimeCompare(userCode || '', dummyCode);
        return false;
      }

      // Déchiffrement du secret
      let secretBase32: string;
      if (isEncrypted(encryptedSecret)) {
        secretBase32 = decryptString(encryptedSecret);
      } else {
        // Compatibilité pour secrets non chiffrés (migration)
        secretBase32 = encryptedSecret;
      }

      // Vérification du code TOTP
      const isValid = speakeasy.totp.verify({
        secret: secretBase32,
        encoding: MFA_CONFIG.encoding,
        token: userCode,
        window: MFA_CONFIG.window,
        step: MFA_CONFIG.step,
      });

      return isValid;
    } catch (error) {
      // En cas d'erreur, ne pas logger de détails
      return false;
    }
  }, 200); // Minimum 200ms pour toutes les vérifications
}

/**
 * Génère des codes de récupération
 */
export function generateBackupCodes(count: number = 10): {
  codes: string[];
  encryptedCodes: any[];
} {
  const codes: string[] = [];
  const encryptedCodes: any[] = [];

  for (let i = 0; i < count; i++) {
    // Génération d'un code de 8 caractères alphanumériques
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
    
    // Chiffrement du code
    const encryptedCode = encryptString(code);
    encryptedCodes.push(encryptedCode);
  }

  return { codes, encryptedCodes };
}

/**
 * Vérifie un code de récupération avec protection timing
 */
export async function verifyBackupCode(
  encryptedBackupCodes: any[],
  userCode: string
): Promise<{ isValid: boolean; codeIndex: number }> {
  const { withConstantTime, constantTimeCompare } = await import('./crypto-timing');
  
  return withConstantTime(async () => {
    try {
      if (!userCode || userCode.length !== 8) {
        // Opération dummy pour maintenir le timing
        constantTimeCompare(userCode || '', 'XXXXXXXX');
        return { isValid: false, codeIndex: -1 };
      }

      const normalizedUserCode = userCode.toUpperCase().trim();
      let foundIndex = -1;

      // Parcourir TOUS les codes pour éviter early exit timing
      for (let i = 0; i < encryptedBackupCodes.length; i++) {
        const encryptedCode = encryptedBackupCodes[i];
        
        if (encryptedCode) { // Code pas encore utilisé
          let decryptedCode: string;
          if (isEncrypted(encryptedCode)) {
            decryptedCode = decryptString(encryptedCode);
          } else {
            decryptedCode = encryptedCode;
          }

          // Comparaison en temps constant
          if (constantTimeCompare(decryptedCode, normalizedUserCode) && foundIndex === -1) {
            foundIndex = i;
          }
        }
      }

      return { 
        isValid: foundIndex !== -1, 
        codeIndex: foundIndex 
      };
    } catch (error) {
      // Pas de logs détaillés pour éviter les fuites d'info
      return { isValid: false, codeIndex: -1 };
    }
  }, 150); // Temps minimum pour backup codes
}

/**
 * Invalide un code de récupération après utilisation
 */
export function invalidateBackupCode(
  encryptedBackupCodes: any[],
  codeIndex: number
): any[] {
  const updatedCodes = [...encryptedBackupCodes];
  updatedCodes[codeIndex] = null; // Marquer comme utilisé
  return updatedCodes;
}

/**
 * Génère un code TOTP actuel (pour tests)
 */
export function generateCurrentTOTP(encryptedSecret: any): string {
  try {
    let secretBase32: string;
    if (isEncrypted(encryptedSecret)) {
      secretBase32 = decryptString(encryptedSecret);
    } else {
      secretBase32 = encryptedSecret;
    }

    return speakeasy.totp({
      secret: secretBase32,
      encoding: MFA_CONFIG.encoding,
      step: MFA_CONFIG.step,
    });
  } catch (error) {
    console.error('Erreur génération TOTP:', error);
    throw new Error('Impossible de générer le code TOTP');
  }
}

/**
 * Vérifie si un utilisateur est verrouillé (trop de tentatives)
 */
export function isUserLocked(failedAttempts: number, lockedUntil?: Date): boolean {
  if (failedAttempts < MFA_CONFIG.maxFailedAttempts) {
    return false;
  }

  if (!lockedUntil) {
    return true;
  }

  return new Date() < lockedUntil;
}

/**
 * Calcule la prochaine date de déverrouillage
 */
export function getUnlockTime(failedAttempts: number): Date | null {
  if (failedAttempts < MFA_CONFIG.maxFailedAttempts) {
    return null;
  }

  return new Date(Date.now() + MFA_CONFIG.lockoutDuration);
}

/**
 * Valide le format d'un code TOTP
 */
export function isValidTOTPFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Valide le format d'un code de récupération
 */
export function isValidBackupCodeFormat(code: string): boolean {
  return /^[A-F0-9]{8}$/i.test(code);
}

/**
 * Compte les codes de récupération restants
 */
export function countRemainingBackupCodes(encryptedBackupCodes: any[]): number {
  return encryptedBackupCodes.filter(code => code !== null).length;
}

// Export de la configuration pour les tests
export { MFA_CONFIG };