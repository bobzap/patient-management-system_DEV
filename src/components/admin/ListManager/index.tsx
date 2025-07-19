'use client';

import { useState, useEffect, useCallback } from 'react';
import { ListEditor } from './ListEditor';
import { toast } from 'sonner';

interface ListItem {
  id: number;
  value: string;
  order: number;
  isCustom?: boolean;
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
  const [error, setError] = useState<string | null>(null);

  // Fonction de tri intelligent : chiffres (desc) + caractères spéciaux puis alphabétique
  const smartSort = useCallback((items: string[]): string[] => {
    return items.sort((a, b) => {
      // Extraire les parties numériques
      const aNumMatch = a.match(/^(\d+)/)
      const bNumMatch = b.match(/^(\d+)/)
      
      // Si les deux commencent par des chiffres
      if (aNumMatch && bNumMatch) {
        const aNum = parseInt(aNumMatch[1], 10)
        const bNum = parseInt(bNumMatch[1], 10)
        
        if (aNum !== bNum) {
          return bNum - aNum // Du plus grand au plus petit
        }
        return a.localeCompare(b, 'fr', { sensitivity: 'base' })
      }
      
      // Si seulement A commence par un chiffre
      if (aNumMatch && !bNumMatch) return -1
      if (!aNumMatch && bNumMatch) return 1
      
      // Caractères spéciaux avant lettres (optimisé)
      const aFirstChar = a.charCodeAt(0)
      const bFirstChar = b.charCodeAt(0)
      
      const aIsSpecial = aFirstChar < 48 || (aFirstChar > 57 && aFirstChar < 65) || (aFirstChar > 90 && aFirstChar < 97) || aFirstChar > 122
      const bIsSpecial = bFirstChar < 48 || (bFirstChar > 57 && bFirstChar < 65) || (bFirstChar > 90 && bFirstChar < 97) || bFirstChar > 122
      
      if (aIsSpecial && !bIsSpecial) return -1
      if (!aIsSpecial && bIsSpecial) return 1
      
      return a.localeCompare(b, 'fr', { sensitivity: 'base' })
    })
  }, [])

  // Fonction de chargement des listes
  const fetchLists = async () => {
    try {
      console.log('🔄 Chargement des listes...');
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/lists');
      console.log('📥 Réponse reçue:', response.status);
      
      const result = await response.json();
      console.log('📦 Données reçues:', {
        success: result.success,
        count: result.data?.length,
        firstList: result.data?.[0]?.name
      });
      
      if (result.data) {
        setLists(result.data);
        if (result.data.length > 0 && !selectedList) {
          setSelectedList(result.data[0].listId);
          console.log('📌 Première liste sélectionnée:', result.data[0].name);
        }
      } else {
        setError('Aucune donnée reçue');
        console.error('❌ Aucune donnée dans la réponse');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Erreur:', message);
      setError(message);
      toast.error('Erreur lors du chargement des listes');
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour charger les listes au montage
  useEffect(() => {
    fetchLists();
  }, []);

  // Fonction de mise à jour
const handleUpdate = async (listId: string, newItems: string[]) => {
  try {
    console.log('📝 Tentative de mise à jour:', { listId, itemCount: newItems.length });
    
    const response = await fetch(`/api/lists/${listId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: newItems }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      // ✅ SEULEMENT la mise à jour locale - PAS de rechargement API
      setLists(prev => 
        prev.map(list => 
          list.listId === listId 
            ? { ...list, items: result.data.items }
            : list
        )
      );
      
      // ❌ SUPPRIMEZ cette ligne qui cause la boucle :
      // fetchLists();
      
      toast.success('Liste mise à jour avec succès');
    } else {
      throw new Error(result.error || 'Erreur lors de la mise à jour');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Erreur: {error}
      </div>
    );
  }

  const currentList = lists.find(l => l.listId === selectedList);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">
          Gestion des Listes ({lists.length})
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {lists.map((list) => (
            <button
              key={list.listId}
              onClick={() => setSelectedList(list.listId)}
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
              items: smartSort(currentList.items.map(item => item.value))
            }}
            onUpdate={(items) => handleUpdate(currentList.listId, items)}
          />
        )}
      </div>
    </div>
  );
};