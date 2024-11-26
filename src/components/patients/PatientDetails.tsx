// src/components/patients/PatientDetails.tsx
'use client';

import { useState } from 'react';
import { Patient } from '@/types';
import { EntretienForm } from '../entretiens/EntretienForm';  // Correction du chemin d'importation

export const PatientDetails = ({ patient }: { patient: Patient }) => {
  const [showEntretien, setShowEntretien] = useState(false);

  console.log('showEntretien:', showEntretien); // Pour debug

  const handleNewEntretien = () => {
    console.log('Bouton cliqué'); // Pour debug
    setShowEntretien(true);
  };

  if (showEntretien) {
    console.log('Affichage EntretienForm'); // Pour debug
    return <EntretienForm 
      patient={patient} 
      onClose={() => setShowEntretien(false)}
    />;
  }
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête du dossier */}
      <div className="bg-white rounded-xl shadow-lg mb-6 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-bold text-blue-900">
              {`${patient.prenom[0]}${patient.nom[0]}`}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              {`${patient.civilite} ${patient.nom} ${patient.prenom}`}
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-gray-600">
                {patient.age} ans
              </span>
              <span className="text-gray-300">•</span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                {patient.departement}
              </span>
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

      {/* Contenu du dossier */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <nav className="flex gap-4">
          <button className="px-4 py-2 text-blue-900 font-semibold border-b-2 border-blue-900">
            Informations générales
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-blue-900 font-medium">
            Historique des entretiens
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-blue-900 font-medium">
            Documents
          </button>
        </nav>
      </div>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
                <p className="text-base font-semibold text-gray-900 mt-1">{patient.tauxActivite}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
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
        </div>
      </div>
    </div>
  );
};