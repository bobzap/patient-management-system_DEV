// src/components/ui/timer.tsx
'use client';

import React from 'react';
import { Play, Pause, Clock } from 'lucide-react';

interface TimerProps {
  seconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  isReadOnly?: boolean;
  className?: string;
}

export function Timer({
  seconds,
  isPaused,
  onTogglePause,
  isReadOnly = false,
  className = ''
}: TimerProps) {
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
    <div className={`flex items-center gap-3 bg-white rounded-lg shadow-sm p-2 ${className}`}>
      <div className="flex items-center gap-1 text-gray-700">
        <Clock size={16} />
        <span className="text-sm font-medium">Durée:</span>
      </div>
      
      <div className="font-mono text-lg font-bold text-blue-800">
        {formatTime(seconds)}
      </div>
      
      {!isReadOnly && (
        <button
          onClick={onTogglePause}
          className={`p-2 rounded-full ${
            isPaused 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          } transition-colors`}
          title={isPaused ? 'Démarrer' : 'Mettre en pause'}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
      
      {isPaused && (
        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
          En pause
        </span>
      )}
    </div>
  );
}