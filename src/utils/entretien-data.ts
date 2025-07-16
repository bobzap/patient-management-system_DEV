// src/utils/entretien-data.ts - Utilitaires pour les données d'entretien

import { safeJsonParse } from './json';

export interface EntretienDataValidation {
  isValid: boolean;
  data: any;
  errors: string[];
}

/**
 * Valider et nettoyer les données d'un entretien
 */
export function validateEntretienData(donneesEntretien: any): EntretienDataValidation {
  const errors: string[] = [];
  let data = {};

  // Si c'est une chaîne, essayer de la parser
  if (typeof donneesEntretien === 'string') {
    const parseResult = safeJsonParse(donneesEntretien);
    if (!parseResult.success) {
      errors.push(`Erreur de parsing JSON: ${parseResult.error}`);
      return { isValid: false, data: {}, errors };
    }
    data = parseResult.data || {};
  } else if (donneesEntretien && typeof donneesEntretien === 'object') {
    data = donneesEntretien;
  } else {
    // Valeur null, undefined ou autre type
    data = {};
  }

  // Validation de la structure des données
  const validatedData = {
    numeroEntretien: data.numeroEntretien || 0,
    status: data.status || 'brouillon',
    santeTravail: {
      vecuTravail: data.santeTravail?.vecuTravail || {},
      modeVie: data.santeTravail?.modeVie || {}
    },
    examenClinique: data.examenClinique || {},
    imaa: data.imaa || {},
    conclusion: data.conclusion || {}
  };

  return {
    isValid: errors.length === 0,
    data: validatedData,
    errors
  };
}

/**
 * Données par défaut pour un nouvel entretien
 */
export function getDefaultEntretienData(): any {
  return {
    numeroEntretien: 0,
    status: 'brouillon',
    santeTravail: {
      vecuTravail: {},
      modeVie: {}
    },
    examenClinique: {},
    imaa: {},
    conclusion: {}
  };
}

/**
 * Merger des données d'entretien de manière sécurisée
 */
export function mergeEntretienData(existingData: any, newData: any): any {
  const safeExisting = existingData || {};
  const safeNew = newData || {};

  return {
    numeroEntretien: safeNew.numeroEntretien || safeExisting.numeroEntretien || 0,
    status: safeNew.status || safeExisting.status || 'brouillon',
    santeTravail: {
      vecuTravail: { ...safeExisting.santeTravail?.vecuTravail, ...safeNew.santeTravail?.vecuTravail },
      modeVie: { ...safeExisting.santeTravail?.modeVie, ...safeNew.santeTravail?.modeVie }
    },
    examenClinique: { ...safeExisting.examenClinique, ...safeNew.examenClinique },
    imaa: { ...safeExisting.imaa, ...safeNew.imaa },
    conclusion: { ...safeExisting.conclusion, ...safeNew.conclusion }
  };
}