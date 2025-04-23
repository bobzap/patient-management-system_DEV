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
  






  export const defaultExamenCliniqueData = {
    biometrie: {
      taille: '',
      poids: '',
      tension: '',
      pouls: '',
      temperature: '',
      glycemie: '',
      saturation: '',
      imc: ''
    },
    appareils: {
      yeuxAnnexes: {
        bilanOPH: false,
        commentairesORL: '',
        commentairesOPH: ''
      },
      cardioPulmonaire: {
        bilanCardio: false,
        commentaires: ''
      },
      appareilDigestif: {
        commentaires: ''
      },
      uroGenital: {
        suiviGyneco: false,
        commentaires: ''
      },
      osteoArticulaire: {
        plainteEvoquee: false,
        commentairesDouleurs: ''
      },
      neuroPsy: {
        sommeilBon: false,
        commentaires: ''
      },
      endocrinoMetabolisme: {
        dernierBilan: ''
      }
    },
    antecedents: {
      medicaux: {
        existence: false,
        description: '',
        commentaires: ''
      },
      chirurgicaux: {
        existence: false,
        description: '',
        commentaires: ''
      }
    },
    traitements: {
      medicaments: {
        existence: false,
        description: '',
        commentaires: ''
      },
      vaccination: {
        aJour: false,
        commentaires: ''
      }
    }
  };





  export const defaultConclusionData = {
    prevention: {
      conseilsDonnes: '',
      troublesLiesTravail: []
    },
    limitation: {
      hasLimitation: false,
      dureeType: 'temporaire' as const,
      dureeJours: 0,
      commentaire: ''
    },
    actions: {
      orientation: {
        selected: [],
        commentaire: ''
      },
      etudePoste: {
        aFaire: false,
        commentaire: ''
      },
      manager: {
        entretienNecessaire: false,
        managerSelectionne: '',
        commentaire: '',
        dateRappel: ''
      },
      entretien: {
        aPrevoir: false,
        dateRappel: ''
      },
      medecin: {
        echangeNecessaire: false,
        commentaire: ''
      },
      visiteMedicale: {
        aPlanifier: false,
        dateRappel: '',
        commentaire: ''
      }
    }
  };
  
  // Mettre à jour defaultEntretienData pour inclure conclusion
  export const defaultEntretienData = {
    santeTravail: {
      vecuTravail: defaultVecuTravailData,
      modeVie: defaultModeVieData
    },
    examenClinique: defaultExamenCliniqueData,
    imaa: {},
    conclusion: defaultConclusionData,
  };