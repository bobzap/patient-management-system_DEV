// src/components/entretiens/sections/Conclusion/Prevention.tsx
'use client';

import { PreventionData } from '../../types/ConclusionTypes';
import { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Star, X, Plus, Check } from 'lucide-react';

interface ListItem {
  value: string;
}

interface List {
  listId: string;
  items: ListItem[];
}

interface RisqueProfessionnel {
  id: number;
  nom: string;
  lien: string;
  estFavori: boolean;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from "@/components/ui/label";
import { EnhancedSelect } from "@/components/ui/enhanced-select";

interface PreventionProps {
  data: PreventionData;
  onChange: (data: PreventionData) => void;
  isReadOnly?: boolean;
}

export const Prevention = ({ data, onChange, isReadOnly = false }: PreventionProps) => {
  // Sécurité : s'assurer que toutes les propriétés existent
  const safeData = {
    conseilsDonnes: data?.conseilsDonnes || '',
    troublesLiesTravail: data?.troublesLiesTravail || [],
    risquesProfessionnels: data?.risquesProfessionnels || []
  };

  const [troublesList, setTroublesList] = useState<string[]>([]);
  const [risquesList, setRisquesList] = useState<RisqueProfessionnel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [isHovered, setIsHovered] = useState(false);

  // Classes CSS pour les champs - ROSE
  const textareaClasses = isReadOnly
    ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200'
    : 'bg-white/95 border-2 border-pink-400/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200 min-h-[100px]';

  const selectTriggerClasses = isReadOnly
    ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200'
    : 'bg-white/95 border-2 border-pink-400/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200';

  const labelClasses = isReadOnly 
    ? 'cursor-not-allowed text-gray-600' 
    : 'text-pink-800 font-medium';

  const searchInputClasses = isReadOnly
    ? 'bg-gray-100 cursor-not-allowed text-gray-600'
    : 'bg-white/95 border-2 border-pink-400/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200';

  // Initialiser les données manquantes, mais seulement après le rendu initial
  useEffect(() => {
    if (isFirstRender.current && !data?.risquesProfessionnels) {
      isFirstRender.current = false;
      
      setTimeout(() => {
        onChange({
          ...data,
          risquesProfessionnels: []
        });
      }, 0);
    }
  }, [data, onChange]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        // Récupérer la liste des troubles
        const responseT = await fetch('/api/lists');
        const resultT = await responseT.json();
        const troubles = resultT.data.find(
          (list: List) => list.listId === 'troublesTravail'
        );
        if (troubles) {
          setTroublesList(troubles.items.map((item: ListItem) => item.value));
        }

        // Récupérer la liste des risques professionnels
        const responseR = await fetch('/api/risques-professionnels');
        const resultR = await responseR.json();
        if (resultR.success) {
          setRisquesList(resultR.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    fetchLists();
  }, []);

  // Gérer les clics en dehors du dropdown pour le fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTrouble = (trouble: string) => {
    if (isReadOnly) return;
    
    if (!safeData.troublesLiesTravail.includes(trouble)) {
      onChange({
        ...safeData,
        troublesLiesTravail: [...safeData.troublesLiesTravail, trouble]
      });
    }
  };

  const handleRemoveTrouble = (trouble: string) => {
    if (isReadOnly) return;
    
    onChange({
      ...safeData,
      troublesLiesTravail: safeData.troublesLiesTravail.filter(t => t !== trouble)
    });
  };

  const handleAddRisque = (risque: RisqueProfessionnel) => {
    if (isReadOnly) return;
    
    const exists = safeData.risquesProfessionnels.some(r => r.id === risque.id);
    if (!exists) {
      onChange({
        ...safeData,
        risquesProfessionnels: [...safeData.risquesProfessionnels, risque]
      });
    }
    
    setDropdownOpen(false);
  };

  const handleRemoveRisque = (risqueId: number) => {
    if (isReadOnly) return;
    
    onChange({
      ...safeData,
      risquesProfessionnels: safeData.risquesProfessionnels.filter(r => r.id !== risqueId)
    });
  };

  // Filtrer les risques en fonction de la recherche
  const filteredRisques = risquesList.filter(risque => 
    risque.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-pink-900">Prévention</h3>

      <div className="space-y-6">
        {/* Section Conseils donnés */}
        <div className="space-y-4 p-4 bg-pink-50/30 rounded-lg border border-pink-200/60 backdrop-blur-sm">
          <div>
            <Label className={labelClasses}>Conseils donnés</Label>
            <Textarea
              value={safeData.conseilsDonnes}
              onChange={(e) => !isReadOnly && onChange({
                ...safeData,
                conseilsDonnes: e.target.value
              })}
              placeholder="Saisir les conseils donnés (ergonomie, hygiène de vie, bonnes pratiques...)..."
              className={`mt-1.5 ${textareaClasses}`}
              readOnly={isReadOnly}
            />
          </div>
        </div>

        {/* Section Troubles liés au travail */}
        <div className="space-y-4 p-4 bg-pink-50/30 rounded-lg border border-pink-200/60 backdrop-blur-sm">
          <div className="space-y-2">
            <Label className={labelClasses}>Troubles liés au travail</Label>
            <EnhancedSelect
              listType="troublesTravail"
              multiple={true}
              values={safeData.troublesLiesTravail}
              onValuesChange={(values) => handleChange({
                troublesLiesTravail: values
              })}
              placeholder="Sélectionner des troubles..."
              searchable={true}
              customizable={true}
              disabled={isReadOnly}
              className={selectTriggerClasses}
              badgeActions={true}
            />
          </div>
        </div>

        {/* Section Risques professionnels */}
        <div className="space-y-4 p-4 bg-pink-50/30 rounded-lg border border-pink-200/60 backdrop-blur-sm">
          <div className="space-y-2">
            <Label className={labelClasses}>Risques professionnels</Label>
            
            {/* Layout en colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Colonne de gauche - Recherche et liste déroulante */}
              <div>
                <div 
                  className="relative" 
                  ref={dropdownRef}
                  onMouseEnter={() => !isReadOnly && setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div 
                    className={`flex items-center rounded-md px-3 py-2 transition-all duration-200 ${searchInputClasses}
                      ${dropdownOpen || isHovered ? 'ring-2 ring-pink-200' : ''}
                      ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !isReadOnly && setDropdownOpen(!dropdownOpen)}
                  >
                    <Search size={16} className={`mr-2 ${dropdownOpen || isHovered ? 'text-pink-500' : 'text-pink-400'}`} />
                    <input
                      type="text"
                      placeholder={`${isReadOnly ? 'Rechercher...' : 'Rechercher un risque...'}`}
                      className={`flex-grow focus:outline-none ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-transparent'}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) setDropdownOpen(true);
                      }}
                      readOnly={isReadOnly}
                    />
                    
                    {!isReadOnly && (
                      <div className="flex items-center ml-2">
                        <div className={`p-1 rounded-full ${dropdownOpen || isHovered ? 'bg-pink-100' : 'bg-pink-50'}`}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={dropdownOpen || isHovered ? "#ec4899" : "#f9a8d4"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d={dropdownOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isHovered && !dropdownOpen && !isReadOnly && (
                    <div className="absolute mt-1 w-full text-xs text-center text-pink-600 bg-pink-50 p-1 rounded border border-pink-200">
                      Cliquez pour afficher la liste des risques
                    </div>
                  )}
                  
                  {(dropdownOpen || isHovered) && !isReadOnly && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-pink-400/60 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="sticky top-0 bg-pink-50 p-2 border-b border-pink-100 text-pink-800 text-sm font-medium">
                        {filteredRisques.length} risques disponibles - Cliquez pour ajouter
                      </div>
                      
                      {filteredRisques.length > 0 ? (
                        filteredRisques.map(risque => {
                          const isSelected = safeData.risquesProfessionnels.some(r => r.id === risque.id);
                          
                          return (
                            <div 
                              key={risque.id}
                              className={`flex items-center justify-between px-4 py-2 hover:bg-pink-50 cursor-pointer transition-colors ${
                                isSelected ? 'bg-green-50' : ''
                              }`}
                              onClick={() => !isSelected && handleAddRisque(risque)}
                            >
                              <div className="flex items-center">
                                {risque.estFavori && (
                                  <div className="flex-shrink-0 mr-2">
                                    <Star size={16} className="text-yellow-500" fill="currentColor" />
                                  </div>
                                )}
                                <span className={`flex-grow ${isSelected ? 'text-green-700 font-medium' : 'text-pink-900'}`}>
                                  {risque.nom}
                                </span>
                              </div>
                              
                              <div className="flex-shrink-0 ml-2">
                                {isSelected ? (
                                  <div className="flex items-center text-green-600">
                                    <Check size={18} />
                                    <span className="text-xs ml-1">Ajouté</span>
                                  </div>
                                ) : (
                                  <div className="text-pink-600 hover:text-pink-800">
                                    <Plus size={16} />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-4 text-pink-500 text-center">
                          Aucun résultat trouvé pour "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Colonne de droite - Affichage des risques sélectionnés */}
              <div>
                <div className="border-2 border-pink-200/60 rounded-md p-3 h-full min-h-[120px] bg-pink-25/10">
                  <h4 className="text-sm font-medium text-pink-800 mb-2 flex items-center justify-between">
                    <span>Risques sélectionnés</span>
                    <span className="text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                      {safeData.risquesProfessionnels.length}
                    </span>
                  </h4>
                  
                  {safeData.risquesProfessionnels.length === 0 ? (
                    <div className="flex items-center justify-center h-16 text-sm text-pink-500 italic">
                      Aucun risque sélectionné
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {safeData.risquesProfessionnels.map((risque) => (
                        <Badge
                          key={risque.id}
                          variant="secondary"
                          className="px-2 py-1 flex items-center gap-1 bg-pink-100 text-pink-800 border border-pink-300 hover:bg-pink-200 transition-colors"
                        >
                          <a 
                            href={risque.lien} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-pink-700 hover:text-pink-900 hover:underline transition-colors"
                          >
                            {risque.nom}
                          </a>
                          {!isReadOnly && (
                            <button
                              onClick={() => handleRemoveRisque(risque.id)}
                              className="ml-1 hover:text-pink-600 transition-colors"
                              title="Supprimer ce risque"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé des préventions */}
        {(safeData.conseilsDonnes || safeData.troublesLiesTravail.length > 0 || safeData.risquesProfessionnels.length > 0) && (
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h4 className="font-medium text-pink-900 mb-3 flex items-center gap-2">
              <Check size={18} className="text-pink-600" />
              Résumé des mesures de prévention
            </h4>
            <div className="space-y-2 text-sm">
              {safeData.conseilsDonnes && (
                <div>
                  <span className="text-pink-700 font-medium">Conseils donnés :</span>
                  <p className="text-pink-900 mt-1">"{safeData.conseilsDonnes}"</p>
                </div>
              )}
              {safeData.troublesLiesTravail.length > 0 && (
                <div>
                  <span className="text-pink-700 font-medium">Troubles identifiés :</span>
                  <span className="text-pink-900 ml-2">{safeData.troublesLiesTravail.length} trouble(s)</span>
                </div>
              )}
              {safeData.risquesProfessionnels.length > 0 && (
                <div>
                  <span className="text-pink-700 font-medium">Risques professionnels :</span>
                  <span className="text-pink-900 ml-2">{safeData.risquesProfessionnels.length} risque(s) référencé(s)</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};