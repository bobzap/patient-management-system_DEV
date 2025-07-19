import { useState, useEffect } from 'react';

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

export interface FormattedLists {
  [key: string]: string[];
}

// ✅ CACHE GLOBAL pour éviter les appels multiples
let globalListsCache: FormattedLists | null = null;
let globalRawListsCache: ListCategory[] | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

export function useLists() {
  const [lists, setLists] = useState<FormattedLists>(globalListsCache || {});
  const [isLoading, setIsLoading] = useState(!globalListsCache);
  const [error, setError] = useState<string | null>(null);
  const [rawLists, setRawLists] = useState<ListCategory[]>(globalRawListsCache || []);

  useEffect(() => {
    // ✅ Si on a déjà les données en cache, ne pas refetch
    if (globalListsCache && globalRawListsCache) {
      setLists(globalListsCache);
      setRawLists(globalRawListsCache);
      setIsLoading(false);
      return;
    }

    // ✅ Si un fetch est déjà en cours, attendre sa completion
    if (isFetching && fetchPromise) {
      fetchPromise.then(() => {
        if (globalListsCache && globalRawListsCache) {
          setLists(globalListsCache);
          setRawLists(globalRawListsCache);
          setIsLoading(false);
        }
      });
      return;
    }

    // ✅ Démarrer un nouveau fetch
    const fetchLists = async () => {
      if (isFetching) return; // Double protection
      
      isFetching = true;
      console.log('🔄 [useLists] DEBUT du fetch des listes');
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/lists');
        const result = await response.json();
        
        if (result.data) {
          // Mettre en cache GLOBAL
          globalRawListsCache = result.data;
          
          const formattedLists = result.data.reduce((acc: FormattedLists, category: ListCategory) => {
            // Tri intelligent : chiffres (desc) + caractères spéciaux puis alphabétique
            const sortedItems = category.items
              .map(item => item.value)
              .sort((a, b) => {
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
                
                // Caractères spéciaux avant lettres
                const aFirstChar = a.charCodeAt(0)
                const bFirstChar = b.charCodeAt(0)
                
                const aIsSpecial = aFirstChar < 48 || (aFirstChar > 57 && aFirstChar < 65) || (aFirstChar > 90 && aFirstChar < 97) || aFirstChar > 122
                const bIsSpecial = bFirstChar < 48 || (bFirstChar > 57 && bFirstChar < 65) || (bFirstChar > 90 && bFirstChar < 97) || bFirstChar > 122
                
                if (aIsSpecial && !bIsSpecial) return -1
                if (!aIsSpecial && bIsSpecial) return 1
                
                return a.localeCompare(b, 'fr', { sensitivity: 'base' })
              });
            acc[category.listId] = sortedItems;
            return acc;
          }, {});
          
          globalListsCache = formattedLists;
          
          // Mettre à jour les états locaux
          setRawLists(result.data);
          setLists(formattedLists);
          setError(null);
          
          console.log('✅ [useLists] Données mises en cache avec succès');
        }
      } catch (err) {
        const errorMessage = 'Erreur lors du chargement des listes';
        setError(errorMessage);
        console.error('❌ [useLists] Erreur:', err);
      } finally {
        setIsLoading(false);
        isFetching = false;
        fetchPromise = null;
      }
    };

    fetchPromise = fetchLists();
  }, []);

  const getListItems = (listId: string): string[] => {
    const items = lists[listId] || [];
    // Les items sont déjà triés lors du formatage, pas besoin de re-trier
    return items;
  };

  const validateValue = (listId: string, value: string): boolean => {
    return lists[listId]?.includes(value) || false;
  };

  // Fonction pour vider le cache et forcer un rechargement
  const refreshLists = () => {
    globalListsCache = null;
    globalRawListsCache = null;
    setLists({});
    setRawLists([]);
    setIsLoading(true);
    // Le useEffect se déclenchera automatiquement
  };

  return {
    lists,
    rawLists,
    isLoading,
    error,
    getListItems,
    validateValue,
    refreshLists
  };
}