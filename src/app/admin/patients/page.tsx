// app/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Patient } from '@/types';
import { PatientList } from '@/components/patients/PatientList';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Liste des Dossiers Patients</h1>
      <PatientList patients={patients} />
    </div>
  );
}