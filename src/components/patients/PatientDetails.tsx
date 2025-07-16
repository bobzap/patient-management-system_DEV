// src/components/patients/PatientDetails.tsx - Version glassmorphisme moderne
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Patient } from '@/types';
import { EntretienForm } from '../entretiens/EntretienForm';
import { usePatients } from '@/hooks/usePatients';
import { toast } from 'sonner';
import { safeParseResponse } from '@/utils/json';
import { PatientForm } from './PatientForm';
import { EntretienList } from '../entretiens/EntretienList';
import { useEffect } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
  ArrowLeft, Plus, Edit, Trash2, User, Calendar, Clock, 
  Activity, Heart, Scale, FileText, MapPin, Car, 
  Briefcase, Shield, Users, ArrowRight, ExternalLink,
  TrendingUp, AlertCircle
} from 'lucide-react';

interface PatientDetailsProps {
  patient: Patient;
  onEdit: () => void;
  onDelete: () => void;
}

// Définir une interface pour les données biométriques
interface BiometricData {
  tension: string;
  poids: string;
  entretienNumero: number;
  tensionEntretienNumero?: number;
  poidsEntretienNumero?: number;
}

interface Entretien {
  id: number;
  numeroEntretien: number;
  dateCreation: string;
  status: string;
  donneesEntretien: string;
}

interface SectionTitleProps {
  title: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
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
  const [entretiens, setEntretiens] = useState<Entretien[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entretiensLoaded, setEntretiensLoaded] = useState(false);
  const [lastBiometricData, setLastBiometricData] = useState<BiometricData>({
    tension: '',
    poids: '',
    entretienNumero: 0,
    tensionEntretienNumero: 0,
    poidsEntretienNumero: 0
  });

  // Fonction pour traiter les suppressions d'entretiens
  const handleEntretienDelete = () => {
    setRefreshEntretiens(prev => prev + 1);
    toast.success('Entretien supprimé avec succès');
  };

  // Fonction pour chercher des données biométriques dans tous les entretiens
  const findLastBiometricData = (entretiensList: Entretien[]): BiometricData => {
    if (!entretiensList || entretiensList.length === 0) {
      return {
        tension: '',
        poids: '',
        entretienNumero: 0,
        tensionEntretienNumero: 0,
        poidsEntretienNumero: 0
      };
    }

    let latestTension = '';
    let latestPoids = '';
    let tensionEntretienNumero = 0;
    let poidsEntretienNumero = 0;

    for (const entretien of entretiensList) {
      try {
        const donneesEntretien = JSON.parse(entretien.donneesEntretien);
        
        if (donneesEntretien?.examenClinique?.biometrie) {
          const biometrie = donneesEntretien.examenClinique.biometrie;
          
          if (!latestTension && biometrie.tension) {
            latestTension = biometrie.tension;
            tensionEntretienNumero = entretien.numeroEntretien;
          }
          
          if (!latestPoids && biometrie.poids) {
            latestPoids = biometrie.poids;
            poidsEntretienNumero = entretien.numeroEntretien;
          }
          
          if (latestTension && latestPoids) break;
        }
      } catch (e) {
        console.error('Erreur lors du parsing des données de l\'entretien:', e);
      }
    }

    return {
      tension: latestTension,
      poids: latestPoids,
      entretienNumero: 0,
      tensionEntretienNumero: tensionEntretienNumero || 0,
      poidsEntretienNumero: poidsEntretienNumero || 0
    };
  };

  // Effet pour charger les entretiens et extraire les données biométriques
  useEffect(() => {
    const fetchEntretiens = async () => {
      if (!patient?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/patients/${patient.id}/entretiens`);
        
        // Vérifier si c'est une redirection d'authentification
        if (response.status === 404 || response.url.includes('/auth/')) {
          console.warn(`Session expirée lors du chargement des entretiens pour patient ${patient.id}`);
          toast.error('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        
        const parseResult = await safeParseResponse(response);
        
        if (!parseResult.success) {
          console.error(`Erreur parsing entretiens patient ${patient.id}:`, parseResult.error);
          toast.error('Erreur lors du chargement des entretiens.');
          return;
        }
        
        const result = parseResult.data;
        
        if (result.success && result.data) {
          console.log('Entretiens chargés:', result.data);
          setEntretiens(result.data);
          
          const entretienDetailsPromises = result.data.map(async (entretien: Entretien) => {
            try {
              const entretienResponse = await fetch(`/api/entretiens/${entretien.id}`);
              
              // Vérifier si c'est une redirection d'authentification
              if (entretienResponse.status === 404 || entretienResponse.url.includes('/auth/')) {
                console.warn(`Session expirée lors du chargement de l'entretien ${entretien.id}`);
                return null;
              }
              
              const entretienParseResult = await safeParseResponse(entretienResponse);
              
              if (!entretienParseResult.success) {
                console.error(`Erreur parsing entretien ${entretien.id}:`, entretienParseResult.error);
                return null;
              }
              
              return entretienParseResult.data;
            } catch (error) {
              console.error(`Erreur fetch entretien ${entretien.id}:`, error);
              return null;
            }
          });
          
          const entretienDetails = await Promise.all(entretienDetailsPromises);
          const validEntretienDetails = entretienDetails
            .filter(details => details && details.success && details.data)
            .map(details => details.data);
          
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

  // État pour la confirmation de suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fonction de suppression de patient
  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
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
    setShowDeleteDialog(false);
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

  const SectionTitle = ({ title, badge = null, children = null }: SectionTitleProps) => (
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl">
        <User className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex items-center space-x-2">
        <h3 className="text-xl font-light text-slate-900">{title}</h3>
        {badge && badge}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* En-tête ultra-moderne */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/25 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl">
            
            {/* Barre de navigation supérieure */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => {
                  const patientsButton = document.querySelector('.patients-link');
                  if (patientsButton) {
                    (patientsButton as HTMLElement).click();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="group flex items-center space-x-3 px-6 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl hover:bg-white/40 transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                <span className="text-slate-700 group-hover:text-slate-900 font-medium transition-colors">Retour à la liste</span>
              </button>
              
              <button
                onClick={() => {
                  setSelectedEntretienId(null);
                  setIsReadOnly(false);
                  setShowEntretien(true);
                }}
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Nouvel Entretien</span>
              </button>
            </div>

            {/* Informations patient principales */}
            <div className="flex items-start space-x-6">
              {/* Avatar moderne */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-2xl font-light text-slate-800">
                    {`${patient.prenom[0]}${patient.nom[0]}`}
                  </span>
                </div>
              </div>

              {/* Informations principales */}
              <div className="flex-1">
                <h1 className="text-3xl font-light text-slate-900 tracking-tight mb-2">
                  {`${patient.civilites} ${patient.nom} ${patient.prenom}`}
                </h1>
                
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">{patient.age} ans</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm text-blue-700 rounded-xl text-sm font-medium border border-blue-200/50">
                      {patient.departement}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">{patient.poste}</span>
                  </div>
                </div>

                {/* Métriques rapides */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Entré le</p>
                    <p className="text-sm font-medium text-slate-900">{patient.dateEntree}</p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Ancienneté</p>
                    <p className="text-sm font-medium text-slate-900">{patient.anciennete}</p>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Dernier entretien</p>
                    <p className="text-sm font-medium text-slate-900">
                      {entretiens.length > 0 && entretiens[0].dateCreation
                        ? new Date(entretiens[0].dateCreation).toLocaleDateString('fr-FR')
                        : 'Aucun'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="group p-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                  title="Modifier le dossier"
                >
                  <Edit className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </button>
                
                <button
                  onClick={handleDelete}
                  className="group p-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl hover:bg-white/40 transition-all duration-300 hover:-translate-y-1 shadow-lg"
                  title="Supprimer le dossier"
                >
                  <Trash2 className="h-5 w-5 text-slate-600 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets moderne */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl p-2 shadow-xl">
            <nav className="flex space-x-2">
              {[
                { key: 'general', label: 'Informations générales', icon: User },
                { key: 'historique', label: 'Historique des entretiens', icon: Activity, badge: entretiens.length },
                { key: 'documents', label: 'Documents', icon: FileText }
              ].map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`relative flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                  {badge && badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === key
                        ? 'bg-white/30 text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'historique' && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-xl">
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
          </div>
        )}

        {/* Contenu principal - onglet général */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Informations personnelles */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 backdrop-blur-sm p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-light text-slate-900">Informations personnelles</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">État civil</p>
                        <p className="text-lg font-light text-slate-900">{patient.etatCivil}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Date de naissance</p>
                        <p className="text-lg font-light text-slate-900">{patient.dateNaissance}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-sm p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/20 backdrop-blur-sm rounded-xl">
                        <Briefcase className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-light text-slate-900">Informations professionnelles</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Poste</p>
                        <p className="text-lg font-light text-slate-900">{patient.poste}</p>
                      </div>
                      
                      {patient.poste === 'Opérateur SB' && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-500">N° de ligne</p>
                          <p className="text-lg font-light text-slate-900">
                            {patient.numeroLigne ? patient.numeroLigne : "Non spécifié"}
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Manager</p>
                        <p className="text-lg font-light text-slate-900">{patient.manager}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Zone</p>
                        <p className="text-lg font-light text-slate-900">{patient.zone}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Contrat</p>
                        <p className="text-lg font-light text-slate-900">{patient.contrat}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Horaire</p>
                        <p className="text-lg font-light text-slate-900">{patient.horaire}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Taux d'activité</p>
                        <p className="text-lg font-light text-slate-900">{patient.tauxActivite}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne latérale */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* Dernier entretien */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-600/10 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 backdrop-blur-sm p-6 border-b border-white/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 backdrop-blur-sm rounded-xl">
                          <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-light text-slate-900">Dernier entretien</h3>
                        {entretiens?.length > 0 && entretiens[0]?.numeroEntretien && (
                          <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm text-purple-700 rounded-xl text-sm font-medium border border-purple-200/50">
                            N°{entretiens[0].numeroEntretien}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {isLoading ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Date et statut */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Date</p>
                            <p className="text-base font-medium text-slate-900">
                              {entretiens?.length > 0 && entretiens[0]?.dateCreation
                                ? new Date(entretiens[0].dateCreation).toLocaleDateString('fr-FR')
                                : 'Aucun entretien'}
                            </p>
                          </div>
                          
                          {entretiens?.length > 0 && entretiens[0]?.status && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-slate-500">Statut</p>
                              <span className={`inline-flex px-3 py-1 rounded-xl text-sm font-medium backdrop-blur-sm border ${
                                entretiens[0].status === 'finalise' 
                                  ? 'bg-emerald-500/20 text-emerald-700 border-emerald-200/50' : 
                                entretiens[0].status === 'archive' 
                                  ? 'bg-slate-500/20 text-slate-700 border-slate-200/50' : 
                                  'bg-amber-500/20 text-amber-700 border-amber-200/50'
                              }`}>
                                {entretiens[0].status === 'finalise' ? 'Finalisé' : 
                                 entretiens[0].status === 'archive' ? 'Archivé' : 'Brouillon'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Constantes médicales */}
                        {(lastBiometricData.tension || lastBiometricData.poids) && (
                          <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-500">Constantes médicales</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {lastBiometricData.tension && (
                                <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                                  <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-red-500/20 backdrop-blur-sm rounded-xl">
                                      <Heart className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-slate-700">Tension</p>
                                      <div className="flex items-baseline space-x-2">
                                        <p className="text-base font-medium text-slate-900">
                                          {lastBiometricData.tension}
                                        </p>
                                        <span className="text-xs text-slate-500">mmHg</span>
                                      </div>
                                      {lastBiometricData.tensionEntretienNumero && lastBiometricData.tensionEntretienNumero > 0 && (
                                        <span className="text-xs text-slate-400">
                                          (n°{lastBiometricData.tensionEntretienNumero})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {lastBiometricData.poids && (
                                <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4">
                                  <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl">
                                      <Scale className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-slate-700">Poids</p>
                                      <div className="flex items-baseline space-x-2">
                                        <p className="text-base font-medium text-slate-900">
                                          {lastBiometricData.poids}
                                        </p>
                                        <span className="text-xs text-slate-500">kg</span>
                                      </div>
                                      {lastBiometricData.poidsEntretienNumero && lastBiometricData.poidsEntretienNumero > 0 && (
                                        <span className="text-xs text-slate-400">
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
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500">Type</p>
                            <p className="text-base font-medium text-slate-900">{patient.typeEntretien}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton pour voir tous les entretiens */}
                  {entretiens.length > 0 && (
                    <div className="border-t border-white/20 p-4">
                      <button 
                        onClick={() => setActiveTab('historique')}
                        className="group w-full flex items-center justify-center space-x-2 py-3 text-sm font-medium text-purple-600 hover:text-purple-800 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-300"
                      >
                        <span>Voir tous les entretiens</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transport */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 backdrop-blur-sm p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-500/20 backdrop-blur-sm rounded-xl">
                        <Car className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-light text-slate-900">Transport</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Type de transport</p>
                        <p className="text-lg font-light text-slate-900">{patient.typeTransport}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-500">Temps de trajet</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl p-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <div>
                                <p className="text-xs text-slate-500">Aller</p>
                                <p className="text-sm font-medium text-slate-900">{patient.tempsTrajetAller} min</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl p-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <div>
                                <p className="text-xs text-slate-500">Retour</p>
                                <p className="text-sm font-medium text-slate-900">{patient.tempsTrajetRetour} min</p>
                              </div>
                            </div>
                          </div>
                          {patient.tempsTrajetTotal && (
                            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-200/50 rounded-xl p-3">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <div>
                                  <p className="text-xs text-blue-600">Total</p>
                                  <p className="text-sm font-semibold text-blue-900">
                                    {patient.tempsTrajetTotal} min
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    ({Math.floor(parseInt(patient.tempsTrajetTotal) / 60)}h{parseInt(patient.tempsTrajetTotal) % 60 > 0 ? ` ${parseInt(patient.tempsTrajetTotal) % 60}min` : ''})
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Onglet documents */}
        {activeTab === 'documents' && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-600/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-slate-500/20 to-gray-600/20 backdrop-blur-sm p-6 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-500/20 backdrop-blur-sm rounded-xl">
                    <FileText className="h-5 w-5 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-light text-slate-900">Documents</h3>
                </div>
              </div>
              <div className="p-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-100/50 backdrop-blur-sm rounded-2xl mb-4">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                  </div>
                  <p className="text-slate-500 font-medium">Aucun document disponible</p>
                  <p className="text-sm text-slate-400 mt-2">Les documents seront affichés ici une fois ajoutés</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer ultra-moderne */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-purple-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            
            <div className="relative bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-8">
                
                {/* Section synchronisation */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-sm font-medium text-slate-700">Dernière synchronisation</p>
                    <p className="text-xs text-slate-600">
                      {new Date().toLocaleDateString('fr-FR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                {/* Section sécurité */}
                <div className="flex items-center space-x-4">
                  <a 
                    href="https://www.ssllabs.com/ssltest/analyze.html?d=app.vital-sync.ch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 hover:border-green-500/40 transition-all duration-300 hover:scale-105"
                  >
                    <div className="relative">
                      <Shield className="h-4 w-4 text-green-600 group-hover:text-green-500 transition-colors" />
                      <div className="absolute inset-0 bg-green-400/20 rounded-full blur-sm group-hover:bg-green-400/40 transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-800 transition-colors">
                      Audit SSL/TLS
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-600 transition-colors" />
                  </a>
                </div>

                {/* Séparateur */}
                <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                {/* Section développeur */}
                <div className="text-center lg:text-right space-y-1">
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Développé par{' '}
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                        Amarres®
                      </span>
                    </p>
                    <div className="flex items-center">
                      <img 
                        src="/logo-amarre.png" 
                        alt="Logo Amarre" 
                        className="w-9 h-9 object-contain transition-transform duration-300 hover:scale-150"
                      />
                    </div>
                  </div>
                  <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-lite">
                    Software Development
                  </p>
                </div>
              </div>

              {/* Ligne décorative */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog de confirmation pour la suppression */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le dossier de ${patient.civilites} ${patient.nom} ${patient.prenom} ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
};