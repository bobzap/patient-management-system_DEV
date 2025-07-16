// src/hooks/useUnloadConfirmation.ts
import { useEffect, useCallback } from 'react';

interface UseUnloadConfirmationProps {
  hasUnsavedChanges: boolean;
  message?: string;
  onBeforeUnload?: () => void;
  enabled?: boolean; // Nouvelle prop pour désactiver le hook
}

export function useUnloadConfirmation({
  hasUnsavedChanges,
  message = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?',
  onBeforeUnload,
  enabled = true
}: UseUnloadConfirmationProps) {
  
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = message;
      
      if (onBeforeUnload) {
        onBeforeUnload();
      }
      
      return message;
    }
  }, [hasUnsavedChanges, message, onBeforeUnload]);

  useEffect(() => {
    if (enabled && hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [enabled, hasUnsavedChanges, handleBeforeUnload]);

  return {
    hasUnsavedChanges
  };
}