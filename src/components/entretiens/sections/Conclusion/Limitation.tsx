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
}

const defaultData: LimitationData = {
  hasLimitation: false,
  dureeType: 'temporaire',
  dureeJours: 0,
  commentaire: ''
};

export const Limitation = ({ data = defaultData, onChange }: LimitationProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Limitation de travail</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>La personne nécessite-t-elle une limitation ?</Label>
          <RadioGroup
            value={data.hasLimitation ? "oui" : "non"}
            onValueChange={(value) => onChange({
              ...data,
              hasLimitation: value === "oui"
            })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oui" id="limitation-oui" />
              <Label htmlFor="limitation-oui">Oui</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non" id="limitation-non" />
              <Label htmlFor="limitation-non">Non</Label>
            </div>
          </RadioGroup>
        </div>

        {data.hasLimitation && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <div className="space-y-2">
              <Label>Type de durée</Label>
              <RadioGroup
                value={data.dureeType}
                onValueChange={(value: 'definitive' | 'temporaire') => onChange({
                  ...data,
                  dureeType: value
                })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="definitive" id="duree-definitive" />
                  <Label htmlFor="duree-definitive">Définitive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="temporaire" id="duree-temporaire" />
                  <Label htmlFor="duree-temporaire">Temporaire</Label>
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
                    onChange={(e) => onChange({
                      ...data,
                      dureeJours: parseInt(e.target.value) || 0
                    })}
                    className="w-24"
                    min="1"
                  />
                  <span>jours</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Commentaire</Label>
              <Textarea
                value={data.commentaire}
                onChange={(e) => onChange({
                  ...data,
                  commentaire: e.target.value
                })}
                placeholder="Détails sur la limitation..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};