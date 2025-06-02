// src/components/calendar/EventModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Calendar, Clock, Check, User, Tag, FileText, Trash2, Plus, Edit } from 'lucide-react';
import { CalendarEvent } from './Calendar';
import { Patient } from '@/types';

// Ajouter cette interface pour les titres prédéfinis
interface PredefinedTitle {
  id: string;
  title: string;
}

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
  // Modification pour stocker plusieurs types d'événement
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [status, setStatus] = useState('Planifié');
  const [patientId, setPatientId] = useState<number | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isGeneratedEvent = event && typeof event.id === 'string' && event.id.toString().startsWith('entretien-');
const isReadOnly = isGeneratedEvent;
const [hasChanges, setHasChanges] = useState(false);
const [originalData, setOriginalData] = useState<any>(null);
  // États pour les titres prédéfinis
  const [predefinedTitles, setPredefinedTitles] = useState<PredefinedTitle[]>([
    { id: '1', title: 'Visite annuelle' },
    { id: '2', title: 'Suivi régulier' },
    { id: '3', title: 'Vaccination' },
    { id: '4', title: 'Examen médical' },
    { id: '5', title: 'Évaluation médicale' },
    { id: '6', title: 'Consultation' },
  ]);
  const [selectedTitleId, setSelectedTitleId] = useState<string>('');
  const [isCustomTitle, setIsCustomTitle] = useState(true);

  // Effet pour charger les données de l'événement existant ou initialiser un nouvel événement
  useEffect(() => {
    if (event) {
      // Pour un événement existant
      setTitle(event.title);
      setDescription(event.description || '');
      
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      setEndTime(format(end, 'HH:mm'));
      setAllDay(event.allDay);
      
      // Gestion des types d'événement multiples (convertir la chaîne en tableau si nécessaire)
      if (typeof event.eventType === 'string') {
        if (event.eventType.includes(',')) {
          setSelectedEventTypes(event.eventType.split(','));
        } else {
          setSelectedEventTypes([event.eventType]);
        }
      } else if (Array.isArray(event.eventType)) {
        setSelectedEventTypes(event.eventType);
      }
      
      setStatus(event.status);
      setPatientId(event.patientId || null);
      
      // Vérifier si le titre correspond à un titre prédéfini
      const matchedTitle = predefinedTitles.find(pt => pt.title === event.title);
      if (matchedTitle) {
        setSelectedTitleId(matchedTitle.id);
        setIsCustomTitle(false);
      } else {
        setSelectedTitleId('');
        setIsCustomTitle(true);
      }
    } 
    else if (initialDate) {
      // Pour un nouvel événement
      const year = initialDate.getFullYear();
      const month = initialDate.getMonth() + 1; // +1 car getMonth() retourne 0-11
      const day = initialDate.getDate();
      
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Log de diagnostic
      console.log("EventModal - Date formatée:", {
        initialDate: initialDate.toString(),
        year, month, day,
        formattedDate
      });
      
      setTitle('');
      setDescription('');
      setStartDate(formattedDate);
      setEndDate(formattedDate);
      setStartTime('12:00');
      setEndTime('13:00');
      setAllDay(false);
      setSelectedEventTypes(eventTypes.length > 0 ? [eventTypes[0]] : []);
      setStatus('Planifié');
      setPatientId(null);
      setSelectedTitleId('');
      setIsCustomTitle(true);
    }
  }, [event, initialDate, eventTypes, predefinedTitles]);

// Sauvegarder les données originales
useEffect(() => {
  if (event) {
    setOriginalData({
      title: event.title,
      description: event.description || '',
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      startTime: format(new Date(event.startDate), 'HH:mm'),
      endDate: format(new Date(event.endDate), 'yyyy-MM-dd'),
      endTime: format(new Date(event.endDate), 'HH:mm'),
      allDay: event.allDay,
      selectedEventTypes: typeof event.eventType === 'string' 
        ? event.eventType.split(',') 
        : event.eventType,
      status: event.status,
      patientId: event.patientId || null
    });
  }
}, [event]);

// Détecter les changements
useEffect(() => {
  if (!originalData) return;
  
  console.log('Current values:', { title, description });
  console.log('Original values:', { title: originalData.title, description: originalData.description });
  

  const hasChanged = (
    title !== originalData.title ||
    description !== originalData.description ||
    startDate !== originalData.startDate ||
    startTime !== originalData.startTime ||
    endDate !== originalData.endDate ||
    endTime !== originalData.endTime ||
    allDay !== originalData.allDay ||
    status !== originalData.status ||
    patientId !== originalData.patientId ||
    JSON.stringify(selectedEventTypes) !== JSON.stringify(originalData.selectedEventTypes)
  );

  console.log('Has changes:', hasChanged);
  
  setHasChanges(hasChanged);
}, [title, description, startDate, startTime, endDate, endTime, allDay, status, patientId, selectedEventTypes, originalData]);



  // Effet pour mettre à jour le titre lorsqu'un patient est sélectionné
  useEffect(() => {
    if (patientId) {
      const patient = patients.find(p => p.id === patientId);
      if (patient && title) {
        // Ne pas ajouter le nom du patient s'il est déjà présent
        if (!title.includes(`- ${patient.nom} ${patient.prenom}`)) {
          // Si titre prédéfini, conserver ce format mais ajouter le patient
          if (!isCustomTitle && selectedTitleId) {
            const baseTitle = predefinedTitles.find(t => t.id === selectedTitleId)?.title || '';
            setTitle(`${baseTitle} - ${patient.nom} ${patient.prenom}`);
          } 
          // Si titre personnalisé, simplement ajouter le patient
          else if (title.trim() !== '') {
            setTitle(`${title} - ${patient.nom} ${patient.prenom}`);
          }
        }
      }
    }
  }, [patientId, patients, isCustomTitle, selectedTitleId, predefinedTitles, title]);

  // Effet pour charger la liste des patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        const result = await response.json();
        
        if (result.data) {
          setPatients(result.data);
          console.log('Patients chargés:', result.data.length);
        } else {
          console.error('Format de réponse inattendu:', result);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des patients:', error);
      }
    };
    
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  // Gestion du changement de titre prédéfini
  const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    
    if (selectedId === 'custom') {
      setIsCustomTitle(true);
      setSelectedTitleId('');
      // Conserver le titre actuel
    } else {
      const selectedTitle = predefinedTitles.find(t => t.id === selectedId);
      if (selectedTitle) {
        setIsCustomTitle(false);
        setSelectedTitleId(selectedId);
        
        // Si un patient est sélectionné, inclure son nom dans le titre
        if (patientId) {
          const patient = patients.find(p => p.id === patientId);
          if (patient) {
            setTitle(`${selectedTitle.title} - ${patient.nom} ${patient.prenom}`);
          } else {
            setTitle(selectedTitle.title);
          }
        } else {
          setTitle(selectedTitle.title);
        }
      }
    }
  };

  // Gestion de la sélection/désélection des types d'événement
  const toggleEventType = (type: string) => {
    setSelectedEventTypes(prevTypes => {
      if (prevTypes.includes(type)) {
        return prevTypes.filter(t => t !== type);
      } else {
        return [...prevTypes, type];
      }
    });
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate || selectedEventTypes.length === 0 || !status) {
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
      eventType: selectedEventTypes, // Tableau de types d'événement
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
            {/* Titre avec sélection prédéfinie ou personnalisée */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <select
                    value={isCustomTitle ? 'custom' : selectedTitleId}
                    onChange={handleTitleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="custom">Titre personnalisé</option>
                    <optgroup label="Titres prédéfinis">
                      {predefinedTitles.map(pt => (
                        <option key={pt.id} value={pt.id}>{pt.title}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      // Si on modifie manuellement, considérer comme titre personnalisé
                      if (!isCustomTitle) {
                        setIsCustomTitle(true);
                        setSelectedTitleId('');
                      }
                    }}
                    required
                    placeholder={isCustomTitle ? "Entrez un titre" : ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Types d'événement (sélection multiple) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Types d'événement <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 border border-gray-300 rounded-md p-3 min-h-[100px]">
                {eventTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => toggleEventType(type)}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      selectedEventTypes.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </div>
                ))}
                {selectedEventTypes.length === 0 && (
                  <div className="text-gray-400 italic text-sm px-2">
                    Sélectionnez au moins un type d'événement
                  </div>
                )}
              </div>
            </div>

            {/* Statut */}
            <div className="md:col-span-2">
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
                  {statusTypes && statusTypes.length > 0 ? (
                    statusTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Planifié">Planifié</option>
                      <option value="Confirmé">Confirmé</option>
                      <option value="En cours">En cours</option>
                      <option value="Effectué">Effectué</option>
                      <option value="Annulé">Annulé</option>
                      <option value="Reporté">Reporté</option>
                      <option value="Non présenté">Non présenté</option>
                    </>
                  )}
                </select>
                <Check className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

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
                    onClick={() => {
                      setPatientId(null);
                      // Retirer le nom du patient du titre
                      if (selectedPatient && title.includes(`- ${selectedPatient.nom} ${selectedPatient.prenom}`)) {
                        // Nettoyer le titre
                        const cleanTitle = title.replace(`- ${selectedPatient.nom} ${selectedPatient.prenom}`, '').trim();
                        setTitle(cleanTitle);
                      }
                    }}
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
                disabled={isSubmitting || selectedEventTypes.length === 0}
                className={`px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  (isSubmitting || selectedEventTypes.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
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