// src/services/dashboard-analysis.ts
import { Entretien, Patient } from '@/types';

interface EntretienWithData extends Entretien {
  donneesObject?: any;
  patient?: Patient;
}

interface DashboardMetrics {
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
  
  // Données pour la détection précoce (IMAA - à venir)
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
  recentsEntretiens: EntretienWithData[];
}

// Fonction principale pour analyser les données des entretiens
export async function analyzeEntretiensData(
  entretiens: EntretienWithData[],
  patients: Patient[]
): Promise<DashboardMetrics> {
  // Pour les tests initiaux, nous créons un modèle avec des données d'exemple
  const metrics: DashboardMetrics = {
    totalEntretiens: entretiens.length,
    totalHeures: 0,
    totalPatients: patients.length,
    
    entretiensByStatus: {
      brouillon: 0,
      finalise: 0,
      archive: 0
    },
    
    typesVisites: {},
    
    risquesProfessionnels: [],
    
    visiteMedicalePlanifiee: 0,
    limitationsActives: 0,
    etudePostePrevue: 0,
    entretienManagerPrevu: 0,
    
    detectionPrecoce: {
      risqueEleve: 0,
      risqueMoyen: 0,
      risqueFaible: 0
    },
    
    activiteParMois: [],
    
    tendances: {
      croissanceEntretiens: 0,
      tempsMoyenEntretien: 0,
      tauxFinalisation: 0
    },
    
    recentsEntretiens: []
  };
  
  // Traiter chaque entretien pour extraire les données
  let totalSeconds = 0;
  
  const risquesMap = new Map<number, { id: number; nom: string; count: number }>();
  const typesVisitesMap = new Map<string, number>();
  const activiteParMoisMap = new Map<string, number>();
  
  // Parcourir tous les entretiens pour extraire les données
  for (const entretien of entretiens) {
    // Compter par statut
    metrics.entretiensByStatus[entretien.status]++;
    
    // Calculer le temps total
    let dureeEntretien = 0;
    
    // Si l'entretien a un temps de début et soit un temps de fin soit est en cours
    if (entretien.tempsDebut) {
      const debut = new Date(entretien.tempsDebut);
      const fin = entretien.tempsFin ? new Date(entretien.tempsFin) : new Date();
      
      dureeEntretien = Math.floor((fin.getTime() - debut.getTime()) / 1000);
      
      // Soustraire le temps de pause si disponible
      if (entretien.tempsPause) {
        dureeEntretien -= entretien.tempsPause;
      }
      
      // Si en pause et qu'il y a une dernière pause, soustraire ce temps aussi
      if (entretien.enPause && entretien.dernierePause) {
        const dernierePause = new Date(entretien.dernierePause);
        const pauseDuration = Math.floor((new Date().getTime() - dernierePause.getTime()) / 1000);
        dureeEntretien -= pauseDuration;
      }
      
      totalSeconds += Math.max(0, dureeEntretien);
    }
    
    // Analyser les données structurées de l'entretien
    try {
      let donneesObject = entretien.donneesObject;
      
      // Si les données sont une chaîne, essayer de les parser
      if (typeof entretien.donneesEntretien === 'string' && !donneesObject) {
        try {
          donneesObject = JSON.parse(entretien.donneesEntretien);
          entretien.donneesObject = donneesObject; // Stocker pour réutilisation
        } catch (e) {
          console.warn('Impossible de parser les données de l\'entretien', entretien.id);
        }
      }
      
      if (donneesObject) {
        // Extraire les types de visites (motifs)
        const motifs = donneesObject.santeTravail?.vecuTravail?.motifVisite?.motifs || [];
        for (const motif of motifs) {
          const count = typesVisitesMap.get(motif) || 0;
          typesVisitesMap.set(motif, count + 1);
        }
        
        // Extraire les risques professionnels
        const risques = donneesObject.conclusion?.prevention?.risquesProfessionnels || [];
        for (const risque of risques) {
          if (risque.id && risque.nom) {
            const existingRisque = risquesMap.get(risque.id);
            if (existingRisque) {
              existingRisque.count++;
            } else {
              risquesMap.set(risque.id, {
                id: risque.id,
                nom: risque.nom,
                count: 1
              });
            }
          }
        }
        
        // Vérifier les visites médicales planifiées
        if (donneesObject.conclusion?.actions?.visiteMedicale?.aPlanifier) {
          metrics.visiteMedicalePlanifiee++;
        }
        
        // Vérifier les limitations actives
        if (donneesObject.conclusion?.limitation?.hasLimitation) {
          metrics.limitationsActives++;
        }
        
        // Vérifier les études de poste prévues
        if (donneesObject.conclusion?.actions?.etudePoste?.aFaire) {
          metrics.etudePostePrevue++;
        }
        
        // Vérifier les entretiens manager prévus
        if (donneesObject.conclusion?.actions?.manager?.entretienNecessaire) {
          metrics.entretienManagerPrevu++;
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse des données de l\'entretien', entretien.id, error);
    }
    
    // Enregistrer l'activité par mois
    const dateCreation = new Date(entretien.dateCreation);
    const moisKey = `${dateCreation.getFullYear()}-${String(dateCreation.getMonth() + 1).padStart(2, '0')}`;
    const countMois = activiteParMoisMap.get(moisKey) || 0;
    activiteParMoisMap.set(moisKey, countMois + 1);
  }
  
  // Convertir le temps total en heures
  metrics.totalHeures = Math.round((totalSeconds / 3600) * 100) / 100;
  
  // Convertir les Map en tableaux pour les résultats
  metrics.risquesProfessionnels = Array.from(risquesMap.values())
    .sort((a, b) => b.count - a.count);
  
  metrics.typesVisites = Object.fromEntries(typesVisitesMap.entries());
  
  // Trier et formater l'activité par mois
  metrics.activiteParMois = Array.from(activiteParMoisMap.entries())
    .map(([mois, count]) => {
      const [annee, numMois] = mois.split('-');
      const date = new Date(parseInt(annee), parseInt(numMois) - 1, 1);
      return {
        mois: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        count
      };
    })
    .sort((a, b) => {
      // Trier par ordre chronologique
      const dateA = new Date(a.mois);
      const dateB = new Date(b.mois);
      return dateA.getTime() - dateB.getTime();
    });
  
  // Calculer les tendances
  if (metrics.activiteParMois.length >= 2) {
    const dernierMois = metrics.activiteParMois[metrics.activiteParMois.length - 1];
    const avantDernierMois = metrics.activiteParMois[metrics.activiteParMois.length - 2];
    
    if (avantDernierMois.count > 0) {
      metrics.tendances.croissanceEntretiens = 
        Math.round(((dernierMois.count - avantDernierMois.count) / avantDernierMois.count) * 100);
    }
  }
  
  // Calculer le temps moyen des entretiens en minutes
  if (metrics.totalEntretiens > 0) {
    metrics.tendances.tempsMoyenEntretien = Math.round((totalSeconds / metrics.totalEntretiens) / 60);
  }
  
  // Calculer le taux de finalisation
  if (metrics.totalEntretiens > 0) {
    metrics.tendances.tauxFinalisation = 
      Math.round((metrics.entretiensByStatus.finalise / metrics.totalEntretiens) * 100);
  }
  
  // Ajouter les entretiens récents
  metrics.recentsEntretiens = entretiens
    .slice()
    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
    .slice(0, 5);
  
  // Ajouter des données de simulation pour la détection précoce (IMAA - future fonctionnalité)
  metrics.detectionPrecoce = {
    risqueEleve: Math.floor(metrics.totalEntretiens * 0.15),
    risqueMoyen: Math.floor(metrics.totalEntretiens * 0.25),
    risqueFaible: Math.floor(metrics.totalEntretiens * 0.6)
  };
  
  return metrics;
}