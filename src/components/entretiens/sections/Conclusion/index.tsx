'use client';

import React, { useState } from 'react';
import { Prevention } from './Prevention';
import { Limitation } from './Limitation';
import { Actions } from './Actions';
import type { ConclusionData } from '../../types/ConclusionTypes';

interface ConclusionProps {
  data: ConclusionData;
  onChange: (data: ConclusionData) => void;
}

export const Conclusion: React.FC<ConclusionProps> = ({ data, onChange }) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="h-full flex flex-col">
      {/* Navigation entre les pages - Correction du style des onglets */}
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
            data={data.prevention}
            onChange={(newData) => onChange({ ...data, prevention: newData })}
          />
        )}
        {currentPage === 2 && (
          <Limitation 
            data={data.limitation}
            onChange={(newData) => onChange({ ...data, limitation: newData })}
          />
        )}
        {currentPage === 3 && (
          <Actions 
            data={data.actions}
            onChange={(newData) => onChange({ ...data, actions: newData })}
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