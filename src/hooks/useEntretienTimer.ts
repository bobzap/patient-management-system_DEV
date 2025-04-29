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
  // Initialiser seconds avec initialSeconds
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  
  // Initialiser isPaused en fonction des paramètres
  const [isPaused, setIsPaused] = useState<boolean>(
    initialPaused || isReadOnly || status !== 'brouillon'
  );
  
  // Toujours démarrer le timer pour un nouvel entretien ou s'il y a des secondes initiales
  const [isStarted, setIsStarted] = useState<boolean>(true); // Toujours démarrer à true pour afficher le timer

  // Effet pour mettre à jour les états quand les props changent
  useEffect(() => {
    console.log("useEntretienTimer - Mise à jour des props:", {
      initialSeconds, initialPaused, isReadOnly, status
    });
    
    setSeconds(initialSeconds);
    setIsPaused(initialPaused || isReadOnly || status !== 'brouillon');
  }, [initialSeconds, initialPaused, isReadOnly, status]);

  // Mettre à jour l'API quand l'état de pause change
  const updatePauseState = useCallback(async (newPausedState: boolean) => {
    if (!entretienId) return;
    
    console.log(`updatePauseState - Entretien ${entretienId} - Pause: ${newPausedState}`);
    
    try {
      const response = await fetch(`/api/entretiens/${entretienId}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enPause: newPausedState })
      });
      
      if (!response.ok) {
        console.error('Erreur lors de la mise à jour de l\'état de pause:', await response.text());
      } else {
        console.log(`Entretien ${entretienId} - État de pause mis à jour: ${newPausedState}`);
      }
    } catch (error) {
      console.error('Erreur réseau lors de la mise à jour de l\'état de pause:', error);
    }
  }, [entretienId]);

  // Pause forcée (utilisée lors de la navigation)
  const forcePause = useCallback(async () => {
    console.log(`forcePause - Entretien ${entretienId} - Actuel: ${isPaused}, Status: ${status}`);
    
    if (isPaused || !entretienId || status !== 'brouillon') {
      console.log("Pas besoin de mettre en pause (déjà en pause ou pas un brouillon)");
      return;
    }
    
    console.log(`Mise en pause forcée de l'entretien ${entretienId}`);
    setIsPaused(true);
    await updatePauseState(true);
  }, [entretienId, isPaused, status, updatePauseState]);

  // Toggle l'état de pause
  const togglePause = useCallback(async () => {
    console.log(`togglePause - Entretien ${entretienId} - État actuel: ${isPaused}`);
    
    if (isReadOnly || status !== 'brouillon') {
      console.log("Mode lecture seule ou non brouillon - Pas de changement d'état");
      return;
    }
    
    const newPausedState = !isPaused;
    console.log(`Changement d'état de pause: ${isPaused ? 'reprise' : 'pause'}`);
    setIsPaused(newPausedState);
    await updatePauseState(newPausedState);
  }, [isPaused, isReadOnly, status, entretienId, updatePauseState]);

  // Effet pour gérer le timer
  useEffect(() => {
    console.log(`Effet timer - isStarted: ${isStarted}, isPaused: ${isPaused}, isReadOnly: ${isReadOnly}`);
    
    // Toujours en pause pour les entretiens en lecture seule ou non brouillons
    if (isReadOnly || status !== 'brouillon') {
      console.log("Mode lecture seule ou non brouillon - Timer en pause");
      setIsPaused(true);
      return;
    }
    
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isStarted && !isPaused) {
      console.log("Démarrage du timer");
      intervalId = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      console.log(`Timer non démarré - isStarted: ${isStarted}, isPaused: ${isPaused}`);
    }
    
    return () => {
      if (intervalId) {
        console.log("Nettoyage de l'intervalle timer");
        clearInterval(intervalId);
      }
    };
  }, [isStarted, isPaused, isReadOnly, status]);

  // Effect pour forcer la pause à la sortie du composant
  useEffect(() => {
    return () => {
      console.log(`Démontage du hook timer - Entretien ${entretienId} - isPaused: ${isPaused}`);
      
      if (entretienId && !isPaused && status === 'brouillon') {
        console.log(`Mise en pause de l'entretien ${entretienId} au démontage du hook`);
        updatePauseState(true).catch(error => {
          console.error("Erreur lors de la mise en pause au démontage:", error);
        });
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