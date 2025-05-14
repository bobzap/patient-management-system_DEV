// app/patients/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Patient } from '@/types';
import { PatientList } from '@/components/patients/PatientList';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch('/api/patients');
        const data = await response.json();
        setPatients(data.data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    console.log('Patient sélectionné:', patient);
    // Implémentez votre logique ici
  };

  const handleNewDossier = () => {
    console.log('Nouveau dossier');
    // Implémentez votre logique ici
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Liste des Dossiers employés</h1>
      <PatientList 
        patients={patients}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectPatient={handleSelectPatient}
        onNewDossier={handleNewDossier}
      />
    </div>
  );
}