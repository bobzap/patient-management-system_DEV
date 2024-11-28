// components/admin/FormBuilder/SortableField.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableFieldProps {
  field: Field;
  onSelect: () => void;
  isSelected: boolean;
}

export const SortableField = ({ field, onSelect, isSelected }: SortableFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'select': return '📋';
      case 'date': return '📅';
      case 'number': return '🔢';
      case 'checkbox': return '☑️';
      default: return '📄';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={`p-4 mb-2 rounded-lg border border-gray-200 cursor-move
                 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:bg-gray-50'} 
                 ${isDragging ? 'shadow-lg' : 'shadow-sm'}
                 transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{getFieldIcon(field.type)}</span>
          <div>
            <div className="font-medium text-gray-900">{field.label}</div>
            <div className="text-sm text-gray-500">
              {field.type} {field.required && '(requis)'} • {field.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
            {field.section}
          </span>
          <div className="text-gray-400 cursor-grab">⋮⋮</div>
        </div>
      </div>
    </div>
  );
};