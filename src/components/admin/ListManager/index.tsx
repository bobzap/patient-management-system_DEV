'use client';

import { useState, useEffect } from 'react';
import { ListEditor } from './ListEditor';
import { toast } from 'sonner';

interface ListItem {
  id: number;
  value: string;
  order: number;
}

interface ListCategory {
  id: number;
  listId: string;
  name: string;
  items: ListItem[];
}

export const ListManager = () => {
  const [lists, setLists] = useState<ListCategory[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger les listes depuis l'API au montage
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('/api/lists');
        const result = await response.json();
        
        if (result.data) {
          setLists(result.data);
          if (result.data.length > 0) {
            setSelectedList(result.data[0].listId);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error);
        toast.error('Erreur lors du chargement des listes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
  }, []);

  const handleUpdate = async (listId: string, newItems: string[]) => {
    try {
      console.log('Tentative de mise à jour:', {
        listId,
        newItems
      });
  
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: newItems }),
      });
  
      console.log('Statut de la réponse:', response.status);
      
      const responseText = await response.text();
      console.log('Réponse brute:', responseText);
  
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur parsing JSON:', e);
        console.log('Texte qui a causé l\'erreur:', responseText);
        throw new Error(`Erreur de parsing JSON: ${e.message}`);
      }
  
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }
  
      setLists(prev =>
        prev.map(list =>
          list.listId === listId
            ? { ...list, items: result.data.items }
            : list
        )
      );
  
      toast.success('Liste mise à jour avec succès');
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        error
      });
      toast.error(`Erreur: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const currentList = lists.find(l => l.listId === selectedList);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">
          Gestion des Listes
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {lists.map((list) => (
            <button
              key={list.listId}
              onClick={() => {
                console.log('Sélection de la liste:', list.name);
                setSelectedList(list.listId);
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm
                ${selectedList === list.listId
                  ? 'bg-blue-600 text-white font-medium shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {list.name}
              <span className="ml-2 text-xs opacity-75">
                ({list.items.length})
              </span>
            </button>
          ))}
        </div>

        {currentList && (
          <ListEditor
            list={{
              id: currentList.listId,
              name: currentList.name,
              items: currentList.items.map(item => item.value)
            }}
            onUpdate={(items) => handleUpdate(currentList.listId, items)}
          />
        )}
      </div>
    </div>
  );
};