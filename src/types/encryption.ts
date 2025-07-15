// src/types/encryption.ts - Types TypeScript pour le système de chiffrement
export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  version: string;
}

export interface EncryptedPatientData {
  id: number;
  civilites: string;
  nom: EncryptedData | string;
  prenom: EncryptedData | string;
  dateNaissance: EncryptedData | string;
  age: number;
  etatCivil: string;
  poste: string;
  numeroLigne?: EncryptedData | string;
  manager: string;
  zone: string;
  horaire?: string;
  contrat: string;
  tauxActivite: string;
  departement: string;
  dateEntree: string;
  anciennete: string;
  tempsTrajetAller: string;
  tempsTrajetRetour: string;
  typeTransport: string;
  numeroEntretien?: number;
  nomEntretien?: string;
  dateEntretien?: string;
  heureDebut?: string;
  heureFin?: string;
  duree?: string;
  typeEntretien?: string;
  consentement?: string;
  dateCreation?: string;
  createdAt: Date;
  updatedAt: Date;
  tempsTrajetTotal?: string;
}

export interface EncryptedEntretienData {
  id: number;
  patientId: number;
  numeroEntretien: number;
  dateCreation: Date;
  dateModification: Date;
  status: string;
  isTemplate: boolean;
  baseEntretienId?: number;
  donneesEntretien: EncryptedData | string;
  tempsDebut?: Date;
  tempsFin?: Date;
  tempsPause?: number;
  enPause: boolean;
  dernierePause?: Date;
  patient?: EncryptedPatientData;
}

export interface EncryptedUserProfileData {
  id: string;
  userId: string;
  name?: EncryptedData | string;
  email: string;
  role: string;
  isActive: boolean;
  isWhitelisted: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Types pour les fonctions d'encryption/decryption
export type EncryptionFunction<T> = (data: T) => T;
export type DecryptionFunction<T> = (data: T) => T;

// Types pour les middlewares
export interface EncryptionMiddlewareOptions {
  fieldsToEncrypt: string[];
  modelName: string;
  skipEncryption?: boolean;
}

export interface DecryptionMiddlewareOptions {
  fieldsToDecrypt: string[];
  modelName: string;
  skipDecryption?: boolean;
}

// Types pour la configuration du chiffrement
export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  version: string;
}

// Types pour les erreurs de chiffrement
export class EncryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

// Types pour les clés de chiffrement
export interface EncryptionKeys {
  key: string;
  salt: string;
}

// Types pour les résultats de test
export interface EncryptionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

// Types pour les logs de chiffrement
export interface EncryptionLogEntry {
  timestamp: Date;
  action: 'encrypt' | 'decrypt';
  model: string;
  recordId?: number | string;
  success: boolean;
  error?: string;
}

// Types pour les migrations
export interface EncryptionMigrationResult {
  totalRecords: number;
  encryptedRecords: number;
  errors: string[];
  duration: number;
}

// Types pour les audits
export interface EncryptionAuditResult {
  model: string;
  totalRecords: number;
  encryptedRecords: number;
  unencryptedRecords: number;
  corruptedRecords: number;
  issues: string[];
}

// Types pour les statistiques
export interface EncryptionStats {
  totalEncryptions: number;
  totalDecryptions: number;
  averageEncryptionTime: number;
  averageDecryptionTime: number;
  errorRate: number;
  lastActivity: Date;
}

// Union types pour les données mixtes
export type MixedPatientData = EncryptedPatientData | any;
export type MixedEntretienData = EncryptedEntretienData | any;

// Types pour les hooks
export interface UseEncryptionHookResult {
  encrypt: (data: any) => Promise<any>;
  decrypt: (data: any) => Promise<any>;
  isEncrypted: (data: any) => boolean;
  testEncryption: () => Promise<EncryptionTestResult>;
}

// Types pour les composants
export interface EncryptionStatusProps {
  enabled: boolean;
  stats?: EncryptionStats;
  onToggle?: (enabled: boolean) => void;
}

export interface EncryptionTestProps {
  onTestComplete?: (result: EncryptionTestResult) => void;
}

// Types pour les utilitaires
export interface EncryptionUtilsConfig {
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  enableStats: boolean;
  enableAudit: boolean;
}

// Export des constantes
export const ENCRYPTION_CONSTANTS = {
  VERSION: '1.0',
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  MAX_RETRIES: 3,
  TIMEOUT: 5000
} as const;

// Export des types d'erreurs
export const ENCRYPTION_ERROR_CODES = {
  INVALID_KEY: 'INVALID_KEY',
  INVALID_DATA: 'INVALID_DATA',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  CORRUPTED_DATA: 'CORRUPTED_DATA',
  MISSING_CONFIG: 'MISSING_CONFIG',
  TIMEOUT: 'TIMEOUT'
} as const;

export type EncryptionErrorCode = keyof typeof ENCRYPTION_ERROR_CODES;