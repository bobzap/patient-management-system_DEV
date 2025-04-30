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

export const Prevention = ({ data = { conseilsDonnes: '', troublesLiesTravail: [], risquesProfessionnels: [] }, onChange, isReadOnly = false }: PreventionProps) => {
  const [troublesList, setTroublesList] = useState<string[]>([]);
  const [risquesList, setRisquesList] = useState<RisqueProfessionnel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    
    if (!data.troublesLiesTravail.includes(trouble)) {
      onChange({
        ...data,
        troublesLiesTravail: [...data.troublesLiesTravail, trouble]
      });
    }
  };

  const handleRemoveTrouble = (trouble: string) => {
    if (isReadOnly) return; // Ne pas supprimer si en mode lecture seule
    
    onChange({
      ...data,
      troublesLiesTravail: data.troublesLiesTravail.filter(t => t !== trouble)
    });
  };

  const handleAddRisque = (risque: RisqueProfessionnel) => {
    if (isReadOnly) return;
    
    // Vérifier si le risque existe déjà
    const exists = data.risquesProfessionnels.some(r => r.id === risque.id);
    if (!exists) {
      onChange({
        ...data,
        risquesProfessionnels: [...data.risquesProfessionnels, risque]
      });
    }
    
    // Fermer le dropdown après la sélection
    setDropdownOpen(false);
  };

  const handleRemoveRisque = (risqueId: number) => {
    if (isReadOnly) return;
    
    onChange({
      ...data,
      risquesProfessionnels: data.risquesProfessionnels.filter(r => r.id !== risqueId)
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
            value={data.conseilsDonnes || ''}
            onChange={(e) => !isReadOnly && onChange({
              ...data,
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
            {data.troublesLiesTravail.map((trouble) => (
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
          
          {/* Dropdown avec recherche */}
          <div className="relative" ref={dropdownRef}>
            <div 
              className={`flex items-center border rounded-md px-3 py-2 ${
                dropdownOpen ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isReadOnly && setDropdownOpen(!dropdownOpen)}
            >
              <Search size={16} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Rechercher un risque professionnel..."
                className={`flex-grow focus:outline-none ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                readOnly={isReadOnly}
              />
            </div>
            
            {dropdownOpen && !isReadOnly && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredRisques.length > 0 ? (
                  filteredRisques.map(risque => (
                    <div 
                      key={risque.id}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleAddRisque(risque)}
                    >
                      <div className="flex items-center">
                        {risque.estFavori && <Star size={16} className="text-yellow-500 mr-2" fill="currentColor" />}
                        <span>{risque.nom}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">Aucun résultat trouvé</div>
                )}
              </div>
            )}
          </div>
          
          {/* Affichage des risques sélectionnés */}
          <div className="flex flex-wrap gap-2 mt-3">
            {data.risquesProfessionnels.map((risque) => (
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
        </div>
      </div>
    </div>
  );
};