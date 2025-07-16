// src/app/page.tsx - Version corrigée avec navigation Dashboard
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Patient } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { PatientList } from '@/components/patients/PatientList';
import { PatientDetails } from '@/components/patients/PatientDetails';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { CalendarPage } from '@/components/calendar/CalendarPage';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import AdminPage from '@/app/admin/page';
import { toast } from 'sonner';
import { Logo } from '@/components/ui/Logo';

type NavigationTab = 'dashboard' | 'patients' | 'newDossier' | 'admin' | 'userManagement' | 'calendar';

export default function HomePage() {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    canViewPatients,
    canAccessAdmin 
  } = useAuth();

  // États
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [confirmNavigation, setConfirmNavigation] = useState<{
    isOpen: boolean;
    targetTab: NavigationTab;
    message: string;
  }>({
    isOpen: false,
    targetTab: 'dashboard',
    message: ''
  });
  
  // Refs pour éviter les re-renders infinis
  const patientsLoadedRef = useRef(false);
  const fetchPatientsRef = useRef<() => Promise<void>>();

  // Fonction fetchPatients mémorisée
  const fetchPatients = useCallback(async () => {
    if (!canViewPatients() || patientsLoadedRef.current) {
      return;
    }
    
    setIsPatientsLoading(true);
    try {
      console.log('🔄 Chargement des patients...');
      const response = await fetch('/api/patients');
      const result = await response.json();
      setPatients(result.data || []);
      patientsLoadedRef.current = true;
      console.log('✅ Patients chargés:', result.data?.length || 0);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des patients:', error);
      toast.error('Impossible de charger les patients');
    } finally {
      setIsPatientsLoading(false);
    }
  }, [canViewPatients]);

  // Stocker la référence pour les autres fonctions
  fetchPatientsRef.current = fetchPatients;

  // Charger les patients seulement une fois quand l'auth est OK
  useEffect(() => {
    if (isAuthenticated && !isLoading && canViewPatients() && !patientsLoadedRef.current) {
      console.log('🚀 Initialisation - Chargement des patients');
      fetchPatients();
    }
  }, [isAuthenticated, isLoading, canViewPatients, fetchPatients]);

  // Reset du flag quand l'utilisateur change
  useEffect(() => {
    if (!isAuthenticated) {
      patientsLoadedRef.current = false;
      setPatients([]);
    }
  }, [isAuthenticated]);

  const handleTabChange = useCallback((newTab: NavigationTab) => {
    // Vérifier les permissions avant de changer d'onglet
    if (newTab === 'userManagement' && !canAccessAdmin()) {
      toast.error('Accès non autorisé à la gestion des utilisateurs');
      return;
    }
    
    if ((newTab === 'patients' || newTab === 'newDossier') && !canViewPatients()) {
      toast.error('Accès non autorisé aux dossiers patients');
      return;
    }

    if (selectedPatient) {
      setConfirmNavigation({
        isOpen: true,
        targetTab: newTab,
        message: 'Voulez-vous vraiment quitter la vue détaillée ?'
      });
    } else {
      setActiveTab(newTab);
    }
  }, [selectedPatient, canAccessAdmin, canViewPatients]);

  const handleConfirmNavigation = useCallback(() => {
    setSelectedPatient(null);
    setActiveTab(confirmNavigation.targetTab);
    setConfirmNavigation({ isOpen: false, targetTab: 'dashboard', message: '' });
  }, [confirmNavigation.targetTab]);

  const handleCancelNavigation = useCallback(() => {
    setConfirmNavigation({ isOpen: false, targetTab: 'dashboard', message: '' });
  }, []);
  
  const handlePatientSubmit = useCallback(async (patientData: Omit<Patient, 'id'>) => {
    if (!canViewPatients()) {
      toast.error('Permission insuffisante');
      return;
    }

    try {
      console.log('📝 Création d\'un nouveau patient...');
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
      
      // Mettre à jour la liste sans refetch
      setPatients(prev => [result.data, ...prev]);
      setActiveTab('patients');
      
      toast.success('Dossier patient créé avec succès');
      console.log('✅ Patient créé:', result.data.id);
      
    } catch (error) {
      console.error('❌ Erreur création patient:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du dossier');
    }
  }, [canViewPatients]);

  const handlePatientSelect = useCallback((patient: Patient) => {
    console.log('👤 Sélection du patient:', patient.id);
    setSelectedPatient(patient);
  }, []);

  // ✨ Nouvelle fonction pour gérer le retour depuis PatientDetails
  const handleBackToPatients = useCallback(() => {
    console.log('🔙 Retour à la liste des patients');
    setSelectedPatient(null);
    setActiveTab('patients');
  }, []);

  // Fonction pour forcer le rechargement des patients
  const refreshPatients = useCallback(async () => {
    console.log('🔄 Rechargement forcé des patients...');
    patientsLoadedRef.current = false;
    if (fetchPatientsRef.current) {
      await fetchPatientsRef.current();
    }
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
    <div className="flex h-screen bg-transparent">
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
                // Optionnel: rafraîchir la liste après suppression
                refreshPatients();
              }}
              onBack={handleBackToPatients}
            />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                patients={{ data: patients }} 
                onNavigate={handleTabChange} // ⭐ AJOUT DE LA NAVIGATION
              />
            )}
            
            {activeTab === 'patients' && canViewPatients() && (
              <PatientList
                patients={patients}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSelectPatient={handlePatientSelect}
                onNewDossier={() => handleTabChange('newDossier')}
                isLoading={isPatientsLoading}
              />
            )}
            
            {activeTab === 'newDossier' && canViewPatients() && (
              <PatientForm
                onSubmit={handlePatientSubmit}
                onCancel={() => handleTabChange('patients')}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPage />
            )}

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
      
      {/* Dialog de confirmation pour la navigation */}
      <ConfirmDialog
        isOpen={confirmNavigation.isOpen}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        title="Confirmer la navigation"
        message={confirmNavigation.message}
        confirmText="Continuer"
        cancelText="Annuler"
        variant="warning"
      />
    </div>
  );
}