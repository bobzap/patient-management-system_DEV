'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Patient } from '@/types';
import { EntretienForm } from '../entretiens/EntretienForm';
import { usePatients } from '@/hooks/usePatients'; // Nouveau import
import { toast } from 'sonner';

interface PatientDetailsProps {
  patient: Patient;
  onEdit: () => void;
  onDelete: () => void;
}

export const PatientDetails = ({ patient, onEdit, onDelete }: PatientDetailsProps) => {
  const router = useRouter(); // Nouveau
  const { deletePatient } = usePatients(); // Nouveau
  const [showEntretien, setShowEntretien] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'historique' | 'documents'>('general');


  const toastStyle = {
    background: '#2DD4BF',
    color: '#1A2E35', // Texte plus foncé pour meilleur contraste
    duration: 3000 // 3 secondes
  };


  // Nouvelle fonction de suppression
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

  if (showEntretien) {
    return <EntretienForm 
      patient={patient} 
      onClose={() => setShowEntretien(false)}
    />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">


{/* En-tête du dossier */}
<div className="bg-white rounded-xl shadow-lg mb-6">
  {/* Section supérieure avec infos et boutons */}
  <div className="p-6 border-b border-gray-100">
    <div className="flex justify-between items-start">
      {/* Info patient */}
      <div className="flex items-center gap-4">
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
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">{`Entré le ${patient.dateEntree}`}</span>
          </div>
        </div>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Entré le</p>
            <p className="text-lg font-semibold text-blue-900">{patient.dateEntree}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Ancienneté</p>
            <p className="text-lg font-semibold text-blue-900">{patient.anciennete}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Dernier entretien</p>
            <p className="text-lg font-semibold text-blue-900">{patient.dateEntretien || 'Aucun'}</p>
          </div>
        </div>

        {/* Bouton Nouvel Entretien */}
        <button
          onClick={() => setShowEntretien(true)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-700 transition-colors duration-200 
                   flex items-center gap-2"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Entretien
        </button>
      </div>

 {/* Boutons d'action */}
 <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg 
                   hover:bg-blue-100 transition-colors duration-200 
                   flex items-center gap-2 font-medium"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Modifier
        </button>

        
  <button
    onClick={handleDelete} // Modification ici
    className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg 
             hover:bg-red-100 transition-colors duration-200 
             flex items-center gap-2 font-medium"
  >
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    Supprimer
  </button>
      </div>
    </div>
  </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <nav className="flex gap-4">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-semibold transition-colors duration-200 ${
              activeTab === 'general' 
                ? 'text-blue-900 border-b-2 border-blue-900' 
                : 'text-gray-500 hover:text-blue-900'
            }`}
          >
            Informations générales
          </button>
          <button 
            onClick={() => setActiveTab('historique')}
            className={`px-4 py-2 font-semibold transition-colors duration-200 ${
              activeTab === 'historique' 
                ? 'text-blue-900 border-b-2 border-blue-900' 
                : 'text-gray-500 hover:text-blue-900'
            }`}
          >
            Historique des entretiens
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-semibold transition-colors duration-200 ${
              activeTab === 'documents' 
                ? 'text-blue-900 border-b-2 border-blue-900' 
                : 'text-gray-500 hover:text-blue-900'
            }`}
          >
            Documents
          </button>
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Informations personnelles
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">État civil</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.etatCivil}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date de naissance</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.dateNaissance}</p>
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Informations professionnelles
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Poste</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.poste}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Manager</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.manager}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Zone</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.zone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Contrat</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.contrat}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Horaire</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.horaire}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Taux d'activité</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.tauxActivite}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale - 1/3 */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dernier entretien */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Dernier entretien</h3>
              {patient.typeEntretien && (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                  {patient.typeEntretien}
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  {patient.dateEntretien || 'Aucun entretien'}
                </p>
              </div>
              {patient.duree && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Durée</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{patient.duree}</p>
                </div>
              )}
              {patient.consentement && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Consentement</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {patient.consentement}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transport - Déplacé ici */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Transport
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Type de transport</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.typeTransport}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Temps de trajet</p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  Aller : {patient.tempsTrajetAller} min / Retour : {patient.tempsTrajetRetour} min
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};