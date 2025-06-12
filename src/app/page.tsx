'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Patient } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { CalendarPage } from '@/components/calendar/CalendarPage';
import AdminPage from '@/app/admin/page'; // Votre système d'administration existant
import { toast } from 'sonner';
import { Toaster } from 'sonner';

// Types mis à jour
type NavigationTab = 'dashboard' | 'patients' | 'newDossier' | 'admin' | 'userManagement' | 'calendar';

export default function HomePage() {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    requireAuth,
    canViewPatients,
    canAccessAdmin 
  } = useAuth();

  // États
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);

  // Vérifier l'authentification
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      return;
    }
  }, [isAuthenticated, isLoading]);

  // Charger les patients si autorisé
  useEffect(() => {
    if (isAuthenticated && canViewPatients() && patients.length === 0) {
      fetchPatients();
    }
  }, [isAuthenticated, canViewPatients]);

  const fetchPatients = async () => {
    if (!canViewPatients()) return;
    
    setIsPatientsLoading(true);
    try {
      const response = await fetch('/api/patients');
      const result = await response.json();
      setPatients(result.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      toast.error('Impossible de charger les patients');
    } finally {
      setIsPatientsLoading(false);
    }
  };

  const handleTabChange = useCallback((newTab: NavigationTab) => {
    // Vérifier les permissions avant de changer d'onglet
    if ((newTab === 'admin' || newTab === 'userManagement') && !canAccessAdmin()) {
      toast.error('Accès non autorisé à l\'administration');
      return;
    }
    
    if ((newTab === 'patients' || newTab === 'newDossier') && !canViewPatients()) {
      toast.error('Accès non autorisé aux dossiers patients');
      return;
    }

    if (selectedPatient) {
      if (window.confirm('Voulez-vous vraiment quitter la vue détaillée ?')) {
        setSelectedPatient(null);
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  }, [selectedPatient, canAccessAdmin, canViewPatients]);

  const handlePatientSubmit = useCallback(async (patientData: Omit<Patient, 'id'>) => {
    if (!canViewPatients()) {
      toast.error('Permission insuffisante');
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const result = await response.json();
      setPatients(prev => [...prev, result.data]);
      setActiveTab('patients');
      
      toast.success('Dossier patient créé avec succès');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du dossier');
    }
  }, [canViewPatients]);

  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
  }, []);

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, ne rien afficher (middleware gère la redirection)
  if (!isAuthenticated) {
    return null;
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
              onDelete={() => {
                console.log('Delete patient:', selectedPatient);
                setSelectedPatient(null);
              }}
            />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard patients={{ data: patients }} />
            )}
            
            {activeTab === 'patients' && canViewPatients() && (
              <PatientList
                patients={patients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSelectPatient={handlePatientSelect}
                onNewDossier={() => handleTabChange('newDossier')}
              />
            )}
            
            {activeTab === 'newDossier' && canViewPatients() && (
              <PatientForm
                onSubmit={handlePatientSubmit}
                onCancel={() => handleTabChange('patients')}
              />
            )}

            {/* VOTRE SYSTÈME D'ADMINISTRATION EXISTANT */}
            {activeTab === 'admin' && canAccessAdmin() && (
              <AdminPage />
            )}

            {/* MON NOUVEAU SYSTÈME DE GESTION UTILISATEURS */}
            {activeTab === 'userManagement' && canAccessAdmin() && (
              <div className="p-6">
                <UserManagement />
              </div>
            )}
            
            {activeTab === 'calendar' && (
              <CalendarPage />
            )}

            {/* Messages si accès refusé */}
            {((activeTab === 'patients' || activeTab === 'newDossier') && !canViewPatients()) && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚫</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h2>
                  <p className="text-gray-600">Vous n'avez pas les permissions pour accéder aux dossiers patients.</p>
                </div>
              </div>
            )}

            {((activeTab === 'admin' || activeTab === 'userManagement') && !canAccessAdmin()) && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Administration</h2>
                  <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette section.</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}