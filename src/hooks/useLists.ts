// src/hooks/useLists.ts
import { useState, useEffect } from 'react';
import { ListCategory, FormattedLists } from '@/types';

export function useLists() {
  const [lists, setLists] = useState<FormattedLists>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawLists, setRawLists] = useState<ListCategory[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/lists');
        const result = await response.json();

        if (result.data) {
          setRawLists(result.data);
          
          // Transformer les données en un objet plus facile à utiliser
          const formattedLists = result.data.reduce((acc: FormattedLists, category: ListCategory) => {
            acc[category.listId] = category.items.map(item => item.value);
            return acc;
          }, {});

          setLists(formattedLists);
          setError(null);
        }
      } catch (err) {
        setError('Erreur lors du chargement des listes');
        console.error('Erreur lors du chargement des listes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();
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