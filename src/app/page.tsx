'use client';

import { useState, useCallback, useEffect } from 'react';
import { Patient } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ListManager } from '@/components/admin/ListManager';
import { toast } from '@/components/ui/use-toast';

// Types étendu pour inclure l'admin
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
  }, []);

  const handleTabChange = useCallback((newTab: NavigationTab) => {
    if (selectedPatient && newTab !== 'admin') {
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
      console.log('Données envoyées:', JSON.stringify(patientData, null, 2));
      
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });
  
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

  const renderContent = () => {
    if (selectedPatient) {
      return (
        <div className="relative">
          <PatientDetails patient={selectedPatient} />
          <button
            onClick={() => setSelectedPatient(null)}
            className="absolute top-6 right-6 px-4 py-2 bg-gray-100 text-gray-600 
                     rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            ← Retour à la liste
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard patients={{ data: patients }} />;
      case 'patients':
        return (
          <PatientList
            patients={patients}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectPatient={handlePatientSelect}
            onNewDossier={() => handleTabChange('newDossier')}
          />
        );
      case 'newDossier':
        return (
          <PatientForm
            onSubmit={handlePatientSubmit}
            onCancel={() => handleTabChange('patients')}
          />
        );
      case 'admin':
        return <ListManager />;
      default:
        return <Dashboard patients={{ data: patients }} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}