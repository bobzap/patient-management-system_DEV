// src/data/mockEntretien.ts
export const mockVecuTravailData = {
    motifVisite: { motif: 'Renseignements', commentaires: 'Discussion annuelle' },
    postesOccupes: 'Opérateur',
    posteDeTravail: {
      descriptionTaches: 'Travail sur machine',
      risquesProfessionnels: 'Exposition au bruit',
      installationMateriel: 'Bureau ergonomique'
    },
    ressentiTravail: {
      relationCollegues: 8,
      relationHierarchie: 7,
      stress: 6,
      satisfaction: 7,
      commentaires: 'Bonne ambiance générale'
    },
    plaintesTravail: {
      existence: false,
      commentaires: ''
    }
  };
  
  export const mockModeVieData = {
    loisirs: {
      activitePhysique: true,
      frequence: '2 fois par semaine',
      commentaires: 'Course à pied'
    },
    addictions: {
      tabac: { consommation: false, quantiteJour: '', depuis: '' },
      medicaments: { consommation: false, depuis: '', quantiteInfDix: false, frequence: '' },
      alcool: { consommation: true, quantiteSupDix: false, frequence: 'Occasionnel' },
      cannabis: { consommation: false, depuis: '', quantiteInfDix: false, frequence: '' },
      droguesDures: { consommation: false, depuis: '', frequence: '' },
      commentairesGeneraux: ''
    }
  };