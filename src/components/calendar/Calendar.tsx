// src/components/calendar/Calendar.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { EventModal } from './EventModal';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addWeeks, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';


// Définition des types
export type CalendarEvent = {
  id: number;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  allDay: boolean;
  eventType: string;
  status: string;
  patientId?: number;
  entretienId?: number;
  metadata?: string;
  patient?: {
    id: number;
    civilites: string;
    nom: string;
    prenom: string;
    departement: string;
  };
};

type CalendarViewType = 'month' | 'week' | 'day';

const Calendar: React.FC = () => {
  // États
  const [view, setView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [statusTypes, setStatusTypes] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [filterEventType, setFilterEventType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');

  // Fonction pour sélectionner un événement
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Charger les types d'événements et statuts
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('/api/lists');
        const data = await response.json();
        
        if (data.success) {
          // Récupérer les types d'événements
          const eventTypesList = data.data.find((list: any) => list.listId === 'eventTypes');
          if (eventTypesList && eventTypesList.items) {
            setEventTypes(eventTypesList.items.map((item: any) => item.value));
          }
          
          // Récupérer les statuts d'événements
          const statusList = data.data.find((list: any) => list.listId === 'eventStatus');
          if (statusList && statusList.items) {
            setStatusTypes(statusList.items.map((item: any) => item.value));
          }
          
          // Récupérer les départements pour les filtres
          const dptList = data.data.find((list: any) => list.listId === 'dpt');
          if (dptList && dptList.items) {
            setDepartments(dptList.items.map((item: any) => item.value));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error);
        toast.error('Erreur lors du chargement des options');
      }
    };
    
    fetchLists();
  }, []);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Déterminer la plage de dates à récupérer en fonction de la vue actuelle
      let startDateStr, endDateStr;
      
      if (view === 'month') {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        startDateStr = format(start, 'yyyy-MM-dd');
        endDateStr = format(end, 'yyyy-MM-dd');
      } else if (view === 'week') {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lundi
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        startDateStr = format(start, 'yyyy-MM-dd');
        endDateStr = format(end, 'yyyy-MM-dd');
      } else { // day view
        startDateStr = format(currentDate, 'yyyy-MM-dd');
        endDateStr = format(currentDate, 'yyyy-MM-dd');
      }
      
      // Tableau pour stocker tous les événements
      let allEvents = [];
      
      // 1. Récupérer les événements manuels du calendrier
      try {
        // Construire l'URL avec les filtres
        let url = `/api/calendar?startDate=${startDateStr}&endDate=${endDateStr}`;
        
        if (filterEventType) {
          url += `&eventType=${encodeURIComponent(filterEventType)}`;
        }
        
        if (filterStatus) {
          url += `&status=${encodeURIComponent(filterStatus)}`;
        }
        
        console.log('Fetching calendar events:', url);
        const calendarResponse = await fetch(url);
        
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          
          if (calendarData.success) {
            // Convertir les dates string en objets Date
            const calendarEvents = calendarData.data.map((event: any) => ({
              ...event,
              startDate: new Date(event.startDate),
              endDate: new Date(event.endDate),
              source: 'calendar' // Marquer comme événement manuel
            }));
            
            console.log(`${calendarEvents.length} événements calendrier récupérés`);
            allEvents = [...calendarEvents];
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des événements calendrier:', error);
        // On continue pour récupérer les autres sources d'événements
      }
      
      // 2. Récupérer les dates des entretiens
      try {
        console.log('Fetching entretien dates');
        const entretienResponse = await fetch('/api/entretiens/dates');
        
        if (entretienResponse.ok) {
          const entretienData = await entretienResponse.json();
          
          if (entretienData.success) {
            const entretienEvents = entretienData.data;
            console.log(`${entretienEvents.length} dates d'entretiens récupérées`);
            allEvents = [...allEvents, ...entretienEvents];
          } else {
            console.warn('Problème lors de la récupération des dates d\'entretien:', entretienData.error);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des dates d\'entretien:', error);
        // On continue avec les événements déjà récupérés
      }
      
      // 3. Récupérer également les événements temporaires
      try {
        console.log('Fetching temporary events');
        const tempResponse = await fetch('/api/calendar-temp');
        
        if (tempResponse.ok) {
          const tempData = await tempResponse.json();
          
          if (tempData.success && Array.isArray(tempData.data)) {
            const tempEvents = tempData.data.map((event: any) => ({
              ...event,
              startDate: new Date(event.startDate),
              endDate: new Date(event.endDate),
              source: 'temp'
            }));
            
            console.log(`${tempEvents.length} événements temporaires récupérés`);
            allEvents = [...allEvents, ...tempEvents];
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des événements temporaires:', error);
      }
      
      // Filtrer par département si nécessaire
      const filteredEvents = filterDepartment
        ? allEvents.filter((event: any) =>
            event.patient && event.patient.departement === filterDepartment)
        : allEvents;
      
      console.log(`${filteredEvents.length} événements à afficher au total`);
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, view, filterEventType, filterStatus, filterDepartment]);



  function createLocalDate(year: number, month: number, day: number, hour = 12, minute = 0) {
    // Crée une date locale sans décalage de fuseau horaire
    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1); // Les mois sont indexés à partir de 0
    date.setDate(day);
    date.setHours(hour, minute, 0, 0);
    return date;
  }
  
  // Puis utilisez-la lors de la sélection d'une date
  const handleDayClick = (day: Date) => {
    const localDate = createLocalDate(
      day.getFullYear(),
      day.getMonth() + 1,
      day.getDate(),
      12, // Midi par défaut
      0
    );
    onSelectSlot(localDate);
  };
  
  // Charger les événements lorsque la date ou la vue change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navigation dans le calendrier
  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(prevDate => addMonths(prevDate, -1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => addWeeks(prevDate, -1));
    } else {
      setCurrentDate(prevDate => addDays(prevDate, -1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(prevDate => addMonths(prevDate, 1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => addWeeks(prevDate, 1));
    } else {
      setCurrentDate(prevDate => addDays(prevDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Gestion des événements
  const handleSelectSlot = (date: Date) => {
    console.log('handleSelectSlot reçoit:', date);
    
    // Passer directement la date sans manipulation
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  // Dans Calendar.tsx, modifier la fonction handleSaveEvent

const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
  try {
    let response;
    
    if (selectedEvent) {
      // Mise à jour d'un événement existant
      response = await fetch(`/api/calendar/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
    } else {
      // Création d'un nouvel événement - utiliser l'API temporaire
      response = await fetch('/api/calendar-temp', {  // Modifier ici pour utiliser l'API temporaire
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
    }
    
    // S'assurer que la réponse est valide avant de tenter de la parser
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }
    
    // Lire le texte de la réponse pour débogage
    const responseText = await response.text();
    console.log('Réponse brute:', responseText);
    
    // Parser la réponse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Impossible de parser la réponse: ${responseText}`);
    }
    
    if (data.success) {
      toast.success(selectedEvent ? 'Événement mis à jour' : 'Événement créé');
      handleCloseModal();
      fetchEvents(); // Recharger les événements
    } else {
      toast.error(data.error || 'Erreur lors de l\'enregistrement');
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    toast.error(`Erreur: ${error.message}`);
  }
};
  const handleDeleteEvent = async (eventId: number) => {
    try {
      const tempResponse = await fetch('/api/calendar-temp');
      
      if (tempResponse.ok) {
        const tempData = await tempResponse.json();
        
        if (tempData.success && Array.isArray(tempData.data)) {
          const tempEvents = tempData.data.map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            source: 'temp'
          }));
          
          console.log(`${tempEvents.length} événements temporaires récupérés`);
          allEvents = [...allEvents, ...tempEvents];
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements temporaires:', error);
    }
  };

  const handleUpdateStatus = async (eventId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Statut changé en: ${newStatus}`);
        fetchEvents(); // Recharger les événements
      } else {
        toast.error(data.error || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  // Gérer les changements de filtres
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'eventType':
        setFilterEventType(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'department':
        setFilterDepartment(value);
        break;
      default:
        break;
    }
  };

  // Déterminer le titre du calendrier en fonction de la vue
  const getCalendarTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: fr });
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'dd')} - ${format(end, 'dd MMMM yyyy', { locale: fr })}`;
    } else {
      return format(currentDate, 'EEEE dd MMMM yyyy', { locale: fr });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* En-tête du calendrier */}
      <CalendarHeader
        title={getCalendarTitle()}
        view={view}
        onViewChange={setView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        eventTypes={eventTypes}
        statusTypes={statusTypes}
        departments={departments}
        filterEventType={filterEventType}
        filterStatus={filterStatus}
        filterDepartment={filterDepartment}
        onFilterChange={handleFilterChange}
      />
      
      {/* Corps du calendrier - vue appropriée */}
      <div className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={events}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
              />
            )}
            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
              />
            )}
            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                events={events}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
              />
            )}
          </>
        )}
      </div>
      
      {/* Modal pour créer/éditer un événement */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          initialDate={selectedDate}
          isOpen={showEventModal}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onUpdateStatus={handleUpdateStatus}
          eventTypes={eventTypes}
          statusTypes={statusTypes}
        />
      )}
    </div>
  );
};

export default Calendar;

// Composant wrapper pour la page du calendrier
export const CalendarPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Calendrier</h1>
          <p className="text-gray-600">Planifiez et gérez vos rendez-vous et rappels</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-4 h-[calc(100vh-140px)]">
          <Calendar />
        </div>
      </div>
    </div>
  );
};