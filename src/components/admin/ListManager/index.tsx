// src/components/admin/ListManager/index.tsx
'use client';

import { useState } from 'react';
import { ListEditor } from './ListEditor';


interface ListCategory {
  id: string;
  name: string;
  items: string[];
}

const initialLists: ListCategory[] = [
  {
    id: 'horaires',
    name: 'Horaires',
    items: ['Matin', 'Journée', 'Soir', 'Nuit']
  },
  {
    id: 'contrats',
    name: 'Contrats',
    items: ['CDI', 'CDD', 'CDM', 'Temporaire', 'Apprentis', 'Stagiaire']
  },
  {
    id: 'tauxOccupation',
    name: 'Taux occupation',
    items: ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10']
  },
  {
    id: 'postes',
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
    id: 'raisonArret',
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
    id: 'managers',
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
    id: 'zones',
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
    id: 'motifVisite',
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
    id: 'orientation',
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
    id: 'dpt',
    name: 'DPT',
    items: [
      'HQ',
      'SMQ'
    ]
  },
  {
    id: 'typeEntretien',
    name: 'Type entretien',
    items: [
      'Physique',
      'Téléphone',
      'Visio'
    ]
  },
  {
    id: 'joursFeries',
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

export const ListManager = () => {
    const [lists, setLists] = useState<ListCategory[]>(initialLists);
    const [selectedList, setSelectedList] = useState<string>(lists[0].id);
  
    const handleUpdate = (listId: string, newItems: string[]) => {
      setLists(prev =>
        prev.map(list =>
          list.id === listId
            ? { ...list, items: newItems }
            : list
        )
      );
    };
  
    const currentList = lists.find(l => l.id === selectedList);
  
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">
            Gestion des Listes
          </h2>
  
          {/* Navigation des listes - Version mise à jour */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  console.log('Sélection de la liste:', list.name); // Debug
                  setSelectedList(list.id);
                }}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm
                  ${selectedList === list.id
                    ? 'bg-blue-600 text-white font-medium shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {list.name}
                <span className="ml-2 text-xs opacity-75">
                  ({list.items.length})
                </span>
              </button>
            ))}
          </div>
  
          {/* Éditeur de liste */}
          {currentList && (
            <ListEditor
              list={currentList}
              onUpdate={(items) => handleUpdate(currentList.id, items)}
            />
          )}
        </div>
      </div>
    );
  };

  