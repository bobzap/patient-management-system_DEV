// src/components/entretiens/sections/ExamenClinique/Antecedents.tsx
'use client';

import { AntecedentsData } from './types';

interface Props {
  data: AntecedentsData;
  onChange: (data: AntecedentsData) => void;
}

interface AntecedentSectionProps {
  title: string;
  type: 'medicaux' | 'chirurgicaux';
  data: {
    existence: boolean;
    description: string;
    commentaires: string;
  };
  onChange: (type: 'medicaux' | 'chirurgicaux', field: string, value: string | boolean) => void;
}

const AntecedentSection = ({ title, type, data, onChange }: AntecedentSectionProps) => (
  <div className="bg-white/80 rounded-lg shadow p-6">
    <h3 className="font-semibold text-purple-900 mb-4">{title}</h3>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.existence}
          onChange={(e) => onChange(type, 'existence', e.target.checked)}
          className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
        />
        <label className="text-sm font-medium text-purple-900">
          {`Antécédents ${type === 'medicaux' ? 'médicaux' : 'chirurgicaux'} connus ?`}
        </label>
      </div>

      {data.existence && (
        <>
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Quoi ?
            </label>
            <textarea
              value={data.description}
              onChange={(e) => onChange(type, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Commentaires
            </label>
            <textarea
              value={data.commentaires}
              onChange={(e) => onChange(type, 'commentaires', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </>
      )}
    </div>
  </div>
);

export const Antecedents = ({ data, onChange }: Props) => {
  const handleChange = (type: 'medicaux' | 'chirurgicaux', field: string, value: string | boolean) => {
    onChange({
      ...data,
      [type]: {
        ...data[type],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Antécédents médicaux */}
      <AntecedentSection
        title="Antécédents médicaux"
        type="medicaux"
        data={data.medicaux}
        onChange={handleChange}
      />

      {/* Antécédents chirurgicaux */}
      <AntecedentSection
        title="Antécédents chirurgicaux"
        type="chirurgicaux"
        data={data.chirurgicaux}
        onChange={handleChange}
      />
    </div>
  );
};