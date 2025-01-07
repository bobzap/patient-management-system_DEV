// src/components/entretiens/sections/SanteAuTravail/ModeVie.tsx
'use client';

export interface ModeVieData {
  loisirs: {
    activitePhysique: boolean;
    frequence: string;
    commentaires: string;
  };
  addictions: {
    tabac: {
      consommation: boolean;
      quantiteJour: string;
      depuis: string;
    };
    medicaments: {
      consommation: boolean;
      depuis: string;
      quantiteInfDix: boolean;
      frequence: string;
    };
    alcool: {
      consommation: boolean;
      quantiteSupDix: boolean;
      frequence: string;
    };
    cannabis: {
      consommation: boolean;
      depuis: string;
      quantiteInfDix: boolean;
      frequence: string;
    };
    droguesDures: {
      consommation: boolean;
      depuis: string;
      frequence: string;
    };
    commentairesGeneraux: string;
  };
}

interface Props {
  data: ModeVieData;
  onChange: (data: ModeVieData) => void;
}

// Composant AdditictionSection séparé pour plus de clarté
function AddictionSection({ 
  type,
  data,
  baseKey,
  onChange,
  showQuantite = true,
  showDepuis = true,
  showFrequence = true,
  showQuantiteInf = false,
  showQuantiteSup = false 
}: {
  type: string;
  data: any;
  baseKey: string;
  onChange: (key: string, value: any) => void;
  showQuantite?: boolean;
  showDepuis?: boolean;
  showFrequence?: boolean;
  showQuantiteInf?: boolean;
  showQuantiteSup?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.consommation}
          onChange={(e) => onChange(`${baseKey}.consommation`, e.target.checked)}
          className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
        />
        <label className="text-sm font-medium text-amber-900 capitalize">{type}</label>
      </div>
      
      {data.consommation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
          {showQuantite && (
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Quantité/jour
              </label>
              <input
                type="text"
                value={data.quantiteJour || ''}
                onChange={(e) => onChange(`${baseKey}.quantiteJour`, e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
          
          {showFrequence && (
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Fréquence
              </label>
              <input
                type="text"
                value={data.frequence || ''}
                onChange={(e) => onChange(`${baseKey}.frequence`, e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
          
          {showDepuis && (
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">
                Depuis
              </label>
              <input
                type="text"
                value={data.depuis || ''}
                onChange={(e) => onChange(`${baseKey}.depuis`, e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
          
          {showQuantiteInf && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.quantiteInfDix || false}
                onChange={(e) => onChange(`${baseKey}.quantiteInfDix`, e.target.checked)}
                className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
              />
              <label className="text-sm text-amber-900">
                Quantité {'<'} 10/mois
              </label>
            </div>
          )}
          
          {showQuantiteSup && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.quantiteSupDix || false}
                onChange={(e) => onChange(`${baseKey}.quantiteSupDix`, e.target.checked)}
                className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
              />
              <label className="text-sm text-amber-900">
                Quantité {'>'} 10/mois
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ModeVie({ data, onChange }: Props) {
  // Fonction utilitaire pour mettre à jour les données
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

  return (
    <div className="space-y-6">
      {/* Sports et Loisirs */}
      <div className="bg-white/80 rounded-lg shadow p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Sports et Loisirs</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={data.loisirs.activitePhysique}
              onChange={(e) => handleChange('loisirs.activitePhysique', e.target.checked)}
              className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
            />
            <label className="text-sm font-medium text-amber-900">
              Pratique une activité physique
            </label>
          </div>

          {data.loisirs.activitePhysique && (
            <>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Fréquence
                </label>
                <input
                  type="text"
                  value={data.loisirs.frequence}
                  onChange={(e) => handleChange('loisirs.frequence', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Commentaires
                </label>
                <textarea
                  value={data.loisirs.commentaires}
                  onChange={(e) => handleChange('loisirs.commentaires', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Addictions */}
      <div className="bg-white/80 rounded-lg shadow p-4">
        <h3 className="font-semibold text-amber-900 mb-4">Addictions</h3>
        <div className="space-y-6">
          <AddictionSection
            type="tabac"
            data={data.addictions.tabac}
            baseKey="addictions.tabac"
            onChange={handleChange}
          />
          <AddictionSection 
            type="medicaments"
            data={data.addictions.medicaments}
            baseKey="addictions.medicaments"
            onChange={handleChange}
            showQuantite={false}
            showQuantiteInf={true}
          />
          <AddictionSection 
            type="alcool"
            data={data.addictions.alcool}
            baseKey="addictions.alcool"
            onChange={handleChange}
            showQuantite={false}
            showDepuis={false}
            showQuantiteSup={true}
          />
          <AddictionSection 
            type="cannabis"
            data={data.addictions.cannabis}
            baseKey="addictions.cannabis"
            onChange={handleChange}
            showQuantite={false}
            showQuantiteInf={true}
          />
          <AddictionSection 
            type="droguesDures"
            data={data.addictions.droguesDures}
            baseKey="addictions.droguesDures"
            onChange={handleChange}
            showQuantite={false}
          />

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Commentaires généraux sur les addictions
            </label>
            <textarea
              value={data.addictions.commentairesGeneraux}
              onChange={(e) => handleChange('addictions.commentairesGeneraux', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}