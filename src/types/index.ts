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
  createdAt?: Date;
  updatedAt?: Date;
}
  
  export type NavigationTab = 'dashboard' | 'patients' | 'newDossier';