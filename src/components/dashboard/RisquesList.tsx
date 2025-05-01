// src/components/dashboard/RisquesList.tsx
'use client';

import React from 'react';
import { Star, ExternalLink } from 'lucide-react';

interface RisqueProfessionnel {
  id: number;
  nom: string;
  count: number;
  lien?: string;
  estFavori?: boolean;
}

interface RisquesListProps {
  risques: RisqueProfessionnel[];
  title: string;
  maxItems?: number;
  onViewMore?: () => void;
  isLoading?: boolean;
  totalEntretiens?: number;
}

export function RisquesList({
  risques,
  title,
  maxItems = 5,
  onViewMore,
  isLoading = false,
  totalEntretiens = 0
}: RisquesListProps) {
  // Trier les risques par nombre d'occurrences décroissant
  const sortedRisques = [...risques].sort((a, b) => b.count - a.count);
  
  // Limiter le nombre d'éléments affichés
  const displayedRisques = sortedRisques.slice(0, maxItems);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {sortedRisques.length > maxItems && onViewMore && (
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            onClick={onViewMore}
          >
            Voir tout
            <ExternalLink size={14} />
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : displayedRisques.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Aucun risque identifié
        </div>
      ) : (
        <div className="space-y-3">
          {displayedRisques.map((risque) => {
            // Calculer le pourcentage d'entretiens contenant ce risque
            const percentage = totalEntretiens > 0 
              ? Math.round((risque.count / totalEntretiens) * 100) 
              : 0;
            
            return (
              <div key={risque.id} className="relative">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    {risque.estFavori && (
                      <Star size={16} className="text-amber-500 mr-1" fill="currentColor" />
                    )}
                    <span className="text-sm font-medium text-gray-700 mr-1">{risque.nom}</span>
                    {risque.lien && (
                      <a 
                        href={risque.lien} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">{risque.count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}