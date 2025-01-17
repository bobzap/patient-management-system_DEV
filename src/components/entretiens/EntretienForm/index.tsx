// src/components/entretiens/EntretienForm/index.tsx
'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { Patient } from '@/types';
import { TabBar } from './TabBar';
import { ResizableSection } from './ResizableSection';
import { SanteTravail } from '../sections/SanteAuTravail';
import { ExamenClinique } from '../sections/ExamenClinique';
import { Prevention } from '../sections/Conclusion/Prevention';
import { Limitation } from '../sections/Conclusion/Limitation';
import { Actions } from '../sections/Conclusion/Actions';
import { defaultExamenCliniqueData } from '../types/defaultData';
import type { VecuTravailData } from '../sections/SanteAuTravail/VecuTravail';
import type { ModeVieData } from '../sections/SanteAuTravail/ModeVie';

// Types pour le drag & drop
type DragResult = {
  destination?: {
    index: number;
  };
  source: {
    index: number;
  };
};

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

interface Section {
  id: string;
  title: string;
  color: string;
  width: number;
  height: number;
  zIndex: number;
  position: number;
  isMinimized: boolean;
}

interface EntretienFormProps {
  patient: Patient;
  onClose?: () => void;
}

// Après les interfaces et avant export const EntretienForm
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




export const EntretienForm = ({ patient, onClose }: EntretienFormProps) => {
  // États
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([
    { 
      id: 'sante', 
      title: 'SANTÉ AU TRAVAIL', 
      color: 'bg-amber-50', 
      width: 750, 
      height: 400, 
      zIndex: 1, 
      position: 0,
      isMinimized: false
    },
    { 
      id: 'examen', 
      title: 'EXAMEN CLINIQUE', 
      color: 'bg-purple-50', 
      width: 750, 
      height: 400, 
      zIndex: 1, 
      position: 1,
      isMinimized: false
    },
    { 
      id: 'imaa', 
      title: 'IMAA', 
      color: 'bg-green-50', 
      width: 750, 
      height: 400, 
      zIndex: 1, 
      position: 2,
      isMinimized: false
    },
    { 
      id: 'conclusion', 
      title: 'CONCLUSION', 
      color: 'bg-pink-50', 
      width: 750, 
      height: 400, 
      zIndex: 1, 
      position: 3,
      isMinimized: false
    }
  ]);

  const [entretienData, setEntretienData] = useState<EntretienData>({
    numeroEntretien: 1,
    status: 'brouillon',
    santeTravail: {
      vecuTravail: initialVecuTravailData,
      modeVie: initialModeVieData
    },
    examenClinique: defaultExamenCliniqueData,
    imaa: {},
    conclusion: {}
  });


  

  // Gestionnaires d'événements
  const handleMinimize = (id: string) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, isMinimized: true } : section
    ));
    if (focusedSection === id) {
      setFocusedSection(null);
    }
  };

  const handleMaximize = (id: string) => {
    setSections(prev => prev.map(section =>
      section.id === id ? { ...section, isMinimized: false } : section
    ));
  };


 

  const handleToggleFocus = (id: string) => {
    setFocusedSection(focusedSection === id ? null : id);
  };

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

  // Nouveau gestionnaire pour l'expansion
  const handleExpand = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
    // Si on expand une section, on sort du mode focus
    if (focusedSection) {
      setFocusedSection(null);
    }
  };



   // Modifier le reset pour inclure l'expansion
   const resetSizes = () => {
    setSections(prev =>
      prev.map(section => ({
        ...section,
        width: 750,
        height: 400,
        zIndex: 1,
        isMinimized: false
      }))
    );
    setMaxZIndex(1);
    setFocusedSection(null);
    setExpandedSection(null);
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


  const handleSanteTravailChange = (newData: { vecuTravail: VecuTravailData; modeVie: ModeVieData }) => {
    setEntretienData(prev => ({
      ...prev,
      santeTravail: newData
    }));
  };
  
  
  // Ajout du handler pour ExamenClinique
  const handleExamenCliniqueChange = (newData: any) => {
    setEntretienData(prev => ({
      ...prev,
      examenClinique: newData
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
          return (
            <ExamenClinique 
              data={entretienData.examenClinique}
              onChange={handleExamenCliniqueChange}
            />
          );

      case 'imaa':
        return <div className="text-gray-500">Section IMAA en cours de développement...</div>;


        case 'conclusion':
          return (
            <div className="space-y-6">
              <Prevention 
                data={entretienData.conclusion.prevention}
                onChange={(prevention) => {
                  setEntretienData(prev => ({
                    ...prev,
                    conclusion: {
                      ...prev.conclusion,
                      prevention
                    }
                  }));
                }}
              />
              <Limitation 
                data={entretienData.conclusion.limitation}
                onChange={(limitation) => {
                  setEntretienData(prev => ({
                    ...prev,
                    conclusion: {
                      ...prev.conclusion,
                      limitation
                    }
                  }));
                }}
              />
              <Actions 
                data={entretienData.conclusion.actions}
                onChange={(actions) => {
                  setEntretienData(prev => ({
                    ...prev,
                    conclusion: {
                      ...prev.conclusion,
                      actions
                    }
                  }));
                }}
              />
            </div>
          );

      default:
        return null;
    }

  };

  const handleDragEnd = (result: DragResult) => {
    if (!result.destination) return;
  
    const newSections = Array.from(sections);
    const [reorderedItem] = newSections.splice(result.source.index, 1);
    newSections.splice(result.destination.index, 0, reorderedItem);
  
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      position: index
    }));
  
    setSections(updatedSections);
  };

 


  return (
    <div className="p-6">
      {/* En-tête */}
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
      </div>

      {/* TabBar */}
      <div className="max-w-[98%] mx-auto mb-4">
        <TabBar 
          sections={sections}
          onMaximize={handleMaximize}
        />
      </div>

      {/* Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`grid ${
                focusedSection ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-2'
              } gap-4 max-w-[98%] mx-auto`}
            >
              {sections
                .filter(section => !section.isMinimized)
                .filter(section => !focusedSection || section.id === focusedSection)
                .sort((a, b) => a.position - b.position)
                .map((section, index) => (
                  <Draggable 
                    key={section.id} 
                    draggableId={section.id} 
                    index={index}
                    isDragDisabled={!!focusedSection}
                  >
                    {(provided, snapshot) => (
                      <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      draggableProps={{
                        ...provided.draggableProps,
                        // Le drag handle sera uniquement sur l'en-tête
                        handle: `.drag-handle-${section.id}`
                      }}
                      className={`transition-all duration-200 ${
                        snapshot.isDragging ? 'opacity-70' : ''
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        // Empêcher le drag & drop sur la poignée de redimensionnement
                        pointerEvents: 'auto'
                      }}
                    >
                           <ResizableSection
    {...section}
    isExpanded={expandedSection === section.id}
    isFocused={focusedSection === section.id}
    onMinimize={handleMinimize}
    onMaximize={handleMaximize}
    onToggleFocus={handleToggleFocus}
    onExpand={handleExpand}
    onResize={(id, size) => handleResize(id)({ target: null }, { size })}
    onBringToFront={bringToFront}
  >
    {renderSectionContent(section.id)}
  </ResizableSection>
  
</div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Bouton quitter le mode focus */}
      {focusedSection && (
        <button
          onClick={() => setFocusedSection(null)}
          className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white 
                    rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          Quitter le mode focus
        </button>
      )}
    </div>
  );
};