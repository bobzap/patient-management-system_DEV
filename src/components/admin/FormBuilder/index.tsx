import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AvailableFields } from './AvailableFields';
import { FieldProperties } from './FieldProperties';
import { SortableField } from './SortableField';
import type { FormattedLists } from '@/types';

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

export const FormBuilder = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [availableLists, setAvailableLists] = useState<FormattedLists>({});

  // Charger les listes disponibles
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('/api/lists');
        const data = await response.json();
        if (data.success) {
          setAvailableLists(data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error);
      }
    };
    fetchLists();
  }, []);

  // Gérer le drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(f => f.id === active.id);
      const newIndex = fields.findIndex(f => f.id === over.id);
      
      const newFields = [...fields];
      const [movedField] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, movedField);
      
      // Mettre à jour l'ordre
      const updatedFields = newFields.map((field, index) => ({
        ...field,
        order: index
      }));
      
      setFields(updatedFields);
      // TODO: Sauvegarder l'ordre dans la base de données
    }
  };

  const handleFieldSelect = (field: Field) => {
    setSelectedField(field);
  };

  const handleFieldUpdate = (updates: Partial<Field>) => {
    if (!selectedField) return;

    const updatedFields = fields.map(field =>
      field.id === selectedField.id ? { ...field, ...updates } : field
    );

    setFields(updatedFields);
    setSelectedField({ ...selectedField, ...updates });
    // TODO: Sauvegarder les modifications dans la base de données
  };

  const handleAddField = (fieldType: string) => {
    const newField: Field = {
      id: Date.now(), // Temporaire, sera remplacé par l'ID de la BDD
      name: `field_${Date.now()}`,
      label: 'Nouveau champ',
      type: fieldType,
      required: false,
      section: 'default',
      order: fields.length
    };

    setFields([...fields, newField]);
    setSelectedField(newField);
    // TODO: Sauvegarder le nouveau champ dans la base de données
  };

  const handleDeleteField = () => {
    if (!selectedField) return;

    const updatedFields = fields.filter(field => field.id !== selectedField.id);
    setFields(updatedFields);
    setSelectedField(null);
    // TODO: Supprimer le champ de la base de données
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Panel de gauche: Champs disponibles */}
      <div className="col-span-3 bg-white shadow rounded-lg p-4">
        <AvailableFields onAddField={handleAddField} />
      </div>

      {/* Zone centrale: Champs du formulaire */}
      <div className="col-span-6 bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Structure du formulaire</h3>
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <SortableContext items={fields} strategy={verticalListSortingStrategy}>
            {fields.map(field => (
              <SortableField
                key={field.id}
                field={field}
                onSelect={() => handleFieldSelect(field)}
                isSelected={selectedField?.id === field.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Panel de droite: Propriétés du champ */}
      <div className="col-span-3 bg-white shadow rounded-lg p-4">
        {selectedField ? (
          <FieldProperties
            field={selectedField}
            lists={availableLists}
            onUpdate={handleFieldUpdate}
            onDelete={handleDeleteField}
          />
        ) : (
          <p className="text-gray-500 text-center">
            Sélectionnez un champ pour voir ses propriétés
          </p>
        )}
      </div>
    </div>
  );
};