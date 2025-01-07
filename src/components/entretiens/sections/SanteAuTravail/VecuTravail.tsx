// src/components/entretiens/sections/SanteAuTravail/VecuTravail.tsx
'use client';

export interface VecuTravailData {
  motifVisite: {
    motif: string;
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
}

// Composant pour les sliders de ressenti
function RessentiSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
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
          className="flex-grow h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-amber-500"
        />
        <span className="w-8 text-center text-amber-900">{value}</span>
      </div>
    </div>
  );
}

export default function VecuTravail({ data, onChange }: Props) {
  const handleChange = (path: string, value: any) => {
    const newData = { ...data };
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
      {/* Motif de la visite */}
      <div className="bg-white/80 rounded-lg shadow p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Motif de la visite</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Motif principal
            </label>
            <input 
              type="text"
              value={data.motifVisite.motif}
              onChange={(e) => handleChange('motifVisite.motif', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-amber-200 
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Commentaires
            </label>
            <textarea
              value={data.motifVisite.commentaires}
              onChange={(e) => handleChange('motifVisite.commentaires', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-amber-200 
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
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
              value={data.postesOccupes}
              onChange={(e) => handleChange('postesOccupes', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-amber-200 
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Description des tâches
              </label>
              <textarea
                value={data.posteDeTravail.descriptionTaches}
                onChange={(e) => handleChange('posteDeTravail.descriptionTaches', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Risques professionnels
              </label>
              <textarea
                value={data.posteDeTravail.risquesProfessionnels}
                onChange={(e) => handleChange('posteDeTravail.risquesProfessionnels', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Installation et matériel
              </label>
              <textarea
                value={data.posteDeTravail.installationMateriel}
                onChange={(e) => handleChange('posteDeTravail.installationMateriel', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
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
                value={data.ressentiTravail[key as keyof typeof data.ressentiTravail.relationCollegues]}
                onChange={(value) => handleChange(`ressentiTravail.${key}`, value)}
              />
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Commentaires sur le ressenti
            </label>
            <textarea
              value={data.ressentiTravail.commentaires}
              onChange={(e) => handleChange('ressentiTravail.commentaires', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-amber-200 
                       focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
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
              checked={data.plaintesTravail.existence}
              onChange={(e) => handleChange('plaintesTravail.existence', e.target.checked)}
              className="w-4 h-4 text-amber-600 border-amber-300 rounded 
                       focus:ring-amber-500"
            />
            <label className="text-sm font-medium text-amber-900">
              Existence de plaintes
            </label>
          </div>

          {data.plaintesTravail.existence && (
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Description des plaintes
              </label>
              <textarea
                value={data.plaintesTravail.commentaires}
                onChange={(e) => handleChange('plaintesTravail.commentaires', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}