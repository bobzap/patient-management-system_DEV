// src/components/admin/ListManager/ListEditor.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ListEditorProps {
  list: {
    id: string;
    name: string;
    items: string[];
  };
  onUpdate: (items: string[]) => void;
}

export const ListEditor = ({ list, onUpdate }: ListEditorProps) => {
  const [items, setItems] = useState(list.items);
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) {
      toast.error('Veuillez entrer une valeur');
      return;
    }
    
    if (items.includes(newItem.trim())) {
      toast.error('Cet élément existe déjà');
      return;
    }

    const updatedItems = [...items, newItem.trim()];
    setItems(updatedItems);
    onUpdate(updatedItems);
    setNewItem('');
  };

  const handleRemove = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) return;

    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    setItems(newItems);
    onUpdate(newItems);
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Ajouter un élément à ${list.name}`}
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors duration-200"
        >
          Ajouter
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg 
                     hover:bg-gray-100 group transition-colors duration-200"
          >
            <span className="flex-grow">{item}</span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className={`p-2 rounded hover:bg-gray-200 transition-colors
                  ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(index, 'down')}
                disabled={index === items.length - 1}
                className={`p-2 rounded hover:bg-gray-200 transition-colors
                  ${index === items.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ↓
              </button>
              <button
                onClick={() => handleRemove(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded
                         transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun élément dans cette liste
          </div>
        )}
      </div>
    </div>
  );
};