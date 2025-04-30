// src/components/patients/PatientDetails.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Patient } from '@/types';
import { EntretienForm } from '../entretiens/EntretienForm';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';
import { PatientForm } from './PatientForm';
import { EntretienList } from '../entretiens/EntretienList';
import { useEffect } from 'react';

interface PatientDetailsProps {
  patient: Patient;
  onEdit: () => void;
  onDelete: () => void;
}

export const PatientDetails = ({ patient, onEdit, onDelete }: PatientDetailsProps) => {
  const router = useRouter();
  const { deletePatient, updatePatient } = usePatients();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showEntretien, setShowEntretien] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'historique' | 'documents'>('general');
  const [selectedEntretienId, setSelectedEntretienId] = useState<number | null>(null);
  const [refreshEntretiens, setRefreshEntretiens] = useState(0);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [entretiens, setEntretiens] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Nouvel état pour le chargement
  const [entretiensLoaded, setEntretiensLoaded] = useState(false);
  const [lastBiometricData, setLastBiometricData] = useState({
    tension: '',
    poids: '',
    entretienNumero: 0 // Ajout du numéro d'entretien pour la traçabilité
  });

  // Fonction pour traiter les suppressions d'entretiens
  const handleEntretienDelete = () => {
    setRefreshEntretiens(prev => prev + 1);
    toast.success('Entretien supprimé avec succès');
  };

  // Fonction pour chercher des données biométriques dans tous les entretiens
  const findLastBiometricData = (entretiensList) => {
    // Si pas d'entretiens, retourner des valeurs vides
    if (!entretiensList || entretiensList.length === 0) {
      return { tension: '', poids: '', entretienNumero: 0 };
    }

    // Variables pour stocker les dernières données trouvées
    let latestTension = '';
    let latestPoids = '';
    let tensionEntretienNumero = 0;
    let poidsEntretienNumero = 0;

    // Parcourir tous les entretiens du plus récent au plus ancien
    for (const entretien of entretiensList) {
      try {
        const donneesEntretien = JSON.parse(entretien.donneesEntretien);
        
        if (donneesEntretien?.examenClinique?.biometrie) {
          const biometrie = donneesEntretien.examenClinique.biometrie;
          
          // Si tension n'est pas encore trouvée et que cet entretien en a une
          if (!latestTension && biometrie.tension) {
            latestTension = biometrie.tension;
            tensionEntretienNumero = entretien.numeroEntretien;
          }
          
          // Si poids n'est pas encore trouvé et que cet entretien en a un
          if (!latestPoids && biometrie.poids) {
            latestPoids = biometrie.poids;
            poidsEntretienNumero = entretien.numeroEntretien;
          }
          
          // Si on a trouvé les deux, on peut arrêter la recherche
          if (latestTension && latestPoids) break;
        }
      } catch (e) {
        console.error('Erreur lors du parsing des données de l\'entretien:', e);
      }
    }

    // Retourner les données trouvées avec les numéros d'entretiens
    return {
      tension: latestTension,
      poids: latestPoids,
      tensionEntretienNumero,
      poidsEntretienNumero
    };
  };

  // Effet pour charger les entretiens et extraire les données biométriques
  useEffect(() => {
    const fetchEntretiens = async () => {
      if (!patient?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/patients/${patient.id}/entretiens`);
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('Entretiens chargés:', result.data);
          setEntretiens(result.data);
          
          // Chercher le dernier entretien avec des données biométriques
          const entretienDetailsPromises = result.data.map(async (entretien) => {
            const entretienResponse = await fetch(`/api/entretiens/${entretien.id}`);
            return entretienResponse.json();
          });
          
          const entretienDetails = await Promise.all(entretienDetailsPromises);
          const validEntretienDetails = entretienDetails
            .filter(details => details.success && details.data)
            .map(details => details.data);
          
          // Chercher les dernières données biométriques parmi tous les entretiens
          const latestBiometricData = findLastBiometricData(validEntretienDetails);
          setLastBiometricData(latestBiometricData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des entretiens:', error);
      } finally {
        setIsLoading(false);
        setEntretiensLoaded(true);
      }
    };

    // Déclencher la requête à chaque changement de refreshEntretiens
    setEntretiensLoaded(false);
    fetchEntretiens();
  }, [patient?.id, refreshEntretiens]);

  // Fonction de sélection d'entretien
  const handleEntretienSelect = (entretienId: number, readOnly: boolean) => {
    setSelectedEntretienId(entretienId);
    setIsReadOnly(readOnly);
    setShowEntretien(true);
  };

  const toastStyle = {
    background: '#2DD4BF',
    color: '#1A2E35',
    duration: 3000
  };

  // Fonction de suppression de patient
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      try {
        const success = await deletePatient(patient.id!);
        if (success) {
          toast.success(`Le dossier de ${patient.civilites} ${patient.nom} ${patient.prenom} a été supprimé`, {
            ...toastStyle
          });
          window.location.href = '/';
          setTimeout(() => {
            document.querySelector<HTMLElement>('.patients-link')?.click();
          }, 100);
        }
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  // Fonction de fermeture d'entretien
  const handleCloseEntretien = () => {
    setShowEntretien(false);
    setSelectedEntretienId(null);
    setRefreshEntretiens(prev => prev + 1);
  };

  // Fonction de mise à jour de patient
  const handleEdit = async (updatedPatient: Patient) => {
    try {
      const success = await updatePatient(patient.id!, updatedPatient);
      if (success) {
        toast.success(`Le dossier de ${patient.civilites} ${patient.nom} ${patient.prenom} a été mis à jour`, {
          ...toastStyle
        });
        setTimeout(() => {
          setShowEditForm(false);
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (showEditForm) {
    return <PatientForm 
      patient={patient} 
      onSubmit={handleEdit}
      onCancel={() => setShowEditForm(false)}
    />;
  }

  if (showEntretien) {
    return <EntretienForm 
      patient={patient}
      entretienId={selectedEntretienId}
      isReadOnly={isReadOnly}
      onClose={handleCloseEntretien}
    />;
  }


  const SectionTitle = ({ title, badge = null, children = null }) => (
    <div className="border-l-4 border-blue-500 pl-3 py-1 mb-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
        {badge && badge}
      </div>
      {children}
    </div>
  );

  // src/components/patients/PatientDetails.tsx - Return complet
return (
  <div className="p-6 max-w-7xl mx-auto">
    {/* En-tête du dossier avec navigation */}
    <div className="bg-white rounded-xl shadow-lg mb-6">
      <div className="p-6">
        {/* Barre supérieure avec navigation et actions principales */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-900">
                {`${patient.prenom[0]}${patient.nom[0]}`}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                {`${patient.civilites} ${patient.nom} ${patient.prenom}`}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-600">{patient.age} ans</span>
                <span className="text-gray-300">•</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {patient.departement}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions regroupées */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const patientsButton = document.querySelector('.patients-link');
                if (patientsButton) {
                  (patientsButton as HTMLElement).click();
                } else {
                  window.location.href = '/';
                }
              }}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Retour à la liste
            </button>
            
            <button
              onClick={() => {
                setSelectedEntretienId(null);
                setIsReadOnly(false);
                setShowEntretien(true);
              }}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouvel Entretien
            </button>
          </div>
        </div>
        
        {/* Infos synthétiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Entré le</p>
            <p className="text-sm font-semibold text-gray-900">{patient.dateEntree}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Ancienneté</p>
            <p className="text-sm font-semibold text-gray-900">{patient.anciennete}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Dernier entretien</p>
            <p className="text-sm font-semibold text-gray-900">
              {entretiens.length > 0 && entretiens[0].dateCreation
                ? new Date(entretiens[0].dateCreation).toLocaleDateString('fr-FR')
                : 'Aucun'}
            </p>
          </div>
        </div>
        
        {/* Actions secondaires */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowEditForm(true)}
            className="px-3 py-1.5 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Modifier
          </button>
          
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 text-sm"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>

    {/* Navigation des onglets */}
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <nav className="flex gap-4">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium transition-colors duration-200 ${
            activeTab === 'general' 
              ? 'text-blue-900 border-b-2 border-blue-900' 
              : 'text-gray-500 hover:text-blue-900'
          }`}
        >
          Informations générales
        </button>
        <button 
          onClick={() => setActiveTab('historique')}
          className={`px-4 py-2 font-medium transition-colors duration-200 flex items-center gap-2 ${
            activeTab === 'historique' 
              ? 'text-blue-900 border-b-2 border-blue-900' 
              : 'text-gray-500 hover:text-blue-900'
          }`}
        >
          Historique des entretiens
          {entretiens.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {entretiens.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-medium transition-colors duration-200 ${
            activeTab === 'documents' 
              ? 'text-blue-900 border-b-2 border-blue-900' 
              : 'text-gray-500 hover:text-blue-900'
          }`}
        >
          Documents
        </button>
      </nav>
    </div>

    {/* Contenu selon l'onglet actif */}
    {activeTab === 'historique' && (
      <div className="mb-6">
        <EntretienList
          patientId={patient.id!}
          refreshTrigger={refreshEntretiens}
          onEntretienSelect={handleEntretienSelect}
          onNewEntretien={() => {
            setSelectedEntretienId(null);
            setIsReadOnly(false);
            setShowEntretien(true);
          }}
          onDelete={handleEntretienDelete}
        />
      </div>
    )}

    {/* Contenu principal - uniquement pour l'onglet général */}
    {activeTab === 'general' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900">Informations personnelles</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">État civil</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.etatCivil}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de naissance</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.dateNaissance}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900">Informations professionnelles</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Poste</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.poste}</p>
                </div>
                
                {/* Afficher le numéro de ligne seulement si le poste est Opérateur SB et que le numéro existe */}
                {patient.poste === 'Opérateur SB' && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">N° de ligne</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {patient.numeroLigne ? patient.numeroLigne : "Non spécifié"}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Manager</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.manager}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Zone</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.zone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Contrat</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.contrat}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Horaire</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.horaire}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Taux d'activité</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.tauxActivite}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale - 1/3 */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dernier entretien */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-blue-900">Dernier entretien</h3>
                  {entretiens?.length > 0 && entretiens[0]?.numeroEntretien && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                      N°{entretiens[0].numeroEntretien}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {/* Date et statut sur la même ligne */}
                  <div className="py-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-base font-semibold text-gray-900">
                        {entretiens?.length > 0 && entretiens[0]?.dateCreation
                          ? new Date(entretiens[0].dateCreation).toLocaleDateString('fr-FR')
                          : 'Aucun entretien'}
                      </p>
                    </div>
                    
                    {entretiens?.length > 0 && entretiens[0]?.status && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Statut</p>
                        <div>
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium ${
                            entretiens[0].status === 'finalise' ? 'bg-green-100 text-green-800' : 
                            entretiens[0].status === 'archive' ? 'bg-gray-100 text-gray-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entretiens[0].status === 'finalise' ? 'Finalisé' : 
                             entretiens[0].status === 'archive' ? 'Archivé' : 'Brouillon'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Constantes médicales avec icônes */}
                  {(lastBiometricData.tension || lastBiometricData.poids) && (
                    <div className="py-3">
                      <p className="text-sm font-medium text-gray-500 mb-2">Constantes médicales</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {lastBiometricData.tension && (
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Tension</p>
                              <div className="flex items-baseline">
                                <p className="text-base font-semibold text-gray-900">
                                  {lastBiometricData.tension} <span className="text-sm font-normal">mmHg</span>
                                </p>
                                {lastBiometricData.tensionEntretienNumero > 0 && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (n°{lastBiometricData.tensionEntretienNumero})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {lastBiometricData.poids && (
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Poids</p>
                              <div className="flex items-baseline">
                                <p className="text-base font-semibold text-gray-900">
                                  {lastBiometricData.poids} <span className="text-sm font-normal">kg</span>
                                </p>
                                {lastBiometricData.poidsEntretienNumero > 0 && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (n°{lastBiometricData.poidsEntretienNumero})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Type d'entretien */}
                  {patient.typeEntretien && (
                    <div className="py-3">
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {patient.typeEntretien}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Bouton pour voir tous les entretiens */}
            {entretiens.length > 0 && (
              <div className="border-t border-gray-100 py-3 px-4">
                <button 
                  onClick={() => setActiveTab('historique')}
                  className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
                >
                  Voir tous les entretiens
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Transport */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900">Transport</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type de transport</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.typeTransport}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Temps de trajet</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    Aller : {patient.tempsTrajetAller} min / Retour : {patient.tempsTrajetRetour} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Onglet documents */}
    {activeTab === 'documents' && (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
          <h3 className="text-lg font-semibold text-blue-900">Documents</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-10">Aucun document disponible</p>
        </div>
      </div>
    )}
  </div>
);
};