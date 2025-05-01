// src/components/dashboard/HealthMetrics.tsx
'use client';

import React from 'react';
import { 
  CalendarClock, 
  Stethoscope, 
  UserCog, 
  AlertTriangle, 
  ShieldAlert,
  Users
} from 'lucide-react';

interface HealthMetric {
  id: string;
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  onClick?: () => void;
}

interface HealthMetricsProps {
  metrics: HealthMetric[];
  title: string;
  isLoading?: boolean;
}

export function HealthMetrics({
  metrics,
  title,
  isLoading = false
}: HealthMetricsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse p-4 rounded-lg bg-gray-50">
              <div className="h-10 w-10 rounded-full bg-gray-200 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          Aucune métrique disponible
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.id}
              className={`p-4 rounded-lg ${metric.color} border border-${metric.color.replace('bg-', '')}-200 
                         transition-all duration-200 ${metric.onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
              onClick={metric.onClick}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`h-12 w-12 rounded-full bg-white/70 flex items-center justify-center mb-3
                               text-${metric.color.replace('bg-', '')}-600`}>
                  {metric.icon}
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{metric.title}</p>
                <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                {metric.description && (
                  <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to create predefined health metrics
export function createHealthMetrics({
  visiteMedicalePlanifiee,
  limitationsActives,
  etudePostePrevue,
  entretienManagerPrevu,
  detectionsRisque = 0
}: {
  visiteMedicalePlanifiee: number;
  limitationsActives: number;
  etudePostePrevue: number;
  entretienManagerPrevu: number;
  detectionsRisque?: number;
}) {
  return [
    {
      id: 'visite-medicale',
      title: 'Visites médicales planifiées',
      value: visiteMedicalePlanifiee,
      icon: <Stethoscope size={24} />,
      color: 'bg-blue-50',
      description: 'À planifier prochainement'
    },
    {
      id: 'limitations',
      title: 'Limitations actives',
      value: limitationsActives,
      icon: <AlertTriangle size={24} />,
      color: 'bg-amber-50',
      description: 'En cours de suivi'
    },
    {
      id: 'etudes-poste',
      title: 'Études de poste',
      value: etudePostePrevue,
      icon: <UserCog size={24} />,
      color: 'bg-green-50',
      description: 'À réaliser'
    },
    {
      id: 'entretiens-manager',
      title: 'Entretiens manager',
      value: entretienManagerPrevu,
      icon: <Users size={24} />,
      color: 'bg-purple-50',
      description: 'À planifier'
    },
    {
      id: 'detection-precoce',
      title: 'Détection précoce',
      value: detectionsRisque,
      icon: <ShieldAlert size={24} />,
      color: 'bg-red-50',
      description: 'Risques élevés détectés'
    },
    {
      id: 'rappels',
      title: 'Rappels planifiés',
      value: visiteMedicalePlanifiee + entretienManagerPrevu,
      icon: <CalendarClock size={24} />,
      color: 'bg-pink-50',
      description: 'Actions à suivre'
    }
  ];
}