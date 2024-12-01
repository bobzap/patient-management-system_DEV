// src/hooks/usePatients.ts

import { useState } from 'react';
import { Patient } from '@/types';

export const usePatients = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPatient = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (id: number, patientData: Partial<Patient>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de suppression');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getPatient,
    updatePatient,
    deletePatient,
  };
};