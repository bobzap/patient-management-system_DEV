// src/components/entretiens/sections/SanteAuTravail/ModeVie.tsx
'use client';

import { useState } from 'react';

export default function ModeVie() {
  const [formData, setFormData] = useState({
    sportLoisirs: '',
    commentaireSport: '',
    frequenceSport: '',
    
    // Tabac
    tabac: false,
    tabacQuantite: '',
    tabacDepuis: '',
    
    // Médicaments
    medicamentsDetournes: false,
    medicamentsDepuis: '',
    medicamentsQteMois: '',
    medicamentsFrequence: '',
    
    // Alcool
    alcool: false,
    alcoolQteMois: '',
    alcoolQuantite: '',
    
    // Cannabis
    cannabis: false,
    cannabisDepuis: '',
    cannabisQteMois: '',
    cannabisQuantite: '',
    
    // Drogues dures
    droguesDures: false,
    droguesDepuis: '',
    droguesQuantite: '',
    
    commentaireAddictions: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  return (
    <form className="space-y-6">
      {/* Sports et Loisirs */}
      <div className="bg-white/80 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-amber-900">Sports et Loisirs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Sports/Loisirs pratiqués
            </label>
            <input
              type="text"
              name="sportLoisirs"
              value={formData.sportLoisirs}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-amber-200 
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Fréquence
            </label>
            <input
              type="text"
              name="frequenceSport"
              value={formData.frequenceSport}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-amber-200 
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Addictions */}
      <div className="bg-white/80 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-amber-900">Addictions</h3>
        
        {/* Tabac */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="tabac"
              checked={formData.tabac}
              onChange={handleChange}
              className="rounded border-amber-300 text-amber-600 
                       focus:ring-amber-500"
            />
            <label className="text-sm font-medium text-amber-900">Tabac</label>
          </div>
          
          {formData.tabac && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Quantité/jour
                </label>
                <input
                  type="text"
                  name="tabacQuantite"
                  value={formData.tabacQuantite}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-amber-200 
                           focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Depuis
                </label>
                <input
                  type="text"
                  name="tabacDepuis"
                  value={formData.tabacDepuis}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border border-amber-200 
                           focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Commentaire général */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-amber-900 mb-1">
            Commentaire addictions
          </label>
          <textarea
            name="commentaireAddictions"
            value={formData.commentaireAddictions}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-amber-200 
                     focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>
    </form>
  );
}