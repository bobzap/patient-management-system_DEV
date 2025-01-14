// src/components/entretiens/sections/ExamenClinique/Traitements.tsx
'use client';

import { TraitementsData } from './types';

interface Props {
  data: TraitementsData;
  onChange: (data: TraitementsData) => void;
}

export const Traitements = ({ data, onChange }: Props) => {
  const handleChange = (field: string, value: string | boolean) => {
    const [section, subField] = field.split('.');
    onChange({
      ...data,
      [section]: {
        ...data[section as keyof TraitementsData],
        [subField]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Traitements actuels */}
      <div className="bg-white/80 rounded-lg shadow p-6">
        <h3 className="font-semibold text-purple-900 mb-4">Traitement(s)</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.medicaments.existence}
              onChange={(e) => handleChange('medicaments.existence', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-purple-900">
              Avez-vous des traitements ?
            </label>
          </div>

          {data.medicaments.existence && (
            <>
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Quoi ?
                </label>
                <textarea
                  value={data.medicaments.description}
                  onChange={(e) => handleChange('medicaments.description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Commentaires traitements
                </label>
                <textarea
                  value={data.medicaments.commentaires}
                  onChange={(e) => handleChange('medicaments.commentaires', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Vaccination */}
      <div className="bg-white/80 rounded-lg shadow p-6">
        <h3 className="font-semibold text-purple-900 mb-4">Vaccination</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.vaccination.aJour}
              onChange={(e) => handleChange('vaccination.aJour', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-purple-900">
              Vaccination à jour ?
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Commentaires vaccins
            </label>
            <textarea
              value={data.vaccination.commentaires}
              onChange={(e) => handleChange('vaccination.commentaires', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};