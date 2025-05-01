// src/components/calendar/EventModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { format, addHours, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Calendar, Clock, Check, User, Tag, FileText, Trash2 } from 'lucide-react';
import { CalendarEvent } from './Calendar';
import { Patient } from '@/types';

interface EventModalProps {
  event: CalendarEvent | null;
  initialDate: Date | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete: (eventId: number) => void;
  onUpdateStatus: (eventId: number, status: string) => void;
  eventTypes: string[];
  statusTypes: string[];
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  initialDate,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onUpdateStatus,
  eventTypes,
  statusTypes
}) => {
  // États
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [eventType, setEventType] = useState('');
  const [status, setStatus] = useState('Planifié');
  const [patientId, setPatientId] = useState<number | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Effet pour charger les données de l'événement si en mode édition
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      setEndTime(format(end, 'HH:mm'));
      setAllDay(event.allDay);
      setEventType(event.eventType);
      setStatus(event.status);
      setPatientId(event.patientId || null);
    } else if (initialDate) {
      // Initialiser avec la date sélectionnée
      setStartDate(format(initialDate, 'yyyy-MM-dd'));
      setStartTime(format(initialDate, 'HH:mm'));
      
      // Définir l'heure de fin à +1 heure par défaut
      const endTime = addHours(initialDate, 1);
      setEndDate(format(endTime, 'yyyy-MM-dd'));
      setEndTime(format(endTime, 'HH:mm'));
      
      // Valeurs par défaut
      setStatus('Planifié');
      setEventType(eventTypes.length > 0 ? eventTypes[0] : '');
    }
  }, [event, initialDate, eventTypes]);

  // Effet pour charger la liste des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        const data = await response.json();
        
        if (data.success) {
          setPatients(data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des patients:', error);
      }
    };
    
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate || !eventType || !status) {
      // Validation simple
      return;
    }
    
    setIsSubmitting(true);
    
    // Construire l'objet événement
    const eventData: Partial<CalendarEvent> = {
      title,
      description,
      startDate: `${startDate}T${startTime}:00`,
      endDate: `${endDate}T${endTime}:00`,
      allDay,
      eventType,
      status,
      patientId: patientId || undefined
    };
    
    // Si c'est une mise à jour, inclure l'ID
    if (event) {
      eventData.id = event.id;
    }
    
    onSave(eventData);
  };

  // Patients filtrés pour la recherche
  const filteredPatients = searchTerm
    ? patients.filter(
        (patient) =>
          patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : patients;

  // Patient sélectionné
  const selectedPatient = patientId
    ? patients.find((patient) => patient.id === patientId)
    : null;

  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* En-tête du modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {event ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Corps du modal */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type d'événement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'événement <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                >
                  <option value="">Sélectionner un type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Tag className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                >
                  <option value="">Sélectionner un statut</option>
                  {statusTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Check className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            // src/components/calendar/EventModal.tsx (suite)

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Heure de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de début <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  disabled={allDay}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                    allDay ? 'bg-gray-100 text-gray-500' : ''
                  }`}
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Heure de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure de fin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  disabled={allDay}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                    allDay ? 'bg-gray-100 text-gray-500' : ''
                  }`}
                />
                <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Toute la journée */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allDay"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
                Toute la journée
              </label>
            </div>

            {/* Sélection patient */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient associé (optionnel)
              </label>
              
              {selectedPatient ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {selectedPatient.prenom[0]}{selectedPatient.nom[0]}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{selectedPatient.civilites} {selectedPatient.nom} {selectedPatient.prenom}</div>
                      <div className="text-sm text-gray-500">{selectedPatient.departement}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPatientId(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un patient..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowPatientSearch(true);
                    }}
                    onFocus={() => setShowPatientSearch(true)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  
                  {/* Liste des patients pour la recherche */}
                  {showPatientSearch && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg border border-gray-200">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                              setPatientId(patient.id);
                              setSearchTerm('');
                              setShowPatientSearch(false);
                            }}
                          >
                            <div className="font-medium">{patient.civilites} {patient.nom} {patient.prenom}</div>
                            <div className="text-sm text-gray-500">{patient.departement}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Aucun patient trouvé
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
                <FileText className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex justify-between">
            <div className="flex space-x-2">
              {/* Actions supplémentaires pour un événement existant */}
              {event && (
                <>
                  {/* Bouton pour changer le statut rapidement si l'événement existe déjà */}
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          onUpdateStatus(event.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Changer le statut...</option>
                      {statusTypes.map((st) => (
                        <option key={st} value={st} disabled={st === status}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Bouton de suppression */}
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-3 py-2 bg-red-50 border border-red-300 rounded-md text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 size={16} className="mr-1" />
                    <span>Supprimer</span>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Enregistrement...' : event ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50" onClick={() => setShowDeleteConfirm(false)}></div>
            <div className="bg-white p-6 rounded-lg shadow-xl z-10 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (event) {
                      onDelete(event.id);
                    }
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;