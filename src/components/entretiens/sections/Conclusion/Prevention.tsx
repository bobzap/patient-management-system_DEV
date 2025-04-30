// src/components/entretiens/sections/Conclusion/Prevention.tsx
'use client';

import { PreventionData } from '../../types/ConclusionTypes';
import { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Star, X } from 'lucide-react';

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
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

  // Initialiser les données manquantes, mais seulement après le rendu initial
  useEffect(() => {
    if (isFirstRender.current && !data?.risquesProfessionnels) {
      isFirstRender.current = false;
      
      // Utiliser setTimeout pour éviter l'erreur "Cannot update during rendering"
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
    if (isReadOnly) return; // Ne pas ajouter si en mode lecture seule
    
    if (!safeData.troublesLiesTravail.includes(trouble)) {
      onChange({
        ...safeData,
        troublesLiesTravail: [...safeData.troublesLiesTravail, trouble]
      });
    }
  };

  const handleRemoveTrouble = (trouble: string) => {
    if (isReadOnly) return; // Ne pas supprimer si en mode lecture seule
    
    onChange({
      ...safeData,
      troublesLiesTravail: safeData.troublesLiesTravail.filter(t => t !== trouble)
    });
  };

  const handleAddRisque = (risque: RisqueProfessionnel) => {
    if (isReadOnly) return;
    
    // Vérifier si le risque existe déjà
    const exists = safeData.risquesProfessionnels.some(r => r.id === risque.id);
    if (!exists) {
      onChange({
        ...safeData,
        risquesProfessionnels: [...safeData.risquesProfessionnels, risque]
      });
    }
    
    // Fermer le dropdown après la sélection
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
      <h3 className="text-lg font-semibold">Prévention</h3>

      <div className="space-y-4">
        <div>
          <Label>Conseils donnés</Label>
          <Textarea
            value={safeData.conseilsDonnes}
            onChange={(e) => !isReadOnly && onChange({
              ...safeData,
              conseilsDonnes: e.target.value
            })}
            placeholder="Saisir les conseils donnés..."
            className={`mt-1.5 min-h-[100px] ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : ''}`}
            readOnly={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Troubles liés au travail</Label>
          <Select 
            onValueChange={handleAddTrouble}
            disabled={isReadOnly}
          >
            <SelectTrigger className={isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}>
              <SelectValue placeholder="Sélectionner un trouble..." />
            </SelectTrigger>
            <SelectContent>
              {troublesList.map((trouble) => (
                <SelectItem key={trouble} value={trouble}>
                  {trouble}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2 mt-3">
            {safeData.troublesLiesTravail.map((trouble) => (
              <Badge
                key={trouble}
                variant="secondary"
                className="px-2 py-1 flex items-center gap-1"
              >
                {trouble}
                {!isReadOnly && (
                  <button
                    onClick={() => handleRemoveTrouble(trouble)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Nouvelle section pour les risques professionnels */}
        <div className="space-y-2 mt-6">
  <Label>Risques professionnels</Label>
  
  {/* Layout en colonnes */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Colonne de gauche - Recherche et liste déroulante */}
    <div>
      {/* Dropdown avec recherche - Style amélioré */}
      <div 
        className="relative" 
        ref={dropdownRef}
        onMouseEnter={() => !isReadOnly && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={`flex items-center border rounded-md px-3 py-2 
            ${dropdownOpen || isHovered ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
            ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
            transition-all duration-200`}
          onClick={() => !isReadOnly && setDropdownOpen(!dropdownOpen)}
        >
          <Search size={16} className={`mr-2 ${dropdownOpen || isHovered ? 'text-blue-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder={`${isReadOnly ? 'Rechercher...' : 'Rechercher un risque...'}`}
            className={`flex-grow focus:outline-none ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isReadOnly) setDropdownOpen(true);
            }}
            readOnly={isReadOnly}
          />
          
          {/* Indicateur visuel */}
          {!isReadOnly && (
            <div className="flex items-center ml-2">
              <div className={`p-1 rounded-full ${dropdownOpen || isHovered ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={dropdownOpen || isHovered ? "#3b82f6" : "#9ca3af"}
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
        
        {/* Texte d'aide qui apparaît au survol */}
        {isHovered && !dropdownOpen && !isReadOnly && (
          <div className="absolute mt-1 w-full text-xs text-center text-blue-600 bg-blue-50 p-1 rounded border border-blue-200">
            Cliquez pour afficher la liste des risques
          </div>
        )}
        
        {/* Liste des risques */}
        {(dropdownOpen || isHovered) && !isReadOnly && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="sticky top-0 bg-blue-50 p-2 border-b border-blue-100 text-blue-800 text-sm font-medium">
              {filteredRisques.length} risques disponibles - Cliquez pour ajouter
            </div>
            
            {filteredRisques.length > 0 ? (
              filteredRisques.map(risque => {
                // Vérifier si le risque est déjà sélectionné
                const isSelected = safeData.risquesProfessionnels.some(r => r.id === risque.id);
                
                return (
                  <div 
                    key={risque.id}
                    className={`flex items-center justify-between px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors ${
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
                      <span className={`flex-grow ${isSelected ? 'text-green-700 font-medium' : ''}`}>
                        {risque.nom}
                      </span>
                    </div>
                    
                    {/* Afficher soit une coche verte pour les risques sélectionnés, soit un bouton d'ajout pour les autres */}
                    <div className="flex-shrink-0 ml-2">
                      {isSelected ? (
                        <div className="flex items-center text-green-600">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          <span className="text-xs ml-1">Ajouté</span>
                        </div>
                      ) : (
                        <div className="text-blue-600 hover:text-blue-800">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-4 text-gray-500 text-center">
                Aucun résultat trouvé pour "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    
    {/* Colonne de droite - Affichage des risques sélectionnés */}
    <div>
      <div className="border border-gray-200 rounded-md p-3 h-full min-h-[120px] bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
          <span>Risques sélectionnés</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            {safeData.risquesProfessionnels.length}
          </span>
        </h4>
        
        {safeData.risquesProfessionnels.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-sm text-gray-500 italic">
            Aucun risque sélectionné
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {safeData.risquesProfessionnels.map((risque) => (
              <Badge
                key={risque.id}
                variant="secondary"
                className="px-2 py-1 flex items-center gap-1"
              >
                <a 
                  href={risque.lien} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline"
                >
                  {risque.nom}
                </a>
                {!isReadOnly && (
                  <button
                    onClick={() => handleRemoveRisque(risque.id)}
                    className="ml-1 hover:text-red-500 transition-colors"
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
    </div>
  );
};