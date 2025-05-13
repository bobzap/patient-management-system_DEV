// src/components/admin/EventTypeManager/index.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';
import EventTypeEditor from './EventTypeEditor';

interface EventType {
  id: number;
  name: string;
  color: string;
  icon?: string;
  active: boolean;
}

const EventTypeManager: React.FC = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Charger les types d'événements
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/event-types');
        const result = await response.json();
        
        if (result.success) {
          setEventTypes(result.data);
        } else {
          setError(result.error || 'Erreur lors du chargement des types d\'événements');
          toast.error('Erreur lors du chargement des types d\'événements');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des types d\'événements:', error);
        setError('Erreur de connexion au serveur');
        toast.error('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventTypes();
  }, []);

  // Fonction pour créer/mettre à jour un type d'événement
  const handleSaveEventType = async (eventType: Partial<EventType>) => {
    try {
      let response;
      
      if (selectedType) {
        // Mise à jour
        response = await fetch(`/api/event-types/${selectedType.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventType)
        });
      } else {
        // Création
        response = await fetch('/api/event-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventType)
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(selectedType ? 'Type d\'événement mis à jour' : 'Type d\'événement créé');
        
        // Mettre à jour la liste
        if (selectedType) {
          setEventTypes(prev => prev.map(et => et.id === result.data.id ? result.data : et));
        } else {
          setEventTypes(prev => [...prev, result.data]);
        }
        
        setShowEditor(false);
        setSelectedType(null);
      } else {
        toast.error(result.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  // Fonction pour supprimer un type d'événement
  const handleDeleteEventType = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type d\'événement ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/event-types/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Type d\'événement supprimé');
        
        // Mettre à jour la liste
        if (result.message?.includes('désactivé')) {
          // Si le type a été désactivé au lieu d'être supprimé
          setEventTypes(prev => prev.map(et => et.id === id ? { ...et, active: false } : et));
        } else {
          // Si le type a été réellement supprimé
          setEventTypes(prev => prev.filter(et => et.id !== id));
        }
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  // Fonction pour éditer un type d'événement
  const handleEditEventType = (eventType: EventType) => {
    setSelectedType(eventType);
    setShowEditor(true);
  };

  // Fonction pour ajouter un nouveau type d'événement
  const handleAddEventType = () => {
    setSelectedType(null);
    setShowEditor(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gestion des types d'événements</h2>
        <button
          onClick={handleAddEventType}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Ajouter un type
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40 text-red-600">
          <AlertCircle size={24} className="mr-2" />
          {error}
        </div>
      ) : (
        <>
          {showEditor && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <EventTypeEditor
                initialData={selectedType}
                onSave={handleSaveEventType}
                onCancel={() => {
                  setShowEditor(false);
                  setSelectedType(null);
                }}
              />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Couleur</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {eventTypes.length > 0 ? (
                  eventTypes.map((eventType) => (
                    <tr key={eventType.id}>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: eventType.color || '#3b82f6' }}
                          ></div>
                          <span className="font-medium">{eventType.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span 
                            className="px-2 py-1 rounded" 
                            style={{ backgroundColor: eventType.color || '#3b82f6', color: 'white' }}
                          >
                            {eventType.color}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            eventType.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {eventType.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditEventType(eventType)}
                            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEventType(eventType.id)}
                            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                      Aucun type d'événement trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default EventTypeManager;