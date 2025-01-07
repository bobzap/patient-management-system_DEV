// src/components/entretiens/types/defaultData.ts

export const defaultVecuTravailData = {
    motifVisite: {
      motif: '',
      commentaires: ''
    },
    postesOccupes: '',
    posteDeTravail: {
      descriptionTaches: '',
      risquesProfessionnels: '',
      installationMateriel: ''
    },
    ressentiTravail: {
      relationCollegues: 5,
      relationHierarchie: 5,
      stress: 5,
      satisfaction: 5,
      commentaires: ''
    },
    plaintesTravail: {
      existence: false,
      commentaires: ''
    }
  };
  
  export const defaultModeVieData = {
    loisirs: {
      activitePhysique: false,
      frequence: '',
      commentaires: ''
    },
    addictions: {
      tabac: {
        consommation: false,
        quantiteJour: '',
        depuis: ''
      },
      medicaments: {
        consommation: false,
        depuis: '',
        quantiteInfDix: false,
        frequence: ''
      },
      alcool: {
        consommation: false,
        quantiteSupDix: false,
        frequence: ''
      },
      cannabis: {
        consommation: false,
        depuis: '',
        quantiteInfDix: false,
        frequence: ''
      },
      droguesDures: {
        consommation: false,
        depuis: '',
        frequence: ''
      },
      commentairesGeneraux: ''
    }
  };
  
  export const defaultEntretienData = {
    santeTravail: {
      vecuTravail: defaultVecuTravailData,
      modeVie: defaultModeVieData
    },
    examenClinique: {},
    imaa: {},
    conclusion: {}
  };