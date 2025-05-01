// src/components/calendar/DayView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  isSameDay,
  isToday,
  addMinutes
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from './Calendar';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (date: Date) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot
}) => {
  // État pour le suivi de l'heure courante
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mettre à jour l'heure courante toutes les minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Heures de la journée (7h à 20h)
  const hours = Array.from({ length: 14 }, (_, i) => i + 7);
  
  // Filtrer les événements de la journée
  const dayEvents = events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    return isSameDay(currentDate, eventStart) || 
          isSameDay(currentDate, eventEnd) || 
          (currentDate >= eventStart && currentDate <= eventEnd);
  });
  
  // Fonction pour positionner un événement dans la grille
  const positionEvent = (event: CalendarEvent) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Calculer la position et la hauteur de l'événement
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
    
    // Limiter aux heures d'affichage (7h-21h)
    const visibleStartHour = Math.max(7, startHour);
    const visibleEndHour = Math.min(21, endHour);
    
    // Calculer la position et la hauteur en pourcentage
    const top = (visibleStartHour - 7) * (60 / 14);
    const height = (visibleEndHour - visibleStartHour) * (60 / 14);
    
    return {
      top: `${top}%`,
      height: `${height}%`,
      maxHeight: `${height}%`
    };
  };
  
  // Fonction pour déterminer la couleur d'un événement selon son type
  const getEventColorClass = (event: CalendarEvent) => {
    // Couleurs selon le type d'événement
    switch (event.eventType) {
      case 'Entretien Infirmier':
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      case 'Visite Médicale':
        return 'bg-green-100 text-green-800 border-l-4 border-green-500';
      case 'Rappel Médical':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      case 'Étude de Poste':
        return 'bg-purple-100 text-purple-800 border-l-4 border-purple-500';
      case 'Entretien Manager':
        return 'bg-indigo-100 text-indigo-800 border-l-4 border-indigo-500';
      case 'Limitation de Travail':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'Suivi Post-AT':
        return 'bg-orange-100 text-orange-800 border-l-4 border-orange-500';
      case 'Vaccination':
        return 'bg-teal-100 text-teal-800 border-l-4 border-teal-500';
      case 'Formation':
        return 'bg-pink-100 text-pink-800 border-l-4 border-pink-500';
      default:
        return 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
    }
  };

  // Fonction pour afficher une icône selon le statut de l'événement
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Planifié':
        return '🕒';
      case 'Confirmé':
        return '✓';
      case 'En cours':
        return '▶️';
      case 'Effectué':
        return '✅';
      case 'Annulé':
        return '❌';
      case 'Reporté':
        return '⏩';
      case 'Non présenté':
        return '❓';
      default:
        return '•';
    }
  };
  
  // Déterminer le statut du jour
  const dayStatus = isToday(currentDate) ? 'text-blue-600 bg-blue-50' : 'text-gray-700';

  return (
    <div className="h-full overflow-auto flex flex-col">
      {/* En-tête avec la date du jour */}
      <div className={`text-center py-3 font-semibold text-lg border-b border-gray-200 ${dayStatus}`}>
        {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
      </div>
      
      {/* Corps de la vue avec les heures et les événements */}
      <div className="flex-grow flex">
        {/* Colonne des heures */}
        <div className="w-16 flex-shrink-0 border-r border-gray-200">
          {hours.map((hour) => (
            <div 
              key={hour} 
              className="h-24 border-b border-gray-200 text-right pr-2 pt-1 text-xs text-gray-500"
            >
              {hour}:00
            </div>
          ))}
        </div>
        
        {/* Colonne des événements */}
        <div className="flex-grow relative">
          {/* Grille des heures */}
          {hours.map((hour) => (
            <div 
              key={hour} 
              className="h-24 border-b border-gray-200"
              onClick={() => {
                // Créer un événement à cette heure précise
                const newDate = new Date(currentDate);
                newDate.setHours(hour, 0, 0, 0);
                onSelectSlot(newDate);
              }}
            >
              {/* Sous-divisions 30 minutes */}
              <div 
                className="h-1/2 border-b border-dashed border-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  // Créer un événement à cette demi-heure
                  const selectedDay = new Date(day);
                  console.log('Jour sélectionné brut:', day);
                  console.log('Jour sélectionné Date:', selectedDay);
                  
                  // Définir sur midi du jour sélectionné
                  selectedDay.setHours(12, 0, 0, 0);
                  console.log('Jour formaté pour événement:', selectedDay);
                  
                  onSelectSlot(selectedDay);
                }}
              ></div>
            </div>
          ))}
          
          {/* Indicateur d'heure courante */}
          {isToday(currentDate) && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
              style={{
                top: `${((currentTime.getHours() - 7) * 60 + currentTime.getMinutes()) * (100 / (14 * 60))}%`
              }}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 -mt-1.5 -ml-1.5"></div>
            </div>
          )}
          
          {/* Événements */}
          {dayEvents.map((event, index) => {
            const position = positionEvent(event);
            
            return (
              <div
                key={`${event.id}-${index}`}
                className={`absolute left-2 right-2 rounded-md p-2 shadow-sm overflow-hidden cursor-pointer
                           ${getEventColorClass(event)}`}
                style={{
                  top: position.top,
                  height: position.height,
                  maxHeight: position.maxHeight,
                  zIndex: 5
                }}
                onClick={() => onSelectEvent(event)}
              >
                <div className="font-semibold">
                  {getStatusIcon(event.status)} {event.title}
                </div>
                
                {position.height > 10 && (
                  <div className="text-sm mt-1">
                    {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                  </div>
                )}
                
                {position.height > 15 && event.patient && (
                  <div className="text-sm mt-1">
                    {event.patient.civilites} {event.patient.nom} {event.patient.prenom}
                  </div>
                )}
                
                {position.height > 25 && event.description && (
                  <div className="text-sm mt-1 opacity-80 line-clamp-3">
                    {event.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Section informations supplémentaires (optionnelle) */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 overflow-auto">
          <h3 className="font-semibold text-gray-700 mb-3">Agenda du jour</h3>
          
          {dayEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun événement programmé</p>
          ) : (
            <div className="space-y-3">
              {dayEvents
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((event) => (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-md cursor-pointer hover:brightness-95 transition-all
                              ${getEventColorClass(event).replace('border-l-4', '')}`}
                    onClick={() => onSelectEvent(event)}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{event.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-white bg-opacity-50 rounded-full">
                        {event.status}
                      </span>
                    </div>
                    
                    <div className="text-sm mt-1">
                      {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                    </div>
                    
                    {event.patient && (
                      <div className="text-sm mt-1 flex items-center">
                        <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2">
                          {event.patient.prenom[0]}{event.patient.nom[0]}
                        </div>
                        <span>
                          {event.patient.civilites} {event.patient.nom} {event.patient.prenom}
                        </span>
                      </div>
                    )}
                    
                    {event.description && (
                      <div className="text-sm mt-2 bg-white bg-opacity-50 p-2 rounded line-clamp-2">
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;