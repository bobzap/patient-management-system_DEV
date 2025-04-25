// src/components/entretiens/sections/ExamenClinique/Biometrie.tsx
'use client';

import React from 'react';
import { BiometrieData } from './types';

interface Props {
  data: BiometrieData;
  onChange: (data: BiometrieData) => void;
  isReadOnly?: boolean; // Ajoutez cette prop
}

export const Biometrie = ({ data, onChange, isReadOnly = false }: Props) => {
  const handleChange = (field: keyof BiometrieData, value: string) => {
    if (isReadOnly) return; // Ignorer les modifications en mode lecture seule
    
    const newData = { ...data, [field]: value };
    
    // Calcul IMC seulement si taille et poids sont présents
    if (field === 'taille' || field === 'poids') {
      const taille = field === 'taille' ? parseFloat(value) : parseFloat(data.taille);
      const poids = field === 'poids' ? parseFloat(value) : parseFloat(data.poids);
      
      if (taille && poids && taille > 0) {
        const tailleEnMetres = taille / 100;
        newData.imc = (poids / (tailleEnMetres * tailleEnMetres)).toFixed(1);
      } else {
        newData.imc = '';
      }
    }

    onChange(newData);
  };

  // Liste de tous les champs avec leurs labels et unités
  const fields = [
    { id: 'taille', label: 'Taille', unit: 'cm', type: 'number' },
    { id: 'poids', label: 'Poids', unit: 'kg', type: 'number' },
    { id: 'tension', label: 'Tension', unit: 'mmHg', type: 'text' },
    { id: 'pouls', label: 'Pouls', unit: 'bpm', type: 'number' },
    { id: 'temperature', label: 'Température', unit: '°C', type: 'number', step: '0.1' },
    { id: 'glycemie', label: 'Glycémie', unit: 'g/L', type: 'number', step: '0.01' },
    { id: 'saturation', label: 'Saturation', unit: '%', type: 'number' },
    { id: 'imc', label: 'IMC', unit: 'kg/m²', type: 'number', step: '0.1', readOnly: true }
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white/80 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-6">Biométrie</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(({ id, label, unit, type, step, readOnly: fieldReadOnly }) => (
            <div key={id} className="relative">
              <label className="block text-sm font-medium text-purple-900 mb-1">
                {label}
              </label>
              <div className="relative">
                <input
                  type={type}
                  value={data[id as keyof BiometrieData]}
                  onChange={(e) => handleChange(id as keyof BiometrieData, e.target.value)}
                  step={step}
                  readOnly={isReadOnly || fieldReadOnly}
                  className={`
                    w-full px-3 py-2 pr-12 rounded-md border
                    ${(isReadOnly || fieldReadOnly) 
                      ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                      : 'bg-white border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    }
                  `}
                  placeholder={`${label}...`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};