// src/lib/entretienUtils.ts
export function parseEntretienData(jsonString: string) {
    try {
      // Parser la chaîne JSON
      const data = JSON.parse(jsonString);
      return data;
    } catch (error) {
      console.error('Erreur de parsing des données d\'entretien:', error);
      // Retourner un objet vide en cas d'erreur
      return {};
    }
  }