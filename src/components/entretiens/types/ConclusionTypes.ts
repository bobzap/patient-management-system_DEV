// src/components/entretiens/types/ConclusionTypes.ts

// Modifiez PreventionData pour inclure les risques professionnels
export interface PreventionData {
  conseilsDonnes: string;
  troublesLiesTravail: string[];
  risquesProfessionnels: Array<{
    id: number;
    nom: string;
    lien: string;
  }>;
}
  
  export interface LimitationData {
    hasLimitation: boolean;
    dureeType: 'definitive' | 'temporaire';
    dureeJours?: number;
    commentaire: string;
  }
  
  export interface OrientationData {
    selected: string[];
    commentaire: string;
  }
  
  export interface EtudePosteData {
    aFaire: boolean;
    commentaire: string;
  }
  
  export interface ManagerData {
    entretienNecessaire: boolean;
    managerSelectionne: string;
    commentaire: string;
    dateRappel: string;
  }
  
  export interface EntretienData {
    aPrevoir: boolean;
    dateRappel: string;
  }
  
  export interface MedecinData {
    echangeNecessaire: boolean;
    commentaire: string;
  }
  
  export interface VisiteMedicaleData {
    aPlanifier: boolean;
    dateRappel: string;
    commentaire: string;
  }
  
  export interface ActionData {
    orientation: OrientationData;
    etudePoste: EtudePosteData;
    manager: ManagerData;
    entretien: EntretienData;
    medecin: MedecinData;
    visiteMedicale: VisiteMedicaleData;
  }
  

// Type principal regroupant toutes les données de conclusion

export interface ConclusionData {
  prevention: Record<string, any>;
  limitation: Record<string, any>;
  actions: Record<string, any>;
}


