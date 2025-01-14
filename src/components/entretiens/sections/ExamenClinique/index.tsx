// src/components/entretiens/sections/ExamenClinique/index.tsx
'use client';

import { useState } from 'react';
import { ExamenCliniqueData } from './types';

interface ExamenCliniqueProps {
  data: ExamenCliniqueData;
  onChange: (data: ExamenCliniqueData) => void;
}


import { Biometrie } from './Biometrie';
import { Appareils } from './Appareils';
import { Antecedents } from './Antecedents';
import { Traitements } from './Traitements';
export type { 
  ExamenCliniqueData,
  BiometrieData,
  AppareilsData,
  AntecedentsData,
  TraitementsData 
} from './types';


export const ExamenClinique = ({ data, onChange }: ExamenCliniqueProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="h-full flex flex-col">
      {/* Navigation entre les pages */}
      <div className="flex justify-between mb-4">
        <button 
          onClick={() => setCurrentPage(1)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 1 
              ? 'bg-purple-100 text-purple-900 font-semibold' 
              : 'text-purple-900/70 hover:bg-purple-50'
            }`}
        >
          Biométrie
        </button>
        <button 
          onClick={() => setCurrentPage(2)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 2 
              ? 'bg-purple-100 text-purple-900 font-semibold' 
              : 'text-purple-900/70 hover:bg-purple-50'
            }`}
        >
          Appareils
        </button>
        <button 
          onClick={() => setCurrentPage(3)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 3 
              ? 'bg-purple-100 text-purple-900 font-semibold' 
              : 'text-purple-900/70 hover:bg-purple-50'
            }`}
        >
          Antécédents
        </button>
        <button 
          onClick={() => setCurrentPage(4)}
          className={`px-4 py-2 rounded-t-lg transition-colors duration-200
            ${currentPage === 4 
              ? 'bg-purple-100 text-purple-900 font-semibold' 
              : 'text-purple-900/70 hover:bg-purple-50'
            }`}
        >
          Traitements
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-grow bg-white/50 rounded-lg p-4">
        {currentPage === 1 && (
          <Biometrie 
            data={data.biometrie}
            onChange={(newData) => onChange({ ...data, biometrie: newData })}
          />
        )}
        {currentPage === 2 && (
          <Appareils 
            data={data.appareils}
            onChange={(newData) => onChange({ ...data, appareils: newData })}
          />
        )}
        {currentPage === 3 && (
          <Antecedents 
            data={data.antecedents}
            onChange={(newData) => onChange({ ...data, antecedents: newData })}
          />
        )}
        {currentPage === 4 && (
          <Traitements 
            data={data.traitements}
            onChange={(newData) => onChange({ ...data, traitements: newData })}
          />
        )}
      </div>

      {/* Navigation bas de page */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          className={`text-purple-900/70 ${currentPage === 1 ? 'invisible' : ''}`}
        >
          ← Précédent
        </button>
        <div className="text-purple-900/70">
          Page {currentPage}/4
        </div>
        <button
          onClick={() => setCurrentPage(prev => Math.min(4, prev + 1))}
          className={`text-purple-900/70 ${currentPage === 4 ? 'invisible' : ''}`}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
};