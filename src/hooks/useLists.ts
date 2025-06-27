import { useState, useEffect } from 'react';

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
            acc[category.listId] = category.items.map(item => item.value);
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
    return lists[listId] || [];
  };

  const validateValue = (listId: string, value: string): boolean => {
    return lists[listId]?.includes(value) || false;
  };

  return {
    lists,
    rawLists,
    isLoading,
    error,
    getListItems,
    validateValue
  };
}