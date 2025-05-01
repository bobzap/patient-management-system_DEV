// src/components/entretiens/sections/SanteAuTravail/VecuTravail.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export interface VecuTravailData {
  motifVisite: {
    motifs: string[]; // Tableau de motifs au lieu d'un seul motif
    commentaires: string;
  };
  postesOccupes: string;
  posteDeTravail: {
    descriptionTaches: string;
    risquesProfessionnels: string;
    installationMateriel: string;
  };
  ressentiTravail: {
    relationCollegues: number;
    relationHierarchie: number;
    stress: number;
    satisfaction: number;
    commentaires: string;
  };
  plaintesTravail: {
    existence: boolean;
    commentaires: string;
  };
}

interface Props {
  data: VecuTravailData;
  onChange: (data: VecuTravailData) => void;
  isReadOnly?: boolean;
}

interface ListItem {
  value: string;
}

interface List {
  listId: string;
  items: ListItem[];
}

// Composant pour les sliders de ressenti
function RessentiSlider({
  label,
  value,
  onChange,
  isReadOnly = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  isReadOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-amber-900">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`flex-grow h-2 rounded-lg appearance-none 
            ${isReadOnly 
              ? 'bg-gray-200 cursor-not-allowed' 
              : 'bg-amber-200 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500'
            }`}
          disabled={isReadOnly}
        />
        <span className="w-8 text-center text-amber-900">{value}</span>
      </div>
    </div>
  );
}

export default function VecuTravail({ data, onChange, isReadOnly = false }: Props) {
  // Sécurité pour s'assurer que data.motifVisite.motifs est toujours un tableau
  const safeData = {
    ...data,
    motifVisite: {
      ...data.motifVisite,
      motifs: Array.isArray(data.motifVisite.motifs) ? data.motifVisite.motifs : []
    }
  };
  
  const [motifsList, setMotifsList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Initialiser les motifs s'ils sont undefined
    if (isFirstRender.current && !data.motifVisite.motifs) {
      isFirstRender.current = false;
      setTimeout(() => {
        onChange({
          ...data,
          motifVisite: {
            ...data.motifVisite,
            motifs: []
          }
        });
      }, 0);
    }
    
    // Charger la liste des motifs
    const fetchMotifsList = async () => {
      try {
        const response = await fetch('/api/lists');
        const result = await response.json();
        const motifs = result.data.find(
          (list: List) => list.listId === 'motifVisite'
        );
        if (motifs) {
          setMotifsList(motifs.items.map((item: ListItem) => item.value));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des motifs:', error);
      }
    };

    fetchMotifsList();
  }, [data, onChange]);

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

  const handleAddMotif = (motif: string) => {
    if (isReadOnly) return;
    
    // Ne pas ajouter de doublons
    if (!safeData.motifVisite.motifs.includes(motif)) {
      onChange({
        ...safeData,
        motifVisite: {
          ...safeData.motifVisite,
          motifs: [...safeData.motifVisite.motifs, motif]
        }
      });
    }
    
    // Fermer le dropdown après sélection
    setDropdownOpen(false);
  };

  const handleRemoveMotif = (motif: string) => {
    if (isReadOnly) return;
    
    onChange({
      ...safeData,
      motifVisite: {
        ...safeData.motifVisite,
        motifs: safeData.motifVisite.motifs.filter(m => m !== motif)
      }
    });
  };

  // Filtrer les motifs en fonction de la recherche
  const filteredMotifs = motifsList.filter(motif => 
    motif.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (path: string, value: any) => {
    if (isReadOnly) return;
    
    const newData = { ...safeData };
    path.split('.').reduce((obj: any, key: string, index: number, parts: string[]) => {
      if (index === parts.length - 1) {
        obj[key] = value;
      } else {
        obj[key] = { ...obj[key] };
      }
      return obj[key];
    }, newData);
    onChange(newData);
  };

  const ressentiSliders = [
    { label: 'Relations avec les collègues', key: 'relationCollegues' },
    { label: 'Relations avec la hiérarchie', key: 'relationHierarchie' },
    { label: 'Niveau de stress', key: 'stress' },
    { label: 'Satisfaction globale', key: 'satisfaction' },
  ];

  return (
    <div className="space-y-6">
      {/* Motif de la visite - Nouvelle version avec sélection multiple */}
      <div className="bg-white/80 rounded-lg shadow p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Motif de la visite</h3>
        <div className="space-y-4">
          {/* Section motifs avec layout en colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colonne de gauche - Recherche et dropdown */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Motif(s)
              </label>
              
              {/* Dropdown avec recherche */}
              <div 
                className="relative" 
                ref={dropdownRef}
                onMouseEnter={() => !isReadOnly && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div 
                  className={`flex items-center border rounded-md px-3 py-2 
                    ${dropdownOpen || isHovered ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-300'}
                    ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
                    transition-all duration-200`}
                  onClick={() => !isReadOnly && setDropdownOpen(!dropdownOpen)}
                >
                  <Search size={16} className={`mr-2 ${dropdownOpen || isHovered ? 'text-amber-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder={`${isReadOnly ? 'Rechercher...' : 'Rechercher un motif...'}`}
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
                      <div className={`p-1 rounded-full ${dropdownOpen || isHovered ? 'bg-amber-100' : 'bg-gray-100'}`}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={dropdownOpen || isHovered ? "#d97706" : "#9ca3af"}
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
                  <div className="absolute mt-1 w-full text-xs text-center text-amber-600 bg-amber-50 p-1 rounded border border-amber-200">
                    Cliquez pour afficher la liste des motifs
                  </div>
                )}
                
                {/* Liste des motifs */}
                {(dropdownOpen || isHovered) && !isReadOnly && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="sticky top-0 bg-amber-50 p-2 border-b border-amber-100 text-amber-800 text-sm font-medium">
                      {filteredMotifs.length} motifs disponibles - Cliquez pour ajouter
                    </div>
                    
                    {filteredMotifs.length > 0 ? (
                      filteredMotifs.map(motif => {
                        // Vérifier si le motif est déjà sélectionné
                        const isSelected = safeData.motifVisite.motifs.includes(motif);
                        
                        return (
                          <div 
                            key={motif}
                            className={`flex items-center justify-between px-4 py-2 hover:bg-amber-50 cursor-pointer transition-colors ${
                              isSelected ? 'bg-green-50' : ''
                            }`}
                            onClick={() => !isSelected && handleAddMotif(motif)}
                          >
                            <span className={`flex-grow ${isSelected ? 'text-green-700 font-medium' : ''}`}>
                              {motif}
                            </span>
                            
                            {/* Afficher soit une coche verte pour les motifs sélectionnés, soit un bouton d'ajout pour les autres */}
                            <div className="flex-shrink-0 ml-2">
                              {isSelected ? (
                                <div className="flex items-center text-green-600">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>
                                  <span className="text-xs ml-1">Ajouté</span>
                                </div>
                              ) : (
                                <div className="text-amber-600 hover:text-amber-800">
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
            
            {/* Colonne de droite - Affichage des motifs sélectionnés */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Motifs sélectionnés
              </label>
              <div className="border border-gray-200 rounded-md p-3 h-full min-h-[100px] bg-gray-50">
                {safeData.motifVisite.motifs.length === 0 ? (
                  <div className="flex items-center justify-center h-16 text-sm text-gray-500 italic">
                    Aucun motif sélectionné
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {safeData.motifVisite.motifs.map((motif) => (
                      <Badge
                        key={motif}
                        variant="secondary"
                        className="px-2 py-1 flex items-center gap-1"
                      >
                        {motif}
                        {!isReadOnly && (
                          <button
                            onClick={() => handleRemoveMotif(motif)}
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

          {/* Commentaires restent inchangés */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Commentaires
            </label>
            <textarea
              value={safeData.motifVisite.commentaires}
              onChange={(e) => handleChange('motifVisite.commentaires', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border
                ${isReadOnly 
                  ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                  : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                }`}
              rows={3}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Poste de travail */}
      <div className="bg-white/80 rounded-lg shadow p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Poste de travail</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Postes précédemment occupés
            </label>
            <textarea
              value={safeData.postesOccupes}
              onChange={(e) => handleChange('postesOccupes', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border
                ${isReadOnly 
                  ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                  : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                }`}
              rows={2}
              readOnly={isReadOnly}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Description des tâches
              </label>
              <textarea
                value={safeData.posteDeTravail.descriptionTaches}
                onChange={(e) => handleChange('posteDeTravail.descriptionTaches', e.target.value)}
                className={`w-full px-3 py-2 rounded-md border
                  ${isReadOnly 
                    ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                rows={3}
                readOnly={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Risques professionnels
              </label>
              <textarea
                value={safeData.posteDeTravail.risquesProfessionnels}
                onChange={(e) => handleChange('posteDeTravail.risquesProfessionnels', e.target.value)}
                className={`w-full px-3 py-2 rounded-md border
                  ${isReadOnly 
                    ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                rows={3}
                readOnly={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Installation et matériel
              </label>
              <textarea
                value={safeData.posteDeTravail.installationMateriel}
                onChange={(e) => handleChange('posteDeTravail.installationMateriel', e.target.value)}
                className={`w-full px-3 py-2 rounded-md border
                  ${isReadOnly 
                    ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                rows={3}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ressenti au travail */}
      <div className="bg-white/80 rounded-lg shadow p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Ressenti au travail</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ressentiSliders.map(({ label, key }) => (
              <RessentiSlider
                key={key}
                label={label}
                value={safeData.ressentiTravail[key as keyof typeof safeData.ressentiTravail.relationCollegues]}
                onChange={(value) => handleChange(`ressentiTravail.${key}`, value)}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Commentaires sur le ressenti
            </label>
            <textarea
              value={safeData.ressentiTravail.commentaires}
              onChange={(e) => handleChange('ressentiTravail.commentaires', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border
                ${isReadOnly 
                  ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                  : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                }`}
              rows={3}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Plaintes liées au travail */}
      <div className="bg-white/80 rounded-lg shadow p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Plaintes liées au travail</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={safeData.plaintesTravail.existence}
              onChange={(e) => handleChange('plaintesTravail.existence', e.target.checked)}
              className={`w-4 h-4 rounded
                ${isReadOnly 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-amber-600 border-amber-300 focus:ring-amber-500'
                }`}
              disabled={isReadOnly}
            />
            <label className="text-sm font-medium text-amber-900">
              Existence de plaintes
            </label>
          </div>

          {safeData.plaintesTravail.existence && (
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Description des plaintes
              </label>
              <textarea
                value={safeData.plaintesTravail.commentaires}
                onChange={(e) => handleChange('plaintesTravail.commentaires', e.target.value)}
                className={`w-full px-3 py-2 rounded-md border
                  ${isReadOnly 
                    ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                rows={3}
                readOnly={isReadOnly}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}