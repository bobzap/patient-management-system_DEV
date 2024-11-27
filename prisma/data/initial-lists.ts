// prisma/data/initial-lists.ts

interface ListCategory {
  listId: string;
  name: string;
  items: string[];
}

export const initialLists: ListCategory[] = [
  {
    listId: 'horaires',
    name: 'Horaires',
    items: ['Matin', 'Journée', 'Soir', 'Nuit']
  },
  {
    listId: 'contrats',
    name: 'Contrats',
    items: ['CDI', 'CDD', 'CDM', 'Temporaire', 'Apprentis', 'Stagiaire']
  },
  {
    listId: 'tauxOccupation',
    name: 'Taux occupation',
    items: ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10']
  },
  {
    listId: 'postes',
    name: 'Postes occupés',
    items: [
      'Opérateur SB',
      'Opérateur Log',
      'OP Final pack',
      'OP Tech',
      'TL',
      'GL',
      'Ingénieur',
      'Agent Vebego',
      'Agent de sécurité',
      'Tech Maint support',
      'IT',
      'Commerciaux',
      'Tech Maint Prev'
    ]
  },
  {
    listId: 'raisonArret',
    name: 'Raison arrêt',
    items: [
      'Maladie',
      'Accident du Travail',
      'Accident Perso',
      'Accident de trajet',
      'Maternité',
      'Inconnue',
      'Sans solde'
    ]
  },
  {
    listId: 'managers',
    name: 'Managers',
    items: [
      'Myriam Abdelkafi',
      'Quentin Butin',
      'Deme Bytyci',
      'Georges Karami',
      'Delphine O\'Mahony',
      'Joaquim Oliveira S',
      'Benjamin Visconti',
      'Christopher',
      'Thomas Porret',
      'Guilhem Nicole',
      'Dominique Piguet',
      'Mylene De Blas',
      'Nicolas Lejeune',
      'Laurent Leuba',
      'Bruno Péant'
    ]
  },
  {
    listId: 'zones',
    name: 'Zones',
    items: [
      'High Power',
      'Low Power',
      'Logistique',
      'FP/Ster/Metallic',
      'Facilities',
      'EHS',
      'Site Engineering',
      'Process Dvp Engineering',
      'Supply Chain',
      'Qualité',
      'Marketing',
      'Engineering Dev',
      'HR'
    ]
  },
  {
    listId: 'motifVisite',
    name: 'Motif de la visite',
    items: [
      'Absence perlée (3 absences de maximum 3 jours/5 mois)',
      'A la demande du collaborateur',
      'A la demande du manager/inquiétude santé',
      'Aménagements de poste',
      'Annonce Maternité',
      'Dossier AI',
      'Entretien de Suivi Infirmier',
      'Incapacité de travail > 15 jours',
      'Retour incapacité de travail > à 30 jours',
      'Retour post-accident de travail avec incapacité de travail > à 3 jours',
      'Retour Congé Maternité'
    ]
  },
  {
    listId: 'orientation',
    name: 'Orientation',
    items: [
      'Médecin traitant',
      'ORL',
      'Cardiologue',
      'Gynécologue',
      'Rhumatologue',
      'Physio'
    ]
  },
  {
    listId: 'dpt',
    name: 'DPT',
    items: [
      'HQ',
      'SMQ'
    ]
  },
  {
    listId: 'typeEntretien',
    name: 'Type entretien',
    items: [
      'Physique',
      'Téléphone',
      'Visio'
    ]
  },
  {
    listId: 'joursFeries',
    name: 'Jours fériés',
    items: [
      '25/12/2024',
      '1/1/2025',
      '2/1/2025',
      '18/4/2025',
      '21/4/2025',
      '29/5/2025',
      '9/6/2025',
      '1/8/2025',
      '22/9/2025',
      '25/12/2025',
      '1/1/2026',
      '2/1/2026',
      '3/4/2026',
      '6/4/2026',
      '14/5/2026',
      '25/5/2026',
      '1/8/2026',
      '21/9/2026',
      '25/12/2026'
    ]
  }
];