'use client';

import { useState } from 'react';
import { PatientList } from '@/components/patients/PatientList';
import { PatientForm } from '@/components/patients/PatientForm';
import { PatientDetails } from '@/components/patients/PatientDetails';

export default function EntretiensPage() {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulation de données pour le moment
  const patients = []; // À remplacer par vos vraies données

  const handleNewDossier = () => {
    setView('form');
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setView('details');
  };

  return (
    <div>
      {view === 'list' && (
        <PatientList
          patients={patients}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectPatient={handleSelectPatient}
          onNewDossier={handleNewDossier}
        />
      )}

      {view === 'form' && (
        <PatientForm
          onSubmit={(data) => {
            console.log('Nouveau patient:', data);
            setView('list');
          }}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'details' && selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
        />
      )}
    </div>
  );
}