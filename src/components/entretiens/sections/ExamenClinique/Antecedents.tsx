// src/components/entretiens/sections/ExamenClinique/Antecedents.tsx
'use client';

import { AntecedentsData } from './types';
import { PlusCircle, Trash2 } from 'lucide-react'; // Importer des icônes

interface Props {
  data: AntecedentsData;
  onChange: (data: AntecedentsData) => void;
  isReadOnly?: boolean;
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
  isReadOnly?: boolean;
}

const AntecedentSection = ({ title, type, data, onChange, isReadOnly = false }: AntecedentSectionProps) => (
  <div className="bg-white/80 rounded-lg shadow p-6">
    <h3 className="font-semibold text-purple-900 mb-4">{title}</h3>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.existence}
          onChange={(e) => onChange(type, 'existence', e.target.checked)}
          className={`w-4 h-4 rounded 
            ${isReadOnly 
              ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
              : 'text-purple-600 border-purple-300 focus:ring-purple-500'
            }`}
          disabled={isReadOnly}
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
              className={`w-full px-3 py-2 rounded-md border 
                ${isReadOnly 
                  ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                  : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                }`}
              readOnly={isReadOnly}
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
              className={`w-full px-3 py-2 rounded-md border 
                ${isReadOnly 
                  ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                  : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                }`}
              readOnly={isReadOnly}
            />
          </div>
        </>
      )}
    </div>
  </div>
);

export const Antecedents = ({ data, onChange, isReadOnly = false }: Props) => {
  const handleChange = (type: 'medicaux' | 'chirurgicaux', field: string, value: string | boolean) => {
    if (isReadOnly) return; // Ne pas mettre à jour si on est en mode lecture seule
    
    onChange({
      ...data,
      [type]: {
        ...data[type],
        [field]: value
      }
    });
  };

  // Fonction pour gérer les changements des antécédents familiaux
  const handleFamiliauxChange = (field: string, value: string | boolean) => {
    if (isReadOnly) return;
    
    onChange({
      ...data,
      familiaux: {
        ...data.familiaux,
        [field]: value
      }
    });
  };

  // Fonction pour gérer les changements des antécédents professionnels
  const handleProfessionnelsChange = (field: string, value: string | boolean) => {
    if (isReadOnly) return;
    
    onChange({
      ...data,
      professionnels: {
        ...data.professionnels,
        [field]: value
      }
    });
  };

  // Fonction pour mettre à jour un poste spécifique
  const handlePosteChange = (index: number, field: string, value: string) => {
    if (isReadOnly) return;
    
    const newPostes = [...data.professionnels.postes];
    newPostes[index] = {
      ...newPostes[index],
      [field]: value
    };
    
    onChange({
      ...data,
      professionnels: {
        ...data.professionnels,
        postes: newPostes
      }
    });
  };

  // Fonction pour ajouter un nouveau poste
  const addPoste = () => {
    if (isReadOnly) return;
    
    onChange({
      ...data,
      professionnels: {
        ...data.professionnels,
        postes: [
          ...data.professionnels.postes,
          {
            posteOccupe: '',
            dateDebut: '',
            dateFin: '',
            entreprise: ''
          }
        ]
      }
    });
  };

  // Fonction pour supprimer un poste
  const removePoste = (index: number) => {
    if (isReadOnly) return;
    
    const newPostes = [...data.professionnels.postes];
    newPostes.splice(index, 1);
    
    onChange({
      ...data,
      professionnels: {
        ...data.professionnels,
        postes: newPostes
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
        isReadOnly={isReadOnly}
      />

      {/* Antécédents chirurgicaux */}
      <AntecedentSection
        title="Antécédents chirurgicaux"
        type="chirurgicaux"
        data={data.chirurgicaux}
        onChange={handleChange}
        isReadOnly={isReadOnly}
      />

      {/* Antécédents familiaux */}
      <div className="bg-white/80 rounded-lg shadow p-6">
        <h3 className="font-semibold text-purple-900 mb-4">Antécédents familiaux</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.familiaux.existence}
              onChange={(e) => handleFamiliauxChange('existence', e.target.checked)}
              className={`w-4 h-4 rounded 
                ${isReadOnly 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-purple-600 border-purple-300 focus:ring-purple-500'
                }`}
              disabled={isReadOnly}
            />
            <label className="text-sm font-medium text-purple-900">
              Antécédents familiaux connus ?
            </label>
          </div>

          {data.familiaux.existence && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Père
                </label>
                <textarea
                  value={data.familiaux.pere}
                  onChange={(e) => handleFamiliauxChange('pere', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-md border 
                    ${isReadOnly 
                      ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                      : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    }`}
                  readOnly={isReadOnly}
                  placeholder="Antécédents du père..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Mère
                </label>
                <textarea
                  value={data.familiaux.mere}
                  onChange={(e) => handleFamiliauxChange('mere', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-md border 
                    ${isReadOnly 
                      ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                      : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    }`}
                  readOnly={isReadOnly}
                  placeholder="Antécédents de la mère..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Autres (fratrie, descendants...)
                </label>
                <textarea
                  value={data.familiaux.autres}
                  onChange={(e) => handleFamiliauxChange('autres', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-md border 
                    ${isReadOnly 
                      ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                      : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    }`}
                  readOnly={isReadOnly}
                  placeholder="Autres antécédents familiaux..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Antécédents professionnels */}
      <div className="bg-white/80 rounded-lg shadow p-6">
        <h3 className="font-semibold text-purple-900 mb-4">Antécédents professionnels</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.professionnels.existence}
              onChange={(e) => handleProfessionnelsChange('existence', e.target.checked)}
              className={`w-4 h-4 rounded 
                ${isReadOnly 
                  ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'text-purple-600 border-purple-300 focus:ring-purple-500'
                }`}
              disabled={isReadOnly}
            />
            <label className="text-sm font-medium text-purple-900">
              Antécédents professionnels ?
            </label>
          </div>

          {data.professionnels.existence && (
            <div className="space-y-4">
              {data.professionnels.postes.map((poste, index) => (
                <div key={index} className="border border-purple-100 rounded-lg p-4 bg-purple-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-purple-900">Poste {index + 1}</h4>
                    {!isReadOnly && data.professionnels.postes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePoste(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">
                        Poste occupé
                      </label>
                      <input
                        type="text"
                        value={poste.posteOccupe}
                        onChange={(e) => handlePosteChange(index, 'posteOccupe', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border 
                          ${isReadOnly 
                            ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                          }`}
                        readOnly={isReadOnly}
                        placeholder="Poste occupé"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={poste.entreprise}
                        onChange={(e) => handlePosteChange(index, 'entreprise', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border 
                          ${isReadOnly 
                            ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                          }`}
                        readOnly={isReadOnly}
                        placeholder="Nom de l'entreprise"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">
                        Date de début (AAAA)
                      </label>
                      <input
                        type="text"
                        value={poste.dateDebut}
                        onChange={(e) => handlePosteChange(index, 'dateDebut', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border 
                          ${isReadOnly 
                            ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                          }`}
                        readOnly={isReadOnly}
                        placeholder="AAAA"
                        maxLength={4}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-purple-900 mb-1">
                        Date de fin (AAAA)
                      </label>
                      <input
                        type="text"
                        value={poste.dateFin}
                        onChange={(e) => handlePosteChange(index, 'dateFin', e.target.value)}
                        className={`w-full px-3 py-2 rounded-md border 
                          ${isReadOnly 
                            ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed' 
                            : 'border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
                          }`}
                        readOnly={isReadOnly}
                        placeholder="AAAA"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addPoste}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800 
                            px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-50"
                >
                  <PlusCircle size={16} />
                  <span>Ajouter un poste</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};