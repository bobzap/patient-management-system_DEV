// src/utils/json.ts - Utilitaires pour le parsing JSON sécurisé

export interface SafeJsonResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Parse JSON de manière sécurisée avec gestion d'erreur
 */
export function safeJsonParse<T = any>(jsonString: string): SafeJsonResult<T> {
  if (!jsonString || typeof jsonString !== 'string' || jsonString.trim() === '') {
    return { success: false, error: 'Chaîne JSON vide ou invalide' };
  }

  try {
    const data = JSON.parse(jsonString);
    return { success: true, data };
  } catch (firstError) {
    // Essayer de nettoyer les caractères de contrôle
    try {
      const cleanedData = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      const data = JSON.parse(cleanedData);
      return { success: true, data };
    } catch (secondError) {
      return { 
        success: false, 
        error: `Erreur de parsing JSON: ${firstError instanceof Error ? firstError.message : String(firstError)}` 
      };
    }
  }
}

/**
 * Vérifier si une réponse HTTP contient du JSON
 */
export function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return contentType !== null && contentType.includes('application/json');
}

/**
 * Parser une réponse HTTP de manière sécurisée
 */
export async function safeParseResponse<T = any>(response: Response): Promise<SafeJsonResult<T>> {
  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `Erreur HTTP ${response.status}: ${errorText}` };
  }

  if (!isJsonResponse(response)) {
    const text = await response.text();
    return { success: false, error: `Réponse non-JSON reçue: ${text}` };
  }

  try {
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: `Erreur de parsing de la réponse: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}