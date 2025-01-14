// src/components/entretiens/sections/ExamenClinique/Appareils.tsx
'use client';

import { AppareilsData } from './types';

interface Props {
  data: AppareilsData;
  onChange: (data: AppareilsData) => void;
}

interface AppareilSectionProps {
  title: string;
  children: React.ReactNode;
}

const AppareilSection = ({ title, children }: AppareilSectionProps) => (
  <div className="bg-white/80 rounded-lg shadow p-6 space-y-4">
    <h3 className="font-semibold text-purple-900">{title}</h3>
    {children}
  </div>
);

export const Appareils = ({ data, onChange }: Props) => {
  const handleChange = (path: string, value: string | boolean) => {
    const newData = { ...data };
    const keys = path.split('.');
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    onChange(newData);
  };

  return (
    <div className="space-y-6">
      {/* Yeux / annexes */}
      <AppareilSection title="Yeux / annexes">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.yeuxAnnexes.bilanOPH}
              onChange={(e) => handleChange('yeuxAnnexes.bilanOPH', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-purple-900">
              Bilan OPH
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Commentaires ORL
            </label>
            <textarea
              value={data.yeuxAnnexes.commentairesORL}
              onChange={(e) => handleChange('yeuxAnnexes.commentairesORL', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Commentaires OPH
            </label>
            <textarea
              value={data.yeuxAnnexes.commentairesOPH}
              onChange={(e) => handleChange('yeuxAnnexes.commentairesOPH', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </AppareilSection>

      {/* Cardio-pulmonaire */}
      <AppareilSection title="Cardio-pulmonaire">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.cardioPulmonaire.bilanCardio}
              onChange={(e) => handleChange('cardioPulmonaire.bilanCardio', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-purple-900">
              Bilan Cardio
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Commentaires Cardio
            </label>
            <textarea
              value={data.cardioPulmonaire.commentaires}
              onChange={(e) => handleChange('cardioPulmonaire.commentaires', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </AppareilSection>

      {/* Appareil digestif */}
      <AppareilSection title="Appareil digestif">
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Commentaires appareil digestif
          </label>
          <textarea
            value={data.appareilDigestif.commentaires}
            onChange={(e) => handleChange('appareilDigestif.commentaires', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </AppareilSection>

      {/* Uro-génital */}
      <AppareilSection title="Uro-génital">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.uroGenital.suiviGyneco}
              onChange={(e) => handleChange('uroGenital.suiviGyneco', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-purple-900">
              Suivi gynéco
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Dernier frottis, mammographie, hydratation
            </label>
            <textarea
              value={data.uroGenital.commentaires}
              onChange={(e) => handleChange('uroGenital.commentaires', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </AppareilSection>

      {/* Ostéo-Articulaire */}
      <AppareilSection title="Ostéo-Articulaire">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.osteoArticulaire.plainteEvoquee}
              onChange={(e) => handleChange('osteoArticulaire.plainteEvoquee', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-purple-900">
              Plainte évoquée
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Commentaires douleurs rhumato
            </label>
            <textarea
              value={data.osteoArticulaire.commentairesDouleurs}
              onChange={(e) => handleChange('osteoArticulaire.commentairesDouleurs', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </AppareilSection>

      {/* Neuro-psy */}
      <AppareilSection title="Neuro-psy">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.neuroPsy.sommeilBon}
              onChange={(e) => handleChange('neuroPsy.sommeilBon', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
            />
            <label className="text-sm font-medium text-purple-900">
              Sommeil bon ?
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Commentaires neuro-psy
            </label>
            <textarea
              value={data.neuroPsy.commentaires}
              onChange={(e) => handleChange('neuroPsy.commentaires', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </AppareilSection>

      {/* Endocrino et métabolisme */}
      <AppareilSection title="Endocrino et métabolisme">
        <div>
          <label className="block text-sm font-medium text-purple-900 mb-1">
            Dernier bilan ?
          </label>
          <input
            type="text"
            value={data.endocrinoMetabolisme.dernierBilan}
            onChange={(e) => handleChange('endocrinoMetabolisme.dernierBilan', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </AppareilSection>
    </div>
  );
};