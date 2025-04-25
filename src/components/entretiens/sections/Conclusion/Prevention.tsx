// src/components/entretiens/sections/Conclusion/Prevention.tsx
'use client';

import { PreventionData } from '../../types/ConclusionTypes';
import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ListItem {
  value: string;
}

interface List {
  listId: string;
  items: ListItem[];
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
  isReadOnly?: boolean; // Ajout du prop isReadOnly
}

export const Prevention = ({ data = { conseilsDonnes: '', troublesLiesTravail: [] }, onChange, isReadOnly = false }: PreventionProps) => {
  const [troublesList, setTroublesList] = useState<string[]>([]);

  useEffect(() => {
    const fetchTroublesList = async () => {
      try {
        const response = await fetch('/api/lists');
        const result = await response.json();
        // src/components/entretiens/sections/Conclusion/Prevention.tsx (suite)
        const troubles = result.data.find(
          (list: List) => list.listId === 'troublesTravail'
        );
        if (troubles) {
          setTroublesList(troubles.items.map((item: ListItem) => item.value));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des troubles:', error);
      }
    };

    fetchTroublesList();
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
      </div>
    </div>
  );
};