'use client';

import React, { useState } from 'react';
import { Prevention } from './Prevention';
import { Limitation } from './Limitation';
import { Actions } from './Actions';

// Définitions des interfaces pour correspondre à celles utilisées dans les composants enfants
export interface PreventionData {
  conseilsDonnes: string;
  troublesLiesTravail: string[];
  risquesProfessionnels: Array<{
    id: number;
    nom: string;
    lien: string;
    estFavori: boolean;
  }>;
}

export interface LimitationData {
  hasLimitation: boolean;
  dureeType: string; // 'definitive' | 'temporaire'
  dureeJours?: number;
  commentaire: string;
}

export interface ActionData {
  orientation: {
    selected: string[];
    commentaire: string;
  };
  etudePoste: {
    aFaire: boolean;
    commentaire: string;
  };
  manager: {
    entretienNecessaire: boolean;
    managerSelectionne: string;
    commentaire: string;
    dateRappel: string;
  };
  entretien: {
    aPrevoir: boolean;
    dateRappel: string;
  };
  medecin: {
    echangeNecessaire: boolean;
    commentaire: string;
  };
  visiteMedicale: {
    aPlanifier: boolean;
    dateRappel: string;
    commentaire: string;
  };
}

export interface ConclusionData {
  prevention: PreventionData;
  limitation: LimitationData;
  actions: ActionData;
}

interface ConclusionProps {
  data: ConclusionData;
  onChange: (data: ConclusionData) => void;
  isReadOnly?: boolean;
}

// Valeurs par défaut pour les données
const defaultData: ConclusionData = {
  prevention: {
    conseilsDonnes: '',
    troublesLiesTravail: [],
    risquesProfessionnels: []
  },
  limitation: {
    hasLimitation: false,
    dureeType: 'temporaire',
    dureeJours: 0,
    commentaire: ''
  },
  actions: {
    orientation: { selected: [], commentaire: '' },
    etudePoste: { aFaire: false, commentaire: '' },
    manager: { entretienNecessaire: false, managerSelectionne: '', commentaire: '', dateRappel: '' },
    entretien: { aPrevoir: false, dateRappel: '' },
    medecin: { echangeNecessaire: false, commentaire: '' },
    visiteMedicale: { aPlanifier: false, dateRappel: '', commentaire: '' }
  }
};

export const Conclusion: React.FC<ConclusionProps> = ({ data = defaultData, onChange, isReadOnly = false }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Assurez-vous que toutes les propriétés nécessaires existent
  const safeData: ConclusionData = {
    prevention: {
      conseilsDonnes: data.prevention?.conseilsDonnes || '',
      troublesLiesTravail: data.prevention?.troublesLiesTravail || [],
      risquesProfessionnels: data.prevention?.risquesProfessionnels || []
    },
    limitation: {
      hasLimitation: data.limitation?.hasLimitation || false,
      dureeType: data.limitation?.dureeType || 'temporaire',
      dureeJours: data.limitation?.dureeJours || 0,
      commentaire: data.limitation?.commentaire || ''
    },
    actions: {
      orientation: data.actions?.orientation || { selected: [], commentaire: '' },
      etudePoste: data.actions?.etudePoste || { aFaire: false, commentaire: '' },
      manager: data.actions?.manager || { entretienNecessaire: false, managerSelectionne: '', commentaire: '', dateRappel: '' },
      entretien: data.actions?.entretien || { aPrevoir: false, dateRappel: '' },
      medecin: data.actions?.medecin || { echangeNecessaire: false, commentaire: '' },
      visiteMedicale: data.actions?.visiteMedicale || { aPlanifier: false, dateRappel: '', commentaire: '' }
    }
  };

  // Gestionnaires de mise à jour pour chaque section
  const handlePreventionChange = (newPrevention: PreventionData) => {
    if (isReadOnly) return;
    onChange({
      ...safeData,
      prevention: newPrevention
    });
  };

  const handleLimitationChange = (newLimitation: LimitationData) => {
    if (isReadOnly) return;
    onChange({
      ...safeData,
      limitation: newLimitation
    });
  };

  const handleActionsChange = (newActions: ActionData) => {
    if (isReadOnly) return;
    onChange({
      ...safeData,
      actions: newActions
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation entre les pages */}
      <div className="flex space-x-2 border-b border-pink-200 mb-4">
        <button 
          onClick={() => setCurrentPage(1)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 1 
              ? 'bg-pink-100 text-pink-900 font-semibold border-b-2 border-pink-500' 
              : 'text-pink-900/70 hover:bg-pink-50'
            }`}
        >
          Prévention
        </button>
        <button 
          onClick={() => setCurrentPage(2)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 2 
              ? 'bg-pink-100 text-pink-900 font-semibold border-b-2 border-pink-500' 
              : 'text-pink-900/70 hover:bg-pink-50'
            }`}
        >
          Limitation
        </button>
        <button 
          onClick={() => setCurrentPage(3)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 3 
              ? 'bg-pink-100 text-pink-900 font-semibold border-b-2 border-pink-500' 
              : 'text-pink-900/70 hover:bg-pink-50'
            }`}
        >
          Actions
        </button>
      </div>

      {/* Contenu */}
<div className="flex-grow bg-white rounded-lg p-4 shadow-sm">
  {currentPage === 1 && (
    <Prevention 
      data={safeData.prevention as any} // Utiliser any pour contourner les incompatibilités
      onChange={(newPrevention: any) => {
        if (isReadOnly) return;
        onChange({
          ...safeData,
          prevention: newPrevention
        });
      }}
      isReadOnly={isReadOnly}
    />
  )}
  {currentPage === 2 && (
    <Limitation 
      data={safeData.limitation as any} // Utiliser any pour contourner les incompatibilités
      onChange={(newLimitation: any) => {
        if (isReadOnly) return;
        onChange({
          ...safeData,
          limitation: newLimitation
        });
      }}
      isReadOnly={isReadOnly}
    />
  )}
  {currentPage === 3 && (
    <Actions 
      data={safeData.actions as any} // Utiliser any pour contourner les incompatibilités
      onChange={(newActions: any) => {
        if (isReadOnly) return;
        onChange({
          ...safeData,
          actions: newActions
        });
      }}
      isReadOnly={isReadOnly}
    />
  )}
</div>

      {/* Navigation bas de page */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          className={`text-pink-900/70 ${currentPage === 1 ? 'invisible' : ''}`}
        >
          ← Précédent
        </button>
        <div className="text-pink-900/70">
          Page {currentPage}/3
        </div>
        <button
          onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
          className={`text-pink-900/70 ${currentPage === 3 ? 'invisible' : ''}`}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
};