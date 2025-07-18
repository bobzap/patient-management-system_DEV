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
  isReadOnly?: boolean;
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
    if (isReadOnly) return;
    onChange({ ...data, ...fieldUpdates });
  };

  // Classes CSS pour les champs - ROSE
  const inputClasses = isReadOnly 
    ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200' 
    : 'bg-white/95 border-2 border-pink-400/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200';

  const textareaClasses = isReadOnly
    ? 'bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200'
    : 'bg-white/95 border-2 border-pink-400/60 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200 min-h-[100px]';

  const labelClasses = isReadOnly 
    ? 'cursor-not-allowed text-gray-600' 
    : 'text-pink-800 font-medium';

  const radioItemClasses = isReadOnly
    ? 'cursor-not-allowed border-gray-300'
    : 'border-2 border-pink-400 text-pink-500 focus:ring-pink-200 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-pink-900">Limitation de travail</h3>
      
      <div className="space-y-6">
        {/* Section principale */}
        <div className="space-y-4 p-4 bg-pink-50/30 rounded-lg border border-pink-200/60 backdrop-blur-sm">
          <div className="space-y-2">
            <Label className={labelClasses}>La personne a-t-elle des limitations de travail ?</Label>
            <RadioGroup
              value={data.hasLimitation ? "oui" : "non"}
              onValueChange={(value) => handleChange({ hasLimitation: value === "oui" })}
              className="flex gap-4"
              disabled={isReadOnly}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="oui" 
                  id="limitation-oui" 
                  disabled={isReadOnly} 
                  className={radioItemClasses}
                />
                <Label htmlFor="limitation-oui" className={labelClasses}>Oui</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="non" 
                  id="limitation-non" 
                  disabled={isReadOnly} 
                  className={radioItemClasses}
                />
                <Label htmlFor="limitation-non" className={labelClasses}>Non</Label>
              </div>
            </RadioGroup>
          </div>

          {data.hasLimitation && (
            <div className="space-y-4 pl-4 border-l-2 border-pink-300/60 bg-pink-25/20 rounded-r-lg p-3">
              {/* Type de durée */}
              <div className="space-y-2">
                <Label className={labelClasses}>Type de durée</Label>
                <RadioGroup
                  value={data.dureeType}
                  onValueChange={(value: 'definitive' | 'temporaire') => handleChange({ dureeType: value })}
                  className="flex gap-4"
                  disabled={isReadOnly}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="definitive" 
                      id="duree-definitive" 
                      disabled={isReadOnly} 
                      className={radioItemClasses}
                    />
                    <Label htmlFor="duree-definitive" className={labelClasses}>Définitive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="temporaire" 
                      id="duree-temporaire" 
                      disabled={isReadOnly} 
                      className={radioItemClasses}
                    />
                    <Label htmlFor="duree-temporaire" className={labelClasses}>Temporaire</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Durée en jours si temporaire */}
              {data.dureeType === 'temporaire' && (
                <div className="space-y-2">
                  <Label className={labelClasses}>Durée (en jours)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={data.dureeJours || ''}
                      onChange={(e) => handleChange({ dureeJours: parseInt(e.target.value) || 0 })}
                      className={`w-24 ${inputClasses}`}
                      min="1"
                      readOnly={isReadOnly}
                      placeholder="Ex: 30"
                    />
                    <span className="text-pink-700 font-medium">jours</span>
                  </div>
                </div>
              )}

              {/* Commentaire */}
              <div className="space-y-2">
                <Label className={labelClasses}>Commentaire</Label>
                <Textarea
                  value={data.commentaire}
                  onChange={(e) => handleChange({ commentaire: e.target.value })}
                  placeholder="Détails sur la limitation (postes à éviter, conditions spéciales, recommandations...)..."
                  className={textareaClasses}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          )}
        </div>

        {/* Informations complémentaires si pas de limitation */}
        {!data.hasLimitation && (
          <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">Aucune limitation de travail nécessaire</span>
            </div>
            <p className="text-green-700 text-sm mt-2 ml-7">
              La personne peut continuer ses activités professionnelles normalement.
            </p>
          </div>
        )}

        {/* Résumé si limitation active */}
        {data.hasLimitation && (
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h4 className="font-medium text-pink-900 mb-2">Résumé de la limitation</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-pink-700">Type :</span>
                <span className="font-medium text-pink-900 capitalize">{data.dureeType}</span>
              </div>
              {data.dureeType === 'temporaire' && data.dureeJours > 0 && (
                <div className="flex justify-between">
                  <span className="text-pink-700">Durée :</span>
                  <span className="font-medium text-pink-900">{data.dureeJours} jours</span>
                </div>
              )}
              {data.commentaire && (
                <div className="mt-2">
                  <span className="text-pink-700">Commentaire :</span>
                  <p className="text-pink-900 mt-1 italic">"{data.commentaire}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};