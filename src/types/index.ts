export interface Patient {
    id: number;
    dateCreation: string;
    numeroEntretien: number;
    nomEntretien: string;
    dateEntretien: string;
    heureDebut: string;
    heureFin: string;
    duree: string;
    nom: string;
    prenom: string;
    civilite: 'M.' | 'Mme' | 'Autre';
    dateNaissance: string;
    age: number;
    poste: string;
    manager: string;
    zone: string;
    horaire: string;
    contrat: string;
    tauxActivite: string;
    consentement: 'oui' | 'non' | 'non renseigné';
    departement: string;
    typeEntretien: string;
    dateEntree: string;
    anciennete: string;
  }
  
  export type NavigationTab = 'dashboard' | 'patients' | 'newDossier';