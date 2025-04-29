// src/hooks/useEntretienTimer.ts
import { useState, useEffect, useCallback } from 'react';

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
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(initialPaused || isReadOnly || status !== 'brouillon');
  const [isStarted, setIsStarted] = useState<boolean>(!!entretienId || initialSeconds > 0);

  // Mettre à jour l'API quand l'état de pause change
  const updatePauseState = useCallback(async (newPausedState: boolean) => {
    if (!entretienId) return;
    
    try {
      const response = await fetch(`/api/entretiens/${entretienId}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enPause: newPausedState })
      });
      
      if (!response.ok) {
        console.error('Erreur lors de la mise à jour de l\'état de pause:', await response.text());
      }
    } catch (error) {
      console.error('Erreur réseau lors de la mise à jour de l\'état de pause:', error);
    }
  }, [entretienId]);

  // Pause forcée (utilisée lors de la navigation)
  const forcePause = useCallback(async () => {
    if (isPaused || !entretienId) return;
    
    setIsPaused(true);
    await updatePauseState(true);
  }, [entretienId, isPaused, updatePauseState]);

  // Toggle l'état de pause
  const togglePause = useCallback(async () => {
    if (isReadOnly || status !== 'brouillon') return;
    
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    await updatePauseState(newPausedState);
  }, [isPaused, isReadOnly, status, updatePauseState]);

  // Effet pour gérer le timer
  useEffect(() => {
    // Toujours en pause pour les entretiens en lecture seule ou non brouillons
    if (isReadOnly || status !== 'brouillon') {
      setIsPaused(true);
      return;
    }
    
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isStarted && !isPaused) {
      intervalId = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isStarted, isPaused, isReadOnly, status]);

  // Effect pour forcer la pause à la sortie du composant
  useEffect(() => {
    return () => {
      if (entretienId && !isPaused && status === 'brouillon') {
        updatePauseState(true);
      }
    };
  }, [entretienId, isPaused, status, updatePauseState]);

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