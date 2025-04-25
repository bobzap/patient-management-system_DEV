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
  isReadOnly?: boolean; // Ajout du prop isReadOnly
}

// Composant AdditictionSection séparé pour plus de clarté
function AddictionSection({ 
  type,
  data,
  baseKey,
  onChange,
  isReadOnly = false, // Ajout du prop isReadOnly
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
  isReadOnly?: boolean;
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
          className={`w-4 h-4 rounded
            ${isReadOnly 
              ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
              : 'text-amber-600 border-amber-300 focus:ring-amber-500'
            }`}
          disabled={isReadOnly}
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
                className={`w-full px-3 py-2 rounded-md border
                  ${isReadOnly 
                    ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                readOnly={isReadOnly}
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
                className={`w-full px-3 py-2 rounded-md border
                  ${isReadOnly 
                    ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                readOnly={isReadOnly}
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
                className={`w-full px-3 py-2 rounded-md border
                  ${isReadOnly 
                    ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                    : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                  }`}
                readOnly={isReadOnly}
              />
            </div>
          )}
          
          {showQuantiteInf && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.quantiteInfDix || false}
                onChange={(e) => onChange(`${baseKey}.quantiteInfDix`, e.target.checked)}
                className={`w-4 h-4 rounded
                  ${isReadOnly 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-amber-600 border-amber-300 focus:ring-amber-500'
                  }`}
                disabled={isReadOnly}
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
                className={`w-4 h-4 rounded
                  ${isReadOnly 
                    ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'text-amber-600 border-amber-300 focus:ring-amber-500'
                  }`}
                disabled={isReadOnly}
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

export default function ModeVie({ data, onChange, isReadOnly = false }: Props) {
  // Fonction utilitaire pour mettre à jour les données
  const handleChange = (path: string, value: any) => {
    if (isReadOnly) return; // Ne pas mettre à jour si on est en mode lecture seule
    
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
              className={`w-4 h-4 rounded
                ${isReadOnly 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-amber-600 border-amber-300 focus:ring-amber-500'
                }`}
              disabled={isReadOnly}
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
                  className={`w-full px-3 py-2 rounded-md border
                    ${isReadOnly 
                      ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                      : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                    }`}
                  readOnly={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Commentaires
                </label>
                <textarea
                  value={data.loisirs.commentaires}
                  onChange={(e) => handleChange('loisirs.commentaires', e.target.value)}
                  className={`w-full px-3 py-2 rounded-md border
                    ${isReadOnly 
                      ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                      : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                    }`}
                  rows={2}
                  readOnly={isReadOnly}
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
            isReadOnly={isReadOnly}
          />
          <AddictionSection 
            type="medicaments"
            data={data.addictions.medicaments}
            baseKey="addictions.medicaments"
            onChange={handleChange}
            isReadOnly={isReadOnly}
            showQuantite={false}
            showQuantiteInf={true}
          />
          <AddictionSection 
            type="alcool"
            data={data.addictions.alcool}
            baseKey="addictions.alcool"
            onChange={handleChange}
            isReadOnly={isReadOnly}
            showQuantite={false}
            showDepuis={false}
            showQuantiteSup={true}
          />
          <AddictionSection 
            type="cannabis"
            data={data.addictions.cannabis}
            baseKey="addictions.cannabis"
            onChange={handleChange}
            isReadOnly={isReadOnly}
            showQuantite={false}
            showQuantiteInf={true}
          />
          <AddictionSection 
            type="droguesDures"
            data={data.addictions.droguesDures}
            baseKey="addictions.droguesDures"
            onChange={handleChange}
            isReadOnly={isReadOnly}
            showQuantite={false}
          />

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">
              Commentaires généraux sur les addictions
            </label>
            <textarea
              value={data.addictions.commentairesGeneraux}
              onChange={(e) => handleChange('addictions.commentairesGeneraux', e.target.value)}
              className={`w-full px-3 py-2 rounded-md border
                ${isReadOnly 
                  ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                  : 'border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500'
                }`}
              rows={3}
              readOnly={isReadOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}