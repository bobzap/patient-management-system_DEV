// components/admin/FormBuilder/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableField } from './SortableField';
import { FieldProperties } from './FieldProperties';
import { AvailableFields } from './AvailableFields';
import { useLists } from '@/hooks/useLists';
import { toast } from 'sonner';

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
  const { lists } = useLists();

  // Charger la configuration du formulaire
  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        const response = await fetch('/api/forms/patientForm');
        const data = await response.json();
        if (data.success) {
          setFields(data.fields);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement de la configuration');
      }
    };
    loadFormConfig();
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFieldUpdate = async (fieldId: number, updates: Partial<Field>) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    
    try {
      await fetch('/api/forms/patientForm/fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: updatedFields }),
      });
      toast.success('Champ mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* Panneau de gauche - Champs disponibles */}
      <div className="col-span-3 bg-white rounded-lg shadow p-4">
        <AvailableFields onAddField={(type) => {
          const newField = {
            id: Date.now(),
            name: `field_${Date.now()}`,
            label: 'Nouveau champ',
            type,
            required: false,
            section: 'personal',
            order: fields.length
          };
          setFields([...fields, newField]);
        }} />
      </div>

      {/* Zone centrale - Preview du formulaire */}
      <div className="col-span-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Configuration du formulaire patient</h3>
        <DndContext 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={fields.map(f => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field) => (
              <SortableField
                key={field.id}
                field={field}
                onSelect={() => setSelectedField(field)}
                isSelected={selectedField?.id === field.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Panneau de droite - Propriétés */}
      <div className="col-span-3 bg-white rounded-lg shadow p-4">
        {selectedField ? (
          <FieldProperties
            field={selectedField}
            lists={lists}
            onUpdate={(updates) => handleFieldUpdate(selectedField.id, updates)}
            onDelete={() => {
              setFields(fields.filter(f => f.id !== selectedField.id));
              setSelectedField(null);
            }}
          />
        ) : (
          <p className="text-gray-500 text-center">
            Sélectionnez un champ pour modifier ses propriétés
          </p>
        )}
      </div>
    </div>
  );
};