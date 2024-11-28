// components/admin/FormBuilder/FieldProperties.tsx
'use client';

import { FormattedLists } from '@/types';

interface Field {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  section: string;
  listId?: string;
  defaultValue?: string;
  order: number;
}

interface FieldPropertiesProps {
  field: Field;
  lists: FormattedLists;
  onUpdate: (updates: Partial<Field>) => void;
  onDelete: () => void;
}

const SECTIONS = [
  { value: 'personal', label: 'Informations personnelles' },
  { value: 'professional', label: 'Informations professionnelles' },
  { value: 'transport', label: 'Transport' },
  { value: 'medical', label: 'Informations médicales' }
];

export const FieldProperties = ({ field, lists, onUpdate, onDelete }: FieldPropertiesProps) => {
  const handleChange = (name: string, value: string | boolean) => {
    onUpdate({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">Propriétés du champ</h3>

      {/* Identifiant technique */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Identifiant
        </label>
        <input
          type="text"
          value={field.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Libellé */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Libellé
        </label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section
        </label>
        <select
          value={field.section}
          onChange={(e) => handleChange('section', e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {SECTIONS.map(section => (
            <option key={section.value} value={section.value}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {/* Liste associée (si type select) */}
      {field.type === 'select' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Liste de données
          </label>
          <select
            value={field.listId}
            onChange={(e) => handleChange('listId', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Sélectionner une liste...</option>
            {Object.keys(lists).map(listId => (
              <option key={listId} value={listId}>
                {listId}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Requis */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => handleChange('required', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 
                   focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700">
          Champ requis
        </label>
      </div>

      {/* Supprimer */}
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg 
                 hover:bg-red-50 transition-colors duration-200"
      >
        Supprimer le champ
      </button>
    </div>
  );
};