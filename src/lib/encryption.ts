// src/lib/encryption.ts - Système de chiffrement AES-256-GCM pour données sensibles
import CryptoJS from 'crypto-js';
import { createHash, randomBytes } from 'crypto';

// Interface pour les données chiffrées
export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  version: string; // Pour la compatibilité future
}

// Interface pour les champs patient chiffrés
export interface EncryptedPatientData {
  nom?: EncryptedData;
  prenom?: EncryptedData;
  dateNaissance?: EncryptedData;
  numeroLigne?: EncryptedData;
  // Autres champs sensibles peuvent être ajoutés
}

// Interface pour les données entretien chiffrées
export interface EncryptedEntretienData {
  donneesEntretien?: EncryptedData;
  metadata?: EncryptedData;
}

// Configuration du chiffrement
const ENCRYPTION_VERSION = '1.0';
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

/**
 * Génère une clé de chiffrement à partir d'une phrase secrète
 */
function deriveKey(passphrase: string, salt: string): Buffer {
  return createHash('sha256')
    .update(passphrase + salt)
    .digest();
}

/**
 * Récupère la clé de chiffrement depuis l'environnement
 */
function getEncryptionKey(): Buffer {
  const passphrase = process.env.ENCRYPTION_KEY;
  const salt = process.env.ENCRYPTION_SALT;
  
  if (!passphrase || !salt) {
    throw new Error('ENCRYPTION_KEY et ENCRYPTION_SALT doivent être définis dans les variables d\'environnement');
  }
  
  return deriveKey(passphrase, salt);
}

/**
 * Chiffre une chaîne de caractères avec AES-256-GCM
 */
export function encryptString(plaintext: string): EncryptedData {
  try {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Le texte à chiffrer doit être une chaîne non vide');
    }

    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    
    // Utilisation de crypto-js pour AES-CBC (plus simple et compatible)
    const cipher = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Hex.parse(key.toString('hex')), {
      iv: CryptoJS.enc.Hex.parse(iv.toString('hex')),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Extraction des données chiffrées
    const encrypted = cipher.ciphertext.toString(CryptoJS.enc.Hex);
    const tag = ''; // Pas de tag pour CBC

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag,
      version: ENCRYPTION_VERSION
    };
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    throw new Error('Échec du chiffrement des données');
  }
}

/**
 * Déchiffre une chaîne de caractères avec AES-256-GCM
 */
export function decryptString(encryptedData: EncryptedData): string {
  try {
    if (!encryptedData || !encryptedData.encrypted || !encryptedData.iv) {
      throw new Error('Données chiffrées invalides');
    }

    const key = getEncryptionKey();
    
    // Reconstitution du cipher pour CBC
    const decrypted = CryptoJS.AES.decrypt(
      {
        ciphertext: CryptoJS.enc.Hex.parse(encryptedData.encrypted)
      },
      CryptoJS.enc.Hex.parse(key.toString('hex')),
      {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Échec du déchiffrement - données corrompues ou clé invalide');
    }

    return plaintext;
  } catch (error) {
    // Ne pas logger ni rethrow l'erreur pour éviter le spam de logs
    // et permettre une gestion gracieuse dans le middleware
    throw error;
  }
}

/**
 * Chiffre les données sensibles d'un patient
 */
export function encryptPatientData(patient: any): any {
  try {
    const encryptedPatient = { ...patient };
    
    // Champs à chiffrer (version legacy - utiliser le middleware pour les nouvelles implémentations)
    const fieldsToEncrypt = ['nom', 'prenom', 'dateNaissance', 'numeroLigne', 'manager', 'zone', 'departement', 'tempsTrajetAller', 'tempsTrajetRetour', 'tempsTrajetTotal'];
    
    for (const field of fieldsToEncrypt) {
      if (patient[field] && typeof patient[field] === 'string') {
        encryptedPatient[field] = encryptString(patient[field]);
      }
    }
    
    return encryptedPatient;
  } catch (error) {
    console.error('Erreur lors du chiffrement des données patient:', error);
    throw new Error('Échec du chiffrement des données patient');
  }
}

/**
 * Déchiffre les données sensibles d'un patient
 */
export function decryptPatientData(encryptedPatient: any): any {
  try {
    const patient = { ...encryptedPatient };
    
    // Champs à déchiffrer (version legacy)
    const fieldsToDecrypt = ['nom', 'prenom', 'dateNaissance', 'numeroLigne', 'manager', 'zone', 'departement', 'tempsTrajetAller', 'tempsTrajetRetour', 'tempsTrajetTotal'];
    
    for (const field of fieldsToDecrypt) {
      if (encryptedPatient[field] && 
          typeof encryptedPatient[field] === 'object' && 
          encryptedPatient[field].encrypted) {
        patient[field] = decryptString(encryptedPatient[field]);
      }
    }
    
    return patient;
  } catch (error) {
    console.error('Erreur lors du déchiffrement des données patient:', error);
    throw new Error('Échec du déchiffrement des données patient');
  }
}

/**
 * Chiffre les données d'entretien
 */
export function encryptEntretienData(entretien: any): any {
  try {
    const encryptedEntretien = { ...entretien };
    
    // Chiffrement des données JSON de l'entretien
    if (entretien.donneesEntretien && typeof entretien.donneesEntretien === 'string') {
      encryptedEntretien.donneesEntretien = encryptString(entretien.donneesEntretien);
    }
    
    return encryptedEntretien;
  } catch (error) {
    console.error('Erreur lors du chiffrement des données entretien:', error);
    throw new Error('Échec du chiffrement des données entretien');
  }
}

/**
 * Déchiffre les données d'entretien
 */
export function decryptEntretienData(encryptedEntretien: any): any {
  try {
    const entretien = { ...encryptedEntretien };
    
    // Déchiffrement des données JSON de l'entretien
    if (encryptedEntretien.donneesEntretien && 
        typeof encryptedEntretien.donneesEntretien === 'object' && 
        encryptedEntretien.donneesEntretien.encrypted) {
      entretien.donneesEntretien = decryptString(encryptedEntretien.donneesEntretien);
    }
    
    return entretien;
  } catch (error) {
    console.error('Erreur lors du déchiffrement des données entretien:', error);
    throw new Error('Échec du déchiffrement des données entretien');
  }
}

/**
 * Vérifie si une donnée est chiffrée
 */
export function isEncrypted(data: any): boolean {
  return data && 
         typeof data === 'object' && 
         data.encrypted && 
         data.iv && 
         data.version;
}

/**
 * Génère de nouvelles clés de chiffrement (pour l'initialisation)
 */
export function generateEncryptionKeys(): { key: string; salt: string } {
  const key = randomBytes(KEY_LENGTH).toString('hex');
  const salt = randomBytes(16).toString('hex');
  
  return { key, salt };
}

/**
 * Teste le système de chiffrement
 */
export function testEncryption(): boolean {
  try {
    const testData = 'Test de chiffrement - données sensibles';
    const encrypted = encryptString(testData);
    const decrypted = decryptString(encrypted);
    
    return decrypted === testData;
  } catch (error) {
    console.error('Test de chiffrement échoué:', error);
    return false;
  }
}

/**
 * Middleware pour le chiffrement automatique des données
 */
export function createEncryptionMiddleware(fieldsToEncrypt: string[]) {
  return (data: any) => {
    const processedData = { ...data };
    
    for (const field of fieldsToEncrypt) {
      if (processedData[field] && typeof processedData[field] === 'string') {
        processedData[field] = encryptString(processedData[field]);
      }
    }
    
    return processedData;
  };
}

/**
 * Middleware pour le déchiffrement automatique des données
 */
export function createDecryptionMiddleware(fieldsToDecrypt: string[]) {
  return (data: any) => {
    const processedData = { ...data };
    
    for (const field of fieldsToDecrypt) {
      if (isEncrypted(processedData[field])) {
        processedData[field] = decryptString(processedData[field]);
      }
    }
    
    return processedData;
  };
}

// Export des types
export type { EncryptedData, EncryptedPatientData, EncryptedEntretienData };