// src/components/calendar/WeekView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMinutes,
  parseISO,
  addHours
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from './Calendar';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
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
  
  // Obtenir les jours de la semaine
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Commencer par lundi
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Heures de la journée (8h à 19h)
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  
  // Fonction pour positionner un événement dans la grille
  const positionEvent = (event: CalendarEvent, day: Date) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Vérifier si l'événement est pour ce jour
    if (!isSameDay(eventStart, day) && !isSameDay(eventEnd, day)) {
      return null;
    }
    
    // Calculer la position et la hauteur de l'événement
    const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
    const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
    
    // Limiter aux heures d'affichage (8h-20h)
    const visibleStartHour = Math.max(8, startHour);
    const visibleEndHour = Math.min(20, endHour);
    
    // Calculer la position et la hauteur en pourcentage
    const top = (visibleStartHour - 8) * (60 / 12);
    const height = (visibleEndHour - visibleStartHour) * (60 / 12);
    
    return {
      top: `${top}%`,
      height: `${height}%`,
      maxHeight: `${height}%`,
      event
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
     // src/components/calendar/WeekView.tsx (suite)
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

  return (
    <div className="h-full overflow-auto">
      <div className="flex flex-col h-full">
        {/* En-tête des jours de la semaine */}
        <div className="grid grid-cols-8 text-center py-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          {/* Cellule vide pour l'en-tête des heures */}
          <div className="text-gray-500 text-sm font-medium border-r border-gray-200">
            Heures
          </div>
          
          {/* Jours de la semaine */}
          {days.map((day) => (
            <div 
              key={day.toString()} 
              className={`text-sm font-medium p-2 ${
                isToday(day) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div>{format(day, 'EEEE', { locale: fr })}</div>
              <div className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : ''}`}>
                {format(day, 'd', { locale: fr })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Corps de la grille - heures et événements */}
        <div className="flex-grow grid grid-cols-8 relative">
          {/* Colonne des heures */}
          <div className="border-r border-gray-200">
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="h-20 border-b border-gray-200 text-right pr-2 pt-1 text-xs text-gray-500"
              >
                {hour}:00
              </div>
            ))}
          </div>
          
          {/* Colonnes des jours avec événements */}
          {days.map((day) => {
            // Filtrer les événements de ce jour
            const dayEvents = events
              .filter(event => {
                const eventStart = new Date(event.startDate);
                const eventEnd = new Date(event.endDate);
                
                return isSameDay(day, eventStart) || 
                      isSameDay(day, eventEnd) || 
                      (day >= eventStart && day <= eventEnd);
              })
              .map(event => positionEvent(event, day))
              .filter(Boolean);
            
            return (
              <div 
                key={day.toString()} 
                className={`relative border-r ${isToday(day) ? 'bg-blue-50/30' : ''}`}
              >
                {/* Grille des heures - lignes horizontales */}
                {hours.map((hour) => (
                  <div 
                    key={hour} 
                    className="h-20 border-b border-gray-200"
                    onClick={() => {
                      // IMPORTANT: Ajouter un avertissement si le jour n'est pas dans le mois actuel
                      if (!isCurrentMonth) {
                        console.log("Jour hors du mois courant:", day);
                        // Si vous souhaitez désactiver les clics sur les jours hors du mois actuel:
                        // return;
                      }
                      
                      // Créer une nouvelle Date avec l'année, le mois et le jour précis
                      const y = day.getFullYear();
                      const m = day.getMonth(); // 0-11, pas besoin d'ajuster
                      const d = day.getDate();
                      
                      // Créer une nouvelle date à midi
                      const exactDate = new Date(y, m, d, 12, 0, 0);
                      
                      console.log("Date sélectionnée:", {
                        year: y,
                        month: m,
                        day: d,
                        date: exactDate.toISOString()
                      });
                      
                      // Passer l'objet Date
                      onSelectSlot(exactDate);
                    }
                  
                  }
                  >
                    {/* Sous-divisions 30 minutes */}
                    <div 
                      className="h-1/2 border-b border-dashed border-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Créer un événement à cette demi-heure
                        const newDate = new Date(day);
                        newDate.setHours(hour, 30, 0, 0);
                        onSelectSlot(newDate);
                      }}
                    ></div>
                  </div>
                ))}
                
                {/* Indicateur d'heure courante */}
                {isToday(day) && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                    style={{
                      top: `${((currentTime.getHours() - 8) * 60 + currentTime.getMinutes()) * (100 / (12 * 60))}%`
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -mt-1 -ml-1"></div>
                  </div>
                )}
                
                {/* Événements */}
                {dayEvents.map((eventData: any, index) => (
                  <div
                    key={`${eventData.event.id}-${index}`}
                    className={`absolute left-1 right-1 rounded p-1 shadow-sm overflow-hidden text-xs cursor-pointer ${getEventColorClass(eventData.event)}`}
                    style={{
                      top: eventData.top,
                      height: eventData.height,
                      maxHeight: eventData.maxHeight,
                      zIndex: 5
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(eventData.event);
                    }}
                    title={eventData.event.title}
                  >
                    <div className="font-semibold truncate">
                      {getStatusIcon(eventData.event.status)} {eventData.event.title}
                    </div>
                    {eventData.event.patient && eventData.height > 15 && (
                      <div className="truncate text-xs opacity-80 mt-1">
                        {eventData.event.patient.civilites} {eventData.event.patient.nom} {eventData.event.patient.prenom}
                      </div>
                    )}
                    {eventData.height > 25 && (
                      <div className="truncate text-xs opacity-70 mt-1">
                        {format(new Date(eventData.event.startDate), 'HH:mm')} - {format(new Date(eventData.event.endDate), 'HH:mm')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;