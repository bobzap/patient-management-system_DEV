'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Synchroniser les items quand la liste change
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Mise à jour des items:', list.items);
    }
    // Tri intelligent automatique
    const sortedItems = smartSort([...(list.items || [])]);
    setItems(sortedItems);
  }, [list.id, list.items, smartSort]);

  const handleAdd = useCallback(() => {
    if (!newItem.trim()) {
      toast.error('Veuillez entrer une valeur');
      return;
    }
    
    if (items.includes(newItem.trim())) {
      toast.error('Cet élément existe déjà');
      return;
    }

    // Ajouter et trier intelligemment
    const updatedItems = smartSort([...items, newItem.trim()]);
    setItems(updatedItems);
    onUpdate(updatedItems);
    setNewItem('');
    toast.success('Élément ajouté');
  }, [items, newItem, onUpdate, smartSort]);

  const handleRemove = useCallback((index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onUpdate(updatedItems);
    toast.success('Élément supprimé');
  }, [items, onUpdate]);

  // Filtrer les items selon le terme de recherche
  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Supprimer la fonction handleMove car le tri est automatique
  const handleMove = useCallback(() => {
    // Fonction désactivée - le tri est automatique
    toast.info('Le tri est automatique par ordre alphabétique');
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }, [handleAdd]);

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Ajouter un élément à ${list.name}`}
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors duration-200"
        >
          Ajouter
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher dans la liste..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium">Tri automatique:</span> Chiffres (décroissant) → Caractères spéciaux → Alphabétique
        {searchTerm && (
          <span className="ml-2 text-blue-600">
            • {filteredItems.length} résultat(s) trouvé(s)
          </span>
        )}
      </div>

      <div className="space-y-2">
        {items.length > 0 ? (
          filteredItems.map((item, displayIndex) => {
            const realIndex = items.indexOf(item);
            return (
              <div 
                key={`${list.id}-${realIndex}-${item}`}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg 
                         hover:bg-gray-100 group transition-colors duration-200"
              >
                <span className="flex-grow">{item}</span>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 px-2">
                    #{displayIndex + 1}
                  </span>
                  <button
                    onClick={() => handleRemove(realIndex)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded
                             transition-colors duration-200"
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        ) : searchTerm ? (
          <div className="text-center py-8 text-gray-500">
            Aucun résultat trouvé pour "{searchTerm}"
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun élément dans cette liste
          </div>
        )}
      </div>
    </div>
  );
};