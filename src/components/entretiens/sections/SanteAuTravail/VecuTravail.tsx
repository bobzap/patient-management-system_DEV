// src/components/entretiens/sections/SanteAuTravail/VecuTravail.tsx
'use client';

import { useState } from 'react';

export default function VecuTravail() {
  const [formData, setFormData] = useState({
    tempsTrajet: '',
    antecedentsPro: '',
    postesOccupes: '',
    risquesPro: '',
    descriptionTaches: '',
    installationMateriel: '',
    relationCollegues: 5,
    relationHierarchie: 5,
    niveauStress: 5,
    satisfaction: 5,
    ressentiTravail: '',
    plaintes: '',
    commentairePlaintes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="space-y-6">
      {/* Temps de trajet */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-900">
          Temps de trajet (en minutes)
        </label>
        <input
          type="number"
          name="tempsTrajet"
          value={formData.tempsTrajet}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-md border border-amber-200 
                   focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Antécédents professionnels */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-amber-900">
          Antécédents professionnels
        </label>
        <textarea
          name="antecedentsPro"
          value={formData.antecedentsPro}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-amber-200 
                   focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Notes sur 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relation collègues */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-amber-900">
            Relation avec les collègues (0-10)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="relationCollegues"
              min="0"
              max="10"
              value={formData.relationCollegues}
              onChange={handleChange}
              className="flex-grow"
            />
            <span className="w-8 text-center">{formData.relationCollegues}</span>
          </div>
        </div>

        {/* Autres notes similaires... */}
      </div>

      {/* Autres champs... */}
    </form>
  );
}