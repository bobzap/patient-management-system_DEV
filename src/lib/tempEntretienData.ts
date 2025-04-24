// src/lib/tempEntretienData.ts
interface EntretienDataStore {
    [entretienId: number]: any;
  }
  
  let temporaryData: EntretienDataStore = {};
  
  export function setTempData(entretienId: number, data: any) {
    console.log(`Stockage des données pour l'entretien ${entretienId}`);
    temporaryData[entretienId] = data;
  }
  
  export function getTempData(entretienId: number) {
    console.log(`Récupération des données pour l'entretien ${entretienId}`);
    return temporaryData[entretienId] || null;
  }