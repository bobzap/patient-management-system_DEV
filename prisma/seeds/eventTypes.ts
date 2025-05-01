// prisma/seeds/eventTypes.ts

export const eventTypes = [
    {
      listId: 'eventTypes',
      name: 'Types d\'événements',
      items: [
        'Entretien Infirmier',
        'Visite Médicale',
        'Rappel Médical',
        'Étude de Poste',
        'Entretien Manager',
        'Limitation de Travail',
        'Suivi Post-AT',
        'Vaccination',
        'Formation',
        'Autre'
      ]
    },
    {
      listId: 'eventStatus',
      name: 'Statuts d\'événements',
      items: [
        'Planifié',
        'Confirmé',
        'En cours',
        'Effectué',
        'Annulé',
        'Reporté',
        'Non présenté'
      ]
    }
  ];