// src/components/entretiens/sections/Conclusion/Limitation.tsx
'use client';

import { LimitationData } from '../../types/ConclusionTypes';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LimitationProps {
  data?: LimitationData;
  onChange: (data: LimitationData) => void;
  isReadOnly?: boolean; // Ajout du prop isReadOnly
}

const defaultData: LimitationData = {
  hasLimitation: false,
  dureeType: 'temporaire',
  dureeJours: 0,
  commentaire: ''
};

export const Limitation = ({ data = defaultData, onChange, isReadOnly = false }: LimitationProps) => {
  // Fonction helper pour les mises à jour
  const handleChange = (fieldUpdates: Partial<LimitationData>) => {
    if (isReadOnly) return; // Ne pas mettre à jour si en mode lecture seule
    onChange({ ...data, ...fieldUpdates });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Limitation de travail</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>La personne nécessite-t-elle une limitation ?</Label>
          <RadioGroup
            value={data.hasLimitation ? "oui" : "non"}
            onValueChange={(value) => handleChange({ hasLimitation: value === "oui" })}
            className="flex gap-4"
            disabled={isReadOnly}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oui" id="limitation-oui" disabled={isReadOnly} className={isReadOnly ? 'cursor-not-allowed' : ''} />
              <Label htmlFor="limitation-oui" className={isReadOnly ? 'cursor-not-allowed' : ''}>Oui</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non" id="limitation-non" disabled={isReadOnly} className={isReadOnly ? 'cursor-not-allowed' : ''} />
              <Label htmlFor="limitation-non" className={isReadOnly ? 'cursor-not-allowed' : ''}>Non</Label>
            </div>
          </RadioGroup>
        </div>

        {data.hasLimitation && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <div className="space-y-2">
              <Label>Type de durée</Label>
              <RadioGroup
                value={data.dureeType}
                onValueChange={(value: 'definitive' | 'temporaire') => handleChange({ dureeType: value })}
                className="flex gap-4"
                disabled={isReadOnly}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="definitive" id="duree-definitive" disabled={isReadOnly} className={isReadOnly ? 'cursor-not-allowed' : ''} />
                  <Label htmlFor="duree-definitive" className={isReadOnly ? 'cursor-not-allowed' : ''}>Définitive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="temporaire" id="duree-temporaire" disabled={isReadOnly} className={isReadOnly ? 'cursor-not-allowed' : ''} />
                  <Label htmlFor="duree-temporaire" className={isReadOnly ? 'cursor-not-allowed' : ''}>Temporaire</Label>
                </div>
              </RadioGroup>
            </div>

            {data.dureeType === 'temporaire' && (
              <div className="space-y-2">
                <Label>Durée (en jours)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={data.dureeJours || ''}
                    onChange={(e) => handleChange({ dureeJours: parseInt(e.target.value) || 0 })}
                    className={`w-24 ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                    min="1"
                    readOnly={isReadOnly}
                  />
                  <span>jours</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Commentaire</Label>
              <Textarea
                value={data.commentaire}
                onChange={(e) => handleChange({ commentaire: e.target.value })}
                placeholder="Détails sur la limitation..."
                className={`min-h-[100px] ${isReadOnly ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                readOnly={isReadOnly}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};