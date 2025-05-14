// src/components/admin/EventTypeManager/EventTypeEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface EventType {
  id?: number;
  name: string;
  color: string;
  icon?: string;
  active: boolean;
}

interface EventTypeEditorProps {
  initialData: EventType | null;
  onSave: (eventType: Partial<EventType>) => void;
  onCancel: () => void;
}

const EventTypeEditor: React.FC<EventTypeEditorProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  // États pour les champs du formulaire
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('');
  const [active, setActive] = useState(true);

  // Charger les données initiales
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setColor(initialData.color || '#3b82f6');
      setIcon(initialData.icon || '');
      setActive(initialData.active !== undefined ? initialData.active : true);
    } else {
      // Valeurs par défaut pour un nouveau type
      setName('');
      setColor('#3b82f6');
      setIcon('');
      setActive(true);
    }
  }, [initialData]);

  // Gestion de la soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return; // Simple validation
    }
    
    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      name,
      color,
      icon: icon || undefined,
      active
    });
  };

  // Couleurs prédéfinies
  const predefinedColors = [
    '#3b82f6', // blue
    '#22c55e', // green
    '#eab308', // yellow
    '#a855f7', // purple
    '#6366f1', // indigo
    '#ef4444', // red
    '#f97316', // orange
    '#14b8a6', // teal
    '#ec4899'  // pink
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div>
          <label htmlFor="event-type-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            id="event-type-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nom du type d'événement"
            required
          />
        </div>

        {/* Couleur */}
        <div>
          <label htmlFor="event-type-color" className="block text-sm font-medium text-gray-700 mb-1">
            Couleur
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="event-type-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-9 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#HEX"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {predefinedColors.map((preColor) => (
              <button
                key={preColor}
                type="button"
                className={`w-6 h-6 rounded-full ${
                  color === preColor ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: preColor }}
                onClick={() => setColor(preColor)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Statut */}
      <div>
        <div className="flex items-center">
          <input
            id="event-type-active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="event-type-active" className="ml-2 block text-sm text-gray-700">
            Type d'événement actif
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Les types inactifs ne seront pas proposés lors de la création d'événements.
        </p>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X size={16} className="inline mr-1" />
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Save size={16} className="inline mr-1" />
          {initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default EventTypeEditor;