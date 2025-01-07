// src/components/entretiens/sections/SanteAuTravail/index.tsx
'use client';

import { useState } from 'react';
import VecuTravail, { VecuTravailData } from './VecuTravail';
import ModeVie, { ModeVieData } from './ModeVie';

const initialVecuTravailData: VecuTravailData = {
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

const initialModeVieData: ModeVieData = {
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

interface SanteTravailProps {
  onChange?: (data: {
    vecuTravail: VecuTravailData;
    modeVie: ModeVieData;
  }) => void;
}

export const SanteTravail = ({ onChange }: SanteTravailProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localData, setLocalData] = useState({
    vecuTravail: initialVecuTravailData,
    modeVie: initialModeVieData
  });

  const handleVecuTravailChange = (newVecuData: VecuTravailData) => {
    const newData = {
      ...localData,
      vecuTravail: newVecuData
    };
    setLocalData(newData);
    onChange?.(newData);
  };

  const handleModeVieChange = (newModeVieData: ModeVieData) => {
    const newData = {
      ...localData,
      modeVie: newModeVieData
    };
    setLocalData(newData);
    onChange?.(newData);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation entre les pages */}
      <div className="flex justify-between mb-4">
        <button 
          onClick={() => setCurrentPage(1)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 1 
              ? 'bg-amber-100 text-amber-900 font-semibold' 
              : 'text-amber-900/70 hover:bg-amber-50'
            }`}
        >
          Vécu au travail
        </button>
        <button 
          onClick={() => setCurrentPage(2)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 2 
              ? 'bg-amber-100 text-amber-900 font-semibold' 
              : 'text-amber-900/70 hover:bg-amber-50'
            }`}
        >
          Mode de vie
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-grow bg-white/50 rounded-lg p-4">
        {currentPage === 1 ? (
          <VecuTravail 
            data={localData.vecuTravail}
            onChange={handleVecuTravailChange}
          />
        ) : (
          <ModeVie 
            data={localData.modeVie}
            onChange={handleModeVieChange}
          />
        )}
      </div>

      {/* Navigation bas de page */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(1)}
          className={`text-amber-900/70 ${currentPage === 1 ? 'invisible' : ''}`}
        >
          ← Précédent
        </button>
        <div className="text-amber-900/70">
          Page {currentPage}/2
        </div>
        <button
          onClick={() => setCurrentPage(2)}
          className={`text-amber-900/70 ${currentPage === 2 ? 'invisible' : ''}`}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
};