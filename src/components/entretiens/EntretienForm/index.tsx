// src/components/entretiens/EntretienForm/index.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { ResizableBox } from 'react-resizable';
import { Patient } from '@/types';
import { SanteTravail } from '@/components/entretiens/sections/SanteAuTravail';
import { VecuTravailData } from '@/components/entretiens//sections/SanteAuTravail/VecuTravail';
import { ModeVieData } from '@/components/entretiens/sections/SanteAuTravail/ModeVie';

interface EntretienData {
  numeroEntretien: number;
  status: string;
  santeTravail: {
    vecuTravail: VecuTravailData;
    modeVie: ModeVieData;
  };
  examenClinique: any;
  imaa: any;
  conclusion: any;
}

// Données initiales
const initialVecuTravailData: VecuTravailData = {
  motifVisite: { motif: '', commentaires: '' },
  postesOccupes: '',
  posteDeTravail: {
    descriptionTaches: '',
    risquesProfessionnels: '',
    installationMateriel: ''
  },
  ressentiTravail: {
    relationCollegues: 5,
    relationHierarchie: 5,
    stress: 5,
    satisfaction: 5,
    commentaires: ''
  },
  plaintesTravail: {
    existence: false,
    commentaires: ''
  }
};

const initialModeVieData: ModeVieData = {
  loisirs: {
    activitePhysique: false,
    frequence: '',
    commentaires: ''
  },
  addictions: {
    tabac: { consommation: false, quantiteJour: '', depuis: '' },
    medicaments: { consommation: false, depuis: '', quantiteInfDix: false, frequence: '' },
    alcool: { consommation: false, quantiteSupDix: false, frequence: '' },
    cannabis: { consommation: false, depuis: '', quantiteInfDix: false, frequence: '' },
    droguesDures: { consommation: false, depuis: '', frequence: '' },
    commentairesGeneraux: ''
  }
};

interface EntretienFormProps {
  patient: Patient;
  onClose?: () => void;
}


interface Section {
  id: string;
  title: string;
  color: string;
  width: number;
  height: number;
  zIndex: number;
}

export const EntretienForm = ({ patient, onClose }: EntretienFormProps) => {
  const [sections, setSections] = useState<Section[]>([
    { id: 'sante', title: 'SANTÉ AU TRAVAIL', color: 'bg-amber-50', width: 750, height: 400, zIndex: 1 },
    { id: 'examen', title: 'EXAMEN CLINIQUE', color: 'bg-purple-50', width: 750, height: 400, zIndex: 1 },
    { id: 'imaa', title: 'IMAA', color: 'bg-green-50', width: 750, height: 400, zIndex: 1 },
    { id: 'conclusion', title: 'CONCLUSION', color: 'bg-pink-50', width: 750, height: 400, zIndex: 1 }
  ]);

  const [maxZIndex, setMaxZIndex] = useState(1);
  const [entretienData, setEntretienData] = useState<EntretienData>({
    numeroEntretien: 1,
    status: 'brouillon',
    santeTravail: {
      vecuTravail: initialVecuTravailData,
      modeVie: initialModeVieData
    },
    examenClinique: {},
    imaa: {},
    conclusion: {}
  });

  const bringToFront = (id: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, zIndex: newZIndex } : section
      )
    );
  };

  const handleResize = (id: string) => (e: any, { size }: { size: { width: number; height: number } }) => {
    bringToFront(id);
    setSections(prev =>
      prev.map(section =>
        section.id === id 
          ? { ...section, width: size.width, height: size.height }
          : section
      )
    );
  };

  const resetSizes = () => {
    setSections(prev =>
      prev.map(section => ({ ...section, width: 750, height: 400, zIndex: 1 }))
    );
    setMaxZIndex(1);
  };



  const saveEntretien = async () => {
    try {
      // Structure des données à envoyer
      const entretienToSave = {
        patientId: patient.id,
        numeroEntretien: entretienData.numeroEntretien,
        status: "brouillon",
        donneesEntretien: {
          santeTravail: entretienData.santeTravail,
          examenClinique: entretienData.examenClinique || {},
          imaa: entretienData.imaa || {},
          conclusion: entretienData.conclusion || {}
        }
      };
  
      // Log pour debug
      console.log("Données envoyées:", entretienToSave);
  
      // Envoi de la requête
      const response = await fetch('/api/entretiens', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entretienToSave)
      });
  
      // Log de la réponse brute
      const responseText = await response.text();
      console.log("Réponse brute:", responseText);
  
      // Si la réponse est vide, on lance une erreur
      if (!responseText) {
        throw new Error('Réponse vide du serveur');
      }
  
      // Sinon on parse la réponse
      const responseData = JSON.parse(responseText);
  
      if (!response.ok) {
        throw new Error(responseData.error || `Erreur HTTP: ${response.status}`);
      }
  
      toast.success('Entretien sauvegardé avec succès');
      console.log('Entretien sauvegardé:', responseData);
  
      if (onClose) {
        onClose();
      }
  
    } catch (error: any) {
      console.error('Erreur complète:', error);
      const errorMessage = error.message || 'Erreur inconnue lors de la sauvegarde';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

const handleSanteTravailChange = (newData: any) => {
  setEntretienData(prev => ({
    ...prev,
    santeTravail: newData
  }));
};


  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'sante':
        return (
          <SanteTravail 
            data={entretienData.santeTravail}
            onChange={handleSanteTravailChange}
          />
        );
      case 'examen':
        return <div className="text-gray-500">Section Examen Clinique en cours de développement...</div>;
      case 'imaa':
        return <div className="text-gray-500">Section IMAA en cours de développement...</div>;
      case 'conclusion':
        return <div className="text-gray-500">Section Conclusion en cours de développement...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* En-tête avec info patient et boutons */}
      <div className="max-w-[98%] mx-auto bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-blue-900">
              Nouvel entretien - {patient.civilites} {patient.nom} {patient.prenom}
            </h2>
            <div className="mt-2 text-gray-600">
              {patient.age} ans • {patient.poste} • {patient.departement}
            </div>
            <div className="mt-1 text-gray-600">
              Ancienneté : {patient.anciennete} • Horaire : {patient.horaire}
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button
              onClick={resetSizes}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                       transition-colors duration-200 shadow hover:shadow-md"
            >
              <span className="whitespace-nowrap">Réinitialiser</span>
            </button>
            
            <button 
              onClick={saveEntretien}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors duration-200 shadow hover:shadow-md"
            >
              <span className="whitespace-nowrap">Sauvegarder</span>
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 
                         flex items-center gap-2 rounded-lg hover:bg-gray-100
                         transition-colors duration-200"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="whitespace-nowrap">Retour au dossier</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full w-0 transition-all duration-500"></div>
        </div>
      </div>

      {/* Sections redimensionnables */}
      <div className="grid grid-cols-2 gap-4 max-w-[98%] mx-auto">
        {sections.map((section) => (
          <ResizableBox
            key={section.id}
            width={section.width}
            height={section.height}
            minConstraints={[500, 300]}
            maxConstraints={[1200, 800]}
            onResizeStop={handleResize(section.id)}
            resizeHandles={['se']}
            className={`relative ${section.color} rounded-xl shadow-lg transition-shadow duration-200
                      ${section.zIndex === maxZIndex ? 'shadow-xl' : 'hover:shadow-xl'}`}
            style={{ 
              zIndex: section.zIndex,
              cursor: 'default'
            }}
            onClick={() => bringToFront(section.id)}
          >
            <div className="sticky top-0 bg-inherit px-6 py-4 border-b border-black/5 rounded-t-xl">
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </div>

            <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">
              {renderSectionContent(section.id)}
            </div>
          </ResizableBox>
        ))}
      </div>
    </div>
  );
};