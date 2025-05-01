// src/components/calendar/MonthView.tsx
'use client';

import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addHours
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent } from './Calendar';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectSlot: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onSelectSlot
}) => {
  // Fonction pour obtenir les jours du mois à afficher
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Commencer par lundi
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    // Noms des jours de la semaine
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    // Générer les cellules pour chaque jour
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const isCurrentMonth = isSameMonth(day, currentDate);
        
        // Filtrer les événements pour ce jour
        const dayEvents = events.filter(event => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          
          // Un événement est affiché pour un jour s'il commence, se termine ou se déroule pendant ce jour
          return isSameDay(day, eventStart) || 
                 isSameDay(day, eventEnd) || 
                 (day >= eventStart && day <= eventEnd);
        });
        
        days.push(
          <div
            key={day.toString()}
            className={`border border-gray-200 min-h-[120px] ${
              !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
            } ${isToday(day) ? 'border-blue-500 border-2' : ''}`}
            onClick={() => {
              // NOUVELLE MÉTHODE: Construire la date directement avec l'année, le mois et le jour
              // Utilisons une date complètement nouvelle avec UTC
              const newDate = new Date(Date.UTC(
                day.getFullYear(),
                day.getMonth(),
                day.getDate(),
                12, 0, 0, 0
              ));
              
              // Convertir ensuite en date locale (pour avoir le bon fuseau horaire)
              const localDate = new Date(newDate.toISOString().slice(0, 10) + "T12:00:00");
              
              console.log("Date sélectionnée INFO:", {
                originalDay: day.toString(),
                year: day.getFullYear(),
                month: day.getMonth(), // 0-11
                day: day.getDate(),
                newDate: localDate.toString(),
                isoDate: localDate.toISOString()
              });
              
              // Passer cette date précise
              onSelectSlot(localDate);
            }}
          >
            <div className="p-2">
              <div className={`text-right ${
                isToday(day) 
                  ? 'text-blue-600 font-bold' 
                  : !isCurrentMonth 
                    ? 'text-gray-400' 
                    : 'text-gray-700'
              }`}>
                {formattedDate}
              </div>
              
              {/* Événements du jour */}
              <div className="mt-1 space-y-1 max-h-[90px] overflow-auto">
                {dayEvents.length > 0 ? (
                  dayEvents.slice(0, 3).map((event, index) => (
                    <div
                      key={event.id || index}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`px-2 py-1 text-xs rounded truncate cursor-pointer
                        ${getEventColorClass(event)}`}
                      title={event.title}
                    >
                      {getStatusIcon(event.status)} {event.title}
                    </div>
                  ))
                ) : null}
                
                {/* Afficher "+X plus" s'il y a plus de 3 événements */}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} plus
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="flex flex-col">
        {/* En-tête des jours de la semaine */}
        <div className="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50">
          {dayNames.map(dayName => (
            <div key={dayName} className="text-gray-500 text-sm font-medium">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Jours du mois */}
        <div className="flex-grow">
          {rows}
        </div>
      </div>
    );
  };

  // Fonction pour déterminer la couleur d'un événement selon son type
  const getEventColorClass = (event: CalendarEvent) => {
    // Couleurs selon le type d'événement
    switch (event.eventType) {
      case 'Entretien Infirmier':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Visite Médicale':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Rappel Médical':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Étude de Poste':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'Entretien Manager':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'Limitation de Travail':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Suivi Post-AT':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Vaccination':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
      case 'Formation':
        return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
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
      {getDaysInMonth()}
    </div>
  );
};

export default MonthView;