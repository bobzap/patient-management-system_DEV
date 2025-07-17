// src/hooks/useEntretienTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { safeParseResponse } from '@/utils/json';
import { toast } from 'sonner';

interface UseEntretienTimerProps {
  entretienId: number | null;
  isReadOnly: boolean;
  status: string;
  initialSeconds?: number;
  initialPaused?: boolean;
  onAutoSave?: () => Promise<void>;
}

export function useEntretienTimer({
  entretienId,
  isReadOnly,
  status,
  initialSeconds = 0,
  initialPaused = false,
  onAutoSave
}: UseEntretienTimerProps) {
  // Initialiser seconds avec initialSeconds
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  
  // Initialiser isPaused en fonction des paramètres
  const [isPaused, setIsPaused] = useState<boolean>(
    isReadOnly || status !== 'brouillon' || initialPaused
  );
  
  // Toujours démarrer le timer pour un nouvel entretien ou s'il y a des secondes initiales
  const [isStarted, setIsStarted] = useState<boolean>(true); // Toujours démarrer à true pour afficher le timer

  // Ref pour capturer la valeur actuelle des secondes
  const secondsRef = useRef<number>(initialSeconds);

  // Effet pour mettre à jour les états quand les props changent
  useEffect(() => {
    // Ne réinitialiser les secondes que si c'est vraiment un changement d'entretien
    // ou si on change de nouveau entretien (entretienId null -> nombre)
    if (initialSeconds !== secondsRef.current) {
      setSeconds(initialSeconds);
      secondsRef.current = initialSeconds;
    }
    setIsPaused(isReadOnly || status !== 'brouillon' || initialPaused);
  }, [initialSeconds, initialPaused, isReadOnly, status]);

  // Effet pour maintenir la ref synchronisée avec l'état
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  // Mettre à jour l'API quand l'état de pause change
  const updatePauseState = useCallback(async (newPausedState: boolean): Promise<boolean> => {
    // Vérifier que entretienId est valide
    if (!entretienId || isNaN(Number(entretienId))) {
      console.warn('updatePauseState: entretienId invalide ou manquant:', entretienId);
      return false;
    }
    
    try {
      const response = await fetch(`/api/entretiens/${entretienId}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enPause: newPausedState })
      });
      
      // Gestion spécifique des erreurs 404
      if (response.status === 404) {
        console.warn('updatePauseState: Entretien non trouvé (404) pour ID:', entretienId);
        return false;
      }
      
      const parseResult = await safeParseResponse(response);
      
      if (!parseResult.success) {
        console.error('Erreur lors de la mise à jour de l\'état de pause:', parseResult.error);
        return false;
      }
      
      return parseResult.data?.success === true;
    } catch (error) {
      console.error('Erreur réseau lors de la mise à jour de l\'état de pause:', error);
      return false;
    }
  }, [entretienId]);

  // Sauvegarder le temps écoulé dans la base de données
  const updateElapsedTime = useCallback(async (currentSeconds: number) => {
    // Vérifier que entretienId est valide
    if (!entretienId || isNaN(Number(entretienId))) {
      console.warn('updateElapsedTime: entretienId invalide ou manquant:', entretienId);
      return;
    }
    
    try {
      const response = await fetch(`/api/entretiens/${entretienId}/elapsed-time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedSeconds: currentSeconds })
      });
      
      // Gestion spécifique des erreurs 404
      if (response.status === 404) {
        console.warn('updateElapsedTime: Entretien non trouvé (404) pour ID:', entretienId);
        return;
      }
      
      if (!response.ok) {
        console.error('Erreur HTTP lors de la sauvegarde du temps écoulé:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du temps écoulé:', error);
    }
  }, [entretienId]);

  // Pause forcée (utilisée lors de la navigation)
  const forcePause = useCallback(async () => {
    if (isPaused || !entretienId || status !== 'brouillon') {
      return;
    }
    
    // Sauvegarder le temps écoulé avant la pause
    await updateElapsedTime(seconds);
    
    setIsPaused(true);
    await updatePauseState(true);
  }, [entretienId, isPaused, status, seconds, updateElapsedTime, updatePauseState]);

  // Toggle l'état de pause
  const togglePause = useCallback(async () => {
    if (isReadOnly || status !== 'brouillon' || !entretienId) {
      return;
    }
    
    const newPausedState = !isPaused;
    
    // Si on met en pause, sauvegarder le temps écoulé d'abord
    if (newPausedState) {
      await updateElapsedTime(seconds);
    }
    
    // Optimistically update local state
    setIsPaused(newPausedState);
    
    // Synchronize with API
    const success = await updatePauseState(newPausedState);
    if (!success) {
      console.error('Échec de la synchronisation, retour à l\'état précédent');
      setIsPaused(isPaused); // Revert on failure
    }
  }, [isPaused, isReadOnly, status, entretienId, seconds, updateElapsedTime, updatePauseState]);

  // Ref pour stocker le callback onAutoSave
  const onAutoSaveRef = useRef(onAutoSave);
  
  // Mettre à jour la ref quand onAutoSave change
  useEffect(() => {
    onAutoSaveRef.current = onAutoSave;
  }, [onAutoSave]);

  // Fonction de sauvegarde automatique des données
  const performAutoSave = useCallback(async () => {
    if (!onAutoSaveRef.current) return;
    
    try {
      await onAutoSaveRef.current();
      
      // Afficher une notification discrète de sauvegarde automatique
      toast('Sauvegarde automatique', {
        duration: 2500,
        icon: '💾',
        description: 'Données sauvegardées automatiquement',
        position: 'bottom-right',
        dismissible: true,
        closeButton: true,
        style: {
          background: 'rgba(34, 197, 94, 0.75)', // Plus transparent
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#ffffff',
          fontSize: '13px',
          opacity: 0.95,
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)',
          borderRadius: '12px'
        },
        className: 'autosave-toast toast-vital-sync'
      });
    } catch (error) {
      // Sauvegarde automatique échouée - continuera au prochain cycle
      toast.error('Erreur de sauvegarde automatique', {
        duration: 3000,
        icon: '⚠️',
        description: 'La sauvegarde automatique a échoué. Veuillez sauvegarder manuellement.',
        position: 'bottom-right'
      });
    }
  }, [entretienId]);

  // Effet pour gérer le timer
  useEffect(() => {
    // Toujours en pause pour les entretiens en lecture seule ou non brouillons
    if (isReadOnly || status !== 'brouillon') {
      setIsPaused(true);
      return;
    }
    
    let intervalId: NodeJS.Timeout | null = null;
    let saveIntervalId: NodeJS.Timeout | null = null;
    let autoSaveIntervalId: NodeJS.Timeout | null = null;
    
    if (isStarted && !isPaused) {
      // Timer principal (1 seconde)
      intervalId = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
      
      // Sauvegarde périodique du temps écoulé (toutes les 10 secondes)
      saveIntervalId = setInterval(() => {
        if (entretienId) {
          updateElapsedTime(secondsRef.current);
        }
      }, 10000);

      // Sauvegarde automatique des données d'entretien (toutes les 30 secondes)
      autoSaveIntervalId = setInterval(() => {
        performAutoSave();
      }, 30000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (saveIntervalId) {
        clearInterval(saveIntervalId);
      }
      if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
      }
    };
  }, [isStarted, isPaused, isReadOnly, status, entretienId, updateElapsedTime, performAutoSave]);

  // Effect pour forcer la pause à la sortie du composant
  useEffect(() => {
    return () => {
      if (entretienId && !isPaused && status === 'brouillon') {
        // Sauvegarder le temps écoulé avant la fermeture
        updateElapsedTime(secondsRef.current).finally(() => {
          updatePauseState(true).catch(error => {
            console.error("Erreur lors de la mise en pause au démontage:", error);
          });
        });
      }
    };
  }, [entretienId, isPaused, status, updateElapsedTime, updatePauseState]);


  // Formater le temps (HH:MM:SS)
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  return {
    seconds,
    isPaused,
    isStarted,
    formatTime,
    togglePause,
    forcePause
  };
}