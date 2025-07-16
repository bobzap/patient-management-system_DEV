// src/hooks/useNavigationGuard.ts
import { useState, useCallback } from 'react';

export interface NavigationGuardOptions {
  hasUnsavedChanges: boolean;
  onNavigate?: () => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  saveText?: string;
}

export function useNavigationGuard({
  hasUnsavedChanges,
  onNavigate,
  onSave,
  onCancel,
  title = 'Modifications non sauvegardées',
  message = 'Vous avez des modifications non sauvegardées. Que souhaitez-vous faire ?',
  confirmText = 'Quitter sans sauvegarder',
  cancelText = 'Annuler',
  saveText = 'Sauvegarder et quitter'
}: NavigationGuardOptions) {
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const handleNavigationAttempt = useCallback((navigationCallback?: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigationCallback || onNavigate || (() => {}));
      setShowConfirmDialog(true);
      return false; // Bloque la navigation
    } else {
      if (navigationCallback) {
        navigationCallback();
      } else if (onNavigate) {
        onNavigate();
      }
      return true; // Permet la navigation
    }
  }, [hasUnsavedChanges, onNavigate]);

  const handleConfirmNavigation = useCallback(() => {
    setShowConfirmDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleSaveAndNavigate = useCallback(async () => {
    if (onSave) {
      try {
        await onSave();
        setShowConfirmDialog(false);
        if (pendingNavigation) {
          pendingNavigation();
          setPendingNavigation(null);
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  }, [onSave, pendingNavigation]);

  const handleCancelNavigation = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  return {
    showConfirmDialog,
    handleNavigationAttempt,
    handleConfirmNavigation,
    handleSaveAndNavigate,
    handleCancelNavigation,
    dialogProps: {
      isOpen: showConfirmDialog,
      onClose: handleCancelNavigation,
      onConfirm: handleConfirmNavigation,
      onCancel: handleCancelNavigation,
      onThirdOption: onSave ? handleSaveAndNavigate : undefined,
      title,
      message,
      confirmText,
      cancelText,
      thirdOptionText: onSave ? saveText : undefined,
      variant: 'warning' as const
    }
  };
}