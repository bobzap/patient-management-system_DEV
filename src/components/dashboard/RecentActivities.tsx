// src/components/dashboard/RecentActivities.tsx
'use client';

import React from 'react';
import { Patient } from '@/types';
import { ArrowRight, Calendar, Clock, CheckCircle, AlertCircle, Archive } from 'lucide-react';

interface EntretienWithPatient {
  id: number;
  patientId: number;
  numeroEntretien: number;
  dateCreation: string;
  dateModification: string;
  status: string;
  patient?: Patient;
  donneesEntretien?: string;
}

interface RecentActivitiesProps {
  entretiens: EntretienWithPatient[];
  onViewEntretien?: (entretienId: number) => void;
  onViewPatient?: (patientId: number) => void;
  isLoading?: boolean;
  maxItems?: number;
}

export function RecentActivities({
  entretiens,
  onViewEntretien,
  onViewPatient,
  isLoading = false,
  maxItems = 5
}: RecentActivitiesProps) {
  // Fonction pour obtenir un icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finalise':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'archive':
        return <Archive size={16} className="text-gray-500" />;
      case 'brouillon':
      default:
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  // Fonction pour obtenir la classe de couleur selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalise':
        return 'bg-green-100 text-green-800';
      case 'archive':
        return 'bg-gray-100 text-gray-800';
      case 'brouillon':
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Trier les entretiens par date de modification (plus récent d'abord)
  const sortedEntretiens = [...entretiens]
    .sort((a, b) => new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime())
    .slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h3>
      
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedEntretiens.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Aucune activité récente
        </div>
      ) : (
        <div className="space-y-6">
          {sortedEntretiens.map((entretien) => {
            const patientName = entretien.patient 
              ? `${entretien.patient.civilites} ${entretien.patient.nom} ${entretien.patient.prenom}`
              : `Patient #${entretien.patientId}`;
              
            return (
              <div key={entretien.id} className="flex items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                               ${entretien.status === 'finalise' ? 'bg-green-100' : 
                                 entretien.status === 'archive' ? 'bg-gray-100' : 'bg-amber-100'}`}>
                  <span className="text-sm font-medium">
                    {patientName.split(' ').map(part => part[0]).join('').substring(0, 2)}
                  </span>
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{patientName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full 
                                    flex items-center gap-1 ${getStatusColor(entretien.status)}`}>
                      {getStatusIcon(entretien.status)}
                      {entretien.status === 'finalise' ? 'Finalisé' : 
                       entretien.status === 'archive' ? 'Archivé' : 'Brouillon'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-1 justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>{formatDate(entretien.dateModification)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        onClick={() => onViewEntretien && onViewEntretien(entretien.id)}
                      >
                        Consulter
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}