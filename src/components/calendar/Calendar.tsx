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

  // 1. Gestion du modal
  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  // 2. Fonctions de sélection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Fonction simplifiée pour la sélection d'un créneau
  const handleSelectSlot = (date: Date) => {
    // Créer une nouvelle instance de Date pour éviter les références partagées
    const newDate = new Date(date);
    
    console.log("Calendar.handleSelectSlot - Date reçue:", {
      rawDate: date.toString(),
      newDate: newDate.toString(),
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1, // +1 car getMonth() retourne 0-11
      day: newDate.getDate(),
      formattedDate: format(newDate, 'yyyy-MM-dd')
    });
    
    setSelectedDate(newDate);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // 3. Fonctions de navigation
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

  // 4. Fonction de gestion des filtres
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

  // 5. Fonctions de gestion des événements
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
        // Création d'un nouvel événement
        response = await fetch('/api/calendar-temp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Réponse brute:', responseText);
      
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
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Événement supprimé');
        handleCloseModal();
        fetchEvents(); // Recharger les événements
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'événement');
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

  // Chargement des événements
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

  // Charger les événements et types lorsque la date ou la vue change
  useEffect(() => {
    fetchEvents();
    
    // Chargement des types d'événements et statuts (données statiques pour l'exemple)
    setEventTypes([
      'Entretien Infirmier',
      'Visite Médicale',
      'Rappel Médical',
      'Étude de Poste',
      'Entretien Manager',
      'Limitation de Travail',
      'Suivi Post-AT',
      'Vaccination',
      'Formation',
      'Autre'
    ]);
    
    setStatusTypes([
      'Planifié',
      'Confirmé',
      'En cours',
      'Effectué',
      'Annulé',
      'Reporté',
      'Non présenté'
    ]);
    
    // Chargement des départements (peut être récupéré depuis l'API)
    setDepartments([
      'Informatique',
      'Ressources humaines',
      'Commercial',
      'Production',
      'Logistique',
      'Direction',
      'Maintenance'
    ]);
  }, [fetchEvents]);

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