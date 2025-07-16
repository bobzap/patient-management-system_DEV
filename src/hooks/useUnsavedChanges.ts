// src/hooks/useUnsavedChanges.ts
import { useState, useEffect, useCallback } from 'react';

interface UseUnsavedChangesProps {
  initialData: any;
  currentData: any;
  isLoading?: boolean;
  ignoreFields?: string[];
}

export function useUnsavedChanges({
  initialData,
  currentData,
  isLoading = false,
  ignoreFields = []
}: UseUnsavedChangesProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return obj1 === obj2;
    }
    
    const keys1 = Object.keys(obj1).filter(key => !ignoreFields.includes(key));
    const keys2 = Object.keys(obj2).filter(key => !ignoreFields.includes(key));
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }, [ignoreFields]);

  useEffect(() => {
    if (!isLoading && initialData && currentData) {
      const hasChanges = !deepEqual(initialData, currentData);
      setHasUnsavedChanges(hasChanges);
    } else if (!initialData || !currentData) {
      // Si les données ne sont pas encore chargées, pas de changements
      setHasUnsavedChanges(false);
    }
  }, [initialData, currentData, isLoading, deepEqual]);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const markAsUnsaved = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  return {
    hasUnsavedChanges,
    markAsSaved,
    markAsUnsaved
  };
}