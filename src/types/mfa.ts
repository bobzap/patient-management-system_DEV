// src/types/mfa.ts - Types pour la double authentification
import { EncryptedData } from './encryption';

// Statut MFA d'un utilisateur
export interface MFAStatus {
  isEnabled: boolean;
  hasBackupCodes: boolean;
  remainingBackupCodes: number;
  lastUsedAt?: Date;
  isLocked: boolean;
  unlockAt?: Date;
}

// Configuration MFA lors de l'initialisation
export interface MFASetupData {
  secret: EncryptedData;
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

// Données MFA stockées en base (chiffrées)
export interface StoredMFAData {
  secret: EncryptedData;
  backupCodes: EncryptedData[];
  isEnabled: boolean;
  failedAttempts: number;
  lockedUntil?: Date;
}

// Requête de vérification MFA
export interface MFAVerificationRequest {
  code: string;
  isBackupCode?: boolean;
}

// Réponse de vérification MFA
export interface MFAVerificationResponse {
  success: boolean;
  remainingBackupCodes?: number;
  isLocked?: boolean;
  unlockAt?: Date;
  error?: string;
}

// Événement d'audit MFA
export interface MFALogEvent {
  userId: string;
  action: 'SETUP' | 'ENABLE' | 'DISABLE' | 'VERIFY_SUCCESS' | 'VERIFY_FAIL' | 'BACKUP_USED' | 'UNLOCK';
  success: boolean;
  details?: {
    isBackupCode?: boolean;
    failedAttempts?: number;
    timestamp: string;
  };
}

// Configuration MFA globale
export interface MFAConfig {
  issuer: string;
  window: number;
  step: number;
  digits: number;
  encoding: 'base32';
  maxFailedAttempts: number;
  lockoutDuration: number;
  mandatory?: boolean; // Si la 2FA est obligatoire
}

// États du processus d'activation MFA
export type MFASetupStep = 
  | 'disabled'     // 2FA désactivée
  | 'generating'   // Génération du secret en cours
  | 'verifying'    // Vérification du code initial
  | 'backup-codes' // Affichage des codes de récupération
  | 'enabled';     // 2FA activée

// Props pour les composants MFA
export interface MFAComponentProps {
  onStepChange?: (step: MFASetupStep) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export interface QRCodeDisplayProps extends MFAComponentProps {
  qrCodeUrl: string;
  manualEntryKey: string;
}

export interface BackupCodesDisplayProps extends MFAComponentProps {
  codes: string[];
}

export interface MFAVerificationProps extends MFAComponentProps {
  isRequired?: boolean;
  allowBackupCode?: boolean;
  onVerificationSuccess?: () => void;
}