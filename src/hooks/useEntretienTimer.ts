// src/hooks/useEntretienTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { safeParseResponse } from '@/utils/json';

interface UseEntretienTimerProps {
  entretienId: number | null;
  isReadOnly: boolean;
  status: string;
  initialSeconds?: number;
  initialPaused?: boolean;
}

export function useEntretienTimer({
  entretienId,
  isReadOnly,
  status,
  initialSeconds = 0,
  initialPaused = false
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
    if (!entretienId) return false;
    
    try {
      const response = await fetch(`/api/entretiens/${entretienId}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enPause: newPausedState })
      });
      
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
    if (!entretienId) return;
    
    try {
      const response = await fetch(`/api/entretiens/${entretienId}/elapsed-time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedSeconds: currentSeconds })
      });
      
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
    if (isReadOnly || status !== 'brouillon') {
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

  // Effet pour gérer le timer
  useEffect(() => {
    // Toujours en pause pour les entretiens en lecture seule ou non brouillons
    if (isReadOnly || status !== 'brouillon') {
      setIsPaused(true);
      return;
    }
    
    let intervalId: NodeJS.Timeout | null = null;
    let saveIntervalId: NodeJS.Timeout | null = null;
    
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
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (saveIntervalId) {
        clearInterval(saveIntervalId);
      }
    };
  }, [isStarted, isPaused, isReadOnly, status, entretienId, updateElapsedTime]);

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