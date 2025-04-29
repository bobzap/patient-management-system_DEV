// src/components/ui/timer.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Clock } from 'lucide-react';

interface TimerProps {
  initialTime?: number; // Temps initial en secondes
  isPaused?: boolean;   // État initial (en pause ou non)
  onPauseChange?: (isPaused: boolean) => void; // Callback quand l'état de pause change
  onTimeUpdate?: (totalSeconds: number) => void; // Callback pour mettre à jour le temps écoulé
  className?: string;
  isReadOnly?: boolean; // Mode consultation
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

  // Formater le temps en HH:MM:SS
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

  // Démarrer/arrêter le timer
  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newValue = prev + 1;
          if (onTimeUpdate) onTimeUpdate(newValue);
          return newValue;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, onTimeUpdate]);

  // Gérer le changement d'état de pause
  const togglePause = () => {
    if (isReadOnly) return; // Ne rien faire en mode lecture seule
    
    const newPausedState = !paused;
    setPaused(newPausedState);
    if (onPauseChange) onPauseChange(newPausedState);
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
    </div>
  );
}