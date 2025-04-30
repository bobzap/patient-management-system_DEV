// src/components/entretiens/sections/ExamenClinique/types.ts
export interface BiometrieData {
    taille: string;
    poids: string;
    tension: string;
    pouls: string;
    temperature: string;
    glycemie: string;
    saturation: string;
    imc: string;
  }
  
  export interface AppareilsData {
    yeuxAnnexes: {
      bilanOPH: boolean;
      commentairesORL: string;
      commentairesOPH: string;
    };
    cardioPulmonaire: {
      bilanCardio: boolean;
      commentaires: string;
    };
    appareilDigestif: {
      commentaires: string;
    };
    uroGenital: {
      suiviGyneco: boolean;
      commentaires: string;
    };
    osteoArticulaire: {
      plainteEvoquee: boolean;
      commentairesDouleurs: string;
    };
    neuroPsy: {
      sommeilBon: boolean;
      commentaires: string;
    };
    endocrinoMetabolisme: {
      dernierBilan: string;
    };
  }
  
  export interface AntecedentsData {
    medicaux: {
      existence: boolean;
      description: string;
      commentaires: string;
    };
    chirurgicaux: {
      existence: boolean;
      description: string;
      commentaires: string;
    };
      // Nouveaux champs pour les antécédents familiaux
  familiaux: {
    existence: boolean;
    pere: string;
    mere: string;
    autres: string;
  };
  // Nouveaux champs pour les antécédents professionnels
  professionnels: {
    existence: boolean;
    postes: Array<{
      posteOccupe: string;
      dateDebut: string;
      dateFin: string;
      entreprise: string;
    }>;
  };
}
 
  
  export interface TraitementsData {
    medicaments: {
      existence: boolean;
      description: string;
      commentaires: string;
    };
    vaccination: {
      aJour: boolean;
      commentaires: string;
    };
  }
  
  export interface ExamenCliniqueData {
    biometrie: BiometrieData;
    appareils: AppareilsData;
    antecedents: AntecedentsData;
    traitements: TraitementsData;
  }