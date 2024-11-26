// src/components/entretiens/sections/SanteAuTravail/index.tsx
'use client';

import { useState } from 'react';
import VecuTravail from './VecuTravail';
import ModeVie from './ModeVie';

export const SanteTravail = () => {
  const [currentPage, setCurrentPage] = useState(1);

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
          <VecuTravail />
        ) : (
          <ModeVie />
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