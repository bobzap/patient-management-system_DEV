// src/types/index.ts

export interface ListItem {
  id: number;
  value: string;
  order: number;
  categoryId: number;
}

export interface ListCategory {
  id: number;
  listId: string;
  name: string;
  items: ListItem[];
}

export interface FormattedLists {
  [key: string]: string[];
}

export interface Patient {
  id?: number;
  civilites: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  age: number;
  etatCivil: string;
  poste: string;
  numeroLigne?: string; // Nouveau champ optionnel
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
  tempsTrajetTotal?: string; 
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Entretien {
  id: number;
  patientId: number;
  numeroEntretien: number;
  dateCreation: string | Date;
  dateModification: string | Date;
  status: 'brouillon' | 'finalise' | 'archive';
  isTemplate: boolean;
  baseEntretienId?: number | null;
  donneesEntretien: string;
  tempsDebut?: string | Date | null;
  tempsFin?: string | Date | null;
  tempsPause?: number | null;
  enPause: boolean;
  dernierePause?: string | Date | null;
}

export interface RisqueProfessionnel {
  id: number;
  nom: string;
  lien: string;
  estFavori: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Métriques pour le tableau de bord
export interface DashboardMetrics {
  // Métriques générales
  totalEntretiens: number;
  totalHeures: number;
  totalPatients: number;
  
  // Répartition des entretiens par statut
  entretiensByStatus: {
    brouillon: number;
    finalise: number;
    archive: number;
  };
  
  // Types de visites
  typesVisites: Record<string, number>;
  
  // Risques professionnels identifiés
  risquesProfessionnels: {
    id: number;
    nom: string;
    count: number;
  }[];
  
  // Limitations et orientations médicales
  visiteMedicalePlanifiee: number;
  limitationsActives: number;
  etudePostePrevue: number;
  entretienManagerPrevu: number;
  
  // Données pour la détection précoce
  detectionPrecoce: {
    risqueEleve: number;
    risqueMoyen: number;
    risqueFaible: number;
  };
  
  // Graphique d'activité par mois
  activiteParMois: {
    mois: string;
    count: number;
  }[];
  
  // Tendances et évolutions
  tendances: {
    croissanceEntretiens: number; // % de croissance par rapport au mois précédent
    tempsMoyenEntretien: number; // en minutes
    tauxFinalisation: number; // % d'entretiens finalisés
  };
  
  // Données récentes pour le feed d'activité
  recentsEntretiens: any[];
}

export type NavigationTab = 'dashboard' | 'patients' | 'newDossier' | 'admin';