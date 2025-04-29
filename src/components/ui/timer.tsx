// src/components/ui/timer.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Clock } from 'lucide-react';

interface TimerProps {
  initialTime?: number;
  isPaused?: boolean;
  onPauseChange?: (isPaused: boolean) => void;
  onTimeUpdate?: (totalSeconds: number) => void;
  className?: string;
  isReadOnly?: boolean;
}

export function Timer({
  initialTime = 0,
  isPaused = false,
  onPauseChange,
  onTimeUpdate,
  className = '',
  isReadOnly = false
}: TimerProps) {
  const [seconds, setSeconds] = useState<number>(initialTime);
  const [paused, setPaused] = useState<boolean>(isPaused);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Utiliser useEffect pour mettre à jour l'état paused lorsque isPaused change
  // Au lieu de le faire directement dans le rendu
  useEffect(() => {
    console.log("Timer - isPaused a changé:", isPaused);
    setPaused(isPaused);
  }, [isPaused]);

  // Utiliser useEffect pour mettre à jour seconds lorsque initialTime change
  useEffect(() => {
    console.log("Timer - initialTime a changé:", initialTime);
    setSeconds(initialTime);
  }, [initialTime]);

  // Gérer le timer
  useEffect(() => {
    console.log("Timer - état du timer:", { paused, seconds });
    
    if (!paused) {
      console.log("Timer - démarrage");
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newValue = prev + 1;
          if (onTimeUpdate) onTimeUpdate(newValue);
          return newValue;
        });
      }, 1000);
    } else if (intervalRef.current) {
      console.log("Timer - arrêt");
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        console.log("Timer - nettoyage");
        clearInterval(intervalRef.current);
      }
    };
  }, [paused, onTimeUpdate]);

  // Fonction pour basculer l'état de pause
  const togglePause = () => {
    if (isReadOnly) return;
    
    const newPausedState = !paused;
    console.log("Timer - basculement manuel:", { actuel: paused, nouveau: newPausedState });
    
    setPaused(newPausedState);
    if (onPauseChange) onPauseChange(newPausedState);
  };

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

  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-lg shadow-sm p-2 ${className}`}
    >
      <div className="flex items-center gap-1 text-gray-700">
        <Clock size={16} />
        <span className="text-sm font-medium">Durée:</span>
      </div>
      
      <div className="font-mono text-lg font-bold text-blue-800">
        {formatTime(seconds)}
      </div>
      
      {!isReadOnly && (
        <button
          onClick={togglePause}
          className={`p-2 rounded-full ${
            paused 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          } transition-colors`}
          title={paused ? 'Démarrer' : 'Pause'}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
      
      {paused && (
        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
          En pause
        </span>
      )}
    </div>
  );
}