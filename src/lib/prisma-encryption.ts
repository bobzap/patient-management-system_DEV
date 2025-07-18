// src/lib/prisma-encryption.ts - Middleware Prisma pour chiffrement automatique
import { Prisma } from '@prisma/client';
import { encryptString, decryptString } from './encryption';

// Types pour les middlewares
type PrismaMiddleware = (
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) => Promise<any>;

// Champs à chiffrer par modèle
const ENCRYPTED_FIELDS = {
  Patient: [
    // Identité personnelle (CRITIQUE)
    'nom', 'prenom', 'dateNaissance', 'numeroLigne',
    // Informations professionnelles sensibles (ÉLEVÉ)
    'manager', 'zone', 'departement',
    // Données de transport (MOYEN - peuvent révéler domicile)
    'tempsTrajetAller', 'tempsTrajetRetour', 'tempsTrajetTotal'
  ],
  Entretien: [
    // Contenu médical/psychologique (CRITIQUE)
    'donneesEntretien',
    // Métadonnées sensibles (ÉLEVÉ)
    'nomEntretien', 'consentement',
    // Horaires et durée (MOYEN - patterns comportementaux)
    'heureDebut', 'heureFin', 'duree'
  ],
  UserProfile: [
    // Données personnelles utilisateur (CRITIQUE)
    'email', 'name'
  ],
  CalendarEvent: [
    // Titres contenant des noms de patients (CRITIQUE)
    'title', 'description',
    // Métadonnées potentiellement sensibles (MOYEN)
    'metadata'
  ],
  PatientConsent: [
    // Commentaires pouvant contenir des informations sensibles (ÉLEVÉ)
    'commentaire',
    // Informations de traçabilité (MOYEN)
    'ipAddress', 'userAgent'
  ],
  ConsentHistory: [
    // Raisons de modification pouvant être sensibles (ÉLEVÉ)
    'raisonModification',
    // Informations de traçabilité (MOYEN)
    'ipAddress', 'userAgent'
  ]
};

/**
 * Middleware unique pour chiffrement/déchiffrement automatique
 */
export const encryptionMiddleware: PrismaMiddleware = async (params, next) => {
  const modelFields = ENCRYPTED_FIELDS[params.model as keyof typeof ENCRYPTED_FIELDS];
  
  if (!modelFields) {
    // Modèle non concerné par le chiffrement
    return await next(params);
  }

  // ÉTAPE 1: Chiffrement avant stockage
  if (['create', 'update', 'upsert'].includes(params.action)) {
    await encryptFields(params, modelFields);
  }

  // ÉTAPE 2: Exécution de la requête
  const result = await next(params);

  // ÉTAPE 3: Déchiffrement après lecture (lectures ET retour de création)
  if (result && ['findMany', 'findFirst', 'findUnique', 'create', 'update', 'upsert'].includes(params.action)) {
    if (Array.isArray(result)) {
      return result.map(item => decryptFields(item, modelFields));
    } else if (result && typeof result === 'object') {
      return decryptFields(result, modelFields);
    }
  }

  return result;
};

/**
 * Chiffre les champs sensibles avant stockage
 */
async function encryptFields(params: any, fields: string[]): Promise<void> {
  const data = params.data || params.args?.data;
  if (!data) return;

  for (const field of fields) {
    if (data[field] && typeof data[field] === 'string') {
      try {
        const encrypted = encryptString(data[field]);
        data[field] = JSON.stringify(encrypted);
      } catch (error) {
        console.error(`Erreur chiffrement ${field}:`, error);
        // Ne pas bloquer l'opération en cas d'erreur
      }
    }
  }

  // Gestion des opérations upsert
  if (params.action === 'upsert' && params.args?.data) {
    if (params.args.data.create) {
      await encryptFields({ data: params.args.data.create }, fields);
    }
    if (params.args.data.update) {
      await encryptFields({ data: params.args.data.update }, fields);
    }
  }
}

/**
 * Déchiffre les champs après lecture
 */
function decryptFields(item: any, fields: string[]): any {
  if (!item || typeof item !== 'object') return item;

  const decrypted = { ...item };

  for (const field of fields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        // Tentative de parsing JSON pour vérifier si c'est chiffré
        const encrypted = JSON.parse(decrypted[field]);
        if (encrypted.encrypted && encrypted.iv) {
          try {
            decrypted[field] = decryptString(encrypted);
          } catch (decryptError) {
            // Échec de déchiffrement silencieux pour la sécurité
            decrypted[field] = '[DONNÉES CORROMPUES]';
          }
        }
      } catch {
        // Si ce n'est pas du JSON valide, garder la valeur originale
        // (données non chiffrées ou en clair)
      }
    }
  }

  return decrypted;
}

/**
 * Configure le middleware sur une instance Prisma
 */
export function setupEncryption(prisma: any): void {
  if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_SALT) {
    console.warn('⚠️ Chiffrement désactivé - Variables d\'environnement manquantes');
    return;
  }

  prisma.$use(encryptionMiddleware);
}

/**
 * Vérifie si le chiffrement est activé
 */
export function isEncryptionEnabled(): boolean {
  return !!(process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_SALT);
}