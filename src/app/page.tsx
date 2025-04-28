'use client';

import { useState, useCallback, useEffect } from 'react';
import { Patient } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { toast } from '@/components/ui/use-toast';
import AdminPage from '@/app/admin/page';

// Types
type NavigationTab = 'dashboard' | 'patients' | 'newDossier' | 'admin';

export default function HomePage() {
  // États
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger les patients au montage du composant
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        const result = await response.json();
        // Mise à jour pour utiliser result.data qui contient le tableau de patients
        setPatients(result.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des patients:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les patients",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPatients();
  
    // Ajout des écouteurs d'événements pour la navigation
    const handleNavigateTo = (e: CustomEvent) => {
      const { tab } = e.detail;
      setActiveTab(tab as NavigationTab);
    };
    
    const handleViewPatient = (e: CustomEvent) => {
      const { patient } = e.detail;
      setSelectedPatient(patient);
    };
    
    window.addEventListener('navigateTo', handleNavigateTo as EventListener);
    window.addEventListener('viewPatient', handleViewPatient as EventListener);
    
    // Nettoyage des écouteurs d'événements à la destruction du composant
    return () => {
      window.removeEventListener('navigateTo', handleNavigateTo as EventListener);
      window.removeEventListener('viewPatient', handleViewPatient as EventListener);
    };
  }, []);

  const handleTabChange = useCallback((newTab: NavigationTab) => {
    if (selectedPatient) {
      if (window.confirm('Voulez-vous vraiment quitter la vue détaillée ?')) {
        setSelectedPatient(null);
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  }, [selectedPatient]);

  const handlePatientSubmit = useCallback(async (patientData: Omit<Patient, 'id'>) => {
    try {
      // Log détaillé des données envoyées
      console.log('Données envoyées:', JSON.stringify(patientData, null, 2));
      
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
  
      // Log du statut de la réponse
      console.log('Statut de la réponse:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${responseText}`);
      }
  
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Réponse invalide: ${responseText}`);
      }

      // Mise à jour pour utiliser result.data qui contient le nouveau patient
      setPatients(prev => [...prev, result.data]);
      setActiveTab('patients');
      
      toast({
        title: "Succès",
        description: "Le dossier patient a été créé avec succès",
      });
      
    } catch (error) {
      console.error('Erreur complète:', {
        message: error.message,
        stack: error.stack
      });
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du dossier",
        variant: "destructive",
      });
    }
  }, []);

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <main className="flex-1 overflow-auto">
        {selectedPatient ? (
          <div className="relative">
            <PatientDetails 
              patient={selectedPatient} 
              onEdit={() => console.log('Edit patient:', selectedPatient)} 
              onDelete={() => console.log('Delete patient:', selectedPatient)} 
            />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard patients={{ data: patients }} />
            )}
            
            {activeTab === 'patients' && (
              <PatientList
                patients={patients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSelectPatient={handlePatientSelect}
                onNewDossier={() => handleTabChange('newDossier')}
              />
            )}
            
            {activeTab === 'newDossier' && (
              <PatientForm
                onSubmit={handlePatientSubmit}
                onCancel={() => handleTabChange('patients')}
              />
            )}

            {/* Nouvelle condition */}
{activeTab === 'admin' && (
  <AdminPage />
)}
          </>
        )}
      </main>
    </div>
  );
}